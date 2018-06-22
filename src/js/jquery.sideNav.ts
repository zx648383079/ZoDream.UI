class SideNav {

    constructor(
        public element: JQuery,
        option?: SideNavOption
    ) {
        this.option = $.extend({}, new SideNavDefaultOption(), option);
    }

    public option: SideNavOption;

    public box: JQuery;

    public fixed() {
        let st = $(window).scrollTop();
        if(st >= this.option.fixedTop){
            this.box.css({
                "position":"fixed",
                "top" : this.option.fixedTop + "px"
            });
            return;
        }
        this.box.css({
            "position":"absolute",
            "top": this.option.fixedTop + "px"
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
            let xheader = $(this), //当前的header的对象
                v = xheader[0];
    
            let text = xheader.text(),
                id = 'autoid-' + l + '-' + m + '-' + n;
    
            xheader.attr('id', id);
    
            if (v.localName === 'h2') {
                level1 = l + '.';
                if (text.length > 26)  {
                    text = text.substr(0, 26) + "...";
                }
                catalog_item += '<li><a href="#' + xheader.attr('id') + '" title="' + text + '">' + l + ' ' + text + '</a><span class="sideCatalog-dot pointer"></span></li>';
                l++;
            } else if (v.localName === 'h3') {
                level2 = level1 + m + '.';
                if (text.length > 22) {
                    text = text.substr(0, 22) + "...";
                }
                catalog_item += '<li class="h2Offset"><a href="#' + xheader.attr('id') + '" title="' + text + '">' + level1 + m + ' ' + text + '</a><span class="pointer"></span></li>';
                m++;
            } else if (v.localName === 'h4') {
                if (s.find('h2').length + s.find('h3').length + +s.find('h4').length < 17) {
                    if (text.length > 18) text = text.substr(0, 18) + "...";
                    catalog_item += '<li class="h3Offset"><a href="#' + xheader.attr('id') + '" title="' + text + '">' + level2 + n + ' ' + text + '</a><span class="pointer"></span></li>';
                    n++;
                }
            }
        });
    }

}

interface SideNavOption {
    maxLength?: number, // 导航个数
    fixedTop?: number, // 固定高度
    speed?: number,
    easing?: string,
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