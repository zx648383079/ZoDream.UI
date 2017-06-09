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

    public init() {
        this.createCore().createContent().setProperty();

    }

    protected createContent(): this {
        this.box.text(this.options.content);
        return this;
    }
    protected setProperty(): this {
        let target = this.options.target || Dialog.$window;
        let maxWidth = target.width();
        let width = this.box.width();
        this.css('left', (maxWidth - width) / 2 + 'px');
        target.append(this.box);
        return this;
    }
}

class DefaultDialogTipOption implements DialogTipOption {
    time: number = 2000;
}

Dialog.register(DialogType.tip, DialogTip, DefaultDialogTipOption);