var Dialog = (function () {
    function Dialog() {
    }
    Dialog.tip = function (content, time) {
        if (time === void 0) { time = 2000; }
        var element = $(".tipDialog");
        element.html(content).show();
        this.timer(function () {
            element.hide();
        }, time);
    };
    Dialog.notify = function (content, width, time) {
        if (width === void 0) { width = 200; }
        if (time === void 0) { time = 2000; }
        var element = $(".notifyDialog");
        element.html(content).css("width", width + "px");
        this.timer(function () {
            element.css("width", "0px");
        }, time);
    };
    Dialog.timer = function (callback, time) {
        if (time === void 0) { time = 2000; }
        var timer = setTimeout(function () {
            callback();
            clearTimeout(timer);
        }, time);
    };
    return Dialog;
}());
;
(function ($) {
    $.dialog = Dialog;
})(jQuery);
//# sourceMappingURL=jquery.dialog.js.map