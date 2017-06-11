interface DialogLoadingOption extends DialogTipOption {
    count?: number;
    extra?: string
}

class DialogLoading extends DialogTip {
    constructor(
        option: DialogLoadingOption,
        id?: number
    ) {
        super(option, id);
    }

    protected getDefaultOption() {
        return new DefaultDialogLoadingOption();
    }

    protected createContent(): this {
        this.box.html(this._getLoading());
        return this;
    }
    protected setProperty(): this {
        let target = this.options.target || Dialog.$window;
        let maxWidth = target.width();
        let width = this.box.width();
        let maxHeight = target.height();
        let height = this.box.height();
        this.css({
            left: (maxWidth - width) / 2 + 'px',
            top: (maxHeight - height) / 2 + 'px'
        });
        return this;
    }

    private _getLoading() {
        let html = '';
        let num = this.options.count;
        for(; num > 0; num --) {
            html += '<span></span>';
        }
        return '<div class="'+ this.options.extra +'">'+ html +'</div>';
    }

    protected showBox(): boolean {
        if (!super.showBox()) {
            return false;
        }
        if (!this.options.target) {
            Dialog.showBg();
            return true;
        }
        Dialog.showBg(this.options.target, false);
        return true;
    }

    protected hideBox(): boolean {
        if (!super.hideBox()) {
            return false;
        }
        Dialog.closeBg();
        return true;
    }

    protected closingBox(): boolean {
        if (!super.closingBox()) {
            return false;
        }
        Dialog.closeBg();
        return true;
    }

    protected closeBox(): boolean {
        let status = this.status;
        if (!super.closeBox()) {
            return false;
        }
        if (status != DialogStatus.closing) {
            Dialog.closeBg();
        }
        return true;
    }
    
}

class DefaultDialogLoadingOption implements DialogLoadingOption {
    extra: string = 'loading';      //额外的class
    count: number = 5;
    time: number = 0;
}

Dialog.addMethod(DialogType.loading, DialogLoading);

