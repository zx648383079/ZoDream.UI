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
            return new Program(typeof arg === "string" ? document.getElementById(arg) : arg);
        };
        return App;
    })();
    Zodream.App = App;
    var Program = (function () {
        function Program(arg) {
            this._carrier = arg;
            this._children = arg.children;
        }
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
            this._carrier.appendChild(child);
        };
        return Program;
    })();
    Zodream.Program = Program;
    var Configs = (function () {
        function Configs() {
        }
        return Configs;
    })();
    Zodream.Configs = Configs;
})(Zodream || (Zodream = {}));
//# sourceMappingURL=danmu.js.map