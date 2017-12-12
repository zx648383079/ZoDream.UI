var SliderItem = /** @class */ (function () {
    function SliderItem(element, options) {
        this.element = element;
        this.options = options;
        this.height = 0;
        this._boxHeight = 0;
        this.minHeight = 0;
        this._top = 0;
        this._time = 0;
        this.status = true;
        this.maxHeight = 0;
        this._box = this.element.parent();
        this.status = this.options.auto;
        this._init();
    }
    SliderItem.prototype._init = function () {
        this._setTime();
        this.refresh();
        var instance = this;
        this.element.mouseenter(function () {
            instance.stop();
        }).mouseleave(function () {
            instance.play();
        });
    };
    SliderItem.prototype.refresh = function () {
        var li = this.element.find(this.options.itemTag);
        if (li.length < 1) {
            return;
        }
        this._boxHeight = this._box.height();
        this.height = this.element.height();
        this.minHeight = li.outerHeight();
        this._top = 0;
        var count = Math.ceil(this._boxHeight / this.height);
        this.maxHeight = count * this.height;
        var html = this.element.children();
        count *= 2;
        for (; count > 1; count--) {
            this.element.append(html.clone(false));
        }
    };
    SliderItem.prototype.run = function () {
        if (this._animation) {
            this._animation();
        }
        if (!this.status) {
            return;
        }
        this._time--;
        if (this._time <= 0) {
            this._setTime();
            this.next();
        }
    };
    /**
     * 设置移动距离和循环距离
     * @param min
     * @param max
     */
    SliderItem.prototype.setMinAndMax = function (min, max) {
        this.minHeight = min;
        if (max) {
            this.maxHeight = max;
        }
        return this;
    };
    SliderItem.prototype.play = function () {
        if (this.status) {
            return;
        }
        this.status = true;
        if (this.options.refresh) {
            this.refresh();
        }
    };
    SliderItem.prototype.stop = function () {
        this.status = false;
    };
    SliderItem.prototype._setTime = function () {
        this._time = (this.options.spaceTime + this.options.animationTime) / 16;
    };
    /**
     * 下一个
     */
    SliderItem.prototype.next = function () {
        var instance = this;
        this._goAndCallback(this._top + this.minHeight, function () {
            if (instance._top >= instance.maxHeight) {
                instance._top = 0;
                instance.element.css({ "margin-top": "0px" });
            }
        });
    };
    /**
     * 移动动画及回调
     * @param left
     * @param callback
     */
    SliderItem.prototype._goAndCallback = function (end, callback) {
        /*this.element.animate(
            {"margin-top": - this._top + "px"},
            this.options.animationTime,
            this.options.animationMode,
            callback
        );*/
        var instance = this;
        var count = this.options.animationTime / 16;
        var min = (end - this._top) / count;
        this._animation = function () {
            count--;
            this._top += min;
            if (count <= 0) {
                this._top = end;
                instance._animation = undefined;
                callback();
            }
            instance.element.css({ "margin-top": -this._top + "px" });
        };
    };
    return SliderItem;
}());
var BoxSlider = /** @class */ (function () {
    function BoxSlider(element, options) {
        this.element = element;
        this._data = [];
        this._timer = 0;
        this.options = $.extend({}, new BoxSliderDefaultOptions(), options);
        this._init();
    }
    BoxSlider.prototype._timeCallback = function () {
        this._data.forEach(function (item) {
            item.run();
        });
    };
    BoxSlider.prototype._init = function () {
        if (this.element.length < 1) {
            console.log('0 SliderItem');
            return;
        }
        var instance = this;
        this.element.each(function (i, item) {
            instance._data.push(new SliderItem($(item), instance.options));
        });
        this._startTimer();
    };
    BoxSlider.prototype._startTimer = function () {
        if (this._timer > 0) {
            return;
        }
        this._runTimer();
    };
    BoxSlider.prototype._runTimer = function () {
        var instance = this;
        this._timer = requestAnimationFrame(function () {
            instance._timeCallback();
            instance._runTimer();
        });
    };
    BoxSlider.prototype._cancelTimer = function () {
        if (this._timer > 0) {
            cancelAnimationFrame(this._timer);
        }
        this._timer = 0;
    };
    /**
     * 倒序循环
     * @param callback 返回false 结束循环，返回 true 删除
     * @param i 初始值
     */
    BoxSlider.prototype.map = function (callback, i) {
        var _this = this;
        if (i === void 0) { i = this._data.length - 1; }
        if (typeof i != 'number') {
            i.forEach(function (j) {
                if (j < 0 || j >= _this._data.length) {
                    return;
                }
                callback(_this._data[j], j);
            });
            return;
        }
        if (i >= this._data.length) {
            i = this._data.length - 1;
        }
        for (; i >= 0; i--) {
            var item = this._data[i];
            var result = callback(item, i);
            if (result == true) {
                this._data.splice(i, 1);
            }
            if (result == false) {
                return;
            }
        }
    };
    BoxSlider.prototype.play = function () {
        var _this = this;
        var index = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            index[_i] = arguments[_i];
        }
        this._startTimer();
        if (index.length == 0) {
            this.map(function (item) {
                item.play();
            });
            return;
        }
        var instance = this;
        index.forEach(function (i) {
            if (i < 0 || i >= _this._data.length) {
                return;
            }
            _this._data[i].play();
        });
    };
    BoxSlider.prototype.stop = function () {
        var _this = this;
        var index = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            index[_i] = arguments[_i];
        }
        if (index.length == 0) {
            this.map(function (item) {
                item.stop();
            });
            this._cancelTimer();
            return;
        }
        var instance = this;
        index.forEach(function (i) {
            if (i < 0 || i >= _this._data.length) {
                return;
            }
            _this._data[i].stop();
        });
    };
    return BoxSlider;
}());
var BoxSliderDefaultOptions = /** @class */ (function () {
    function BoxSliderDefaultOptions() {
        this.spaceTime = 3000;
        this.animationTime = 1000;
        this.animationMode = "swing";
        this.auto = true; // 自动播放
        this.itemTag = 'li';
        this.refresh = false; //是否需要时时刷新元素
    }
    return BoxSliderDefaultOptions;
}());
;
(function ($) {
    $.fn.boxSlider = function (options) {
        return new BoxSlider(this, options);
    };
})(jQuery);
