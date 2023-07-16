/*!
 * jquery.city - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */

class MultiSelect extends Eve {
    constructor(
        public element: JQuery,
        options?: MultiSelectOptions
    ) {
        super();
        let instance = this;
        this.options = $.extend({}, new MultiSelectDefaultOptions(), options);
        this.customControl = this.options.searchable;
        if (this.customControl && typeof this.options.data === 'string' && !this.options.searchUri) {
            this.options.searchUri = this.options.data;
        }
        if (typeof this.options.data == 'function') {
            this.options.data = this.options.data.call(this, function(data) {
                instance.options.data = data;
                instance.init();
            });
        }
        if (this.customControl || typeof this.options.data == 'object') {
            this.init();
            return;
        }
        
        if (typeof this.options.data == 'string') {
            CacheUrl.getData(this.options.data, function(data) {
                instance.options.data = data;
                instance.init();
            });
        }
    }

    public options: MultiSelectOptions;
    private readonly customControl: boolean;
    private _index: number = -1;
    private _val: string;

    public get val() {
        let val = '';
        this.map(id => {
            val = id;
        });
        return val;
    }

    public set val(arg: string) {
        this._val = arg;
        this._selectedPath(...this.getPath(arg));
    }

    private _selectedPath(...args: Array<string>) {
        if (!this.options.multiLevel) {
            this.controlVal(this.controlItems().eq(0), args[0]);
            return;
        }
        let data = this.options.data;
        this._index = -1;
        this.element.html('');
        let id;
        do {
            this._index ++;
            id = args.shift();
            if (typeof data != 'object' || !data.hasOwnProperty(id)) {
                this.addElement(data);
                return;
            }
            this.addElement(data, '请选择', id);
            data = data[id][this.options.children];
        } while (args.length > 0);
        if (id) {
            this.trigger('change');
        }
    }

    protected init() {
        this._create();
        this._bindEvent();
        this.val = this._val || this.options.default;
    }

    /**
     * 获取生成标签的头和身体
     */
    private _getHtml(data: any, title: string = '请选择', selected?: string | number): string {
        
        let html = '';
        let instance = this;
        $.each(data, (i: number| string, item) => {
            let [id, name] = instance._getIdAndName(item, i);
            html += this.renderOptionItem(id, name, selected && id == selected);
        });
        if (this.customControl) {
            return `<div class="select--with-search">
            <div class="select-input">
            ${title}
            </div>
            <div class="select-option-bar">
                <div class="search-option-item">
                    <input type="search" placeholder="Enter搜索">
                    <i class="fa fa-search"></i>
                </div>
            </div>
            <input type="hidden" name="${this.options.tag}">
        </div>`;
        }
        return `<select name="${this.options.tag}"><option>${title}</option>${html}</select>`;
    }

    private renderOptionItem(value: any, label: string, selected = false) {
        const sel = selected ? ' selected' : ''
        if (this.customControl) {
            return `<div class="option-item${sel}" data-value="${value}">${label}</div>`
        }
        return `<option value="${value}"${sel}>${label}</option>`
    }

    /**
     * 获取一个数据的id和显示的文字
     * @param item 
     * @param i 
     */
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
        this.addElement(typeof this.options.data === 'object' ? this.options.data : {});
    }

    private _bindEvent() {
        let instance = this;
        if (!this.customControl) {
            this.element.on('change', 'select', function() {
                let $this = $(this);
                let id = $this.val();
                let index = $this.index();
                instance.selected(id + '', index);
            });
            return;
        }
        this.element.on('click', '.select--with-search .select-input', function() {
            $(this).closest('.select--with-search').toggleClass('focus')
        }).on('keydown', '.select--with-search .search-option-item input', function(e) {
            if (e.key !== 'Enter') {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            const $this = $(this);
            const ctl = $this.closest('.select--with-search');
            instance.loadRomote(ctl, {
                [instance.options.query]: $this.val(),
            });
        }).on('click', '.select--with-search .option-item', function() {
            const $this = $(this);
            const ctl = $(this).closest('.select--with-search');
            const val = $this.data('value');
            $this.addClass('selected').siblings().removeClass('selected');
            ctl.data('value', val);
            ctl.find('.select-input').text($this.text());
            ctl.find('input[type=hidden]').val(val);
            ctl.trigger('change', [val, $this.index() - 2]);
            ctl.removeClass('focus');
        }).on('change', '.select--with-search', function(arg) {
            let id = arg[0];
            let index = $(this).index();
            instance.selected(id + '', index);
        });
        $(document).on('click', function(e) {
            const target = $(e.target);
            const ctl: any = target.hasClass('.select--with-search') ? target : target.closest('.select--with-search');
            instance.controlItems().each(function() {
                const $this = $(this);
                if (!$this.hasClass('focus') || $this.is(ctl)) {
                    return;
                }
                $this.removeClass('focus');
            });
        });
    }

    private loadRomote(ctl: JQuery, data: any, cb?: Function) {
        data[this.options.parentId] = this.getParentId(ctl);
        ctl.addClass('select-loading');
        $.getJSON(this.options.searchUri, data, res => {
            ctl.removeClass('select-loading');
            this.replaceOption(ctl, res.code === 200 ? res.data : []);
            cb && cb();
        });
    }

    private replaceOption(ctl: JQuery, items: any[] = []) {
        let i = 0;
        const that = this;
        ctl.find(this.customControl ? '.option-item' : 'option').each(function() {
            const $this = $(this);
            if (i >= items.length) {
                $this.remove();
                return;
            }
            that.optionVal($this, items[i][that.options.id]);
            $this.text(items[i][that.options.name]);
            i ++;
        });
        while (i < items.length) {
            this.appendOption(ctl, items[i]);
            i ++;
        }
    }

    private appendOption(ctl: JQuery, data: any) {
        const bar = this.customControl ? ctl.find('.select-option-bar') : ctl;
        bar.append($(this.renderOptionItem(data[this.options.id], data[this.options.name])))
    }

    private controlItems(): JQuery {
        return this.element.find(this.customControl ? '.select--with-search' : 'select');
    }

    private controlVal(ctl: JQuery, val?: any): any {
        if (typeof val === 'undefined') {
            return this.customControl ? ctl.data('value') : ctl.val();
        }
        if (!this.customControl) {
            ctl.val(val);
            return;
        }
        const that = this;
        let target: JQuery;
        ctl.find('.option-item').each(function() {
            const $this = $(this);
            const selected = that.optionVal($this) == val;
            $this.toggleClass('selected', selected);
            if (selected) {
                target = $this;
            }
        });
        ctl.data('value', val);
        ctl.find('input[type=hidden]').val(val);
        if (target) {
            ctl.find('.select-input').text(target.text());
            return;
        }
        this.loadRomote(ctl, {
            [this.options.id]: val,
        }, () => {
            this.selectOption(ctl, val);
        })
    }

    private selectOption(ctl: JQuery, val: any) {
        if (!this.customControl) {
            ctl.val(val);
            return;
        }
        const that = this;
        let target: JQuery;
        ctl.find('.option-item').each(function() {
            const $this = $(this);
            const selected = that.optionVal($this) == val;
            $this.toggleClass('selected', selected);
            if (selected) {
                target = $this;
            }
        });
        ctl.find('.select-input').text(target.text());
    }

    private optionVal(ctl: JQuery, val?: any): any {
        if (typeof val === 'undefined') {
            return this.customControl ? ctl.data('value') : ctl.val();
        }
        return this.customControl ? ctl.data('value', val) : ctl.val(val);
    }

    private getParentId(element: JQuery): any {
        const items = this.controlItems();
        const i = items.index(element);
        return i < 1 ? 0 : this.controlVal(items.eq(i - 1));
    }

    public bodyMap(callback: (id: string, name: string, index: number) => any, index: number = this._index) {
        const that = this;
        this.controlItems().eq(index).find(this.customControl ? '.option-item' : 'option').each(function(i, ele) {
            let item = $(ele);
            let id = that.optionVal(item);
            if (!id) {
                return;
            }
            if (callback.call(item, id, item.text(), i) == false) {
                return false;
            }
        });
    }


    /**
     * 加载下一页不进行选择
     */
    public selected(id?: string| number, index: number = this._index) {
        if (this.options.multiLevel) {
            this.remove(index + 1);
        }
        this.trigger('change');
        let data = this.options.multiLevel ? this._getNextData() : undefined;
        if (this.options.multiLevel && typeof data == 'object' && (!(data instanceof Array) || data.length > 0)) {
            this.addElement(data, '请选择');
        }
        if (!data || data.length == 0) {
            this.trigger('done');
            return this;
        }
        return this;
    }

    private _getNextData(): any {
        let data = this.options.data;
        let instance = this;
        this.map(id => {
            if (typeof data != 'object' || !data.hasOwnProperty(id)) {
                data = [];
                return false;
            }
            data = data[id][instance.options.children];
            if (!data) {
                data = [];
                return false;
            }
        });
        return data;
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

    public addElement(data: any, title: string = '请选择', selected?: string| number): this {
        let html = this._getHtml(data, title, selected);
        this.element.append(html);
        return this;
    }

    public remove(start: number = 1): this {
        let items = this.controlItems();
        for (let i = items.length - 1; i >= start; i--) {
            items.eq(i).remove();
        }
        return this;
    }

    public map(callback: (id: string, name: string, index: number) => any): this {
        const that = this;
        this.controlItems().each(function(i, ele) {
            let item = $(ele);
            let id = that.controlVal(item);
            if (!id) {
                return;
            }
            if (callback.call(item, id, item.find(that.customControl ? '.option-item.selected' : 'option:selected').text(), i) == false) {
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

    public lastText(): string {
        let arg = '请选择';
        this.map((id, name) => {
            arg = name;
        });
        return arg;
    }

    public all(): Array<string> {
        let data = [];
        this.map(id => {
            data.push(id);
        });
        return data;
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
        if (!id) {
            return [];
        }
        if (!this.options.multiLevel || this.options.data.hasOwnProperty(id)) {
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

interface MultiSelectOptions {
    [setting: string]: any,
    default?: string,
    data?: any,
    onchange?: () => any,
    ondone?: Function,
    id?: string,   // id的标志
    name?: string,  // 文字的标志
    tag?: string,
    children?: string, // 子代的标志
    searchable?: boolean;
    query?: string;
    parentId?: string;
    multiLevel?: boolean;
    searchUri?: string;
}

class MultiSelectDefaultOptions implements MultiSelectOptions {
    id: string = 'id';
    name: string = 'name';
    children: string = 'children';
    parentId = 'parent_id';
    query = 'keywords';
    multiLevel = true;
}

;(function($: any) {
    $.fn.multiSelect = function(options ?: MultiSelectOptions) {
        return new MultiSelect(this, options); 
    };
})(jQuery);