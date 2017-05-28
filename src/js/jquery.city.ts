class City extends Box {
    constructor(
        public element: JQuery,
        options?: CityOptions
    ) {
        super();
        this.options = $.extend({}, new CityDefaultOptions(), options);
        if (!this.options.onchange) {
            this.change(this._onchange);
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

    private _index: number = -1;

    private _onchange(id?: string| number, index?: number, selected?: string| number) {
        
        if (typeof this.options.data == 'object') {
            this._setData(id, index, selected);
            return;
        }
        if (typeof this.options.data != 'string') {
            return false;
        }
        let instance = this;
        $.getJSON(this.options.data, function(data) {
            if (data.code == 0) {
                instance.options.data = data.data;
                instance._setData(id, index, selected);
            }
        });
    }

    private _setData(id?: string| number, index?: number, selected?: string| number) {
        if (!id) {
            this.addTab(this.options.data);
            selected && this.selectedId(selected);
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
            this.trigger('done');
            return;
        }
        this.addTab(data);
        selected && this.selectedId(selected);
    }

    private _init() {
        if (typeof this.options.default != 'object') {
            this.options.default = [this.options.default];
        }
        this._create();
        this._bindEvent();
        this.selected();
    }

    /**
     * 获取生成标签的头和身体
     */
    private _getHtml(data: any, title: string = '请选择', selected?: string | number): [string, string] {
        let html = '';
        let instance = this;
        let header = '<li class="active">' + title + '</li>';
        $.each(data, (i, item) => {
            let [id, name] = instance._getIdAndName(item, i);
            if (selected && id == selected) {
                html += '<li class="selected" data-id="' + id + '">' + name +'</li>';
                header = '<li class="active" data-id="' + id + '">' + name + '</li>';
                return;
            }
            html += '<li data-id="' + id + '">' + name +'</li>';
        });
        return [header, '<ul class="active">' + html + '</ul>'];
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
             instance.selectedTab($(this).index());
        });
        this._body.on('click', 'li', function() {
            let $this = $(this);
            let id = $this.attr('data-id');
            let index = $this.parent().index();
            $this.addClass('selected').siblings().removeClass('selected');

            instance._header.find('li').eq(index).attr('data-id', id)
             .text($this.text());
            instance.selected(id, index);
        });
        /** 实现隐藏 */
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

    public setDefault(...args: Array<string| number>) {
        this.options.default = args;
        this.selected();
    }

    public bodyMap(callback: (id: string, name: string, index: number) => any, index: number = this._index) {
        this._body.find('ul').eq(index).find('li').each(function(i, ele) {
            let item = $(ele);
            let id = item.attr('data-id');
            if (!id) {
                return;
            }
            if (callback.call(item, id, item.text(), i) == false) {
                return false;
            }
        });
    }

    private _getSelect(index: number = 0): number | string | undefined {
        if (this.options.default.length > index) {
            return this.options.default[index];
        }
        this.options.default = [];
        return undefined;
    }

    /**
     * 加载下一页不进行选择
     */
    public selected(id?: string| number, index: number = this._index) {
        this.remove(index + 1);
        let data = this.trigger('change', id, index, this._getSelect(index + 1));
        if (typeof data == 'object') {
            this.addTab(data, '请选择', this._getSelect(index + 1));
        }
        
        if (data == false) {
            this.trigger('done');
            return;
        }
        return this;
    }

    /**
     * 选中并触发加载下一页 不进行自动关闭
     */
    public selectedId(id: string| number, index: number = this._index) {
        this.bodyMap(function(i) {
            if (i == id) {
                this.trigger('click');
                return false;
            }
        },  index);
    }

    public close() {
        this.box.hide();
        return this;
    }

    public show() {
        if (this.options.auto) {
            return this.showPosition();
        }
        this.box.show();
        return this;
    }

    public selectedTab(index: number): this {
        this._index = index;
        this._header.find('li').eq
        (index).addClass('active').siblings().removeClass('active');
        this._body.find('ul').eq(index).addClass('active').siblings().removeClass('active');
        return this;
    }

    public addTab(data: any, title: string = '请选择', selected?: string| number): this {
        this._header.find('li').removeClass('active');
        this._body.find('ul').removeClass('active');
        let [header, body] = this._getHtml(data, title, selected);
        this._header.append(header);
        this._body.append(body);
        return this;
    }

    public remove(start: number = 1): this {
        let headers = this._header.find('li');
        let bodies = this._body.find('ul');
        for (let i = headers.length - 1; i >= start; i--) {
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

    public text(link: string = this.options.line): string {
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
        element.attr('data-id', this.val());
        if (element.is('input') || element.is('textarea')) {
            element.val(this.text());
            return;
        }
        element.text(this.text());
    }

    public change(callback: (id?: string| number, index?: number, selected?: string| number) => any): this {
        return this.on('change', callback);
    }

    public done(callback: Function): this {
        return this.on('done', callback);
    }

    /**
     * 根据ID查找无限树的路径
     * @param id 
     */
    public getPath(id: string): Array<string> {
        if (this.options.hasOwnProperty(id)) {
            return [id];
        }
        let path = [],
            found = false,
            instance = this,
            findPath = function(data: any) {
                if (typeof data != 'object') {
                    return;
                }
                if (data.hasOwnProperty(id)) {
                    path.push(id);
                    found = true;
                    return;
                }
                $.each(data, function(key, args) {
                    findPath(args[instance.options.children]);
                    if (found) {
                        path.push(key);
                        return false;
                    }
                });
            };

        $.each(this.options.data, function(key, data) {
            findPath(data[instance.options.children]);
            if (found) {
                path.push(key);
                return false;
            }
        });
        path.reverse();
        return path;
    }
}

interface CityOptions {
    default?: Array<string|number>,
    data?: any,
    onchange?: (id?: string| number, index?: number, selected?: string| number) => any,
    ondone?: Function,
    id?: string,
    name?: string,
    children?: string,
    line?: string,  //连接符号
    auto?: boolean // 自动设置位置
}

class CityDefaultOptions implements CityOptions {
    data: string = '';
    id: string = 'id';
    name: string = 'name';
    children: string = 'children';
    line: string = '-';
    auto: boolean = true;
}

;(function($: any) {
    $.fn.city = function(options ?: CityOptions) {
        return new City(this, options); 
    };
})(jQuery);