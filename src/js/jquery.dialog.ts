enum DialogType {
    tip,
    loading,
    form,
    content,
    message
}

abstract class DialogCore {
    constructor(
        public option: DialogOption
    ) {
        this.init();
    }

    public abstract init()

    public element: JQuery;

    public show() {
        this.element.show();
    }

    public hide() {
        this.element.hide();
    }

    public close() {
        this.element.remove();
    }

    public toggle() {
        this.element.toggle();
    }

    
    protected _getBottom(): number {
        return Math.max($(window).height() * .33 - this.element.height() / 2, 0);
    }

    protected _getTop(): number {
        return Math.max($(window).height() * .66 - this.element.height() / 2, 0);
    }

    protected _getLeft(): number {
        return Math.max($(window).width() / 2 - this.element.width() / 2, 0);
    }

    protected _getRight(): number {
        return Math.max($(window).width() / 2 - this.element.width() / 2, 0);
    }

    protected _getWidth(): number {
        let width = $(window).width();
        if (this.option.isFull) {
            return width;
        }
        return width * .66;
    }

    protected _getHeight(): number {
        let height = $(window).height();
        if (this.option.isFull) {
            return height;
        }
        return height * .33;
    }

}

class DialogTip extends DialogCore {
    public init() {
        
    }
}

interface DialogOption {
    content?: string,
    type?: string | number,
    close?: string,
    events?: any,
    isFull?: boolean
}

class Dialog {

    protected static data: {[id: string]: string} = {};

    public static create(option?: DialogOption): DialogCore {

    }

    public static tip(text: string): DialogTip {
        return this.create({
            content: text,
        });
    }
}

class DialogPlugin {
    constructor(
        public element: JQuery,
        public option?: DialogOption
    ) {
        let instance = this;
        this.element.click(function() {
            instance.dialog = Dialog.create(option);
        });
    }

    public dialog: DialogCore;
}

;(function($: any) {
    $.fn.dialog = function(option ?: DialogOption) {
        return new DialogPlugin(this, option);
    };
})(jQuery);