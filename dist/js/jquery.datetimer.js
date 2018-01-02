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
    return Eve;
}());
var Box = /** @class */ (function (_super) {
    __extends(Box, _super);
    function Box() {
        return _super !== null && _super.apply(this, arguments) || this;
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
}(Eve));
/*!
 * jquery.datetimer - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
/**
 * 获取真实的月份
 */
Date.prototype.getRealMonth = function () {
    return this.getMonth() + 1;
};
/**
 * 格式化日期
 */
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
/**
 * 已知问题当最大值最小值为DateTimer 时无法正确显示
 */
var DateTimer = /** @class */ (function (_super) {
    __extends(DateTimer, _super);
    function DateTimer(element, options) {
        var _this = _super.call(this) || this;
        _this.element = element;
        /**
         * 是否有时间
         */
        _this._hasTime = true;
        _this.options = $.extend({}, new DateTimerDefaultOptions(), options);
        if (typeof _this.options.min != 'object') {
            _this.options.min = _this._tD(_this.options.min);
        }
        if (typeof _this.options.max != 'object') {
            _this.options.max = _this._tD(_this.options.max);
        }
        if (_this.options.format.indexOf('h') < 0) {
            _this._hasTime = false;
        }
        if (_this.options.readonly) {
            _this.element.prop('readonly', true);
        }
        _this.createHtml();
        return _this;
    }
    /**
     * 获取设置的最小值
     */
    DateTimer.prototype._getMin = function () {
        var date = this._tD(this.options.min);
        if (!date) {
            return undefined;
        }
        if (!this._hasTime) {
            date.setHours(23, 59, 59, 99);
        }
        return date;
    };
    /**
     * 获取设置的最大值
     */
    DateTimer.prototype._getMax = function () {
        var date = this._tD(this.options.max);
        if (!date) {
            return undefined;
        }
        if (!this._hasTime) {
            date.setHours(0, 0, 0, 0);
        }
        return date;
    };
    /**
     * 初始化
     * @param time
     */
    DateTimer.prototype.init = function (time) {
        this.showDate(time);
        this.open();
        this._refreshTime();
    };
    /**
     * 创建元素
     */
    DateTimer.prototype.createHtml = function () {
        this.box = $('<div class="datetimer" data-type="datetimer"></div>');
        var lis = this._nLi(60, 0);
        var html = '<div class="header"><i class="fa fa-backward previousYear"></i><i class="fa fa-chevron-left previousMonth"></i><span></span><i class="fa fa-chevron-right nextMonth"></i><i class="fa fa-forward nextYear"></i></div><div class="body"><div class="month-grid"><ol><li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li></ol><ul>' +
            this._nLi(42, 0, false)
            + '</ul></div><div class="year-grid"><div class="list-group year"><div class="title">年</div><ul>' +
            this._nLi(this.options.maxYear + 1, this.options.minYear)
            + '</ul></div><div class="list-group month"><div class="title">月</div><ul>' +
            this._nLi(13, 1) +
            '</ul></div><i class="fa fa-close"></i></div>';
        if (this._hasTime) {
            html += '<div class="day-grid"><div class="list-group hour"><div class="title">小时</div><ul>' + this._nLi(24) +
                '</ul></div><div class="list-group minute"><div class="title">分钟</div><ul>' +
                lis +
                '</ul></div><div class="list-group second"><div class="title">秒钟</div><ul>' +
                lis +
                '</ul></div><i class="fa fa-close"></i></div>';
        }
        html += '</div>';
        if (this._hasTime) {
            html += '<div class="footer"><input type="text" class="hour" value="00">:<input type="text" class="minute" value="00">:<input type="text" class="second" value="00"><button>确定</button></div>';
        }
        this.box.html(html);
        $(document.body).append(this.box);
        this._yearBox = this.box.find(".body .year-grid .year ul");
        this._monthBox = this.box.find(".body .year-grid .month ul");
        this._yearGrid = this.box.find(".body .year-grid");
        if (this._hasTime) {
            this._dayGrid = this.box.find(".body .day-grid");
            this._hourBox = this.box.find(".body .day-grid .hour ul");
            this._minuteBox = this.box.find(".body .day-grid .minute ul");
            this._secondBox = this.box.find(".body .day-grid .second ul");
        }
        this._bindEvent();
    };
    /**
     * 格式化数字
     */
    DateTimer.prototype._iTs = function (i) {
        if (i < 10) {
            return '0' + i;
        }
        return i.toString();
    };
    /**
     * 生成指定数目的li
     */
    DateTimer.prototype._nLi = function (length, i, hasN) {
        if (i === void 0) { i = 0; }
        if (hasN === void 0) { hasN = true; }
        var html = '';
        for (; i < length; i++) {
            if (!hasN) {
                html += '<li></li>';
                continue;
            }
            html += '<li>' + this._iTs(i) + '</li>';
        }
        return html;
    };
    /**
     * 显示
     */
    DateTimer.prototype.open = function () {
        if (this.box.css('position') == 'fixed') {
            // 清除页面上的css
            this.box.attr('style', '').show();
            return;
        }
        this.showPosition();
    };
    /**
     * 获取当前设置的时间
     */
    DateTimer.prototype.getCurrentDate = function () {
        if (this._currentDate) {
            return this._currentDate;
        }
        return this._currentDate = this._tD(this.box.data("date"));
    };
    /**
     * 获取当前时间
     */
    DateTimer.prototype.getDateOrNull = function () {
        if (this._currentDate) {
            return this._currentDate;
        }
        return undefined;
    };
    /**
     * 上一年
     */
    DateTimer.prototype.previousYear = function () {
        this._changeYear(this.getCurrentDate().getFullYear() - 1);
    };
    /**
     * 下一年
     */
    DateTimer.prototype.nextYear = function () {
        this._changeYear(this.getCurrentDate().getFullYear() + 1);
    };
    /**
     * 上月
     */
    DateTimer.prototype.previousMonth = function () {
        this._changeMonth(this.getCurrentDate().getMonth());
    };
    /**
     * 下月
     */
    DateTimer.prototype.nextMonth = function () {
        this._changeMonth(this.getCurrentDate().getMonth() + 2);
    };
    /**
     * 显示日期
     * @param year
     * @param month
     */
    DateTimer.prototype.showDate = function (year, month) {
        this._currentDate = this._tD(year, month);
        if (!this._hasTime) {
            this._currentDate.setHours(12, 0, 0, 0);
        }
        this.box.data('date', this._currentDate);
        this._refreshDay();
    };
    /**
     * 针对最大值最小值动态获取的情况重新刷新年选择
     */
    DateTimer.prototype._refreshYearList = function () {
        if (this.options.min instanceof DateTimer && this.options.max instanceof DateTimer) {
            this._yearBox.html(this._nLi(this._getMax().getFullYear() + 1, this._getMin().getFullYear()));
        }
    };
    /**
     * 刷新年月列表
     */
    DateTimer.prototype._refreshYearGrid = function () {
        this._refreshYearList();
        this._changeListGroup(this._yearBox, this._currentDate.getFullYear() - this._getMin().getFullYear());
        this._changeListGroup(this._monthBox, this._currentDate.getMonth());
    };
    /**
     * 刷新时间列表
     */
    DateTimer.prototype._refreshDayGrid = function () {
        this._changeListGroup(this._hourBox, this._currentDate.getHours());
        this._changeListGroup(this._minuteBox, this._currentDate.getMinutes());
        this._changeListGroup(this._secondBox, this._currentDate.getSeconds());
    };
    /**
     * 改变list-group 中的ul
     */
    DateTimer.prototype._changeListGroup = function (box, index) {
        var li = box.find("li").eq(index);
        li.addClass("active").siblings().removeClass("active");
        box.scrollTop(li.offset().top - box.offset().top + box.scrollTop() - box.height() / 2);
    };
    /**
     * 改变年
     * @param y
     */
    DateTimer.prototype._changeYear = function (y) {
        this._currentDate.setFullYear(y);
        this._refreshDay();
        this._changeListGroup(this._yearBox, y - this.options.minYear);
    };
    /**
     * 改变月
     * @param m
     */
    DateTimer.prototype._changeMonth = function (m) {
        this._currentDate.setMonth(m - 1);
        this._refreshDay();
        this._changeListGroup(this._yearBox, this._currentDate.getFullYear() - this.options.minYear);
        this._changeListGroup(this._monthBox, this._currentDate.getMonth());
    };
    /**
     * 改变时
     * @param h
     */
    DateTimer.prototype._changeHour = function (h) {
        this._currentDate.setHours(h);
        this.box.find(".footer .hour").val(this._iTs(h));
        this._changeListGroup(this._hourBox, h);
    };
    /**
     * 改变分
     * @param i
     */
    DateTimer.prototype._changeMinute = function (i) {
        this._currentDate.setMinutes(i);
        this.box.find(".footer .minute").val(this._iTs(i));
        this._changeListGroup(this._minuteBox, i);
    };
    /**
     * 改变秒
     * @param s
     */
    DateTimer.prototype._changeSecond = function (s) {
        this._currentDate.setSeconds(s);
        this.box.find(".footer .second").val(this._iTs(s));
        this._changeListGroup(this._secondBox, s);
    };
    /**
     * 刷新日
     */
    DateTimer.prototype._refreshDay = function () {
        this.box.find(".header span").text(this._currentDate.format(this.options.title));
        var days = this._mLi(this._currentDate.getFullYear(), this._currentDate.getRealMonth());
        var dayLi = this.box.find(".body .month-grid ul li");
        dayLi.removeClass("active").removeClass("disable");
        var instance = this;
        var currentDay = this._currentDate.getDate();
        days.forEach(function (v, i) {
            var li = dayLi.eq(i).text(instance._iTs(v));
            if (v - 10 > i || v + 10 < i) {
                li.addClass("disable");
            }
            else if (v == currentDay) {
                li.addClass("active");
            }
        });
    };
    /**
     * 刷新时间
     */
    DateTimer.prototype._refreshTime = function () {
        if (!this._hasTime) {
            return;
        }
        this._changeHour(this.getCurrentDate().getHours());
        this._changeMinute(this.getCurrentDate().getMinutes());
        this._changeSecond(this.getCurrentDate().getSeconds());
    };
    /**
     * 返回天的列表
     * @param y
     * @param m
     */
    DateTimer.prototype._mLi = function (y, m) {
        var days = [];
        var _a = this._mD(y, m), f = _a[0], c = _a[1];
        var i;
        if (f > 0) {
            var yc = this._yD(y, m - 1);
            for (i = yc - f + 2; i <= yc; i++) {
                days.push(i);
            }
        }
        for (i = 1; i <= c; i++) {
            days.push(i);
        }
        if (f + c < 43) {
            var l = 42 - f - c + 1;
            for (i = 1; i <= l; i++) {
                days.push(i);
            }
        }
        return days;
    };
    /**
     * 绑定事件
     */
    DateTimer.prototype._bindEvent = function () {
        var instance = this;
        this.box.find('.month-grid li').click(function () {
            instance._clickDay($(this));
        });
        this.box.find(".previousYear").click(function () {
            instance.previousYear();
        });
        this.box.find(".previousMonth").click(function () {
            instance.previousMonth();
        });
        this.box.find(".nextMonth").click(function () {
            instance.nextMonth();
        });
        this.box.find(".nextYear").click(function () {
            instance.nextYear();
        });
        this.box.find(".header span").click(function () {
            if (!instance._yearGrid.is(":hidden")) {
                instance._yearGrid.hide();
                return;
            }
            if (instance._hasTime) {
                instance._dayGrid.hide();
            }
            instance._yearGrid.show();
            instance._refreshYearGrid();
        });
        this._yearBox.find("li").click(function () {
            instance._changeYear(parseInt($(this).text()));
        });
        this._monthBox.find("li").click(function () {
            instance._changeMonth(parseInt($(this).text()));
        });
        // 关闭面板
        this._yearGrid.find('.fa-close').click(function () {
            instance._yearGrid.hide();
        });
        if (this._hasTime) {
            this.box.find(".footer button").click(function () {
                instance.output(true);
            });
            this.box.find(".footer input").click(function () {
                if (instance._dayGrid.is(":hidden")) {
                    instance._yearGrid.hide();
                    instance._dayGrid.show();
                    instance._refreshDayGrid();
                    return;
                }
                instance._dayGrid.hide();
            });
            this._hourBox.find("li").click(function () {
                instance._changeHour(parseInt($(this).text()));
            });
            this._minuteBox.find("li").click(function () {
                instance._changeMinute(parseInt($(this).text()));
            });
            this._secondBox.find("li").click(function () {
                instance._changeSecond(parseInt($(this).text()));
            });
            this._dayGrid.find('.fa-close').click(function () {
                instance._dayGrid.hide();
            });
        }
        /** 实现隐藏 */
        this.box.click(function (e) {
            e.stopPropagation();
        });
        if (this.element) {
            this.element.click(function (e) {
                e.stopPropagation();
                $('[data-type=datetimer]').hide();
                instance.init($(this).val());
            });
        }
        $(document).click(function () {
            instance.box.hide();
        });
        if (typeof this.options.min == 'object' && this.options.min instanceof DateTimer) {
            this.options.min.done(function () {
                instance._currentDate && !instance.checkDate(instance._currentDate) && instance.clear();
            });
        }
        if (typeof this.options.max == 'object' && this.options.max instanceof DateTimer) {
            this.options.max.done(function () {
                instance._currentDate && !instance.checkDate(instance._currentDate) && instance.clear();
            });
        }
        if (!$.fn.swipe) {
            return;
        }
        this.box.swipe({
            swipeLeft: function () {
                instance.nextMonth();
            },
            swipeRight: function () {
                instance.previousMonth();
            }
        });
    };
    /**
     * 点击日期
     * @param element
     */
    DateTimer.prototype._clickDay = function (element) {
        var day = parseInt(element.text());
        var date = new Date(this._currentDate);
        if (!element.hasClass("disable")) {
            date.setDate(day);
        }
        else if (day > element.index()) {
            /**点击上月日期 */
            date.setMonth(date.getMonth() - 1);
            date.setDate(day);
        }
        else {
            /**
             * 点击下月日期
             */
            date.setMonth(date.getMonth() + 1);
            date.setDate(day);
        }
        if (this.trigger('click', date, element) == false) {
            return;
        }
        if (!this.checkDate(date)) {
            // 超出范围
            this.trigger('error', date);
            return;
        }
        if (date.getMonth() == this._currentDate.getMonth()) {
            element.addClass("active").siblings().removeClass("active");
            this._currentDate = date;
        }
        else {
            this.showDate(date);
        }
        this.output();
    };
    /**
     * 获取月中最后一天
     * @param y
     * @param m
     */
    DateTimer.prototype._yD = function (y, m) {
        var date = new Date(y, m, 0);
        return date.getDate();
    };
    /**
     * 获取第一天和最后一天
     * @param y
     * @param m
     */
    DateTimer.prototype._mD = function (y, m) {
        var date = new Date(y, m, 0);
        var count = date.getDate();
        date.setDate(1);
        return [date.getDay(), count];
    };
    /**
     * 获取当前时间
     */
    DateTimer.prototype.val = function () {
        return this.getCurrentDate().format(this.options.format);
    };
    /**
     * 验证Date
     * @param date
     */
    DateTimer.prototype.checkDate = function (date) {
        var min = this._getMin();
        if (min && date <= min) {
            return false;
        }
        var max = this._getMax();
        return !max || date < max;
    };
    /**
     * 清除
     */
    DateTimer.prototype.clear = function () {
        this._currentDate = undefined;
        this.element.val('');
    };
    /**
     * 输出时间
     * @param isHide
     */
    DateTimer.prototype.output = function (isHide) {
        if (isHide === void 0) { isHide = false; }
        if (!this.checkDate(this.getCurrentDate())) {
            this.trigger('error', this.getCurrentDate());
            return;
        }
        if (false == this.trigger('done')) {
            return;
        }
        this.element.val(this.val());
        if (!this._hasTime || isHide) {
            this.box.hide();
        }
    };
    /**
     * 转化时间
     */
    DateTimer.prototype._tD = function (year, month) {
        if (!year) {
            return new Date();
        }
        if (typeof year == 'object') {
            return year instanceof DateTimer ? year.getDateOrNull() : year;
        }
        if (typeof year == 'number'
            && typeof month == 'number') {
            return new Date(year, month - 1, 1);
        }
        // 解决safari 无法识别 - 
        if (typeof year == 'string' && year.indexOf('-') > 0) {
            year.replace('-', '/');
        }
        var date = new Date(year);
        if (isNaN(date.getTime())) {
            return new Date();
        }
        return date;
    };
    DateTimer.prototype.done = function (callback) {
        return this.on('done', callback);
    };
    return DateTimer;
}(Box));
var DateTimerDefaultOptions = /** @class */ (function () {
    function DateTimerDefaultOptions() {
        this.format = "y-m-d h:i:s"; //日期格式
        this.min = "1900/01/01 00:00:00"; //最小日期    safari 下自动识别成日期格式 只认 /
        this.max = "2099/12/31 23:59:59"; //最大日期
        this.title = "y年m月"; // 标题栏的日期格式
        this.readonly = false;
        this.minYear = 1900; // 做标签用
        this.maxYear = 2099;
    }
    return DateTimerDefaultOptions;
}());
;
(function ($) {
    $.fn.datetimer = function (options) {
        return new DateTimer(this, options);
    };
})(jQuery);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LnRzIiwiYm94LnRzIiwianF1ZXJ5LmRhdGV0aW1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7SUFBQTtJQW1CQSxDQUFBO0lBaEJBLGdCQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsUUFBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsc0JBQUEsR0FBQSxVQUFBLEtBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHFCQUFBLEdBQUEsVUFBQSxLQUFBO1FBQUEsY0FBQTthQUFBLFVBQUEsRUFBQSxxQkFBQSxFQUFBLElBQUE7WUFBQSw2QkFBQTs7UUFDQSxJQUFBLFNBQUEsR0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLFlBQUEsSUFBQSxTQUFBLElBQUEsR0FBQTs7SUFDQSxDQUFBO0lBQ0EsVUFBQTtBQUFBLENBbkJBLEFBbUJBLElBQUE7QUNuQkE7SUFBQSx1QkFBQTtJQUFBOztJQWdDQSxDQUFBO0lBMUJBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx5QkFBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQTs7OztPQUlBO0lBQ0EsV0FBQSxHQUFBLFVBQUEsVUFBQSxFQUFBLE9BQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxPQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsVUFBQTtBQUFBLENBaENBLEFBZ0NBLENBaENBLEdBQUEsR0FnQ0E7QUNoQ0E7Ozs7OztHQU1BO0FBRUE7O0dBRUE7QUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsR0FBQTtJQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsQ0FBQSxDQUFBO0FBQ0E7O0dBRUE7QUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLEdBQUE7SUFBQSxvQkFBQSxFQUFBLGNBQUE7SUFDQSxJQUFBLENBQUEsR0FBQTtRQUNBLElBQUEsRUFBQSxJQUFBLENBQUEsV0FBQSxFQUFBO1FBQ0EsSUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUE7UUFDQSxJQUFBLEVBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTtRQUNBLElBQUEsRUFBQSxJQUFBLENBQUEsUUFBQSxFQUFBO1FBQ0EsSUFBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLEVBQUE7UUFDQSxJQUFBLEVBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQTtRQUNBLElBQUEsRUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLEdBQUEsRUFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsS0FBQTtLQUNBLENBQUE7SUFDQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsR0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxDQUFBLENBQUE7QUFFQTs7R0FFQTtBQUNBO0lBQUEsNkJBQUE7SUFDQSxtQkFDQSxPQUFBLEVBQ0EsT0FBQTtRQUZBLFlBSUEsaUJBQUEsU0FlQTtRQWxCQSxhQUFBLEdBQUEsT0FBQSxDQUFBO1FBbURBOztXQUVBO1FBQ0EsY0FBQSxHQUFBLElBQUEsQ0FBQTtRQWxEQSxLQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsdUJBQUEsRUFBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxLQUFBLENBQUEsVUFBQSxFQUFBLENBQUE7O0lBQ0EsQ0FBQTtJQTBDQTs7T0FFQTtJQUNBLDJCQUFBLEdBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSwyQkFBQSxHQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLHdCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7T0FFQTtJQUNBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSxxREFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLG9WQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQTtjQUNBLCtGQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUE7Y0FDQSx5RUFBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtZQUNBLDhDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxvRkFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO2dCQUNBLDJFQUFBO2dCQUNBLEdBQUE7Z0JBQ0EsMkVBQUE7Z0JBQ0EsR0FBQTtnQkFDQSw4Q0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxRQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxzTEFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBRUEsSUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsMEJBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSx3QkFBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHdCQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLElBQUE7UUFBQSxrQkFBQSxFQUFBLEtBQUE7UUFBQSxxQkFBQSxFQUFBLFdBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxHQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLElBQUEsV0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsT0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSx3QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFlBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0Esa0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGdDQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7T0FFQTtJQUNBLDRCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7T0FFQTtJQUNBLGlDQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0EsNkJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLFFBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOzs7O09BSUE7SUFDQSw0QkFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBLEtBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsUUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxvQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLFlBQUEsU0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxZQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBQ0E7O09BRUE7SUFDQSxvQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxXQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0EsbUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLG9DQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsS0FBQTtRQUNBLElBQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7UUFDQSxHQUFBLENBQUEsU0FBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLENBQUEsU0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOzs7T0FHQTtJQUNBLCtCQUFBLEdBQUEsVUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOzs7T0FHQTtJQUNBLGdDQUFBLEdBQUEsVUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFdBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7O09BR0E7SUFDQSwrQkFBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsZUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7OztPQUdBO0lBQ0EsaUNBQUEsR0FBQSxVQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7O09BR0E7SUFDQSxpQ0FBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0EsK0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsV0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO1FBQ0EsS0FBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxXQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLEVBQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1lBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLEVBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7O09BRUE7SUFDQSxnQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7Ozs7T0FJQTtJQUNBLHdCQUFBLEdBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsbUJBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEdBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsR0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtZQUNBLEdBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7O09BRUE7SUFDQSw4QkFBQSxHQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUVBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLFNBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUVBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLFNBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxnQkFBQSxFQUFBLENBQUE7UUFFQSxDQUFBLENBQUEsQ0FBQTtRQUVBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxZQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE9BQUE7UUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsZUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO2dCQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtvQkFDQSxRQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO29CQUNBLFFBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7b0JBQ0EsUUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO29CQUNBLE1BQUEsQ0FBQTtnQkFDQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLGFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxhQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsV0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUVBLENBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxJQUFBLFFBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsWUFBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxZQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxJQUFBLFFBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsWUFBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxZQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFFQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFNBQUEsRUFBQTtnQkFDQSxRQUFBLENBQUEsU0FBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsVUFBQSxFQUFBO2dCQUNBLFFBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7U0FDQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsNkJBQUEsR0FBQSxVQUFBLE9BQUE7UUFDQSxJQUFBLEdBQUEsR0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxZQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0E7O2VBRUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsQ0FBQSxJQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7Ozs7T0FJQTtJQUNBLHVCQUFBLEdBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOzs7O09BSUE7SUFDQSx1QkFBQSxHQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7T0FFQTtJQUNBLHVCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLDZCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsSUFBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHlCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLDBCQUFBLEdBQUEsVUFBQSxNQUFBO1FBQUEsdUJBQUEsRUFBQSxjQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSx1QkFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBLEtBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsWUFBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUE7ZUFDQSxPQUFBLEtBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLG1CQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsUUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsd0JBQUEsR0FBQSxVQUFBLFFBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZ0JBQUE7QUFBQSxDQWptQkEsQUFpbUJBLENBam1CQSxHQUFBLEdBaW1CQTtBQWVBO0lBQUE7UUFDQSxXQUFBLEdBQUEsYUFBQSxDQUFBLENBQUEsTUFBQTtRQUNBLFFBQUEsR0FBQSxxQkFBQSxDQUFBLENBQUEsZ0NBQUE7UUFDQSxRQUFBLEdBQUEscUJBQUEsQ0FBQSxDQUFBLE1BQUE7UUFDQSxVQUFBLEdBQUEsTUFBQSxDQUFBLENBQUEsV0FBQTtRQUNBLGFBQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxZQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsT0FBQTtRQUNBLFlBQUEsR0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBQUEsOEJBQUE7QUFBQSxDQVJBLEFBUUEsSUFBQTtBQUVBLENBQUE7QUFBQSxDQUFBLFVBQUEsQ0FBQTtJQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsT0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBLENBQUE7QUFDQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSIsImZpbGUiOiJqcXVlcnkuZGF0ZXRpbWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYWJzdHJhY3QgY2xhc3MgRXZlIHtcclxuICAgIHB1YmxpYyBvcHRpb25zOiBhbnk7XHJcblxyXG4gICAgcHVibGljIG9uKGV2ZW50OiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IHRoaXMge1xyXG4gICAgICAgIHRoaXMub3B0aW9uc1snb24nICsgZXZlbnRdID0gY2FsbGJhY2s7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhhc0V2ZW50KGV2ZW50OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmhhc093blByb3BlcnR5KCdvbicgKyBldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRyaWdnZXIoZXZlbnQ6IHN0cmluZywgLi4uIGFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgbGV0IHJlYWxFdmVudCA9ICdvbicgKyBldmVudDtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzRXZlbnQoZXZlbnQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1tyZWFsRXZlbnRdLmNhbGwodGhpcywgLi4uYXJncyk7XHJcbiAgICB9XHJcbn0iLCJhYnN0cmFjdCBjbGFzcyBCb3ggZXh0ZW5kcyBFdmUge1xyXG5cclxuICAgIHB1YmxpYyBlbGVtZW50OiBKUXVlcnk7XHJcblxyXG4gICAgcHVibGljIGJveDogSlF1ZXJ5O1xyXG5cclxuICAgIHByb3RlY3RlZCBzaG93UG9zaXRpb24oKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbigpO1xyXG4gICAgICAgIHRoaXMuYm94LnNob3coKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2V0UG9zaXRpb24oKTogdGhpcyB7XHJcbiAgICAgICAgbGV0IG9mZnNldCA9IHRoaXMuZWxlbWVudC5vZmZzZXQoKTtcclxuICAgICAgICBsZXQgeCA9IG9mZnNldC5sZWZ0IC0gJCh3aW5kb3cpLnNjcm9sbExlZnQoKTtcclxuICAgICAgICBsZXQgeSA9IG9mZnNldC50b3AgKyB0aGlzLmVsZW1lbnQub3V0ZXJIZWlnaHQoKSAtICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgICAgICB0aGlzLmJveC5jc3Moe2xlZnQ6IHggKyBcInB4XCIsIHRvcDogeSArIFwicHhcIn0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagueaNruWPr+iDveaYr+ebuOWvueWAvOiOt+WPlue7neWvueWAvFxyXG4gICAgICogQHBhcmFtIGFic2VydmFibGUgXHJcbiAgICAgKiBAcGFyYW0gcmVsdGl2ZSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXRSZWFsKGFic2VydmFibGU6IG51bWJlciwgcmVsdGl2ZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAocmVsdGl2ZSA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlbHRpdmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhYnNlcnZhYmxlICogcmVsdGl2ZTtcclxuICAgIH1cclxufSIsIi8qIVxyXG4gKiBqcXVlcnkuZGF0ZXRpbWVyIC0gaHR0cHM6Ly9naXRodWIuY29tL3p4NjQ4MzgzMDc5L1pvRHJlYW0uVUlcclxuICogVmVyc2lvbiAtIDEuMFxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgLSBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxNyBab0RyZWFtXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIOiOt+WPluecn+WunueahOaciOS7vVxyXG4gKi9cclxuRGF0ZS5wcm90b3R5cGUuZ2V0UmVhbE1vbnRoID0gZnVuY3Rpb24oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldE1vbnRoKCkgKyAxO1xyXG59O1xyXG4vKipcclxuICog5qC85byP5YyW5pel5pyfXHJcbiAqL1xyXG5EYXRlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbihmbXQ6IHN0cmluZyA9ICd55bm0beaciGTml6UnKTogc3RyaW5nIHtcclxuICAgIGxldCBvID0ge1xyXG4gICAgICAgIFwieStcIjogdGhpcy5nZXRGdWxsWWVhcigpLFxyXG4gICAgICAgIFwibStcIjogdGhpcy5nZXRSZWFsTW9udGgoKSwgLy/mnIjku70gXHJcbiAgICAgICAgXCJkK1wiOiB0aGlzLmdldERhdGUoKSwgLy/ml6UgXHJcbiAgICAgICAgXCJoK1wiOiB0aGlzLmdldEhvdXJzKCksIC8v5bCP5pe2IFxyXG4gICAgICAgIFwiaStcIjogdGhpcy5nZXRNaW51dGVzKCksIC8v5YiGIFxyXG4gICAgICAgIFwicytcIjogdGhpcy5nZXRTZWNvbmRzKCksIC8v56eSIFxyXG4gICAgICAgIFwicStcIjogTWF0aC5mbG9vcigodGhpcy5nZXRNb250aCgpICsgMykgLyAzKSwgLy/lraPluqZcclxuICAgICAgICBcIlNcIjogdGhpcy5nZXRNaWxsaXNlY29uZHMoKSAvL+avq+enkiBcclxuICAgIH07XHJcbiAgICBmb3IgKGxldCBrIGluIG8pIHtcclxuICAgICAgICBpZiAobmV3IFJlZ0V4cChcIihcIiArIGsgKyBcIilcIikudGVzdChmbXQpKSB7XHJcbiAgICAgICAgICAgIGZtdCA9IGZtdC5yZXBsYWNlKFJlZ0V4cC4kMSwgKFJlZ0V4cC4kMS5sZW5ndGggPT0gMSkgPyAob1trXSkgOiAoKFwiMDBcIiArIG9ba10pLnN1YnN0cigoXCJcIiArIG9ba10pLmxlbmd0aCkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZm10O1xyXG59XHJcblxyXG4vKipcclxuICog5bey55+l6Zeu6aKY5b2T5pyA5aSn5YC85pyA5bCP5YC85Li6RGF0ZVRpbWVyIOaXtuaXoOazleato+ehruaYvuekulxyXG4gKi9cclxuY2xhc3MgRGF0ZVRpbWVyIGV4dGVuZHMgQm94IHtcclxuICAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICAgcHVibGljIGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICAgb3B0aW9ucz86IERhdGVUaW1lck9wdGlvbnNcclxuICAgICApIHtcclxuICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIG5ldyBEYXRlVGltZXJEZWZhdWx0T3B0aW9ucygpLCBvcHRpb25zKTtcclxuICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMubWluICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5taW4gPSB0aGlzLl90RCh0aGlzLm9wdGlvbnMubWluKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5tYXggIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm1heCA9IHRoaXMuX3REKHRoaXMub3B0aW9ucy5tYXgpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZm9ybWF0LmluZGV4T2YoJ2gnKSA8IDApIHtcclxuICAgICAgICAgICAgIHRoaXMuX2hhc1RpbWUgPSBmYWxzZTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJlYWRvbmx5KSB7XHJcbiAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucHJvcCgncmVhZG9ubHknLCB0cnVlKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICB0aGlzLmNyZWF0ZUh0bWwoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3B0aW9uczogRGF0ZVRpbWVyT3B0aW9ucztcclxuXHJcbiAgICBwdWJsaWMgYm94OiBKUXVlcnk7XHJcbiAgICAvKipcclxuICAgICAqIOW5tOaciOmAieaLqemdouadv1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF95ZWFyR3JpZDogSlF1ZXJ5O1xyXG4gICAgLyoqXHJcbiAgICAgKiDml7bpl7TpgInmi6npnaLmnb9cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZGF5R3JpZDogSlF1ZXJ5O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlubTpgInmi6nliJfooahcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfeWVhckJveDogSlF1ZXJ5O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmnIjku73pgInmi6nliJfooahcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfbW9udGhCb3g6IEpRdWVyeTtcclxuICAgIC8qKlxyXG4gICAgICog5bCP5pe26YCJ5oup5YiX6KGoXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2hvdXJCb3g6IEpRdWVyeTtcclxuICAgIC8qKlxyXG4gICAgICog5YiG6ZKf6YCJ5oup5YiX6KGoXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX21pbnV0ZUJveDogSlF1ZXJ5O1xyXG4gICAgLyoqXHJcbiAgICAgKiDnp5LpgInmi6nliJfooahcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2Vjb25kQm94OiBKUXVlcnk7XHJcbiAgICAvKipcclxuICAgICAqIOaYr+WQpuacieaXtumXtFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9oYXNUaW1lOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOW9k+WJjeaXpeacn+aXtumXtFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9jdXJyZW50RGF0ZTogRGF0ZTtcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6K6+572u55qE5pyA5bCP5YC8XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2dldE1pbigpOiBEYXRlIHtcclxuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuX3REKHRoaXMub3B0aW9ucy5taW4pO1xyXG4gICAgICAgIGlmICghZGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX2hhc1RpbWUpIHtcclxuICAgICAgICAgICAgZGF0ZS5zZXRIb3VycygyMywgNTksIDU5LCA5OSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6K6+572u55qE5pyA5aSn5YC8XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2dldE1heCgpOiBEYXRlIHtcclxuICAgICAgICBsZXQgZGF0ZSA9IHRoaXMuX3REKHRoaXMub3B0aW9ucy5tYXgpO1xyXG4gICAgICAgIGlmICghZGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX2hhc1RpbWUpIHtcclxuICAgICAgICAgICAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJ3lp4vljJZcclxuICAgICAqIEBwYXJhbSB0aW1lIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaW5pdCh0aW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnNob3dEYXRlKHRpbWUpO1xyXG4gICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hUaW1lKCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuWFg+e0oFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY3JlYXRlSHRtbCgpIHtcclxuICAgICAgICB0aGlzLmJveCA9ICQoJzxkaXYgY2xhc3M9XCJkYXRldGltZXJcIiBkYXRhLXR5cGU9XCJkYXRldGltZXJcIj48L2Rpdj4nKTtcclxuICAgICAgICBsZXQgbGlzID0gdGhpcy5fbkxpKDYwLCAwKTtcclxuICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiaGVhZGVyXCI+PGkgY2xhc3M9XCJmYSBmYS1iYWNrd2FyZCBwcmV2aW91c1llYXJcIj48L2k+PGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLWxlZnQgcHJldmlvdXNNb250aFwiPjwvaT48c3Bhbj48L3NwYW4+PGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLXJpZ2h0IG5leHRNb250aFwiPjwvaT48aSBjbGFzcz1cImZhIGZhLWZvcndhcmQgbmV4dFllYXJcIj48L2k+PC9kaXY+PGRpdiBjbGFzcz1cImJvZHlcIj48ZGl2IGNsYXNzPVwibW9udGgtZ3JpZFwiPjxvbD48bGk+5pelPC9saT48bGk+5LiAPC9saT48bGk+5LqMPC9saT48bGk+5LiJPC9saT48bGk+5ZubPC9saT48bGk+5LqUPC9saT48bGk+5YWtPC9saT48L29sPjx1bD4nK1xyXG4gICAgICAgIHRoaXMuX25MaSg0MiwgMCwgZmFsc2UpIFxyXG4gICAgICAgICsnPC91bD48L2Rpdj48ZGl2IGNsYXNzPVwieWVhci1ncmlkXCI+PGRpdiBjbGFzcz1cImxpc3QtZ3JvdXAgeWVhclwiPjxkaXYgY2xhc3M9XCJ0aXRsZVwiPuW5tDwvZGl2Pjx1bD4nK1xyXG4gICAgICAgIHRoaXMuX25MaSh0aGlzLm9wdGlvbnMubWF4WWVhciArIDEsIHRoaXMub3B0aW9ucy5taW5ZZWFyKVxyXG4gICAgICAgICsnPC91bD48L2Rpdj48ZGl2IGNsYXNzPVwibGlzdC1ncm91cCBtb250aFwiPjxkaXYgY2xhc3M9XCJ0aXRsZVwiPuaciDwvZGl2Pjx1bD4nKyBcclxuICAgICAgICB0aGlzLl9uTGkoMTMsIDEpICtcclxuICAgICAgICAnPC91bD48L2Rpdj48aSBjbGFzcz1cImZhIGZhLWNsb3NlXCI+PC9pPjwvZGl2Pic7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc1RpbWUpIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImRheS1ncmlkXCI+PGRpdiBjbGFzcz1cImxpc3QtZ3JvdXAgaG91clwiPjxkaXYgY2xhc3M9XCJ0aXRsZVwiPuWwj+aXtjwvZGl2Pjx1bD4nKyB0aGlzLl9uTGkoMjQpICtcclxuICAgICAgICAgICAgJzwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cImxpc3QtZ3JvdXAgbWludXRlXCI+PGRpdiBjbGFzcz1cInRpdGxlXCI+5YiG6ZKfPC9kaXY+PHVsPicrIFxyXG4gICAgICAgICAgICBsaXMgK1xyXG4gICAgICAgICAgICAnPC91bD48L2Rpdj48ZGl2IGNsYXNzPVwibGlzdC1ncm91cCBzZWNvbmRcIj48ZGl2IGNsYXNzPVwidGl0bGVcIj7np5Lpkp88L2Rpdj48dWw+JytcclxuICAgICAgICAgICAgbGlzICtcclxuICAgICAgICAgICAgJzwvdWw+PC9kaXY+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZVwiPjwvaT48L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBodG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgICAgIGlmICh0aGlzLl9oYXNUaW1lKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJmb290ZXJcIj48aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImhvdXJcIiB2YWx1ZT1cIjAwXCI+OjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwibWludXRlXCIgdmFsdWU9XCIwMFwiPjo8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInNlY29uZFwiIHZhbHVlPVwiMDBcIj48YnV0dG9uPuehruWumjwvYnV0dG9uPjwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94Lmh0bWwoaHRtbCk7XHJcbiAgICAgICAgJChkb2N1bWVudC5ib2R5KS5hcHBlbmQodGhpcy5ib3gpO1xyXG5cclxuICAgICAgICB0aGlzLl95ZWFyQm94ID0gdGhpcy5ib3guZmluZChcIi5ib2R5IC55ZWFyLWdyaWQgLnllYXIgdWxcIik7XHJcbiAgICAgICAgdGhpcy5fbW9udGhCb3ggPSB0aGlzLmJveC5maW5kKFwiLmJvZHkgLnllYXItZ3JpZCAubW9udGggdWxcIik7XHJcbiAgICAgICAgdGhpcy5feWVhckdyaWQgPSB0aGlzLmJveC5maW5kKFwiLmJvZHkgLnllYXItZ3JpZFwiKTtcclxuICAgICAgICBpZiAodGhpcy5faGFzVGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXlHcmlkID0gdGhpcy5ib3guZmluZChcIi5ib2R5IC5kYXktZ3JpZFwiKTtcclxuICAgICAgICAgICAgdGhpcy5faG91ckJveCA9IHRoaXMuYm94LmZpbmQoXCIuYm9keSAuZGF5LWdyaWQgLmhvdXIgdWxcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX21pbnV0ZUJveCA9IHRoaXMuYm94LmZpbmQoXCIuYm9keSAuZGF5LWdyaWQgLm1pbnV0ZSB1bFwiKTtcclxuICAgICAgICAgICAgdGhpcy5fc2Vjb25kQm94ID0gdGhpcy5ib3guZmluZChcIi5ib2R5IC5kYXktZ3JpZCAuc2Vjb25kIHVsXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9iaW5kRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAgLyoqXHJcbiAgICAgICog5qC85byP5YyW5pWw5a2XXHJcbiAgICAgICovXHJcbiAgICBwcml2YXRlIF9pVHMoaTogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoaSA8IDEwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnMCcgKyBpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaS50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiDnlJ/miJDmjIflrprmlbDnm67nmoRsaVxyXG4gICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfbkxpKGxlbmd0aDogbnVtYmVyLCBpOiBudW1iZXIgPSAwLCBoYXNOID0gdHJ1ZSk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICBmb3IoOyBpIDwgbGVuZ3RoOyBpICsrKSB7XHJcbiAgICAgICAgICAgIGlmICghaGFzTikge1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGxpPjwvbGk+JztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxsaT4nICsgdGhpcy5faVRzKGkpICsgJzwvbGk+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGh0bWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLpcclxuICAgICAqL1xyXG4gICAgcHVibGljIG9wZW4oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYm94LmNzcygncG9zaXRpb24nKSA9PSAnZml4ZWQnKSB7XHJcbiAgICAgICAgICAgIC8vIOa4hemZpOmhtemdouS4iueahGNzc1xyXG4gICAgICAgICAgICB0aGlzLmJveC5hdHRyKCdzdHlsZScsICcnKS5zaG93KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG93UG9zaXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluW9k+WJjeiuvue9rueahOaXtumXtFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Q3VycmVudERhdGUoKTogRGF0ZSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnREYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50RGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnREYXRlID0gdGhpcy5fdEQodGhpcy5ib3guZGF0YShcImRhdGVcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5b2T5YmN5pe26Ze0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXREYXRlT3JOdWxsKCkgOiBEYXRlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZiAodGhpcy5fY3VycmVudERhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnREYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5LiK5LiA5bm0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBwcmV2aW91c1llYXIoKSB7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlWWVhcih0aGlzLmdldEN1cnJlbnREYXRlKCkuZ2V0RnVsbFllYXIoKSAtIDEpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDkuIvkuIDlubRcclxuICAgICAqL1xyXG4gICAgcHVibGljIG5leHRZZWFyKCkge1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZVllYXIodGhpcy5nZXRDdXJyZW50RGF0ZSgpLmdldEZ1bGxZZWFyKCkgKyAxKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5LiK5pyIXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBwcmV2aW91c01vbnRoKCkge1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZU1vbnRoKHRoaXMuZ2V0Q3VycmVudERhdGUoKS5nZXRNb250aCgpKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5LiL5pyIXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBuZXh0TW9udGgoKSB7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTW9udGgodGhpcy5nZXRDdXJyZW50RGF0ZSgpLmdldE1vbnRoKCkgKyAyKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65pel5pyfXHJcbiAgICAgKiBAcGFyYW0geWVhciBcclxuICAgICAqIEBwYXJhbSBtb250aCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNob3dEYXRlKHllYXI6IG51bWJlcnxEYXRlfHN0cmluZywgbW9udGg/OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZSA9IHRoaXMuX3REKHllYXIsIG1vbnRoKTtcclxuICAgICAgICBpZiAoIXRoaXMuX2hhc1RpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3VycmVudERhdGUuc2V0SG91cnMoMTIsIDAsIDAsIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJveC5kYXRhKCdkYXRlJywgdGhpcy5fY3VycmVudERhdGUpO1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hEYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmSiOWvueacgOWkp+WAvOacgOWwj+WAvOWKqOaAgeiOt+WPlueahOaDheWGtemHjeaWsOWIt+aWsOW5tOmAieaLqVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9yZWZyZXNoWWVhckxpc3QoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5taW4gaW5zdGFuY2VvZiBEYXRlVGltZXIgJiYgdGhpcy5vcHRpb25zLm1heCBpbnN0YW5jZW9mIERhdGVUaW1lcikge1xyXG4gICAgICAgICAgICB0aGlzLl95ZWFyQm94Lmh0bWwodGhpcy5fbkxpKHRoaXMuX2dldE1heCgpLmdldEZ1bGxZZWFyKCkgKyAxLCB0aGlzLl9nZXRNaW4oKS5nZXRGdWxsWWVhcigpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliLfmlrDlubTmnIjliJfooahcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfcmVmcmVzaFllYXJHcmlkKCkge1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hZZWFyTGlzdCgpO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl95ZWFyQm94LCB0aGlzLl9jdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpIC0gdGhpcy5fZ2V0TWluKCkuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX21vbnRoQm94LCB0aGlzLl9jdXJyZW50RGF0ZS5nZXRNb250aCgpKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yi35paw5pe26Ze05YiX6KGoXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3JlZnJlc2hEYXlHcmlkKCkge1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl9ob3VyQm94LCB0aGlzLl9jdXJyZW50RGF0ZS5nZXRIb3VycygpKTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5fbWludXRlQm94LCB0aGlzLl9jdXJyZW50RGF0ZS5nZXRNaW51dGVzKCkpO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl9zZWNvbmRCb3gsIHRoaXMuX2N1cnJlbnREYXRlLmdldFNlY29uZHMoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICAqIOaUueWPmGxpc3QtZ3JvdXAg5Lit55qEdWxcclxuICAgICAgKi9cclxuICAgIHByaXZhdGUgX2NoYW5nZUxpc3RHcm91cChib3g6IEpRdWVyeSwgaW5kZXg6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBsaSA9IGJveC5maW5kKFwibGlcIikuZXEoaW5kZXgpO1xyXG4gICAgICAgIGxpLmFkZENsYXNzKFwiYWN0aXZlXCIpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgYm94LnNjcm9sbFRvcChsaS5vZmZzZXQoKS50b3AgLSBib3gub2Zmc2V0KCkudG9wICsgYm94LnNjcm9sbFRvcCgpIC0gYm94LmhlaWdodCgpIC8gMik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaUueWPmOW5tFxyXG4gICAgICogQHBhcmFtIHkgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2NoYW5nZVllYXIoeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudERhdGUuc2V0RnVsbFllYXIoeSk7XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaERheSgpO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl95ZWFyQm94LCB5IC0gdGhpcy5vcHRpb25zLm1pblllYXIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmlLnlj5jmnIhcclxuICAgICAqIEBwYXJhbSBtIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9jaGFuZ2VNb250aChtOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZS5zZXRNb250aChtIC0gMSk7XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaERheSgpO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl95ZWFyQm94LCB0aGlzLl9jdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpIC0gdGhpcy5vcHRpb25zLm1pblllYXIpO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl9tb250aEJveCwgdGhpcy5fY3VycmVudERhdGUuZ2V0TW9udGgoKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaUueWPmOaXtlxyXG4gICAgICogQHBhcmFtIGggXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2NoYW5nZUhvdXIoaDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudERhdGUuc2V0SG91cnMoaCk7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZChcIi5mb290ZXIgLmhvdXJcIikudmFsKHRoaXMuX2lUcyhoKSk7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX2hvdXJCb3gsIGgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmlLnlj5jliIZcclxuICAgICAqIEBwYXJhbSBpIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9jaGFuZ2VNaW51dGUoaTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudERhdGUuc2V0TWludXRlcyhpKTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLmZvb3RlciAubWludXRlXCIpLnZhbCh0aGlzLl9pVHMoaSkpO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl9taW51dGVCb3gsIGkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmlLnlj5jnp5JcclxuICAgICAqIEBwYXJhbSBzIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9jaGFuZ2VTZWNvbmQoczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudERhdGUuc2V0U2Vjb25kcyhzKTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLmZvb3RlciAuc2Vjb25kXCIpLnZhbCh0aGlzLl9pVHMocykpO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl9zZWNvbmRCb3gsIHMpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliLfmlrDml6VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfcmVmcmVzaERheSgpIHtcclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLmhlYWRlciBzcGFuXCIpLnRleHQodGhpcy5fY3VycmVudERhdGUuZm9ybWF0KHRoaXMub3B0aW9ucy50aXRsZSkpO1xyXG4gICAgICAgIGxldCBkYXlzID0gdGhpcy5fbUxpKHRoaXMuX2N1cnJlbnREYXRlLmdldEZ1bGxZZWFyKCksIHRoaXMuX2N1cnJlbnREYXRlLmdldFJlYWxNb250aCgpKTtcclxuICAgICAgICBsZXQgZGF5TGkgPSB0aGlzLmJveC5maW5kKFwiLmJvZHkgLm1vbnRoLWdyaWQgdWwgbGlcIik7XHJcbiAgICAgICAgZGF5TGkucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlXCIpO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGN1cnJlbnREYXkgPSB0aGlzLl9jdXJyZW50RGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgICAgZGF5cy5mb3JFYWNoKGZ1bmN0aW9uKHYsIGkpIHtcclxuICAgICAgICAgICAgbGV0IGxpID0gZGF5TGkuZXEoaSkudGV4dChpbnN0YW5jZS5faVRzKHYpKTtcclxuICAgICAgICAgICAgaWYgKHYgLSAxMCA+IGkgfHwgdiArIDEwIDwgaSkge1xyXG4gICAgICAgICAgICAgICAgbGkuYWRkQ2xhc3MoXCJkaXNhYmxlXCIpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHYgPT0gY3VycmVudERheSkge1xyXG4gICAgICAgICAgICAgICAgbGkuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog5Yi35paw5pe26Ze0XHJcbiAgICAgICovXHJcbiAgICAgcHJpdmF0ZSBfcmVmcmVzaFRpbWUoKSB7XHJcbiAgICAgICAgIGlmICghdGhpcy5faGFzVGltZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgdGhpcy5fY2hhbmdlSG91cih0aGlzLmdldEN1cnJlbnREYXRlKCkuZ2V0SG91cnMoKSk7XHJcbiAgICAgICAgIHRoaXMuX2NoYW5nZU1pbnV0ZSh0aGlzLmdldEN1cnJlbnREYXRlKCkuZ2V0TWludXRlcygpKTtcclxuICAgICAgICAgdGhpcy5fY2hhbmdlU2Vjb25kKHRoaXMuZ2V0Q3VycmVudERhdGUoKS5nZXRTZWNvbmRzKCkpO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDov5Tlm57lpKnnmoTliJfooahcclxuICAgICAgKiBAcGFyYW0geSBcclxuICAgICAgKiBAcGFyYW0gbSBcclxuICAgICAgKi9cclxuICAgICBwcml2YXRlIF9tTGkoeTogbnVtYmVyLCBtOiBudW1iZXIpIDogQXJyYXk8bnVtYmVyPiB7XHJcbiAgICAgICAgbGV0IGRheXMgPSBbXTtcclxuICAgICAgICBsZXQgW2YsIGNdID0gdGhpcy5fbUQoeSwgbSk7XHJcbiAgICAgICAgbGV0IGk6IG51bWJlcjtcclxuICAgICAgICBpZiAoZiA+IDApIHtcclxuICAgICAgICAgICAgbGV0IHljID0gdGhpcy5feUQoeSwgbSAtIDEpO1xyXG4gICAgICAgICAgICBmb3IgKGkgPSB5YyAtIGYgKyAyOyBpIDw9IHljOyBpICsrKSB7XHJcbiAgICAgICAgICAgICAgICBkYXlzLnB1c2goaSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChpID0gMTsgaSA8PSBjOyBpICsrKSB7XHJcbiAgICAgICAgICAgIGRheXMucHVzaChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGYgKyBjIDwgNDMpIHtcclxuICAgICAgICAgICAgbGV0IGwgPSA0MiAtIGYgLSBjICsgMTtcclxuICAgICAgICAgICAgZm9yIChpID0gMTsgaSA8PSBsOyBpICsrKSB7XHJcbiAgICAgICAgICAgICAgICBkYXlzLnB1c2goaSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRheXM7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOe7keWumuS6i+S7tlxyXG4gICAgICAqL1xyXG4gICAgIHByaXZhdGUgX2JpbmRFdmVudCgpIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoJy5tb250aC1ncmlkIGxpJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLl9jbGlja0RheSgkKHRoaXMpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5ib3guZmluZChcIi5wcmV2aW91c1llYXJcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLnByZXZpb3VzWWVhcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoXCIucHJldmlvdXNNb250aFwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UucHJldmlvdXNNb250aCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoXCIubmV4dE1vbnRoXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5uZXh0TW9udGgoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLm5leHRZZWFyXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5uZXh0WWVhcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLmhlYWRlciBzcGFuXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIWluc3RhbmNlLl95ZWFyR3JpZC5pcyhcIjpoaWRkZW5cIikpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLl95ZWFyR3JpZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLl9oYXNUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fZGF5R3JpZC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5zdGFuY2UuX3llYXJHcmlkLnNob3coKTtcclxuICAgICAgICAgICAgaW5zdGFuY2UuX3JlZnJlc2hZZWFyR3JpZCgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl95ZWFyQm94LmZpbmQoXCJsaVwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UuX2NoYW5nZVllYXIocGFyc2VJbnQoJCh0aGlzKS50ZXh0KCkpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9tb250aEJveC5maW5kKFwibGlcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLl9jaGFuZ2VNb250aChwYXJzZUludCgkKHRoaXMpLnRleHQoKSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIOWFs+mXremdouadv1xyXG4gICAgICAgIHRoaXMuX3llYXJHcmlkLmZpbmQoJy5mYS1jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5feWVhckdyaWQuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICh0aGlzLl9oYXNUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm94LmZpbmQoXCIuZm9vdGVyIGJ1dHRvblwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLm91dHB1dCh0cnVlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuYm94LmZpbmQoXCIuZm9vdGVyIGlucHV0XCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLl9kYXlHcmlkLmlzKFwiOmhpZGRlblwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl95ZWFyR3JpZC5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuX2RheUdyaWQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9yZWZyZXNoRGF5R3JpZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLl9kYXlHcmlkLmhpZGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hvdXJCb3guZmluZChcImxpXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2NoYW5nZUhvdXIocGFyc2VJbnQoJCh0aGlzKS50ZXh0KCkpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX21pbnV0ZUJveC5maW5kKFwibGlcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fY2hhbmdlTWludXRlKHBhcnNlSW50KCQodGhpcykudGV4dCgpKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9zZWNvbmRCb3guZmluZChcImxpXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2NoYW5nZVNlY29uZChwYXJzZUludCgkKHRoaXMpLnRleHQoKSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5fZGF5R3JpZC5maW5kKCcuZmEtY2xvc2UnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLl9kYXlHcmlkLmhpZGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKiDlrp7njrDpmpDol48gKi9cclxuICAgICAgICB0aGlzLmJveC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICQoJ1tkYXRhLXR5cGU9ZGF0ZXRpbWVyXScpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLmluaXQoJCh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmJveC5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMubWluID09ICdvYmplY3QnICYmIHRoaXMub3B0aW9ucy5taW4gaW5zdGFuY2VvZiBEYXRlVGltZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm1pbi5kb25lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2N1cnJlbnREYXRlICYmICFpbnN0YW5jZS5jaGVja0RhdGUoaW5zdGFuY2UuX2N1cnJlbnREYXRlKSAmJiBpbnN0YW5jZS5jbGVhcigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMubWF4ID09ICdvYmplY3QnICYmIHRoaXMub3B0aW9ucy5tYXggaW5zdGFuY2VvZiBEYXRlVGltZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm1heC5kb25lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2N1cnJlbnREYXRlICYmICFpbnN0YW5jZS5jaGVja0RhdGUoaW5zdGFuY2UuX2N1cnJlbnREYXRlKSAmJiBpbnN0YW5jZS5jbGVhcigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5zd2lwZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94LnN3aXBlKHtcclxuICAgICAgICAgICAgc3dpcGVMZWZ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLm5leHRNb250aCgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzd2lwZVJpZ2h0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLnByZXZpb3VzTW9udGgoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog54K55Ye75pel5pyfXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY2xpY2tEYXkoZWxlbWVudDogSlF1ZXJ5KSB7XHJcbiAgICAgICAgbGV0IGRheSA9IHBhcnNlSW50KGVsZW1lbnQudGV4dCgpKTtcclxuICAgICAgICBsZXQgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKHRoaXMuX2N1cnJlbnREYXRlKTtcclxuICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoXCJkaXNhYmxlXCIpKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0RGF0ZShkYXkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGF5ID4gZWxlbWVudC5pbmRleCgpKSB7XHJcbiAgICAgICAgICAgIC8qKueCueWHu+S4iuaciOaXpeacnyAqL1xyXG4gICAgICAgICAgICBkYXRlLnNldE1vbnRoKGRhdGUuZ2V0TW9udGgoKSAtIDEpO1xyXG4gICAgICAgICAgICBkYXRlLnNldERhdGUoZGF5KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog54K55Ye75LiL5pyI5pel5pyfXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBkYXRlLnNldE1vbnRoKGRhdGUuZ2V0TW9udGgoKSArIDEpO1xyXG4gICAgICAgICAgICBkYXRlLnNldERhdGUoZGF5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudHJpZ2dlcignY2xpY2snLCBkYXRlLCBlbGVtZW50KSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5jaGVja0RhdGUoZGF0ZSkpIHtcclxuICAgICAgICAgICAgLy8g6LaF5Ye66IyD5Zu0XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignZXJyb3InLCBkYXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpID09IHRoaXMuX2N1cnJlbnREYXRlLmdldE1vbnRoKCkpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhcImFjdGl2ZVwiKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZSA9IGRhdGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93RGF0ZShkYXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vdXRwdXQoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5pyI5Lit5pyA5ZCO5LiA5aSpXHJcbiAgICAgKiBAcGFyYW0geSBcclxuICAgICAqIEBwYXJhbSBtIFxyXG4gICAgICovXHJcbiAgICAgcHJpdmF0ZSBfeUQoeTogbnVtYmVyLCBtOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoeSwgbSwgMCk7XHJcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDojrflj5bnrKzkuIDlpKnlkozmnIDlkI7kuIDlpKlcclxuICAgICAgKiBAcGFyYW0geSBcclxuICAgICAgKiBAcGFyYW0gbSBcclxuICAgICAgKi9cclxuICAgICBwcml2YXRlIF9tRCh5OiBudW1iZXIsIG06IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoeSwgbSwgMCk7XHJcbiAgICAgICAgbGV0IGNvdW50ID0gZGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgICAgZGF0ZS5zZXREYXRlKDEpO1xyXG4gICAgICAgIHJldHVybiBbZGF0ZS5nZXREYXkoKSwgY291bnRdO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDojrflj5blvZPliY3ml7bpl7RcclxuICAgICAgKi9cclxuICAgICBwdWJsaWMgdmFsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudERhdGUoKS5mb3JtYXQodGhpcy5vcHRpb25zLmZvcm1hdCk7XHJcbiAgICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiDpqozor4FEYXRlXHJcbiAgICAgICogQHBhcmFtIGRhdGUgXHJcbiAgICAgICovXHJcbiAgICAgcHVibGljIGNoZWNrRGF0ZShkYXRlOiBEYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgIGxldCBtaW4gPSB0aGlzLl9nZXRNaW4oKTtcclxuICAgICAgICAgaWYgKG1pbiAmJiBkYXRlIDw9IG1pbikge1xyXG4gICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgbGV0IG1heCA9IHRoaXMuX2dldE1heCgpO1xyXG4gICAgICAgICByZXR1cm4gIW1heCB8fCBkYXRlIDwgbWF4O1xyXG4gICAgIH1cclxuXHJcbiAgICAgLyoqXHJcbiAgICAgICog5riF6ZmkXHJcbiAgICAgICovXHJcbiAgICAgcHVibGljIGNsZWFyKCkge1xyXG4gICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgdGhpcy5lbGVtZW50LnZhbCgnJyk7XHJcbiAgICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiDovpPlh7rml7bpl7RcclxuICAgICAgKiBAcGFyYW0gaXNIaWRlIFxyXG4gICAgICAqL1xyXG4gICAgIHB1YmxpYyBvdXRwdXQoaXNIaWRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoIXRoaXMuY2hlY2tEYXRlKHRoaXMuZ2V0Q3VycmVudERhdGUoKSkpIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdlcnJvcicsIHRoaXMuZ2V0Q3VycmVudERhdGUoKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZhbHNlID09IHRoaXMudHJpZ2dlcignZG9uZScpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbCh0aGlzLnZhbCgpKTtcclxuICAgICAgICBpZiAoIXRoaXMuX2hhc1RpbWUgfHwgaXNIaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm94LmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiDovazljJbml7bpl7RcclxuICAgICAgKi9cclxuICAgICBwcml2YXRlIF90RCh5ZWFyOiBudW1iZXJ8RGF0ZXxzdHJpbmd8IERhdGVUaW1lciwgbW9udGg/OiBudW1iZXIpOiBEYXRlIHtcclxuICAgICAgICAgaWYgKCF5ZWFyKSB7XHJcbiAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBpZiAodHlwZW9mIHllYXIgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgIHJldHVybiB5ZWFyIGluc3RhbmNlb2YgRGF0ZVRpbWVyID8geWVhci5nZXREYXRlT3JOdWxsKCkgOiB5ZWFyO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGlmICh0eXBlb2YgeWVhciA9PSAnbnVtYmVyJyBcclxuICAgICAgICAgJiYgdHlwZW9mIG1vbnRoID09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGggLSAxLCAxKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICAvLyDop6PlhrNzYWZhcmkg5peg5rOV6K+G5YirIC0gXHJcbiAgICAgICAgIGlmICh0eXBlb2YgeWVhciA9PSAnc3RyaW5nJyAmJiB5ZWFyLmluZGV4T2YoJy0nKSA+IDApIHtcclxuICAgICAgICAgICAgIHllYXIucmVwbGFjZSgnLScsICcvJyk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh5ZWFyKTtcclxuICAgICAgICAgaWYgKGlzTmFOKGRhdGUuZ2V0VGltZSgpKSkge1xyXG4gICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuIGRhdGU7XHJcbiAgICAgfVxyXG5cclxuICAgICBwdWJsaWMgZG9uZShjYWxsYmFjazogKGRhdGU6IERhdGUsIGVsZW1lbnQ6IEpRdWVyeSkgPT4gYW55KTogdGhpcyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub24oJ2RvbmUnLCBjYWxsYmFjayk7XHJcbiAgICAgfVxyXG59XHJcblxyXG5pbnRlcmZhY2UgRGF0ZVRpbWVyT3B0aW9ucyB7XHJcbiAgICBmb3JtYXQ/OiBzdHJpbmcsIC8v5pel5pyf5qC85byPXHJcbiAgICBtaW4/OiBzdHJpbmcgfCBEYXRlIHwgRGF0ZVRpbWVyLCAvL+acgOWwj+aXpeacn1xyXG4gICAgbWF4Pzogc3RyaW5nIHwgRGF0ZSB8IERhdGVUaW1lciwgLy/mnIDlpKfml6XmnJ9cclxuICAgIG1pblllYXI/OiBudW1iZXIsICAgICAvLyDlgZrmoIfnrb7nlKhcclxuICAgIG1heFllYXI/OiBudW1iZXIsXHJcbiAgICByZWFkb25seT86IGJvb2xlYW4sXHJcbiAgICBvbmRvbmU/OiAoZGF0ZTogRGF0ZSwgZWxlbWVudDogSlF1ZXJ5KSA9PiBhbnksXHJcbiAgICBvbmNsaWNrPzogKGRhdGU6IERhdGUsIGVsZW1lbnQ6IEpRdWVyeSkgPT4gYW55LCAgIC8vIOeCueWHu+S6i+S7tlxyXG4gICAgb25lcnJvcj86IChkYXRlOiBEYXRlLCBlbGVtZW50OiBKUXVlcnkpID0+IGFueSwgIC8vIOeCueWHu+mUmeivr+eahFxyXG4gICAgdGl0bGU/OiBzdHJpbmdcclxuIH1cclxuXHJcbmNsYXNzIERhdGVUaW1lckRlZmF1bHRPcHRpb25zIGltcGxlbWVudHMgRGF0ZVRpbWVyT3B0aW9ucyB7XHJcbiAgICBmb3JtYXQ6IHN0cmluZyA9IFwieS1tLWQgaDppOnNcIjsgLy/ml6XmnJ/moLzlvI9cclxuICAgIG1pbjogc3RyaW5nID0gXCIxOTAwLzAxLzAxIDAwOjAwOjAwXCI7IC8v5pyA5bCP5pel5pyfICAgIHNhZmFyaSDkuIvoh6rliqjor4bliKvmiJDml6XmnJ/moLzlvI8g5Y+q6K6kIC9cclxuICAgIG1heDogc3RyaW5nID0gXCIyMDk5LzEyLzMxIDIzOjU5OjU5XCI7IC8v5pyA5aSn5pel5pyfXHJcbiAgICB0aXRsZTogc3RyaW5nID0gXCJ55bm0beaciFwiOyAgICAgICAgICAgIC8vIOagh+mimOagj+eahOaXpeacn+agvOW8j1xyXG4gICAgcmVhZG9ubHk6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIG1pblllYXI6IG51bWJlciA9IDE5MDA7ICAgICAvLyDlgZrmoIfnrb7nlKhcclxuICAgIG1heFllYXI6IG51bWJlciA9IDIwOTk7XHJcbn1cclxuIFxyXG47KGZ1bmN0aW9uKCQ6IGFueSkge1xyXG4gICAgJC5mbi5kYXRldGltZXIgPSBmdW5jdGlvbihvcHRpb25zID86IERhdGVUaW1lck9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lcih0aGlzLCBvcHRpb25zKTsgXHJcbiAgICB9O1xyXG59KShqUXVlcnkpOyJdfQ==
