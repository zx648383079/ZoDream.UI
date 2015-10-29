var Zodream;
(function (Zodream) {
    var App = (function () {
        function App() {
        }
        App.main = function (arg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
                new RequestAnimationNextFrame();
            }
            return new Program(typeof arg === "string" ? document.getElementById(arg) : arg);
        };
        return App;
    })();
    Zodream.App = App;
    var Program = (function () {
        function Program(arg) {
            this._carrier = arg;
            this._update();
        }
        Program.prototype._createContainer = function () {
            this._container = document.createElement("div");
        };
        Program.prototype.addChildren = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            (_a = this.addChild).call.apply(_a, [this].concat(args));
            var _a;
        };
        Program.prototype.addChild = function (arg) {
            var child = document.createElement("div");
            child.innerHTML = arg;
            child.style.left = window.innerWidth + "px";
            child.style.top = this._carrier.children.length * 40 + "px";
            this._carrier.appendChild(child);
        };
        Program.prototype._update = function () {
            window.requestAnimationFrame(this._update.bind(this));
            for (var i = 0; i < this._carrier.children.length; i++) {
                var child = this._carrier.children[i];
                if (Animation.left(child) + this._getWidth(child) < 0) {
                    //this._container.appendChild(child);
                    this._carrier.removeChild(child);
                }
            }
        };
        Program.prototype._getWidth = function (arg) {
            return parseInt(window.getComputedStyle(arg).width, 10);
        };
        return Program;
    })();
    Zodream.Program = Program;
    var Animation = (function () {
        function Animation() {
        }
        Animation.left = function (arg, distance) {
            if (distance === void 0) { distance = 1; }
            var x = parseInt(arg.style.left, 10) - distance;
            arg.style.left = x + "px";
            return x;
        };
        Animation.right = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            args.forEach(function (arg) {
                arg.style.left = (parseInt(arg.style.left, 10) + 1) + "px";
            });
        };
        Animation.top = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            args.forEach(function (arg) {
                arg.style.top = (parseInt(arg.style.top, 10) - 1) + "px";
            });
        };
        Animation.bottom = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            args.forEach(function (arg) {
                arg.style.top = (parseInt(arg.style.top, 10) + 1) + "px";
            });
        };
        Animation._getNumber = function (arg) {
            if (typeof arg === "string") {
                return parseInt(arg, 10);
            }
            return arg;
        };
        return Animation;
    })();
    Zodream.Animation = Animation;
    var RequestAnimationNextFrame = (function () {
        function RequestAnimationNextFrame() {
            this._lastTime = 0;
            this._prefixes = 'webkit moz ms o'.split(' ');
            this._requestAnimationFrame = window.requestAnimationFrame;
            this._cancelAnimationFrame = window.cancelAnimationFrame;
            for (var i = 0, len = this._prefixes.length; i < len; i++) {
                if (this._requestAnimationFrame && this._cancelAnimationFrame) {
                    break;
                }
                this._requestAnimationFrame = this._requestAnimationFrame ||
                    window[this._prefixes[i] + 'RequestAnimationFrame'];
                this._cancelAnimationFrame = this._cancelAnimationFrame ||
                    window[this._prefixes[i] + 'CancelAnimationFrame'] ||
                    window[this._prefixes[i] + 'CancelRequestAnimationFrame'];
            }
            if (!this._requestAnimationFrame || !this._cancelAnimationFrame) {
                this._requestAnimationFrame = this._setTimeOut;
                this._cancelAnimationFrame = this._clearTimeOut;
            }
            window.requestAnimationFrame = this._requestAnimationFrame;
            window.cancelAnimationFrame = this._cancelAnimationFrame;
        }
        RequestAnimationNextFrame.prototype._setTimeOut = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - this._lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            this._lastTime = currTime + timeToCall;
            return id;
        };
        RequestAnimationNextFrame.prototype._clearTimeOut = function (handle) {
            window.clearTimeout(handle);
        };
        return RequestAnimationNextFrame;
    })();
    Zodream.RequestAnimationNextFrame = RequestAnimationNextFrame;
    var Configs = (function () {
        function Configs() {
        }
        return Configs;
    })();
    Zodream.Configs = Configs;
})(Zodream || (Zodream = {}));
//# sourceMappingURL=danmu.js.map