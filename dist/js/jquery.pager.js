var Pager = /** @class */ (function () {
    function Pager(element, option) {
        this.element = element;
        this.index = 0;
        this.option = $.extend({}, new PagerDefaultOption(), option);
        this.total = this.option.total;
        this.length = this.option.length;
        this.paginate(1);
        var instance = this;
        this.element.on("click", "li", function () {
            var page = instance._data[$(this).index()];
            if (page < 1) {
                return;
            }
            if (instance.option.paginate && instance.option.paginate.call(this, page, instance) == false) {
                return;
            }
            instance.paginate(page);
        });
    }
    Pager.prototype.paginate = function (page) {
        if (page === void 0) { page = this.index; }
        if (page < 1) {
            page = 1;
        }
        if (page > this.total) {
            page = this.total;
        }
        this.index = page;
        this.refresh();
    };
    Pager.prototype.previous = function () {
        if (this.index < 1) {
            return;
        }
        this.paginate(this.index - 1);
    };
    Pager.prototype.next = function () {
        if (this.index > this.total) {
            return;
        }
        this.paginate(this.index + 1);
    };
    Pager.prototype.change = function (index, total) {
        if (index === void 0) { index = 1; }
        this.index = typeof index == 'number' ? index : parseInt(index);
        if (total) {
            this.total = typeof total == 'number' ? total : parseInt(total);
        }
        this.refresh();
    };
    Pager.prototype.refresh = function () {
        this._initPage();
        this._addHtml();
    };
    Pager.prototype._initPage = function () {
        this._data = [];
        if (this.total < 2) {
            return;
        }
        this._data.push(1);
        var lastList = Math.floor(this.length / 2);
        var i = this.index - lastList;
        var length = this.index + lastList;
        if (i < 2) {
            i = 2;
            length = i + this.length;
        }
        if (length > this.total - 1) {
            length = this.total - 1;
            i = Math.max(2, length - this.length);
        }
        if (i > 2) {
            this._data.push(0);
        }
        for (; i <= length; i++) {
            this._data.push(i);
        }
        if (length < this.total - 1) {
            this._data.push(0);
        }
        this._data.push(this.total);
    };
    Pager.prototype._addHtml = function () {
        var html = '';
        var instance = this;
        $.each(this._data, function (i, item) {
            if (item == 0) {
                html += instance.option.label;
                return;
            }
            if (item == instance.index) {
                html += instance._replace(item, instance.option.current);
                return;
            }
            html += instance._replace(item, instance.option.page);
        });
        this.element.html(html);
    };
    Pager.prototype._replace = function (page, template) {
        return template.replace(new RegExp("{page}", 'g'), page + '');
    };
    return Pager;
}());
var PagerDefaultOption = /** @class */ (function () {
    function PagerDefaultOption() {
        this.total = 0;
        this.length = 8;
        this.page = '<li>{page}</li>';
        this.current = '<li class="active">{page}</li>';
        this.label = '<li>...</li>';
    }
    return PagerDefaultOption;
}());
;
(function ($) {
    $.fn.pager = function (option) {
        return new Pager(this, option);
    };
})(jQuery);
