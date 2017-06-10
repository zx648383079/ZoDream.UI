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
        this.css('left', (maxWidth - width) / 2 + 'px');
        return this;
    }
}

class DefaultDialogTipOption implements DialogTipOption {
    time: number = 2000;
}

Dialog.addMethod(DialogType.tip, DialogTip);