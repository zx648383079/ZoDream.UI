var AjaxType;
(function (AjaxType) {
    AjaxType[AjaxType["JSON"] = 0] = "JSON";
    AjaxType[AjaxType["XML"] = 1] = "XML";
    AjaxType[AjaxType["TEXT"] = 2] = "TEXT";
})(AjaxType || (AjaxType = {}));
var AjaxMethod;
(function (AjaxMethod) {
    AjaxMethod[AjaxMethod["GET"] = 0] = "GET";
    AjaxMethod[AjaxMethod["POST"] = 1] = "POST";
})(AjaxMethod || (AjaxMethod = {}));
var Ajax = /** @class */ (function () {
    function Ajax() {
    }
    Ajax.request = function (option) {
        var xhr = this.createXMLHttpRequest();
        xhr.open(option.method.toString(), option.url, option.async, option.user, option.password);
        if (option.method === AjaxMethod.POST &&
            ('object' != typeof option.data ||
                option.data instanceof FormData)) {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        if (option.async) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 &&
                    (xhr.status == 0 || xhr.status == 200)) {
                    option.onComplete();
                    option.success(Ajax.parser(option.type, xhr), xhr.responseText);
                }
                else {
                    option.error(xhr.status, xhr.readyState, xhr);
                }
            };
            xhr.send(option.data);
        }
        else {
            option.onRunning(xhr);
            xhr.send(option.data);
            var result = this.parser(option.type, xhr);
            option.onComplete();
            option.success(result, xhr.responseText);
            return result;
        }
    };
    Ajax.parser = function (type, xhr) {
        switch (type) {
            case AjaxType.JSON:
                return JSON.parse(xhr.responseText.replace(/\xEF\xBB\xBF/g, ""));
            case AjaxType.XML:
                return xhr.responseXML;
            case AjaxType.TEXT:
            default:
                return xhr.responseText;
        }
    };
    Ajax.createXMLHttpRequest = function () {
        if (window.hasOwnProperty('XMLHttpRequest')) {
            return new XMLHttpRequest();
        }
        var versions = ['Microsoft.XMLHTTP', 'MSXML6.XMLHTTP', 'MSXML5.XMLHTTP', 'MSXML4.XMLHTTP', 'MSXML3.XMLHTTP', 'MSXML2.XMLHTTP', 'MSXML.XMLHTTP'];
        for (var i = 0, length_1 = versions.length; i < length_1; i++) {
            try {
                return new ActiveXObject(versions[i]);
            }
            catch (ex) {
                continue;
            }
        }
    };
    Ajax.filter = function (data) {
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
    };
    Ajax.each = function (data, callback) {
        if (typeof data != "object") {
            callback(0, data);
            return;
        }
        var i, length;
        if (data instanceof Array) {
            for (i = 0, length = data.length; i < length; i++) {
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
    };
    Ajax.upload = function (option) {
        var xhr = new XMLHttpRequest();
        if (option.onProgress) {
            xhr.upload.addEventListener("progress", option.onProgress, false);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 &&
                (xhr.status == 0 || xhr.status == 200)) {
                option.onComplete();
                option.success(Ajax.parser(option.type, xhr), xhr.responseText);
            }
            else {
                option.error(xhr.status, xhr.readyState, xhr);
            }
        };
        xhr.open("POST", option.url, true);
        xhr.setRequestHeader("X-FILENAME", option.data.temp);
        xhr.send(option.data.file);
    };
    Ajax.webSocket = function (url, message, open, close, error) {
        var ws = new WebSocket(url);
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
    };
    return Ajax;
}());
var Url = /** @class */ (function () {
    function Url(source) {
        if (source === void 0) { source = window.location.href; }
        this.source = source;
        var a = document.createElement('a');
        a.href = this.source;
        this.scheme = a.protocol.replace(':', '');
        this.host = a.hostname;
        this.port = parseInt(a.port) || 80;
        this.data = Url.parserData(a.search.replace(/^\?/, ''));
        this.fragment = a.hash.replace('#', '');
        this.path = a.pathname.replace(/^([^\/])/, '/$1');
    }
    Url.parserData = function (arg) {
        var ret = {}, seg = arg.split('&'), len = seg.length, i = 0, s; //len = 2
        for (; i < len; i++) {
            if (!seg[i]) {
                continue;
            }
            s = seg[i].split('=');
            ret[s[0]] = s[1];
        }
        return ret;
    };
    Url.getData = function (args) {
        if ('object' != typeof args) {
            return args;
        }
        var value = '';
        Ajax.each(args, function (key, item) {
            value += Url.filterValue(item, key);
        });
        return value.substring(0, value.length - 1);
    };
    Url.filterValue = function (data, pre) {
        if (typeof data != 'object') {
            return pre + "=" + data + "&";
        }
        var value = '';
        var isArray = data instanceof Array;
        Ajax.each(data, function (key, item) {
            value += Url.filterValue(item, pre + (isArray ? "[]" : "[" + key + "]"));
        });
        return value;
    };
    Url.prototype.getHost = function () {
        var url = this.scheme + "://" + this.host;
        if (80 != this.port) {
            url += ":" + this.port;
        }
        return url;
    };
    Url.prototype.toString = function () {
        var url = this.getHost() + this.path;
        var data = Url.getData(this.data);
        if (data) {
            url += '?' + data;
        }
        if (this.fragment) {
            url += '#' + this.fragment;
        }
        return url;
    };
    return Url;
}());
