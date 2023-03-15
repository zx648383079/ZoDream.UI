interface DialogTipOption extends DialogOption {
    time?: number,         //显示时间
}

class DialogTip extends DialogCore {
    constructor(
        option: DialogOption,
        id?: number
    ) {
        super(option, id);
    }

    public options: DialogTipOption;

    private _timeHandle: number;

    public init() {
        Dialog.addItem(this);
        this.createCore().createContent()
        .appendParent().setProperty().bindEvent()
        .addTime();
    }

    protected getDefaultOption() {
        return new DefaultDialogTipOption();
    }

    /**
     * 设置内容
     */
    protected createContent(): this {
        this.box.text(this.options.content);
        return this;
    }

    /**
     * 添加到容器上
     */
    protected appendParent(): this {
        if (!this.box) {
            return this;
        }
        if (!this.options.target) {
            $(document.body).append(this.box);
            return this;
        }
        this.options.target.append(this.box);
        this.box.addClass("dialog-private");
        return this;
    }

    /**
     * 设置属性
     */
    protected setProperty(): this {
        let maxWidth = Dialog.$window.width();
        let width = this.box.width();
        this.y = (this.getDialogTop() || (Dialog.$window.height() * 0.68 + 30)) - 30 - this.height; 
        this.css('left', (maxWidth - width) / 2 + 'px');
        return this;
    }

    /**
     * 绑定事件
     */
    protected bindEvent(): this {
        this.box.on('click', function(e) {
            e.stopPropagation();
        });
        let instance = this;
        $(window).on('resize', function() {
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
        let maxWidth = Dialog.$window.width();
        let width = this.box.width();
        this.css('left', (maxWidth - width) / 2 + 'px');
        this.trigger('resize');
    }

    protected addTime() {
        if (this.options.time <= 0) {
            return;
        }
        let instance = this;
        this._timeHandle = setTimeout(function() {
            instance._timeHandle = undefined;
            instance.close();
        }, this.options.time);
    }

    protected stopTime() {
        if (!this._timeHandle) {
            return;
        }
        clearTimeout(this._timeHandle);
        this._timeHandle = undefined;
    }

    protected closingBox(): boolean {
        if (!super.closingBox()) {
            return false;
        }
        this.stopTime();
        return true;
    }

    protected closeBox(): boolean {
        if (!super.closeBox()) {
            return false;
        }
        this.changeOther();
        this.stopTime();
        return true;
    }

    protected changeOther() {
        let instance = this;
        Dialog.map(item => {
            if (item.options.type != DialogType.tip || item.y >= instance.y) {
                return;
            }
            item.y += instance.height + 30;
        });
    }
}

class DefaultDialogTipOption implements DialogTipOption {
    time: number = 2000;
}

Dialog.addMethod(DialogType.tip, DialogTip);