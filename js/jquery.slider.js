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
var Point = (function () {
    function Point(index, x, width, height) {
        this.index = index;
        this.x = x;
        this.width = width;
        this.height = height;
    }
    Point.prototype.getLeft = function (width) {
        return this.x - (this.width - width) / 2;
    };
    return Point;
}());
var Slider = (function () {
    function Slider(element, options) {
        this.element = element;
        this._data = [];
        this._index = 0;
        this.options = $.extend({}, new SliderDefaultOptions(), options);
        var items = this.element.find(this.options.item);
        this._box = items.parent();
        this._init(items);
    }
    Slider.prototype._timeCallback = function () {
        this.next();
    };
    Slider.prototype._init = function (items) {
        var instance = this;
        var width = 0;
        items.each(function (i, item) {
            var ele = $(item);
            var w = ele.width();
            instance._data.push(new Point(i, -width, w, ele.height()));
            width += w;
        });
        for (var j = 0; j < 2; j++) {
            for (var i = 0, length_1 = items.length; i < length_1; i++) {
                this._box.append(items[i].cloneNode(true));
            }
        }
        for (var i = 0, length_2 = this._data.length; i < length_2; i++) {
            this._data[i].x -= width;
        }
        this._box.css({ width: width * 3 + "px" });
        this.resize();
        this.element.height(this._data[this._data.length - 1].height);
        this.element.find(this.options.previous).click(function () {
            instance.previous();
        });
        this.element.find(this.options.next).click(function () {
            instance.next();
        });
        $(window).resize(function () {
            instance.resize();
        });
        this._setTime();
        this._runTimer();
    };
    Slider.prototype._runTimer = function () {
        var instance = this;
        this._timer = requestAnimationFrame(function () {
            instance._time--;
            if (instance._time <= 0) {
                instance._timeCallback();
            }
            instance._runTimer();
        });
    };
    Slider.prototype._cancelTimer = function () {
        if (this._timer) {
            cancelAnimationFrame(this._timer);
        }
    };
    Slider.prototype._setTime = function () {
        this._time = (this.options.spaceTime + this.options.animationTime) / 16;
    };
    Slider.prototype.resize = function () {
        var maxWidth = this.element.width();
        this._box.css({ left: this._data[this._index].getLeft(maxWidth) + "px" });
    };
    Object.defineProperty(Slider.prototype, "index", {
        get: function () {
            return this._index;
        },
        set: function (index) {
            this.goto(index);
        },
        enumerable: true,
        configurable: true
    });
    Slider.prototype.next = function () {
        this.index++;
    };
    Slider.prototype.previous = function () {
        this.index--;
    };
    Slider.prototype._getPoint = function (index) {
        if (index < 0) {
            var last = this._data[this._data.length - 1];
            var point = new Point(index, this._data[0].x + last.width, last.width, last.height);
            return [point, last];
        }
        if (index >= this._data.length) {
            var first = this._data[0];
            var point = new Point(index, this._data[this._data.length - 1].x - first.width, first.width, first.height);
            return [point, first];
        }
        return [this._data[index], this._data[index]];
    };
    Slider.prototype.goto = function (index) {
        this._setTime();
        var points = this._getPoint(index);
        var width = this.element.width();
        this.element.height(points[0].height);
        var instance = this;
        this._goAndCallback(points[0].getLeft(width), function () {
            if (points[0].index != points[1].index) {
                instance._box.css({ left: points[1].getLeft(width) + 'px' });
            }
            instance._index = points[1].index;
        });
    };
    Slider.prototype._goAndCallback = function (left, callback) {
        this._box.animate({ left: left + "px" }, this.options.animationTime, this.options.animationMode, callback);
    };
    return Slider;
}());
var SliderDefaultOptions = (function () {
    function SliderDefaultOptions() {
        this.item = 'li';
        this.spaceTime = 3000;
        this.animationTime = 1000;
        this.animationMode = "swing";
        this.previous = ".slider-previous";
        this.next = ".slider-next";
    }
    return SliderDefaultOptions;
}());
;
(function ($) {
    $.fn.slider = function (options) {
        return new Slider(this, options);
    };
})(jQuery);
