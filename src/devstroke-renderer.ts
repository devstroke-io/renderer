import * as puppeteer from 'puppeteer-core';
import * as Koa from 'koa';
import * as route from 'koa-route';
import {Renderer, Result} from './renderer';
import {Browser} from "puppeteer";
import {Context} from "koa";

class DevstrokeRenderer {
  private readonly app: Koa;
  private readonly port: number;
  private renderer: Renderer;

  constructor(port: number) {
    this.app = new Koa();
    this.renderer = null;
    this.port = port;
  }

  async initialize() {
    const browser: Browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: ['--disable-dev-shm-usage', '--no-sandbox']
      // "--headless", "--disable-gpu", "--disable-software-rasterizer", "--disable-dev-shm-usage", ""
    });
    this.renderer = new Renderer(browser);

    this.app.use(route.get('/render/:url(.*)', this.handleRenderRequest.bind(this)));

    return this.app.listen(this.port, () => {
      console.log(`Listening on port ${this.port}`);
    });
  }

  async handleRenderRequest(ctx: Context, url: string) {
    if (!this.renderer) {
      throw (new Error('No renderer initalized yet.'));
    }

    // if (this.restricted(url)) {
    //   ctx.status = 403;
    //   return;
    // }

    // const mobileVersion = 'mobile' in ctx.query ? true : false;

    const serialized: Result = await this.renderer.init(url);
    // Mark the response as coming from DevstrokeRenderer.
    ctx.set('x-renderer', 'devstroke-renderer');
    ctx.status = serialized.status;
    ctx.body = serialized.content;
  }
}

const app = new DevstrokeRenderer(3000);
app.initialize();
