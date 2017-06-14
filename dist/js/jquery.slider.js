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
/*!
 * jquery.slider - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
var Point = (function () {
    function Point(index, x, width, height) {
        this.index = index;
        this.width = width;
        this.height = height;
        this.elements = [];
        if (typeof x == 'number') {
            this.x = x;
            return;
        }
        this.elements.push(x);
        _a = this.getElementWidthAndHeight(), this.width = _a[0], this.height = _a[1];
        this.x = -this.width;
        var _a;
    }
    /**
     * 取元素的x
     * @param width
     */
    Point.prototype.getLeft = function (width) {
        return this.x - (this.width - width) / 2;
    };
    /**
     * 获取元素的宽和高
     */
    Point.prototype.getElementWidthAndHeight = function () {
        return [this.elements[0].width(), this.elements[0].height()];
    };
    /**
     * 应用当前的宽和高
     */
    Point.prototype.applyWidthAndHeight = function () {
        var instance = this;
        var _a = this.getElementWidthAndHeight(), width = _a[0], height = _a[1];
        if (height == this.height && this.width != width) {
            // 等比例缩放
            this.height = this.width * height / width;
        }
        $.each(this.elements, function (i, ele) {
            ele.width(instance.width);
            ele.height(instance.height);
        });
    };
    return Point;
}());
var SliderItem = (function (_super) {
    __extends(SliderItem, _super);
    function SliderItem(element, options) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.options = options;
        _this._data = [];
        _this._length = 0;
        _this._index = 0;
        if (_this.element.attr('data-slider')) {
            return _this;
        }
        var items = _this.element.find(_this.options.item);
        if (items.length < 2) {
            return _this;
        }
        _this._length = items.length;
        _this._box = items.parent();
        _this._init(items);
        _this.element.attr('data-slider', 1);
        return _this;
    }
    SliderItem.prototype._timeCallback = function () {
        if (this.options.auto) {
            this.next();
        }
    };
    SliderItem.prototype._init = function (items) {
        var instance = this;
        items.each(function (i, item) {
            var point = new Point(i, $(item));
            instance._data.push(point);
        });
        /**
         * 复制两次
         */
        for (var j = 0; j < 2; j++) {
            for (var i = 0, length_1 = items.length; i < length_1; i++) {
                var newLi = $(items[i].cloneNode(true));
                this._data[i].elements.push(newLi);
                this._box.append(newLi);
            }
        }
        this.resize();
        // 输出可点击的列表
        if (instance.options.hasPoint) {
            this._addListPoint();
        }
        this._bindEvent();
        this._setTime();
    };
    SliderItem.prototype._bindEvent = function () {
        var instance = this;
        this.element.find(this.options.previous).click(function () {
            instance.previous();
        });
        this.element.find(this.options.next).click(function () {
            instance.next();
        });
        $(window).resize(function () {
            instance.resize();
        });
        if (!$.fn.swipe) {
            return;
        }
        this.element.swipe({
            swipeLeft: function () {
                instance.next();
            },
            swipeRight: function () {
                instance.previous();
            }
        });
    };
    SliderItem.prototype._getWidth = function (reltive) {
        if (reltive > 1) {
            return reltive;
        }
        return this.element.width() * reltive;
    };
    SliderItem.prototype._setTime = function () {
        this._time = (this.options.spaceTime + this.options.animationTime) / 16;
    };
    /**
  * 添加跳转点
  * @param count
  */
    SliderItem.prototype._addListPoint = function () {
        var html = '';
        var count = this._length;
        for (; count > 0; count--) {
            html += '<li></i>';
        }
        this.element.append('<ul class="slider-point">' + html + '</ul>');
        var instance = this;
        this.element.on("click", ".slider-point li", function () {
            instance.index = $(this).index() + 1;
        });
    };
    /**
     * 浏览器尺寸变化
     */
    SliderItem.prototype.resize = function () {
        var instance = this;
        var maxWidth = this.element.width();
        var width = 0;
        $.each(this._data, function (i, point) {
            if (instance.options.width > 0) {
                point.width = instance._getWidth(instance.options.width);
            }
            if (instance.options.height > 0) {
                point.height = instance._getWidth(instance.options.height);
            }
            point.applyWidthAndHeight();
            width += point.width;
            point.x = -width;
        });
        $.each(this._data, function (i, point) {
            point.x -= width;
        });
        this._box.css({ left: this._data[this._index].getLeft(maxWidth) + "px" });
        this._box.width(width * 3);
        this.index = this._index;
    };
    Object.defineProperty(SliderItem.prototype, "index", {
        get: function () {
            return this._index;
        },
        set: function (index) {
            this.goto(index);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 下一个
     */
    SliderItem.prototype.next = function () {
        this.index++;
    };
    /**
     * 上一个
     */
    SliderItem.prototype.previous = function () {
        this.index--;
    };
    /**
     * 获取起始点和终点
     * @param index
     */
    SliderItem.prototype._getPoint = function (index) {
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
    /**
     * 跳转
     * @param index
     */
    SliderItem.prototype.goto = function (index) {
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
        this.trigger.apply(this, ['change'].concat(points));
        if (this.options.hasPoint) {
            this.element.find(".slider-point li").eq(index - 1).addClass("active").siblings().removeClass("active");
        }
    };
    /**
     * 移动动画及回调
     * @param left
     * @param callback
     */
    SliderItem.prototype._goAndCallback = function (left, callback) {
        this._box.animate({ left: left + "px" }, this.options.animationTime, this.options.animationMode, callback);
    };
    SliderItem.prototype.run = function () {
        if (this._length < 1) {
            return;
        }
        this._time--;
        if (this._time <= 0) {
            this._timeCallback();
        }
    };
    return SliderItem;
}(Eve));
var Slider = (function () {
    function Slider(element, options) {
        var _this = this;
        this.element = element;
        this._data = [];
        this.options = $.extend({}, new SliderDefaultOptions(), options);
        if (this.element.length == 0) {
            return;
        }
        this.element.each(function (i, item) {
            _this.addItem($(item));
        });
        this._runTimer();
    }
    Slider.prototype.addItem = function (item) {
        if (item instanceof SliderItem) {
            this._data.push(item);
            return;
        }
        this._data.push(new SliderItem(item, this.options));
    };
    /**
     * 倒序循环
     * @param callback 返回false 结束循环，返回 true 删除
     * @param i 初始值
     */
    Slider.prototype.map = function (callback, i) {
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
    Slider.prototype._runTimer = function () {
        var instance = this;
        this._timer = requestAnimationFrame(function () {
            instance.map(function (item) {
                item.run();
            });
            instance._runTimer();
        });
    };
    Slider.prototype._cancelTimer = function () {
        if (this._timer) {
            cancelAnimationFrame(this._timer);
        }
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
        this.hasPoint = true;
        this.auto = true;
    }
    return SliderDefaultOptions;
}());
;
(function ($) {
    $.fn.slider = function (options) {
        return new Slider(this, options);
    };
})(jQuery);
