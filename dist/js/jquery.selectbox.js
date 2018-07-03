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
        var _this = _super.call(this) || this;
        _this.element = element;
        _this._index = 0;
        _this._real_index = 0;
        _this._length = 0;
        _this.options = $.extend({}, new SelectBoxDefaultOptions(), options);
        _this._init();
        return _this;
    }
    SelectBox.prototype._init = function () {
        this.box = $('<div class="dialog dialog-select"></div>');
        $(document.body).append(this.box);
        this.box.html('<div class="dialog-header"><div class="dialog-close">取消</div><div class="dialog-title">' + this.options.title + '</div><div class="dialog-yes">确定</div></div><div class="dialog-body"><ul></ul><hr class="dialog-top-hr"><hr class="dialog-bottom-hr"></div>');
        this._ulBox = this.box.find('.dialog-body ul');
        this._bindEvent();
        this.refresh();
        if (this.options.default) {
            this.selectedValue(this.options.default).notify();
            return;
        }
        this.selected(0).notify();
    };
    SelectBox.prototype._bindEvent = function () {
        var instance = this;
        this.element.click(function (e) {
            e.stopPropagation();
            instance.show();
        });
        // $(document).click(function() {
        //    instance.hide();
        // });
        this.box.on('click', '.dialog-close', function () {
            instance.hide();
        });
        this.box.on('click', '.dialog-yes', function () {
            instance.notify().hide();
        });
        this._ulBox.on('click', 'li', function () {
            instance.selected($(this));
        });
        if ($.fn.swipe) {
            this.box.swipe({
                swipe: function (event, direction, distance) {
                    if (direction == $.fn.swipe.directions.UP) {
                        instance.selectedIndex(instance._index + Math.floor(distance / 30));
                        return;
                    }
                    if (direction == $.fn.swipe.directions.DOWN) {
                        instance.selectedIndex(instance._index - Math.ceil(distance / 30));
                        return;
                    }
                }
            });
        }
    };
    SelectBox.prototype.show = function () {
        this.box.show();
        return this;
    };
    SelectBox.prototype.hide = function () {
        this.box.hide();
        if (this._index != this._real_index) {
            this.selectedIndex(this._real_index);
        }
        return this;
    };
    SelectBox.prototype.refresh = function () {
        var html = '';
        var instance = this;
        this._length = 0;
        $.each(this.options.data, function (i, item) {
            instance._length++;
            if (instance.options.textTag) {
                html += '<li data-value="' + item[instance.options.valueTag] + '">' + item[instance.options.textTag] + '</li>';
                return;
            }
            html += '<li data-value="' + i + '">' + item + '</li>';
        });
        this._ulBox.html(html);
        return this;
    };
    SelectBox.prototype.selected = function (option) {
        if (typeof option == 'number') {
            return this.selectedIndex(option);
        }
        if (typeof option == 'object') {
            return this.selectedOption(option);
        }
        return this.selectedValue(option);
    };
    SelectBox.prototype.selectedIndex = function (index) {
        if (index === void 0) { index = 0; }
        if (index < 0) {
            index = 0;
        }
        if (index >= this._length) {
            index = this._length - 1;
        }
        var option = this._ulBox.find('li').eq(index);
        this.selectedOption(option);
        return this;
    };
    SelectBox.prototype.selectedValue = function (id) {
        var option = this._ulBox.find('li[data-value="' + id + '"]');
        this.selectedOption(option);
        return this;
    };
    SelectBox.prototype.selectedOption = function (option) {
        option.addClass('active').siblings().removeClass('active');
        this._index = option.index();
        var top = 60 - this._index * 30;
        this._ulBox.css('transform', 'translate(0px, ' + top + 'px) translateZ(0px)');
        return this;
    };
    SelectBox.prototype.val = function () {
        return this._ulBox.find('li').eq(this._index).attr('data-value');
    };
    SelectBox.prototype.notify = function () {
        this._real_index = this._index;
        var option = this._ulBox.find('li').eq(this._index);
        this.trigger('done', option.attr('data-value'), option, this._index);
        return this;
    };
    return SelectBox;
}(Eve));
var SelectBoxDefaultOptions = /** @class */ (function () {
    function SelectBoxDefaultOptions() {
        this.title = '请选择';
        this.textTag = 'value';
        this.valueTag = 'id';
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
