class SideNav {

    constructor(
        public element: JQuery,
        option?: SideNavOption
    ) {
        this.option = $.extend({}, new SideNavDefaultOption(), option);
        this.init();
    }

    public option: SideNavOption;

    public box: JQuery;

    public headers: Array<JQuery>;

    private _offsets: Array<number>

    private _scrollHeight: number;

    private _activeId: string;

    private _window: JQuery;

    /**
     * init
     */
    public init() {
        this._window = $(window);
        this._initBox();
        this.getHeaders();
        this._bindEvent();
        this.fixed();
        this.setActive();
    }

    private _bindEvent() {
        let that = this;
        this.box.on('click', 'a', function(e) {
            e.preventDefault();
            let id = $(this).attr('href').split('#')[1];
            if (id) {
                that.scrollTo('#'+id);
            }
        });
        this._window.scroll(function(){
            that.setActive();
        });
    }

    private _getScrollTop() {
        return window.pageYOffset;
    }
  
    private _getScrollHeight() {
        return window.scrollHeight || Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
    }
  
    private _getOffsetHeight() {
        return window.innerHeight;
    }

    /**
     * refresh
     */
    public refresh() {
        this._scrollHeight = this._getScrollHeight();
        let _targets = [];
        this._offsets = [];
        this.headers
            .map((element) => {
                return [
                    element.offset().top,
                    element
                ];
            })
            .filter((item) => item)
            .sort((a: any, b: any) => a[0] - b[0])
            .forEach((item: any) => {
                this._offsets.push(item[0]);
                _targets.push(item[1]);
            });
        this.headers = _targets;
    }

    /**
     * setActive
     */
    public setActive() {
        let top = this._getScrollTop() + this.option.offset,
            scrollHeight = this._getScrollHeight(),
            activeId: string;
        if (this._scrollHeight != scrollHeight) {
            this.refresh();
        }
        for (let i = this._offsets.length; i--;) {
            if (this._offsets[i] < top) {
                activeId = this.headers[i].attr('id');
                break;
            }
        }
        if (this._activeId == activeId) {
            return;
        }
        this._activeId = activeId;
        this._clear();
        this.box.find('a[href="#'+ activeId +'"]').closest('li').addClass(this.option.active);
    }

    private _clear() {
        this.box.find('li.' + this.option.active).removeClass(this.option.active);
    }

   private _initBox() {
       if (this.option.target) {
           this.box = $(this.option.target);
           return;
       }
       this.box = $('<div class="side-nav" data-type="sideNav"></div>');
       $(document.body).append(this.box);
   }

    public fixed() {
        let top = this._window.scrollTop();
        if(top >= this.option.fixedTop){
            this.box.css({
                "position": "fixed",
            });
            return;
        }
        this.box.css({
            "position": "absolute",
        });
    }

    /**
     * scrollTo
     */
    public scrollTo(target: any, callback?: any) {
        //获取目标元素的TOP值
        let offset = $(target).offset().top;
        var $el = $('html,body');
        if(!$el.is(":animated")){
            $el.animate({
                scrollTop: offset
            }, this.option.speed, this.option.easing, callback);
        }
    }

    /**
     * getHeaders
     */
    public getHeaders() {
        let headers = this.element.find(':header'),
            html: string = '',
            headers_list: Array<JQuery> = [],
            headers_count = {
                h1: 0,
                h2: 0,
                h3: 0,
                h4: 0,
                h5: 0,
                h6: 0
            }, headers_order: Array<string>;
        headers.each(function() {
            let key = this.localName.toLowerCase();
            if (!headers_count.hasOwnProperty(key)) {
                return;
            }
            headers_count[key] ++;
        });
        let length = 0;
        for (const key in headers_count) {
            if (!headers_count.hasOwnProperty(key)) {
                continue;
            }
            length += headers_count[key];
            if (headers_count[key] <= 0 || length > this.option.maxLength) {
                delete headers_count[key];
            }
        }
        headers_order = Object.keys(headers_count);
        length = 0;
        headers.each(function () { //遍历所有的header
            let key = this.localName.toLowerCase();
            if (!headers_count.hasOwnProperty(key)) {
                return;
            }
            let xheader = $(this),
                text = xheader.text(),
                id = 'autoid-' + length;
            xheader.attr('id', id);
            headers_list.push(xheader);
            if (text.length > 26)  {
                text = text.substr(0, 26) + "...";
            }
            html += '<li class="nav-level-'+ headers_order.indexOf(key) +'"><a href="#' + id + '" title="' + text + '">' +  text + '</a></li>';
            length ++;
        });
        this.headers = headers_list;
        this.box.html('<ul>'+html+'</ul>');
    }

}

interface SideNavOption {
    maxLength?: number, // 导航个数
    fixedTop?: number, // 固定高度
    speed?: number,     // 滚动速度
    easing?: string,  
    target?: string,    //导航保存的位置
    active?: string,     // 当前选中的样式
    offset?: number,     //偏移量
}

class SideNavDefaultOption implements SideNavOption {
    maxLength: number = 17;
    fixedTop: number = 0;
    speed: number = 500;
    easing: string = 'swing';
    active: string = 'active';
    offset: number = 10;
}


;(function($: any) {
    $.fn.sideNav = function(option ?: SideNavOption) {
        return new SideNav(this, option); 
    };
})(jQuery);