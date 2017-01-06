class Dater {
    constructor(
        public element: JQuery,
        option?: DaterOption
    ) {
        this.option = $.extend({}, new DaterDefaultOption(), option);
        if (typeof this.option.date == 'number') {
            this.setTime(this.option.date);
        } else {
            this.setDate(this.option.date);
        }
        this._initHtml();
        this.daysElement = this.element.find("tbody td");
        this._bindEvent();
        this.reader();
    }

    public option: DaterOption;

    public daysElement: JQuery; 

    private _date: Date;

    private _daysCount: number;


    public previousYear() {
        this.setDate(this._date.getFullYear() - 1, this._date.getMonth());
    }

    public nextYear() {
        this.setDate(this._date.getFullYear() + 1, this._date.getMonth());
    }

    public previousMonth() {
        this.setDate(this._date.getFullYear(), this._date.getMonth() - 1);
    }

    public nextMonth() {
        this.setDate(this._date.getFullYear(), this._date.getMonth() + 1);
    }

    public setDate(year: number|Date|string, month?: number) {
        if (typeof year == 'string') {
            year = new Date(year);
        }
        if (year instanceof Date) {
            month = year.getMonth();
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
        let temp = new Date(time);
        this.setDate(temp.getFullYear(), temp.getMonth());
    }

    public getDate(): Date {
        return this._date;
    }

    public getDateString(): string {
        return this._date.getFullYear() + '年' + this._date.getMonth() + '月';
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
        this.element.find("calendarTitle").text(this.getDateString());
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
    }

    private _bindEvent() {
        let instance = this;
        this.daysElement.click(function() {
            let ele = $(this);
            let day = parseInt(ele.text());
            if (day > 0 && instance.option.dayClick) {
                instance.option.dayClick(day, ele, instance.element);
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

    public dayEach(callback: (day: number, element: JQuery, dater: JQuery)=> any) {
        let instance = this;
        this.daysElement.each((index, item)=> {
            let ele = $(this);
            let day = parseInt(ele.text());
            if (day > 0) {
                return callback(index, ele, instance.element);
            }
        });
    }

}

interface DaterOption {
    date: string|Date|number,
    changeDate?: () => any,
    dayClick?: (day: number, element: JQuery, dater: JQuery)=> void
}

class DaterDefaultOption implements DaterOption {
    date: string|Date|number = new Date();
}


;(function($: any) {
  $.fn.Dater = function(option ?: DaterOption) {
    return new Dater(this, option); 
  };
})(jQuery);