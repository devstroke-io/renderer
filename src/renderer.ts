import * as url from 'url';
import {UrlWithStringQuery} from 'url';
import {Browser, Page, Response} from "puppeteer";

export interface Result {
  status: number;
  content: string;
}


/**
 * Injects a <base> tag which allows other resources to load. This
 * has no effect on serialised output, but allows it to verify render
 * quality.
 */
const injectBaseHref = (origin: string): void => {
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
};

/**
 * Executed on the page after the page has loaded. Strips script and
 * import tags to prevent further loading of resources.
 */
const stripPage = (): void => {
  // Strip only script tags that contain JavaScript (either no type attribute or one that contains "javascript")
  const elements = document.querySelectorAll(
    'script:not([type]), script[type*="javascript"], link[rel=import]'
  );
  for (const e of Array.from(elements)) {
    e.remove();
  }
};

export class Renderer {
  private readonly browser: Browser;
  private page: Page;
  private url: string;
  private response: Response;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  async init(requestUrl: string): Promise<Result> {
    this.url = requestUrl;
    this.response = null;
    await this.preparePage();
    await this.gotoUrl();

    if (!this.response) {
      console.error('response does not exist');
      return {status: 400, content: ''};
    }

    if (this.response.headers()['metadata-flavor'] === 'Google') {
      return {status: 403, content: ''};
    }

    await this.cleanPage();
    const content: string = await this.getContent();
    await this.page.close();

    return {
      status: this.response.status() === 304 ? 200 : this.response.status(),
      content
    };
  }

  private async getContent(): Promise<string> {
    return await this.page.evaluate(() => {
      return (new XMLSerializer().serializeToString(document.doctype) + document.firstElementChild.outerHTML)
    });
  }

  private async preparePage(): Promise<void> {
    this.page = await this.browser.newPage();
    await this.page.setViewport({width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2});
    await this.page.evaluateOnNewDocument('customElements.forcePolyfill = true');
    await this.page.evaluateOnNewDocument('ShadyDOM = {force: true}');
    await this.page.evaluateOnNewDocument('ShadyCSS = {shimcssproperties: true}');
    this.page.addListener('response', (r) => {
      if (!this.response) {
        this.response = r;
      }
    });
  }

  private async cleanPage(): Promise<void> {
    // Remove script & import tags.
    await this.page.evaluate(stripPage);
    // Inject <base> tag with the origin of the request (ie. no path).
    const parsedUrl: UrlWithStringQuery = url.parse(this.url);
    await this.page.evaluate(injectBaseHref, `${parsedUrl.protocol}//${parsedUrl.host}`);
  }

  private async gotoUrl(): Promise<void> {
    try {
      // Navigate to page. Wait until there are no outstanding network requests.
      this.response = await this.page.goto(this.url, {
        timeout: 10000, waitUntil: [
          'load',
          'domcontentloaded',
          'networkidle0'
        ]
      });
    } catch (e) {
      console.error(e);
      this.response = null;
    }
  }
}
