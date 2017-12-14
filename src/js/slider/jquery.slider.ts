/*!
 * jquery.slider - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
class Slider {
    constructor(
        public element: JQuery,
        options?: SliderOptions
    ) {
        this.options = $.extend({}, new SliderDefaultOptions(), options);
        if (this.element.length == 0) {
            return;
        }
        this.element.each((i, item) => {
            this.addItem($(item));
        });
        this._runTimer();
    }

    public options: SliderOptions;

    private _data: Array<SliderItem> = [];

    private _timer: number;

    public addItem(item: SliderItem | JQuery) {
        if (item instanceof SliderItem) {
            this._data.push(item);
            return;
        }
        this._data.push(new SliderItem(item, $.extend({}, this.options)));
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

    private _runTimer() {
        let instance = this;
        this._timer = requestAnimationFrame(function() {
            instance.map(item=> {
                item.run();
            });
            instance._runTimer();
        });
    }

    private _cancelTimer() {
        if (this._timer) {
            cancelAnimationFrame(this._timer);
        }
    }
}

interface SliderOptions {
    item?: string,
    box?: string,
    width?: number,   //统一指定宽度
    height?: number,  //统一指定高度， 小数时已box的宽度为准
    spaceTime?: number,
    animationTime?: number,
    animationMode?: string,
    previous?: string,
    next?: string,
    hasPoint?: boolean,   //是否有点击跳转
    auto?: boolean,  //是否自动播放
    onchange?: (start: Point, end: Point) => any; //切换事件
}

class SliderDefaultOptions implements SliderOptions {
    item: string = 'li';
    spaceTime: number = 3000;
    animationTime: number = 1000;
    animationMode: string = "swing";
    previous: string = ".slider-previous";
    next: string = ".slider-next";
    hasPoint: boolean = true;
    auto: boolean = true;
}


 ;(function($: any) {
  $.fn.slider = function(options ?: SliderOptions) {
    return new Slider(this, options); 
  };
})(jQuery);