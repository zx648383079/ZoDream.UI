var LazyMode;
(function (LazyMode) {
    LazyMode[LazyMode["once"] = 0] = "once";
    LazyMode[LazyMode["every"] = 1] = "every";
})(LazyMode || (LazyMode = {}));
var LazyItem = (function () {
    function LazyItem(element, callback, mode, diff) {
        if (mode === void 0) { mode = LazyMode.once; }
        if (diff === void 0) { diff = 0; }
        this.element = element;
        this.callback = callback;
        this.mode = mode;
        this.diff = diff;
    }
    LazyItem.prototype.canRun = function (height, bottom) {
        if (this.mode == LazyMode.once && this._lastHeight) {
            return false;
        }
        var top = this.element.offset().top;
        return top + this.diff >= height && top < bottom;
    };
    LazyItem.prototype.run = function (height, bottom) {
        if (this.mode == LazyMode.once && this._lastHeight) {
            return false;
        }
        var top = this.element.offset().top;
        if (top + this.diff < height || top >= bottom) {
            return false;
        }
        this.callback(this.element);
        this._lastHeight = height + this.diff;
        return true;
    };
    return LazyItem;
}());
var Lazy = (function () {
    function Lazy(element, options) {
        this.element = element;
        this.options = $.extend({}, new LazyDefaultOptions(), options);
        var $window = $(window);
        var instance = this;
        this._init();
        $window.scroll(function () {
            var height = $window.scrollTop();
            var bottom = $window.height() + height;
            instance.run(height, bottom);
        });
    }
    Lazy.prototype.run = function (height, bottom) {
        if (!this._data) {
            return;
        }
        for (var i = this._data.length - 1; i >= 0; i--) {
            var item = this._data[i];
            if (item.run(height, bottom) && item.mode == LazyMode.once) {
                this._data.splice(i, 1);
            }
        }
    };
    // 暂时只做一次
    Lazy.prototype._init = function () {
        this._data = [];
        var instance = this;
        this.element.each(function (i, ele) {
            var item = new LazyItem($(ele), instance.options.callback, instance.options.mode, instance.options.diff);
            instance._data.push(item);
        });
    };
    return Lazy;
}());
var LazyDefaultOptions = (function () {
    function LazyDefaultOptions() {
        this.mode = LazyMode.once;
        this.diff = 0;
    }
    return LazyDefaultOptions;
}());
;
(function ($) {
    $.fn.lazyload = function (options) {
        return new Lazy(this, options);
    };
})(jQuery);
