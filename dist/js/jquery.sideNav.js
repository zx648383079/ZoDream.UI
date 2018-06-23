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
        this._window = $(window);
        this._initBox();
        this.getHeaders();
        this._bindEvent();
        this.fixed();
        this.setActive();
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
        this._window.scroll(function () {
            that.setActive();
        });
    };
    SideNav.prototype._getScrollTop = function () {
        return window.pageYOffset;
    };
    SideNav.prototype._getScrollHeight = function () {
        return window.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    };
    SideNav.prototype._getOffsetHeight = function () {
        return window.innerHeight;
    };
    /**
     * refresh
     */
    SideNav.prototype.refresh = function () {
        var _this = this;
        this._scrollHeight = this._getScrollHeight();
        var _targets = [];
        this._offsets = [];
        this.headers
            .map(function (element) {
            return [
                element.offset().top,
                element
            ];
        })
            .filter(function (item) { return item; })
            .sort(function (a, b) { return a[0] - b[0]; })
            .forEach(function (item) {
            _this._offsets.push(item[0]);
            _targets.push(item[1]);
        });
        this.headers = _targets;
    };
    /**
     * setActive
     */
    SideNav.prototype.setActive = function () {
        var top = this._getScrollTop() + this.option.offset, scrollHeight = this._getScrollHeight(), activeId;
        if (this._scrollHeight != scrollHeight) {
            this.refresh();
        }
        for (var i = this._offsets.length; i--;) {
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
        this.box.find('a[href="#' + activeId + '"]').closest('li').addClass(this.option.active);
    };
    SideNav.prototype._clear = function () {
        this.box.find('li.' + this.option.active).removeClass(this.option.active);
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
        var top = this._window.scrollTop();
        if (top >= this.option.fixedTop) {
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
        var headers = this.element.find(':header'), html = '', headers_list = [], headers_count = {
            h1: 0,
            h2: 0,
            h3: 0,
            h4: 0,
            h5: 0,
            h6: 0
        }, headers_order;
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
        headers_order = Object.keys(headers_count);
        length = 0;
        headers.each(function () {
            var key = this.localName.toLowerCase();
            if (!headers_count.hasOwnProperty(key)) {
                return;
            }
            var xheader = $(this), text = xheader.text(), id = 'autoid-' + length;
            xheader.attr('id', id);
            headers_list.push(xheader);
            if (text.length > 26) {
                text = text.substr(0, 26) + "...";
            }
            html += '<li class="nav-level-' + headers_order.indexOf(key) + '"><a href="#' + id + '" title="' + text + '">' + text + '</a></li>';
            length++;
        });
        this.headers = headers_list;
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
        this.active = 'active';
        this.offset = 10;
    }
    return SideNavDefaultOption;
}());
;
(function ($) {
    $.fn.sideNav = function (option) {
        return new SideNav(this, option);
    };
})(jQuery);
