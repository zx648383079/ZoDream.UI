class DialogPlugin {
    constructor(
        public element: JQuery,
        public option?: DialogOption
    ) {
        let instance = this;
        this.element.click(function() {
            if (!instance.dialog) {
                instance.dialog = Dialog.create(instance._parseOption($(this)));
            }
            instance.dialog.show();
        });
    }

    public dialog: DialogCore;

    private _parseOption(element: JQuery) {
        let option: DialogOption = $.extend({}, this.option);
        option.type = Dialog.parseEnum<DialogType>(element.attr('dialog-type') || this.option.type, DialogType);
        option.content = element.attr('dialog-content') || this.option.content;
        option.url = element.attr('dialog-url') || this.option.url;
        option.time = parseInt(element.attr('dialog-time')) || this.option.time;
        if (option.type == DialogType.pop && !option.target) {
            option.target = element;
        }
        return option;
    }
}

;(function($: any) {
    $.fn.dialog = function(option ?: DialogOption) {
        return new DialogPlugin(this, option);
    };
})(jQuery);