/*!
 * jquery.lazyload - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
var LazyMode;
(function (LazyMode) {
    LazyMode[LazyMode["once"] = 0] = "once";
    LazyMode[LazyMode["every"] = 1] = "every";
})(LazyMode || (LazyMode = {}));
var LazyItem = /** @class */ (function () {
    function LazyItem(element, callback, mode, diff) {
        if (mode === void 0) { mode = LazyMode.once; }
        if (diff === void 0) { diff = 0; }
        this.element = element;
        this.callback = callback;
        this.mode = mode;
        this.diff = diff;
    }
    /**
     * 重新刷新
     */
    LazyItem.prototype.refresh = function () {
        this._lastHeight = undefined;
    };
    /**
     * 判断能否执行
     * @param height
     * @param bottom
     */
    LazyItem.prototype.canRun = function (height, bottom) {
        if (this.mode == LazyMode.once && this._lastHeight != undefined) {
            return false;
        }
        if (typeof this.diff == 'function') {
            return this.diff.call(this, height, bottom);
        }
        var top = this.element.offset().top;
        return top + this.diff >= height && top < bottom;
    };
    LazyItem.prototype.run = function (height, bottom) {
        if (!this.canRun(height, bottom)) {
            return false;
        }
        this.callback.call(this, this.element);
        this._lastHeight = height;
        return true;
    };
    return LazyItem;
}());
var Lazy = /** @class */ (function () {
    function Lazy(element, options) {
        this.element = element;
        this.options = $.extend({}, new LazyDefaultOptions(), options);
        var $window = $(window);
        var instance = this;
        this._init();
        $window.scroll(function () {
            instance.scrollInvote();
        });
        // 首次执行
        this.scrollInvote();
    }
    /**
     * 页面滚动触发更新
     */
    Lazy.prototype.scrollInvote = function () {
        var $window = $(window);
        var height = $window.scrollTop();
        var bottom = $window.height() + height;
        this.run(height, bottom);
    };
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
        var _this = this;
        this._data = [];
        var instance = this;
        this.element.each(function (i, ele) {
            var item = new LazyItem($(ele), typeof instance.options.callback != 'function' ? Lazy.getMethod(instance.options.callback) : instance.options.callback, instance.options.mode, instance.options.diff);
            instance._data.push(item);
        });
        $.each(this.options.data, function (i, item) {
            if (item instanceof LazyItem) {
                _this._data.push(item);
                return;
            }
            if (typeof i == 'string') {
                item['tag'] = i;
            }
            $(item.tag).each(function (i, ele) {
                var lazyItem = new LazyItem($(ele), typeof item.callback != 'function' ? Lazy.getMethod(item.callback) : item.callback, item.mode || LazyMode.once, item.diff || 0);
                instance._data.push(lazyItem);
            });
        });
    };
    /**
     * 添加方法
     * @param name
     * @param callback
     */
    Lazy.addMethod = function (name, callback) {
        this.methods[name] = callback;
    };
    /**
     * 获取方法
     * @param name
     */
    Lazy.getMethod = function (name) {
        return this.methods[name];
    };
    /**
     * 全局方法集合
     */
    Lazy.methods = {};
    return Lazy;
}());
/**
 * 加载图片，如需加载动画控制请自定义
 */
Lazy.addMethod('img', function (imgEle) {
    var img = imgEle.attr('data-original');
    $("<img />")
        .bind("load", function () {
        imgEle.attr('src', img);
    }).attr('src', img);
});
/**
 * 加载模板，需要引用 template 函数
 */
Lazy.addMethod('tpl', function (tplEle) {
    var url = tplEle.attr('data-url');
    var templateId = tplEle.attr('data-tpl');
    $.getJSON(url, function (data) {
        if (data.code != 200) {
            return;
        }
        if (typeof data.data != 'string') {
            data.data = template(templateId, data.data);
        }
        tplEle.html(data.data);
    });
});
/**
 * 滚动加载模板，需要引用 template 函数
 */
Lazy.addMethod('scroll', function (moreEle) {
    var page = parseInt(moreEle.attr('data-page') || '0') + 1;
    var url = moreEle.attr('data-url');
    var templateId = moreEle.attr('data-tpl');
    var target = moreEle.attr('data-target');
    $.getJSON(url, {
        page: page
    }, function (data) {
        if (data.code != 200) {
            return;
        }
        if (typeof data.data != 'string') {
            data.data = template(templateId, data.data);
        }
        $(target).html(data.data);
        moreEle.attr('data-page', page);
    });
});
var LazyDefaultOptions = /** @class */ (function () {
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
