class Dialog {
    constructor(
        public element: JQuery,
        option?: DialogOptions
    ) {
        this.option = $.extend({}, new DialogDefaultOptions, option);
    }

    public option: DialogOptions;

    public addMoveEvent() {
        let iDiffX: number,iDiffY: number, instance = this;
        this.element.find(this.option.titleTag).mousedown(function(e) {
            $(this).css({"cursor":"move"});
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            $(document).mousemove(function(e){
                instance.element.css({"left":(e.pageX - iDiffX),"top":(e.pageY - iDiffY)});
            });	
        }).mouseup(function() {
            $(document).unbind("mousemove");
		    $(this).css({"cursor":"auto"});
        });
    }

    public addCloseEvent() {
        let instance = this;
        this.element.find(this.option.closeTag).click(function() {
            instance.element.hide();
        });
    }

    public static tip(content: string, time: number = 2000) {
        let element = $(".tipDialog");
        element.html(content).show();
        this.timer(function() {
            element.hide();
        }, time);
    }

    public static notify(content: string, width: number = 200, time: number = 2000) {
        let element = $(".notifyDialog");
        element.html(content).css("width", width + "px");
        this.timer(function() {
            element.css("width", "0px");
        }, time);
    }

    public static timer(callback: Function, time: number = 2000) {
        let timer = setTimeout(function() {
            callback();
            clearTimeout(timer);
        }, time);
    }
}

interface DialogOptions {
     titleTag?: string,
     minTag?: string,
     closeTag?: string,
 }

 class DialogDefaultOptions implements DialogOptions {
     titleTag: string = '.head';
     minTag: string = '.min';
     closeTag: string = '.close';
 }
 
 ;(function($: any) {

  $.fn.dialog = function(options ?:DialogOptions) {
    return new Dialog(this, options); 
  };
  
})(jQuery);