class BoxSlider {
    constructor(
        public element: JQuery,
        options?: BoxSliderOptions
    ) {
        this.options = $.extend({}, new BoxSliderDefaultOptions(), options);
        this._height = this.element.height();
        let li = this.element.find('li');
        if (li.length < 1) {
            return;
        }
        this._box = this.element.parent();
        this._boxHeight = this._box.height();
        this._minHeight = li.outerHeight();
        this._top = 0;
        this._init();
    }

    public options: BoxSliderOptions;

    private _height: number;

    private _boxHeight: number;

    private _minHeight: number;

    private _top: number;

    private _box: JQuery;

    private _time: number;

    private _timer: number;

    private _maxHeight: number;

    private _animation: Function = null;

    private _timeCallback() {
        this._setTime();
        this.next();
    }

    private _init() {
        let instance = this;
        let count = Math.ceil(this._boxHeight / this._height);
        this._maxHeight = count * this._height;
        let html = this.element.html();
        count *= 2;
        for (; count > 1; count --) {
            this.element.append(html);
        }
        this.element.mouseenter(function() {
            instance._time = 9999;
        }).mouseleave(function() {
            instance._setTime();
        });
        this._setTime();
        this._runTimer();
    }

    private _runTimer() {
        let instance = this;
        this._timer = requestAnimationFrame(function() {
            instance._time --;
            if (instance._time <= 0) {
                instance._timeCallback();
            }
            if (instance._animation != null) {
                instance._animation();
            }
            instance._runTimer();
        });
    }

    private _cancelTimer() {
        if (this._timer) {
            cancelAnimationFrame(this._timer);
        }
    }

    private _setTime() {
        this._time = (this.options.spaceTime + this.options.animationTime) / 16;
    }

    /**
     * 下一个
     */
    public next() {
        let instance = this;
        this._goAndCallback(this._top + this._minHeight, function() {
            if (instance._top >= instance._maxHeight) {
                instance._top = 0;
                instance.element.css({"margin-top": "0px"});
            }
        })
    }

    /**
     * 移动动画及回调
     * @param left 
     * @param callback 
     */
    private _goAndCallback(end: number, callback: Function) {
        /*this.element.animate(
            {"margin-top": - this._top + "px"}, 
            this.options.animationTime, 
            this.options.animationMode, 
            callback
        );*/
        let instance = this;
        let count = this.options.animationTime / 16;
        let min = (end - this._top) / count;
        this._animation = function() {
            count --;
            this._top += min;
            if (count <= 0) {
                this._top = end;
                instance._animation = null;
                callback();
            }
            instance.element.css({"margin-top": -this._top + "px"});
        };
    }
}

interface BoxSliderOptions {
    spaceTime?: number,
    animationTime?: number,
    animationMode?: string,
}

class BoxSliderDefaultOptions implements BoxSliderOptions {
    spaceTime: number = 3000;
    animationTime: number = 1000;
    animationMode: string = "swing";
}


 ;(function($: any) {
  $.fn.boxSlider = function(options ?: BoxSliderOptions) {
    return new BoxSlider(this, options); 
  };
})(jQuery);