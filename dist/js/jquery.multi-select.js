var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        return (_a = this.options[realEvent]).call.apply(_a, [this].concat(args));
    };
    return Eve;
}());
/*!
 * jquery.city - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
var MultiSelect = /** @class */ (function (_super) {
    __extends(MultiSelect, _super);
    function MultiSelect(element, options) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this._index = -1;
        var instance = _this;
        _this.options = $.extend({}, new MultiSelectDefaultOptions(), options);
        if (typeof _this.options.data == 'function') {
            _this.options.data = _this.options.data.call(_this, function (data) {
                instance.options.data = data;
                instance.init();
            });
        }
        if (typeof _this.options.data == 'object') {
            _this.init();
            return _this;
        }
        if (typeof _this.options.data == 'string') {
            CacheUrl.getData(_this.options.data, function (data) {
                instance.options.data = data;
                instance.init();
            });
        }
        return _this;
    }
    Object.defineProperty(MultiSelect.prototype, "val", {
        get: function () {
            var val = '';
            this.map(function (id) {
                val = id;
            });
            return val;
        },
        set: function (arg) {
            this._val = arg;
            this._selectedPath.apply(this, this.getPath(arg));
        },
        enumerable: true,
        configurable: true
    });
    MultiSelect.prototype._selectedPath = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var data = this.options.data;
        this._index = -1;
        this.element.html('');
        var id;
        do {
            this._index++;
            id = args.shift();
            if (typeof data != 'object' || !data.hasOwnProperty(id)) {
                this.addElement(data);
                return;
            }
            this.addElement(data, '请选择', id);
            data = data[id][this.options.children];
        } while (args.length > 0);
        if (id) {
            this.trigger('change');
        }
    };
    MultiSelect.prototype.init = function () {
        this._create();
        this._bindEvent();
        this.val = this._val || this.options.default;
    };
    /**
     * 获取生成标签的头和身体
     */
    MultiSelect.prototype._getHtml = function (data, title, selected) {
        if (title === void 0) { title = '请选择'; }
        var html = '<option>' + title + '</option>';
        var instance = this;
        $.each(data, function (i, item) {
            var _a = instance._getIdAndName(item, i), id = _a[0], name = _a[1];
            if (selected && id == selected) {
                html += '<option selected value="' + id + '">' + name + '</li>';
                return;
            }
            html += '<option value="' + id + '">' + name + '</li>';
        });
        return '<select name="' + this.options.tag + '">' + html + '</ul>';
    };
    /**
     * 获取一个数据的id和显示的文字
     * @param item
     * @param i
     */
    MultiSelect.prototype._getIdAndName = function (item, i) {
        if (typeof item != 'object') {
            return [i, item];
        }
        var name = item[this.options.name];
        if (this.options.id && item.hasOwnProperty(this.options.id)) {
            return [item[this.options.id], name];
        }
        return [i, name];
    };
    MultiSelect.prototype._create = function () {
        this.addElement(this.options.data);
    };
    MultiSelect.prototype._bindEvent = function () {
        var instance = this;
        this.element.on('change', 'select', function () {
            var $this = $(this);
            var id = $this.val();
            var index = $this.index();
            instance.selected(id + '', index);
        });
    };
    MultiSelect.prototype.bodyMap = function (callback, index) {
        if (index === void 0) { index = this._index; }
        this.element.find('select').eq(index).find('option').each(function (i, ele) {
            var item = $(ele);
            var id = item.val();
            if (!id) {
                return;
            }
            if (callback.call(item, id, item.text(), i) == false) {
                return false;
            }
        });
    };
    /**
     * 加载下一页不进行选择
     */
    MultiSelect.prototype.selected = function (id, index) {
        if (index === void 0) { index = this._index; }
        this.remove(index + 1);
        var data = this._getNextData();
        this.trigger('change');
        if (typeof data == 'object' && (!(data instanceof Array) || data.length > 0)) {
            this.addElement(data, '请选择');
        }
        if (!data || data.length == 0) {
            this.trigger('done');
            return this;
        }
        return this;
    };
    MultiSelect.prototype._getNextData = function () {
        var data = this.options.data;
        var instance = this;
        this.map(function (id) {
            if (typeof data != 'object' || !data.hasOwnProperty(id)) {
                data = [];
                return false;
            }
            data = data[id][instance.options.children];
            if (!data) {
                data = [];
                return false;
            }
        });
        return data;
    };
    /**
     * 选中并触发加载下一页 不进行自动关闭
     */
    MultiSelect.prototype.selectedId = function (id, index) {
        if (index === void 0) { index = this._index; }
        this.bodyMap(function (i) {
            if (i == id) {
                this.trigger('click');
                return false;
            }
        }, index);
    };
    MultiSelect.prototype.addElement = function (data, title, selected) {
        if (title === void 0) { title = '请选择'; }
        var html = this._getHtml(data, title, selected);
        this.element.append(html);
        return this;
    };
    MultiSelect.prototype.remove = function (start) {
        if (start === void 0) { start = 1; }
        var items = this.element.find('select');
        for (var i = items.length - 1; i >= start; i--) {
            items.eq(i).remove();
        }
        return this;
    };
    MultiSelect.prototype.map = function (callback) {
        this.element.find('select').each(function (i, ele) {
            var item = $(ele);
            var id = item.val();
            if (!id) {
                return;
            }
            if (callback.call(item, id, item.find('option:selected').text(), i) == false) {
                return false;
            }
        });
        return this;
    };
    MultiSelect.prototype.text = function (link) {
        if (link === void 0) { link = this.options.line; }
        var arg = [];
        this.map(function (id, name) {
            arg.push(name);
        });
        return arg.join(link);
    };
    MultiSelect.prototype.lastText = function () {
        var arg = '请选择';
        this.map(function (id, name) {
            arg = name;
        });
        return arg;
    };
    MultiSelect.prototype.all = function () {
        var data = [];
        this.map(function (id) {
            data.push(id);
        });
        return data;
    };
    MultiSelect.prototype.change = function (callback) {
        return this.on('change', callback);
    };
    MultiSelect.prototype.done = function (callback) {
        return this.on('done', callback);
    };
    /**
     * 根据ID查找无限树的路径
     * @param id
     */
    MultiSelect.prototype.getPath = function (id) {
        if (!id) {
            return [];
        }
        if (this.options.hasOwnProperty(id)) {
            return [id];
        }
        var path = [], found = false, instance = this, findPath = function (data) {
            if (typeof data != 'object') {
                return;
            }
            if (data.hasOwnProperty(id)) {
                path.push(id);
                found = true;
                return;
            }
            $.each(data, function (key, args) {
                findPath(args[instance.options.children]);
                if (found) {
                    path.push(key);
                    return false;
                }
            });
        };
        $.each(this.options.data, function (key, data) {
            findPath(data[instance.options.children]);
            if (found) {
                path.push(key);
                return false;
            }
        });
        path.reverse();
        return path;
    };
    return MultiSelect;
}(Eve));
var MultiSelectDefaultOptions = /** @class */ (function () {
    function MultiSelectDefaultOptions() {
        this.id = 'id';
        this.name = 'name';
        this.children = 'children';
    }
    return MultiSelectDefaultOptions;
}());
;
(function ($) {
    $.fn.multiSelect = function (options) {
        return new MultiSelect(this, options);
    };
})(jQuery);
