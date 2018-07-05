 class SelectBox extends Eve {
     constructor(
         public element: JQuery,
         options?: SelectBoxOptions
     ) {
         super();
         this.options = $.extend({}, new SelectBoxDefaultOptions(), options);
         let _this = this;
         if (typeof this.options.data == 'function') {
            this.options.data = this.options.data.call(this, function(data) {
                _this.options.data = data;
                _this._init();
            });
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
         this.refresh();
         if (this.options.default) {
            this.applyValue(this.options.default);
         }
         this.notify();
     }

     private _bindEvent() {
        let _this = this;
        this.element.click(function(e) {
            e.stopPropagation();
            _this.show();
        });
        // $(document).click(function() {
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
                y: touch.pageY,
                time: new Date()
            };
        }).on('touchmove', function(event) {
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
        // if ($.fn.swipe) {
        //     this.box.swipe({
        //         swipe: function(event, direction: string, distance: number, duration: number, fingerCount: number, fingerData: any) {
        //             if (direction == $.fn.swipe.directions.UP) {
        //                 _this.touchMove(distance, true, fingerData[0].start.x);
        //                 return;
        //             }
        //             if (direction == $.fn.swipe.directions.DOWN) {
        //                 _this.touchMove(distance, false, fingerData[0].start.x);
        //                 return;
        //             }
        //         }
        //     });
        // }
    }

    /**
     * 滑动
     * @param distance 
     * @param isUp 
     * @param x 
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


    public show() {
        this.box.show();
        return this;
    }

    public hide() {
        this.box.hide();
        this.restore();
        return this;
    }

    public restore() {
        let data = this._real_index.slice();
        for (let i = 0; i < this.options.column; i++) {
            this.selectedIndex(data[i], i);
        }
        return this;
    }

     public refresh() {
        this._refreshUl(0, this.options.data);
        for (let i = 0; i < this.options.column; i++) {
            this._real_index[i] = 0;
        }
        this.restore();
        return this;
     }

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

     public refreshColumn(column: number = 0) {
         let data = this._getColumnOption(column);
         this._refreshUl(column, data);
         this.selectedIndex(0, column);
         return this;
     }

     private _createOptionHtml(data: any) {
        let html = '';
        let _this = this;
        $.each(data, function(i: any, item) {
            let [value, text] = _this._getValueAndText(item, i);
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
            return [i, item];
        }
        let name = item[this.options.textTag];
        if (this.options.valueTag && item.hasOwnProperty(this.options.valueTag)) {
            return [item[this.options.valueTag], name];
        }
        return [i, name];
    }

     public selected(option: JQuery | number, column: number = 0) {
         if (typeof option == 'number') {
             return this.selectedIndex(option, column);
         }
         if (typeof option == 'object') {
             return this.selectedOption(option, column);
         }
         return this.selectedValue(option, column);
     }
     
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

     public selectedValue(id: number| string, column: number = 0) {
        let option = this._ulBox[column].find('li[data-value="'+ id +'"]');
        this.selectedOption(option, column);
        return this;
     }

     public selectedOption(option: JQuery, column: number = 0) {
        option.addClass('active').siblings().removeClass('active');
        this._index[column] = option.index();
        let top = 2 * this.options.lineHeight - this._index[column]  * this.options.lineHeight;
        this._ulBox[column].css('transform', 'translate(0px, ' + top +'px) translateZ(0px)');
        if (this.options.column > column + 1) {
            this.refreshColumn(column + 1);
        }
        return this;
     }

     public val() {
         let data = [];
         for (let i = 0; i < this.options.column; i++) {
             data.push(this.getSelectedOption(i).attr('data-value'))
         }
         return this.options.column > 1 ? data : data[0];
     }

     public mapSelected(cb: (option: JQuery, index: number) => any) {
        for (let i = 0; i < this.options.column; i++) {
            if (cb && cb(this.getSelectedOption(i), i) === false) {
                break;
            }
        }
        return this;
     }

     public getSelectedOption(index: number = 0) {
        return this._ulBox[index].find('li').eq(this._index[index])
     }

     public notify() {
        this._real_index = this._index.slice();
        let opts: Array<JQuery> = [],
            data: Array<string|number> = [],
            texts: Array<string> = [];
        this.mapSelected((option: JQuery) => {
            opts.push(option);
            texts.push(option.text());
            data.push(option.attr('data-value'));
        })
        this.trigger('done', ...data, ...texts, ...opts, ...this._index);
        return this;
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
    lineHeight?: number,
    onclick?: (item: string, element: JQuery) => any,
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
         let instance = this;
        this.box = new SelectBox(this.selectInput, {
            title: this._getTitle(),
            data: this._getOptions(),
            ondone: function(val: string, text: string) {
                instance.selectInput.text(text);
                instance.element.val(val).trigger('change');
            }
        });
        this.element.on('optionschange', function() {
            instance.refresh();
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