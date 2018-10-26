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
var puppeteer = require("puppeteer-core");
var Koa = require("koa");
var route = require("koa-route");
var renderer_1 = require("./renderer");
var DevstrokeRenderer = /** @class */ (function () {
    function DevstrokeRenderer(port) {
        this.app = new Koa();
        this.renderer = null;
        this.port = port;
    }
    DevstrokeRenderer.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var browser;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, puppeteer.launch({
                            executablePath: '/usr/bin/chromium-browser',
                            args: ['--disable-dev-shm-usage', '--no-sandbox']
                            // "--headless", "--disable-gpu", "--disable-software-rasterizer", "--disable-dev-shm-usage", ""
                        })];
                    case 1:
                        browser = _a.sent();
                        this.renderer = new renderer_1.Renderer(browser);
                        this.app.use(route.get('/render/:url(.*)', this.handleRenderRequest.bind(this)));
                        return [2 /*return*/, this.app.listen(this.port, function () {
                                console.log("Listening on port " + _this.port);
                            })];
                }
            });
        });
    };
    DevstrokeRenderer.prototype.handleRenderRequest = function (ctx, url) {
        return __awaiter(this, void 0, void 0, function () {
            var serialized;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.renderer) {
                            throw (new Error('No renderer initalized yet.'));
                        }
                        return [4 /*yield*/, this.renderer.init(url)];
                    case 1:
                        serialized = _a.sent();
                        // Mark the response as coming from Rendertron.
                        ctx.set('x-renderer', 'devstroke_render');
                        ctx.status = serialized.status;
                        ctx.body = serialized.content;
                        return [2 /*return*/];
                }
            });
        });
    };
    return DevstrokeRenderer;
}());
var app = new DevstrokeRenderer(3000);
app.initialize();
