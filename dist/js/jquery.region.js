/**
 * 缓存数据
 */
var CacheUrl = /** @class */ (function () {
    function CacheUrl() {
    }
    CacheUrl.hasData = function (url) {
        return this._cacheData.hasOwnProperty(url);
    };
    CacheUrl.hasEvent = function (url) {
        return this._event.hasOwnProperty(url);
    };
    CacheUrl.addEvent = function (url, callback) {
        if (!this.hasEvent(url)) {
            this._event[url] = [callback];
            return;
        }
        this._event[url].push(callback);
    };
    /**
     * 获取数据通过回调返回
     * @param url
     * @param callback
     */
    CacheUrl.getData = function (url, callback) {
        if (this.hasData(url)) {
            callback(this._cacheData[url]);
            return;
        }
        if (this.hasEvent(url)) {
            this._event[url].push(callback);
            return;
        }
        this._event[url] = [callback];
        var instance = this;
        $.getJSON(url, function (data) {
            if (data.code == 0) {
                instance.setData(url, data.data);
                return;
            }
            console.log('URL ERROR! ' + url);
        });
    };
    /**
     * 设置数据并回调
     * @param url
     * @param data
     */
    CacheUrl.setData = function (url, data) {
        this._cacheData[url] = data;
        if (!this.hasEvent(url)) {
            return;
        }
        this._event[url].forEach(function (callback) {
            callback(data);
        });
        delete this._event[url];
    };
    /**
     * 缓存的数据
     */
    CacheUrl._cacheData = {};
    /**
     * 缓存的事件
     */
    CacheUrl._event = {};
    return CacheUrl;
}());
/*
 * @Author: zodream
 * @Date: 2018-10-18 17:29:42
 * @Last Modified by:   zodream
 * @Last Modified time: 2018-10-18 17:29:42
 */
var Region = /** @class */ (function () {
    function Region(element, option) {
        var _this = this;
        this.element = element;
        this.selectList = [];
        this.option = $.extend({}, new RegionDefaultOption(), option);
        this.selectList = [];
        this.element.find('select').each(function (i, ele) {
            _this.selectList.push($(ele));
        });
        if (typeof this.option.data == 'object') {
            this.init();
            return;
        }
        var instance = this;
        CacheUrl.getData(this.option.data, function (data) {
            instance.option.data = data;
            instance.init();
        });
    }
    Region.prototype.map = function (callback, start) {
        if (start === void 0) { start = 0; }
        var count = this.selectList.length;
        for (; start < count; start++) {
            if (false == callback(this.selectList[start], start, count)) {
                return;
            }
        }
    };
    Region.prototype.init = function () {
        var _this = this;
        if (this.option.default) {
            this.map(function (item, i) {
                if (_this.option.default.length > i) {
                    item.attr('data-value', _this.option.default[i]);
                    return;
                }
                return false;
            });
        }
        var instance = this;
        this.map(function (item, i, count) {
            if (i >= count - 1) {
                return false;
            }
            item.change(function () {
                var element = instance.eq(i + 1);
                var val = element.val();
                if (val) {
                    element.attr('data-value', val);
                }
                instance.showOption(element, i + 1);
            });
        });
        this.showOption(this.selectList[0], 0);
    };
    Object.defineProperty(Region.prototype, "val", {
        get: function () {
            var args = [];
            this.map(function (item) {
                args.push(item.val());
            });
            return args;
        },
        set: function (args) {
            this.map(function (item, i) {
                item.attr('data-value', args[i]);
            });
            this.showOption(this.selectList[0], 0);
        },
        enumerable: true,
        configurable: true
    });
    Region.prototype.eq = function (i) {
        if (i < 0) {
            i = 0;
        }
        if (this.selectList.length <= i) {
            i = this.selectList.length - 1;
        }
        return this.selectList[i];
    };
    Region.prototype.getOptionData = function (i) {
        if (i < 1) {
            return this.option.data;
        }
        var data = this.option.data;
        var id;
        this.map(function (item, index) {
            if (index >= i) {
                return false;
            }
            id = item.val();
            if (!data.hasOwnProperty(id)) {
                data = null;
                return false;
            }
            data = data[id]['children'];
        });
        return data;
    };
    Region.prototype.getOptionTip = function (i) {
        if (typeof this.option.tips == 'object') {
            return this.option.tips[i];
        }
        return this.option.tips;
    };
    Region.prototype.showOption = function (element, i) {
        var _this = this;
        var hasSelected = false;
        element.html(this.getSelectHtml(this.getOptionData(i), element.attr('data-value'), this.getOptionTip(i), function () {
            hasSelected = true;
        }));
        this.map(function (item, index) {
            item.html(_this.getSelectHtml({}, null, _this.getOptionTip(index)));
        }, i + 1);
        if (hasSelected) {
            element.trigger('change');
        }
    };
    Region.prototype.getSelectHtml = function (data, selected, defaultLabel, selectedCallback) {
        if (defaultLabel === void 0) { defaultLabel = '请选择'; }
        var html = '<option value="">' + defaultLabel + '</option>';
        if (!data) {
            return html;
        }
        var instance = this;
        $.each(data, function (id, item) {
            var isSelected = id == selected;
            html += instance.getOptionHtml(id, item.name, isSelected);
            isSelected && selectedCallback && selectedCallback();
        });
        return html;
    };
    Region.prototype.getOptionHtml = function (id, text, isSelected) {
        if (isSelected === void 0) { isSelected = false; }
        if (isSelected) {
            return '<option value="' + id + '" selected>' + text + '</option>';
        }
        return '<option value="' + id + '">' + text + '</option>';
    };
    return Region;
}());
var RegionDefaultOption = /** @class */ (function () {
    function RegionDefaultOption() {
        this.data = 'region/tree';
        this.tips = '请选择';
    }
    return RegionDefaultOption;
}());
;
(function ($) {
    $.fn.region = function (options) {
        if (this.length == 1) {
            return new Region(this, options);
        }
        var args = [];
        this.each(function () {
            args.push(new Region(this, options));
        });
        return args;
    };
})(jQuery);
