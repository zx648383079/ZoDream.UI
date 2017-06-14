/*!
 * jquery.zoom - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
var Zoom = (function () {
    function Zoom(element, option) {
        this.element = element;
        this._index = 0;
        this.option = $.extend({}, new ZoomDefaultOption(), option);
        this._li = this.element.find(this.option.item);
        if (!this.option.opacity) {
            this.option.opacity = 1 / Math.ceil(this._li.length / 2);
        }
        this.index = 0;
        this._bindEvent();
    }
    ;
    Object.defineProperty(Zoom.prototype, "index", {
        get: function () {
            return this._index;
        },
        set: function (arg) {
            if (arg < 0) {
                arg = this._li.length + arg % this._li.length;
            }
            else if (arg > 0) {
                arg = arg % this._li.length;
            }
            this._index = arg;
            this._initMBox();
            if (this._li.length == 1) {
                return;
            }
            this._initLeft();
            this._initRight();
        },
        enumerable: true,
        configurable: true
    });
    Zoom.prototype._initMBox = function () {
        var width = this.element.width();
        var height = this.element.height();
        this._mBox = new ZoomBox(0, 0, 30, width * .5, height);
        if (this.option.maxWidth) {
            this._mBox.width = Zoom.iTi(width, this.option.maxWidth);
        }
        if (this.option.maxHeight) {
            height = this._mBox.height = Zoom.iTi(width, this.option.maxHeight);
            this.element.height(this._mBox.height);
        }
        this._mBox.x = (width - this._mBox.width) / 2;
        this._mBox.y = (height - this._mBox.height) / 2;
        this._mBox.apple(this._li.eq(this._index), this.option);
    };
    Zoom.prototype._initLeft = function () {
        var count = Math.floor((this._li.length - 1) / 2);
        var i = this._index - 1;
        var box = this._mBox;
        while (count > 0) {
            if (i < 0) {
                i = this._li.length - 1;
            }
            box = box.toNext(this.option, false);
            box.apple(this._li.eq(i), this.option);
            count--;
            i--;
        }
    };
    Zoom.prototype._initRight = function () {
        var count = Math.ceil((this._li.length - 1) / 2);
        var i = this._index + 1;
        var box = this._mBox;
        while (count > 0) {
            if (i >= this._li.length) {
                i = 0;
            }
            box = box.toNext(this.option);
            box.apple(this._li.eq(i), this.option);
            count--;
            i++;
        }
    };
    Zoom.prototype._bindEvent = function () {
        var instance = this;
        this._li.click(function () {
            instance.index = $(this).index();
        });
        this.element.on("click", this.option.previous, function () {
            instance.previous();
        });
        this.element.on("click", this.option.next, function () {
            instance.next();
        });
        if (!$.fn.swipe) {
            return;
        }
        this.element.swipe({
            swipeLeft: function () {
                instance.next();
            },
            swipeRight: function () {
                instance.previous();
            }
        });
    };
    Zoom.prototype.previous = function () {
        this.index--;
    };
    Zoom.prototype.next = function () {
        this.index++;
    };
    Zoom.iTi = function (abservable, reltive) {
        if (reltive > 1) {
            return reltive;
        }
        return abservable * reltive;
    };
    return Zoom;
}());
var ZoomBox = (function () {
    function ZoomBox(x, y, z, width, height, opacity) {
        if (opacity === void 0) { opacity = 1; }
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.height = height;
        this.opacity = opacity;
    }
    ZoomBox.prototype.apple = function (element, option) {
        element.css({
            "z-index": this.z,
        });
        element.animate({
            left: this.x + "px",
            top: this.y + "px",
            width: this.width + "px",
            height: this.height + "px",
            opacity: this.opacity
        }, option.animationTime, option.animationMode);
    };
    ZoomBox.prototype.toNext = function (option, ltr) {
        if (ltr === void 0) { ltr = true; }
        var box = new ZoomBox();
        box.width = this.width * option.scale;
        box.height = this.height * option.scale;
        if (ltr) {
            box.x = this.x + this.width + this._getSpace(option.space) - box.width;
        }
        else {
            box.x = this.x - this._getSpace(option.space);
        }
        box.y = this.y + (this.height - box.height) / 2;
        box.z = this.z - 1;
        box.opacity = this.opacity - option.opacity;
        return box;
    };
    ZoomBox.prototype._getSpace = function (space) {
        return Zoom.iTi(this.width, space);
    };
    return ZoomBox;
}());
var ZoomDefaultOption = (function () {
    function ZoomDefaultOption() {
        this.scale = .9;
        this.space = .1;
        this.spaceTime = 1000;
        this.animationTime = 500;
        this.animationMode = "swing";
        this.item = '.zoom-item';
        this.previous = '.zoom-previous';
        this.next = '.zoom-previous';
        this.auto = true;
    }
    return ZoomDefaultOption;
}());
;
(function ($) {
    $.fn.zoom = function (option) {
        return new Zoom(this, option);
    };
})(jQuery);
