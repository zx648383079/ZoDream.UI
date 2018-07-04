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
var SelectBox = /** @class */ (function (_super) {
    __extends(SelectBox, _super);
    function SelectBox(element, options) {
        var _this_1 = _super.call(this) || this;
        _this_1.element = element;
        _this_1._index = [];
        _this_1._real_index = [];
        _this_1.options = $.extend({}, new SelectBoxDefaultOptions(), options);
        var _this = _this_1;
        if (typeof _this_1.options.data == 'function') {
            _this_1.options.data = _this_1.options.data.call(_this_1, function (data) {
                _this.options.data = data;
                _this._init();
            });
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
        this.refresh();
        if (this.options.default) {
            this.applyValue(this.options.default);
        }
        this.notify();
    };
    SelectBox.prototype._bindEvent = function () {
        var _this = this;
        this.element.click(function (e) {
            e.stopPropagation();
            _this.show();
        });
        // $(document).click(function() {
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
            if ($.fn.swipe) {
                this_1._ulBox[i].swipe({
                    swipe: function (event, direction, distance) {
                        if (direction == $.fn.swipe.directions.UP) {
                            _this.selectedIndex(_this._index[i] + Math.floor(distance / _this.options.lineHeight));
                            return;
                        }
                        if (direction == $.fn.swipe.directions.DOWN) {
                            _this.selectedIndex(_this._index[i] - Math.ceil(distance / _this.options.lineHeight));
                            return;
                        }
                    }
                });
            }
        };
        var this_1 = this;
        for (var i = 0; i < this.options.column; i++) {
            _loop_1(i);
        }
    };
    SelectBox.prototype.show = function () {
        this.box.show();
        return this;
    };
    SelectBox.prototype.hide = function () {
        this.box.hide();
        this.restore();
        return this;
    };
    SelectBox.prototype.restore = function () {
        var data = this._real_index.slice();
        for (var i = 0; i < this.options.column; i++) {
            this.selectedIndex(data[i], i);
        }
        return this;
    };
    SelectBox.prototype.refresh = function () {
        this._refreshUl(0, this.options.data);
        for (var i = 0; i < this.options.column; i++) {
            this._real_index[i] = 0;
        }
        this.restore();
        return this;
    };
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
    SelectBox.prototype.refreshColumn = function (column) {
        if (column === void 0) { column = 0; }
        var data = this._getColumnOption(column);
        this._refreshUl(column, data);
        this.selectedIndex(0, column);
        return this;
    };
    SelectBox.prototype._createOptionHtml = function (data) {
        var html = '';
        var _this = this;
        $.each(data, function (i, item) {
            if (_this.options.textTag) {
                html += '<li data-value="' + item[_this.options.valueTag] + '">' + item[_this.options.textTag] + '</li>';
                return;
            }
            html += '<li data-value="' + i + '">' + item + '</li>';
        });
        return html;
    };
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
    SelectBox.prototype.selectedValue = function (id, column) {
        if (column === void 0) { column = 0; }
        var option = this._ulBox[column].find('li[data-value="' + id + '"]');
        this.selectedOption(option, column);
        return this;
    };
    SelectBox.prototype.selectedOption = function (option, column) {
        if (column === void 0) { column = 0; }
        option.addClass('active').siblings().removeClass('active');
        this._index[column] = option.index();
        var top = 2 * this.options.lineHeight - this._index[column] * this.options.lineHeight;
        this._ulBox[column].css('transform', 'translate(0px, ' + top + 'px) translateZ(0px)');
        if (this.options.column > column + 1) {
            this.refreshColumn(column + 1);
        }
        return this;
    };
    SelectBox.prototype.val = function () {
        var data = [];
        for (var i = 0; i < this.options.column; i++) {
            data.push(this.getSelectedOption(i).attr('data-value'));
        }
        return this.options.column > 1 ? data : data[0];
    };
    SelectBox.prototype.mapSelected = function (cb) {
        for (var i = 0; i < this.options.column; i++) {
            if (cb && cb(this.getSelectedOption(i), i) === false) {
                break;
            }
        }
        return this;
    };
    SelectBox.prototype.getSelectedOption = function (index) {
        if (index === void 0) { index = 0; }
        return this._ulBox[index].find('li').eq(this._index[index]);
    };
    SelectBox.prototype.notify = function () {
        this._real_index = this._index.slice();
        var opts = [];
        var data = [];
        this.mapSelected(function (option) {
            opts.push(option);
            data.push(option.attr('data-value'));
        });
        this.trigger.apply(this, ['done'].concat(data, opts, this._index));
        return this;
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
        var instance = this;
        this.box = new SelectBox(this.selectInput, {
            title: this._getTitle(),
            data: this._getOptions(),
            ondone: function (val, option) {
                instance.selectInput.text(option.text());
                instance.element.val(val).trigger('change');
            }
        });
        this.element.on('optionschange', function () {
            instance.refresh();
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
