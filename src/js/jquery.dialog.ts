enum DialogMode {
    tip,
    loading,
    form,
    content,
    message
}

abstract class DialogCore {
    constructor(
        public option: DialogOptions
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

}

interface DialogOptions {
    close?: string,
    events?: any,
    isFull?: boolean
}

;(function($: any) {
    
})(jQuery);