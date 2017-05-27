var SelectBox = (function () {
    function SelectBox(element, options) {
        this.element = element;
        this.options = $.extend({}, new SelectBoxDefaultOptions(), options);
    }
    return SelectBox;
}());
var SelectBoxDefaultOptions = (function () {
    function SelectBoxDefaultOptions() {
    }
    return SelectBoxDefaultOptions;
}());
;
(function ($) {
    $.fn.select = function (options) {
        return new SelectBox(this, options);
    };
})(jQuery);
