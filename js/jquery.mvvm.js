var Mvvm = (function () {
    function Mvvm(element, option) {
        this.element = element;
        this.option = option;
        this._render = this.option.render.bind(this);
        this._data = this.option.data;
        var me = this;
        Object.keys(this._data).forEach(function (key) {
            me._proxy(key);
            me._defineReactive(key);
        });
    }
    Mvvm.prototype._proxy = function (key) {
        var me = this;
        Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return me.option.data[key];
            },
            set: function proxySetter(newVal) {
                me.option.data[key] = newVal;
            }
        });
    };
    Mvvm.prototype._defineReactive = function (key, value) {
        var instance = this;
        Object.defineProperty(this._data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                return value;
            },
            set: function (newVal) {
                if (newVal === value) {
                    return;
                }
                value = newVal;
                instance.compiler();
            }
        });
    };
    Mvvm.prototype.compiler = function () {
        //let html = template.render(this.option.render(), this._data);
        this.element.html(this._render());
    };
    return Mvvm;
}());
;
(function ($) {
    $.fn.mvvm = function (option) {
        return new Mvvm(this, option);
    };
})(jQuery);
//# sourceMappingURL=jquery.mvvm.js.map