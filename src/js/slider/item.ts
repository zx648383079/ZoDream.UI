class SliderItem extends Eve {
    constructor(
        public element: JQuery,
        options: SliderOptions
    ) {
        super();
        let option = this.element.attr('data-slider');
        if (option == '1') {
            return;
        }
        this._extendOption(options, option);
        let items = this.element.find(this.options.item);
        if (items.length < 1) {
            return;
        }
        this.options.width = this._getOption('width');
        this.options.height = this._getOption('height');
        this.options.animationmode = this._getOption('animationmode');
        this.options.haspoint = this._getOption('haspoint');
        this.options.align = this._getOption('align');
        this.element.addClass(this.options.animationmode + '-slider');
        this._length = items.length;
        this._box = items.parent();
        this.element.attr('data-slider', 1);
        if (this._length < 2) {
            this._initOnly(items);
        } else {
            this._init(items);
        }
        this.bindResize();
    }

    public options: SliderOptions;
    private _data: Array<Point> = [];
    private _length: number = 0;
    private _index: number = 0;
    private _box: JQuery;
    private _time: number;
    private _lastWidth = 0;

    private getItemWidth(): number {
        const w = this.options.width;
        if (typeof w !== 'object') {
            return w > 0 ? this._getWidth(w) : 0;
        }
        const ww = $(window).width();
        let j = 0; // 当前宽度
        let c = 1; // 当前数量
        let isMax = true;
        $.each(w, (i, v) => {
            if (i > ww) {
                isMax = false;
                return;
            }
            if (i >= j) {
                c = v;
                j = i;
            }
        });
        if (isMax && j > 0) {
            // 超过设置的最大时，自动显示完整个数
            c = Math.floor(this._lastWidth / j * c);
        }
        return c > 0 ? this._lastWidth / c : 0;
    }

    private getItemHeight(width: number): number {
        const h = this.options.height;
        if (typeof this.options.width !== 'object') {
            return h > 0 ? this._getWidth(h) : 0;
        }
        return h < 10 ? h * width : h;
    }

    private _timeCallback() {
        if (this._getOption('auto')) {
            this.next();
        }
    }

    private _extendOption(options: any, option: string) {
        try {
            option = JSON.parse(option);
        } catch (error) {
            
        }
        this.options = $.extend({}, options, option);
    }

    private bindResize() {
        const innerBox = this._box.parent();
        this._lastWidth = innerBox.width();
        $(window).on('resize', () => {
            const w = innerBox.width();
            if (w === this._lastWidth) {
                return;
            }
            this._lastWidth = w;
            this.element.trigger('slider:resize', this._lastWidth);
        });
        this.element.trigger('slider:resize', this._lastWidth);
    }

    /**
     * 初始化只有一张
     */
    private _initOnly(items: JQuery) {
        this.element.on('slider:resize', () => {
            this._resetOnly(items);
        });
    }

    /**
     * 设置一张图的高度
     * @param item 
     */
    private _resetOnly(item: JQuery) {
        let width = this.getItemWidth();
        if (width <= 0) {
            width = item.width();
        }
        let height = this.getItemHeight(width);
        if (height <= 0) {
            height = item.height();
        }
        item.css({height: height, width: width});
        this.element.css({height: height, width: width});
    }

    private _needMove(): boolean {
        return this.options.animationmode != 'fade';
    }

    private _copyItem(items: JQuery) {
        for (let j = 0; j < 2; j ++) {
            for(let i = 0, length = items.length; i < length; i ++) {
                let newLi = $(items[i].cloneNode(true))  as JQuery<HTMLElement>;
                this._data[i].elements.push(newLi);
                this._box.append(newLi);
            }
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
        if (this._needMove()) {
            this._copyItem(items);
        }
        // 输出可点击的列表
        if (this.options.haspoint) {
            this._addListPoint();
        }
        this._bindEvent();
        this._setTime();
    }

    private _bindEvent() {
        let instance = this;
        this.element.on('click', this.options.previous, function() {
            instance.previous();
        });
        this.element.on('click', this.options.next, function() {
            instance.next();
        });
        this.element.on(this._getOption<string>('pointevent'), ".slider-point li", function() {
            instance.index = $(this).index();
        });
        this.element.on('slider:resize', () => {
            this.resize();
        });
        if (!($.fn as any).swipe) {
            return;
        }
        (this.element as any).swipe({
            swipeLeft: function() {
                instance.next();
            },
            swipeRight: function() {
                instance.previous();
            }
        });
    }

    /**
     * 获取配置
     * @param name 
     */
    private _getOption<T>(name: string): T {
        let val = this.element.data(name);
        if (val == 'false') {
            return false as any;
        }
        if (val == 'true') {
            return true as any;
        }
        if (typeof val == 'boolean') {
            return val as any;
        }
        return val || this.options[name];
    }

    private _getWidth(reltive: number): number {
        if (reltive > 1) {
            return reltive;
        }
        return this._lastWidth * reltive;
    }

    private _setTime() {
        this._time = (this._getOption<number>('spacetime') + this._getOption<number>('animationtime')) / 16;
    }

    /**
     * 添加跳转点
     * @param count 
     */
    private _addListPoint() {
        let html = '';
        for(let i = 1; i <= this._length; i ++) {
            html += '<li><span>' + i +'</span></i>';
        }
        this.element.append('<ul class="slider-point">'+ html +'</ul>');
    }

    /**
     * 浏览器尺寸变化
     */
    public resize() {
        this._setTime();
        let instance = this;
        let maxWidth = this.element.width();
        let width = 0;
        const itemWidth = this.getItemWidth();
        const itemHeight = this.getItemHeight(itemWidth);
        $.each(this._data, function(i, point) {
            if (itemWidth > 0) {
                point.width = itemWidth;
            }
            if (itemHeight > 0) {
                point.height = itemHeight;
            }
            point.applyWidthAndHeight(!(instance.options.height > 0));
            width += point.width;
            point.x = -width;
        });
        if (this._needMove()) {
            this._applySize(width, maxWidth);
        }
        this.index = this._index;
    }

    private _applySize(width: number, maxWidth: number) {
        $.each(this._data, function(i, point) {
            point.x -= width;
        });
        this._box.css({left: this._data[this._index].getLeft(maxWidth, this.options.align) + "px"});
        this._box.width(width * 3);
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
        this._changePoint(index);
    }

    private _changePoint(index: number) {
        if (this._needMove()) {
            return this._movePoint(index);
        }
        if (index < 0) {
            index = this._data.length - 1;
        } else if (index >= this._data.length) {
            index = 0;
        }
        let instance = this;
        let time = this._getOption<number>('animationtime');
        this._data.forEach((point, i) => {
            if (i == index) {
                point.elements[0].animate(
                    {opacity: 1},
                    time,
                    'swing',
                    function() {
                        instance._showPoint(index);
                    }
                );
                instance.trigger('change', point);
                return;
            }
            point.elements[0].animate(
                {opacity: 0},
                time,
                'swing'
            );
        });
    }

    private _showPoint(index: number) {
        this._index = index;
        this.element.find(".slider-point li")
        .eq(index).addClass("active").siblings().removeClass("active");
    }

    private _movePoint(index: number) {
        let points = this._getPoint(index);
        let width = this.element.width();
        this.element.height(points[0].height);
        let instance = this;
        this._goAndCallback(points[0].getLeft(width, this.options.align), function() {
            if (points[0].index != points[1].index) {
                instance._box.css({left: points[1].getLeft(width, instance.options.align) + 'px'});
            }
            instance._showPoint(points[1].index);
        });
        this.trigger('change', ...points);
    }

    /**
     * 移动动画及回调
     * @param left 
     * @param callback 
     */
    private _goAndCallback(left: number, callback: () => void) {
        this._box.stop(true, true);
        this._box.animate(
            {left: left + "px"}, 
            this._getOption<number>('animationtime'), 
            this.options.animationmode, 
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