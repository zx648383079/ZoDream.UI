var Accordion = /** @class */ (function () {
    function Accordion(element, options) {
        this.element = element;
        this.width = 0;
        this.length = 0;
        this.options = $.extend({}, new AccordionDefaultOptions(), options);
        this.width = element.width();
        this.item = this.element.find(this.options.itemTag);
        this.length = this.item.length;
        var accordion = this;
        this.item.hover(function () {
            accordion.addActive($(this));
        });
    }
    Accordion.prototype.getMaxWidth = function () {
        return this.width - (this.length - 1) * this.options.minWidth;
    };
    Accordion.prototype.addActive = function (element) {
        if ("number" == typeof element) {
            element = this.item.eq(element);
        }
        element.addClass(this.options.activeClass);
        var others = element.siblings().removeClass(this.options.activeClass);
        if (this.options.direction == AccordionDirection.Horizon) {
            element.css("width", this.getMaxWidth() + "px");
            others.css("width", this.options.minWidth + "px");
        }
    };
    return Accordion;
}());
var AccordionDirection;
(function (AccordionDirection) {
    AccordionDirection[AccordionDirection["Horizon"] = 0] = "Horizon";
    AccordionDirection[AccordionDirection["Vertical"] = 1] = "Vertical";
})(AccordionDirection || (AccordionDirection = {}));
var AccordionDefaultOptions = /** @class */ (function () {
    function AccordionDefaultOptions() {
        this.itemTag = "li";
        this.activeClass = "active";
        this.minWidth = 40;
        this.direction = AccordionDirection.Horizon;
    }
    return AccordionDefaultOptions;
}());
;
(function ($) {
    $.fn.accordion = function (options) {
        return new Accordion(this, options);
    };
})(jQuery);
