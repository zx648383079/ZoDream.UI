/*!
 * jquery.carousel - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
var Carousel = /** @class */ (function () {
    function Carousel(element, options) {
        this.element = element;
        this.width = 0;
        this._itemWidth = 0;
        this._itemLength = 0;
        this._left = 0;
        this._stopTime = 0;
        this.options = $.extend({}, new CarouselDefaultOptions(), options);
        var items = this.element.find(this.options.itemTag);
        this._itemWidth = items.width();
        this._itemLength = items.length;
        if (!this.options.range) {
            this.options.range = this._itemWidth;
        }
        this._box = items.parent();
        this.width = items.width() * this._itemLength;
        this._copyItem(items);
        this._init();
        this._addEvent();
    }
    Object.defineProperty(Carousel.prototype, "left", {
        get: function () {
            return this._left;
        },
        set: function (left) {
            this.goLeft(left);
        },
        enumerable: false,
        configurable: true
    });
    Carousel.prototype._addEvent = function () {
        var instance = this;
        if (this.options.previousTag) {
            this.element.find(this.options.previousTag).on('click', function () {
                instance._stopTime = 1;
                instance.previous();
            });
        }
        if (this.options.nextTag) {
            this.element.find(this.options.nextTag).on('click', function () {
                instance._stopTime = 1;
                instance.next();
            });
        }
    };
    Carousel.prototype._copyItem = function (items) {
        this._box.css({ "width": this.width * 3 + "px", "left": -this.width + "px" });
        for (var j = 0; j < 2; j++) {
            for (var i = 0, length_1 = items.length; i < length_1; i++) {
                this._box.append($(items[i]).clone(true));
            }
        }
    };
    Carousel.prototype._init = function () {
        var carousel = this;
        this._handle = setInterval(function () {
            if (carousel._stopTime > 0) {
                carousel._stopTime--;
                return;
            }
            carousel.next();
        }, this.options.spaceTime);
    };
    Carousel.prototype.next = function (range) {
        if (range === void 0) { range = this.options.range; }
        this.goLeft(this._left - range);
    };
    Carousel.prototype.previous = function (range) {
        if (range === void 0) { range = this.options.range; }
        this.goLeft(this._left + range);
    };
    Carousel.prototype.goto = function (index) {
        this.left = -index * this._itemWidth;
    };
    Carousel.prototype.goLeft = function (left, hasAnimate) {
        if (hasAnimate === void 0) { hasAnimate = true; }
        if (left == this._left) {
            return;
        }
        if (left < -this.width) {
            left = left % this.width;
        }
        if (!hasAnimate) {
            this._left = left;
            this._box.css("left", this._left - this.width + "px");
            return;
        }
        this._left = left;
        var carousel = this;
        this._box.animate({ left: this._left - this.width + "px" }, this.options.animationTime, this.options.animationMode, function () {
            if (left > 0) {
                left -= carousel.width;
            }
            else if (left <= -carousel.width) {
                left += carousel.width;
            }
            carousel.goLeft(left, false);
        });
    };
    Carousel.prototype.clone = function (obj) {
        if (null == obj || "object" != typeof obj) {
            return obj;
        }
        if (obj instanceof Date) {
            var copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0, length_2 = obj.length; i < length_2; i++) {
                copy[i] = this.clone(obj[i]);
            }
            return copy;
        }
        if (obj instanceof Object) {
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = this.clone(obj[attr]);
                }
            }
            return copy;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
    };
    return Carousel;
}());
var CarouselDefaultOptions = /** @class */ (function () {
    function CarouselDefaultOptions() {
        this.itemTag = 'li';
        this.boxTag = '.carousel-box';
        this.spaceTime = 3000;
        this.animationTime = 1000;
        this.animationMode = "swing";
        this.previousTag = '.carousel-previous';
        this.nextTag = '.carousel-next';
    }
    return CarouselDefaultOptions;
}());
;
(function ($) {
    $.fn.carousel = function (options) {
        return new Carousel(this, options);
    };
})(jQuery);
