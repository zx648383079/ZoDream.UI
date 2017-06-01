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
var Box = (function () {
    function Box() {
    }
    Box.prototype.showPosition = function () {
        var offset = this.element.offset();
        var x = offset.left;
        var y = offset.top + this.element.outerHeight();
        this.box.css({ left: x + "px", top: y + "px" }).show();
        return this;
    };
    Box.prototype.on = function (event, callback) {
        this.options['on' + event] = callback;
        return this;
    };
    Box.prototype.hasEvent = function (event) {
        return this.options.hasOwnProperty('on' + event);
    };
    Box.prototype.trigger = function (event) {
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
}());
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
        if (this.options.min instanceof DateTimer) {
            return this.options.min.getCurrentDate();
        }
        if (typeof this.options.min == 'string') {
            return this._tD(this.options.min);
        }
        return this.options.min;
    };
    /**
     * 获取设置的最大值
     */
    DateTimer.prototype._getMax = function () {
        if (this.options.max instanceof DateTimer) {
            return this.options.max.getCurrentDate();
        }
        if (typeof this.options.max == 'string') {
            return this._tD(this.options.max);
        }
        return this.options.max;
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
            this._nLi(this._getMax().getFullYear() + 1, this._getMin().getFullYear())
            + '</ul></div><div class="list-group month"><div class="title">月</div><ul>' +
            this._nLi(13, 1) +
            '</ul></div><i class="fa fa-close"></i></div>';
        if (this._hasTime) {
            html += '<div class="day-grid"><div class="list-group hour"><div class="title">小时</div><ul>' + this._nLi(25, 1) +
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
        this._changeListGroup(this._hourBox, this._currentDate.getHours() - 1);
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
        this._changeListGroup(this._yearBox, y - this._getMin().getFullYear());
    };
    /**
     * 改变月
     * @param m
     */
    DateTimer.prototype._changeMonth = function (m) {
        this._currentDate.setMonth(m - 1);
        this._refreshDay();
        this._changeListGroup(this._yearBox, this._currentDate.getFullYear() - this._getMin().getFullYear());
        this._changeListGroup(this._monthBox, this._currentDate.getMonth());
    };
    /**
     * 改变时
     * @param h
     */
    DateTimer.prototype._changeHour = function (h) {
        this._currentDate.setHours(h);
        this.box.find(".footer .hour").val(this._iTs(h));
        this._changeListGroup(this._hourBox, h - 1);
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
        this.box.find(".body .month-grid ul li").click(function () {
            var ele = $(this);
            var day = parseInt(ele.text());
            var date = new Date(instance._currentDate);
            if (!ele.hasClass("disable")) {
                date.setDate(day);
            }
            else if (day > ele.index()) {
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
            if (instance.trigger('click', date, ele) == false) {
                return;
            }
            if (!instance.checkDate(date)) {
                // 超出范围
                instance.trigger('error', date);
                return;
            }
            if (date.getMonth() == instance._currentDate.getMonth()) {
                ele.addClass("active").siblings().removeClass("active");
                instance._currentDate = date;
            }
            else {
                instance.showDate(date);
            }
            instance.output();
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
    DateTimer.prototype.checkDate = function (date) {
        if (this.options.min && date <= this._getMin()) {
            return false;
        }
        return !this.options.max || date < this._getMax();
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
            return year;
        }
        if (typeof year == 'number'
            && typeof month == 'number') {
            return new Date(year, month - 1, 1);
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
        this.min = "1900-01-01 00:00:00"; //最小日期
        this.max = "2099-12-31 23:59:59"; //最大日期
        this.title = "y年m月"; // 标题栏的日期格式
    }
    return DateTimerDefaultOptions;
}());
;
(function ($) {
    $.fn.datetimer = function (options) {
        return new DateTimer(this, options);
    };
})(jQuery);
