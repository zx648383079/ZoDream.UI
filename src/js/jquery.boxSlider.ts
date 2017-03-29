class SliderItem {
    constructor(
        public element: JQuery,
        public options: BoxSliderOptions
    ) {
        this._height = this.element.height();
        this._box = this.element.parent();
        this.status = this.options.auto;
        this._init();
    }

    private _height: number = 0;

    private _boxHeight: number = 0;

    public minHeight: number = 0;

    private _top: number = 0;

    private _box: JQuery;

    private _time: number = 0;

    public status: boolean = true;

    public maxHeight: number = 0;

    private _animation: Function;

    private _init() {
        this._setTime();
        this.refresh();
        let instance = this;
        this.element.mouseenter(function() {
            instance.stop();
        }).mouseleave(function() {
            instance.play();
        });
    }

    public refresh() {
        let li = this.element.find(this.options.itemTag);
        if (li.length < 1) {
            return;
        }
        this._boxHeight = this._box.height();
        this.minHeight = li.outerHeight();
        this._top = 0;
        let count = Math.ceil(this._boxHeight / this._height);
        this.maxHeight = count * this._height;
        let html = this.element.children();
        count *= 2;
        for (; count > 1; count --) {
            this.element.append(html.clone(false));
        }
    }

    public run() {
        if (this._animation) {
            this._animation();
        }
        if (!this.status) {
            return;
        }
        this._time --;
        if (this._time <= 0) {
            this._setTime();
            this.next();
        }
    }
    /**
     * 设置移动距离和循环距离
     * @param min 
     * @param max 
     */
    public setMinAndMax(min: number, max?: number): this {
        this.minHeight = min;
        if (max) {
            this.maxHeight = max;
        }
        return this;
    }

    public play() {
        if (this.status) {
            return;
        }
        this.status = true;
        if (this.options.refresh) {
            this.refresh();
        }
    }

    public stop() {
        this.status = false;
    }

    private _setTime() {
        this._time = (this.options.spaceTime + this.options.animationTime) / 16;
    }

    /**
     * 下一个
     */
    public next() {
        let instance = this;
        this._goAndCallback(this._top + this.minHeight, function() {
            if (instance._top >= instance.maxHeight) {
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
                instance._animation = undefined;
                callback();
            }
            instance.element.css({"margin-top": -this._top + "px"});
        };
    }
}

class BoxSlider {
    constructor(
        public element: JQuery,
        options?: BoxSliderOptions
    ) {
        this.options = $.extend({}, new BoxSliderDefaultOptions(), options);
        this._init();
    }

    public options: BoxSliderOptions;

    private _data: Array<SliderItem> = [];

    private _timer: number = 0;

    private _timeCallback() {
        this._data.forEach(item => {
            item.run();
        })
    }

    private _init() {
        if (this.element.length < 1) {
            console.log('0 SliderItem');
            return;
        }
        let instance = this;
        this.element.each(function(i, item) {
            instance._data.push(new SliderItem($(item), instance.options));
        });
        this._startTimer();
    }

    private _startTimer() {
        if (this._timer > 0) {
            return;
        }
        this._runTimer();
    }

    private _runTimer() {
        let instance = this;
        this._timer = requestAnimationFrame(function() {
            instance._timeCallback();
            instance._runTimer();
        });
    }

    private _cancelTimer() {
        if (this._timer > 0) {
            cancelAnimationFrame(this._timer);
        }
        this._timer = 0;
    }

    /**
     * 倒序循环
     * @param callback 返回false 结束循环，返回 true 删除
     * @param i 初始值
     */
    public map(callback: (item: SliderItem, index: number) => any, i: number | number[] = this._data.length - 1) {
        if (typeof i != 'number') {
            i.forEach(j => {
                if (j < 0 || j >= this._data.length) {
                    return;
                }
                callback(this._data[j], j);
            });
            return;
        }
        if (i >= this._data.length) {
            i = this._data.length - 1;
        }
        for (; i >= 0; i --) {
            let item = this._data[i];
            let result = callback(item, i);
            if (result == true) {
                this._data.splice(i, 1);
            }
            if (result == false) {
                return;
            }
        }
    }

    public play(...index: number[]) {
        this._startTimer();
        if (index.length == 0) {
            this.map(item => {
                item.play();
            });
            return;
        }
        let instance = this;
        index.forEach(i => {
            if (i < 0 || i >= this._data.length) {
                return;
            }
            this._data[i].play();
        });
    }

    public stop(...index: number[]) {
        if (index.length == 0) {
            this.map(item => {
                item.stop();
            });
            this._cancelTimer();
            return;
        }
        let instance = this;
        index.forEach(i => {
            if (i < 0 || i >= this._data.length) {
                return;
            }
            this._data[i].stop();
        });
    }
}

interface BoxSliderOptions {
    spaceTime?: number,
    animationTime?: number,
    animationMode?: string,
    auto?: boolean,
    itemTag?: string,
    refresh?: boolean,
}

class BoxSliderDefaultOptions implements BoxSliderOptions {
    spaceTime: number = 3000;
    animationTime: number = 1000;
    animationMode: string = "swing";
    auto: boolean = true;   // 自动播放
    itemTag: string = 'li';
    refresh: boolean = false;   //是否需要时时刷新元素
}


;(function($: any) {
    $.fn.boxSlider = function(options ?: BoxSliderOptions) {
        return new BoxSlider(this, options); 
    };
})(jQuery);