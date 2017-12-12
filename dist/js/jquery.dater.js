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
Date.prototype.getRealMonth = function () {
    return this.getMonth() + 1;
};
Date.prototype.format = function (fmt) {
    if (fmt === void 0) { fmt = 'y年m月d日'; }
    var o = {
        "y+": this.getFullYear(),
        "m+": this.getRealMonth(),
        "d+": this.getDate(),
        "h+": this.getHours(),
        "i+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds() //毫秒 
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
var Dater = /** @class */ (function (_super) {
    __extends(Dater, _super);
    function Dater(element, option) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.options = $.extend({}, new DaterDefaultOption(), option);
        _this._initHtml();
        _this.daysElement = _this.element.find("tbody td");
        _this.titleElement = _this.element.find(".calendarTitle");
        _this._lastRowElement = _this.element.find("tbody tr").eq(5);
        _this._bindEvent();
        if (typeof _this.options.date == 'number') {
            _this.setTime(_this.options.date);
        }
        else {
            _this.setDate(_this.options.date);
        }
        return _this;
    }
    Dater.prototype.previousYear = function () {
        this.setDate(this._date.getFullYear() - 1, this._date.getRealMonth());
    };
    Dater.prototype.nextYear = function () {
        this.setDate(this._date.getFullYear() + 1, this._date.getRealMonth());
    };
    Dater.prototype.previousMonth = function () {
        this.setDate(this._date.getFullYear(), this._date.getMonth());
    };
    Dater.prototype.nextMonth = function () {
        this.setDate(this._date.getFullYear(), this._date.getRealMonth() + 1);
    };
    Dater.prototype.setDate = function (year, month) {
        if (typeof year == 'string') {
            year = new Date(year);
        }
        if (year instanceof Date) {
            month = year.getRealMonth();
            year = year.getFullYear();
        }
        this._date = new Date(year, month, 0);
        this._daysCount = this._date.getDate();
        this._date.setDate(1);
        if (false == this.trigger('change')) {
            return;
        }
        this.reader();
    };
    Dater.prototype.setTime = function (time) {
        this.setDate(new Date(time));
    };
    Dater.prototype.getDate = function () {
        return this._date;
    };
    Dater.prototype.getDateString = function () {
        return this._date.getFullYear() + '年' + (this._date.getMonth() + 1) + '月';
    };
    Dater.prototype._initHtml = function () {
        var html = '';
        for (var i = 0; i < 6; i++) {
            html += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        }
        this.element.append('<div><span class="previousMonth"></span><span class="calendarTitle"></span><span class="nextMonth"></span></div>' +
            '<table class="calendarTable"><thead><tr><td>日</td><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td><td>六</td></tr></thead>' +
            '<tbody>' + html + '</tbody></table>');
    };
    Dater.prototype.reader = function () {
        this.titleElement.text(this.getDateString());
        var first = this._date.getDay();
        var instance = this;
        this.forEach(function (index, ele) {
            if (index < first) {
                ele.text(' ');
                return;
            }
            var day = index - first + 1;
            if (day > instance._daysCount) {
                ele.text(' ');
                return;
            }
            ele.text(day);
        });
        if (first + this._daysCount > 35) {
            this._lastRowElement.show();
        }
        else {
            this._lastRowElement.hide();
        }
    };
    Dater.prototype._bindEvent = function () {
        var instance = this;
        this.daysElement.click(function () {
            var ele = $(this);
            var day = parseInt(ele.text());
            if (day > 0 && instance.hasEvent('click')) {
                var date = new Date(instance._date);
                date.setDate(day);
                instance.trigger('click', date, ele, instance.element);
            }
        });
        this.element.find(".previousMonth").click(function () {
            instance.previousMonth();
        });
        this.element.find(".nextMonth").click(function () {
            instance.nextMonth();
        });
    };
    Dater.prototype.forEach = function (callback) {
        var instance = this;
        this.daysElement.each(function (index, item) {
            return callback(index, $(item), instance.element);
        });
    };
    Dater.prototype.dayEach = function (callback) {
        var _this = this;
        var instance = this;
        this.daysElement.each(function (index, item) {
            var ele = $(_this);
            var day = parseInt(ele.text());
            if (day < 1) {
                return;
            }
            var date = new Date(instance._date);
            date.setDate(day);
            return callback(date, ele, instance.element);
        });
    };
    Dater.prototype.getDay = function (day) {
        if (day instanceof Date) {
            if (!this.isDate(day)) {
                return;
            }
            day = day.getDate();
        }
        if (day < 0 || day > this._daysCount) {
            return;
        }
        return this.daysElement.eq(this._date.getDay() + day - 1);
    };
    Dater.prototype.isDate = function (date) {
        if (date === void 0) { date = new Date(); }
        return this._date.getFullYear() == date.getFullYear() && this._date.getMonth() == date.getMonth();
    };
    /**
     * 日期改变事件
     * @param callback
     */
    Dater.prototype.change = function (callback) {
        return this.on('change', callback);
    };
    /**
     * 日期点击事件
     * @param callback
     */
    Dater.prototype.click = function (callback) {
        return this.on('change', callback);
    };
    return Dater;
}(Box));
var DaterDefaultOption = /** @class */ (function () {
    function DaterDefaultOption() {
        this.date = new Date();
    }
    return DaterDefaultOption;
}());
;
(function ($) {
    $.fn.dater = function (option) {
        return new Dater(this, option);
    };
})(jQuery);
