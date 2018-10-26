"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var url = require("url");
var Renderer = /** @class */ (function () {
    function Renderer(browser) {
        this.browser = browser;
    }
    Renderer.prototype.init = function (requestUrl) {
        return __awaiter(this, void 0, void 0, function () {
            // console.log(response);
            /**
             * Executed on the page after the page has loaded. Strips script and
             * import tags to prevent further loading of resources.
             */
            function stripPage() {
                // Strip only script tags that contain JavaScript (either no type attribute or one that contains "javascript")
                var elements = document.querySelectorAll('script:not([type]), script[type*="javascript"], link[rel=import]');
                for (var _i = 0, _a = Array.from(elements); _i < _a.length; _i++) {
                    var e = _a[_i];
                    e.remove();
                }
            }
            /**
             * Injects a <base> tag which allows other resources to load. This
             * has no effect on serialised output, but allows it to verify render
             * quality.
             */
            function injectBaseHref(origin) {
                var base = document.createElement('base');
                base.setAttribute('href', origin);
                var bases = document.head.querySelectorAll('base');
                if (bases.length) {
                    // Patch existing <base> if it is relative.
                    var existingBase = bases[0].getAttribute('href') || '';
                    if (existingBase.startsWith('/')) {
                        bases[0].setAttribute('href', origin + existingBase);
                    }
                }
                else {
                    // Only inject <base> if it doesn't already exist.
                    document.head.insertAdjacentElement('afterbegin', base);
                }
            }
            var page, response, session, res, e_1, statusCode, parsedUrl, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browser.newPage()];
                    case 1:
                        page = _a.sent();
                        return [4 /*yield*/, page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })];
                    case 2:
                        _a.sent();
                        // page.setViewport({width: 1000, height: 1000, isMobile: false});
                        return [4 /*yield*/, page.evaluateOnNewDocument('customElements.forcePolyfill = true')];
                    case 3:
                        // page.setViewport({width: 1000, height: 1000, isMobile: false});
                        _a.sent();
                        return [4 /*yield*/, page.evaluateOnNewDocument('ShadyDOM = {force: true}')];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, page.evaluateOnNewDocument('ShadyCSS = {shimcssproperties: true}')];
                    case 5:
                        _a.sent();
                        response = null;
                        page.addListener('response', function (r) {
                            console.log('Get event response');
                            if (!response) {
                                console.log('Use event response');
                                response = r;
                            }
                        });
                        return [4 /*yield*/, page.target().createCDPSession()];
                    case 6:
                        session = _a.sent();
                        return [4 /*yield*/, session.send('DOM.enable')];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, session.send('CSS.enable')];
                    case 8:
                        _a.sent();
                        session.on('CSS.fontsUpdated', function (event) {
                            console.log(event);
                            // event will be received when browser updates fonts on the page due to webfont loading.
                        });
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 13, , 14]);
                        return [4 /*yield*/, page.goto(requestUrl, { timeout: 10000, waitUntil: ['load', 'domcontentloaded', 'networkidle0'] })];
                    case 10:
                        // Navigate to page. Wait until there are no oustanding network requests.
                        response = _a.sent();
                        return [4 /*yield*/, page.screenshot({ path: './example.png' })];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, page.evaluateHandle('document.fonts.ready')];
                    case 12:
                        res = _a.sent();
                        // await page._client.send('DOM.enable')
                        // await page._client.send('CSS.enable')
                        // const doc = await page._client.send('DOM.getDocument')
                        // const node = await page._client.send('DOM.querySelector', {nodeId: doc.root.nodeId, selector: 'i'})
                        // const fonts = await page._client.send('CSS.getPlatformFontsForNode', {nodeId: node.nodeId})
                        // console.log('FONTS');
                        // console.log(fonts)
                        // console.log(res);
                        console.log('Get last response');
                        return [3 /*break*/, 14];
                    case 13:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [3 /*break*/, 14];
                    case 14:
                        if (!response) {
                            console.error('response does not exist');
                            // This should only occur when the page is about:blank. See
                            // https://github.com/GoogleChrome/puppeteer/blob/v1.5.0/docs/api.md#pagegotourl-options.
                            return [2 /*return*/, { status: 400, content: '' }];
                        }
                        // Disable access to compute metadata. See
                        // https://cloud.google.com/compute/docs/storing-retrieving-metadata.
                        if (response.headers()['metadata-flavor'] === 'Google') {
                            return [2 /*return*/, { status: 403, content: '' }];
                        }
                        statusCode = response.status();
                        // On a repeat visit to the same origin, browser cache is enabled, so we may
                        // encounter a 304 Not Modified. Instead we'll treat this as a 200 OK.
                        if (statusCode === 304) {
                            statusCode = 200;
                        }
                        // Remove script & import tags.
                        return [4 /*yield*/, page.evaluate(stripPage)];
                    case 15:
                        // Remove script & import tags.
                        _a.sent();
                        parsedUrl = url.parse(requestUrl);
                        return [4 /*yield*/, page.evaluate(injectBaseHref, parsedUrl.protocol + "//" + parsedUrl.host)];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, page.evaluate('document.firstElementChild.outerHTML')];
                    case 17:
                        result = _a.sent();
                        return [4 /*yield*/, page.close()];
                    case 18:
                        _a.sent();
                        return [2 /*return*/, { status: statusCode, content: '<!doctype html>' + result }];
                }
            });
        });
    };
    return Renderer;
}());
exports.Renderer = Renderer;
