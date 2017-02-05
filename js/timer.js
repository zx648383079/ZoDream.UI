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
var Time = (function () {
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
var Timer = (function () {
    function Timer(callback, space, time) {
        if (space === void 0) { space = 16; }
        if (time === void 0) { time = 0; }
        this.times = [];
        this.isAuto = true;
        this.add(callback, space, time);
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
