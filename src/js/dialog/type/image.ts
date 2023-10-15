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

    private _index: number = -1;

    private _target: JQuery;

    private _src: string;

    private _imageWidth: number = 0;
    private _imageHeight: number = 0;

    public get src(): string {
        return this._src;
    }

    public set src(img: string) {
        if (!img) {
            img = this.options.content;
        }
        if (this._src === img) {
            return;
        }
        this._src = img;
        const target = new Image;
        target.src = img;
        let isLoaded = false;
        const loadImage = () => {
            isLoaded = true;
            this._target.empty();
            this._target.append(target);
            this.resetWithImage($(target), this._imageWidth = target.width, this._imageHeight = target.height);
        };
        target.onload = loadImage;
        setTimeout(() => {
            if (isLoaded || target.width <= 0) {
                return;
            }
            loadImage();
        }, 50);
    }

    public init() {
        Dialog.addItem(this);
        this.createCore().createContent()
        .appendParent().setProperty().bindEvent();
        if (!this.options.content) {
            this.src = this.trigger('request', ++ this._index);
        } else {
            this.src = this.options.content;
        }
        if (this.status == DialogStatus.show) {
            this.showBox();
        }
    }

    protected createContent(): this {
        this.box.html(this.getContentHtml());
        this._target = this.box.find('.dialog-body');
        return this;
    }

    protected setProperty(): this {
        const img = this._target.find('img');
        if (img.length === 0) {
            return this;
        }
        if (this._imageHeight <= 0) {
            this._imageHeight = img.height();
        }
        if (this._imageWidth <= 0) {
            this._imageWidth = img.width();
        }
        this.resetWithImage(img, this._imageWidth, this._imageHeight);
        return this;
    }

    private resetWithImage(img: JQuery<HTMLImageElement>, width: number, height: number) {
        let target = this.options.target || Dialog.$window;
        const maxWidth = target.width();
        const maxHeight = target.height();
        if (width > maxWidth || height > maxHeight) {
            let wScale = width / maxWidth;
            let hScale = height / maxHeight;
            if (wScale >= hScale) {
                height /= wScale;
                width = maxWidth;
            } else {
                width /= hScale;
                height = maxHeight;
            }
        }
        this.css({
            left: (maxWidth - width) / 2 + 'px',
            top: (maxHeight - height) / 2 + 'px',
            height,
            width
        });
        img.css({
            height,
            width
        });
    }

    /**
     * 绑定事件
     */
    protected bindEvent(): this {
        this.box.on('click', function(e) {
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
        $(window).on('resize', function() {
            if (instance.box) {
                instance.resize();
                return;
            }
        });
        // this.box.find('.dialog-body img').on("load", function() {
        //     if (instance.box) {
        //         instance.resize();
        //         return;
        //     }
        // });
        return this;
    }

    public showIndex(index: number) {
        this.show();
        this.src = this.trigger('request', this._index = index);
    }

    public showImg(src: string) {
        this.show();
        this.src = src;
    }

    /**
     * 重设尺寸
     */
    public resize() {
        this.setProperty();
        this.trigger('resize');
    }

    public previous() {
        this.src = this.trigger('request', -- this._index);
    }

    public next() {
        this.src = this.trigger('request', ++ this._index);
    }

    protected getContentHtml(): string {
        return '<i class="fa fa-chevron-left dialog-previous"></i><div class="dialog-body"></div><i class="fa fa-chevron-right dialog-next"></i><i class="fa fa-close dialog-close"></i>';
    }
}

class DefaultDialogImageOption implements DialogImageOption {
    onrequest: (index: number) => string = function(index) {
        return $(document.body).find('img').eq(index).attr('src');
    };
}

Dialog.addMethod(DialogType.image, DialogImage);