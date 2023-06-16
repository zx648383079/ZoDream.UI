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
            if (data.code == 200) {
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
        return (_a = this.options[realEvent]).call.apply(_a, __spreadArray([this], args, false));
    };
    return Eve;
}());
var SelectBox = /** @class */ (function (_super) {
    __extends(SelectBox, _super);
    function SelectBox(element, options) {
        var _this_1 = _super.call(this) || this;
        _this_1.element = element;
        _this_1._index = [];
        _this_1._real_index = [];
        _this_1.booted = false;
        _this_1.options = $.extend({}, new SelectBoxDefaultOptions(), options);
        var _this = _this_1;
        if (typeof _this_1.options.data == 'function') {
            _this_1._init();
            return _this_1;
            // this.options.data = this.options.data.call(this, function(data) {
            //     _this.options.data = data;
            //     _this._init();
            // });
        }
        if (typeof _this_1.options.data == 'object') {
            _this_1._init();
            return _this_1;
        }
        if (typeof _this_1.options.data == 'string') {
            CacheUrl.getData(_this_1.options.data, function (data) {
                _this.options.data = data;
                _this._init();
            });
            return _this_1;
        }
        return _this_1;
    }
    SelectBox.prototype._init = function () {
        var _this = this;
        this.box = $('<div class="' + this._getBoxClass() + '" data-type="select"></div>');
        $(document.body).append(this.box);
        this.box.html('<div class="dialog-header"><div class="dialog-close">取消</div><div class="dialog-title">' + this.options.title + '</div><div class="dialog-yes">确定</div></div><div class="dialog-body">' + this._createUl() + '<hr class="dialog-top-hr"><hr class="dialog-bottom-hr"></div>');
        _this._ulBox = [];
        this.box.find('.dialog-body ul').each(function () {
            _this._ulBox.push($(this));
        });
        this._bindEvent();
        if (typeof this.options.data === 'function') {
            this.triggerChange(0);
            return;
        }
        this.triggerChange(0);
        this.notify();
    };
    SelectBox.prototype._bindEvent = function () {
        var _this = this;
        this.element.on('click', function (e) {
            e.stopPropagation();
            _this.show();
        });
        // $(document).on('click', function() {
        //    instance.hide();
        // });
        this.box.on('click', '.dialog-close', function () {
            _this.hide();
        });
        this.box.on('click', '.dialog-yes', function () {
            _this.notify().hide();
        });
        var _loop_1 = function (i) {
            this_1._ulBox[i].on('click', 'li', function () {
                _this.selected($(this), i);
            });
        };
        var this_1 = this;
        for (var i = 0; i < this.options.column; i++) {
            _loop_1(i);
        }
        var startPos;
        this.box.on('touchstart', function (event) {
            var touch = event.targetTouches[0];
            startPos = {
                x: touch.pageX,
                y: touch.pageY
            };
        }).on('touchmove', function (event) {
            var touch = event.targetTouches[0];
            if (event.targetTouches.length > 1 || (event.scale && event.scale !== 1)) {
                return;
            }
            event.preventDefault();
            var y = touch.pageY - startPos.y, diff = Math.abs(y);
            if (diff >= _this.options.lineHeight) {
                // 滑动了一个单位就更新起始y 坐标
                startPos.y = touch.pageY;
                _this.touchMove(diff, y < 0, startPos.x);
            }
        });
    };
    SelectBox.prototype.triggerChange = function (index) {
        var _a;
        if (index === void 0) { index = 0; }
        if (typeof this.options.data !== 'function') {
            this.drawColum(this._getColumnOption(index), index);
            return;
        }
        var _this = this;
        var next = function (data, column) {
            if (column === void 0) { column = index; }
            _this.drawColum(data, column);
        };
        var args = [];
        var error = false;
        if (index > 0) {
            this.mapSelected(function (option, i) {
                if (option.length < 1) {
                    error = true;
                    return false;
                }
                args.push(option.attr('data-value'));
                if (i >= index - 1) {
                    return false;
                }
            });
        }
        if (error) {
            return;
        }
        var data = (_a = this.options.data).call.apply(_a, __spreadArray([this, next, index], args, false));
        if (typeof data === 'object') {
            next(data, index);
        }
    };
    /**
     * 滑动
     * @param distance 距离的绝对值
     * @param isUp 是否是上滑
     * @param x 触发的位置，自动定位到第几级
     */
    SelectBox.prototype.touchMove = function (distance, isUp, x) {
        if (isUp === void 0) { isUp = true; }
        if (x === void 0) { x = 0; }
        var diff = isUp ? Math.floor(distance / this.options.lineHeight) : -Math.ceil(distance / this.options.lineHeight), column = 0;
        if (diff == 0) {
            return this;
        }
        if (this.options.column > 1) {
            column = Math.floor(x / (this.box.width() / this.options.column));
        }
        this.selectedIndex(this._index[column] + diff, column);
        return this;
    };
    /**
     * 显示
     */
    SelectBox.prototype.show = function () {
        // 隐藏其他的
        $('.dialog-select[data-type="select"]').hide();
        this.box.show();
        return this;
    };
    /**
     * 隐藏并重置
     */
    SelectBox.prototype.hide = function () {
        this.box.hide();
        this.restore();
        return this;
    };
    /**
     * 重置
     */
    SelectBox.prototype.restore = function () {
        var data = this._real_index.slice();
        for (var i = 0; i < this.options.column; i++) {
            this.selectedIndex(data[i], i);
        }
        return this;
    };
    /**
     * 刷新
     */
    SelectBox.prototype.refresh = function () {
        this._refreshUl(0, this.options.data);
        for (var i = 0; i < this.options.column; i++) {
            this._real_index[i] = 0;
        }
        this.restore();
        return this;
    };
    /**
     * 根据值自动选中
     * @param val
     */
    SelectBox.prototype.applyValue = function (val) {
        if (this.options.column < 2) {
            return this.selectedValue(val);
        }
        var data = this.getPath(val);
        if (data && data.length > 0) {
            this._real_index = data;
            this.restore();
        }
        return this;
    };
    /**
     * 根据ID查找无限树的路径
     * @param id
     */
    SelectBox.prototype.getPath = function (id) {
        if (!id) {
            return [];
        }
        if (typeof this.options.data !== 'function') {
            return [];
        }
        var path = [], found = false, _this = this, findPath = function (data) {
            if (typeof data != 'object') {
                return;
            }
            var iii = -1;
            $.each(data, function (key, args) {
                iii++;
                if (key == id || args[_this.options.valueTag] == id) {
                    path.push(iii);
                    found = true;
                    return false;
                }
                if (!args.hasOwnProperty(_this.options.childrenTag)) {
                    return;
                }
                findPath(args[_this.options.childrenTag]);
                if (found) {
                    path.push(iii);
                    return false;
                }
            });
        }, ii = -1;
        $.each(this.options.data, function (key, data) {
            ii++;
            findPath(data[_this.options.childrenTag]);
            if (found) {
                path.push(ii);
                return false;
            }
        });
        path.reverse();
        return path;
    };
    SelectBox.prototype._createUl = function () {
        var html = '';
        for (var i = 0; i < this.options.column; i++) {
            html += '<ul class="dialog-column-' + i + '"></ul>';
        }
        return html;
    };
    SelectBox.prototype._getBoxClass = function () {
        if (this.options.column < 2) {
            return 'dialog dialog-select';
        }
        return 'dialog dialog-select dialog-select-column-' + this.options.column;
    };
    SelectBox.prototype._getOptionByIndex = function (data, index) {
        if (index === void 0) { index = 0; }
        if (data instanceof Array) {
            return data[index][this.options.childrenTag];
        }
        for (var key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }
            index--;
            if (index < 0) {
                return data[key][this.options.childrenTag];
            }
        }
        return null;
    };
    SelectBox.prototype._getColumnOption = function (index) {
        var _this_1 = this;
        var data = this.options.data;
        if (index < 1) {
            return data;
        }
        this.mapSelected(function (option, i) {
            var val = option.attr('data-value');
            data = _this_1._getChildren(val, data);
            if (!data || data.length < 1 || i >= index - 1) {
                return false;
            }
        });
        return data;
    };
    SelectBox.prototype._getChildren = function (id, data) {
        if (typeof data != 'object') {
            return [];
        }
        if (!(data instanceof Array)) {
            return data.hasOwnProperty(id) ? data[id][this.options.childrenTag] : [];
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i][this.options.valueTag] == id) {
                return data[i][this.options.childrenTag];
            }
        }
        return [];
    };
    SelectBox.prototype._refreshUl = function (index, data) {
        if (index === void 0) { index = 0; }
        this._ulBox[index].html(this._createOptionHtml(data));
    };
    SelectBox.prototype.drawColum = function (data, index) {
        this._refreshUl(index, data);
        if (!this.booted && this.options.default && this.options.default[index]) {
            this.selectedValue(this.options.default[index], index);
        }
        else {
            this.selectedIndex(0, index);
        }
        if (!this.booted && index >= this.options.column - 1) {
            this.booted = true;
        }
    };
    /**
     * 刷新第几级的数据
     * @param column 第几级
     */
    SelectBox.prototype.refreshColumn = function (column) {
        if (column === void 0) { column = 0; }
        if (typeof this.options.data === 'function') {
            this.triggerChange(column);
            return this;
        }
        var data = this._getColumnOption(column);
        this._refreshUl(column, data);
        this.selectedIndex(0, column);
        return this;
    };
    SelectBox.prototype._createOptionHtml = function (data) {
        var html = '';
        var _this = this;
        $.each(data, function (i, item) {
            var _a = _this._getValueAndText(item, i), value = _a[0], text = _a[1];
            if (_this.options.createOption) {
                text = _this.options.createOption(item, i);
            }
            html += '<li data-value="' + value + '">' + text + '</li>';
        });
        return html;
    };
    /**
     * 获取一个数据的id和显示的文字
     * @param item
     * @param i
     */
    SelectBox.prototype._getValueAndText = function (item, i) {
        if (typeof item != 'object') {
            return !this.options.valueTag ? [item, item] : [i, item];
        }
        var name = item[this.options.textTag];
        if (this.options.valueTag && item.hasOwnProperty(this.options.valueTag)) {
            return [item[this.options.valueTag], name];
        }
        return [i, name];
    };
    /**
     * 选中哪一个
     * @param option
     * @param column  第几级
     */
    SelectBox.prototype.selected = function (option, column) {
        if (column === void 0) { column = 0; }
        if (typeof option == 'number') {
            return this.selectedIndex(option, column);
        }
        if (typeof option == 'object') {
            return this.selectedOption(option, column);
        }
        return this.selectedValue(option, column);
    };
    /**
     * 选中第几行
     * @param index 行号 0 开始
     * @param column 第几级
     */
    SelectBox.prototype.selectedIndex = function (index, column) {
        if (index === void 0) { index = 0; }
        if (column === void 0) { column = 0; }
        if (index < 0) {
            index = 0;
        }
        var lis = this._ulBox[column].find('li');
        var length = lis.length;
        if (index >= length) {
            index = length - 1;
        }
        var option = lis.eq(index);
        this.selectedOption(option, column);
        return this;
    };
    /**
     * 选中哪个值
     * @param id 值
     * @param column  第几级
     */
    SelectBox.prototype.selectedValue = function (id, column) {
        if (column === void 0) { column = 0; }
        var option = this._ulBox[column].find('li[data-value="' + id + '"]');
        if (option.length < 1) {
            this.selectedIndex(0, column);
        }
        this.selectedOption(option, column);
        return this;
    };
    /**
     * 选中哪一行
     * @param option 行元素
     * @param column 第几级
     */
    SelectBox.prototype.selectedOption = function (option, column) {
        if (column === void 0) { column = 0; }
        option.addClass('active').siblings().removeClass('active');
        if (this.booted) {
            this.trigger('change', column, option.data('value'), option.text(), option);
        }
        this._index[column] = option.index();
        var top = 2 * this.options.lineHeight - this._index[column] * this.options.lineHeight;
        this._ulBox[column].css('transform', 'translate(0px, ' + top + 'px) translateZ(0px)');
        if (this.options.column > column + 1) {
            this.refreshColumn(column + 1);
        }
        return this;
    };
    /**
     * 获取当前的选中值 一级是单个值，多级是值的集合
     */
    SelectBox.prototype.val = function () {
        var data = [];
        this.mapSelected(function (option) {
            data.push(option.data('value'));
        });
        return this.options.column > 1 ? data : data[0];
    };
    /**
     * 循环所有选中的项
     * @param cb (option: JQuery, index: number) => any
     */
    SelectBox.prototype.mapSelected = function (cb) {
        for (var i = 0; i < this.options.column; i++) {
            if (cb && cb(this.getSelectedOption(i), i) === false) {
                break;
            }
        }
        return this;
    };
    /**
     * 获取当前选中的选项
     * @param column 第几级
     */
    SelectBox.prototype.getSelectedOption = function (column) {
        if (column === void 0) { column = 0; }
        return this._ulBox[column].find('li').eq(this._index[column]);
    };
    /**
     * 触发通知
     */
    SelectBox.prototype.notify = function () {
        this._real_index = this._index.slice();
        var opts = [], data = [], texts = [];
        this.mapSelected(function (option) {
            opts.push(option);
            texts.push(option.text());
            data.push(option.data('value'));
        });
        this.trigger.apply(this, __spreadArray(__spreadArray(__spreadArray(__spreadArray(['done'], data, false), texts, false), opts, false), this._index, false));
        return this;
    };
    /**
     * range
     */
    SelectBox.prototype.range = function (start, end, step) {
        var data = [];
        if (typeof step === 'undefined' || step === 0) {
            step = start > end ? -1 : 1;
        }
        while (true) {
            if ((step > 0 && start > end)
                || (step < 0 && start < end)) {
                break;
            }
            data.push(start);
            start += step;
        }
        return data;
    };
    return SelectBox;
}(Eve));
var SelectBoxDefaultOptions = /** @class */ (function () {
    function SelectBoxDefaultOptions() {
        this.title = '请选择';
        this.column = 1;
        this.textTag = 'value';
        this.valueTag = 'id';
        this.childrenTag = 'children';
        this.lineHeight = 30;
    }
    return SelectBoxDefaultOptions;
}());
var SelectElemnt = /** @class */ (function () {
    function SelectElemnt(element) {
        this.element = element;
        this._init();
    }
    SelectElemnt.prototype._init = function () {
        this.element.hide();
        this.selectInput = $('<div class="dialog-select-input"></div>');
        this.element.after(this.selectInput);
        var _this = this, val = this.element.val();
        this.box = new SelectBox(this.selectInput, {
            title: this._getTitle(),
            data: this._getOptions(),
            default: val,
            ondone: function (val, text) {
                _this.selectInput.text(text);
                _this.element.val(val).trigger('change');
            }
        });
        this.element.on('optionschange', function () {
            _this.refresh();
        });
    };
    SelectElemnt.prototype._getOptions = function () {
        var data = [];
        this.element.find('option').each(function () {
            data.push({
                id: this.getAttribute('value'),
                value: this.innerText,
            });
        });
        return data;
    };
    /**
     * 刷新更新数据选项
     */
    SelectElemnt.prototype.refresh = function () {
        this.box.options.data = this._getOptions();
        this.box.refresh();
        return this;
    };
    SelectElemnt.prototype._getTitle = function () {
        var id = this.element.attr('id');
        if (!id || id.length < 1) {
            return '请选择';
        }
        var title = $('label[for=' + id + ']').text();
        if (title) {
            return '请选择' + title;
        }
        return '请选择';
    };
    return SelectElemnt;
}());
;
(function ($) {
    $.fn.select = function (options) {
        if (!this.is('select')) {
            return new SelectBox(this, options);
        }
        this.each(function () {
            new SelectElemnt($(this));
        });
        return this;
    };
})(jQuery);
