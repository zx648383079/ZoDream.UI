var MessageBox = /** @class */ (function () {
    function MessageBox(element, option) {
        this.element = element;
        this.option = $.extend({}, new MessageBoxDefaultOptions, option);
    }
    MessageBox.prototype.addMoveEvent = function () {
        var iDiffX, iDiffY, instance = this;
        this.element.find(this.option.titleTag).on('mousedown', function (e) {
            $(this).css({ "cursor": "move" });
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            $(document).on('mousemove', function (e) {
                instance.element.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }).on('mouseup', function () {
            $(document).unbind("mousemove");
            $(this).css({ "cursor": "auto" });
        });
    };
    MessageBox.prototype.addCloseEvent = function () {
        var instance = this;
        this.element.find(this.option.closeTag).on('click', function () {
            instance.element.hide();
        });
    };
    MessageBox.tip = function (content, time) {
        if (time === void 0) { time = 2000; }
        var element = $(".tipDialog");
        element.html(content).show();
        this.timer(function () {
            element.hide();
        }, time);
    };
    MessageBox.notify = function (content, width, time) {
        if (width === void 0) { width = 200; }
        if (time === void 0) { time = 2000; }
        var element = $(".notifyDialog");
        element.html(content).css("width", width + "px");
        this.timer(function () {
            element.css("width", "0px");
        }, time);
    };
    MessageBox.timer = function (callback, time) {
        if (time === void 0) { time = 2000; }
        var timer = setTimeout(function () {
            callback();
            clearTimeout(timer);
        }, time);
    };
    return MessageBox;
}());
var MessageBoxDefaultOptions = /** @class */ (function () {
    function MessageBoxDefaultOptions() {
        this.titleTag = '.head';
        this.minTag = '.min';
        this.closeTag = '.close';
    }
    return MessageBoxDefaultOptions;
}());
;
(function ($) {
    $.fn.messagebox = function (options) {
        return new MessageBox(this, options);
    };
})(jQuery);
