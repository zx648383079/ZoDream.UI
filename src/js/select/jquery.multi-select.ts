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
        if (typeof this.options.data == 'function') {
            this.options.data = this.options.data.call(this, function(data) {
                instance.options.data = data;
                instance.init();
            });
        }
        if (typeof this.options.data == 'object') {
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
        let html = '<option>' + title +'</option>';
        let instance = this;
        $.each(data, (i: number| string, item) => {
            let [id, name] = instance._getIdAndName(item, i);
            if (selected && id == selected) {
                html += '<option selected value="' + id + '">' + name +'</li>';
                return;
            }
            html += '<option value="' + id + '">' + name +'</li>';
        });
        return '<select name="'+ this.options.tag +'">' + html + '</ul>';
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
        this.addElement(this.options.data);
    }

    private _bindEvent() {
        let instance = this;
        this.element.on('change', 'select', function() {
            let $this = $(this);
            let id = $this.val();
            let index = $this.index();
            instance.selected(id + '', index);
        });
    }

    public bodyMap(callback: (id: string, name: string, index: number) => any, index: number = this._index) {
        this.element.find('select').eq(index).find('option').each(function(i, ele) {
            let item = $(ele);
            let id = item.val();
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
        this.remove(index + 1);
        let data = this._getNextData();
        this.trigger('change');
        if (typeof data == 'object' && (!(data instanceof Array) || data.length > 0)) {
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
        let items = this.element.find('select');
        for (let i = items.length - 1; i >= start; i--) {
            items.eq(i).remove();
        }
        return this;
    }

    public map(callback: (id: string, name: string, index: number) => any): this {
        this.element.find('select').each(function(i, ele) {
            let item = $(ele);
            let id = item.val();
            if (!id) {
                return;
            }
            if (callback.call(item, id, item.find('option:selected').text(), i) == false) {
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
}

class MultiSelectDefaultOptions implements MultiSelectOptions {
    id: string = 'id';
    name: string = 'name';
    children: string = 'children';
}

;(function($: any) {
    $.fn.multiSelect = function(options ?: MultiSelectOptions) {
        return new MultiSelect(this, options); 
    };
})(jQuery);