enum SwipeMode {
    NONE,
    LEFT,
    RIGHT
}

interface Point {
    x: number,
    y: number
}

class SwipeAction {
    constructor(
        public element: JQuery,
        options?: SwipeActionOption
    ) {
        this.options = $.extend({}, new SwipeActionDefaultOption(), options);
        this.refresh()._bindEvent();
    }

    public options: SwipeActionOption;

    private _currentMode: SwipeMode = SwipeMode.NONE;

    private _leftWidth: number = 0;

    private _rightWidth: number = 0;

    public refresh() {
        this._leftWidth = this.element.find(this.options.leftBox).width();
        this._rightWidth = this.element.find(this.options.rightBox).width();
        return this.mode(SwipeMode.NONE);
    }

    private _bindEvent() {
        let startPos: Point,
            distance: number,
            _this = this;
        this.element.on('touchstart', function(event) {
            let touch = event.targetTouches[0];
            startPos = {
                x: touch.pageX,
                y: touch.pageY
            };
        }).on('touchmove', function(event) {
            let touch = event.targetTouches[0];
            if(event.targetTouches.length > 1 || (event.scale && event.scale !== 1)) {
                return;
            }
            event.preventDefault();
            _this.touchMove(distance = touch.pageX - startPos.x);
            
        }).on('touchcancel', function() {
            _this.touchEnd(distance);
        }).on('touchend', function() {
            _this.touchEnd(distance);
        });
    }

    public touchEnd(distance: number) {
        if (!distance || distance == 0) {
            return this.mode(this._currentMode);
        }
        let abs = Math.abs(distance);
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
    }

    public touchMove(x: number) {
        if (
            x == 0
        ) {
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
    }

    public mode(mode: SwipeMode) {
        this._currentMode = mode;
        switch (mode) {
            case SwipeMode.NONE:
                this.left(0);
                break;
            case SwipeMode.LEFT:
                this.left(this._leftWidth);
                break;
            case SwipeMode.RIGHT:
                this.left(- this._rightWidth);
                break;
            default:
                break;
        }
        return this;
    }

    public left(x: number) {
        this.element.css('left', x + 'px');
        return this;
    }

}


interface SwipeActionOption {
    leftBox?: string,
    rightBox?: string,
}

class SwipeActionDefaultOption implements SwipeActionOption {
    leftBox: string = '.actions-left';
    rightBox: string = '.actions-right';
}

;(function($: any) {
    $.fn.swipeAction = function(options ?: SwipeActionOption) {
        this.each(function() {
            new SwipeAction($(this), options);
        });
    };
})(jQuery);