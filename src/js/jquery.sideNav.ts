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

    /**
     * init
     */
    public init() {
        this._initBox();
        this.getHeaders();
        this._bindEvent();
        this.fixed();
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
        $(window).scroll(function(){
            that.setActive()
        });
    }

    /**
     * setActive
     */
    public setActive() {
        let top = $(document).scrollTop();
        
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
        let st = $(window).scrollTop();
        if(st >= this.option.fixedTop){
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
            l = 1, m = 1, n = 1,
            html: string = '',
            headers_count = {
                h1: 0,
                h2: 0,
                h3: 0,
                h4: 0,
                h5: 0,
            };
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
        headers.each(function () { //遍历所有的header
            let key = this.localName.toLowerCase();
            if (!headers_count.hasOwnProperty(key)) {
                return;
            }
            let xheader = $(this);
    
            let text = xheader.text(),
                id = 'autoid-' + l + '-' + m + '-' + n;
    
            xheader.attr('id', id);
    
            if (text.length > 26)  {
                text = text.substr(0, 26) + "...";
            }
            html += '<li><a href="#' + id + '" title="' + text + '">' +  text + '</a></li>';
            l++;
        });
        this.box.html('<ul>'+html+'</ul>');
    }

}

interface SideNavOption {
    maxLength?: number, // 导航个数
    fixedTop?: number, // 固定高度
    speed?: number,
    easing?: string,
    target?: string
}

class SideNavDefaultOption implements SideNavOption {
    maxLength: number = 17;
    fixedTop: number = 0;
    speed: number = 500;
    easing: string = 'swing';
}


;(function($: any) {
    $.fn.sideNav = function(option ?: SideNavOption) {
        return new SideNav(this, option); 
    };
})(jQuery);