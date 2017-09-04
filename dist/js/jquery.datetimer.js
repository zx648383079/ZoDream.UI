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
var Eve = (function () {
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
var Box = (function (_super) {
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
var DateTimer = (function (_super) {
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
var DateTimerDefaultOptions = (function () {
    function DateTimerDefaultOptions() {
        this.format = "y-m-d h:i:s"; //日期格式
        this.min = "1900/01/01 00:00:00"; //最小日期    safari 下自动识别成日期格式 只认 /
        this.max = "2099/12/31 23:59:59"; //最大日期
        this.title = "y年m月"; // 标题栏的日期格式
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LnRzIiwiYm94LnRzIiwianF1ZXJ5LmRhdGV0aW1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7SUFBQTtJQW1CQSxDQUFBO0lBaEJBLGdCQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsUUFBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsc0JBQUEsR0FBQSxVQUFBLEtBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHFCQUFBLEdBQUEsVUFBQSxLQUFBO1FBQUEsY0FBQTthQUFBLFVBQUEsRUFBQSxxQkFBQSxFQUFBLElBQUE7WUFBQSw2QkFBQTs7UUFDQSxJQUFBLFNBQUEsR0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLFlBQUEsSUFBQSxTQUFBLElBQUEsR0FBQTs7SUFDQSxDQUFBO0lBQ0EsVUFBQTtBQUFBLENBbkJBLEFBbUJBLElBQUE7QUNuQkE7SUFBQSx1QkFBQTtJQUFBOztJQWdDQSxDQUFBO0lBMUJBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx5QkFBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQTs7OztPQUlBO0lBQ0EsV0FBQSxHQUFBLFVBQUEsVUFBQSxFQUFBLE9BQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxPQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsVUFBQTtBQUFBLENBaENBLEFBZ0NBLENBaENBLEdBQUEsR0FnQ0E7QUNoQ0E7Ozs7OztHQU1BO0FBRUE7O0dBRUE7QUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsR0FBQTtJQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsQ0FBQSxDQUFBO0FBQ0E7O0dBRUE7QUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLEdBQUE7SUFBQSxvQkFBQSxFQUFBLGNBQUE7SUFDQSxJQUFBLENBQUEsR0FBQTtRQUNBLElBQUEsRUFBQSxJQUFBLENBQUEsV0FBQSxFQUFBO1FBQ0EsSUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUE7UUFDQSxJQUFBLEVBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTtRQUNBLElBQUEsRUFBQSxJQUFBLENBQUEsUUFBQSxFQUFBO1FBQ0EsSUFBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLEVBQUE7UUFDQSxJQUFBLEVBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQTtRQUNBLElBQUEsRUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLEdBQUEsRUFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsS0FBQTtLQUNBLENBQUE7SUFDQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsR0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsQ0FBQSxDQUFBO0FBRUE7O0dBRUE7QUFDQTtJQUFBLDZCQUFBO0lBQ0EsbUJBQ0EsT0FBQSxFQUNBLE9BQUE7UUFGQSxZQUlBLGlCQUFBLFNBWUE7UUFmQSxhQUFBLEdBQUEsT0FBQSxDQUFBO1FBZ0RBOztXQUVBO1FBQ0EsY0FBQSxHQUFBLElBQUEsQ0FBQTtRQS9DQSxLQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsdUJBQUEsRUFBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEtBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTs7SUFDQSxDQUFBO0lBMENBOztPQUVBO0lBQ0EsMkJBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDJCQUFBLEdBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0Esd0JBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0EsOEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLHFEQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsb1ZBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBO2NBQ0EsK0ZBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQTtjQUNBLHlFQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO1lBQ0EsOENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLG9GQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7Z0JBQ0EsMkVBQUE7Z0JBQ0EsR0FBQTtnQkFDQSwyRUFBQTtnQkFDQSxHQUFBO2dCQUNBLDhDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLFFBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLHNMQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFFQSxJQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHdCQUFBLEdBQUEsVUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0Esd0JBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsSUFBQTtRQUFBLGtCQUFBLEVBQUEsS0FBQTtRQUFBLHFCQUFBLEVBQUEsV0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxXQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHdCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsWUFBQTtZQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxrQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxpQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsZ0NBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0EsNEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7O09BRUE7SUFDQSw2QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7Ozs7T0FJQTtJQUNBLDRCQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsS0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLG9DQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsWUFBQSxTQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLFlBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxHQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFDQTs7T0FFQTtJQUNBLG9DQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFdBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7O09BRUE7SUFDQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0Esb0NBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxLQUFBO1FBQ0EsSUFBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtRQUNBLEdBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsQ0FBQSxTQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7OztPQUdBO0lBQ0EsK0JBQUEsR0FBQSxVQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7OztPQUdBO0lBQ0EsZ0NBQUEsR0FBQSxVQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsV0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOzs7T0FHQTtJQUNBLCtCQUFBLEdBQUEsVUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7O09BR0E7SUFDQSxpQ0FBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOzs7T0FHQTtJQUNBLGlDQUFBLEdBQUEsVUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7O09BRUE7SUFDQSwrQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxXQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7UUFDQSxLQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLFdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsRUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7WUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsRUFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7T0FFQTtJQUNBLGdDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7OztPQUlBO0lBQ0Esd0JBQUEsR0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxtQkFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsR0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxHQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsR0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7T0FFQTtJQUNBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBRUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsZUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsU0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBRUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxRQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQTtRQUVBLENBQUEsQ0FBQSxDQUFBO1FBRUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsT0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7Z0JBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO29CQUNBLFFBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7b0JBQ0EsUUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtvQkFDQSxRQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7b0JBQ0EsTUFBQSxDQUFBO2dCQUNBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsYUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLGFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxXQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBRUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLElBQUEsUUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxZQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLFlBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLElBQUEsUUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxZQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLFlBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUVBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsU0FBQSxFQUFBO2dCQUNBLFFBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxVQUFBLEVBQUE7Z0JBQ0EsUUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtTQUNBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSw2QkFBQSxHQUFBLFVBQUEsT0FBQTtRQUNBLElBQUEsR0FBQSxHQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFlBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQUEsSUFBQSxDQUFBLENBQUE7WUFDQTs7ZUFFQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxDQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7OztPQUlBO0lBQ0EsdUJBQUEsR0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7Ozs7T0FJQTtJQUNBLHVCQUFBLEdBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0EsdUJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsNkJBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxJQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EseUJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsMEJBQUEsR0FBQSxVQUFBLE1BQUE7UUFBQSx1QkFBQSxFQUFBLGNBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHVCQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsS0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxZQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUE7ZUFDQSxPQUFBLEtBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLG1CQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsUUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsd0JBQUEsR0FBQSxVQUFBLFFBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZ0JBQUE7QUFBQSxDQTlsQkEsQUE4bEJBLENBOWxCQSxHQUFBLEdBOGxCQTtBQWNBO0lBQUE7UUFDQSxXQUFBLEdBQUEsYUFBQSxDQUFBLENBQUEsTUFBQTtRQUNBLFFBQUEsR0FBQSxxQkFBQSxDQUFBLENBQUEsZ0NBQUE7UUFDQSxRQUFBLEdBQUEscUJBQUEsQ0FBQSxDQUFBLE1BQUE7UUFDQSxVQUFBLEdBQUEsTUFBQSxDQUFBLENBQUEsV0FBQTtRQUNBLFlBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQSxPQUFBO1FBQ0EsWUFBQSxHQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSw4QkFBQTtBQUFBLENBUEEsQUFPQSxJQUFBO0FBRUEsQ0FBQTtBQUFBLENBQUEsVUFBQSxDQUFBO0lBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxPQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtJQUNBLENBQUEsQ0FBQTtBQUNBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBIiwiZmlsZSI6ImpxdWVyeS5kYXRldGltZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhYnN0cmFjdCBjbGFzcyBFdmUge1xyXG4gICAgcHVibGljIG9wdGlvbnM6IGFueTtcclxuXHJcbiAgICBwdWJsaWMgb24oZXZlbnQ6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zWydvbicgKyBldmVudF0gPSBjYWxsYmFjaztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGFzRXZlbnQoZXZlbnQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ29uJyArIGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJpZ2dlcihldmVudDogc3RyaW5nLCAuLi4gYXJnczogYW55W10pIHtcclxuICAgICAgICBsZXQgcmVhbEV2ZW50ID0gJ29uJyArIGV2ZW50O1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNFdmVudChldmVudCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3JlYWxFdmVudF0uY2FsbCh0aGlzLCAuLi5hcmdzKTtcclxuICAgIH1cclxufSIsImFic3RyYWN0IGNsYXNzIEJveCBleHRlbmRzIEV2ZSB7XHJcblxyXG4gICAgcHVibGljIGVsZW1lbnQ6IEpRdWVyeTtcclxuXHJcbiAgICBwdWJsaWMgYm94OiBKUXVlcnk7XHJcblxyXG4gICAgcHJvdGVjdGVkIHNob3dQb3NpdGlvbigpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5ib3guc2hvdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzZXRQb3NpdGlvbigpOiB0aGlzIHtcclxuICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5lbGVtZW50Lm9mZnNldCgpO1xyXG4gICAgICAgIGxldCB4ID0gb2Zmc2V0LmxlZnQgLSAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpO1xyXG4gICAgICAgIGxldCB5ID0gb2Zmc2V0LnRvcCArIHRoaXMuZWxlbWVudC5vdXRlckhlaWdodCgpIC0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgICAgIHRoaXMuYm94LmNzcyh7bGVmdDogeCArIFwicHhcIiwgdG9wOiB5ICsgXCJweFwifSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u5Y+v6IO95piv55u45a+55YC86I635Y+W57ud5a+55YC8XHJcbiAgICAgKiBAcGFyYW0gYWJzZXJ2YWJsZSBcclxuICAgICAqIEBwYXJhbSByZWx0aXZlIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldFJlYWwoYWJzZXJ2YWJsZTogbnVtYmVyLCByZWx0aXZlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGlmIChyZWx0aXZlID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVsdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFic2VydmFibGUgKiByZWx0aXZlO1xyXG4gICAgfVxyXG59IiwiLyohXHJcbiAqIGpxdWVyeS5kYXRldGltZXIgLSBodHRwczovL2dpdGh1Yi5jb20veng2NDgzODMwNzkvWm9EcmVhbS5VSVxyXG4gKiBWZXJzaW9uIC0gMS4wXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSAtIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IFpvRHJlYW1cclxuICovXHJcblxyXG4vKipcclxuICog6I635Y+W55yf5a6e55qE5pyI5Lu9XHJcbiAqL1xyXG5EYXRlLnByb3RvdHlwZS5nZXRSZWFsTW9udGggPSBmdW5jdGlvbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9udGgoKSArIDE7XHJcbn07XHJcbi8qKlxyXG4gKiDmoLzlvI/ljJbml6XmnJ9cclxuICovXHJcbkRhdGUucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKGZtdDogc3RyaW5nID0gJ3nlubRt5pyIZOaXpScpOiBzdHJpbmcge1xyXG4gICAgbGV0IG8gPSB7XHJcbiAgICAgICAgXCJ5K1wiOiB0aGlzLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgXCJtK1wiOiB0aGlzLmdldFJlYWxNb250aCgpLCAvL+aciOS7vSBcclxuICAgICAgICBcImQrXCI6IHRoaXMuZ2V0RGF0ZSgpLCAvL+aXpSBcclxuICAgICAgICBcImgrXCI6IHRoaXMuZ2V0SG91cnMoKSwgLy/lsI/ml7YgXHJcbiAgICAgICAgXCJpK1wiOiB0aGlzLmdldE1pbnV0ZXMoKSwgLy/liIYgXHJcbiAgICAgICAgXCJzK1wiOiB0aGlzLmdldFNlY29uZHMoKSwgLy/np5IgXHJcbiAgICAgICAgXCJxK1wiOiBNYXRoLmZsb29yKCh0aGlzLmdldE1vbnRoKCkgKyAzKSAvIDMpLCAvL+Wto+W6plxyXG4gICAgICAgIFwiU1wiOiB0aGlzLmdldE1pbGxpc2Vjb25kcygpIC8v5q+r56eSIFxyXG4gICAgfTtcclxuICAgIGZvciAobGV0IGsgaW4gbykge1xyXG4gICAgICAgIGlmIChuZXcgUmVnRXhwKFwiKFwiICsgayArIFwiKVwiKS50ZXN0KGZtdCkpIHtcclxuICAgICAgICAgICAgZm10ID0gZm10LnJlcGxhY2UoUmVnRXhwLiQxLCAoUmVnRXhwLiQxLmxlbmd0aCA9PSAxKSA/IChvW2tdKSA6ICgoXCIwMFwiICsgb1trXSkuc3Vic3RyKChcIlwiICsgb1trXSkubGVuZ3RoKSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmbXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlt7Lnn6Xpl67popjlvZPmnIDlpKflgLzmnIDlsI/lgLzkuLpEYXRlVGltZXIg5pe25peg5rOV5q2j56Gu5pi+56S6XHJcbiAqL1xyXG5jbGFzcyBEYXRlVGltZXIgZXh0ZW5kcyBCb3gge1xyXG4gICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICBwdWJsaWMgZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICAgICBvcHRpb25zPzogRGF0ZVRpbWVyT3B0aW9uc1xyXG4gICAgICkge1xyXG4gICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgbmV3IERhdGVUaW1lckRlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xyXG4gICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5taW4gIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm1pbiA9IHRoaXMuX3REKHRoaXMub3B0aW9ucy5taW4pO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm1heCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMubWF4ID0gdGhpcy5fdEQodGhpcy5vcHRpb25zLm1heCk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mb3JtYXQuaW5kZXhPZignaCcpIDwgMCkge1xyXG4gICAgICAgICAgICAgdGhpcy5faGFzVGltZSA9IGZhbHNlO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRoaXMuY3JlYXRlSHRtbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcHRpb25zOiBEYXRlVGltZXJPcHRpb25zO1xyXG5cclxuICAgIHB1YmxpYyBib3g6IEpRdWVyeTtcclxuICAgIC8qKlxyXG4gICAgICog5bm05pyI6YCJ5oup6Z2i5p2/XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3llYXJHcmlkOiBKUXVlcnk7XHJcbiAgICAvKipcclxuICAgICAqIOaXtumXtOmAieaLqemdouadv1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9kYXlHcmlkOiBKUXVlcnk7XHJcbiAgICAvKipcclxuICAgICAqIOW5tOmAieaLqeWIl+ihqFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF95ZWFyQm94OiBKUXVlcnk7XHJcbiAgICAvKipcclxuICAgICAqIOaciOS7vemAieaLqeWIl+ihqFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9tb250aEJveDogSlF1ZXJ5O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlsI/ml7bpgInmi6nliJfooahcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfaG91ckJveDogSlF1ZXJ5O1xyXG4gICAgLyoqXHJcbiAgICAgKiDliIbpkp/pgInmi6nliJfooahcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfbWludXRlQm94OiBKUXVlcnk7XHJcbiAgICAvKipcclxuICAgICAqIOenkumAieaLqeWIl+ihqFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zZWNvbmRCb3g6IEpRdWVyeTtcclxuICAgIC8qKlxyXG4gICAgICog5piv5ZCm5pyJ5pe26Ze0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2hhc1RpbWU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5b2T5YmN5pel5pyf5pe26Ze0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2N1cnJlbnREYXRlOiBEYXRlO1xyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5borr7nva7nmoTmnIDlsI/lgLxcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0TWluKCk6IERhdGUge1xyXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5fdEQodGhpcy5vcHRpb25zLm1pbik7XHJcbiAgICAgICAgaWYgKCFkYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5faGFzVGltZSkge1xyXG4gICAgICAgICAgICBkYXRlLnNldEhvdXJzKDIzLCA1OSwgNTksIDk5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5borr7nva7nmoTmnIDlpKflgLxcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0TWF4KCk6IERhdGUge1xyXG4gICAgICAgIGxldCBkYXRlID0gdGhpcy5fdEQodGhpcy5vcHRpb25zLm1heCk7XHJcbiAgICAgICAgaWYgKCFkYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5faGFzVGltZSkge1xyXG4gICAgICAgICAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIneWni+WMllxyXG4gICAgICogQHBhcmFtIHRpbWUgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpbml0KHRpbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuc2hvd0RhdGUodGltZSk7XHJcbiAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaFRpbWUoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65YWD57SgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjcmVhdGVIdG1sKCkge1xyXG4gICAgICAgIHRoaXMuYm94ID0gJCgnPGRpdiBjbGFzcz1cImRhdGV0aW1lclwiIGRhdGEtdHlwZT1cImRhdGV0aW1lclwiPjwvZGl2PicpO1xyXG4gICAgICAgIGxldCBsaXMgPSB0aGlzLl9uTGkoNjAsIDApO1xyXG4gICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJoZWFkZXJcIj48aSBjbGFzcz1cImZhIGZhLWJhY2t3YXJkIHByZXZpb3VzWWVhclwiPjwvaT48aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tbGVmdCBwcmV2aW91c01vbnRoXCI+PC9pPjxzcGFuPjwvc3Bhbj48aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tcmlnaHQgbmV4dE1vbnRoXCI+PC9pPjxpIGNsYXNzPVwiZmEgZmEtZm9yd2FyZCBuZXh0WWVhclwiPjwvaT48L2Rpdj48ZGl2IGNsYXNzPVwiYm9keVwiPjxkaXYgY2xhc3M9XCJtb250aC1ncmlkXCI+PG9sPjxsaT7ml6U8L2xpPjxsaT7kuIA8L2xpPjxsaT7kuow8L2xpPjxsaT7kuIk8L2xpPjxsaT7lm5s8L2xpPjxsaT7kupQ8L2xpPjxsaT7lha08L2xpPjwvb2w+PHVsPicrXHJcbiAgICAgICAgdGhpcy5fbkxpKDQyLCAwLCBmYWxzZSkgXHJcbiAgICAgICAgKyc8L3VsPjwvZGl2PjxkaXYgY2xhc3M9XCJ5ZWFyLWdyaWRcIj48ZGl2IGNsYXNzPVwibGlzdC1ncm91cCB5ZWFyXCI+PGRpdiBjbGFzcz1cInRpdGxlXCI+5bm0PC9kaXY+PHVsPicrXHJcbiAgICAgICAgdGhpcy5fbkxpKHRoaXMub3B0aW9ucy5tYXhZZWFyICsgMSwgdGhpcy5vcHRpb25zLm1pblllYXIpXHJcbiAgICAgICAgKyc8L3VsPjwvZGl2PjxkaXYgY2xhc3M9XCJsaXN0LWdyb3VwIG1vbnRoXCI+PGRpdiBjbGFzcz1cInRpdGxlXCI+5pyIPC9kaXY+PHVsPicrIFxyXG4gICAgICAgIHRoaXMuX25MaSgxMywgMSkgK1xyXG4gICAgICAgICc8L3VsPjwvZGl2PjxpIGNsYXNzPVwiZmEgZmEtY2xvc2VcIj48L2k+PC9kaXY+JztcclxuICAgICAgICBpZiAodGhpcy5faGFzVGltZSkge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiZGF5LWdyaWRcIj48ZGl2IGNsYXNzPVwibGlzdC1ncm91cCBob3VyXCI+PGRpdiBjbGFzcz1cInRpdGxlXCI+5bCP5pe2PC9kaXY+PHVsPicrIHRoaXMuX25MaSgyNCkgK1xyXG4gICAgICAgICAgICAnPC91bD48L2Rpdj48ZGl2IGNsYXNzPVwibGlzdC1ncm91cCBtaW51dGVcIj48ZGl2IGNsYXNzPVwidGl0bGVcIj7liIbpkp88L2Rpdj48dWw+JysgXHJcbiAgICAgICAgICAgIGxpcyArXHJcbiAgICAgICAgICAgICc8L3VsPjwvZGl2PjxkaXYgY2xhc3M9XCJsaXN0LWdyb3VwIHNlY29uZFwiPjxkaXYgY2xhc3M9XCJ0aXRsZVwiPuenkumSnzwvZGl2Pjx1bD4nK1xyXG4gICAgICAgICAgICBsaXMgK1xyXG4gICAgICAgICAgICAnPC91bD48L2Rpdj48aSBjbGFzcz1cImZhIGZhLWNsb3NlXCI+PC9pPjwvZGl2Pic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc1RpbWUpIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImZvb3RlclwiPjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiaG91clwiIHZhbHVlPVwiMDBcIj46PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJtaW51dGVcIiB2YWx1ZT1cIjAwXCI+OjxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwic2Vjb25kXCIgdmFsdWU9XCIwMFwiPjxidXR0b24+56Gu5a6aPC9idXR0b24+PC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ib3guaHRtbChodG1sKTtcclxuICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0aGlzLmJveCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3llYXJCb3ggPSB0aGlzLmJveC5maW5kKFwiLmJvZHkgLnllYXItZ3JpZCAueWVhciB1bFwiKTtcclxuICAgICAgICB0aGlzLl9tb250aEJveCA9IHRoaXMuYm94LmZpbmQoXCIuYm9keSAueWVhci1ncmlkIC5tb250aCB1bFwiKTtcclxuICAgICAgICB0aGlzLl95ZWFyR3JpZCA9IHRoaXMuYm94LmZpbmQoXCIuYm9keSAueWVhci1ncmlkXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLl9oYXNUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RheUdyaWQgPSB0aGlzLmJveC5maW5kKFwiLmJvZHkgLmRheS1ncmlkXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9ob3VyQm94ID0gdGhpcy5ib3guZmluZChcIi5ib2R5IC5kYXktZ3JpZCAuaG91ciB1bFwiKTtcclxuICAgICAgICAgICAgdGhpcy5fbWludXRlQm94ID0gdGhpcy5ib3guZmluZChcIi5ib2R5IC5kYXktZ3JpZCAubWludXRlIHVsXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9zZWNvbmRCb3ggPSB0aGlzLmJveC5maW5kKFwiLmJvZHkgLmRheS1ncmlkIC5zZWNvbmQgdWxcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2JpbmRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiDmoLzlvI/ljJbmlbDlrZdcclxuICAgICAgKi9cclxuICAgIHByaXZhdGUgX2lUcyhpOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChpIDwgMTApIHtcclxuICAgICAgICAgICAgcmV0dXJuICcwJyArIGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICAqIOeUn+aIkOaMh+WumuaVsOebrueahGxpXHJcbiAgICAgICovXHJcbiAgICBwcml2YXRlIF9uTGkobGVuZ3RoOiBudW1iZXIsIGk6IG51bWJlciA9IDAsIGhhc04gPSB0cnVlKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgIGZvcig7IGkgPCBsZW5ndGg7IGkgKyspIHtcclxuICAgICAgICAgICAgaWYgKCFoYXNOKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8bGk+PC9saT4nO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaHRtbCArPSAnPGxpPicgKyB0aGlzLl9pVHMoaSkgKyAnPC9saT4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekulxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb3BlbigpIHtcclxuICAgICAgICBpZiAodGhpcy5ib3guY3NzKCdwb3NpdGlvbicpID09ICdmaXhlZCcpIHtcclxuICAgICAgICAgICAgLy8g5riF6Zmk6aG16Z2i5LiK55qEY3NzXHJcbiAgICAgICAgICAgIHRoaXMuYm94LmF0dHIoJ3N0eWxlJywgJycpLnNob3coKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNob3dQb3NpdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5b2T5YmN6K6+572u55qE5pe26Ze0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDdXJyZW50RGF0ZSgpOiBEYXRlIHtcclxuICAgICAgICBpZiAodGhpcy5fY3VycmVudERhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnREYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudERhdGUgPSB0aGlzLl90RCh0aGlzLmJveC5kYXRhKFwiZGF0ZVwiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blvZPliY3ml7bpl7RcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldERhdGVPck51bGwoKSA6IERhdGUgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50RGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudERhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDkuIrkuIDlubRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHByZXZpb3VzWWVhcigpIHtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VZZWFyKHRoaXMuZ2V0Q3VycmVudERhdGUoKS5nZXRGdWxsWWVhcigpIC0gMSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOS4i+S4gOW5tFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbmV4dFllYXIoKSB7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlWWVhcih0aGlzLmdldEN1cnJlbnREYXRlKCkuZ2V0RnVsbFllYXIoKSArIDEpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDkuIrmnIhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHByZXZpb3VzTW9udGgoKSB7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTW9udGgodGhpcy5nZXRDdXJyZW50RGF0ZSgpLmdldE1vbnRoKCkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDkuIvmnIhcclxuICAgICAqL1xyXG4gICAgcHVibGljIG5leHRNb250aCgpIHtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VNb250aCh0aGlzLmdldEN1cnJlbnREYXRlKCkuZ2V0TW9udGgoKSArIDIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrml6XmnJ9cclxuICAgICAqIEBwYXJhbSB5ZWFyIFxyXG4gICAgICogQHBhcmFtIG1vbnRoIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2hvd0RhdGUoeWVhcjogbnVtYmVyfERhdGV8c3RyaW5nLCBtb250aD86IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnREYXRlID0gdGhpcy5fdEQoeWVhciwgbW9udGgpO1xyXG4gICAgICAgIGlmICghdGhpcy5faGFzVGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZS5zZXRIb3VycygxMiwgMCwgMCwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94LmRhdGEoJ2RhdGUnLCB0aGlzLl9jdXJyZW50RGF0ZSk7XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaERheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6ZKI5a+55pyA5aSn5YC85pyA5bCP5YC85Yqo5oCB6I635Y+W55qE5oOF5Ya16YeN5paw5Yi35paw5bm06YCJ5oupXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3JlZnJlc2hZZWFyTGlzdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1pbiBpbnN0YW5jZW9mIERhdGVUaW1lciAmJiB0aGlzLm9wdGlvbnMubWF4IGluc3RhbmNlb2YgRGF0ZVRpbWVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3llYXJCb3guaHRtbCh0aGlzLl9uTGkodGhpcy5fZ2V0TWF4KCkuZ2V0RnVsbFllYXIoKSArIDEsIHRoaXMuX2dldE1pbigpLmdldEZ1bGxZZWFyKCkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWIt+aWsOW5tOaciOWIl+ihqFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9yZWZyZXNoWWVhckdyaWQoKSB7XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaFllYXJMaXN0KCk7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX3llYXJCb3gsIHRoaXMuX2N1cnJlbnREYXRlLmdldEZ1bGxZZWFyKCkgLSB0aGlzLl9nZXRNaW4oKS5nZXRGdWxsWWVhcigpKTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5fbW9udGhCb3gsIHRoaXMuX2N1cnJlbnREYXRlLmdldE1vbnRoKCkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliLfmlrDml7bpl7TliJfooahcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfcmVmcmVzaERheUdyaWQoKSB7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX2hvdXJCb3gsIHRoaXMuX2N1cnJlbnREYXRlLmdldEhvdXJzKCkpO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl9taW51dGVCb3gsIHRoaXMuX2N1cnJlbnREYXRlLmdldE1pbnV0ZXMoKSk7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX3NlY29uZEJveCwgdGhpcy5fY3VycmVudERhdGUuZ2V0U2Vjb25kcygpKTtcclxuICAgIH1cclxuXHJcbiAgICAgLyoqXHJcbiAgICAgICog5pS55Y+YbGlzdC1ncm91cCDkuK3nmoR1bFxyXG4gICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY2hhbmdlTGlzdEdyb3VwKGJveDogSlF1ZXJ5LCBpbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGxpID0gYm94LmZpbmQoXCJsaVwiKS5lcShpbmRleCk7XHJcbiAgICAgICAgbGkuYWRkQ2xhc3MoXCJhY3RpdmVcIikuc2libGluZ3MoKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICBib3guc2Nyb2xsVG9wKGxpLm9mZnNldCgpLnRvcCAtIGJveC5vZmZzZXQoKS50b3AgKyBib3guc2Nyb2xsVG9wKCkgLSBib3guaGVpZ2h0KCkgLyAyKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pS55Y+Y5bm0XHJcbiAgICAgKiBAcGFyYW0geSBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY2hhbmdlWWVhcih5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZS5zZXRGdWxsWWVhcih5KTtcclxuICAgICAgICB0aGlzLl9yZWZyZXNoRGF5KCk7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX3llYXJCb3gsIHkgLSB0aGlzLm9wdGlvbnMubWluWWVhcik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaUueWPmOaciFxyXG4gICAgICogQHBhcmFtIG0gXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2NoYW5nZU1vbnRoKG06IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnREYXRlLnNldE1vbnRoKG0gLSAxKTtcclxuICAgICAgICB0aGlzLl9yZWZyZXNoRGF5KCk7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX3llYXJCb3gsIHRoaXMuX2N1cnJlbnREYXRlLmdldEZ1bGxZZWFyKCkgLSB0aGlzLm9wdGlvbnMubWluWWVhcik7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX21vbnRoQm94LCB0aGlzLl9jdXJyZW50RGF0ZS5nZXRNb250aCgpKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pS55Y+Y5pe2XHJcbiAgICAgKiBAcGFyYW0gaCBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY2hhbmdlSG91cihoOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZS5zZXRIb3VycyhoKTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLmZvb3RlciAuaG91clwiKS52YWwodGhpcy5faVRzKGgpKTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5faG91ckJveCwgaCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaUueWPmOWIhlxyXG4gICAgICogQHBhcmFtIGkgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2NoYW5nZU1pbnV0ZShpOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZS5zZXRNaW51dGVzKGkpO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoXCIuZm9vdGVyIC5taW51dGVcIikudmFsKHRoaXMuX2lUcyhpKSk7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX21pbnV0ZUJveCwgaSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaUueWPmOenklxyXG4gICAgICogQHBhcmFtIHMgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2NoYW5nZVNlY29uZChzOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZS5zZXRTZWNvbmRzKHMpO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoXCIuZm9vdGVyIC5zZWNvbmRcIikudmFsKHRoaXMuX2lUcyhzKSk7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX3NlY29uZEJveCwgcyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWIt+aWsOaXpVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9yZWZyZXNoRGF5KCkge1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoXCIuaGVhZGVyIHNwYW5cIikudGV4dCh0aGlzLl9jdXJyZW50RGF0ZS5mb3JtYXQodGhpcy5vcHRpb25zLnRpdGxlKSk7XHJcbiAgICAgICAgbGV0IGRheXMgPSB0aGlzLl9tTGkodGhpcy5fY3VycmVudERhdGUuZ2V0RnVsbFllYXIoKSwgdGhpcy5fY3VycmVudERhdGUuZ2V0UmVhbE1vbnRoKCkpO1xyXG4gICAgICAgIGxldCBkYXlMaSA9IHRoaXMuYm94LmZpbmQoXCIuYm9keSAubW9udGgtZ3JpZCB1bCBsaVwiKTtcclxuICAgICAgICBkYXlMaS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImRpc2FibGVcIik7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBsZXQgY3VycmVudERheSA9IHRoaXMuX2N1cnJlbnREYXRlLmdldERhdGUoKTtcclxuICAgICAgICBkYXlzLmZvckVhY2goZnVuY3Rpb24odiwgaSkge1xyXG4gICAgICAgICAgICBsZXQgbGkgPSBkYXlMaS5lcShpKS50ZXh0KGluc3RhbmNlLl9pVHModikpO1xyXG4gICAgICAgICAgICBpZiAodiAtIDEwID4gaSB8fCB2ICsgMTAgPCBpKSB7XHJcbiAgICAgICAgICAgICAgICBsaS5hZGRDbGFzcyhcImRpc2FibGVcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodiA9PSBjdXJyZW50RGF5KSB7XHJcbiAgICAgICAgICAgICAgICBsaS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDliLfmlrDml7bpl7RcclxuICAgICAgKi9cclxuICAgICBwcml2YXRlIF9yZWZyZXNoVGltZSgpIHtcclxuICAgICAgICAgaWYgKCF0aGlzLl9oYXNUaW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgfVxyXG4gICAgICAgICB0aGlzLl9jaGFuZ2VIb3VyKHRoaXMuZ2V0Q3VycmVudERhdGUoKS5nZXRIb3VycygpKTtcclxuICAgICAgICAgdGhpcy5fY2hhbmdlTWludXRlKHRoaXMuZ2V0Q3VycmVudERhdGUoKS5nZXRNaW51dGVzKCkpO1xyXG4gICAgICAgICB0aGlzLl9jaGFuZ2VTZWNvbmQodGhpcy5nZXRDdXJyZW50RGF0ZSgpLmdldFNlY29uZHMoKSk7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOi/lOWbnuWkqeeahOWIl+ihqFxyXG4gICAgICAqIEBwYXJhbSB5IFxyXG4gICAgICAqIEBwYXJhbSBtIFxyXG4gICAgICAqL1xyXG4gICAgIHByaXZhdGUgX21MaSh5OiBudW1iZXIsIG06IG51bWJlcikgOiBBcnJheTxudW1iZXI+IHtcclxuICAgICAgICBsZXQgZGF5cyA9IFtdO1xyXG4gICAgICAgIGxldCBbZiwgY10gPSB0aGlzLl9tRCh5LCBtKTtcclxuICAgICAgICBsZXQgaTogbnVtYmVyO1xyXG4gICAgICAgIGlmIChmID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgeWMgPSB0aGlzLl95RCh5LCBtIC0gMSk7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IHljIC0gZiArIDI7IGkgPD0geWM7IGkgKyspIHtcclxuICAgICAgICAgICAgICAgIGRheXMucHVzaChpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IGM7IGkgKyspIHtcclxuICAgICAgICAgICAgZGF5cy5wdXNoKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZiArIGMgPCA0Mykge1xyXG4gICAgICAgICAgICBsZXQgbCA9IDQyIC0gZiAtIGMgKyAxO1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IGw7IGkgKyspIHtcclxuICAgICAgICAgICAgICAgIGRheXMucHVzaChpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF5cztcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog57uR5a6a5LqL5Lu2XHJcbiAgICAgICovXHJcbiAgICAgcHJpdmF0ZSBfYmluZEV2ZW50KCkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZCgnLm1vbnRoLWdyaWQgbGknKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UuX2NsaWNrRGF5KCQodGhpcykpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLnByZXZpb3VzWWVhclwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UucHJldmlvdXNZZWFyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZChcIi5wcmV2aW91c01vbnRoXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5wcmV2aW91c01vbnRoKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZChcIi5uZXh0TW9udGhcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLm5leHRNb250aCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoXCIubmV4dFllYXJcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLm5leHRZZWFyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoXCIuaGVhZGVyIHNwYW5cIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2UuX3llYXJHcmlkLmlzKFwiOmhpZGRlblwiKSkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX3llYXJHcmlkLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuX2hhc1RpbWUpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLl9kYXlHcmlkLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnN0YW5jZS5feWVhckdyaWQuc2hvdygpO1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5fcmVmcmVzaFllYXJHcmlkKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3llYXJCb3guZmluZChcImxpXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5fY2hhbmdlWWVhcihwYXJzZUludCgkKHRoaXMpLnRleHQoKSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX21vbnRoQm94LmZpbmQoXCJsaVwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UuX2NoYW5nZU1vbnRoKHBhcnNlSW50KCQodGhpcykudGV4dCgpKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8g5YWz6Zet6Z2i5p2/XHJcbiAgICAgICAgdGhpcy5feWVhckdyaWQuZmluZCgnLmZhLWNsb3NlJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLl95ZWFyR3JpZC5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc1RpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5ib3guZmluZChcIi5mb290ZXIgYnV0dG9uXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2Uub3V0cHV0KHRydWUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5ib3guZmluZChcIi5mb290ZXIgaW5wdXRcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UuX2RheUdyaWQuaXMoXCI6aGlkZGVuXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuX3llYXJHcmlkLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fZGF5R3JpZC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuX3JlZnJlc2hEYXlHcmlkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2RheUdyaWQuaGlkZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5faG91ckJveC5maW5kKFwibGlcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fY2hhbmdlSG91cihwYXJzZUludCgkKHRoaXMpLnRleHQoKSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5fbWludXRlQm94LmZpbmQoXCJsaVwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLl9jaGFuZ2VNaW51dGUocGFyc2VJbnQoJCh0aGlzKS50ZXh0KCkpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlY29uZEJveC5maW5kKFwibGlcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fY2hhbmdlU2Vjb25kKHBhcnNlSW50KCQodGhpcykudGV4dCgpKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9kYXlHcmlkLmZpbmQoJy5mYS1jbG9zZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2RheUdyaWQuaGlkZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqIOWunueOsOmakOiXjyAqL1xyXG4gICAgICAgIHRoaXMuYm94LmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAodGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtdHlwZT1kYXRldGltZXJdJykuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuaW5pdCgkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UuYm94LmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5taW4gPT0gJ29iamVjdCcgJiYgdGhpcy5vcHRpb25zLm1pbiBpbnN0YW5jZW9mIERhdGVUaW1lcikge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMubWluLmRvbmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fY3VycmVudERhdGUgJiYgIWluc3RhbmNlLmNoZWNrRGF0ZShpbnN0YW5jZS5fY3VycmVudERhdGUpICYmIGluc3RhbmNlLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5tYXggPT0gJ29iamVjdCcgJiYgdGhpcy5vcHRpb25zLm1heCBpbnN0YW5jZW9mIERhdGVUaW1lcikge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMubWF4LmRvbmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fY3VycmVudERhdGUgJiYgIWluc3RhbmNlLmNoZWNrRGF0ZShpbnN0YW5jZS5fY3VycmVudERhdGUpICYmIGluc3RhbmNlLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLnN3aXBlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ib3guc3dpcGUoe1xyXG4gICAgICAgICAgICBzd2lwZUxlZnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UubmV4dE1vbnRoKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN3aXBlUmlnaHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucHJldmlvdXNNb250aCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDngrnlh7vml6XmnJ9cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9jbGlja0RheShlbGVtZW50OiBKUXVlcnkpIHtcclxuICAgICAgICBsZXQgZGF5ID0gcGFyc2VJbnQoZWxlbWVudC50ZXh0KCkpO1xyXG4gICAgICAgIGxldCBkYXRlOiBEYXRlID0gbmV3IERhdGUodGhpcy5fY3VycmVudERhdGUpO1xyXG4gICAgICAgIGlmICghZWxlbWVudC5oYXNDbGFzcyhcImRpc2FibGVcIikpIHtcclxuICAgICAgICAgICAgZGF0ZS5zZXREYXRlKGRheSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkYXkgPiBlbGVtZW50LmluZGV4KCkpIHtcclxuICAgICAgICAgICAgLyoq54K55Ye75LiK5pyI5pel5pyfICovXHJcbiAgICAgICAgICAgIGRhdGUuc2V0TW9udGgoZGF0ZS5nZXRNb250aCgpIC0gMSk7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0RGF0ZShkYXkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiDngrnlh7vkuIvmnIjml6XmnJ9cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGRhdGUuc2V0TW9udGgoZGF0ZS5nZXRNb250aCgpICsgMSk7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0RGF0ZShkYXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy50cmlnZ2VyKCdjbGljaycsIGRhdGUsIGVsZW1lbnQpID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmNoZWNrRGF0ZShkYXRlKSkge1xyXG4gICAgICAgICAgICAvLyDotoXlh7rojIPlm7RcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdlcnJvcicsIGRhdGUpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRlLmdldE1vbnRoKCkgPT0gdGhpcy5fY3VycmVudERhdGUuZ2V0TW9udGgoKSkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKFwiYWN0aXZlXCIpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnREYXRlID0gZGF0ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dEYXRlKGRhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm91dHB1dCgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmnIjkuK3mnIDlkI7kuIDlpKlcclxuICAgICAqIEBwYXJhbSB5IFxyXG4gICAgICogQHBhcmFtIG0gXHJcbiAgICAgKi9cclxuICAgICBwcml2YXRlIF95RCh5OiBudW1iZXIsIG06IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh5LCBtLCAwKTtcclxuICAgICAgICByZXR1cm4gZGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOiOt+WPluesrOS4gOWkqeWSjOacgOWQjuS4gOWkqVxyXG4gICAgICAqIEBwYXJhbSB5IFxyXG4gICAgICAqIEBwYXJhbSBtIFxyXG4gICAgICAqL1xyXG4gICAgIHByaXZhdGUgX21EKHk6IG51bWJlciwgbTogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh5LCBtLCAwKTtcclxuICAgICAgICBsZXQgY291bnQgPSBkYXRlLmdldERhdGUoKTtcclxuICAgICAgICBkYXRlLnNldERhdGUoMSk7XHJcbiAgICAgICAgcmV0dXJuIFtkYXRlLmdldERheSgpLCBjb3VudF07XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOiOt+WPluW9k+WJjeaXtumXtFxyXG4gICAgICAqL1xyXG4gICAgIHB1YmxpYyB2YWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50RGF0ZSgpLmZvcm1hdCh0aGlzLm9wdGlvbnMuZm9ybWF0KTtcclxuICAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICAqIOmqjOivgURhdGVcclxuICAgICAgKiBAcGFyYW0gZGF0ZSBcclxuICAgICAgKi9cclxuICAgICBwdWJsaWMgY2hlY2tEYXRlKGRhdGU6IERhdGUpOiBib29sZWFuIHtcclxuICAgICAgICAgbGV0IG1pbiA9IHRoaXMuX2dldE1pbigpO1xyXG4gICAgICAgICBpZiAobWluICYmIGRhdGUgPD0gbWluKSB7XHJcbiAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgIH1cclxuICAgICAgICBsZXQgbWF4ID0gdGhpcy5fZ2V0TWF4KCk7XHJcbiAgICAgICAgIHJldHVybiAhbWF4IHx8IGRhdGUgPCBtYXg7XHJcbiAgICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiDmuIXpmaRcclxuICAgICAgKi9cclxuICAgICBwdWJsaWMgY2xlYXIoKSB7XHJcbiAgICAgICAgIHRoaXMuX2N1cnJlbnREYXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICB0aGlzLmVsZW1lbnQudmFsKCcnKTtcclxuICAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICAqIOi+k+WHuuaXtumXtFxyXG4gICAgICAqIEBwYXJhbSBpc0hpZGUgXHJcbiAgICAgICovXHJcbiAgICAgcHVibGljIG91dHB1dChpc0hpZGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghdGhpcy5jaGVja0RhdGUodGhpcy5nZXRDdXJyZW50RGF0ZSgpKSkge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2Vycm9yJywgdGhpcy5nZXRDdXJyZW50RGF0ZSgpKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdkb25lJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsZW1lbnQudmFsKHRoaXMudmFsKCkpO1xyXG4gICAgICAgIGlmICghdGhpcy5faGFzVGltZSB8fCBpc0hpZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5ib3guaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICAqIOi9rOWMluaXtumXtFxyXG4gICAgICAqL1xyXG4gICAgIHByaXZhdGUgX3REKHllYXI6IG51bWJlcnxEYXRlfHN0cmluZ3wgRGF0ZVRpbWVyLCBtb250aD86IG51bWJlcik6IERhdGUge1xyXG4gICAgICAgICBpZiAoIXllYXIpIHtcclxuICAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGlmICh0eXBlb2YgeWVhciA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgcmV0dXJuIHllYXIgaW5zdGFuY2VvZiBEYXRlVGltZXIgPyB5ZWFyLmdldERhdGVPck51bGwoKSA6IHllYXI7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgaWYgKHR5cGVvZiB5ZWFyID09ICdudW1iZXInIFxyXG4gICAgICAgICAmJiB0eXBlb2YgbW9udGggPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCAtIDEsIDEpO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIC8vIOino+WGs3NhZmFyaSDml6Dms5Xor4bliKsgLSBcclxuICAgICAgICAgaWYgKHR5cGVvZiB5ZWFyID09ICdzdHJpbmcnICYmIHllYXIuaW5kZXhPZignLScpID4gMCkge1xyXG4gICAgICAgICAgICAgeWVhci5yZXBsYWNlKCctJywgJy8nKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHllYXIpO1xyXG4gICAgICAgICBpZiAoaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSB7XHJcbiAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgICB9XHJcblxyXG4gICAgIHB1YmxpYyBkb25lKGNhbGxiYWNrOiAoZGF0ZTogRGF0ZSwgZWxlbWVudDogSlF1ZXJ5KSA9PiBhbnkpOiB0aGlzIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vbignZG9uZScsIGNhbGxiYWNrKTtcclxuICAgICB9XHJcbn1cclxuXHJcbmludGVyZmFjZSBEYXRlVGltZXJPcHRpb25zIHtcclxuICAgIGZvcm1hdD86IHN0cmluZywgLy/ml6XmnJ/moLzlvI9cclxuICAgIG1pbj86IHN0cmluZyB8IERhdGUgfCBEYXRlVGltZXIsIC8v5pyA5bCP5pel5pyfXHJcbiAgICBtYXg/OiBzdHJpbmcgfCBEYXRlIHwgRGF0ZVRpbWVyLCAvL+acgOWkp+aXpeacn1xyXG4gICAgbWluWWVhcj86IG51bWJlciwgICAgIC8vIOWBmuagh+etvueUqFxyXG4gICAgbWF4WWVhcj86IG51bWJlcixcclxuICAgIG9uZG9uZT86IChkYXRlOiBEYXRlLCBlbGVtZW50OiBKUXVlcnkpID0+IGFueSxcclxuICAgIG9uY2xpY2s/OiAoZGF0ZTogRGF0ZSwgZWxlbWVudDogSlF1ZXJ5KSA9PiBhbnksICAgLy8g54K55Ye75LqL5Lu2XHJcbiAgICBvbmVycm9yPzogKGRhdGU6IERhdGUsIGVsZW1lbnQ6IEpRdWVyeSkgPT4gYW55LCAgLy8g54K55Ye76ZSZ6K+v55qEXHJcbiAgICB0aXRsZT86IHN0cmluZ1xyXG4gfVxyXG5cclxuY2xhc3MgRGF0ZVRpbWVyRGVmYXVsdE9wdGlvbnMgaW1wbGVtZW50cyBEYXRlVGltZXJPcHRpb25zIHtcclxuICAgIGZvcm1hdDogc3RyaW5nID0gXCJ5LW0tZCBoOmk6c1wiOyAvL+aXpeacn+agvOW8j1xyXG4gICAgbWluOiBzdHJpbmcgPSBcIjE5MDAvMDEvMDEgMDA6MDA6MDBcIjsgLy/mnIDlsI/ml6XmnJ8gICAgc2FmYXJpIOS4i+iHquWKqOivhuWIq+aIkOaXpeacn+agvOW8jyDlj6rorqQgL1xyXG4gICAgbWF4OiBzdHJpbmcgPSBcIjIwOTkvMTIvMzEgMjM6NTk6NTlcIjsgLy/mnIDlpKfml6XmnJ9cclxuICAgIHRpdGxlOiBzdHJpbmcgPSBcInnlubRt5pyIXCI7ICAgICAgICAgICAgLy8g5qCH6aKY5qCP55qE5pel5pyf5qC85byPXHJcbiAgICBtaW5ZZWFyOiBudW1iZXIgPSAxOTAwOyAgICAgLy8g5YGa5qCH562+55SoXHJcbiAgICBtYXhZZWFyOiBudW1iZXIgPSAyMDk5O1xyXG59XHJcbiBcclxuOyhmdW5jdGlvbigkOiBhbnkpIHtcclxuICAgICQuZm4uZGF0ZXRpbWVyID0gZnVuY3Rpb24ob3B0aW9ucyA/OiBEYXRlVGltZXJPcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZXIodGhpcywgb3B0aW9ucyk7IFxyXG4gICAgfTtcclxufSkoalF1ZXJ5KTsiXX0=
