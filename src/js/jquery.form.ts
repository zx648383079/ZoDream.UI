class Validate {
    public static email(arg: string): boolean {
        return this.isMatch('^\S+@\S+\.[\w]+', arg);
    }

    public static mobile(arg: string|number): boolean {
        return this.isMatch('^13[\d]{9}$|^14[57]{1}\d{8}$|^15[^4]{1}\d{8}$|^17[0678]{1}\d{8}$|^18[\d]{9}$', arg + '');
    }

    public static telephone(arg: string): boolean {
        return this.isMatch('^((\+?86)|(\(\+86\)))?\d{3,4}-\d{7,8}(-\d{3,4})?$', arg);
    }

    public static len(arg: string, min: number, max: number) {
        return arg.length >= min && arg.length <= max;
    }

    public static size(arg: number, min: number, max: number) {
        return arg >= min && arg <= max;
    }

    public static url(arg: string) {
        return this.isMatch('^((https?|ftp)?(://))?\S+\.\S+(/.*)?$', arg);
    }

    public static isMatch(pattern: string, arg: string) {
        let regex = new RegExp(pattern);
        return regex.test(arg);
    }

    public static passwordStrong(password: string): number {
        if (password.length <= 4)
                return 0; //密码太短  
        let modes = 0;
        for (let i = 0; i < password.length; i++) {
            //测试每一个字符的类别并统计一共有多少种模式.  
            modes |= this.charMode(password.charCodeAt(i));
        }
        return this.bitTotal(modes);
    }

    /*
    *       判断字符类型
    */
    public static charMode(iN: number):number {
        if (iN >= 48 && iN <= 57) //数字  
            return 1;
        if (iN >= 65 && iN <= 90) //大写字母  
            return 2;
        if (iN >= 97 && iN <= 122) //小写  
            return 4;
        return 8; //特殊字符  
    }
    /*
        统计字符类型
    */
    public static bitTotal(num: number): number {
        let modes: number = 0;
        for (let i = 0; i < 4; i++) {
            if (num & 1) modes++;
            num >>>= 1;
        }
        return modes;
    }
}

class Form {
    constructor(
        public element: JQuery, 
        options?: FormOptions) {
        this.options = $.extend({}, new FormDefaultOptions, options);
        if (!this.options.url) {
            this.options.url = this.element.attr("action");
        }
        if (!this.options.method) {
            this.options.method = this.element.attr("method").toUpperCase() == 'POST' ? AjaxMethod.POST :  AjaxMethod.GET;
        }
        element.on("blue", "input", function() {
            
        });
    }

    public options: FormOptions;

    public validate() {
        let instance = this;
        this.element.find("input").each(function(index, item) {
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