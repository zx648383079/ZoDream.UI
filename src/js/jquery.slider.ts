

class Point {
    constructor(
        public index: number,
        public x: number,
        public width: number,
        public height: number
    ) {

    }

    public getLeft(width: number): number {
        return this.x - (this.width - width) / 2;
    }
}

class Slider {
    constructor(
        public element: JQuery,
        options?: SliderOptions
    ) {
        this.options = $.extend({}, new SliderDefaultOptions(), options);
        let items = this.element.find(this.options.item);
        this._box = items.parent();
        this._init(items);
    }

    public options: SliderOptions;

    private _data: Array<Point> = [];

    private _index: number = 0;

    private _box: JQuery;

    private _time: number;

    private _timer: number;

    private _timeCallback() {
        this.next();
    }

    private _init(items: JQuery) {
        let instance = this;
        let width = 0;
        items.each((i, item)=> {
            let ele = $(item);
            let w = ele.width();
            instance._data.push(new Point(i, -width, w, ele.height()));
            width += w;
        });
        for (let j = 0; j < 2; j ++) {
            for(let i = 0, length = items.length; i < length; i ++) {
                this._box.append(items[i].cloneNode(true));
            }
        }
        for (let i = 0, length = this._data.length; i < length; i++) {
            this._data[i].x -= width;
        }
        this._box.css({width: width * 3 + "px"});
        this.resize();
        this.element.height(this._data[this._data.length - 1].height);

        this.element.find(this.options.previous).click(function() {
            instance.previous();
        });
        this.element.find(this.options.next).click(function() {
            instance.next();
        });
        $(window).resize(function() {
            instance.resize();
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

    public resize() {
        let maxWidth = this.element.width();
        this._box.css({left: this._data[this._index].getLeft(maxWidth) + "px"});
    }

    get index(): number {
        return this._index;
    }

    set index(index: number) {
        this.goto(index);
    }

    public next() {
        this.index ++;
    }

    public previous() {
        this.index --;
    }

    private _getPoint(index: number): Point[] {
        if (index < 0) {
            let last = this._data[this._data.length - 1];
            let point = new Point(index, this._data[0].x + last.width, last.width, last.height);
            return [point, last];
        }
        if (index >= this._data.length) {
            let first = this._data[0];
            let point = new Point(index, this._data[this._data.length - 1].x - first.width, first.width, first.height);
            return [point, first];
        }
        return [this._data[index], this._data[index]];
    }

    public goto(index: number) {
        this._setTime();
        let points = this._getPoint(index);
        let width = this.element.width();
        this.element.height(points[0].height);
        let instance = this;
        this._goAndCallback(points[0].getLeft(width), function() {
            if (points[0].index != points[1].index) {
                instance._box.css({left: points[1].getLeft(width) + 'px'});
            }
            instance._index = points[1].index;
        });
        
    }

    private _goAndCallback(left: number, callback: Function) {
        this._box.animate(
            {left: left + "px"}, 
            this.options.animationTime, 
            this.options.animationMode, 
            callback
        );
    }
}

interface SliderOptions {
    item?: string,
    box?: string,
    spaceTime?: number,
    animationTime?: number,
    animationMode?: string,
    previous?: string,
    next?: string,
}

class SliderDefaultOptions implements SliderOptions {
    item: string = 'li';
    spaceTime: number = 3000;
    animationTime: number = 1000;
    animationMode: string = "swing";
    previous: string = ".slider-previous";
    next: string = ".slider-next";
}


 ;(function($: any) {

  $.fn.slider = function(options ?: SliderOptions) {
    return new Slider(this, options); 
  };
  
})(jQuery);