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
class Dater {
    constructor(
        public element: JQuery,
        option?: DaterOption
    ) {
        this.option = $.extend({}, new DaterDefaultOption(), option);
        this._initHtml();
        this.daysElement = this.element.find("tbody td");
        this.titleElement = this.element.find(".calendarTitle");
        this._lastRowElement = this.element.find("tbody tr").eq(5);
        this._bindEvent();
        if (typeof this.option.date == 'number') {
            this.setTime(this.option.date);
        } else {
            this.setDate(this.option.date);
        }
        
    }

    public option: DaterOption;

    public daysElement: JQuery; 

    public titleElement: JQuery;

    private _lastRowElement: JQuery;

    private _date: Date;

    private _daysCount: number;


    public previousYear() {
        this.setDate(this._date.getFullYear() - 1, this._date.getRealMonth());
    }

    public nextYear() {
        this.setDate(this._date.getFullYear() + 1, this._date.getRealMonth());
    }

    public previousMonth() {
        this.setDate(this._date.getFullYear(), this._date.getMonth());
    }

    public nextMonth() {
        this.setDate(this._date.getFullYear(), this._date.getRealMonth() + 1);
    }

    public setDate(year: number|Date|string, month?: number) {
        if (typeof year == 'string') {
            year = new Date(year);
        }
        if (year instanceof Date) {
            month = year.getMonth() + 1;
            year = year.getFullYear();
        }
        this._date = new Date(year, month, 0);
        this._daysCount = this._date.getDate();
        this._date.setDate(1);
        if (this.option.changeDate && this.option.changeDate() == false) {
            return;
        }
        this.reader();
    }

    public setTime(time: number) {
        this.setDate(new Date(time));
    }

    public getDate(): Date {
        return this._date;
    }

    public getDateString(): string {
        return this._date.getFullYear() + '年' + (this._date.getMonth() + 1) + '月';
    }

    private _initHtml() {
        let html = '';
        for(let i = 0; i < 6; i++) {
            html += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        }
        this.element.append('<div><span class="previousMonth"></span><span class="calendarTitle"></span><span class="nextMonth"></span></div>' + 
        '<table class="calendarTable"><thead><tr><td>日</td><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td><td>六</td></tr></thead>' + 
        '<tbody>' + html + '</tbody></table>');
    }

    private reader() {
        this.titleElement.text(this.getDateString());
        let first = this._date.getDay();
        let instance = this;
        this.forEach((index: number, ele)=> {
            if (index < first) {
                ele.text(' ');
                return;
            }
            let day = index - first + 1;
            if (day > instance._daysCount) {
                ele.text(' ');
                return;
            }
            ele.text(day);
        });
        if (first + this._daysCount > 35) {
            this._lastRowElement.show();
        } else {
            this._lastRowElement.hide();
        }
    }

    private _bindEvent() {
        let instance = this;
        this.daysElement.click(function() {
            let ele = $(this);
            let day = parseInt(ele.text());
            if (day > 0 && instance.option.dayClick) {
                let date = new Date(instance._date);
                date.setDate(day);
                instance.option.dayClick(date, ele, instance.element);
            }
        });
        this.element.on("click", "previousMonth", function() {
            instance.previousMonth();
        });
        this.element.on("click", "nextMonth", function() {
            instance.nextMonth();
        });
    }

    public forEach(callback: (index: number, element: JQuery, dater: JQuery)=> any) {
        let instance = this;
        this.daysElement.each((index, item)=> {
            return callback(index, $(item), instance.element);
        });
    }

    public dayEach(callback: (day: Date, element: JQuery, dater: JQuery)=> any) {
        let instance = this;
        this.daysElement.each((index, item)=> {
            let ele = $(this);
            let day = parseInt(ele.text());
            if (day < 1) {
                return;
            }
            let date = new Date(instance._date);
            date.setDate(day);
            return callback(date, ele, instance.element);
        });
    }
}

interface DaterOption {
    date: string|Date|number,
    changeDate?: () => any,
    dayClick?: (date: Date, element: JQuery, dater: JQuery)=> void
}

class DaterDefaultOption implements DaterOption {
    date: string|Date|number = new Date();
}


;(function($: any) {
  $.fn.dater = function(option ?: DaterOption) {
    return new Dater(this, option); 
  };
})(jQuery);