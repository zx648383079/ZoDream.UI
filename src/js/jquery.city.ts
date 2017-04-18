/**
 * 
 */
class City {
    constructor(
        public element: JQuery,
        options?: CityOptions
    ) {
        this.options = $.extend({}, new CityDefaultOptions(), options);
    }

    public options: CityOptions;

    public selectProv(arg: string) {
        this.options.prov.val(arg);
    }

    public selectCity(arg: string) {
        this.options.city.val(arg);
    }

    public selectDist(arg: string) {
        this.options.dist.val(arg);
    }

    public setProv(arg?: string) {
        this._setData(this.options.prov, this.options.data['prov'].call(this), arg);
    }

    public setCity(arg?: string) {
        this._setData(this.options.prov, this.options.data['city'].call(this), arg);
    }

    public setDist(arg?: string) {
        this._setData(this.options.prov, this.options.data['dist'].call(this), arg);
    }

    private _setData(element: string | JQuery | ((data: Array<any>, arg?: string) => void), data: Array<any>, arg?: string) {
        if (typeof element == 'string') {
            element = this.element.find(element);
        }
        if (typeof element == 'function') {
            element(data, arg);
            return;
        }
        let html = '';
        data.forEach((item, i) => {
            if (typeof item != 'object') {
                item = [i, item];
            }
            html += this._createOption(item,  arg);
        });
        element.html(html);
    }

    private _createOption(data: any, arg?: string) {
        let [label, val] = this._getOption(data);
        if (arg && val == arg) {
            return '<option value="'+val+'" selected>'+label+'</option>';
        }
        return '<option value="'+val+'">'+label+'</option>';
    }

    private _getOption(data: any): [string, string] {
        if (typeof data != 'object') {
            return [data, data];
        }
        if (data instanceof Array) {
            return [data[0], data[1]];
        }
        return [data.value, data.label];
    }
}

interface CityOptions {
    default?: any,
    prov?: string | JQuery | ((data: Array<any>, arg?: string) => void),
    city?: string | JQuery | ((data: Array<any>, arg?: string) => void),
    dist?: string | JQuery | ((data: Array<any>, arg?: string) => void),
    data?: {[key: string]: () => any} | string,
}

class CityDefaultOptions implements CityOptions {
    prov: string = '.prov';
    city: string = '.city';
    dist: string = '.dist';
}

;(function($: any) {
    $.fn.city = function(options ?: CityOptions) {
        return new City(this, options); 
    };
})(jQuery);