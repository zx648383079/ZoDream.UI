 class SelectBox extends Eve {
     constructor(
         public element: JQuery,
         options?: SelectBoxOptions
     ) {
         super();
         this.options = $.extend({}, new SelectBoxDefaultOptions(), options);
         let _this = this;
         if (typeof this.options.data == 'function') {
            this._init();
            return;
            // this.options.data = this.options.data.call(this, function(data) {
            //     _this.options.data = data;
            //     _this._init();
            // });
        }
        if (typeof this.options.data == 'object') {
            this._init();
            return;
        }
        if (typeof this.options.data == 'string') {
            CacheUrl.getData(this.options.data, function(data) {
                _this.options.data = data;
                _this._init();
            });
            return;
        }
     }

     public options: SelectBoxOptions;

     public box: JQuery;

     private _index: Array<number> = [];

     private _real_index: Array<number> = [];
     
     private _ulBox: Array<JQuery>;

     private booted: boolean = false;

     private _init() {
         let _this = this;
         this.box = $('<div class="'+ this._getBoxClass() +'" data-type="select"></div>');
         $(document.body).append(this.box);
         this.box.html('<div class="dialog-header"><div class="dialog-close">取消</div><div class="dialog-title">'+ this.options.title +'</div><div class="dialog-yes">确定</div></div><div class="dialog-body">' + this._createUl() +'<hr class="dialog-top-hr"><hr class="dialog-bottom-hr"></div>');
         _this._ulBox = [];
        this.box.find('.dialog-body ul').each(function() {
            _this._ulBox.push($(this));
        });
        this._bindEvent();
        if (typeof this.options.data === 'function') {
            this.triggerChange(0);
            return;
        }
        this.triggerChange(0);
        this.notify();
     }

     private _bindEvent() {
        let _this = this;
        this.element.on('click', function(e) {
            e.stopPropagation();
            _this.show();
        });
        // $(document).on('click', function() {
        //    instance.hide();
        // });
        this.box.on('click', '.dialog-close', function() {
            _this.hide();
        });
        this.box.on('click', '.dialog-yes', function() {
            _this.notify().hide();
        });
        for (let i = 0; i < this.options.column; i++) {
            this._ulBox[i].on('click', 'li', function() {
                _this.selected($(this), i);
            });
        }
        let startPos: any;
        this.box.on('touchstart', function(event) {
            let touch = event.targetTouches[0];
            startPos = {
                x: touch.pageX,
                y: touch.pageY
            };
        }).on('touchmove', function(event: any) {
            let touch = event.targetTouches[0];
            if(event.targetTouches.length > 1 || (event.scale && event.scale !== 1)) {
                return;
            }
            event.preventDefault();
            let y = touch.pageY - startPos.y,
                diff = Math.abs(y);
            if (diff >= _this.options.lineHeight) {
                // 滑动了一个单位就更新起始y 坐标
                startPos.y = touch.pageY;
                _this.touchMove(diff, y < 0, startPos.x);
            }
        });
    }

    private triggerChange(index: number = 0) {
        if (typeof this.options.data !== 'function') {
            this.drawColum(this._getColumnOption(index), index);
            return;
        }
        let _this = this;
        const next = (data: any, column = index) => {
            _this.drawColum(data, column);
        };
        let args: Array<string|number> = [];
        let error = false;
        if (index > 0) {
            this.mapSelected((option: JQuery, i) => {
                if (option.length < 1) {
                    error = true;
                    return false;
                }
                args.push(option.attr('data-value'));
                if (i >= index - 1) {
                    return false;
                }
            });
        }
        if (error) {
            return;
        }
        let data = this.options.data.call(this, next, index, ...args);
        if (typeof data === 'object') {
            next(data, index);
        }
    }

    /**
     * 滑动
     * @param distance 距离的绝对值
     * @param isUp 是否是上滑
     * @param x 触发的位置，自动定位到第几级
     */
    public touchMove(distance: number, isUp: boolean = true, x: number = 0) {
        let diff: number = isUp ? Math.floor(distance / this.options.lineHeight) : - Math.ceil(distance / this.options.lineHeight),
            column: number = 0;
        if (diff == 0) {
            return this;
        }
        if (this.options.column > 1) {
            column = Math.floor(x / (this.box.width() / this.options.column));
        }
        this.selectedIndex(this._index[column] + diff, column);
        return this;
    }

    /**
     * 显示
     */
    public show() {
        // 隐藏其他的
        $('.dialog-select[data-type="select"]').hide();
        this.box.show();
        return this;
    }

    /**
     * 隐藏并重置
     */
    public hide() {
        this.box.hide();
        this.restore();
        return this;
    }

    /**
     * 重置
     */
    public restore() {
        let data = this._real_index.slice();
        for (let i = 0; i < this.options.column; i++) {
            this.selectedIndex(data[i], i);
        }
        return this;
    }

    /**
     * 刷新
     */
     public refresh() {
        this._refreshUl(0, this.options.data);
        for (let i = 0; i < this.options.column; i++) {
            this._real_index[i] = 0;
        }
        this.restore();
        return this;
     }

     /**
      * 根据值自动选中
      * @param val 
      */
     public applyValue(val: any) {
        if (this.options.column < 2) {
            return this.selectedValue(val);
        }
        let data = this.getPath(val);
        if (data && data.length > 0) {
            this._real_index = data;
            this.restore();
        }
        return this;
     }

    /**
     * 根据ID查找无限树的路径
     * @param id 
     */
    public getPath(id: string): Array<number> {
        if (!id) {
            return [];
        }
        if (typeof this.options.data !== 'function') {
            return [];
        }
        let path = [],
            found = false,
            _this = this,
            findPath = function(data: any) {
                if (typeof data != 'object') {
                    return;
                }
                let iii = -1;
                $.each(data, function(key, args) {
                    iii ++;
                    if (key == id || args[_this.options.valueTag] == id) {
                        path.push(iii);
                        found = true;
                        return false;
                    }
                    if (!args.hasOwnProperty(_this.options.childrenTag)) {
                        return;
                    }
                    findPath(args[_this.options.childrenTag]);
                    if (found) {
                        path.push(iii);
                        return false;
                    }

                });
            },
            ii = -1;
        
        $.each(this.options.data, function(key, data) {
            ii ++;
            findPath(data[_this.options.childrenTag]);
            if (found) {
                path.push(ii);
                return false;
            }
        });
        path.reverse();
        return path;
    }

     private _createUl() {
         let html = '';
         for (let i = 0; i < this.options.column; i++) {
            html += '<ul class="dialog-column-'+i+'"></ul>';
         }
         return html;
     }

     private _getBoxClass(): string {
        if (this.options.column < 2) {
            return 'dialog dialog-select';
        }
        return 'dialog dialog-select dialog-select-column-' + this.options.column;
     }

     private _getOptionByIndex(data: any, index: number = 0) {
        if (data instanceof Array) {
            return data[index][this.options.childrenTag];
        }
        for (const key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }
            index --;
            if (index < 0) {
                return data[key][this.options.childrenTag];
            }
        }
        return null;
     }

     private _getColumnOption(index: number) {
        let data = this.options.data;
        if (index < 1) {
            return data;
        }
        this.mapSelected((option: JQuery, i: number) => {
            let val = option.attr('data-value');
            data = this._getChildren(val, data);
            if (!data || data.length < 1 || i >= index -1) {
                return false;
            }
        });
        return data;
     }

     private _getChildren(id, data: any) {
        if (typeof data != 'object') {
            return [];
        }
        if (!(data instanceof Array)) {
            return data.hasOwnProperty(id) ? data[id][this.options.childrenTag] : [];
        }
        for (let i = 0; i < data.length; i++) {
            if (data[i][this.options.valueTag] == id) {
                return data[i][this.options.childrenTag];
            }
        }
        return [];
     }

     private _refreshUl(index: number = 0, data: any) {
        this._ulBox[index].html(this._createOptionHtml(data));
     }

     public drawColum(data: any, index: number) {
        this._refreshUl(index, data);
        if (!this.booted && this.options.default && this.options.default[index]) {
            this.selectedValue(this.options.default[index], index); 
        } else {
            this.selectedIndex(0, index);
        }
        if (!this.booted && index >= this.options.column - 1) {
            this.booted = true;
        }
     }

     /**
      * 刷新第几级的数据
      * @param column 第几级
      */
     public refreshColumn(column: number = 0) {
        if (typeof this.options.data === 'function') {
            this.triggerChange(column);
            return this;
        }
         let data = this._getColumnOption(column);
         this._refreshUl(column, data);
         this.selectedIndex(0, column);
         return this;
     }

     private _createOptionHtml(data: any) {
        let html = '';
        let _this = this;
        $.each(data, function(i: string| number, item: any) {
            let [value, text] = _this._getValueAndText(item, i);
            if (_this.options.createOption) {
                text = _this.options.createOption(item, i);
            }
            html += '<li data-value="'+ value +'">'+ text + '</li>';
        });
        return html;
     }

    /**
     * 获取一个数据的id和显示的文字
     * @param item 
     * @param i 
     */
    private _getValueAndText(item: any, i: string| number): [string| number, string] {
        if (typeof item != 'object') {
            return !this.options.valueTag ? [item, item] : [i, item];
        }
        let name = item[this.options.textTag];
        if (this.options.valueTag && item.hasOwnProperty(this.options.valueTag)) {
            return [item[this.options.valueTag], name];
        }
        return [i, name];
    }

    /**
     * 选中哪一个
     * @param option 
     * @param column  第几级
     */
     public selected(option: JQuery | number, column: number = 0) {
         if (typeof option == 'number') {
             return this.selectedIndex(option, column);
         }
         if (typeof option == 'object') {
             return this.selectedOption(option, column);
         }
         return this.selectedValue(option, column);
     }
     
     /**
      * 选中第几行
      * @param index 行号 0 开始
      * @param column 第几级 
      */
     public selectedIndex(index: number = 0, column: number = 0) {
        if (index < 0) {
            index = 0;
        }
        let lis = this._ulBox[column].find('li');
        let length = lis.length;
        if (index >= length) {
            index = length - 1;
        }
        let option = lis.eq(index);
        this.selectedOption(option, column);
        return this;
     }

     /**
      * 选中哪个值
      * @param id 值
      * @param column  第几级
      */
     public selectedValue(id: number| string, column: number = 0) {
        let option = this._ulBox[column].find('li[data-value="'+ id +'"]');
        if (option.length < 1) {
            this.selectedIndex(0, column);
        }
        this.selectedOption(option, column);
        return this;
     }

     /**
      * 选中哪一行
      * @param option 行元素 
      * @param column 第几级
      */
     public selectedOption(option: JQuery, column: number = 0) {
        option.addClass('active').siblings().removeClass('active');
        if (this.booted) {
            this.trigger('change', column, option.data('value'), option.text(), option);
        }
        this._index[column] = option.index();
        let top = 2 * this.options.lineHeight - this._index[column]  * this.options.lineHeight;
        this._ulBox[column].css('transform', 'translate(0px, ' + top +'px) translateZ(0px)');
        if (this.options.column > column + 1) {
            this.refreshColumn(column + 1);
        }
        return this;
     }

     /**
      * 获取当前的选中值 一级是单个值，多级是值的集合
      */
     public val() {
         let data = [];
         this.mapSelected(option => {
            data.push(option.data('value'));
         })
         return this.options.column > 1 ? data : data[0];
     }

     /**
      * 循环所有选中的项
      * @param cb (option: JQuery, index: number) => any
      */
     public mapSelected(cb: (option: JQuery, index: number) => any) {
        for (let i = 0; i < this.options.column; i++) {
            if (cb && cb(this.getSelectedOption(i), i) === false) {
                break;
            }
        }
        return this;
     }

     /**
      * 获取当前选中的选项
      * @param column 第几级
      */
     public getSelectedOption(column: number = 0) {
        return this._ulBox[column].find('li').eq(this._index[column])
     }

     /**
      * 触发通知
      */
     public notify() {
        this._real_index = this._index.slice();
        let opts: Array<JQuery> = [],
            data: Array<string|number> = [],
            texts: Array<string> = [];
        this.mapSelected((option: JQuery) => {
            opts.push(option);
            texts.push(option.text());
            data.push(option.data('value'));
        });
        this.trigger('done', ...data, ...texts, ...opts, ...this._index);
        return this;
    }

    /**
     * range
     */
    public range(start: number, end: number, step?: number): number[] {
        let data: number[] = [];
        if (typeof step === 'undefined' || step === 0) {
            step = start > end ? -1 : 1;
        }
        while (true) {
            if (
                (step > 0 && start > end)
                || (step < 0 && start < end)
                ) {
                break;
            }
            data.push(start);
            start += step;
        }
        return data;
    }
}

interface SelectBoxOptions {
    title?: string,
    data?: any,
    default?: string | number,
    column?: number,
    textTag?: string,
    valueTag?: string,
    childrenTag?: string,
    createOption?: (item: any, key: string| number) => string,
    lineHeight?: number,
    ondone?: (val: string| number, text: string, option: JQuery, index: number) => any
 }

 class SelectBoxDefaultOptions implements SelectBoxOptions {
     title: string = '请选择';
     column: number = 1;
     textTag: string = 'value';
     valueTag: string = 'id';
     childrenTag: string = 'children';
     lineHeight: number = 30;
 }

 class SelectElemnt {
     constructor(
         public element: JQuery
     ) {
        this._init();
     }

     public selectInput: JQuery;

     public box: SelectBox;

     private _init() {
         this.element.hide();
         this.selectInput = $('<div class="dialog-select-input"></div>')
         this.element.after(this.selectInput);
         let _this = this,
            val: any = this.element.val();
        this.box = new SelectBox(this.selectInput, {
            title: this._getTitle(),
            data: this._getOptions(),
            default: val,
            ondone: function(val: string, text: string) {
                _this.selectInput.text(text);
                _this.element.val(val).trigger('change');
            }
        });
        this.element.on('optionschange', function() {
            _this.refresh();
        });
     }

     private _getOptions() {
        let data = [];
        this.element.find('option').each(function() {
            data.push({
                id: this.getAttribute('value'),
                value: this.innerText,
            });
        });
        return data;
     }

     /**
      * 刷新更新数据选项
      */
     public refresh() {
        this.box.options.data = this._getOptions();
        this.box.refresh();
        return this;
     }

     private _getTitle() {
         let id = this.element.attr('id');
        if (!id || id.length < 1) {
            return '请选择';
        }
        let title = $('label[for='+id+']').text();
        if (title) {
            return '请选择' + title;
        }
        return '请选择';
     }

     
 }
 
 ;(function($: any) {
    $.fn.select = function(options ?: SelectBoxOptions) {
        if (!this.is('select')) {
            return new SelectBox(this, options); 
        }
        this.each(function() {
            new SelectElemnt($(this));
        });
        return this;
    };
})(jQuery);