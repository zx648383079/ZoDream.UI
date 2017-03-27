class Pager {
    constructor(
        public element: JQuery,
        option?: PagerOption
    ) {
        this.option = $.extend({}, new PagerDefaultOption(), option);
        this.total = this.option.total;
        this.length = this.option.length;
        this.paginate(1);
        let instance = this;
        this.element.on("click", "li", function() {
            let page = instance._data[$(this).index()];
            if (page < 1) {
                return;
            }
            if (instance.option.paginate && instance.option.paginate.call(this, page, instance) == false) {
                return;
            }
            instance.paginate(page);
        });
    }

    public option: PagerOption;

    private _data: Array<number>;

    public index: number = 0;

    public total: number;

    public length: number;

    public paginate(page: number = this.index) {
        if (page < 1) {
            page = 1;
        }
        if (page > this.total) {
            page = this.total;
        }
        this.index = page;
        this.refresh();
    }

    public previous() {
        if (this.index < 1) {
            return;
        }
        this.paginate(this.index - 1);
    }

    public next() {
        if (this.index > this.total) {
            return;
        }
        this.paginate(this.index + 1);
    }


    public refresh() {
        this._initPage();
        this._addHtml();
    }

    private _initPage() {
        this._data = [];
        if (this.total < 2) {
            return;
        }
        this._data.push(1);
        let lastList = Math.floor(this.length / 2);
        let i = this.index - lastList;
        let length = this.index + lastList ;
        if (i < 2) {
            i = 2;
            length = i + this.length
        }
        if (length > this.total - 1) {
            length = this.total - 1;
            i = Math.max(2, length - this.length);
        }

        if (i > 2) {
            this._data.push(0);
        }
        for (; i <= length; i ++) {
            this._data.push(i);
        }
        if (length < this.total - 1) {
            this._data.push(0);
        }
        this._data.push(this.total);
    }

    private _addHtml() {
        let html = '';
        let instance = this;
        $.each(this._data, function(i, item) {
            if (item == 0) {
                html += instance.option.label;
                return;
            }
            if (item == instance.index) {
                html += instance._replace(item, instance.option.current);
                return;
            }
            html += instance._replace(item, instance.option.page);
        });
        this.element.html(html);
    }

    private _replace(page: number, template: string): string {
        return template.replace(new RegExp("{page}", 'g'), page + '');
    }
}

interface PagerOption {
    total?: number,
    length?: number,
    page?: string,
    current?: string,
    label?: string,
    paginate?: (page: number, pager: Pager) => any;
}

class PagerDefaultOption implements PagerOption {
    total: number = 0;
    length: number = 8;
    page: string = '<li>{page}</li>';
    current: string = '<li class="active">{page}</li>';
    label: string = '<li>...</li>';
}


;(function($: any) {
  $.fn.pager = function(option ?: PagerOption) {
    return new Pager(this, option); 
  };
})(jQuery);