var Metro = (function () {
    function Metro(element, options) {
        this.element = element;
        this._elementList = [];
        this.columnCount = 0;
        this.options = $.extend({}, new MetroDefaultOptions(), options);
        this.Width = element.width();
        this.addMetro.apply(this, this.options.data);
    }
    Object.defineProperty(Metro.prototype, "Width", {
        get: function () {
            return this._width;
        },
        set: function (arg) {
            this._width = arg;
            this.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Metro.prototype.refresh = function () {
        this.columnCount = Math.floor(this.Width / this.options.maxSmallWith);
        this._smallWidth = this.Width / this.columnCount - this.getSpace();
        for (var i = this._elementList.length - 1; i >= 0; i--) {
            this._elementList[i].setSize();
        }
    };
    Metro.prototype.getSmallWidth = function () {
        return this._smallWidth;
    };
    Metro.prototype.getSpace = function () {
        return this.options.space;
    };
    Metro.prototype.getMiddleWidth = function () {
        return 2 * this.getSmallWidth() + this.getSpace();
    };
    Metro.prototype.getLargeWidth = function () {
        return 4 * this.getSmallWidth() + this.getSpace() * 3;
    };
    Metro.prototype.addMetro = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        for (var i = 0, length_1 = args.length; i < length_1; i++) {
            this.createElement(args[i]);
        }
    };
    Metro.prototype.createElement = function (item) {
        var element = new MetroElement(item, this);
        element.element.className = this.options.className;
        element.setSize();
        this._elementList.push(element);
        this.element.append(element.element);
    };
    Metro.prototype.removeElement = function () {
    };
    return Metro;
}());
var MetroElement = (function () {
    function MetroElement(item, metro) {
        this.metro = metro;
        this.size = MetroSize.Middle;
        if (!item) {
            return;
        }
        this.size = item.size;
        this.element = window.document.createElement("div");
        if (typeof item.content == "object") {
            this.element.appendChild(item.content);
        }
        else {
            this.element.innerHTML = item.content;
        }
    }
    MetroElement.prototype.setSize = function () {
        var width, height;
        switch (this.size) {
            case MetroSize.Middle:
                height = width = this.metro.getMiddleWidth();
                break;
            case MetroSize.Large:
                height = this.metro.getMiddleWidth();
                width = this.metro.getLargeWidth();
                break;
            case MetroSize.Small:
            default:
                height = width = this.metro.getSmallWidth();
                break;
        }
        this.element.style.height = height + "px";
        this.element.style.width = width + "px";
        this.element.style.margin = this.metro.getSpace() / 2 + "px";
        return this;
    };
    return MetroElement;
}());
var MetroSize;
(function (MetroSize) {
    MetroSize[MetroSize["Small"] = 0] = "Small";
    MetroSize[MetroSize["Middle"] = 1] = "Middle";
    MetroSize[MetroSize["Large"] = 2] = "Large";
})(MetroSize || (MetroSize = {}));
var MetroItem = (function () {
    function MetroItem() {
        this.size = MetroSize.Middle;
    }
    return MetroItem;
}());
var MetroDefaultOptions = (function () {
    function MetroDefaultOptions() {
        this.data = [];
        this.space = 4;
        this.maxSmallWith = 50;
        this.className = "metroItem";
        this.createMetro = function (arg, metro) {
            return new HTMLDivElement();
        };
    }
    return MetroDefaultOptions;
}());
;
(function ($) {
    $.fn.metro = function (options) {
        return new Metro(this, options);
    };
})(jQuery);
//# sourceMappingURL=jquery.metro.js.map