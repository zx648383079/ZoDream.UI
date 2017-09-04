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
        var instance = _this;
        _this.element.focus(function () {
            $('[data-type=datetimer]').hide();
            instance.init($(this).val());
        });
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
        this.element.click(function (e) {
            e.stopPropagation();
        });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LnRzIiwiYm94LnRzIiwianF1ZXJ5LmRhdGV0aW1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7SUFBQTtJQW1CQSxDQUFBO0lBaEJBLGdCQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsUUFBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsc0JBQUEsR0FBQSxVQUFBLEtBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHFCQUFBLEdBQUEsVUFBQSxLQUFBO1FBQUEsY0FBQTthQUFBLFVBQUEsRUFBQSxxQkFBQSxFQUFBLElBQUE7WUFBQSw2QkFBQTs7UUFDQSxJQUFBLFNBQUEsR0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLFlBQUEsSUFBQSxTQUFBLElBQUEsR0FBQTs7SUFDQSxDQUFBO0lBQ0EsVUFBQTtBQUFBLENBbkJBLEFBbUJBLElBQUE7QUNuQkE7SUFBQSx1QkFBQTtJQUFBOztJQWdDQSxDQUFBO0lBMUJBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx5QkFBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQTs7OztPQUlBO0lBQ0EsV0FBQSxHQUFBLFVBQUEsVUFBQSxFQUFBLE9BQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxPQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsVUFBQTtBQUFBLENBaENBLEFBZ0NBLENBaENBLEdBQUEsR0FnQ0E7QUNoQ0E7Ozs7OztHQU1BO0FBRUE7O0dBRUE7QUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsR0FBQTtJQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsQ0FBQSxDQUFBO0FBQ0E7O0dBRUE7QUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLEdBQUE7SUFBQSxvQkFBQSxFQUFBLGNBQUE7SUFDQSxJQUFBLENBQUEsR0FBQTtRQUNBLElBQUEsRUFBQSxJQUFBLENBQUEsV0FBQSxFQUFBO1FBQ0EsSUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUE7UUFDQSxJQUFBLEVBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTtRQUNBLElBQUEsRUFBQSxJQUFBLENBQUEsUUFBQSxFQUFBO1FBQ0EsSUFBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLEVBQUE7UUFDQSxJQUFBLEVBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQTtRQUNBLElBQUEsRUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLEdBQUEsRUFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsS0FBQTtLQUNBLENBQUE7SUFDQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsR0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsQ0FBQSxDQUFBO0FBRUE7O0dBRUE7QUFDQTtJQUFBLDZCQUFBO0lBQ0EsbUJBQ0EsT0FBQSxFQUNBLE9BQUE7UUFGQSxZQUlBLGlCQUFBLFNBaUJBO1FBcEJBLGFBQUEsR0FBQSxPQUFBLENBQUE7UUFxREE7O1dBRUE7UUFDQSxjQUFBLEdBQUEsSUFBQSxDQUFBO1FBcERBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSx1QkFBQSxFQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsS0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBOztJQUNBLENBQUE7SUEwQ0E7O09BRUE7SUFDQSwyQkFBQSxHQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsMkJBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSx3QkFBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7O09BRUE7SUFDQSw4QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBLENBQUEscURBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxvVkFBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxLQUFBLENBQUE7Y0FDQSwrRkFBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBO2NBQ0EseUVBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7WUFDQSw4Q0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsb0ZBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtnQkFDQSwyRUFBQTtnQkFDQSxHQUFBO2dCQUNBLDJFQUFBO2dCQUNBLEdBQUE7Z0JBQ0EsOENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLElBQUEsUUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsc0xBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUVBLElBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLDBCQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0Esd0JBQUEsR0FBQSxVQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSx3QkFBQSxHQUFBLFVBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxJQUFBO1FBQUEsa0JBQUEsRUFBQSxLQUFBO1FBQUEscUJBQUEsRUFBQSxXQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsR0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxJQUFBLFdBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0Esd0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxZQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGtDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGlDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxnQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsV0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7O09BRUE7SUFDQSw0QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsV0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7O09BRUE7SUFDQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7T0FFQTtJQUNBLDZCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7OztPQUlBO0lBQ0EsNEJBQUEsR0FBQSxVQUFBLElBQUEsRUFBQSxLQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0Esb0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxZQUFBLFNBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsWUFBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsV0FBQSxFQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0Esb0NBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsV0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7T0FFQTtJQUNBLG1DQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxvQ0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLEtBQUE7UUFDQSxJQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1FBQ0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxDQUFBLFNBQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7O09BR0E7SUFDQSwrQkFBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7O09BR0E7SUFDQSxnQ0FBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxXQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7OztPQUdBO0lBQ0EsK0JBQUEsR0FBQSxVQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOzs7T0FHQTtJQUNBLGlDQUFBLEdBQUEsVUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7OztPQUdBO0lBQ0EsaUNBQUEsR0FBQSxVQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7T0FFQTtJQUNBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFdBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtRQUNBLEtBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsV0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQTtZQUNBLElBQUEsRUFBQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxFQUFBLENBQUEsUUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQTtZQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxFQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0EsZ0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOzs7O09BSUE7SUFDQSx3QkFBQSxHQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLG1CQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxHQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEdBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7WUFDQSxHQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0EsOEJBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFFQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsYUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFFQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBO1FBRUEsQ0FBQSxDQUFBLENBQUE7UUFFQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxPQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtnQkFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7b0JBQ0EsUUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtvQkFDQSxRQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO29CQUNBLFFBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtvQkFDQSxNQUFBLENBQUE7Z0JBQ0EsQ0FBQTtnQkFDQSxRQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxhQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsYUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxLQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLFdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLElBQUEsUUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxZQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLFlBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLElBQUEsUUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxZQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLFlBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUVBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsU0FBQSxFQUFBO2dCQUNBLFFBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxVQUFBLEVBQUE7Z0JBQ0EsUUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtTQUNBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSw2QkFBQSxHQUFBLFVBQUEsT0FBQTtRQUNBLElBQUEsR0FBQSxHQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFlBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQUEsSUFBQSxDQUFBLENBQUE7WUFDQTs7ZUFFQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxDQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxJQUFBLENBQUEsWUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQTs7OztPQUlBO0lBQ0EsdUJBQUEsR0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0E7Ozs7T0FJQTtJQUNBLHVCQUFBLEdBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBOztPQUVBO0lBQ0EsdUJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsNkJBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxJQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxJQUFBLEdBQUEsR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EseUJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsMEJBQUEsR0FBQSxVQUFBLE1BQUE7UUFBQSx1QkFBQSxFQUFBLGNBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHVCQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsS0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxZQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUE7ZUFDQSxPQUFBLEtBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLG1CQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsUUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsd0JBQUEsR0FBQSxVQUFBLFFBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZ0JBQUE7QUFBQSxDQTlsQkEsQUE4bEJBLENBOWxCQSxHQUFBLEdBOGxCQTtBQWNBO0lBQUE7UUFDQSxXQUFBLEdBQUEsYUFBQSxDQUFBLENBQUEsTUFBQTtRQUNBLFFBQUEsR0FBQSxxQkFBQSxDQUFBLENBQUEsZ0NBQUE7UUFDQSxRQUFBLEdBQUEscUJBQUEsQ0FBQSxDQUFBLE1BQUE7UUFDQSxVQUFBLEdBQUEsTUFBQSxDQUFBLENBQUEsV0FBQTtRQUNBLFlBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQSxPQUFBO1FBQ0EsWUFBQSxHQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSw4QkFBQTtBQUFBLENBUEEsQUFPQSxJQUFBO0FBRUEsQ0FBQTtBQUFBLENBQUEsVUFBQSxDQUFBO0lBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxPQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtJQUNBLENBQUEsQ0FBQTtBQUNBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBIiwiZmlsZSI6ImpxdWVyeS5kYXRldGltZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhYnN0cmFjdCBjbGFzcyBFdmUge1xyXG4gICAgcHVibGljIG9wdGlvbnM6IGFueTtcclxuXHJcbiAgICBwdWJsaWMgb24oZXZlbnQ6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zWydvbicgKyBldmVudF0gPSBjYWxsYmFjaztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGFzRXZlbnQoZXZlbnQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ29uJyArIGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJpZ2dlcihldmVudDogc3RyaW5nLCAuLi4gYXJnczogYW55W10pIHtcclxuICAgICAgICBsZXQgcmVhbEV2ZW50ID0gJ29uJyArIGV2ZW50O1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNFdmVudChldmVudCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3JlYWxFdmVudF0uY2FsbCh0aGlzLCAuLi5hcmdzKTtcclxuICAgIH1cclxufSIsImFic3RyYWN0IGNsYXNzIEJveCBleHRlbmRzIEV2ZSB7XHJcblxyXG4gICAgcHVibGljIGVsZW1lbnQ6IEpRdWVyeTtcclxuXHJcbiAgICBwdWJsaWMgYm94OiBKUXVlcnk7XHJcblxyXG4gICAgcHJvdGVjdGVkIHNob3dQb3NpdGlvbigpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5ib3guc2hvdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzZXRQb3NpdGlvbigpOiB0aGlzIHtcclxuICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5lbGVtZW50Lm9mZnNldCgpO1xyXG4gICAgICAgIGxldCB4ID0gb2Zmc2V0LmxlZnQgLSAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpO1xyXG4gICAgICAgIGxldCB5ID0gb2Zmc2V0LnRvcCArIHRoaXMuZWxlbWVudC5vdXRlckhlaWdodCgpIC0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgICAgIHRoaXMuYm94LmNzcyh7bGVmdDogeCArIFwicHhcIiwgdG9wOiB5ICsgXCJweFwifSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u5Y+v6IO95piv55u45a+55YC86I635Y+W57ud5a+55YC8XHJcbiAgICAgKiBAcGFyYW0gYWJzZXJ2YWJsZSBcclxuICAgICAqIEBwYXJhbSByZWx0aXZlIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldFJlYWwoYWJzZXJ2YWJsZTogbnVtYmVyLCByZWx0aXZlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGlmIChyZWx0aXZlID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVsdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFic2VydmFibGUgKiByZWx0aXZlO1xyXG4gICAgfVxyXG59IiwiLyohXHJcbiAqIGpxdWVyeS5kYXRldGltZXIgLSBodHRwczovL2dpdGh1Yi5jb20veng2NDgzODMwNzkvWm9EcmVhbS5VSVxyXG4gKiBWZXJzaW9uIC0gMS4wXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSAtIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDE3IFpvRHJlYW1cclxuICovXHJcblxyXG4vKipcclxuICog6I635Y+W55yf5a6e55qE5pyI5Lu9XHJcbiAqL1xyXG5EYXRlLnByb3RvdHlwZS5nZXRSZWFsTW9udGggPSBmdW5jdGlvbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9udGgoKSArIDE7XHJcbn07XHJcbi8qKlxyXG4gKiDmoLzlvI/ljJbml6XmnJ9cclxuICovXHJcbkRhdGUucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKGZtdDogc3RyaW5nID0gJ3nlubRt5pyIZOaXpScpOiBzdHJpbmcge1xyXG4gICAgbGV0IG8gPSB7XHJcbiAgICAgICAgXCJ5K1wiOiB0aGlzLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgXCJtK1wiOiB0aGlzLmdldFJlYWxNb250aCgpLCAvL+aciOS7vSBcclxuICAgICAgICBcImQrXCI6IHRoaXMuZ2V0RGF0ZSgpLCAvL+aXpSBcclxuICAgICAgICBcImgrXCI6IHRoaXMuZ2V0SG91cnMoKSwgLy/lsI/ml7YgXHJcbiAgICAgICAgXCJpK1wiOiB0aGlzLmdldE1pbnV0ZXMoKSwgLy/liIYgXHJcbiAgICAgICAgXCJzK1wiOiB0aGlzLmdldFNlY29uZHMoKSwgLy/np5IgXHJcbiAgICAgICAgXCJxK1wiOiBNYXRoLmZsb29yKCh0aGlzLmdldE1vbnRoKCkgKyAzKSAvIDMpLCAvL+Wto+W6plxyXG4gICAgICAgIFwiU1wiOiB0aGlzLmdldE1pbGxpc2Vjb25kcygpIC8v5q+r56eSIFxyXG4gICAgfTtcclxuICAgIGZvciAobGV0IGsgaW4gbykge1xyXG4gICAgICAgIGlmIChuZXcgUmVnRXhwKFwiKFwiICsgayArIFwiKVwiKS50ZXN0KGZtdCkpIHtcclxuICAgICAgICAgICAgZm10ID0gZm10LnJlcGxhY2UoUmVnRXhwLiQxLCAoUmVnRXhwLiQxLmxlbmd0aCA9PSAxKSA/IChvW2tdKSA6ICgoXCIwMFwiICsgb1trXSkuc3Vic3RyKChcIlwiICsgb1trXSkubGVuZ3RoKSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmbXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlt7Lnn6Xpl67popjlvZPmnIDlpKflgLzmnIDlsI/lgLzkuLpEYXRlVGltZXIg5pe25peg5rOV5q2j56Gu5pi+56S6XHJcbiAqL1xyXG5jbGFzcyBEYXRlVGltZXIgZXh0ZW5kcyBCb3gge1xyXG4gICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgICBwdWJsaWMgZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICAgICBvcHRpb25zPzogRGF0ZVRpbWVyT3B0aW9uc1xyXG4gICAgICkge1xyXG4gICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgbmV3IERhdGVUaW1lckRlZmF1bHRPcHRpb25zKCksIG9wdGlvbnMpO1xyXG4gICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5taW4gIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm1pbiA9IHRoaXMuX3REKHRoaXMub3B0aW9ucy5taW4pO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm1heCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMubWF4ID0gdGhpcy5fdEQodGhpcy5vcHRpb25zLm1heCk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5mb3JtYXQuaW5kZXhPZignaCcpIDwgMCkge1xyXG4gICAgICAgICAgICAgdGhpcy5faGFzVGltZSA9IGZhbHNlO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRoaXMuY3JlYXRlSHRtbCgpO1xyXG4gICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICB0aGlzLmVsZW1lbnQuZm9jdXMoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJ1tkYXRhLXR5cGU9ZGF0ZXRpbWVyXScpLmhpZGUoKTtcclxuICAgICAgICAgICAgaW5zdGFuY2UuaW5pdCgkKHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9wdGlvbnM6IERhdGVUaW1lck9wdGlvbnM7XHJcblxyXG4gICAgcHVibGljIGJveDogSlF1ZXJ5O1xyXG4gICAgLyoqXHJcbiAgICAgKiDlubTmnIjpgInmi6npnaLmnb9cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfeWVhckdyaWQ6IEpRdWVyeTtcclxuICAgIC8qKlxyXG4gICAgICog5pe26Ze06YCJ5oup6Z2i5p2/XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2RheUdyaWQ6IEpRdWVyeTtcclxuICAgIC8qKlxyXG4gICAgICog5bm06YCJ5oup5YiX6KGoXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3llYXJCb3g6IEpRdWVyeTtcclxuICAgIC8qKlxyXG4gICAgICog5pyI5Lu96YCJ5oup5YiX6KGoXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX21vbnRoQm94OiBKUXVlcnk7XHJcbiAgICAvKipcclxuICAgICAqIOWwj+aXtumAieaLqeWIl+ihqFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9ob3VyQm94OiBKUXVlcnk7XHJcbiAgICAvKipcclxuICAgICAqIOWIhumSn+mAieaLqeWIl+ihqFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9taW51dGVCb3g6IEpRdWVyeTtcclxuICAgIC8qKlxyXG4gICAgICog56eS6YCJ5oup5YiX6KGoXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3NlY29uZEJveDogSlF1ZXJ5O1xyXG4gICAgLyoqXHJcbiAgICAgKiDmmK/lkKbmnInml7bpl7RcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfaGFzVGltZTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlvZPliY3ml6XmnJ/ml7bpl7RcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY3VycmVudERhdGU6IERhdGU7XHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluiuvue9rueahOacgOWwj+WAvFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9nZXRNaW4oKTogRGF0ZSB7XHJcbiAgICAgICAgbGV0IGRhdGUgPSB0aGlzLl90RCh0aGlzLm9wdGlvbnMubWluKTtcclxuICAgICAgICBpZiAoIWRhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9oYXNUaW1lKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0SG91cnMoMjMsIDU5LCA1OSwgOTkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluiuvue9rueahOacgOWkp+WAvFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9nZXRNYXgoKTogRGF0ZSB7XHJcbiAgICAgICAgbGV0IGRhdGUgPSB0aGlzLl90RCh0aGlzLm9wdGlvbnMubWF4KTtcclxuICAgICAgICBpZiAoIWRhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9oYXNUaW1lKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yid5aeL5YyWXHJcbiAgICAgKiBAcGFyYW0gdGltZSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGluaXQodGltZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5zaG93RGF0ZSh0aW1lKTtcclxuICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICB0aGlzLl9yZWZyZXNoVGltZSgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rlhYPntKBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNyZWF0ZUh0bWwoKSB7XHJcbiAgICAgICAgdGhpcy5ib3ggPSAkKCc8ZGl2IGNsYXNzPVwiZGF0ZXRpbWVyXCIgZGF0YS10eXBlPVwiZGF0ZXRpbWVyXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgbGV0IGxpcyA9IHRoaXMuX25MaSg2MCwgMCk7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImhlYWRlclwiPjxpIGNsYXNzPVwiZmEgZmEtYmFja3dhcmQgcHJldmlvdXNZZWFyXCI+PC9pPjxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1sZWZ0IHByZXZpb3VzTW9udGhcIj48L2k+PHNwYW4+PC9zcGFuPjxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1yaWdodCBuZXh0TW9udGhcIj48L2k+PGkgY2xhc3M9XCJmYSBmYS1mb3J3YXJkIG5leHRZZWFyXCI+PC9pPjwvZGl2PjxkaXYgY2xhc3M9XCJib2R5XCI+PGRpdiBjbGFzcz1cIm1vbnRoLWdyaWRcIj48b2w+PGxpPuaXpTwvbGk+PGxpPuS4gDwvbGk+PGxpPuS6jDwvbGk+PGxpPuS4iTwvbGk+PGxpPuWbmzwvbGk+PGxpPuS6lDwvbGk+PGxpPuWFrTwvbGk+PC9vbD48dWw+JytcclxuICAgICAgICB0aGlzLl9uTGkoNDIsIDAsIGZhbHNlKSBcclxuICAgICAgICArJzwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cInllYXItZ3JpZFwiPjxkaXYgY2xhc3M9XCJsaXN0LWdyb3VwIHllYXJcIj48ZGl2IGNsYXNzPVwidGl0bGVcIj7lubQ8L2Rpdj48dWw+JytcclxuICAgICAgICB0aGlzLl9uTGkodGhpcy5vcHRpb25zLm1heFllYXIgKyAxLCB0aGlzLm9wdGlvbnMubWluWWVhcilcclxuICAgICAgICArJzwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cImxpc3QtZ3JvdXAgbW9udGhcIj48ZGl2IGNsYXNzPVwidGl0bGVcIj7mnIg8L2Rpdj48dWw+JysgXHJcbiAgICAgICAgdGhpcy5fbkxpKDEzLCAxKSArXHJcbiAgICAgICAgJzwvdWw+PC9kaXY+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZVwiPjwvaT48L2Rpdj4nO1xyXG4gICAgICAgIGlmICh0aGlzLl9oYXNUaW1lKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJkYXktZ3JpZFwiPjxkaXYgY2xhc3M9XCJsaXN0LWdyb3VwIGhvdXJcIj48ZGl2IGNsYXNzPVwidGl0bGVcIj7lsI/ml7Y8L2Rpdj48dWw+JysgdGhpcy5fbkxpKDI0KSArXHJcbiAgICAgICAgICAgICc8L3VsPjwvZGl2PjxkaXYgY2xhc3M9XCJsaXN0LWdyb3VwIG1pbnV0ZVwiPjxkaXYgY2xhc3M9XCJ0aXRsZVwiPuWIhumSnzwvZGl2Pjx1bD4nKyBcclxuICAgICAgICAgICAgbGlzICtcclxuICAgICAgICAgICAgJzwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cImxpc3QtZ3JvdXAgc2Vjb25kXCI+PGRpdiBjbGFzcz1cInRpdGxlXCI+56eS6ZKfPC9kaXY+PHVsPicrXHJcbiAgICAgICAgICAgIGxpcyArXHJcbiAgICAgICAgICAgICc8L3VsPjwvZGl2PjxpIGNsYXNzPVwiZmEgZmEtY2xvc2VcIj48L2k+PC9kaXY+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgaHRtbCArPSAnPC9kaXY+JztcclxuICAgICAgICBpZiAodGhpcy5faGFzVGltZSkge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiZm9vdGVyXCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJob3VyXCIgdmFsdWU9XCIwMFwiPjo8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cIm1pbnV0ZVwiIHZhbHVlPVwiMDBcIj46PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJzZWNvbmRcIiB2YWx1ZT1cIjAwXCI+PGJ1dHRvbj7noa7lrpo8L2J1dHRvbj48L2Rpdj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJveC5odG1sKGh0bWwpO1xyXG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHRoaXMuYm94KTtcclxuXHJcbiAgICAgICAgdGhpcy5feWVhckJveCA9IHRoaXMuYm94LmZpbmQoXCIuYm9keSAueWVhci1ncmlkIC55ZWFyIHVsXCIpO1xyXG4gICAgICAgIHRoaXMuX21vbnRoQm94ID0gdGhpcy5ib3guZmluZChcIi5ib2R5IC55ZWFyLWdyaWQgLm1vbnRoIHVsXCIpO1xyXG4gICAgICAgIHRoaXMuX3llYXJHcmlkID0gdGhpcy5ib3guZmluZChcIi5ib2R5IC55ZWFyLWdyaWRcIik7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc1RpbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGF5R3JpZCA9IHRoaXMuYm94LmZpbmQoXCIuYm9keSAuZGF5LWdyaWRcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX2hvdXJCb3ggPSB0aGlzLmJveC5maW5kKFwiLmJvZHkgLmRheS1ncmlkIC5ob3VyIHVsXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9taW51dGVCb3ggPSB0aGlzLmJveC5maW5kKFwiLmJvZHkgLmRheS1ncmlkIC5taW51dGUgdWxcIik7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlY29uZEJveCA9IHRoaXMuYm94LmZpbmQoXCIuYm9keSAuZGF5LWdyaWQgLnNlY29uZCB1bFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYmluZEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgIC8qKlxyXG4gICAgICAqIOagvOW8j+WMluaVsOWtl1xyXG4gICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfaVRzKGk6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKGkgPCAxMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJzAnICsgaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGkudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcbiAgICAgLyoqXHJcbiAgICAgICog55Sf5oiQ5oyH5a6a5pWw55uu55qEbGlcclxuICAgICAgKi9cclxuICAgIHByaXZhdGUgX25MaShsZW5ndGg6IG51bWJlciwgaTogbnVtYmVyID0gMCwgaGFzTiA9IHRydWUpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBodG1sID0gJyc7XHJcbiAgICAgICAgZm9yKDsgaSA8IGxlbmd0aDsgaSArKykge1xyXG4gICAgICAgICAgICBpZiAoIWhhc04pIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxsaT48L2xpPic7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBodG1sICs9ICc8bGk+JyArIHRoaXMuX2lUcyhpKSArICc8L2xpPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBodG1sO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S6XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvcGVuKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmJveC5jc3MoJ3Bvc2l0aW9uJykgPT0gJ2ZpeGVkJykge1xyXG4gICAgICAgICAgICAvLyDmuIXpmaTpobXpnaLkuIrnmoRjc3NcclxuICAgICAgICAgICAgdGhpcy5ib3guYXR0cignc3R5bGUnLCAnJykuc2hvdygpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2hvd1Bvc2l0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5blvZPliY3orr7nva7nmoTml7bpl7RcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEN1cnJlbnREYXRlKCk6IERhdGUge1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50RGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudERhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50RGF0ZSA9IHRoaXMuX3REKHRoaXMuYm94LmRhdGEoXCJkYXRlXCIpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluW9k+WJjeaXtumXtFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0RGF0ZU9yTnVsbCgpIDogRGF0ZSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnREYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50RGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS4iuS4gOW5tFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcHJldmlvdXNZZWFyKCkge1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZVllYXIodGhpcy5nZXRDdXJyZW50RGF0ZSgpLmdldEZ1bGxZZWFyKCkgLSAxKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5LiL5LiA5bm0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBuZXh0WWVhcigpIHtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VZZWFyKHRoaXMuZ2V0Q3VycmVudERhdGUoKS5nZXRGdWxsWWVhcigpICsgMSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOS4iuaciFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcHJldmlvdXNNb250aCgpIHtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VNb250aCh0aGlzLmdldEN1cnJlbnREYXRlKCkuZ2V0TW9udGgoKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOS4i+aciFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbmV4dE1vbnRoKCkge1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZU1vbnRoKHRoaXMuZ2V0Q3VycmVudERhdGUoKS5nZXRNb250aCgpICsgMik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuaXpeacn1xyXG4gICAgICogQHBhcmFtIHllYXIgXHJcbiAgICAgKiBAcGFyYW0gbW9udGggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzaG93RGF0ZSh5ZWFyOiBudW1iZXJ8RGF0ZXxzdHJpbmcsIG1vbnRoPzogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudERhdGUgPSB0aGlzLl90RCh5ZWFyLCBtb250aCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9oYXNUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnREYXRlLnNldEhvdXJzKDEyLCAwLCAwLCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ib3guZGF0YSgnZGF0ZScsIHRoaXMuX2N1cnJlbnREYXRlKTtcclxuICAgICAgICB0aGlzLl9yZWZyZXNoRGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpkojlr7nmnIDlpKflgLzmnIDlsI/lgLzliqjmgIHojrflj5bnmoTmg4XlhrXph43mlrDliLfmlrDlubTpgInmi6lcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfcmVmcmVzaFllYXJMaXN0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubWluIGluc3RhbmNlb2YgRGF0ZVRpbWVyICYmIHRoaXMub3B0aW9ucy5tYXggaW5zdGFuY2VvZiBEYXRlVGltZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5feWVhckJveC5odG1sKHRoaXMuX25MaSh0aGlzLl9nZXRNYXgoKS5nZXRGdWxsWWVhcigpICsgMSwgdGhpcy5fZ2V0TWluKCkuZ2V0RnVsbFllYXIoKSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yi35paw5bm05pyI5YiX6KGoXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3JlZnJlc2hZZWFyR3JpZCgpIHtcclxuICAgICAgICB0aGlzLl9yZWZyZXNoWWVhckxpc3QoKTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5feWVhckJveCwgdGhpcy5fY3VycmVudERhdGUuZ2V0RnVsbFllYXIoKSAtIHRoaXMuX2dldE1pbigpLmdldEZ1bGxZZWFyKCkpO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl9tb250aEJveCwgdGhpcy5fY3VycmVudERhdGUuZ2V0TW9udGgoKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOWIt+aWsOaXtumXtOWIl+ihqFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9yZWZyZXNoRGF5R3JpZCgpIHtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5faG91ckJveCwgdGhpcy5fY3VycmVudERhdGUuZ2V0SG91cnMoKSk7XHJcbiAgICAgICAgdGhpcy5fY2hhbmdlTGlzdEdyb3VwKHRoaXMuX21pbnV0ZUJveCwgdGhpcy5fY3VycmVudERhdGUuZ2V0TWludXRlcygpKTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5fc2Vjb25kQm94LCB0aGlzLl9jdXJyZW50RGF0ZS5nZXRTZWNvbmRzKCkpO1xyXG4gICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiDmlLnlj5hsaXN0LWdyb3VwIOS4reeahHVsXHJcbiAgICAgICovXHJcbiAgICBwcml2YXRlIF9jaGFuZ2VMaXN0R3JvdXAoYm94OiBKUXVlcnksIGluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbGkgPSBib3guZmluZChcImxpXCIpLmVxKGluZGV4KTtcclxuICAgICAgICBsaS5hZGRDbGFzcyhcImFjdGl2ZVwiKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIGJveC5zY3JvbGxUb3AobGkub2Zmc2V0KCkudG9wIC0gYm94Lm9mZnNldCgpLnRvcCArIGJveC5zY3JvbGxUb3AoKSAtIGJveC5oZWlnaHQoKSAvIDIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmlLnlj5jlubRcclxuICAgICAqIEBwYXJhbSB5IFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9jaGFuZ2VZZWFyKHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnREYXRlLnNldEZ1bGxZZWFyKHkpO1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hEYXkoKTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5feWVhckJveCwgeSAtIHRoaXMub3B0aW9ucy5taW5ZZWFyKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pS55Y+Y5pyIXHJcbiAgICAgKiBAcGFyYW0gbSBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY2hhbmdlTW9udGgobTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudERhdGUuc2V0TW9udGgobSAtIDEpO1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hEYXkoKTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5feWVhckJveCwgdGhpcy5fY3VycmVudERhdGUuZ2V0RnVsbFllYXIoKSAtIHRoaXMub3B0aW9ucy5taW5ZZWFyKTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5fbW9udGhCb3gsIHRoaXMuX2N1cnJlbnREYXRlLmdldE1vbnRoKCkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiDmlLnlj5jml7ZcclxuICAgICAqIEBwYXJhbSBoIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9jaGFuZ2VIb3VyKGg6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnREYXRlLnNldEhvdXJzKGgpO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoXCIuZm9vdGVyIC5ob3VyXCIpLnZhbCh0aGlzLl9pVHMoaCkpO1xyXG4gICAgICAgIHRoaXMuX2NoYW5nZUxpc3RHcm91cCh0aGlzLl9ob3VyQm94LCBoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pS55Y+Y5YiGXHJcbiAgICAgKiBAcGFyYW0gaSBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY2hhbmdlTWludXRlKGk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnREYXRlLnNldE1pbnV0ZXMoaSk7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZChcIi5mb290ZXIgLm1pbnV0ZVwiKS52YWwodGhpcy5faVRzKGkpKTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5fbWludXRlQm94LCBpKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5pS55Y+Y56eSXHJcbiAgICAgKiBAcGFyYW0gcyBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY2hhbmdlU2Vjb25kKHM6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnREYXRlLnNldFNlY29uZHMocyk7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZChcIi5mb290ZXIgLnNlY29uZFwiKS52YWwodGhpcy5faVRzKHMpKTtcclxuICAgICAgICB0aGlzLl9jaGFuZ2VMaXN0R3JvdXAodGhpcy5fc2Vjb25kQm94LCBzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5Yi35paw5pelXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3JlZnJlc2hEYXkoKSB7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZChcIi5oZWFkZXIgc3BhblwiKS50ZXh0KHRoaXMuX2N1cnJlbnREYXRlLmZvcm1hdCh0aGlzLm9wdGlvbnMudGl0bGUpKTtcclxuICAgICAgICBsZXQgZGF5cyA9IHRoaXMuX21MaSh0aGlzLl9jdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLCB0aGlzLl9jdXJyZW50RGF0ZS5nZXRSZWFsTW9udGgoKSk7XHJcbiAgICAgICAgbGV0IGRheUxpID0gdGhpcy5ib3guZmluZChcIi5ib2R5IC5tb250aC1ncmlkIHVsIGxpXCIpO1xyXG4gICAgICAgIGRheUxpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZVwiKTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIGxldCBjdXJyZW50RGF5ID0gdGhpcy5fY3VycmVudERhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIGRheXMuZm9yRWFjaChmdW5jdGlvbih2LCBpKSB7XHJcbiAgICAgICAgICAgIGxldCBsaSA9IGRheUxpLmVxKGkpLnRleHQoaW5zdGFuY2UuX2lUcyh2KSk7XHJcbiAgICAgICAgICAgIGlmICh2IC0gMTAgPiBpIHx8IHYgKyAxMCA8IGkpIHtcclxuICAgICAgICAgICAgICAgIGxpLmFkZENsYXNzKFwiZGlzYWJsZVwiKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh2ID09IGN1cnJlbnREYXkpIHtcclxuICAgICAgICAgICAgICAgIGxpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgfVxyXG4gICAgIC8qKlxyXG4gICAgICAqIOWIt+aWsOaXtumXtFxyXG4gICAgICAqL1xyXG4gICAgIHByaXZhdGUgX3JlZnJlc2hUaW1lKCkge1xyXG4gICAgICAgICBpZiAoIXRoaXMuX2hhc1RpbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIHRoaXMuX2NoYW5nZUhvdXIodGhpcy5nZXRDdXJyZW50RGF0ZSgpLmdldEhvdXJzKCkpO1xyXG4gICAgICAgICB0aGlzLl9jaGFuZ2VNaW51dGUodGhpcy5nZXRDdXJyZW50RGF0ZSgpLmdldE1pbnV0ZXMoKSk7XHJcbiAgICAgICAgIHRoaXMuX2NoYW5nZVNlY29uZCh0aGlzLmdldEN1cnJlbnREYXRlKCkuZ2V0U2Vjb25kcygpKTtcclxuICAgICB9XHJcbiAgICAgLyoqXHJcbiAgICAgICog6L+U5Zue5aSp55qE5YiX6KGoXHJcbiAgICAgICogQHBhcmFtIHkgXHJcbiAgICAgICogQHBhcmFtIG0gXHJcbiAgICAgICovXHJcbiAgICAgcHJpdmF0ZSBfbUxpKHk6IG51bWJlciwgbTogbnVtYmVyKSA6IEFycmF5PG51bWJlcj4ge1xyXG4gICAgICAgIGxldCBkYXlzID0gW107XHJcbiAgICAgICAgbGV0IFtmLCBjXSA9IHRoaXMuX21EKHksIG0pO1xyXG4gICAgICAgIGxldCBpOiBudW1iZXI7XHJcbiAgICAgICAgaWYgKGYgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCB5YyA9IHRoaXMuX3lEKHksIG0gLSAxKTtcclxuICAgICAgICAgICAgZm9yIChpID0geWMgLSBmICsgMjsgaSA8PSB5YzsgaSArKykge1xyXG4gICAgICAgICAgICAgICAgZGF5cy5wdXNoKGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoaSA9IDE7IGkgPD0gYzsgaSArKykge1xyXG4gICAgICAgICAgICBkYXlzLnB1c2goaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmICsgYyA8IDQzKSB7XHJcbiAgICAgICAgICAgIGxldCBsID0gNDIgLSBmIC0gYyArIDE7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDE7IGkgPD0gbDsgaSArKykge1xyXG4gICAgICAgICAgICAgICAgZGF5cy5wdXNoKGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXlzO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDnu5Hlrprkuovku7ZcclxuICAgICAgKi9cclxuICAgICBwcml2YXRlIF9iaW5kRXZlbnQoKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLmJveC5maW5kKCcubW9udGgtZ3JpZCBsaScpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5fY2xpY2tEYXkoJCh0aGlzKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoXCIucHJldmlvdXNZZWFyXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5wcmV2aW91c1llYXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLnByZXZpb3VzTW9udGhcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLnByZXZpb3VzTW9udGgoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLm5leHRNb250aFwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UubmV4dE1vbnRoKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZChcIi5uZXh0WWVhclwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UubmV4dFllYXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5ib3guZmluZChcIi5oZWFkZXIgc3BhblwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCFpbnN0YW5jZS5feWVhckdyaWQuaXMoXCI6aGlkZGVuXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5feWVhckdyaWQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5faGFzVGltZSkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2RheUdyaWQuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluc3RhbmNlLl95ZWFyR3JpZC5zaG93KCk7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLl9yZWZyZXNoWWVhckdyaWQoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5feWVhckJveC5maW5kKFwibGlcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLl9jaGFuZ2VZZWFyKHBhcnNlSW50KCQodGhpcykudGV4dCgpKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fbW9udGhCb3guZmluZChcImxpXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5fY2hhbmdlTW9udGgocGFyc2VJbnQoJCh0aGlzKS50ZXh0KCkpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyDlhbPpl63pnaLmnb9cclxuICAgICAgICB0aGlzLl95ZWFyR3JpZC5maW5kKCcuZmEtY2xvc2UnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UuX3llYXJHcmlkLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAodGhpcy5faGFzVGltZSkge1xyXG4gICAgICAgICAgICB0aGlzLmJveC5maW5kKFwiLmZvb3RlciBidXR0b25cIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5vdXRwdXQodHJ1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmJveC5maW5kKFwiLmZvb3RlciBpbnB1dFwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5fZGF5R3JpZC5pcyhcIjpoaWRkZW5cIikpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5feWVhckdyaWQuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9kYXlHcmlkLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fcmVmcmVzaERheUdyaWQoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fZGF5R3JpZC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9ob3VyQm94LmZpbmQoXCJsaVwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLl9jaGFuZ2VIb3VyKHBhcnNlSW50KCQodGhpcykudGV4dCgpKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9taW51dGVCb3guZmluZChcImxpXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2NoYW5nZU1pbnV0ZShwYXJzZUludCgkKHRoaXMpLnRleHQoKSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5fc2Vjb25kQm94LmZpbmQoXCJsaVwiKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLl9jaGFuZ2VTZWNvbmQocGFyc2VJbnQoJCh0aGlzKS50ZXh0KCkpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RheUdyaWQuZmluZCgnLmZhLWNsb3NlJykuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fZGF5R3JpZC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKiog5a6e546w6ZqQ6JePICovXHJcbiAgICAgICAgdGhpcy5ib3guY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmJveC5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMubWluID09ICdvYmplY3QnICYmIHRoaXMub3B0aW9ucy5taW4gaW5zdGFuY2VvZiBEYXRlVGltZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm1pbi5kb25lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2N1cnJlbnREYXRlICYmICFpbnN0YW5jZS5jaGVja0RhdGUoaW5zdGFuY2UuX2N1cnJlbnREYXRlKSAmJiBpbnN0YW5jZS5jbGVhcigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMubWF4ID09ICdvYmplY3QnICYmIHRoaXMub3B0aW9ucy5tYXggaW5zdGFuY2VvZiBEYXRlVGltZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm1heC5kb25lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2N1cnJlbnREYXRlICYmICFpbnN0YW5jZS5jaGVja0RhdGUoaW5zdGFuY2UuX2N1cnJlbnREYXRlKSAmJiBpbnN0YW5jZS5jbGVhcigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5zd2lwZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94LnN3aXBlKHtcclxuICAgICAgICAgICAgc3dpcGVMZWZ0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLm5leHRNb250aCgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzd2lwZVJpZ2h0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLnByZXZpb3VzTW9udGgoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog54K55Ye75pel5pyfXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY2xpY2tEYXkoZWxlbWVudDogSlF1ZXJ5KSB7XHJcbiAgICAgICAgbGV0IGRheSA9IHBhcnNlSW50KGVsZW1lbnQudGV4dCgpKTtcclxuICAgICAgICBsZXQgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKHRoaXMuX2N1cnJlbnREYXRlKTtcclxuICAgICAgICBpZiAoIWVsZW1lbnQuaGFzQ2xhc3MoXCJkaXNhYmxlXCIpKSB7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0RGF0ZShkYXkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGF5ID4gZWxlbWVudC5pbmRleCgpKSB7XHJcbiAgICAgICAgICAgIC8qKueCueWHu+S4iuaciOaXpeacnyAqL1xyXG4gICAgICAgICAgICBkYXRlLnNldE1vbnRoKGRhdGUuZ2V0TW9udGgoKSAtIDEpO1xyXG4gICAgICAgICAgICBkYXRlLnNldERhdGUoZGF5KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICog54K55Ye75LiL5pyI5pel5pyfXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBkYXRlLnNldE1vbnRoKGRhdGUuZ2V0TW9udGgoKSArIDEpO1xyXG4gICAgICAgICAgICBkYXRlLnNldERhdGUoZGF5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudHJpZ2dlcignY2xpY2snLCBkYXRlLCBlbGVtZW50KSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5jaGVja0RhdGUoZGF0ZSkpIHtcclxuICAgICAgICAgICAgLy8g6LaF5Ye66IyD5Zu0XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignZXJyb3InLCBkYXRlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0ZS5nZXRNb250aCgpID09IHRoaXMuX2N1cnJlbnREYXRlLmdldE1vbnRoKCkpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcyhcImFjdGl2ZVwiKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZSA9IGRhdGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93RGF0ZShkYXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vdXRwdXQoKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5pyI5Lit5pyA5ZCO5LiA5aSpXHJcbiAgICAgKiBAcGFyYW0geSBcclxuICAgICAqIEBwYXJhbSBtIFxyXG4gICAgICovXHJcbiAgICAgcHJpdmF0ZSBfeUQoeTogbnVtYmVyLCBtOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoeSwgbSwgMCk7XHJcbiAgICAgICAgcmV0dXJuIGRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDojrflj5bnrKzkuIDlpKnlkozmnIDlkI7kuIDlpKlcclxuICAgICAgKiBAcGFyYW0geSBcclxuICAgICAgKiBAcGFyYW0gbSBcclxuICAgICAgKi9cclxuICAgICBwcml2YXRlIF9tRCh5OiBudW1iZXIsIG06IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoeSwgbSwgMCk7XHJcbiAgICAgICAgbGV0IGNvdW50ID0gZGF0ZS5nZXREYXRlKCk7XHJcbiAgICAgICAgZGF0ZS5zZXREYXRlKDEpO1xyXG4gICAgICAgIHJldHVybiBbZGF0ZS5nZXREYXkoKSwgY291bnRdO1xyXG4gICAgIH1cclxuICAgICAvKipcclxuICAgICAgKiDojrflj5blvZPliY3ml7bpl7RcclxuICAgICAgKi9cclxuICAgICBwdWJsaWMgdmFsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudERhdGUoKS5mb3JtYXQodGhpcy5vcHRpb25zLmZvcm1hdCk7XHJcbiAgICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiDpqozor4FEYXRlXHJcbiAgICAgICogQHBhcmFtIGRhdGUgXHJcbiAgICAgICovXHJcbiAgICAgcHVibGljIGNoZWNrRGF0ZShkYXRlOiBEYXRlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgIGxldCBtaW4gPSB0aGlzLl9nZXRNaW4oKTtcclxuICAgICAgICAgaWYgKG1pbiAmJiBkYXRlIDw9IG1pbikge1xyXG4gICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgbGV0IG1heCA9IHRoaXMuX2dldE1heCgpO1xyXG4gICAgICAgICByZXR1cm4gIW1heCB8fCBkYXRlIDwgbWF4O1xyXG4gICAgIH1cclxuXHJcbiAgICAgLyoqXHJcbiAgICAgICog5riF6ZmkXHJcbiAgICAgICovXHJcbiAgICAgcHVibGljIGNsZWFyKCkge1xyXG4gICAgICAgICB0aGlzLl9jdXJyZW50RGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgdGhpcy5lbGVtZW50LnZhbCgnJyk7XHJcbiAgICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiDovpPlh7rml7bpl7RcclxuICAgICAgKiBAcGFyYW0gaXNIaWRlIFxyXG4gICAgICAqL1xyXG4gICAgIHB1YmxpYyBvdXRwdXQoaXNIaWRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoIXRoaXMuY2hlY2tEYXRlKHRoaXMuZ2V0Q3VycmVudERhdGUoKSkpIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdlcnJvcicsIHRoaXMuZ2V0Q3VycmVudERhdGUoKSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZhbHNlID09IHRoaXMudHJpZ2dlcignZG9uZScpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnZhbCh0aGlzLnZhbCgpKTtcclxuICAgICAgICBpZiAoIXRoaXMuX2hhc1RpbWUgfHwgaXNIaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYm94LmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgfVxyXG5cclxuICAgICAvKipcclxuICAgICAgKiDovazljJbml7bpl7RcclxuICAgICAgKi9cclxuICAgICBwcml2YXRlIF90RCh5ZWFyOiBudW1iZXJ8RGF0ZXxzdHJpbmd8IERhdGVUaW1lciwgbW9udGg/OiBudW1iZXIpOiBEYXRlIHtcclxuICAgICAgICAgaWYgKCF5ZWFyKSB7XHJcbiAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICBpZiAodHlwZW9mIHllYXIgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgIHJldHVybiB5ZWFyIGluc3RhbmNlb2YgRGF0ZVRpbWVyID8geWVhci5nZXREYXRlT3JOdWxsKCkgOiB5ZWFyO1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgIGlmICh0eXBlb2YgeWVhciA9PSAnbnVtYmVyJyBcclxuICAgICAgICAgJiYgdHlwZW9mIG1vbnRoID09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGggLSAxLCAxKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgICAvLyDop6PlhrNzYWZhcmkg5peg5rOV6K+G5YirIC0gXHJcbiAgICAgICAgIGlmICh0eXBlb2YgeWVhciA9PSAnc3RyaW5nJyAmJiB5ZWFyLmluZGV4T2YoJy0nKSA+IDApIHtcclxuICAgICAgICAgICAgIHllYXIucmVwbGFjZSgnLScsICcvJyk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh5ZWFyKTtcclxuICAgICAgICAgaWYgKGlzTmFOKGRhdGUuZ2V0VGltZSgpKSkge1xyXG4gICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCk7XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgcmV0dXJuIGRhdGU7XHJcbiAgICAgfVxyXG5cclxuICAgICBwdWJsaWMgZG9uZShjYWxsYmFjazogKGRhdGU6IERhdGUsIGVsZW1lbnQ6IEpRdWVyeSkgPT4gYW55KTogdGhpcyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub24oJ2RvbmUnLCBjYWxsYmFjayk7XHJcbiAgICAgfVxyXG59XHJcblxyXG5pbnRlcmZhY2UgRGF0ZVRpbWVyT3B0aW9ucyB7XHJcbiAgICBmb3JtYXQ/OiBzdHJpbmcsIC8v5pel5pyf5qC85byPXHJcbiAgICBtaW4/OiBzdHJpbmcgfCBEYXRlIHwgRGF0ZVRpbWVyLCAvL+acgOWwj+aXpeacn1xyXG4gICAgbWF4Pzogc3RyaW5nIHwgRGF0ZSB8IERhdGVUaW1lciwgLy/mnIDlpKfml6XmnJ9cclxuICAgIG1pblllYXI/OiBudW1iZXIsICAgICAvLyDlgZrmoIfnrb7nlKhcclxuICAgIG1heFllYXI/OiBudW1iZXIsXHJcbiAgICBvbmRvbmU/OiAoZGF0ZTogRGF0ZSwgZWxlbWVudDogSlF1ZXJ5KSA9PiBhbnksXHJcbiAgICBvbmNsaWNrPzogKGRhdGU6IERhdGUsIGVsZW1lbnQ6IEpRdWVyeSkgPT4gYW55LCAgIC8vIOeCueWHu+S6i+S7tlxyXG4gICAgb25lcnJvcj86IChkYXRlOiBEYXRlLCBlbGVtZW50OiBKUXVlcnkpID0+IGFueSwgIC8vIOeCueWHu+mUmeivr+eahFxyXG4gICAgdGl0bGU/OiBzdHJpbmdcclxuIH1cclxuXHJcbmNsYXNzIERhdGVUaW1lckRlZmF1bHRPcHRpb25zIGltcGxlbWVudHMgRGF0ZVRpbWVyT3B0aW9ucyB7XHJcbiAgICBmb3JtYXQ6IHN0cmluZyA9IFwieS1tLWQgaDppOnNcIjsgLy/ml6XmnJ/moLzlvI9cclxuICAgIG1pbjogc3RyaW5nID0gXCIxOTAwLzAxLzAxIDAwOjAwOjAwXCI7IC8v5pyA5bCP5pel5pyfICAgIHNhZmFyaSDkuIvoh6rliqjor4bliKvmiJDml6XmnJ/moLzlvI8g5Y+q6K6kIC9cclxuICAgIG1heDogc3RyaW5nID0gXCIyMDk5LzEyLzMxIDIzOjU5OjU5XCI7IC8v5pyA5aSn5pel5pyfXHJcbiAgICB0aXRsZTogc3RyaW5nID0gXCJ55bm0beaciFwiOyAgICAgICAgICAgIC8vIOagh+mimOagj+eahOaXpeacn+agvOW8j1xyXG4gICAgbWluWWVhcjogbnVtYmVyID0gMTkwMDsgICAgIC8vIOWBmuagh+etvueUqFxyXG4gICAgbWF4WWVhcjogbnVtYmVyID0gMjA5OTtcclxufVxyXG4gXHJcbjsoZnVuY3Rpb24oJDogYW55KSB7XHJcbiAgICAkLmZuLmRhdGV0aW1lciA9IGZ1bmN0aW9uKG9wdGlvbnMgPzogRGF0ZVRpbWVyT3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWVyKHRoaXMsIG9wdGlvbnMpOyBcclxuICAgIH07XHJcbn0pKGpRdWVyeSk7Il19
