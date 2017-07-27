interface DialogImageOption extends DialogOption {
    onnext?: (index: number) => string,
    onprevious?: (index: number) => string
}

class DialogImage extends DialogContent {

    constructor(
        option: DialogOption,
        id?: number
    ) {
        super(option, id);
    }

    private _index: number = 0;

    private _img: JQuery;

    private _src: string;

    public get src(): string {
        return this._src;
    }

    public set src(img: string) {
        if (!img) {
            img = this.options.content;
        }
        this._src = img;
        this._img.attr('style', '').attr('src', img);
    }

    protected createContent(): this {
        this.box.html(this.getContentHtml());
        this._img = this.box.find('.dialog-body img');
        return this;
    }

    protected setProperty(): this {
        let target = this.options.target || Dialog.$window;
        let maxWidth = target.width();
        let width = this._img.width();
        let maxHeight = target.height();
        let height = this._img.height();
        if (width <= maxWidth && height <= maxHeight) {
            this.css({
                left: (maxWidth - width) / 2 + 'px',
                top: (maxHeight - height) / 2 + 'px',
                height: height,
                width: width
            });
            return this;
        }
        let wScale = width / maxWidth;
        let hScale = height / maxHeight;
        if (wScale >= hScale) {
            height /= wScale; 
            this.css({
                left: 0,
                top: (maxHeight - height) / 2 + 'px',
                height: height,
                width: maxWidth
            });
            this._img.css({
                height: height,
                width: maxWidth
            });
            return this;
        }
        width /= hScale;
        this.css({
            left: (maxWidth - width) / 2 + 'px',
            top: 0,
            height: maxHeight,
            width: width
        });
        this._img.css({
            height: height,
            width: maxWidth
        });
        return this;
    }

    /**
     * 绑定事件
     */
    protected bindEvent(): this {
        this.box.click(function(e) {
            e.stopPropagation();
        });

        this.onClick(".dialog-close", function() {
            this.close();
        });
        this.onClick(".dialog-previous", function() {
            this.previous();
        });
        this.onClick(".dialog-next", function() {
            this.next();
        });
        let instance = this;
        $(window).resize(function() {
            if (instance.box) {
                instance.resize();
                return;
            }
        });
        this.box.find('.dialog-body img').bind("load", function() {
            if (instance.box) {
                instance.resize();
                return;
            }
        });
        return this;
    }

    /**
     * 重设尺寸
     */
    public resize() {
        this.setProperty();
        this.trigger('resize');
    }

    public previous() {
        this.src = this.trigger('previous', -- this._index);
    }

    public next() {
        this.src = this.trigger('next', ++ this._index);
    }

    protected getContentHtml(): string {
        if (!this.options.content) {
            this.options.content = this.trigger('next', ++ this._index);
        }
        return '<i class="fa fa-chevron-left dialog-previous"></i><div class="dialog-body"><img src="'+ this.options.content +'"></div><i class="fa fa-chevron-right dialog-next"></i><i class="fa fa-close dialog-close"></i>';
    }
}

class DefaultDialogImageOption implements DialogImageOption {
    onnext: (index: number) => string = function(index) {
        return $(document.body).find('img').eq(index).attr('src');
    };
    onprevious: (index: number) => string = function(index) {
        return $(document.body).find('img').eq(index).attr('src');
    };
}

Dialog.addMethod(DialogType.image, DialogImage);