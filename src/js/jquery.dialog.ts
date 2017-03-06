class Dialog {
    constructor(
        public element: JQuery,
        option?: DialogOptions
    ) {
        this.option = $.extend({}, new DialogDefaultOptions, option);
        console.log(this.option);
        this.option.events[this.option.close] = function() {
            this.hide();
        };
        console.log(this.option);
        this.bindEvent();
        this.show();
    }

    public option: DialogOptions;

    public bindEvent() {
        let instance = this;
        $.each(this.option.events, function(tag: string, callback: Function) {
            console.log(tag, callback);
            instance.onclick(tag, callback);
        });
    }

    public show() {
        this.element.show();
    }

    public hide() {
        this.element.hide();
    }

    public toggle() {
        this.element.toggle();
    }

    public onclick(tag: string, callback: Function) {
        let instance = this;
        this.element.on('click', tag, function(e) {
            console.log(tag, callback);
            if (callback instanceof Function) {
                callback.call(instance, e, this);
            }
        });
    }

    public find(tag: string): JQuery {
        return this.element.find(tag);
    }
}

interface DialogOptions {
    close?: string,
    events?: any
}

 class DialogDefaultOptions implements DialogOptions {
    close: string = '.dialog-close';
    events: any = {};
 }
 
 ;(function($: any) {
  $.fn.dialog = function(options ?:DialogOptions) {
    return new Dialog(this, options); 
  };
})(jQuery);