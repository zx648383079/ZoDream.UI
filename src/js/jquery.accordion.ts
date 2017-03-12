class Accordion {
    constructor(
        public element: JQuery,
        options?: AccordionOptions
    ) {
        this.options = $.extend({}, new AccordionDefaultOptions(), options);
        this.width = element.width();
        this.item = this.element.find(this.options.itemTag);
        this.length = this.item.length;
        let accordion = this;
        this.item.hover(function() {
            accordion.addActive($(this));
        });
    }

    public item: JQuery;

    public options: AccordionOptions;

    public width: number = 0;

    public length: number = 0;

    public getMaxWidth() {
        return this.width - (this.length - 1) * this.options.minWidth;
    }

    public addActive(element: JQuery | number) {
        if ("number" == typeof element) {
            element = this.item.eq(element);
        }
        element.addClass(this.options.activeClass);
        let others:JQuery = element.siblings().removeClass(this.options.activeClass);
        if (this.options.direction == AccordionDirection.Horizon) {
            element.css("width", this.getMaxWidth() + "px");
            others.css("width", this.options.minWidth + "px");
        }
        

    }
}

enum AccordionDirection {
    Horizon,
    Vertical
}

interface AccordionOptions {
    itemTag?: string,
    activeClass?: string,
    minWidth?: number,
    direction?: AccordionDirection
}

class AccordionDefaultOptions implements AccordionOptions {
    itemTag: string = "li";
    activeClass: string = "active";
    minWidth: number = 40;
    direction: AccordionDirection = AccordionDirection.Horizon;
}

 ;(function($: any) {
  $.fn.accordion = function(options ?: AccordionOptions) {
    return new Accordion(this, options); 
  };
})(jQuery);