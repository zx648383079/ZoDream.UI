class Uri {
    constructor(
        private _path: string = '',
        private _data: {[key: string]: string} = {}
    ) {
        if (_path.indexOf('?') >= 0) {
            [_path, _data] = this._parseUrl(_path);
        }
    }

    public setData(key: any, val?: string): this {
        if (typeof key == 'object') {
            this._data = $.extend(this._data, key);
        } else {
            this._data[key] = val;
        }
        return this;
    }

    public clearData(): this {
        this._data = {};
        return this;
    }

    public get(success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any, dataType?: string) {
        $.get(this.toString(), success, dataType);
    }

    public getJson(success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any) {
        $.getJSON(this.toString(), success);
    }

    public post(data?: Object|string, success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any, dataType?: string) {
        $.post(this.toString(), data, success, dataType);
    }

    public static parse(url: string | Uri): Uri {
        if (typeof url == 'object') {
            return url;
        }
        return new Uri(url);
    }

    public toString() {
        let param = Uri.getData(this._data);
        if (param == '') {
            return this._path;
        }
        return this._path + '?' + param;
    }

    public static getData(args: any): string {
        if ('object' != typeof args) {
            return args;
        }
            let value: string = '';
        $.each(args, function(key, item) {
            value += Uri._filterValue(item, key);
        });
        return value.substring(0, value.length - 1);
    }

    private static _filterValue(data, pre: string | number) {
        if (typeof data != 'object') {
            return pre + "=" + data + "&";
        }
        let value = '';
        let isArray: boolean = data instanceof Array;
        $.each(data, function(key, item) {
            value += Uri._filterValue(item, pre + (isArray ? "[]" : "[" + key + "]"));
        });
        return value;
    }

    private _parseUrl(url: string): [string, {[key: string]: string}] {
        let [path, param] = url.split('?', 2);
        if (!param) {
            return [path, {}];
        }
        let ret = {},
          seg = param.split('&'),
          len = seg.length, i = 0, s; //len = 2
        for (; i < len; i++) {
            if (!seg[i]) { 
              continue; 
            }
            s = seg[i].split('=');
            ret[s[0]] = s[1];
        }
        return [path, ret];
    }
}