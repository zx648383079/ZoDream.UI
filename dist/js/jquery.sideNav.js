var SideNav = /** @class */ (function () {
    function SideNav(element, option) {
        this.element = element;
        this.option = $.extend({}, new SideNavDefaultOption(), option);
        this.init();
    }
    /**
     * init
     */
    SideNav.prototype.init = function () {
        this._initBox();
        this.getHeaders();
        this._bindEvent();
        this.fixed();
    };
    SideNav.prototype._bindEvent = function () {
        var that = this;
        this.box.on('click', 'a', function (e) {
            e.preventDefault();
            var id = $(this).attr('href').split('#')[1];
            if (id) {
                that.scrollTo('#' + id);
            }
        });
    };
    SideNav.prototype._initBox = function () {
        if (this.option.target) {
            this.box = $(this.option.target);
            return;
        }
        this.box = $('<div class="side-nav" data-type="sideNav"></div>');
        $(document.body).append(this.box);
    };
    SideNav.prototype.fixed = function () {
        var st = $(window).scrollTop();
        if (st >= this.option.fixedTop) {
            this.box.css({
                "position": "fixed",
            });
            return;
        }
        this.box.css({
            "position": "absolute",
        });
    };
    /**
     * scrollTo
     */
    SideNav.prototype.scrollTo = function (target, callback) {
        //获取目标元素的TOP值
        var offset = $(target).offset().top;
        var $el = $('html,body');
        if (!$el.is(":animated")) {
            $el.animate({
                scrollTop: offset
            }, this.option.speed, this.option.easing, callback);
        }
    };
    /**
     * getHeaders
     */
    SideNav.prototype.getHeaders = function () {
        var headers = this.element.find(':header'), l = 1, m = 1, n = 1, html = '', headers_count = {
            h1: 0,
            h2: 0,
            h3: 0,
            h4: 0,
            h5: 0,
        };
        headers.each(function () {
            var key = this.localName.toLowerCase();
            if (!headers_count.hasOwnProperty(key)) {
                return;
            }
            headers_count[key]++;
        });
        var length = 0;
        for (var key in headers_count) {
            if (!headers_count.hasOwnProperty(key)) {
                continue;
            }
            length += headers_count[key];
            if (headers_count[key] <= 0 || length > this.option.maxLength) {
                delete headers_count[key];
            }
        }
        headers.each(function () {
            var key = this.localName.toLowerCase();
            if (!headers_count.hasOwnProperty(key)) {
                return;
            }
            var xheader = $(this);
            var text = xheader.text(), id = 'autoid-' + l + '-' + m + '-' + n;
            xheader.attr('id', id);
            if (text.length > 26) {
                text = text.substr(0, 26) + "...";
            }
            html += '<li><a href="#' + id + '" title="' + text + '">' + text + '</a></li>';
            l++;
        });
        this.box.html('<ul>' + html + '</ul>');
    };
    return SideNav;
}());
var SideNavDefaultOption = /** @class */ (function () {
    function SideNavDefaultOption() {
        this.maxLength = 17;
        this.fixedTop = 0;
        this.speed = 500;
        this.easing = 'swing';
    }
    return SideNavDefaultOption;
}());
;
(function ($) {
    $.fn.sideNav = function (option) {
        return new SideNav(this, option);
    };
})(jQuery);
