class DialogPage extends DialogBox {
    constructor(
        option: DialogOption,
        id?: number
    ) {
        super(option, id);
    }

    protected getHeaderHtml(): string {
        let html = '<div class="dialog-header"><i class="fa fa-arrow-left"></i><div class="dialog-title">';
        if (this.options.ico) {
            html += '<i class="fa fa-' + this.options.ico + '"></i>';
        }
        if (this.options.title) {
            html += this.options.title;
        }
        return html + '</div><i class="fa fa-close dialog-close"></i></div>';
    }

    /**
     * 绑定事件
     */
    protected bindEvent(): this {
        this.box.on('click', function(e) {
            e.stopPropagation();
        });
        this.onClick(".dialog-header .fa-arrow-left", function() {
            this.close();
        });
        this.onClick(".dialog-yes", function() {
            this.trigger('done');
        });
        this.onClick(".dialog-close", function() {
            this.close();
        });
        return this;
    }
    
}

Dialog.addMethod(DialogType.page, DialogPage);