var Grid = (function () {
    function Grid(element, options) {
        this.element = element;
        this.options = $.extend({}, new GridDefaultOptions(), options);
        this.refresh();
        var instance = this;
        $(window).resize(function () {
            instance.refresh();
        });
    }
    Grid.prototype.refresh = function () {
        var instance = this;
        this.element.each(function (i, element) {
            instance.refreshOne($(element));
        });
    };
    Grid.prototype.refreshOne = function (element) {
        var width = element.width();
        var items = element.find(this.options.tag);
        $(this.options.data).each(function (i, item) {
            var size = Size.parse(item);
            if (typeof i == 'number') {
                size.setSize(items.eq(i), width);
            }
            else {
                size.setSize(element.find(i), width);
            }
        });
    };
    return Grid;
}());
var Size = (function () {
    function Size(width, height, option) {
        if (option === void 0) { option = {}; }
        this.option = option;
        if (typeof width == 'object') {
            this.option = width;
        }
        else {
            this.option['width'] = width;
            this.option['height'] = height;
        }
        for (var i in this.option) {
            if (this.option.hasOwnProperty(i)) {
                this.option[i] = Size.parseNumber(this.option[i]);
            }
        }
    }
    Size.prototype.setSize = function (element, width) {
        if (width === void 0) { width = 1; }
        if (element.length < 1) {
            return;
        }
        var obj = $.extend({}, this.option);
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                obj[i] = obj[i] * width + 'px';
            }
        }
        element.css(obj);
    };
    Size.parseNumber = function (num) {
        if (typeof num == 'number') {
            return num;
        }
        var a = parseFloat(num);
        if (num.indexOf('%') > 0) {
            return a / 100;
        }
        if (num.indexOf('‰') > 0) {
            return a / 1000;
        }
        return a;
    };
    Size.parse = function (obj) {
        if (obj instanceof Size) {
            return obj;
        }
        if (obj instanceof Array) {
            return new Size(obj[0], obj[1]);
        }
        return new Size(obj);
    };
    return Size;
}());
var GridDefaultOptions = (function () {
    function GridDefaultOptions() {
    }
    return GridDefaultOptions;
}());
;
(function ($) {
    $.fn.grid = function (options) {
        return new Grid(this, options);
    };
})(jQuery);
