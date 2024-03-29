
class Dater extends Box {
    constructor(
        public element: JQuery,
        option?: DaterOption
    ) {
        super();
        this.options = $.extend({}, new DaterDefaultOption(), option);
        this._initHtml();
        this.daysElement = this.element.find("tbody td");
        this.titleElement = this.element.find(".calendarTitle");
        this._lastRowElement = this.element.find("tbody tr").eq(5);
        this._bindEvent();
        if (typeof this.options.date == 'number') {
            this.setTime(this.options.date);
        } else {
            this.setDate(this.options.date);
        }
        
    }

    public options: DaterOption;

    public daysElement: JQuery; 

    public titleElement: JQuery;

    private _lastRowElement: JQuery;

    private _date: Date;

    private _daysCount: number;


    public previousYear() {
        this.setDate(this._date.getFullYear() - 1, Dater.getRealMonth(this._date));
    }

    public nextYear() {
        this.setDate(this._date.getFullYear() + 1, Dater.getRealMonth(this._date));
    }

    public previousMonth() {
        this.setDate(this._date.getFullYear(), this._date.getMonth());
    }

    public nextMonth() {
        this.setDate(this._date.getFullYear(), Dater.getRealMonth(this._date) + 1);
    }

    public setDate(year: number|Date|string, month?: number) {
        if (typeof year == 'string') {
            year = new Date(year);
        }
        if (year instanceof Date) {
            month = Dater.getRealMonth(year);
            year = year.getFullYear();
        }
        this._date = new Date(year, month, 0);
        this._daysCount = this._date.getDate();
        this._date.setDate(1);
        if (false == this.trigger('change')) {
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
        this.daysElement.on('click', function() {
            let ele = $(this);
            let day = parseInt(ele.text());
            if (day > 0 && instance.hasEvent('click')) {
                let date = new Date(instance._date as any);
                date.setDate(day);
                instance.trigger('click', date, ele, instance.element);
            }
        });
        this.element.find(".previousMonth").on('click', function() {
            instance.previousMonth();
        });
        this.element.find(".nextMonth").on('click', function() {
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
            let ele = $(this) as any;
            let day = parseInt(ele.text());
            if (day < 1) {
                return;
            }
            let date = new Date(instance._date as any);
            date.setDate(day);
            return callback(date, ele, instance.element);
        });
    }

    public getDay(day: number| Date): JQuery|void {
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
    }

    public isDate(date: Date = new Date()): boolean {
        return this._date.getFullYear() == date.getFullYear() && this._date.getMonth() == date.getMonth();
    }

    /**
     * 日期改变事件
     * @param callback 
     */
    public change(callback: (date: Date, element: JQuery, dater: JQuery)=> void): this {
        return this.on('change', callback);
    }

    /**
     * 日期点击事件
     * @param callback 
     */
    public click(callback: Function): this {
        return this.on('change', callback);
    }

    public static getRealMonth(date: Date): number {
        return date.getMonth() + 1;
    };
    
    public static format(date: Date, fmt: string = 'y年m月d日'): string {
        const o = {
            "y+": date.getFullYear(),
            "m+": this.getRealMonth(date), //月份 
            "d+": date.getDate(), //日 
            "h+": date.getHours(), //小时 
            "i+": date.getMinutes(), //分 
            "s+": date.getSeconds(), //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒 
        };
        for (const k in o) {
            const match = fmt.match(new RegExp('(' + k + ')'));
            if (match) {
                fmt = fmt.replace(match[1], (match[1].length === 1 || k === 'y+') ? (o[k]) : (('00' + o[k]).substring(('' + o[k]).length)));
            }
        }
        return fmt;
    }
}

interface DaterOption {
    date: string|Date|number,
    onchange?: () => any,
    onclick?: (date: Date, element: JQuery, dater: JQuery)=> void
}

class DaterDefaultOption implements DaterOption {
    date: string|Date|number = new Date();
}


;(function($: any) {
  $.fn.dater = function(option ?: DaterOption) {
    return new Dater(this, option); 
  };
})(jQuery);