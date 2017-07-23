class Validator extends Eve {
    constructor(
        public element: JQuery, 
        options?: FormOptions) {
        super();
        this.options = $.extend({}, new ValidateDefaultOption, options);
        if (!this.options.url) {
            this.options.url = this.element.attr("action");
        }
        if (!this.options.method) {
            this.options.method = this.element.attr("method").toUpperCase() == 'POST' ? AjaxMethod.POST :  AjaxMethod.GET;
        }
    }
}

interface ValidateOption {
    url?: string,
    method?: AjaxMethod,
    data?: Object,
    error?: (msg: string, element: JQuery) => any,
    submitTag?: string,
    submit?: (data: Object) => any,
    
    patternTag?: string,
    messageTag?: string,
}

class ValidateDefaultOption implements ValidateOption {
    patternTag: string = "data-pattern";
    messageTag: string = "data-message";
}

;(function($: any) {
  $.fn.validate = function(options?: ValidateOption) {
    return new Validator(this, options); 
  };
})(jQuery);