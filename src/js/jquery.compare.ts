class Compare {
    constructor(
        public element: JQuery,
        public option?: CompareOption
    ) {
        if (!this.option.max) {
            this.option.max = 4;
        }
        this.init();
        this._bindEvent();
    }

    private _dialog: JQuery;

    private _cookieName: string = '__compareGooods';

    private _items: JQuery;

    private _count: number = 0;

    private _data: Array<any> = [];

    public init() {
        let data = $.cookie(this._cookieName);
        if (data) {
            try {
                this._data = JSON.parse(data);
            } catch ($ex) {
                this._data = [];
                this._setCookie();
            }
        }
        this._count = this._data.length;
        this._dialog = $('<div id="pop-compare"  class="pop-compare"></div>');
        let html = '<div class="pop-wrap"><p class="pop-compare-tips"></p><div class="pop-inner"><div class="diff-hd"><ul class="tab-btns clearfix"><li class="current" data-tab="trigger"><a href="javascript:;">对比栏</a></li></ul><div class="operate"><a href="javascript:;" class="hide-me">隐藏</a></div></div><div class="diff-bd tab-cons"><div class="tab-con" data-tab="item"><div id="diff-items" class="diff-items clearfix">';
        let count = this._data.length;
        for (let i = 0; i < 4; i ++) {
            html += '<dl>' + this._getLiHtml(count > i ? this._data[i] : i) + '</dl>';
        }
        this._dialog.html(html + '</div><div class="diff-operate"><a target="_blank" id="goto-contrast" href="" class="btn-compare-b compare-active">对比</a><a class="del-items">清空对比栏</a></div></div></div></div></div>');
        this._items = this._dialog.find('.diff-items dl');
        $(document.body).append(this._dialog);
        if (this._data.length > 0) {
            this._dialog.show();
        }
        if (this.option.onChange) {
            this.option.onChange.call(this, this._data);
        }
    }

    public map(callback: (item: any) => any) {
        for (let i = this._data.length - 1; i >= 0; i --) {
            if (callback(this._data[i]) == false) {
                return;
            }
        }
    }

    public addItem(data: any) {
        if (this._data.length > this.option.max) {
            return;
        }
        this._data.push(data);
        if (this.option.onChange) {
            this.option.onChange.call(this, this._data);
        }
        this._setCookie();
        this._showData(this._items.eq(this._count), data);
        this._count = this._data.length;
    }

    private _bindEvent() {
        let instance = this;
        this.element.on('click', function(e) {
            if (instance.option.onClick) {
                instance.option.onClick.call(instance, $(this));
            }
            instance._dialog.show();
        });
        this._dialog.find('.hide-me').on('click', function() {
            instance._dialog.hide();
        });
        this._dialog.find('.del-items').on('click', function() {
            instance.removeAll();
        });
        this._items.on('click', '.del-comp-item', function() {
            instance.removeItem($(this).parents('dl'));
        });
    }

    private _showData(element: JQuery, data?: any) {
        if (!data) {
            element.removeClass('hasItem').addClass('item-empty').html(this._getLiHtml(element.index()));
            return;
        }
        element.removeClass('item-empty')
        .addClass('hasItem').html(this._getLiHtml(data));
    }

    private _getLiHtml(data: any): string {
        if (typeof data == 'number') {
            return '<dt>'+(data + 1)+'</dt><dd>您还可以继续添加</dd>';
        }
        return '<dt><a target="_blank" href="'+
        data.url+'"><img src="'+
        data.image+'" width="50" height="50"></a>  </dt>  <dd>    <a target="_blank" class="diff-item-name" href="#">'+data.name+'</a>   <span class="p-price"><strong>'
        +data.price+'</strong><a class="del-comp-item">删除</a> </span>   </dd>';
    }

    public removeItem(item: JQuery | number) {
        let i: number;
        if (typeof item == 'number'){
            i = item;
            item = this._items.eq(item);
        } else {
            i = item.index();
        }
        this._data.splice(i, 1);
        if (this.option.onChange) {
            this.option.onChange.call(this, this._data);
        }
        this._setCookie();
        for(; i < 4; i ++) {
            if (this._data.length > i) {
                this._showData(this._items.eq(i), this._data[i]);
                continue;
            }
            break;
        }
        this._showData(this._items.eq(i));
        if (this._data.length <= 0) {
            this._dialog.hide();
        }
    }

    private _setCookie() {
        $.cookie(this._cookieName, JSON.stringify(this._data), { path: '/' });
    }

    public removeAll() {
        for(let i = 3; i >= 0; i --) {
            this.removeItem(i);
        }
    }
}

interface CompareOption {
    max?: number,
    onClick?: (element: JQuery) => any,
    onChange?: (data: Array<any>) => any
}

;(function($: any) {
    $.fn.compare = function(option ?: CompareOption) {
        return new Compare(this, option); 
    };
})(jQuery);