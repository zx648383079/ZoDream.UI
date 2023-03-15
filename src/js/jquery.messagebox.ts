class MessageBox {
    constructor(
        public element: JQuery,
        option?: MessageBoxOptions
    ) {
        this.option = $.extend({}, new MessageBoxDefaultOptions, option);
    }

    public option: MessageBoxOptions;

    public addMoveEvent() {
        let iDiffX: number,iDiffY: number, instance = this;
        this.element.find(this.option.titleTag).on('mousedown', function(e) {
            $(this).css({"cursor":"move"});
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            $(document).on('mousemove', function(e){
                instance.element.css({"left":(e.pageX - iDiffX),"top":(e.pageY - iDiffY)});
            });	
        }).on('mouseup', function() {
            $(document).unbind("mousemove");
		    $(this).css({"cursor":"auto"});
        });
    }

    public addCloseEvent() {
        let instance = this;
        this.element.find(this.option.closeTag).on('click', function() {
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

interface MessageBoxOptions {
     titleTag?: string,
     minTag?: string,
     closeTag?: string,
 }

 class MessageBoxDefaultOptions implements MessageBoxOptions {
     titleTag: string = '.head';
     minTag: string = '.min';
     closeTag: string = '.close';
 }
 
 ;(function($: any) {

  $.fn.messagebox = function(options ?: MessageBoxOptions) {
    return new MessageBox(this, options); 
  };
  
})(jQuery);