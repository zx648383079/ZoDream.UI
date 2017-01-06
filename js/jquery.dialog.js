var Dialog = (function () {
    function Dialog(element, option) {
        this.element = element;
        this.option = $.extend({}, new DialogDefaultOptions, option);
    }
    Dialog.prototype.addMoveEvent = function () {
        var iDiffX, iDiffY, instance = this;
        this.element.find(this.option.titleTag).mousedown(function (e) {
            $(this).css({ "cursor": "move" });
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            $(document).mousemove(function (e) {
                instance.element.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }).mouseup(function () {
            $(document).unbind("mousemove");
            $(this).css({ "cursor": "auto" });
        });
    };
    Dialog.prototype.addCloseEvent = function () {
        var instance = this;
        this.element.find(this.option.closeTag).click(function () {
            instance.element.hide();
        });
    };
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
var DialogDefaultOptions = (function () {
    function DialogDefaultOptions() {
        this.titleTag = '.head';
        this.minTag = '.min';
        this.closeTag = '.close';
    }
    return DialogDefaultOptions;
}());
;
(function ($) {
    $.fn.dialog = function (options) {
        return new Dialog(this, options);
    };
})(jQuery);
