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
Date.prototype.getRealMonth = function(): number {
    return this.getMonth() + 1;
};
/**
 * 格式化日期
 */
Date.prototype.format = function(fmt: string = 'y年m月d日'): string {
    let o = {
        "y+": this.getFullYear(),
        "m+": this.getRealMonth(), //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "i+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒 
    };
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

/**
 * 已知问题当最大值最小值为DateTimer 时无法正确显示
 */
class DateTimer extends Box {
     constructor(
         public element: JQuery,
         options?: DateTimerOptions
     ) {
         super();
         this.options = $.extend({}, new DateTimerDefaultOptions(), options);
         if (typeof this.options.min != 'object') {
            this.options.min = this._tD(this.options.min);
         }
         if (typeof this.options.max != 'object') {
            this.options.max = this._tD(this.options.max);
         }
         if (this.options.format.indexOf('h') < 0) {
             this._hasTime = false;
         }
         this.createHtml();
    }

    public options: DateTimerOptions;

    public box: JQuery;
    /**
     * 年月选择面板
     */
    private _yearGrid: JQuery;
    /**
     * 时间选择面板
     */
    private _dayGrid: JQuery;
    /**
     * 年选择列表
     */
    private _yearBox: JQuery;
    /**
     * 月份选择列表
     */
    private _monthBox: JQuery;
    /**
     * 小时选择列表
     */
    private _hourBox: JQuery;
    /**
     * 分钟选择列表
     */
    private _minuteBox: JQuery;
    /**
     * 秒选择列表
     */
    private _secondBox: JQuery;
    /**
     * 是否有时间
     */
    private _hasTime: boolean = true;

    /**
     * 当前日期时间
     */
    private _currentDate: Date;
    /**
     * 获取设置的最小值
     */
    private _getMin(): Date {
        let date = this._tD(this.options.min);
        if (!date) {
            return undefined;
        }
        if (!this._hasTime) {
            date.setHours(23, 59, 59, 99);
        }
        return date;
    }

    /**
     * 获取设置的最大值
     */
    private _getMax(): Date {
        let date = this._tD(this.options.max);
        if (!date) {
            return undefined;
        }
        if (!this._hasTime) {
            date.setHours(0, 0, 0, 0);
        }
        return date;
    }

    /**
     * 初始化
     * @param time 
     */
    public init(time: string) {
        this.showDate(time);
        this.open();
        this._refreshTime();
    }
    /**
     * 创建元素
     */
    public createHtml() {
        this.box = $('<div class="datetimer" data-type="datetimer"></div>');
        let lis = this._nLi(60, 0);
        let html = '<div class="header"><i class="fa fa-backward previousYear"></i><i class="fa fa-chevron-left previousMonth"></i><span></span><i class="fa fa-chevron-right nextMonth"></i><i class="fa fa-forward nextYear"></i></div><div class="body"><div class="month-grid"><ol><li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li></ol><ul>'+
        this._nLi(42, 0, false) 
        +'</ul></div><div class="year-grid"><div class="list-group year"><div class="title">年</div><ul>'+
        this._nLi(this.options.maxYear + 1, this.options.minYear)
        +'</ul></div><div class="list-group month"><div class="title">月</div><ul>'+ 
        this._nLi(13, 1) +
        '</ul></div><i class="fa fa-close"></i></div>';
        if (this._hasTime) {
            html += '<div class="day-grid"><div class="list-group hour"><div class="title">小时</div><ul>'+ this._nLi(24) +
            '</ul></div><div class="list-group minute"><div class="title">分钟</div><ul>'+ 
            lis +
            '</ul></div><div class="list-group second"><div class="title">秒钟</div><ul>'+
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
    }

     /**
      * 格式化数字
      */
    private _iTs(i: number): string {
        if (i < 10) {
            return '0' + i;
        }
        return i.toString();
    }

     /**
      * 生成指定数目的li
      */
    private _nLi(length: number, i: number = 0, hasN = true): string {
        let html = '';
        for(; i < length; i ++) {
            if (!hasN) {
                html += '<li></li>';
                continue;
            }
            html += '<li>' + this._iTs(i) + '</li>';
        }
        return html;
    }

    /**
     * 显示
     */
    public open() {
        if (this.box.css('position') == 'fixed') {
            // 清除页面上的css
            this.box.attr('style', '').show();
            return;
        }
        this.showPosition();
    }

    /**
     * 获取当前设置的时间
     */
    public getCurrentDate(): Date {
        if (this._currentDate) {
            return this._currentDate;
        }
        return this._currentDate = this._tD(this.box.data("date"));
    }

    /**
     * 获取当前时间
     */
    public getDateOrNull() : Date | undefined {
        if (this._currentDate) {
            return this._currentDate;
        }
        return undefined;
    }

    /**
     * 上一年
     */
    public previousYear() {
        this._changeYear(this.getCurrentDate().getFullYear() - 1);
    }
    /**
     * 下一年
     */
    public nextYear() {
        this._changeYear(this.getCurrentDate().getFullYear() + 1);
    }
    /**
     * 上月
     */
    public previousMonth() {
        this._changeMonth(this.getCurrentDate().getMonth());
    }
    /**
     * 下月
     */
    public nextMonth() {
        this._changeMonth(this.getCurrentDate().getMonth() + 2);
    }
    /**
     * 显示日期
     * @param year 
     * @param month 
     */
    public showDate(year: number|Date|string, month?: number) {
        this._currentDate = this._tD(year, month);
        if (!this._hasTime) {
            this._currentDate.setHours(12, 0, 0, 0);
        }
        this.box.data('date', this._currentDate);
        this._refreshDay();
    }

    /**
     * 针对最大值最小值动态获取的情况重新刷新年选择
     */
    private _refreshYearList() {
        if (this.options.min instanceof DateTimer && this.options.max instanceof DateTimer) {
            this._yearBox.html(this._nLi(this._getMax().getFullYear() + 1, this._getMin().getFullYear()));
        }
    }
    /**
     * 刷新年月列表
     */
    private _refreshYearGrid() {
        this._refreshYearList();
        this._changeListGroup(this._yearBox, this._currentDate.getFullYear() - this._getMin().getFullYear());
        this._changeListGroup(this._monthBox, this._currentDate.getMonth());
    }
    /**
     * 刷新时间列表
     */
    private _refreshDayGrid() {
        this._changeListGroup(this._hourBox, this._currentDate.getHours());
        this._changeListGroup(this._minuteBox, this._currentDate.getMinutes());
        this._changeListGroup(this._secondBox, this._currentDate.getSeconds());
    }

     /**
      * 改变list-group 中的ul
      */
    private _changeListGroup(box: JQuery, index: number) {
        let li = box.find("li").eq(index);
        li.addClass("active").siblings().removeClass("active");
        box.scrollTop(li.offset().top - box.offset().top + box.scrollTop() - box.height() / 2);
    }
    /**
     * 改变年
     * @param y 
     */
    private _changeYear(y: number) {
        this._currentDate.setFullYear(y);
        this._refreshDay();
        this._changeListGroup(this._yearBox, y - this.options.minYear);
    }
    /**
     * 改变月
     * @param m 
     */
    private _changeMonth(m: number) {
        this._currentDate.setMonth(m - 1);
        this._refreshDay();
        this._changeListGroup(this._yearBox, this._currentDate.getFullYear() - this.options.minYear);
        this._changeListGroup(this._monthBox, this._currentDate.getMonth());
    }
    /**
     * 改变时
     * @param h 
     */
    private _changeHour(h: number) {
        this._currentDate.setHours(h);
        this.box.find(".footer .hour").val(this._iTs(h));
        this._changeListGroup(this._hourBox, h);
    }
    /**
     * 改变分
     * @param i 
     */
    private _changeMinute(i: number) {
        this._currentDate.setMinutes(i);
        this.box.find(".footer .minute").val(this._iTs(i));
        this._changeListGroup(this._minuteBox, i);
    }
    /**
     * 改变秒
     * @param s 
     */
    private _changeSecond(s: number) {
        this._currentDate.setSeconds(s);
        this.box.find(".footer .second").val(this._iTs(s));
        this._changeListGroup(this._secondBox, s);
    }
    /**
     * 刷新日
     */
    private _refreshDay() {
        this.box.find(".header span").text(this._currentDate.format(this.options.title));
        let days = this._mLi(this._currentDate.getFullYear(), this._currentDate.getRealMonth());
        let dayLi = this.box.find(".body .month-grid ul li");
        dayLi.removeClass("active").removeClass("disable");
        let instance = this;
        let currentDay = this._currentDate.getDate();
        days.forEach(function(v, i) {
            let li = dayLi.eq(i).text(instance._iTs(v));
            if (v - 10 > i || v + 10 < i) {
                li.addClass("disable");
            } else if (v == currentDay) {
                li.addClass("active");
            }
        });
     }
     /**
      * 刷新时间
      */
     private _refreshTime() {
         if (!this._hasTime) {
            return;
         }
         this._changeHour(this.getCurrentDate().getHours());
         this._changeMinute(this.getCurrentDate().getMinutes());
         this._changeSecond(this.getCurrentDate().getSeconds());
     }
     /**
      * 返回天的列表
      * @param y 
      * @param m 
      */
     private _mLi(y: number, m: number) : Array<number> {
        let days = [];
        let [f, c] = this._mD(y, m);
        let i: number;
        if (f > 0) {
            let yc = this._yD(y, m - 1);
            for (i = yc - f + 2; i <= yc; i ++) {
                days.push(i);
            }
        }
        for (i = 1; i <= c; i ++) {
            days.push(i);
        }
        if (f + c < 43) {
            let l = 42 - f - c + 1;
            for (i = 1; i <= l; i ++) {
                days.push(i);
            }
        }
        return days;
     }
     /**
      * 绑定事件
      */
     private _bindEvent() {
        let instance = this;
        this.box.find('.month-grid li').click(function() {
            instance._clickDay($(this));
        });

        this.box.find(".previousYear").click(function() {
            instance.previousYear();
        });
        this.box.find(".previousMonth").click(function() {
            instance.previousMonth();
        });
        this.box.find(".nextMonth").click(function() {
            instance.nextMonth();
        });
        this.box.find(".nextYear").click(function() {
            instance.nextYear();
        });

        this.box.find(".header span").click(function() {
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
        
        this._yearBox.find("li").click(function() {
            instance._changeYear(parseInt($(this).text()));
        });
        this._monthBox.find("li").click(function() {
            instance._changeMonth(parseInt($(this).text()));
        });
        // 关闭面板
        this._yearGrid.find('.fa-close').click(function() {
            instance._yearGrid.hide();
        });
        if (this._hasTime) {
            this.box.find(".footer button").click(function() {
                instance.output(true);
            });
            this.box.find(".footer input").click(function() {
                if (instance._dayGrid.is(":hidden")) {
                    instance._yearGrid.hide();
                    instance._dayGrid.show();
                    instance._refreshDayGrid();
                    return;
                }
                instance._dayGrid.hide();
            });
            this._hourBox.find("li").click(function() {
                instance._changeHour(parseInt($(this).text()));
            });
            this._minuteBox.find("li").click(function() {
                instance._changeMinute(parseInt($(this).text()));
            });
            this._secondBox.find("li").click(function() {
                instance._changeSecond(parseInt($(this).text()));
            });
            this._dayGrid.find('.fa-close').click(function() {
                instance._dayGrid.hide();
            });
        }
        /** 实现隐藏 */
        this.box.click(function(e) {
            e.stopPropagation();
        });
        if (this.element) {
            this.element.click(function(e) {
                e.stopPropagation();
                $('[data-type=datetimer]').hide();
                instance.init($(this).val());
            });
        }

        $(document).click(function() {
            instance.box.hide();
        });
        if (typeof this.options.min == 'object' && this.options.min instanceof DateTimer) {
            this.options.min.done(function() {
                instance._currentDate && !instance.checkDate(instance._currentDate) && instance.clear();
            });
        }
        if (typeof this.options.max == 'object' && this.options.max instanceof DateTimer) {
            this.options.max.done(function() {
                instance._currentDate && !instance.checkDate(instance._currentDate) && instance.clear();
            });
        }

        if (!$.fn.swipe) {
            return;
        }
        this.box.swipe({
            swipeLeft: function() {
                instance.nextMonth();
            },
            swipeRight: function() {
                instance.previousMonth();
            }
        });
    }

    /**
     * 点击日期
     * @param element 
     */
    private _clickDay(element: JQuery) {
        let day = parseInt(element.text());
        let date: Date = new Date(this._currentDate);
        if (!element.hasClass("disable")) {
            date.setDate(day);
        } else if (day > element.index()) {
            /**点击上月日期 */
            date.setMonth(date.getMonth() - 1);
            date.setDate(day);
        } else {
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
        } else {
            this.showDate(date);
        }
        this.output();
    }
    /**
     * 获取月中最后一天
     * @param y 
     * @param m 
     */
     private _yD(y: number, m: number): number {
        let date = new Date(y, m, 0);
        return date.getDate();
     }
     /**
      * 获取第一天和最后一天
      * @param y 
      * @param m 
      */
     private _mD(y: number, m: number): [number, number] {
        let date = new Date(y, m, 0);
        let count = date.getDate();
        date.setDate(1);
        return [date.getDay(), count];
     }
     /**
      * 获取当前时间
      */
     public val(): string {
        return this.getCurrentDate().format(this.options.format);
     }

     /**
      * 验证Date
      * @param date 
      */
     public checkDate(date: Date): boolean {
         let min = this._getMin();
         if (min && date <= min) {
             return false;
         }
        let max = this._getMax();
         return !max || date < max;
     }

     /**
      * 清除
      */
     public clear() {
         this._currentDate = undefined;
         this.element.val('');
     }

     /**
      * 输出时间
      * @param isHide 
      */
     public output(isHide: boolean = false) {
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
     }

     /**
      * 转化时间
      */
     private _tD(year: number|Date|string| DateTimer, month?: number): Date {
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
         let date = new Date(year);
         if (isNaN(date.getTime())) {
             return new Date();
         }
         return date;
     }

     public done(callback: (date: Date, element: JQuery) => any): this {
        return this.on('done', callback);
     }
}

interface DateTimerOptions {
    format?: string, //日期格式
    min?: string | Date | DateTimer, //最小日期
    max?: string | Date | DateTimer, //最大日期
    minYear?: number,     // 做标签用
    maxYear?: number,
    ondone?: (date: Date, element: JQuery) => any,
    onclick?: (date: Date, element: JQuery) => any,   // 点击事件
    onerror?: (date: Date, element: JQuery) => any,  // 点击错误的
    title?: string
 }

class DateTimerDefaultOptions implements DateTimerOptions {
    format: string = "y-m-d h:i:s"; //日期格式
    min: string = "1900/01/01 00:00:00"; //最小日期    safari 下自动识别成日期格式 只认 /
    max: string = "2099/12/31 23:59:59"; //最大日期
    title: string = "y年m月";            // 标题栏的日期格式
    minYear: number = 1900;     // 做标签用
    maxYear: number = 2099;
}
 
;(function($: any) {
    $.fn.datetimer = function(options ?: DateTimerOptions) {
        return new DateTimer(this, options); 
    };
})(jQuery);