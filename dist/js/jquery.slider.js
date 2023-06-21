var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Eve = /** @class */ (function () {
    function Eve() {
    }
    Eve.prototype.on = function (event, callback) {
        this.options['on' + event] = callback;
        return this;
    };
    Eve.prototype.hasEvent = function (event) {
        return this.options.hasOwnProperty('on' + event);
    };
    Eve.prototype.trigger = function (event) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var realEvent = 'on' + event;
        if (!this.hasEvent(event)) {
            return;
        }
        return (_a = this.options[realEvent]).call.apply(_a, __spreadArray([this], args, false));
    };
    return Eve;
}());
var Point = /** @class */ (function () {
    function Point(index, x, width, height) {
        var _a;
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
    }
    /**
     * 取元素的x
     * @param width
     */
    Point.prototype.getLeft = function (width, align) {
        if (align === 'left') {
            return this.x;
        }
        if (align === 'right') {
            return this.x - this.width + width;
        }
        return this.x - (width - 3 * this.width) / 2;
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
var SliderItem = /** @class */ (function (_super) {
    __extends(SliderItem, _super);
    function SliderItem(element, options) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this._data = [];
        _this._length = 0;
        _this._index = 0;
        var option = _this.element.attr('data-slider');
        if (option == '1') {
            return _this;
        }
        _this._extendOption(options, option);
        var items = _this.element.find(_this.options.item);
        if (items.length < 1) {
            return _this;
        }
        _this.options.width = _this._getOption('width');
        _this.options.height = _this._getOption('height');
        _this.options.animationmode = _this._getOption('animationmode');
        _this.options.haspoint = _this._getOption('haspoint');
        _this.options.align = _this._getOption('align');
        _this.element.addClass(_this.options.animationmode + '-slider');
        _this._length = items.length;
        _this._box = items.parent();
        _this.element.attr('data-slider', 1);
        if (_this._length < 2) {
            _this._initOnly(items);
            return _this;
        }
        _this._init(items);
        return _this;
    }
    SliderItem.prototype._timeCallback = function () {
        if (this._getOption('auto')) {
            this.next();
        }
    };
    SliderItem.prototype._extendOption = function (options, option) {
        try {
            option = JSON.parse(option);
        }
        catch (error) {
        }
        this.options = $.extend({}, options, option);
    };
    /**
     * 初始化只有一张
     */
    SliderItem.prototype._initOnly = function (items) {
        var instance = this;
        this._resetOnly(items);
        $(window).on('resize', function () {
            instance._resetOnly(items);
        });
    };
    /**
     * 设置一张图的高度
     * @param item
     */
    SliderItem.prototype._resetOnly = function (item) {
        var width = this.options.width > 0 ? this._getWidth(this.options.width) : item.width();
        var height = this.options.height > 0 ? this._getWidth(this.options.height) : item.height();
        item.css({ height: height, width: width });
        this.element.css({ height: height, width: width });
    };
    SliderItem.prototype._needMove = function () {
        return this.options.animationmode != 'fade';
    };
    SliderItem.prototype._copyItem = function (items) {
        for (var j = 0; j < 2; j++) {
            for (var i = 0, length_1 = items.length; i < length_1; i++) {
                var newLi = $(items[i].cloneNode(true));
                this._data[i].elements.push(newLi);
                this._box.append(newLi);
            }
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
        if (this._needMove()) {
            this._copyItem(items);
        }
        this.resize();
        // 输出可点击的列表
        if (this.options.haspoint) {
            this._addListPoint();
        }
        this._bindEvent();
        this._setTime();
    };
    SliderItem.prototype._bindEvent = function () {
        var instance = this;
        this.element.find(this.options.previous).on('click', function () {
            instance.previous();
        });
        this.element.find(this.options.next).on('click', function () {
            instance.next();
        });
        this.element.on(this._getOption('pointevent'), ".slider-point li", function () {
            instance.index = $(this).index();
        });
        $(window).on('resize', function () {
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
    /**
     * 获取配置
     * @param name
     */
    SliderItem.prototype._getOption = function (name) {
        var val = this.element.data(name);
        if (val == 'false') {
            return false;
        }
        if (val == 'true') {
            return true;
        }
        if (typeof val == 'boolean') {
            return val;
        }
        return val || this.options[name];
    };
    SliderItem.prototype._getWidth = function (reltive) {
        if (reltive > 1) {
            return reltive;
        }
        return this.element.width() * reltive;
    };
    SliderItem.prototype._setTime = function () {
        this._time = (this._getOption('spacetime') + this._getOption('animationtime')) / 16;
    };
    /**
     * 添加跳转点
     * @param count
     */
    SliderItem.prototype._addListPoint = function () {
        var html = '';
        for (var i = 1; i <= this._length; i++) {
            html += '<li><span>' + i + '</span></i>';
        }
        this.element.append('<ul class="slider-point">' + html + '</ul>');
    };
    /**
     * 浏览器尺寸变化
     */
    SliderItem.prototype.resize = function () {
        this._setTime();
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
        if (this._needMove()) {
            this._applySize(width, maxWidth);
        }
        this.index = this._index;
    };
    SliderItem.prototype._applySize = function (width, maxWidth) {
        $.each(this._data, function (i, point) {
            point.x -= width;
        });
        this._box.css({ left: this._data[this._index].getLeft(maxWidth, this.options.align) + "px" });
        this._box.width(width * 3);
    };
    Object.defineProperty(SliderItem.prototype, "index", {
        get: function () {
            return this._index;
        },
        set: function (index) {
            this.goto(index);
        },
        enumerable: false,
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
        this._changePoint(index);
    };
    SliderItem.prototype._changePoint = function (index) {
        if (this._needMove()) {
            return this._movePoint(index);
        }
        if (index < 0) {
            index = this._data.length - 1;
        }
        else if (index >= this._data.length) {
            index = 0;
        }
        var instance = this;
        var time = this._getOption('animationtime');
        this._data.forEach(function (point, i) {
            if (i == index) {
                point.elements[0].animate({ opacity: 1 }, time, 'swing', function () {
                    instance._showPoint(index);
                });
                instance.trigger('change', point);
                return;
            }
            point.elements[0].animate({ opacity: 0 }, time, 'swing');
        });
    };
    SliderItem.prototype._showPoint = function (index) {
        this._index = index;
        this.element.find(".slider-point li")
            .eq(index).addClass("active").siblings().removeClass("active");
    };
    SliderItem.prototype._movePoint = function (index) {
        var points = this._getPoint(index);
        var width = this.element.width();
        this.element.height(points[0].height);
        var instance = this;
        this._goAndCallback(points[0].getLeft(width, this.options.align), function () {
            if (points[0].index != points[1].index) {
                instance._box.css({ left: points[1].getLeft(width, instance.options.align) + 'px' });
            }
            instance._showPoint(points[1].index);
        });
        this.trigger.apply(this, __spreadArray(['change'], points, false));
    };
    /**
     * 移动动画及回调
     * @param left
     * @param callback
     */
    SliderItem.prototype._goAndCallback = function (left, callback) {
        this._box.animate({ left: left + "px" }, this._getOption('animationtime'), this.options.animationmode, callback);
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
/*!
 * jquery.slider - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
var Slider = /** @class */ (function () {
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
var SliderDefaultOptions = /** @class */ (function () {
    function SliderDefaultOptions() {
        this.item = '.slider-box li';
        this.spacetime = 3000;
        this.animationtime = 1000;
        this.animationmode = "swing";
        this.previous = ".slider-previous";
        this.next = ".slider-next";
        this.haspoint = true;
        this.pointevent = "click";
        this.auto = true;
        this.align = 'center';
    }
    return SliderDefaultOptions;
}());
;
(function ($) {
    $.fn.slider = function (options) {
        return new Slider(this, options);
    };
})(jQuery);
