var ZUtils;
(function (ZUtils) {
    var time = /** @class */ (function () {
        function time() {
        }
        /**
         * 获取真实的月份
         */
        time.getRealMonth = function (date) {
            return date.getMonth() + 1;
        };
        /**
         * 格式化日期
         */
        time.format = function (date, fmt) {
            if (fmt === void 0) { fmt = 'y年m月d日'; }
            var o = {
                "y+": date.getFullYear(),
                "m+": this.getRealMonth(date),
                "d+": date.getDate(),
                "h+": date.getHours(),
                "i+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S": date.getMilliseconds() //毫秒 
            };
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        };
        return time;
    }());
    ZUtils.time = time;
    var str = /** @class */ (function () {
        function str() {
        }
        str.format = function (arg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return arg.replace(/\{(\d+)\}/g, function (m, i) {
                return args[i];
            });
        };
        return str;
    }());
    ZUtils.str = str;
})(ZUtils || (ZUtils = {}));
var FilterBox = /** @class */ (function () {
    function FilterBox(element, options) {
        this.element = element;
        this.options = $.extend({}, new FilterDefaultOption(), options);
        this.refresh();
    }
    FilterBox.prototype.refresh = function () {
        this.element.html(this.createHtml());
    };
    FilterBox.prototype.createHtml = function () {
        return ZUtils.str.format('<div class="filter-box">{0}{3}<div class="property-box">{1}</div>{2}</div>', this._createSearchHtml(), this._createPropertiesHtml(), this._createSortHtml(), this._createSelectedHtml());
    };
    FilterBox.prototype._createSelectedHtml = function () {
        if (this._selectedProperty.length < 1) {
            return '';
        }
        var html = '';
        $.each(this._selectedProperty, function (i, label) {
            html += ZUtils.str.format('<li><span>{0}</span><i class="fa fa-close"></i></li>', label);
        });
        return ZUtils.str.format('<div class="filter-property"><span class="property-header">已选择</span><ul>{0}</ul></div>', html);
    };
    FilterBox.prototype._createPropertiesHtml = function () {
        var html = '', that = this;
        this._selectedProperty = [];
        $.each(this.options.properties, function (i, item) {
            html += that._createPropertyHtml(item);
        });
        return html;
    };
    FilterBox.prototype._createPropertyHtml = function (attr) {
        return ZUtils.str.format('<div class="property-item"><span class="property-header">{0}</span><div class="property-body"><ul>{1}</ul></div><div class="property-action"><span class="property-more">更多</span>{2}</div></div>', attr.name, attr.type == 'range' ? this._createRangePropertyHtml(attr) : this._createCommonPropertyHtml(attr), attr.multiple ? '<span class="property-multiple">多选</span>' : '');
    };
    FilterBox.prototype._createCommonPropertyHtml = function (attr) {
        var args = this.options.data[attr.key], html = '', that = this;
        $.each(attr.children, function (i, item) {
            if (!args || (typeof args == 'object' && args.indexOf(item.id) < 0) || (typeof args != 'object' && args != item.id)) {
                html += ZUtils.str.format('<li>{0}</li>', item.name);
                return;
            }
            that._selectedProperty.push(item.name);
            html += ZUtils.str.format('<li class="active">{0}</li>', item.name);
        });
        return html;
    };
    FilterBox.prototype._createRangePropertyHtml = function (attr) {
        var args = this.options.data[attr.key], start = 0, is_array = typeof attr.children == 'object' && attr.children instanceof Array, is_active = false, html = '', that = this, end, label, is_a;
        $.each(attr.children, function (i, item) {
            if (is_array) {
                end = item;
                label = ZUtils.str.format('{0}-{1}', start, end);
            }
            else {
                end = i;
                label = item;
            }
            is_a = args && args[0] == start && args[1] == end;
            if (is_a) {
                that._selectedProperty.push(label);
                is_active = true;
                html += ZUtils.str.format('<li class="active">{0}</li>', label);
                return;
            }
            html += ZUtils.str.format('<li>{0}</li>', label);
        });
        if (!is_active && args) {
            this._selectedProperty.push(args.join('-'));
            return ZUtils.str.format('{0}<li class="range-input"><input type="text" name="{1}_min" value="{2}">-<input type="text" name="{1}_max" value="{3}"></li>', html, attr.key, args[0], args[1]);
        }
        return ZUtils.str.format('{0}<li class="range-input"><input type="text" name="{1}_min">-<input type="text" name="{1}_max"></li>', html, attr.key);
    };
    FilterBox.prototype._createSearchHtml = function () {
        return ZUtils.str.format('<div class="search-box"><span class="property-header">搜索</span><input type="text" name="keywords" placeholder="搜索" value="{0}"></div>', this.options.data.keywords);
    };
    FilterBox.prototype._createSortHtml = function () {
        var html = '', sort = this.options.data.sort, order = this.options.data.order;
        $.each(this.options.sorts, function (i, item) {
            if (i != sort) {
                html += ZUtils.str.format('<span>{0}{1}</span>', item, i == '' ? '' : '<i></i>');
                return;
            }
            html += ZUtils.str.format('<span class="active order-{0}">{1}{2}</span>', order, item, i == '' ? '' : '<i></i>');
        });
        return ZUtils.str.format('<div class="sort-box">{0}</div>', html);
    };
    return FilterBox;
}());
var FilterDefaultOption = /** @class */ (function () {
    function FilterDefaultOption() {
    }
    return FilterDefaultOption;
}());
;
(function ($) {
    $.fn.filterbox = function (options) {
        return new FilterBox(this, options);
    };
})(jQuery);
