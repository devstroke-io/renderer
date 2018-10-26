import * as url from 'url';
import {UrlWithStringQuery} from 'url';
import {Browser, Page, Response} from "puppeteer";

export interface Result {
  status: number;
  content: string;
}

export class Renderer {
  private readonly browser: Browser;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  /**
   * Injects a <base> tag which allows other resources to load. This
   * has no effect on serialised output, but allows it to verify render
   * quality.
   */
  private static injectBaseHref(origin: string): void {
    const base = document.createElement('base');
    base.setAttribute('href', origin);

    const bases = document.head.querySelectorAll('base');
    if (!bases.length) {
      // Only inject <base> if it doesn't already exist.
      document.head.insertAdjacentElement('afterbegin', base);
      return;
    }
    // Patch existing <base> if it is relative.
    const existingBase = bases[0].getAttribute('href') || '';
    if (existingBase.startsWith('/')) {
      bases[0].setAttribute('href', origin + existingBase);
    }
  }

  /**
   * Executed on the page after the page has loaded. Strips script and
   * import tags to prevent further loading of resources.
   */
  private static stripPage(): void {
    // Strip only script tags that contain JavaScript (either no type attribute or one that contains "javascript")
    const elements = document.querySelectorAll(
      'script:not([type]), script[type*="javascript"], link[rel=import]'
    );
    for (const e of Array.from(elements)) {
      e.remove();
    }
  }

  async init(requestUrl: string): Promise<Result> {
    const page: Page = await this.browser.newPage();
    await page.setViewport({width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
    await page.evaluateOnNewDocument('customElements.forcePolyfill = true');
    await page.evaluateOnNewDocument('ShadyDOM = {force: true}');
    await page.evaluateOnNewDocument('ShadyCSS = {shimcssproperties: true}');

    let response: Response = null;
    page.addListener('response', (r) => {
      if (!response) {
        response = r;
      }
    });
    try {
      // Navigate to page. Wait until there are no outstanding network requests.
      response = await page.goto(requestUrl, {
        timeout: 10000, waitUntil: [
          'load',
          'domcontentloaded',
          'networkidle0'
        ]
      });
    } catch (e) {
      console.error(e);
    }

    if (!response) {
      console.error('response does not exist');
      // This should only occur when the page is about:blank. See
      // https://github.com/GoogleChrome/puppeteer/blob/v1.5.0/docs/api.md#pagegotourl-options.
      return {status: 400, content: ''};
    }

    // Disable access to compute metadata. See
    // https://cloud.google.com/compute/docs/storing-retrieving-metadata.
    if (response.headers()['metadata-flavor'] === 'Google') {
      return {status: 403, content: ''};
    }

    let statusCode = response.status();
    // On a repeat visit to the same origin, browser cache is enabled, so we may
    // encounter a 304 Not Modified. Instead we'll treat this as a 200 OK.
    if (statusCode === 304) {
      statusCode = 200;
    }

    // Remove script & import tags.
    await page.evaluate(Renderer.stripPage);
    // Inject <base> tag with the origin of the request (ie. no path).
    const parsedUrl: UrlWithStringQuery = url.parse(requestUrl);
    await page.evaluate(Renderer.injectBaseHref, `${parsedUrl.protocol}//${parsedUrl.host}`);

    const result: string = await page.evaluate(() => {
      return (new XMLSerializer().serializeToString(document.doctype) + document.firstElementChild.outerHTML)
    });
    await page.close();

    return {
      status: statusCode,
      content: result
    };
  }
}
