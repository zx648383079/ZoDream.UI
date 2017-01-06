var Pager = (function () {
    function Pager(element, option) {
        this.element = element;
        this.option = $.extend({}, new PagerDefaultOption(), option);
    }
    return Pager;
}());
var PagerDefaultOption = (function () {
    function PagerDefaultOption() {
    }
    return PagerDefaultOption;
}());
;
(function ($) {
    $.fn.pager = function (option) {
        return new Pager(this, option);
    };
})(jQuery);
