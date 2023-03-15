/*!
 * jquery.carousel - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
class Carousel {
    constructor(
        public element: JQuery,
        options?: CarouselOptions
    ) {
        this.options = $.extend({}, new CarouselDefaultOptions(), options)
        let items: JQuery = this.element.find(this.options.itemTag);
        this._itemWidth = items.width();
        this._itemLength = items.length;
        if (!this.options.range) {
            this.options.range = this._itemWidth;
        }
        this._box = items.parent();
        this.width = items.width() * this._itemLength;
        this._copyItem(items);
        this._init();
        this._addEvent();
    }

    public options: CarouselOptions;

    public width: number = 0;

    private _itemWidth: number = 0;

    private _itemLength: number = 0;

    private _left: number = 0;

    private _handle: number;

    private _stopTime = 0;

    get left(): number {
        return this._left;
    }

    set left(left: number) {
        this.goLeft(left);
    }

    private _box: JQuery;

    private _addEvent() {
        let instance = this;
        if (this.options.previousTag) {
            this.element.find(this.options.previousTag).on('click', function() {
                instance._stopTime = 1;
                instance.previous();
            });
        }
        if (this.options.nextTag) {
            this.element.find(this.options.nextTag).on('click', function() {
                instance._stopTime = 1;
                instance.next();
            });
        }
    }

    private _copyItem(items: JQuery) {
        this._box.css({"width": this.width * 3 + "px", "left": -this.width + "px"});
        for (let j = 0; j < 2; j ++) {
            for(let i = 0, length = items.length; i < length; i ++) {
                this._box.append(items[i].cloneNode(true));
            }
        }
    }

    private _init() {
        let carousel = this;
        this._handle = setInterval(function() {
            if (carousel._stopTime > 0) {
                carousel._stopTime --;
                return;
            }
            carousel.next();
        }, this.options.spaceTime);
    }

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
     animationMode?: string,
     previousTag?: string,
     nextTag?: string,
     thumbMode?: string
}

class CarouselDefaultOptions implements CarouselOptions {
     itemTag: string = 'li';
     boxTag: string = '.carousel-box';
     spaceTime: number = 3000;
     animationTime: string|number = 1000;
     animationMode: string = "swing";
     previousTag: string = '.carousel-previous';
     nextTag: string = '.carousel-next';
}


 ;(function($: any) {

  $.fn.carousel = function(options ?: CarouselOptions) {
    return new Carousel(this, options); 
  };
  
})(jQuery);