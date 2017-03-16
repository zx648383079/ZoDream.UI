class Zoom {
    constructor(
        public element: JQuery,
        option?: ZoomOption
    ) {
        this.option = $.extend({}, new ZoomDefaultOption(), option);
        this._li = this.element.find("img");
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
        
    }

    get index(): number {
        return this._index;
    }

    private _initMBox() {
        let width = this.element.width();
        this._mBox = new ZoomBox(
            width * .25,
            0,
            30,
            width * .5,
            this.element.height()
        );
        this._mBox.apple(this._li.eq(this._index));
    }

    private _initLeft() {
        let count = Math.floor((this._li.length - 1) / 2);
        let i = this._index - 1;
        let box = this._mBox;
        while (count > 0) {
            if (i < 0) {
                i = this._li.length - 1;
            }
            box = box.toNext(this.option.scale, false);
            box.apple(this._li.eq(i));
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
            box = box.toNext(this.option.scale);
            box.apple(this._li.eq(i));
            count --;
            i ++;
        }
    }

    private _bindEvent() {
        let instance = this;
        this._li.click(function() {
            instance.index = $(this).index();
        });
    }

    public previous() {
        this.index --;
    }

    public next() {
        this.index ++;
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

    public apple(element: JQuery) {
        element.css({
            left: this.x + "px",
            top: this.y + "px",
            "z-index": this.z,
            width: this.width + "px",
            height: this.height + "px",
            opacity: this.opacity
        })
    }

    public toNext(scale: number, ltr: boolean = true): ZoomBox {
        let box = new ZoomBox();
        box.width = this.width * scale;
        box.height = this.height * scale;
        if (ltr) {
            box.x = this.x - box.width +  this.width * (2 - scale) ;
        } else {
           box.x = this.x  - this.width * (1 - scale);
        }
        box.y = this.y + (this.height - box.height) / 2; 
        box.z = this.z - 1;
        box.opacity = this.opacity - 0.1
        return box;
    }
}

interface ZoomOption {
    scale?: number,
    width?: number,
    height?: number
}

class ZoomDefaultOption implements ZoomOption {
    scale: number = .9;
}


;(function($: any) {
  $.fn.zoom = function(option ?: ZoomOption) {
    return new Zoom(this, option); 
  };
})(jQuery);