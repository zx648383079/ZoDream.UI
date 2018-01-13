var Darrager = /** @class */ (function () {
    function Darrager(element, options) {
        this.element = element;
        this.options = $.extend({}, new DarragerDefaultOptions(), options);
        this._init();
    }
    Darrager.prototype._init = function () {
        var element = this._createElement();
        this._bindEvent(element);
    };
    Darrager.prototype._createElement = function () {
        var time = new Date().getTime();
        var element = $('<div class="barrage" id="barrager-' + time + '"></div>');
        var html = '<div class="barrage-box">';
        if (this.options.img) {
            html += '<div class="barrage-img"><img src="' + this.options.img + '" alt=""></div>';
        }
        html += '<div class="barrage-content" style="' + (this.options.color ? 'color: ' + this.options.color : '') + '"><a href="' + (this.options.url || 'javascript:;') + '">' + this.options.content + '</a></div>';
        if (this.options.close) {
            html += '<div class="barrage-close"><i class="fa fa-close"></i></div>';
        }
        html += '</div>';
        element.html(html);
        this.element.append(element);
        element.css({
            'margin-right': 0,
            bottom: this.options.bottom == 0 ? Math.floor(Math.random() * Math.min(this.element.height(), $(window).height() - 100) + 40) : this.options.bottom
        });
        return element;
    };
    Darrager.prototype._bindEvent = function (element) {
        var width = Math.min($(window).width() + 500, this.element.width());
        var instance = this;
        element.animate({
            right: width
        }, this.options.speed * 1000, function () {
            element.remove();
        });
        element.mouseover(function () {
            element.stop(true);
        });
        element.mouseout(function () {
            element.animate({
                right: width
            }, instance.options.speed * 1000, function () {
                element.remove();
            });
        });
        element.find('.barrage-close').click(function () {
            element.remove();
        });
    };
    /**
     * remove
     */
    Darrager.prototype.remove = function () {
        this.element.find('.barrage').remove();
    };
    return Darrager;
}());
var DarragerDefaultOptions = /** @class */ (function () {
    function DarragerDefaultOptions() {
        this.close = true;
        this.bottom = 0;
        this.max = 10;
        this.speed = 8;
        this.color = '#fff';
    }
    return DarragerDefaultOptions;
}());
;
(function ($) {
    $.fn.barrager = function (options) {
        return new Darrager(this, options);
    };
})(jQuery);
