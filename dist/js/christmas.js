var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var vendors = ['webkit', 'moz'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame =
        window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}
if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime_1 = 0;
    window.requestAnimationFrame = function (callback) {
        var currTime = new Date().getTime();
        //为了使setTimteout的尽可能的接近每秒60帧的效果
        var timeToCall = Math.max(0, 16 - (currTime - lastTime_1));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime_1 = currTime + timeToCall;
        return id;
    };
    window.cancelAnimationFrame = function (id) {
        window.clearTimeout(id);
    };
}
var Time = /** @class */ (function () {
    function Time(callback, space, time) {
        if (space === void 0) { space = 16; }
        if (time === void 0) { time = 0; }
        this.callback = callback;
        this.space = space;
        this.time = time;
        this._index = 0;
        this.isActive = true;
        this._time = 0;
    }
    Time.prototype.run = function () {
        if (!this.isActive) {
            return;
        }
        this._index += 16;
        if (this._index < this.space) {
            return;
        }
        this.callback();
        this._index = 0;
        this._time++;
        if (this.time > 0 && this._time >= this.time) {
            this.isActive = false;
            return;
        }
    };
    return Time;
}());
var Timer = /** @class */ (function () {
    function Timer(callback, space, time) {
        if (space === void 0) { space = 16; }
        if (time === void 0) { time = 0; }
        this.times = [];
        this.isAuto = true;
        if (callback) {
            this.add(callback, space, time);
        }
        if (this.isAuto) {
            this.start();
        }
    }
    Timer.prototype.add = function (callback, space, time) {
        if (space === void 0) { space = 16; }
        if (time === void 0) { time = 0; }
        this.times.push(new Time(callback, space, time));
        return this;
    };
    Timer.prototype.start = function () {
        this._loop();
    };
    Timer.prototype._loop = function () {
        this.stop();
        var instance = this;
        this._handle = window.requestAnimationFrame(function () {
            var isEnd = true;
            instance.times.forEach(function (time) {
                if (time.isActive) {
                    time.run();
                    isEnd = false;
                }
            });
            if (instance.isAuto) {
                instance.stop();
                return;
            }
            instance._loop();
        });
    };
    Timer.prototype.stop = function () {
        if (this._handle) {
            window.cancelAnimationFrame(this._handle);
        }
        this._handle = null;
    };
    return Timer;
}());
var Scene = /** @class */ (function () {
    function Scene() {
        this.fps = 60;
    }
    Scene.prototype.setFPS = function (fps) {
        this.fps = fps;
    };
    /**
     * init
     */
    Scene.prototype.init = function () {
    };
    Scene.prototype.update = function () {
    };
    /**
     * destory
     */
    Scene.prototype.destory = function () {
    };
    return Scene;
}());
var Sprite = /** @class */ (function () {
    function Sprite() {
    }
    return Sprite;
}());
var Stage = /** @class */ (function () {
    /**
     *
     */
    function Stage(element) {
        this.canvas = Storyboard.parse(element);
        this.canvas.fullScreen();
        this.init();
    }
    /**
     * init
     */
    Stage.prototype.init = function () {
    };
    /**
     * nevigate
     */
    Stage.prototype.nevigate = function (scene) {
        this.scene && this.scene.destory();
        this.canvas.clear();
        this.scene = scene;
        this.scene.stage = this;
        this.scene.init();
    };
    return Stage;
}());
var Storyboard = /** @class */ (function () {
    function Storyboard(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
    }
    Storyboard.prototype.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return this;
    };
    Storyboard.prototype.draw = function (ctx) {
        ctx.context.drawImage(this.canvas, 0, 0);
        return true;
    };
    /**
     * fullScreen
     */
    Storyboard.prototype.fullScreen = function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        return this;
    };
    Storyboard.create = function (width, height) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return new Storyboard(canvas);
    };
    Storyboard.parse = function (element) {
        return new Storyboard(typeof element == 'string' ? document.getElementById(element) : element);
    };
    return Storyboard;
}());
var MainScene = /** @class */ (function (_super) {
    __extends(MainScene, _super);
    function MainScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MainScene;
}(Scene));
var MainStage = /** @class */ (function (_super) {
    __extends(MainStage, _super);
    function MainStage(element) {
        return _super.call(this, element) || this;
    }
    /**
     * init
     */
    MainStage.prototype.init = function () {
        this.nevigate(new MainScene());
    };
    return MainStage;
}(Stage));
var SnowSprite = /** @class */ (function () {
    function SnowSprite() {
    }
    /**
     * draw
     */
    SnowSprite.prototype.draw = function (ctx) {
    };
    return SnowSprite;
}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcXVlc3RBbmltYXRpb25GcmFtZS50cyIsInRpbWVyLnRzIiwic2NlbmUudHMiLCJzcHJpdGUudHMiLCJzdGFnZS50cyIsInN0b3J5Ym9hcmQudHMiLCJ6bWFpbi1zY2VuZS50cyIsInptYWluLXN0b2dlLnRzIiwienNub3ctc3ByaXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFBLE9BQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLEtBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLHFCQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUE7SUFDQSxNQUFBLENBQUEscUJBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLHVCQUFBLENBQUEsQ0FBQTtJQUNBLE1BQUEsQ0FBQSxvQkFBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsc0JBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsNkJBQUEsQ0FBQSxDQUFBO0NBQ0E7QUFFQSxJQUFBLENBQUEsTUFBQSxDQUFBLHFCQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsb0JBQUEsRUFBQTtJQUNBLElBQUEsVUFBQSxHQUFBLENBQUEsQ0FBQTtJQUNBLE1BQUEsQ0FBQSxxQkFBQSxHQUFBLFVBQUEsUUFBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSwrQkFBQTtRQUNBLElBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsR0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxFQUFBLEdBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7UUFDQSxVQUFBLEdBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLE9BQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQSxDQUFBO0lBRUEsTUFBQSxDQUFBLG9CQUFBLEdBQUEsVUFBQSxFQUFBO1FBQ0EsTUFBQSxDQUFBLFlBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtJQUNBLENBQUEsQ0FBQTtDQUNBO0FDdkJBO0lBQ0EsY0FDQSxRQUFBLEVBQ0EsS0FBQSxFQUNBLElBQUE7UUFEQSxzQkFBQSxFQUFBLFVBQUE7UUFDQSxxQkFBQSxFQUFBLFFBQUE7UUFGQSxhQUFBLEdBQUEsUUFBQSxDQUFBO1FBQ0EsVUFBQSxHQUFBLEtBQUEsQ0FBQTtRQUNBLFNBQUEsR0FBQSxJQUFBLENBQUE7UUFLQSxXQUFBLEdBQUEsQ0FBQSxDQUFBO1FBRUEsYUFBQSxHQUFBLElBQUEsQ0FBQTtRQUVBLFVBQUEsR0FBQSxDQUFBLENBQUE7SUFOQSxDQUFBO0lBUUEsa0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBO1lBQ0EsT0FBQTtTQUNBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLElBQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQTtZQUNBLE9BQUE7U0FDQTtRQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtZQUNBLE9BQUE7U0FDQTtJQUNBLENBQUE7SUFDQSxXQUFBO0FBQUEsQ0EvQkEsQUErQkEsSUFBQTtBQUVBO0lBQ0EsZUFDQSxRQUFBLEVBQ0EsS0FBQSxFQUNBLElBQUE7UUFEQSxzQkFBQSxFQUFBLFVBQUE7UUFDQSxxQkFBQSxFQUFBLFFBQUE7UUFVQSxVQUFBLEdBQUEsRUFBQSxDQUFBO1FBRUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtRQVZBLElBQUEsUUFBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO1NBQ0E7UUFDQSxJQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7U0FDQTtJQUNBLENBQUE7SUFNQSxtQkFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBO1FBQUEsc0JBQUEsRUFBQSxVQUFBO1FBQUEscUJBQUEsRUFBQSxRQUFBO1FBQ0EsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsUUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsT0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEscUJBQUEsQ0FBQTtZQUNBLElBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQTtnQkFDQSxJQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUE7b0JBQ0EsSUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsR0FBQSxLQUFBLENBQUE7aUJBQ0E7WUFDQSxDQUFBLENBQUEsQ0FBQTtZQUVBLElBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQTtnQkFDQSxRQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7Z0JBQ0EsT0FBQTthQUNBO1lBQ0EsUUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBSUEsb0JBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTtZQUNBLE1BQUEsQ0FBQSxvQkFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtTQUNBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsWUFBQTtBQUFBLENBdkRBLEFBdURBLElBQUE7QUN4RkE7SUFBQTtRQUVBLFFBQUEsR0FBQSxFQUFBLENBQUE7SUEwQkEsQ0FBQTtJQXRCQSxzQkFBQSxHQUFBLFVBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0Esb0JBQUEsR0FBQTtJQUVBLENBQUE7SUFFQSxzQkFBQSxHQUFBO0lBRUEsQ0FBQTtJQUdBOztPQUVBO0lBQ0EsdUJBQUEsR0FBQTtJQUVBLENBQUE7SUFDQSxZQUFBO0FBQUEsQ0E1QkEsQUE0QkEsSUFBQTtBQzVCQTtJQUFBO0lBRUEsQ0FBQTtJQUFBLGFBQUE7QUFBQSxDQUZBLEFBRUEsSUFBQTtBQ0ZBO0lBQ0E7O09BRUE7SUFDQSxlQUNBLE9BQUE7UUFFQSxJQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQU1BOztPQUVBO0lBQ0Esb0JBQUEsR0FBQTtJQUVBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHdCQUFBLEdBQUEsVUFBQSxLQUFBO1FBQ0EsSUFBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxZQUFBO0FBQUEsQ0FqQ0EsQUFpQ0EsSUFBQTtBQ2pDQTtJQUVBLG9CQUNBLE1BQUE7UUFBQSxXQUFBLEdBQUEsTUFBQSxDQUFBO1FBRUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFnQkEsMEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLE9BQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQ0EsR0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxPQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQTtRQUNBLE9BQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlCQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsTUFBQTtRQUNBLElBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQSxhQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBO1FBQ0EsT0FBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQkFBQSxHQUFBLFVBQUEsT0FBQTtRQUNBLE9BQUEsSUFBQSxVQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxpQkFBQTtBQUFBLENBbkRBLEFBbURBLElBQUE7QUNuREE7SUFBQSw2QkFBQTtJQUFBOztJQUdBLENBQUE7SUFBQSxnQkFBQTtBQUFBLENBSEEsQUFHQSxDQUhBLEtBQUEsR0FHQTtBQ0hBO0lBQUEsNkJBQUE7SUFFQSxtQkFDQSxPQUFBO2VBRUEsa0JBQUEsT0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0Esd0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxTQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGdCQUFBO0FBQUEsQ0FkQSxBQWNBLENBZEEsS0FBQSxHQWNBO0FDZEE7SUFBQTtJQVNBLENBQUE7SUFOQTs7T0FFQTtJQUNBLHlCQUFBLEdBQUEsVUFBQSxHQUFBO0lBRUEsQ0FBQTtJQUNBLGlCQUFBO0FBQUEsQ0FUQSxBQVNBLElBQUEiLCJmaWxlIjoiY2hyaXN0bWFzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdmVuZG9yczogQXJyYXk8c3RyaW5nPiA9IFsnd2Via2l0JywgJ21veiddO1xyXG5mb3IobGV0IHggPSAwOyB4IDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcclxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9XHJcbiAgICAgICAgd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gfHwgd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xyXG59XHJcblxyXG5pZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSApIHtcclxuICAgIGxldCBsYXN0VGltZSA9IDA7XHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spOiBudW1iZXIge1xyXG4gICAgICBsZXQgY3VyclRpbWU6IG51bWJlciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAvL+S4uuS6huS9v3NldFRpbXRlb3V055qE5bC95Y+v6IO955qE5o6l6L+R5q+P56eSNjDluKfnmoTmlYjmnpxcclxuICAgICAgbGV0IHRpbWVUb0NhbGw6IG51bWJlciA9IE1hdGgubWF4KCAwLCAxNiAtICggY3VyclRpbWUgLSBsYXN0VGltZSApICk7IFxyXG4gICAgICBsZXQgaWQ6IG51bWJlciA9IHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcclxuICAgICAgICBjYWxsYmFjayggY3VyclRpbWUgKyB0aW1lVG9DYWxsICk7XHJcbiAgICAgIH0sIHRpbWVUb0NhbGwgKTtcclxuICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XHJcbiAgICAgIHJldHVybiBpZDtcclxuICAgIH07XHJcbiAgICBcclxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoaWQpO1xyXG4gICAgfTtcclxufSIsImNsYXNzIFRpbWUge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIGNhbGxiYWNrOiBGdW5jdGlvbixcclxuICAgICAgICBwdWJsaWMgc3BhY2U6IG51bWJlciA9IDE2LFxyXG4gICAgICAgIHB1YmxpYyB0aW1lOiBudW1iZXIgPSAwXHJcbiAgICApIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5kZXg6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHVibGljIGlzQWN0aXZlOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBwcml2YXRlIF90aW1lOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHB1YmxpYyBydW4oKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzQWN0aXZlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW5kZXggKz0gMTY7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luZGV4IDwgdGhpcy5zcGFjZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2soKTtcclxuICAgICAgICB0aGlzLl9pbmRleCA9IDA7XHJcbiAgICAgICAgdGhpcy5fdGltZSArKztcclxuICAgICAgICBpZiAodGhpcy50aW1lID4gMCAmJiB0aGlzLl90aW1lID49IHRoaXMudGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFRpbWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGNhbGxiYWNrPzogRnVuY3Rpb24sXHJcbiAgICAgICAgc3BhY2U6IG51bWJlciA9IDE2LFxyXG4gICAgICAgIHRpbWU6IG51bWJlciA9IDBcclxuICAgICkge1xyXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB0aGlzLmFkZChjYWxsYmFjaywgc3BhY2UsIHRpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pc0F1dG8pIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGltZXM6IEFycmF5PFRpbWU+ID0gW107XHJcblxyXG4gICAgcHVibGljIGlzQXV0bzogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgcHVibGljIGFkZChjYWxsYmFjazogRnVuY3Rpb24sIHNwYWNlOiBudW1iZXIgPSAxNiwgdGltZTogbnVtYmVyID0gMCkge1xyXG4gICAgICAgIHRoaXMudGltZXMucHVzaChuZXcgVGltZShjYWxsYmFjaywgc3BhY2UsIHRpbWUpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5fbG9vcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2xvb3AoKSB7XHJcbiAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLl9oYW5kbGUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgaXNFbmQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpbnN0YW5jZS50aW1lcy5mb3JFYWNoKHRpbWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpbWUuaXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lLnJ1bigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLmlzQXV0bykge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2Uuc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluc3RhbmNlLl9sb29wKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaGFuZGxlOiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIHN0b3AoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhbmRsZSkge1xyXG4gICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5faGFuZGxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faGFuZGxlID0gbnVsbDtcclxuICAgIH1cclxufSIsImNsYXNzIFNjZW5lIHtcclxuXHJcbiAgICBwcml2YXRlIGZwcyA9IDYwO1xyXG5cclxuICAgIHB1YmxpYyBzdGFnZTogU3RhZ2U7XHJcblxyXG4gICAgcHVibGljIHNldEZQUyhmcHM6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuZnBzID0gZnBzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaW5pdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdXBkYXRlKCkge1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXN0b3J5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkZXN0b3J5KCkge1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG59IiwiY2xhc3MgU3ByaXRlIHtcclxuICAgIFxyXG59IiwiY2xhc3MgU3RhZ2Uge1xyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBlbGVtZW50OiBIVE1MQ2FudmFzRWxlbWVudHxzdHJpbmdcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gU3Rvcnlib2FyZC5wYXJzZShlbGVtZW50KTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5mdWxsU2NyZWVuKCk7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNhbnZhczogU3Rvcnlib2FyZDtcclxuXHJcbiAgICBwdWJsaWMgc2NlbmU6IFNjZW5lO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogaW5pdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG5ldmlnYXRlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBuZXZpZ2F0ZShzY2VuZTogU2NlbmUpIHtcclxuICAgICAgICB0aGlzLnNjZW5lICYmIHRoaXMuc2NlbmUuZGVzdG9yeSgpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuc3RhZ2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuc2NlbmUuaW5pdCgpO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgU3Rvcnlib2FyZCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnRcclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICBwdWJsaWMgY2xlYXIoKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZHJhdyhjdHg6IFN0b3J5Ym9hcmQpOiBib29sZWFuIHtcclxuICAgICAgICBjdHguY29udGV4dC5kcmF3SW1hZ2UodGhpcy5jYW52YXMsIDAsIDApO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZnVsbFNjcmVlblxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZnVsbFNjcmVlbigpIHtcclxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IFN0b3J5Ym9hcmQge1xyXG4gICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTdG9yeWJvYXJkKGNhbnZhcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBwYXJzZShlbGVtZW50OiBIVE1MQ2FudmFzRWxlbWVudHxzdHJpbmcpOiBTdG9yeWJvYXJkIHtcclxuICAgICAgICByZXR1cm4gbmV3IFN0b3J5Ym9hcmQodHlwZW9mIGVsZW1lbnQgPT0gJ3N0cmluZycgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50KSBhcyBIVE1MQ2FudmFzRWxlbWVudCA6IGVsZW1lbnQpO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgTWFpblNjZW5lIGV4dGVuZHMgU2NlbmUge1xyXG5cclxuICAgIFxyXG59IiwiY2xhc3MgTWFpblN0YWdlIGV4dGVuZHMgU3RhZ2Uge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGVsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50fHN0cmluZ1xyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIoZWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpbml0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpbml0KCkge1xyXG4gICAgICAgIHRoaXMubmV2aWdhdGUobmV3IE1haW5TY2VuZSgpKTtcclxuICAgIH1cclxufSIsImNsYXNzIFNub3dTcHJpdGUge1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRyYXdcclxuICAgICAqL1xyXG4gICAgcHVibGljIGRyYXcoY3R4OiBTdG9yeWJvYXJkKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn0iXX0=
