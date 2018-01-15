var Darrager = /** @class */ (function () {
    function Darrager(element, options) {
        this.element = element;
        this.options = $.extend({}, new DarragerDefaultOptions(), options);
    }
    return Darrager;
}());
var DarragerDefaultOptions = /** @class */ (function () {
    function DarragerDefaultOptions() {
    }
    return DarragerDefaultOptions;
}());
;
(function ($) {
    $.fn.barrager = function (options) {
        return new Darrager(this, options);
    };
})(jQuery);
