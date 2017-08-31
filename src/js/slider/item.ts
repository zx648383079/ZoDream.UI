class SliderItem extends Eve {
    constructor(
        public element: JQuery,
        public options: SliderOptions
    ) {
        super();
        if (this.element.attr('data-slider')) {
            return;
        }
        let items = this.element.find(this.options.item);
        if (items.length < 2) {
            return;
        }
        this._length = items.length;
        this._box = items.parent();
        this._init(items);
        this.element.attr('data-slider', 1);
    }

    private _data: Array<Point> = [];

    private _length: number = 0;

    private _index: number = 0;

    private _box: JQuery;

    private _time: number;

    private _timeCallback() {
        if (this.options.auto) {
            this.next();
        }
    }

    private _init(items: JQuery) {
        let instance = this;
        items.each((i, item)=> {
            let point = new Point(i, $(item));
            instance._data.push(point);
        });
        /**
         * 复制两次
         */
        for (let j = 0; j < 2; j ++) {
            for(let i = 0, length = items.length; i < length; i ++) {
                let newLi = $(items[i].cloneNode(true));
                this._data[i].elements.push(newLi);
                this._box.append(newLi);
            }
        }
        this.resize();
        // 输出可点击的列表
        if (instance.options.hasPoint) {
            this._addListPoint();
        }
        this._bindEvent();
        this._setTime();
        
    }

    private _bindEvent() {
        let instance = this;
        this.element.find(this.options.previous).click(function() {
            instance.previous();
        });
        this.element.find(this.options.next).click(function() {
            instance.next();
        });
        $(window).resize(function() {
            instance.resize();
        });
        if (!$.fn.swipe) {
            return;
        }
        this.element.swipe({
            swipeLeft: function() {
                instance.next();
            },
            swipeRight: function() {
                instance.previous();
            }
        });
    }

    private _getWidth(reltive: number): number {
        if (reltive > 1) {
            return reltive;
        }
        return this.element.width() * reltive;
    }

    private _setTime() {
        this._time = (this.options.spaceTime + this.options.animationTime) / 16;
    }

       /**
     * 添加跳转点
     * @param count 
     */
    private _addListPoint() {
        let html = '';
        let count = this._length;
        for(; count > 0; count --) {
            html += '<li></i>';
        }
        this.element.append('<ul class="slider-point">'+ html +'</ul>');
        let instance = this;
        this.element.on("click", ".slider-point li", function() {
            instance.index = $(this).index() + 1;
        });
    }

    /**
     * 浏览器尺寸变化
     */
    public resize() {
        let instance = this;
        let maxWidth = this.element.width();
        let width = 0;
        $.each(this._data, function(i, point) {
            if (instance.options.width > 0) {
                point.width = instance._getWidth(instance.options.width);
            }
            if (instance.options.height > 0) {
                point.height = instance._getWidth(instance.options.height);
            }
            point.applyWidthAndHeight();
            width += point.width;
            point.x = -width;
        });
        $.each(this._data, function(i, point) {
            point.x -= width;
        });
        this._box.css({left: this._data[this._index].getLeft(maxWidth) + "px"});
        this._box.width(width * 3);
        this.index = this._index;
    }

    get index(): number {
        return this._index;
    }

    set index(index: number) {
        this.goto(index);
    }

    /**
     * 下一个
     */
    public next() {
        this.index ++;
    }

    /**
     * 上一个
     */
    public previous() {
        this.index --;
    }

    /**
     * 获取起始点和终点
     * @param index 
     */
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

    /**
     * 跳转
     * @param index 
     */
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
        this.trigger('change', ...points);
        if (this.options.hasPoint) {
            this.element.find(".slider-point li").eq(index - 1).addClass("active").siblings().removeClass("active");
        }
    }

    /**
     * 移动动画及回调
     * @param left 
     * @param callback 
     */
    private _goAndCallback(left: number, callback: Function) {
        this._box.animate(
            {left: left + "px"}, 
            this.options.animationTime, 
            this.options.animationMode, 
            callback
        );
    }

    public run() {
        if (this._length < 1) {
            return;
        }
        this._time --;
        if (this._time <= 0) {
            this._timeCallback();
        }
    }
}