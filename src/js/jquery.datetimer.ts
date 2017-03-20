Date.prototype.getRealMonth = function(): number {
    return this.getMonth() + 1;
};

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

class DateTimer {
     constructor(
         public element: JQuery,
         options?: DateTimerOptions
     ) {
         this.options = $.extend({}, new DateTimerDefaultOptions(), options);
         this.options.min = this._tD(this.options.min);
         this.options.max = this._tD(this.options.max);
         this.createHtml();
         let instance = this;
         this.element.focus(function() {
            instance.init($(this).val());
         });
    }

    public options: DateTimerOptions;

    public box: JQuery;

    private _yearGrid: JQuery;
    private _dayGrid: JQuery;
    private _yearBox: JQuery;
    private _monthBox: JQuery;
    private _hourBox: JQuery;
    private _minuteBox: JQuery;
    private _secondBox: JQuery;


    private _currentDate: Date;

    public init(time: string) {
        this.showDate(time);
        this.open();
        this._refreshTime();
    }

    public createHtml() {
        this.box = $('<div class="datetimer"></div>');
        let lis = this._nLi(60, 0);
        this.box.html('<div class="header"><i class="fa fa-backward previousYear"></i><i class="fa fa-chevron-left previousMonth"></i><span></span><i class="fa fa-chevron-right nextMonth"></i><i class="fa fa-forward nextYear"></i></div><div class="body"><div class="month-grid"><ol><li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li></ol><ul>'+
        this._nLi(42, 0, false) 
        +'</ul></div><div class="year-grid"><div class="list-group year"><div class="title">年</div><ul>'+
        this._nLi(this.options.max.getFullYear() + 1, this.options.min.getFullYear())
        +'</ul></div><div class="list-group month"><div class="title">月</div><ul>'+ 
        this._nLi(13, 1) +
        '</ul></div></div><div class="day-grid"><div class="list-group hour"><div class="title">小时</div><ul>'+ this._nLi(25, 1) +
        '</ul></div><div class="list-group minute"><div class="title">分钟</div><ul>'+ 
        lis +
        '</ul></div><div class="list-group second"><div class="title">秒钟</div><ul>'+
        lis +
        '</ul></div></div></div><div class="footer"><input type="text" class="hour" value="00">:<input type="text" class="minute" value="00">:<input type="text" class="second" value="00"><button>确定</button></div>');
        $(document.body).append(this.box);

        this._yearBox = this.box.find(".body .year-grid .year ul");
        this._monthBox = this.box.find(".body .year-grid .month ul");
        this._hourBox = this.box.find(".body .day-grid .hour ul");
        this._minuteBox = this.box.find(".body .day-grid .minute ul");
        this._secondBox = this.box.find(".body .day-grid .second ul");
        this._yearGrid = this.box.find(".body .year-grid");
        this._dayGrid = this.box.find(".body .day-grid");

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

    public open() {
         let offset = this.element.offset();
         let x = offset.left;
         let y = offset.top + this.element.outerHeight();
         this.box.css({left: x + "px", top: y + "px"}).show();
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

    public previousYear() {
        this._changeYear(this.getCurrentDate().getFullYear() - 1);
    }

    public nextYear() {
        this._changeYear(this.getCurrentDate().getFullYear() + 1);
    }

    public previousMonth() {
        this._changeMonth(this.getCurrentDate().getMonth());
    }

    public nextMonth() {
        this._changeMonth(this.getCurrentDate().getMonth() + 2);
    }

    public showDate(year: number|Date|string, month?: number) {
        this._currentDate = this._tD(year, month);
        this.box.data('date', this._currentDate);
        this._refreshDay();
     }

     private _refreshYearGrid() {
        this._changeListGroup(this._yearBox, this._currentDate.getFullYear() - this.options.min.getFullYear());
        this._changeListGroup(this._monthBox, this._currentDate.getMonth());
     }

     private _refreshDayGrid() {
        this._changeListGroup(this._hourBox, this._currentDate.getHours() - 1);
        this._changeListGroup(this._minuteBox, this._currentDate.getMinutes() - 1);
        this._changeListGroup(this._secondBox, this._currentDate.getSeconds() - 1);
     }

     /**
      * 改变list-group 中的ul
      */
     private _changeListGroup(box: JQuery, index: number) {
         let li = box.find("li").eq(index);
         li.addClass("active").siblings().removeClass("active");
         box.scrollTop(li.offset().top - box.offset().top + box.scrollTop() - box.height() / 2);
     }

     private _changeYear(y: number) {
         this._currentDate.setFullYear(y);
         this._refreshDay();
         this._changeListGroup(this._yearBox, y - this.options.min.getFullYear());
     }

     private _changeMonth(m: number) {
         this._currentDate.setMonth(m - 1);
         this._refreshDay();
         this._changeListGroup(this._yearBox, this._currentDate.getFullYear() - this.options.min.getFullYear());
         this._changeListGroup(this._monthBox, this._currentDate.getMonth());
     }

     private _changeHour(h: number) {
         this._currentDate.setHours(h);
         this.box.find(".footer .hour").val(this._iTs(h));
         this._changeListGroup(this._hourBox, h -1);
     }

     private _changeMinute(i: number) {
         this._currentDate.setMinutes(i);
         this.box.find(".footer .minute").val(this._iTs(i));
         this._changeListGroup(this._minuteBox, i -1);
     }

     private _changeSecond(s: number) {
         this._currentDate.setSeconds(s);
         this.box.find(".footer .second").val(this._iTs(s));
         this._changeListGroup(this._secondBox, s -1);
     }

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

     private _refreshTime() {
         this._changeHour(this.getCurrentDate().getHours());
         this._changeMinute(this.getCurrentDate().getMinutes());
         this._changeSecond(this.getCurrentDate().getSeconds());
     }

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

     private _bindEvent() {
        let instance = this;
        this.box.find(".body .month-grid ul li").click(function() {
            let ele = $(this);
            let day = parseInt(ele.text());
            if (!ele.hasClass("disable")) {
                instance._currentDate.setDate(day);
                ele.addClass("active").siblings().removeClass("active");
                return;
            }
            if (day > ele.index()) {
                instance._currentDate.setMonth(instance._currentDate.getMonth() - 1);
                instance._currentDate.setDate(day);
                instance.showDate(instance._currentDate);
                return;
            }
            instance._currentDate.setMonth(instance._currentDate.getMonth() + 1);
            instance._currentDate.setDate(day);
            instance.showDate(instance._currentDate);
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
        this.box.find(".footer button").click(function() {
            instance.element.val(instance.getCurrentDate().format(instance.options.format));
            instance.box.hide();
        });

        this.box.find(".header span").click(function() {
            if (instance._yearGrid.is(":hidden")) {
                instance._dayGrid.hide();
                instance._yearGrid.show();
                instance._refreshYearGrid();
                return;
            }
            instance._yearGrid.hide();
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
        this._yearBox.find("li").click(function() {
            instance._changeYear(parseInt($(this).text()));
        });
        this._monthBox.find("li").click(function() {
            instance._changeMonth(parseInt($(this).text()));
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
        
        this.box.click(function(e) {
            e.stopPropagation();
        });
        this.element.click(function(e) {
            e.stopPropagation();
        });
        $(document).click(function() {
            instance.box.hide();
        });
    }

     private _yD(y: number, m: number): number {
        let date = new Date(y, m, 0);
        return date.getDate();
     }

     private _mD(y: number, m: number): [number, number] {
        let date = new Date(y, m, 0);
        let count = date.getDate();
        date.setDate(1);
        return [date.getDay(), count];
     }


     private _tD(year: number|Date|string, month?: number): Date {
         if (!year) {
             return new Date();
         }
         if (typeof year == 'string') {
             return new Date(year);
         }
         if (typeof year == 'number') {
             return new Date(year, month - 1, 1);
         }
         return year;
     }
}


interface DateTimerOptions {
    format?: string, //日期格式
    min?: string | Date, //最小日期
    max?: string | Date, //最大日期
    success?: (date: Date, element: JQuery) => any,
    title?: string
 }

 class DateTimerDefaultOptions implements DateTimerOptions {
    format: string = "y-m-d h:i:s"; //日期格式
    min: string = "1900-01-01 00:00:00"; //最小日期
    max: string = "2099-12-31 23:59:59"; //最大日期
    title: string = "y年m月";            // 标题栏的日期格式
 }
 
 ;(function($: any) {

  $.fn.datetimer = function(options ?: DateTimerOptions) {
    return new DateTimer(this, options); 
  };
})(jQuery);