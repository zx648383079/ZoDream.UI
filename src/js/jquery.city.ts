class City {
    constructor(
        public element: JQuery,
        options?: CityOptions
    ) {
        this.options = $.extend({}, new CityDefaultOptions(), options);
        if (!this.options.onchange) {
            this.options.onchange = this._onchange;
        }
        this._init();
        let instance = this;
        this.element.click(function() {
            instance.show();
        });
    }

    public options: CityOptions;

    public box: JQuery;

    private _header: JQuery;

    private _body: JQuery;

    private _onchange(id?: string| number, index?: number) {
        if (typeof this.options.data == 'object') {
            this._setData(id);
            return;
        }
        if (typeof this.options.data != 'string') {
            return false;
        }
        let instance = this;
        $.getJSON(this.options.data, function(data) {
            if (data.code == 0) {
                instance.options.data = data.data;
                this._setData(id);
            }
        });
    }

    private _setData(id?: string| number) {
        if (!id) {
            this.addTab(this.options.data);
            return;
        }
        let data = this.options.data;
        this.map(id => {
            data = data[id][this.options.children];
            if (!data) {
                return false;
            }
        });
        if (!data) {
            this.options.done && this.options.done.call(this);
            return;
        }
        this.addTab(data);
    }

    private _init() {
        this._create();
        this._bindEvent();
        this.setId();
    }

    private _getTabHeader(title: string = '请选择'): string {
        return '<li class="active">' + title +'</li>';
    }

    private _getTabBody(data: any): string {
        let html = '';
        let instance = this;
        $.each(data, (i, item) => {
            let [id, name] = instance._getIdAndName(item, i);
            html += '<li data-id="' + id + '">' + name +'</li>';
        });
        return '<ul class="active">' + html + '</ul>';
    }

    private _getIdAndName(item: any, i: string| number): [string| number, string] {
        if (typeof item != 'object') {
            return [i, item];
        }
        let name = item[this.options.name];
        if (this.options.id && item.hasOwnProperty(this.options.id)) {
            return [item[this.options.id], name];
        }
        return [i, name];
    }

    private _create() {
        this.box = $('<div class="selector" data-type="selector"></div>');
        this.box.html('<ul class="selector-header"></ul><div class="selector-body"></div><i class="fa fa-close"></i>');
        $(document.body).append(this.box);
        this._header = this.box.find('.selector-header');
        this._body = this.box.find('.selector-body');
    }

    private _bindEvent() {
        let instance = this;
        this.box.on('click', '.fa-close', function() {
            instance.close();
        });
        this._header.on('click', 'li', function() {
             instance.changeTab($(this).index());
        });
        this._body.on('click', 'li', function() {
            let $this = $(this);
            let id = $this.attr('data-id');
            let index = $this.parent().index();
             $this.addClass('selected').siblings().removeClass('selected');

             instance._header.find('li').eq(index).attr('data-id', id)
             .text($this.text());
             instance.setId(id, index);
        });
    }

    public setId(id?: string| number, index?: number) {
        this.remove(index + 1);
        let data = this.options.onchange.call(this, id, index);
        if (typeof data == 'object') {
            this.addTab(data);
        }
        
        if (data == false) {
            this.options.done && this.options.done.call(this);
            return;
        }
        return this;
    }

    public close() {
        this.box.hide();
        return this;
    }

    public show() {
        this.box.show();
        return this;
    }

    public changeTab(index: number): this {
        this._header.find('li').addClass('active').siblings().removeClass('active');
        this._body.find('ul').eq(index).addClass('active').siblings().removeClass('active');
        return this;
    }

    public addTab(data: any, title: string = '请选择'): this {
        this._header.find('li').removeClass('active');
        this._body.find('ul').removeClass('active');
        this._header.append(this._getTabHeader(title));
        this._body.append(this._getTabBody(data));
        return this;
    }

    public remove(start: number = 1): this {
        let headers = this._header.find('li');
        let bodies = this._body.find('ul');
        for(let i = headers.length - 1; i >= start; i--) {
            headers.eq(i).remove();
            bodies.eq(i).remove();
        }
        return this;
    }

    public map(callback: (id: string, name: string, index: number) => any): this {
        this._header.find('li').each(function(i, ele) {
            let item = $(ele);
            let id = item.attr('data-id');
            if (!id) {
                return;
            }
            if (callback.call(item, id, item.text(), i) == false) {
                return false;
            }
        });
        return this;
    }

    public text(link: string = '-'): string {
        let arg = [];
        this.map((id, name) => {
            arg.push(name);
        });
        return arg.join(link);
    }

    public val(): string {
        let val = '';
        this.map(id => {
            val = id;
        });
        return val;
    }

    public all(): Array<string> {
        let data = [];
        this.map(id => {
            data.push(id);
        });
        return data;
    }

    public output(element: JQuery = this.element) {
        if (element.is('input') || element.is('textarea')) {
            element.val(this.text());
            return;
        }
        element.text(this.text());
    }
}

interface CityOptions {
    default?: Array<string|number> | string | number,
    data?: any,
    onchange?: (id?: string| number, index?: number) => any,
    done?: Function,
    id?: string,
    name?: string,
    children?: string,
}

class CityDefaultOptions implements CityOptions {
    data: string = '';
    id: string = 'id';
    name: string = 'name';
    children: string = 'children',
}

;(function($: any) {
    $.fn.city = function(options ?: CityOptions) {
        return new City(this, options); 
    };
})(jQuery);