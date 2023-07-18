interface IWaterFallOption {
    items?: string[]|IWaterFallImageSource[]|IWaterFallSource[]|IWaterFallSizeSource[];
    min: number;
    gap: number;
    render?: (item: IBound) => HTMLElement;
}

interface IWaterFallSizeSource {
    width: number;
    height: number;
}

interface IWaterFallSource {
    originalWidth: number;
    originalHeight: number;
}

interface IWaterFallImageSource extends IWaterFallSource {
    src: string;
}

interface IWaterFallImage extends IWaterFallSource {
    src?: string;
    image?: HTMLImageElement,
}

interface IWaterFallRang {
    y: number;
    x: number;
    width: number;
}

interface IBound extends IWaterFallRang {
    height: number;
}

interface IWaterFallItem extends IWaterFallImage, IBound {
    scale: number;
}


class HorizontalBar {
    constructor(
        public max: number,
        public gap: number,
        items: IBound[] = []
    ) {
        this.reset(items);
    }

    private items: IWaterFallRang[] = [];

    /**
     * 返回去除了边框的可以用
     */
    public get minRang(): IWaterFallRang {
        const data = this.items;
        let x = 0;
        let min: IWaterFallRang = undefined;
        for (const item of data) {
            if (item.x > x) {
                return {
                    x: Math.max(0, x),
                    y: item.y,
                    width: item.x - this.gap
                };
            }
            if (!min || min.y > item.y) {
                min = {...item};
            } else if (min.y === item.y && item.x <= min.x + min.width) {
                min.width = Math.max(item.x + item.width - min.x, min.width);
            }
            x = item.x + item.width;
        }
        return x >= this.max ? {
            ...min,
            x: Math.max(0,  min.x),
            width: min.width - ((min.x + min.width) < this.max ? this.gap : 0)
        } : {
            x: Math.max(x, 0),
            y: 0,
            width: Math.min(this.max, this.max - x)
        };
    }

    public get bottom(): number {
        return 0;
    }
    
    public leftHeight(rang: IWaterFallRang): number {
        if (rang.x <= 0) {
            return 0;
        }
        for (const item of this.items) {
            const r = item.x + item.width;
            if (r === rang.x) {
                return item.y - this.gap - rang.y;
            }
        }
        return 0;
    }

    public rightHeight(rang: IWaterFallRang): number {
        if (rang.x >= this.max) {
            return 0;
        }
        const rr = rang.x + rang.width + this.gap;
        for (const item of this.items) {
            if (item.x === rr) {
                return item.y - this.gap - rang.y;
            }
        }
        return 0;
    }

    public push(rect: IBound) {
        const items: IWaterFallRang[] = [];
        let x = 0;
        const checkFn = (item: IWaterFallRang) => {
            // if (item.width <= 2 * this.gap) {
            //     return;
            // }
            if (item.x < x) {
                return;
            }
            if (item.x > x) {
                x = item.x;
            }
            items.push(item);
        };
        
        let found = false;
        const rx = rect.x;
        const rw = this.computedWidth(rect);
        const ry = rect.y;
        const rb = rect.y + this.computedHeight(rect);
        for (const item of this.items) {
            const r = item.x + item.width;
            if (x > item.x) {
                if (r <= x) {
                    continue;
                }
                checkFn({
                    x,
                    y: item.y,
                    width: r - x
                });
                continue;
            }
            if (item.x < rx) {
                if (r <= rx) {
                    checkFn(item);
                    continue;
                }
                const w = rx - item.x + (item.y === rb ? rw : 0);
                checkFn({
                    ...item,
                    width: w 
                });
                if (item.y <= ry) {
                    checkFn({
                        x: rx,
                        y: rb,
                        width: rw
                    });
                }
                x = rx + rw;
                found = true;
            } else if (item.x === rx) {
                checkFn({
                    x: rx,
                    y: rb,
                    width: rw
                });
                if (item.width > rw) {
                    checkFn({
                        x: rx + rw,
                        y: item.y,
                        width: item.width - rw
                    });
                }
                x = Math.max(r, rx + rw);
                found = true;
            } else {
                const rr = rx  + rw;
                if (rr < item.x) {
                    if (found) {
                        checkFn({
                            x: rx,
                            y: rb,
                            width: rw
                        });
                        found = true;
                    }
                    checkFn(item);
                    continue;
                }
                checkFn({
                    x: rx,
                    y: rb,
                    width: rw
                });
                checkFn({
                    x: rr,
                    y: item.y,
                    width: r - rr
                });
                found = true;
            }
        }
        if (!found) {
            checkFn({
                x: rx,
                y: rb,
                width: rw
            });
        }
        this.items = items;
    }

    public reset(items: IBound[] = []) {
        const bound: IWaterFallRang[] = [];
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            const b = item.y + this.computedHeight(item);
            const w = this.computedWidth(item);
            let found = false;
            for (const rect of bound) {
                if (rect.x <= item.x && rect.width >= w && b > rect.y) {
                    rect.y = b;
                    found = true;
                }
            }
            if (found) {
                continue;
            }
            bound.push({
                y: b,
                x: item.x,
                width: w
            });
            if (this.isFullLine(bound)) {
                break;
            }
        }
        this.items = bound.sort(this.compareX);
    }

    private isFullLine(items: {
        x: number;
        width: number
    }[]): boolean {
        const data = items.sort(this.compareX);
        let x = 0;
        for (const item of data) {
            if (item.x > x) {
                return false;
            }
            x = item.x + item.width;
        }
        return x >= this.max;
    }

    private compareX(a: {x: number}, b: {x: number}): 0|1|-1 {
        return a.x < b.x ? 1 : -1;
    }

    private computedWidth(rect: IBound) {
        return rect.width + (rect.x + rect.width >= this.max ? 0 : this.gap);
    }

    private computedHeight(rect: IBound) {
        return rect.height + this.gap;
    }
}


class WaterFall {
    constructor(
        private container: JQuery<HTMLDivElement>,
        private option: IWaterFallOption
    ) {
        this.bindEvent();
        this.bar = new HorizontalBar(this.container.width(), this.option.gap);
        const items = this.option.items;
        if (!items || items.length === 0) {
            return;
        }
        if (typeof items[0] === 'object') {
            this.push(items.map(i => {
                if (typeof i.originalHeight !== 'undefined') {
                    return i;
                }
                return {
                    ...i,
                    originalWidth: i.width,
                    originalHeight: i.height
                };
            }));
            return;
        }
        this.preload(items as any, data => {
            this.push(data);
        });
    }

    private items: IWaterFallItem[] = [];
    private bar: HorizontalBar;

    public push(items: IWaterFallImage[]) {
        let i = -1;
        const last = items.length - 1;
        let c = 0;
        while (i < last) {
            c ++;
            if (c > last) {
                break;
            }
            const min = this.bar.minRang;
            const left = this.bar.leftHeight(min);
            const right = this.bar.rightHeight(min);
            let x = min.x;
            const y = min.y;
            let maxWidth = min.width;
            let width = 0;
            while (maxWidth > 0 && i < last) {
                const item = items[++ i];
                if (x === min.x && left >= this.option.min && left < item.originalHeight) {
                    width = left / item.originalHeight * item.originalWidth;
                    if (width >= this.option.min && maxWidth - width > this.option.min) {
                        // 靠左对齐
                        const rect = this.computed(item, x, y, width);
                        this.items.push(rect);
                        this.bar.push(rect);
                        x += width + this.option.gap;
                        maxWidth -= (width + this.option.gap);
                        continue;
                    }
                }
                if (maxWidth === min.width && right >= this.option.min && right < item.originalHeight) {
                    width = right / item.originalHeight * item.originalWidth;
                    if (width >= this.option.min && maxWidth - width > this.option.min) {
                        // 靠右对齐
                        const rect = this.computed(item, x + maxWidth - width, y, width);
                        this.items.push(rect);
                        this.bar.push(rect);
                        maxWidth -= (width + this.option.gap);
                        continue;
                    }
                }
                // 宽不能大于图片宽度，
                if (item.originalWidth >= maxWidth) {
                    const rect = this.computed(item, x, y, maxWidth);
                    this.items.push(rect);
                    this.bar.push(rect);
                    maxWidth = 0;
                    break;
                }
                width = Math.min(item.originalWidth, maxWidth - this.option.min - this.option.gap);
                if (width <= 0) {
                    break;
                }
                const rect = this.computed(item, x, y, width);
                this.items.push(rect);
                this.bar.push(rect);
                x += width + this.option.gap;
                maxWidth -= (width + this.option.gap);
                if (i >= last) {
                    break;
                }
                // 高最好能平附近的
            }
        }
        let height = 0;
        this.container.html('');
        this.items.forEach((item, i) => {
            height = Math.max(height, item.y + item.height);
            this.renderItem(item, i);
        });
        this.container.height(height);
    }



    public preload(items: string[], cb: (items: IWaterFallImage[]) => void) {
        const data: IWaterFallImage[] = [];
        let failure = 0;
        const checkFn = () => {
            if (data.length + failure >= items.length) {
                cb(data);
            }
        }
        for (const item of items) {
            const img = new Image();
            img.onload = () => {
                data.push({
                    image: img,
                    src: item,
                    originalWidth: img.width,
                    originalHeight: img.height
                });
                checkFn();
            };
            img.onabort = () => {
                failure ++;
                checkFn();
            };
            img.src = item;
        }
    }

    public resize() {
        const items = this.items;
        this.items = [];
        this.bar = new HorizontalBar(this.container.width(), this.option.gap);
        this.push(items);
    }

    private bindEvent() {
        $(window).on('resize', () => {
            this.resize();
        });
    }

    private renderItem(item: IBound, i: number): JQuery<HTMLElement>|HTMLElement {
        if (this.option.render) {
            this.container.append(this.option.render(item));
            return;
        }
        let ele: JQuery;
        if (Object.prototype.hasOwnProperty.call(item, 'image')) {
            ele = $((item as IWaterFallItem).image);
        } else {
            ele = $('<div></div>');
            ele.text(i);
            ele.css({
                'background-color': this.randomColor(),
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
            });
        }
        ele.css({
            position: 'absolute',
            left: item.x + 'px',
            top: item.y + 'px',
            width: item.width + 'px',
            height: item.height + 'px',
        })
        this.container.append(ele);
    }

    private randomColor() {
        const randomInt = () => {
            return Math.floor(Math.random() * 255);
        };
        const r = randomInt();
        const g = randomInt();
        const b = randomInt();
        return `rgb(${r},${g},${b})`;
    }

    private computed(item: IWaterFallImage, x: number, y: number, width: number): IWaterFallItem {
        const scale = width / item.originalWidth;
        return {
            ...item,
            scale,
            x,
            y,
            width,
            height: scale * item.originalHeight
        };
    }
}

;(function($: any) {
    $.fn.waterfall = function(options?: IWaterFallOption) {
        return new WaterFall(this, options); 
    };
})(jQuery);