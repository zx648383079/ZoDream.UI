class DialogPlugin {
    constructor(
        public element: JQuery,
        public option?: DialogOption
    ) {
        let instance = this;
        this.element.click(function() {
            instance.getDialog($(this)).show();
        });
    }

    public dialog: DialogCore;


    public getDialog(ele?: JQuery): DialogCore {
        if (this.dialog && this.dialog.box) {
            return this.dialog;
        }
        return this.dialog = Dialog.create(this._parseOption(ele));
    }

    private _parseOption(element?: JQuery) {
        let option: DialogOption = $.extend({}, this.option);
        if (!element) {
            return option;
        }
        option.type = Dialog.parseEnum<DialogType>(element.attr('dialog-type') || this.option.type, DialogType);
        option.content = element.attr('dialog-content') || this.option.content;
        option.url = element.attr('dialog-url') || this.option.url;
        option.time = parseInt(element.attr('dialog-time')) || this.option.time;
        if (option.type == DialogType.pop && !option.target) {
            option.target = element;
        }
        return option;
    }

    /**
     * close
     */
    public close() {
        if (this.dialog) {
            this.dialog.close();
            this.dialog = undefined;
        }
        return this;
    }

    /**
     * show
     */
    public show() {
        this.getDialog().show();
        return this;
    }

    /**
     * hide
     */
    public hide() {
        this.getDialog().hide();
        return this;
    }

    /**
     * on
     */
    public on(event: string, func: Function) {
        this.getDialog().on(event, func);
        return this;
    }
}

;(function($: any) {
    $.fn.dialog = function(option ?: DialogOption) {
        if (this.attr('data-type') == 'dialog') {
            return Dialog.bind(this);
        }
        return new DialogPlugin(this, option);
    };
})(jQuery);