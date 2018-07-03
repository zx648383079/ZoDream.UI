 class SelectBox extends Eve {
     constructor(
         public element: JQuery,
         options?: SelectBoxOptions
     ) {
         super();
         this.options = $.extend({}, new SelectBoxDefaultOptions(), options);
        this._init();
     }

     public options: SelectBoxOptions;

     public box: JQuery;

     private _index: number = 0;

     private _real_index: number = 0;

     private _length: number = 0;
     
     private _ulBox: JQuery;

     private _init() {
         this.box = $('<div class="dialog dialog-select"></div>');
         $(document.body).append(this.box);
         this.box.html('<div class="dialog-header"><div class="dialog-close">取消</div><div class="dialog-title">'+ this.options.title +'</div><div class="dialog-yes">确定</div></div><div class="dialog-body"><ul></ul><hr class="dialog-top-hr"><hr class="dialog-bottom-hr"></div>');
         this._ulBox = this.box.find('.dialog-body ul');
         this._bindEvent();
         this.refresh();
         if (this.options.default) {
            this.selectedValue(this.options.default).notify();
            return;
         }
         this.selected(0).notify();
     }

     private _bindEvent() {
        let instance = this;
        this.element.click(function(e) {
            e.stopPropagation();
            instance.show();
        });
        // $(document).click(function() {
        //    instance.hide();
        // });
        this.box.on('click', '.dialog-close', function() {
            instance.hide();
        });
        this.box.on('click', '.dialog-yes', function() {
            instance.notify().hide();
        });
        this._ulBox.on('click', 'li', function() {
            instance.selected($(this));
        });
        if ($.fn.swipe) {
            this.box.swipe({
                swipe: function(event, direction: string, distance: number) {
                    if (direction == $.fn.swipe.directions.UP) {
                        instance.selectedIndex(instance._index + Math.floor(distance / 30));
                        return;
                    }
                    if (direction == $.fn.swipe.directions.DOWN) {
                        instance.selectedIndex(instance._index - Math.ceil(distance / 30));
                        return;
                    }
                }
            });
        }
    }

    public show() {
        this.box.show();
        return this;
    }

    public hide() {
        this.box.hide();
        if (this._index != this._real_index) {
            this.selectedIndex(this._real_index);
        }
        return this;
    }

     public refresh() {
        let html = '';
        let instance = this;
        this._length = 0;
        $.each(this.options.data, function(i: any, item) {
            instance._length ++;
            if (instance.options.textTag) {
                html += '<li data-value="'+ item[instance.options.valueTag] +'">'+ item[instance.options.textTag]  + '</li>';
                return;
            }
            html += '<li data-value="'+ i +'">'+ item + '</li>';
        });
        this._ulBox.html(html);
        return this;
     }

     public selected(option: JQuery | number) {
         if (typeof option == 'number') {
             return this.selectedIndex(option);
         }
         if (typeof option == 'object') {
             return this.selectedOption(option);
         }
         return this.selectedValue(option);
     }
     
     public selectedIndex(index: number = 0) {
        if (index < 0) {
            index = 0;
        }
        if (index >= this._length) {
            index = this._length - 1;
        }
        let option = this._ulBox.find('li').eq(index);
        this.selectedOption(option);
        return this;
     }

     public selectedValue(id: number| string) {
        let option = this._ulBox.find('li[data-value="'+ id +'"]');
        this.selectedOption(option);
        return this;
     }

     public selectedOption(option: JQuery) {
        option.addClass('active').siblings().removeClass('active');
        this._index = option.index();
        let top = 60 - this._index  * 30;
        this._ulBox.css('transform', 'translate(0px, ' + top +'px) translateZ(0px)');
        return this;
     }

     public val() {
         return this._ulBox.find('li').eq(this._index).attr('data-value');
     }

     public notify() {
         this._real_index = this._index;
        let option = this._ulBox.find('li').eq(this._index);
        this.trigger('done', option.attr('data-value'), option, this._index);
        return this;
     }
}

interface SelectBoxOptions {
    title?: string,
    data?: any,
    default?: string | number,
    textTag?: string,
    valueTag?: string,
    onclick?: (item: string, element: JQuery) => any,
    ondone?: (val: any, option: JQuery, index: number) => any
 }

 class SelectBoxDefaultOptions implements SelectBoxOptions {
     title: string = '请选择';
     textTag: string = 'value';
     valueTag: string = 'id';
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
            ondone: function(val: string, option: JQuery) {
                instance.selectInput.text(option.text());
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