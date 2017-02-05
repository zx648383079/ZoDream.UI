var Mode;
(function (Mode) {
    Mode[Mode["LOOP"] = 0] = "LOOP";
    Mode[Mode["TURN"] = 1] = "TURN";
    Mode[Mode["RANDOM"] = 2] = "RANDOM";
})(Mode || (Mode = {}));
var Couplet = (function () {
    function Couplet(title, top, bottom) {
        this.title = title;
        this.top = top;
        this.bottom = bottom;
    }
    Couplet.parse = function (data) {
        if (data instanceof Couplet) {
            return data;
        }
        return new Couplet(data[0], data[1], data[2]);
    };
    return Couplet;
}());
var Coupletor = (function () {
    function Coupletor(element, option) {
        this.element = element;
        this.option = $.extend({}, new CoupletDefaultOption(), option);
    }
    return Coupletor;
}());
var CoupletDefaultOption = (function () {
    function CoupletDefaultOption() {
        this.data = [];
        this.speed = 100;
        this.space = 2000;
        this.mode = Mode.LOOP;
        this.data.push(new Couplet('五福临门', '心想事成兴伟业', '万事如意展宏图'), new Couplet('喜迎新春', '笑盈盈辞旧岁', '喜滋滋迎新年'));
    }
    return CoupletDefaultOption;
}());
;
(function ($) {
    $.fn.couplet = function (option) {
        return new Coupletor(this, option);
    };
})(jQuery);
