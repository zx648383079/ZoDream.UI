class Mvvm {
    constructor(
        public element: JQuery,
        public option: MvvmOption
    ) {
        this._render = this.option.render.bind(this);
        this._data = this.option.data;
        let me = this;
        Object.keys(this._data).forEach(function(key) {
            me._proxy(key);
            me._defineReactive(key);
        });
    }

    public _data: any;

    public _render: () => string;

    public _proxy(key) {
        let me = this;
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
    }

    public _defineReactive(key:string, value?: any) {
        let instance = this;

        Object.defineProperty(this._data, key, {
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get: function() {
                return value;
            },
            set: function(newVal) {
                if (newVal === value) {
                    return;
                }
                value = newVal;
                instance.compiler();
            }
        });
    }

    public compiler() {
        //let html = template.render(this.option.render(), this._data);
        this.element.html(this._render());
    }
}

interface MvvmOption {
    data: any,
    render: () => string
}

;(function($: any) {
  $.fn.mvvm = function(option ?: MvvmOption) {
    return new Mvvm(this, option); 
  };
})(jQuery);