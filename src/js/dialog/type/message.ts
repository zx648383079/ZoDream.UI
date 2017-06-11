interface DialogMessageOption extends DialogTipOption {

}

class DialogMessage extends DialogTip {
    constructor(
        option: DialogOption,
        id?: number
    ) {
        super(option, id);
    }

    protected setProperty(): this {
        this.height;
        this.y = (this.getDialogBottom() || (Dialog.$window.height() * 0.1 - 30)) + 30;
        return this;
    }

    protected bindEvent(): this {
        return this;
    }

    protected changeOther() {
        let instance = this;
        Dialog.map(item => {
            if (item.options.type != DialogType.message || item.y <= instance.y) {
                return;
            }
            item.y -= instance.height + 30;
        });
    }
}

Dialog.addMethod(DialogType.message, DialogMessage);