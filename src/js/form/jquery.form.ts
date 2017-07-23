class Form extends Eve {
    constructor(
        public element: JQuery, 
        options?: FormOptions) {
        super();
        this.options = $.extend({}, new FormDefaultOptions, options);
        if (!this.options.url) {
            this.options.url = this.element.attr("action");
        }
        if (!this.options.method) {
            this.options.method = this.element.attr("method").toUpperCase() == 'POST' ? AjaxMethod.POST :  AjaxMethod.GET;
        }
    }

    public options: FormOptions;

    public validate() {
        let instance = this;
        this.element.find("input, select, textarea").each(function(index, item) {
            let element = $(item);
            let pattern = element.attr(instance.options.patternTag);
            if (!pattern) {
                return;
            }
        });
    }

    public validateValue(value: string, pattern: string): boolean {
        value = value.trim();
        switch (pattern) {
            case "*":
                return value.length > 0;
            case "e":
                return Validate.email(value);
            case "p":
                return Validate.mobile(value);
            case "u":
                return Validate.url(value);
            default:
                break;
        }
        return Validate.isMatch(pattern, value);
    }

    public 

    public ajaxSubmit() {
        
    }
}

interface FormOptions {
    url?: string,
    method?: AjaxMethod,
    data?: Object,
    error?: (msg: string, element: JQuery) => any,
    submitTag?: string,
    submit?: (data: Object) => any,
    
    patternTag?: string,
    messageTag?: string,
}

class FormDefaultOptions implements FormOptions {
    patternTag: string = "data-pattern";
    messageTag: string = "data-message";
}

;(function($: any) {
  $.fn.form = function(options?: FormOptions) {
    return new Form(this, options); 
  };
})(jQuery);