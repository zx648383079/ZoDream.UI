/*!
 * jquery.city - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
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
var CacheUrl = (function () {
    function CacheUrl() {
    }
    CacheUrl.hasData = function (url) {
        return this._cacheData.hasOwnProperty(url);
    };
    CacheUrl.hasEvent = function (url) {
        return this._event.hasOwnProperty(url);
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
    return CacheUrl;
}());
/**
 * 缓存的数据
 */
CacheUrl._cacheData = {};
/**
 * 缓存的事件
 */
CacheUrl._event = {};
var Box = (function () {
    function Box() {
    }
    Box.prototype.showPosition = function () {
        this.setPosition();
        this.box.show();
        return this;
    };
    Box.prototype.setPosition = function () {
        var offset = this.element.offset();
        var x = offset.left - $(window).scrollLeft();
        var y = offset.top + this.element.outerHeight() - $(window).scrollTop();
        this.box.css({ left: x + "px", top: y + "px" });
        return this;
    };
    Box.prototype.on = function (event, callback) {
        this.options['on' + event] = callback;
        return this;
    };
    Box.prototype.hasEvent = function (event) {
        return this.options.hasOwnProperty('on' + event);
    };
    Box.prototype.trigger = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var realEvent = 'on' + event;
        if (!this.hasEvent(event)) {
            return;
        }
        return (_a = this.options[realEvent]).call.apply(_a, [this].concat(args));
        var _a;
    };
    /**
     * 根据可能是相对值获取绝对值
     * @param abservable
     * @param reltive
     */
    Box.getReal = function (abservable, reltive) {
        if (reltive > 1) {
            return reltive;
        }
        return abservable * reltive;
    };
    return Box;
}());
var City = (function (_super) {
    __extends(City, _super);
    function City(element, options) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this._index = -1;
        _this.options = $.extend({}, new CityDefaultOptions(), options);
        if (typeof _this.options.data == 'function') {
            _this.options.data = _this.options.data.call(_this);
        }
        if (typeof _this.options.data == 'object') {
            _this.init();
            return _this;
        }
        var instance = _this;
        if (typeof _this.options.data == 'string') {
            CacheUrl.getData(_this.options.data, function (data) {
                instance.options.data = data;
                instance.init();
            });
        }
        return _this;
    }
    Object.defineProperty(City.prototype, "val", {
        get: function () {
            var val = '';
            this.map(function (id) {
                val = id;
            });
            return val;
        },
        set: function (arg) {
            this._val = arg;
            if (!this.box) {
                return;
            }
            this._selectedPath.apply(this, this.getPath(arg));
        },
        enumerable: true,
        configurable: true
    });
    City.prototype._selectedPath = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var data = this.options.data;
        this._index = -1;
        this._header.html('');
        this._body.html('');
        var id;
        do {
            this._index++;
            id = args.shift();
            if (typeof data != 'object' || !data.hasOwnProperty(id)) {
                this.addTab(data);
                return;
            }
            this.addTab(data, '请选择', id);
            data = data[id][this.options.children];
        } while (args.length > 0);
        if (id) {
            this.trigger('change');
        }
    };
    City.prototype.init = function () {
        this._create();
        this._bindEvent();
        this.val = this._val || this.element.attr('data-id');
    };
    /**
     * 获取生成标签的头和身体
     */
    City.prototype._getHtml = function (data, title, selected) {
        if (title === void 0) { title = '请选择'; }
        var html = '';
        var instance = this;
        var header = '<li class="active">' + title + '</li>';
        $.each(data, function (i, item) {
            var _a = instance._getIdAndName(item, i), id = _a[0], name = _a[1];
            if (selected && id == selected) {
                html += '<li class="selected" data-id="' + id + '">' + name + '</li>';
                header = '<li class="active" data-id="' + id + '">' + name + '</li>';
                return;
            }
            html += '<li data-id="' + id + '">' + name + '</li>';
        });
        return [header, '<ul class="active">' + html + '</ul>'];
    };
    /**
     * 获取一个数据的id和显示的文字
     * @param item
     * @param i
     */
    City.prototype._getIdAndName = function (item, i) {
        if (typeof item != 'object') {
            return [i, item];
        }
        var name = item[this.options.name];
        if (this.options.id && item.hasOwnProperty(this.options.id)) {
            return [item[this.options.id], name];
        }
        return [i, name];
    };
    City.prototype._create = function () {
        this.box = $('<div class="selector" data-type="selector"></div>');
        var html = '<ul class="selector-header"></ul><div class="selector-body"></div>';
        if (!this.options.auto) {
            html += '<div class="selector-footer"><button class="selector-yes">确定</button></div>';
        }
        this.box.html(html + '<i class="fa fa-close"></i>');
        $(document.body).append(this.box);
        this._header = this.box.find('.selector-header');
        this._body = this.box.find('.selector-body');
    };
    City.prototype._bindEvent = function () {
        var instance = this;
        this.box.on('click', '.fa-close', function () {
            instance.close();
        });
        this._header.on('click', 'li', function () {
            instance.selectedTab($(this).index());
        });
        this._body.on('click', 'li', function () {
            var $this = $(this);
            var id = $this.attr('data-id');
            var index = $this.parent().index();
            $this.addClass('selected').siblings().removeClass('selected');
            instance._header.find('li').eq(index).attr('data-id', id)
                .text($this.text());
            instance.selected(id, index);
        });
        if (!this.options.auto) {
            this.box.on('click', '.selector-yes', function () {
                instance.trigger('done');
            });
        }
        /** 实现隐藏 */
        this.box.click(function (e) {
            e.stopPropagation();
        });
        this.element.click(function (e) {
            e.stopPropagation();
        });
        if (this.options.auto) {
            $(document).click(function () {
                instance.box.hide();
            });
        }
        $(window).scroll(function () {
            instance.setPosition();
        });
        this.element.click(function () {
            instance.show();
        });
    };
    City.prototype.bodyMap = function (callback, index) {
        if (index === void 0) { index = this._index; }
        this._body.find('ul').eq(index).find('li').each(function (i, ele) {
            var item = $(ele);
            var id = item.attr('data-id');
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
    City.prototype.selected = function (id, index) {
        if (index === void 0) { index = this._index; }
        this.remove(index + 1);
        var data = this._getNextData();
        this.trigger('change');
        if (typeof data == 'object') {
            this.addTab(data, '请选择');
        }
        if (!data || data.length == 0) {
            this.trigger('done');
            return this;
        }
        return this;
    };
    City.prototype._getNextData = function () {
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
    City.prototype.selectedId = function (id, index) {
        if (index === void 0) { index = this._index; }
        this.bodyMap(function (i) {
            if (i == id) {
                this.trigger('click');
                return false;
            }
        }, index);
    };
    City.prototype.close = function () {
        this.box.hide();
        return this;
    };
    City.prototype.show = function () {
        this.setPosition();
        this.box.show();
        return this;
    };
    City.prototype.selectedTab = function (index) {
        this._index = index;
        this._header.find('li').eq(index).addClass('active').siblings().removeClass('active');
        this._body.find('ul').eq(index).addClass('active').siblings().removeClass('active');
        return this;
    };
    City.prototype.addTab = function (data, title, selected) {
        if (title === void 0) { title = '请选择'; }
        this._header.find('li').removeClass('active');
        this._body.find('ul').removeClass('active');
        var _a = this._getHtml(data, title, selected), header = _a[0], body = _a[1];
        this._header.append(header);
        this._body.append(body);
        return this;
    };
    City.prototype.remove = function (start) {
        if (start === void 0) { start = 1; }
        var headers = this._header.find('li');
        var bodies = this._body.find('ul');
        for (var i = headers.length - 1; i >= start; i--) {
            headers.eq(i).remove();
            bodies.eq(i).remove();
        }
        return this;
    };
    City.prototype.map = function (callback) {
        this._header.find('li').each(function (i, ele) {
            var item = $(ele);
            var id = item.attr('data-id');
            if (!id) {
                return;
            }
            if (callback.call(item, id, item.text(), i) == false) {
                return false;
            }
        });
        return this;
    };
    City.prototype.text = function (link) {
        if (link === void 0) { link = this.options.line; }
        var arg = [];
        this.map(function (id, name) {
            arg.push(name);
        });
        return arg.join(link);
    };
    City.prototype.all = function () {
        var data = [];
        this.map(function (id) {
            data.push(id);
        });
        return data;
    };
    City.prototype.output = function (element) {
        if (element === void 0) { element = this.element; }
        element.attr('data-id', this.val);
        if (element.is('input') || element.is('textarea')) {
            element.val(this.text());
            return;
        }
        element.text(this.text());
    };
    City.prototype.change = function (callback) {
        return this.on('change', callback);
    };
    City.prototype.done = function (callback) {
        return this.on('done', callback);
    };
    /**
     * 根据ID查找无限树的路径
     * @param id
     */
    City.prototype.getPath = function (id) {
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
    return City;
}(Box));
var CityDefaultOptions = (function () {
    function CityDefaultOptions() {
        this.id = 'id';
        this.name = 'name';
        this.children = 'children';
        this.line = '-';
        this.auto = true;
    }
    return CityDefaultOptions;
}());
;
(function ($) {
    $.fn.city = function (options) {
        return new City(this, options);
    };
})(jQuery);
