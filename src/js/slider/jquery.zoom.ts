/*!
 * jquery.zoom - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
class Zoom {
    constructor(
        public element: JQuery,
        option?: ZoomOption
    ) {
        this.option = $.extend({}, new ZoomDefaultOption(), option);
        this._li = this.element.find(this.option.item);
        if (!this.option.opacity) {
            this.option.opacity = 1 / Math.ceil(this._li.length / 2);
        }
        this.index = 0;
        this._bindEvent();
    }

    public option: ZoomOption;

    private _mBox: ZoomBox;

    private _li: JQuery;

    private _index: number = 0;;

    set index(arg: number) {
        if (arg < 0) {
            arg = this._li.length + arg % this._li.length;
        } else if (arg > 0) {
            arg = arg % this._li.length;
        }
        this._index = arg;
        this._initMBox();
        if (this._li.length == 1) {
           return;
        }
        this._initLeft();
        this._initRight();
        this.option.onchange && this.option.onchange.call(this, this._index);
    }

    get index(): number {
        return this._index;
    }

    private _initMBox() {
        let width = this.element.width();
        let height = this.element.height();
        this._mBox = new ZoomBox(
            0,
            0,
            30,
            width * .5,
            height
        );
        if (this.option.maxWidth) {
            this._mBox.width = Zoom.iTi(width, this.option.maxWidth);
        }
        if (this.option.maxHeight) {
            height = this._mBox.height = Zoom.iTi(width, this.option.maxHeight);
            this.element.height(this._mBox.height);
        }
        this._mBox.x = (width - this._mBox.width) / 2;
        this._mBox.y = (height - this._mBox.height) / 2;
        this._mBox.apple(this._li.eq(this._index), this.option);
    }

    private _initLeft() {
        let count = Math.floor((this._li.length - 1) / 2);
        let i = this._index - 1;
        let box = this._mBox;
        while (count > 0) {
            if (i < 0) {
                i = this._li.length - 1;
            }
            box = box.toNext(this.option, false);
            box.apple(this._li.eq(i), this.option);
            count --;
            i --;
        }
    }

    private _initRight() {
        let count = Math.ceil((this._li.length -1) / 2);
        let i = this._index + 1;
        let box = this._mBox;
        while (count > 0) {
            if (i >= this._li.length) {
                i = 0;
            }
            box = box.toNext(this.option);
            box.apple(this._li.eq(i), this.option);
            count --;
            i ++;
        }
    }

    private _bindEvent() {
        let instance = this;
        this._li.on('click', function() {
            instance.index = $(this).index();
        });
        this.element.on("click", this.option.previous, function() {
            instance.previous();
        });
        this.element.on("click", this.option.next, function() {
            instance.next();
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

    public previous() {
        this.index --;
    }

    public next() {
        this.index ++;
    }

    public static iTi(abservable: number, reltive: number): number {
        if (reltive > 1) {
            return reltive;
        }
        return abservable * reltive;
    }
}


class ZoomBox {
    constructor(
        public x?: number,
        public y?: number,
        public z?: number,
        public width?: number,
        public height?: number,
        public opacity: number = 1
    ) {

    }

    public apple(element: JQuery, option: ZoomOption) {
        element.css({
            "z-index": this.z,
        });
        element.animate({
            left: this.x + "px",
            top: this.y + "px",
            width: this.width + "px",
            height: this.height + "px",
            opacity: this.opacity
        }, option.animationTime, option.animationMode);
    }

    public toNext(option: ZoomOption, ltr: boolean = true): ZoomBox {
        let box = new ZoomBox();
        box.width = this.width * option.scale;
        box.height = this.height * option.scale;
        if (ltr) {
            box.x = this.x + this.width + this._getSpace(option.space) - box.width;
        } else {
           box.x = this.x  - this._getSpace(option.space); 
        }
        box.y = this.y + (this.height - box.height) / 2; 
        box.z = this.z - 1;
        box.opacity = this.opacity - option.opacity;
        return box;
    }

    private _getSpace(space: number): number {
        return Zoom.iTi(this.width, space);
    }
}

interface ZoomOption {
    scale?: number,
    maxWidth?: number,
    maxHeight?: number,
    space?: number,          //
    spaceTime?: number,
    animationTime?: number,
    animationMode?: string,
    opacity?: number,
    item?: string,
    previous?: string,
    next?: string,
    auto?: boolean,
    onchange?: (index: number) => void; //切换事件
}

class ZoomDefaultOption implements ZoomOption {
    scale: number = .9;
    space: number = .1;
    spaceTime: number = 1000;
    animationTime: number = 500;
    animationMode: string = "swing";
    item: string = '.zoom-item';
    previous: string = '.zoom-previous';
    next: string = '.zoom-next';
    auto: boolean = true;
}


;(function($: any) {
  $.fn.zoom = function(option ?: ZoomOption) {
    return new Zoom(this, option); 
  };
})(jQuery);