interface DialogMessageOption extends DialogTipOption {

}

class DialogMessage extends DialogTip {
    constructor(
        option: DialogOption,
        id?: number
    ) {
        super(option, id);
    }

    public init() {

    }

    protected setProperty(): this {
        let y = Dialog.getMessageTop();
        this.css('top', y + 'px');
        return this;
    }
}

Dialog.addMethod(DialogType.message, DialogMessage);