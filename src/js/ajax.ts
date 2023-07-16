enum AjaxType {
    JSON,
    XML,
    TEXT
}

enum AjaxMethod {
    GET,
    POST
}

class Ajax {
    public static request(
        option: AjaxOption
        ) {
        let xhr = this.createXMLHttpRequest();
        xhr.open(option.method.toString(), option.url, option.async, option.user, option.password);
        if (option.method === AjaxMethod.POST && 
            ('object' != typeof option.data || 
            option.data !instanceof FormData)) {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        if (option.async) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && 
                    (xhr.status == 0 || xhr.status == 200)) {
                    option.onComplete();
                    option.success(Ajax.parser(option.type, xhr), xhr.responseText);
                } else {
                    option.error(xhr.status, xhr.readyState, xhr);
                }
            }
            xhr.send(option.data);
        } else {
            option.onRunning(xhr);
            xhr.send(option.data);
            let result = this.parser(option.type, xhr);
            option.onComplete();
            option.success(result, xhr.responseText);
            return result;
        }
    }

    public static parser(type: AjaxType, xhr: XMLHttpRequest): any {
        switch (type) {
            case AjaxType.JSON:
                return JSON.parse(xhr.responseText.replace(/\xEF\xBB\xBF/g, ""));
            case AjaxType.XML:
                return xhr.responseXML;
            case AjaxType.TEXT:
            default:
                return xhr.responseText;
        }
    }

    public static createXMLHttpRequest(): XMLHttpRequest {
        if (window.hasOwnProperty('XMLHttpRequest')) {
            return new XMLHttpRequest();
        }

        let versions = ['Microsoft.XMLHTTP', 'MSXML6.XMLHTTP', 'MSXML5.XMLHTTP', 'MSXML4.XMLHTTP', 'MSXML3.XMLHTTP', 'MSXML2.XMLHTTP', 'MSXML.XMLHTTP'];
        for (let i = 0, length = versions.length; i < length; i ++ ) {
            try {
                return new ActiveXObject(versions[i]);
            } catch (ex) {
                continue;
            }
        }
    }

    public static filter(data: any): any {
        if (!data) {
            return '';
        }
        if (typeof data != 'object') {
            return data;
        }
        if (data instanceof FormData) {
            return data;
        }
        return Url.getData(data);
    }

    public static each(
        data: any, 
        callback: (key: number| string, item: any) => any
        ) {
        if (typeof data != "object") {
            callback(0, data);
            return;
        }
        let i: any, length: number;
        if (data instanceof Array) {
            for(i = 0, length = data.length; i < length; i ++) {
                if (callback(i, data[i]) == false) {
                    return;
                }
            }
            return;
        }
        for (i in data) {
            if (!data.hasOwnProperty(i)) {
                continue;
            }
            if (callback(i, data[i]) == false) {
                return;
            }
        }
    }

    public static upload(
        option: AjaxOption
        ) {
        let xhr = new XMLHttpRequest();
        if (option.onProgress) {
            xhr.upload.addEventListener("progress", option.onProgress, false);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && 
                (xhr.status == 0 || xhr.status == 200)) {
                option.onComplete();
                option.success(Ajax.parser(option.type, xhr), xhr.responseText);
            } else {
                option.error(xhr.status, xhr.readyState, xhr);
            }
        }
        xhr.open("POST", option.url, true);
        xhr.setRequestHeader("X-FILENAME", option.data.temp);
        xhr.send(option.data.file);
    }

    public static webSocket(
        url: string, 
        message: (ev:Event)=> any,
        open?: (ev:Event)=> any, 
        close?: (ev:Event)=> any, 
        error?: (ev:Event)=> any
        ): WebSocket {
        let ws = new WebSocket(url);
        if (open) {
            ws.onopen = open;
        }
        ws.onmessage = message;
        if (close) {
            ws.onclose = close;
        }
        if (error) {
            ws.onerror = error;
        }
        return ws;
    }
}

interface AjaxOption {
    url: string,
    onComplete?: Function,
    onRunning?: (xhr?: XMLHttpRequest) => any,
    onProgress?: (ev: ProgressEvent) => any,
    success?: (data: any, text: string)=> any;
    type?: AjaxType;
    error?: (status: number, readyState: number, xhr: XMLHttpRequest)=> any;
    data?: any;
    method?: AjaxMethod;
    async: boolean, 
    user?: string, 
    password?: string
}

class Url {
    constructor(
        public source: string = window.location.href
    ) {
        let a = document.createElement('a');
        a.href = this.source;
        this.scheme = a.protocol.replace(':','');
        this.host = a.hostname;
        this.port = parseInt(a.port) || 80;
        this.data = Url.parserData(a.search.replace(/^\?/,''));
        this.fragment = a.hash.replace('#','');
        this.path = a.pathname.replace(/^([^\/])/,'/$1');
    }

    public scheme: string;
    public host: string
    public user: string;
    public password: string;
    public port: number;
    public data: Object;

    public static parserData(arg: string): Object {
        let ret = {},
          seg = arg.split('&'),
          len = seg.length, i = 0, s; //len = 2
        for (; i < len; i++) {
            if (!seg[i]) { 
              continue; 
            }
            s = seg[i].split('=');
            ret[s[0]] = s[1];
        }
        return ret;
    }

    public static getData(args: any): string {
        if ('object' != typeof args) {
            return args;
        }
            let value: string = '';
        Ajax.each(args, function(key, item) {
            value += Url.filterValue(item, key);
        });
        return value.substring(0, value.length - 1);
    }

    private static filterValue(data, pre: string | number) {
        if (typeof data != 'object') {
            return pre + "=" + data + "&";
        }
        let value = '';
        let isArray: boolean = data instanceof Array;
        Ajax.each(data, function(key, item) {
            value += Url.filterValue(item, pre + (isArray ? "[]" : "[" + key + "]"));
        });
        return value;
    }

    public fragment: string;
    public path: string;

    public getHost() {
        let url = this.scheme + "://" + this.host;
        if (80 != this.port) {
            url += ":" + this.port;
        }
        return url;
    }

    public toString() {
        let url = this.getHost() + this.path;
        let data = Url.getData(this.data);
        if (data) {
            url += '?' + data;
        }
        if (this.fragment) {
            url += '#' + this.fragment;
        }
        return url;
    }
}