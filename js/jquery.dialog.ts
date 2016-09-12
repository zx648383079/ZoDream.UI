class Dialog {
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

;(function($: any) {
  $.dialog = Dialog;
})(jQuery);