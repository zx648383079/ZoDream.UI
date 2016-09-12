class Carousel {
    constructor(
        public element: JQuery,
        options?: CarouselOptions
    ) {
        this.options = $.extend({}, new CarouselDefaultOptions(), options)
        let items = this.element.find(options.itemTag);
        this._itemWidth = items.width();
        this._itemLength = items.length;
        if (!this.options.range) {
            this.options.range = this._itemWidth;
        }
        this._box = items.parent();
        this.width = items.width() * this._itemLength;
        this._box.css({"width": this.width * 3 + "px", "left": -this.width + "px"});
        for (let j = 0; j < 2; j ++) {
            for(let i = 0, length = items.length; i < length; i ++) {
                this._box.append(items[i].cloneNode(true))
            }
        }
        let carousel = this;
        setInterval(function() {
            carousel.next();
        }, this.options.spaceTime);
    }

    public options: CarouselOptions;

    public width: number = 0;

    private _itemWidth: number = 0;

    private _itemLength: number = 0;

    private _left: number = 0;

    get left(): number {
        return this._left;
    }

    set left(left: number) {
        this.goLeft(left);
    }

    private _box: JQuery;

    public next(range: number = this.options.range) {
        this.goLeft(this._left - range);
    }

    public previous(range: number = this.options.range) {
        this.goLeft(this._left + range);
    }

    public goto(index: number) {
        this.left = - index * this._itemWidth;
    }

    public goLeft(left: number, hasAnimate:boolean = true) {
        if (left == this._left) {
            return;
        }
        if (left < -this.width) {
            left = left % this.width;
        }
        if (!hasAnimate) {
            this._left = left;
            this._box.css("left", this._left - this.width + "px");
            return;
        }
        if (left > this._left) {
            left -= this.width;
        }
        this._left = left;
        let carousel = this;
        this._box.animate(
            {left: this._left - this.width + "px"}, 
            this.options.animationTime, 
            this.options.animationMode, function() {
                if (left > 0) {
                    left -= carousel.width;
                } else if (left <= -carousel.width) {
                    left += carousel.width;
                }
                carousel.goLeft(left, false);
            }
        );
    }

    public clone(obj: any): any {
        if (null == obj || "object" != typeof obj) {
            return obj;
        }
        if (obj instanceof Date) {
            let copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        if (obj instanceof Array) {
            let copy = [];
            for(let i = 0, length = obj.length; i < length; i ++) {
                copy[i] = this.clone(obj[i]);
            }
            return copy;
        }
        if (obj instanceof Object) {
            let copy = {};
            for(let attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = this.clone(obj[attr]);
                }
            }
            return copy;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
    
}

interface CarouselOptions {
     range?: number,
     itemTag?: string,
     boxTag?: string,
     spaceTime?: number,
     animationTime?: string|number,
     animationMode?: string
}

class CarouselDefaultOptions implements CarouselOptions {
     itemTag: string = 'li';
     spaceTime: number = 3000;
     animationTime: string|number = 1000;
     animationMode: string = "swing";
}


 ;(function($: any) {

  $.fn.carousel = function(options ?: CarouselOptions) {
    return new Carousel(this, options); 
  };
  
})(jQuery);