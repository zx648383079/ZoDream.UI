var Validate = (function () {
    function Validate() {
    }
    Validate.email = function (arg) {
        return this.isMatch('^\S+@\S+\.[\w]+', arg);
    };
    Validate.mobile = function (arg) {
        return this.isMatch('^13[\d]{9}$|^14[57]{1}\d{8}$|^15[^4]{1}\d{8}$|^17[0678]{1}\d{8}$|^18[\d]{9}$', arg + '');
    };
    Validate.telephone = function (arg) {
        return this.isMatch('^((\+?86)|(\(\+86\)))?\d{3,4}-\d{7,8}(-\d{3,4})?$', arg);
    };
    Validate.length = function (arg, min, max) {
        return arg.length >= min && arg.length <= max;
    };
    Validate.size = function (arg, min, max) {
        return arg >= min && arg <= max;
    };
    Validate.url = function (arg) {
        return this.isMatch('^((https?|ftp)?(://))?\S+\.\S+(/.*)?$', arg);
    };
    Validate.isMatch = function (pattern, arg) {
        var regex = new RegExp(pattern);
        return regex.test(arg);
    };
    Validate.passwordStrong = function (password) {
        if (password.length <= 4)
            return 0; //密码太短  
        var modes = 0;
        for (var i = 0; i < password.length; i++) {
            //测试每一个字符的类别并统计一共有多少种模式.  
            modes |= this.charMode(password.charCodeAt(i));
        }
        return this.bitTotal(modes);
    };
    /*
    *       判断字符类型
    */
    Validate.charMode = function (iN) {
        if (iN >= 48 && iN <= 57)
            return 1;
        if (iN >= 65 && iN <= 90)
            return 2;
        if (iN >= 97 && iN <= 122)
            return 4;
        return 8; //特殊字符  
    };
    /*
        统计字符类型
    */
    Validate.bitTotal = function (num) {
        var modes = 0;
        for (var i = 0; i < 4; i++) {
            if (num & 1)
                modes++;
            num >>>= 1;
        }
        return modes;
    };
    return Validate;
}());
var Form = (function () {
    function Form(element, options) {
        this.options = $.extend({}, new FormDefaultOptions, options);
    }
    return Form;
}());
var FormDefaultOptions = (function () {
    function FormDefaultOptions() {
    }
    return FormDefaultOptions;
}());
;
(function ($) {
    $.fn.form = function (options) {
        return new Form(this, options);
    };
})(jQuery);
//# sourceMappingURL=jquery.form.js.map