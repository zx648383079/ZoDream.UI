class City {
    constructor(
        public element: JQuery,
        options?: CityOptions
    ) {
        this.options = $.extend({}, new CityDefaultOptions(), options);
    }

    public options: CityOptions;

    private _prov: JQuery;
    private _city: JQuery;
    private _dist: JQuery;

    public seletProv(arg: string) {

    }

    public seletCity(arg: string) {

    }

    public seletDist(arg: string) {

    }
}

interface CityOptions {
    default?: any,
    prov?: (data: Array<string>, arg?: string) => void | string | JQuery,
    city?: (data: Array<string>, arg?: string) => void | string | JQuery,
    dist?: (data: Array<string>, arg?: string) => void | string | JQuery,
    data?: {[key: string]: Function} | string,
}

class CityDefaultOptions implements CityOptions {
    prov: string = '.prov';
    city: string = '.city';
    dist: string = '.dist'

}

;(function($: any) {
    $.fn.city = function(options ?: CityOptions) {
        return new City(this, options); 
    };
})(jQuery);