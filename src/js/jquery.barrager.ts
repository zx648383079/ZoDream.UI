class Darrager {
    constructor(
        public element: JQuery,
        options?: DarragerOptions
    ) {
        this.options = $.extend({}, new DarragerDefaultOptions(), options);
        this._init();
    }

    public options: DarragerOptions;

    private _init() {
        let element = this._createElement();
        this._bindEvent(element);
    }

    private _createElement(): JQuery {
        let time = new Date().getTime();
        let element = $('<div class="barrage" id="barrager-' + time + '"></div>');
        let html = '<div class="barrage-box">';
        if (this.options.img) {
            html += '<div class="barrage-img"><img src="'+ this.options.img +'" alt=""></div>';
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
            bottom: this.options.bottom == 0 ? Math.floor(Math.random() * Math.min(this.element.height(), $(window).height() - 100 ) + 40) : this.options.bottom        
        });
        return element;
    }

    private _bindEvent(element: JQuery) {
        let width = Math.min($(window).width() + 500, this.element.width());
        let instance = this;
        element.animate({
            right: width
        }, this.options.speed * 1000, function() {
            element.remove();
        });
        element.mouseover(function() {
            element.stop(true);
        });
        element.mouseout(function() {
            element.animate({
                right: width
            }, instance.options.speed * 1000, function() {
                element.remove();
            });
        });

        element.find('.barrage-close').click(function() {
            element.remove();
        });
    }

    /**
     * remove
     */
    public remove() {
        this.element.find('.barrage').remove();
    }
}


interface DarragerOptions {
    img?: string,
    url?: string,
    content?: string,
    close?: boolean,
    bottom?: number,
    max?: number,
    speed?: number,
    color?: string,
}

class DarragerDefaultOptions implements DarragerOptions {
    close = true;
    bottom = 0;
    max = 10;
    speed = 8;
    color = '#fff'
}

;(function($: any) {
    $.fn.barrager = function(options ?: DarragerOptions) {
      return new Darrager(this, options); 
    };
})(jQuery);