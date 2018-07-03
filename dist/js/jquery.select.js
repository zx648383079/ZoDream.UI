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
var Select = /** @class */ (function (_super) {
    __extends(Select, _super);
    function Select(element, options) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.options = $.extend({}, new SelectDefaultOptions(), options);
        if (!_this.options.name) {
            _this.options.name = _this.element.attr("data-name");
        }
        _this._input = $('input[name="' + _this.options.name + '"]');
        return _this;
    }
    Object.defineProperty(Select.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (arg) {
            this.data = arg;
        },
        enumerable: true,
        configurable: true
    });
    Select.prototype._init = function () {
        this._box = $("#" + this.options.name + '-select');
        if (this._box.length == 0) {
            this._createHtml();
        }
        this._select = this._box.find("ul");
    };
    Select.prototype._createHtml = function () {
        this._box = $('<div id="' + this.options.name + '-select' + '" class="select-box"><ul></ul></div>');
        $(document.body).append(this._box);
    };
    Select.prototype.refresh = function () {
        var html = '';
        var instance = this;
        $.each(this._data, function (i, item) {
            if (instance.options.textTag) {
                html += '<li data-value="' + item[instance.options.valueTag] + '">' + item[instance.options.textTag] + '</li>';
                return;
            }
            html += '<li data-value="' + i + '">' + item + '</li>';
        });
        this._select.html(html);
    };
    Select.prototype.item = function (value) {
        return this._select.find('li[data-value="' + value + '"]');
    };
    Select.prototype.selected = function (value) {
        this._select.find("li").removeClass("selected");
        this.item(value).addClass("selected");
    };
    Select.prototype._bindEvent = function () {
        var instance = this;
        this.element.click(function () {
            instance.show();
        });
        $(document).click(function () {
            instance.hide();
        });
        this._select.click(function (e) {
            if (e.stopPropagation) {
                e.stopPropagation();
                return;
            }
            e.cancelBubble = true;
        });
        this._select.on("click", "li", function () {
            var item = $(this);
            item.addClass("selected").siblings().removeClass("selected");
            var value = item.attr("data-value");
            instance._input.val(value);
            instance.trigger('click', value, item);
        });
    };
    Select.prototype.show = function () {
        this._box.show();
    };
    Select.prototype.hide = function () {
        this._box.hide();
    };
    Select.prototype.click = function (callback) {
        return this.on('change', callback);
    };
    return Select;
}(Box));
var SelectDefaultOptions = /** @class */ (function () {
    function SelectDefaultOptions() {
        this.textTag = 'value';
        this.valueTag = 'id';
    }
    return SelectDefaultOptions;
}());
;
(function ($) {
    $.fn.select = function (options) {
        return new Select(this, options);
    };
})(jQuery);
