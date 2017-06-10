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
        this.createCore().createContent().setProperty();
        this.addTime();
    }

    protected getDefaultOption() {
        return new DefaultDialogTipOption();
    }

    protected createContent(): this {
        this.box.text(this.options.content);
        return this;
    }
    protected setProperty(): this {
        $(document.body).append(this.box);
        let maxWidth = Dialog.$window.width();
        let width = this.box.width();
        this.y = (this.getDialogTop() || (Dialog.$window.height() * 0.68 + 30)) - 30 - this.height; 
        this.css('left', (maxWidth - width) / 2 + 'px');
        return this;
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

    protected closingBox() {
        super.closingBox();
        if (this.status != DialogStatus.closing) {
            return;
        }
        this.stopTime();
    }

    protected closeBox() {
        super.closeBox();
        this.changeOther();
        if (this.status != DialogStatus.closed) {
            return;
        }
        this.stopTime();
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