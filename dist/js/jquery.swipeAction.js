var SwipeMode;
(function (SwipeMode) {
    SwipeMode[SwipeMode["NONE"] = 0] = "NONE";
    SwipeMode[SwipeMode["LEFT"] = 1] = "LEFT";
    SwipeMode[SwipeMode["RIGHT"] = 2] = "RIGHT";
})(SwipeMode || (SwipeMode = {}));
var SwipeAction = /** @class */ (function () {
    function SwipeAction(element, options) {
        this.element = element;
        this._currentMode = SwipeMode.NONE;
        this._leftWidth = 0;
        this._rightWidth = 0;
        this.options = $.extend({}, new SwipeActionDefaultOption(), options);
        this.refresh()._bindEvent();
    }
    SwipeAction.prototype.refresh = function () {
        this._leftWidth = this.element.find(this.options.leftBox).width();
        this._rightWidth = this.element.find(this.options.rightBox).width();
        return this.mode(SwipeMode.NONE);
    };
    SwipeAction.prototype._bindEvent = function () {
        var startPos, distance, _this = this;
        this.element.on('touchstart', function (event) {
            var touch = event.targetTouches[0];
            startPos = {
                x: touch.pageX,
                y: touch.pageY
            };
        }).on('touchmove', function (event) {
            var touch = event.targetTouches[0];
            if (event.targetTouches.length > 1 || (event.scale && event.scale !== 1)) {
                return;
            }
            event.preventDefault();
            _this.touchMove(distance = touch.pageX - startPos.x);
        }).on('touchcancel', function () {
            _this.touchEnd(distance);
        }).on('touchend', function () {
            _this.touchEnd(distance);
        });
    };
    SwipeAction.prototype.touchEnd = function (distance) {
        if (!distance || distance == 0) {
            return this.mode(this._currentMode);
        }
        var abs = Math.abs(distance);
        if (this._currentMode == SwipeMode.LEFT) {
            if (distance < 0) {
                return this.mode(abs >= this._leftWidth / 2 ? SwipeMode.NONE : SwipeMode.LEFT);
            }
            return this;
        }
        if (this._currentMode == SwipeMode.RIGHT) {
            if (distance > 0) {
                return this.mode(abs >= this._rightWidth / 2 ? SwipeMode.NONE : SwipeMode.RIGHT);
            }
            return this;
        }
        if (distance > 0) {
            return this.mode(abs >= this._leftWidth / 2 ? SwipeMode.LEFT : SwipeMode.NONE);
        }
        return this.mode(abs >= this._rightWidth / 2 ? SwipeMode.RIGHT : SwipeMode.NONE);
    };
    SwipeAction.prototype.touchMove = function (x) {
        if (x == 0) {
            return this;
        }
        if (this._currentMode == SwipeMode.LEFT) {
            if (x < 0) {
                this.left(Math.max(this._leftWidth + x, 0));
            }
            return this;
        }
        if (this._currentMode == SwipeMode.RIGHT) {
            if (x > 0) {
                this.left(Math.min(x - this._rightWidth, 0));
            }
            return this;
        }
        if (x < 0) {
            return this.left(Math.max(x, -this._rightWidth));
        }
        return this.left(Math.min(x, this._leftWidth));
    };
    SwipeAction.prototype.mode = function (mode) {
        this._currentMode = mode;
        switch (mode) {
            case SwipeMode.NONE:
                this.left(0);
                break;
            case SwipeMode.LEFT:
                this.left(this._leftWidth);
                break;
            case SwipeMode.RIGHT:
                this.left(-this._rightWidth);
                break;
            default:
                break;
        }
        return this;
    };
    SwipeAction.prototype.left = function (x) {
        this.element.css('left', x + 'px');
        return this;
    };
    return SwipeAction;
}());
var SwipeActionDefaultOption = /** @class */ (function () {
    function SwipeActionDefaultOption() {
        this.leftBox = '.actions-left';
        this.rightBox = '.actions-right';
    }
    return SwipeActionDefaultOption;
}());
;
(function ($) {
    $.fn.swipeAction = function (options) {
        this.each(function () {
            new SwipeAction($(this), options);
        });
    };
})(jQuery);
