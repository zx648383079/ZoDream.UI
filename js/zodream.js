var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ZoDream;
(function (ZoDream) {
    var Base = (function () {
        function Base() {
        }
        return Base;
    })();
    ZoDream.Base = Base;
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main(name, parent) {
            if (parent === void 0) { parent = window.document; }
            _super.call(this);
            switch (typeof name) {
                case "string":
                    this._elements = Helper.getEelement(name, parent);
                    break;
                case "undefined":
                    break;
                case "object":
                    if (name instanceof Array || name instanceof HTMLCollection) {
                        if (name[0] instanceof HTMLCollection) {
                            this._elements = name[0];
                        }
                        else {
                            this._elements = name;
                        }
                    }
                    else {
                        this._elements = [name];
                    }
                    break;
                default:
                    break;
            }
        }
        Main.prototype.getParent = function (index) {
            if (index === void 0) { index = 1; }
            var child = this._elements[0];
            for (var i = 0; i < index; i++) {
                child = child.parentNode;
            }
            return child;
        };
        Main.prototype.getChildren = function () {
            var args = Array();
            var child = this._elements[0].childNodes;
            for (var i = 0, len = child.length; i < len; i++) {
                if (child[i].nodeName != "#text" || /\s/.test(child[i].nodeValue)) {
                    args.push(child[i]);
                }
            }
            return args;
        };
        Main.prototype.prev = function () {
            var obj = this._elements[0].previousSibling;
            while (obj != null && obj.id == undefined) {
                obj = obj.previousSibling;
                if (obj == null) {
                    break;
                }
            }
            return obj;
        };
        Main.prototype.next = function () {
            var obj = this._elements[0].nextSibling;
            while (obj != null && obj.id == undefined) {
                obj = obj.nextSibling;
                if (obj == null) {
                    break;
                }
            }
            return obj;
        };
        Main.prototype.getSibling = function () {
            var a = [];
            var b = this._elements[0].parentNode.childNodes;
            for (var i = 0, len = b.length; i < len; i++) {
                if (b[i] !== this._elements[0]) {
                    a.push(b[i]);
                }
            }
            return a;
        };
        Main.prototype.forE = function (func) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var data = Array();
            if (typeof func === "function") {
                for (var i = 0, len = this._elements.length; i < len; i++) {
                    var returnData = func.apply(void 0, [this._elements[i], i].concat(args));
                    if (returnData instanceof Array || returnData instanceof HTMLCollection) {
                        Array.prototype.push.apply(data, returnData);
                    }
                    else {
                        data.push(returnData);
                    }
                }
                ;
            }
            return data;
        };
        Main.prototype.getPosterity = function (arg) {
            return this.forE(function (e) {
                return Helper.getEelement(arg, e);
            });
        };
        Main.prototype.attr = function (arg, val) {
            if (val === undefined) {
                return this._elements[0].getAttribute(arg);
            }
            else {
                this.forE(function (e, i, name, value) {
                    switch (name) {
                        case "class":
                            name += "Name";
                            break;
                        default:
                            break;
                    }
                    e[name] = value;
                }, arg, val);
                return this;
            }
        };
        Main.prototype.addClass = function (arg) {
            this.forE(function (e, i, value) {
                e.className += " " + value;
            }, arg);
            return this;
        };
        Main.prototype.removeClass = function (arg) {
            var classNames = this.attr('class');
            this.attr('class', classNames.replace(arg, ""));
            return this;
        };
        Main.prototype.css = function (arg, val) {
            if (val === undefined) {
                if (typeof this._elements[0] != "object")
                    return;
                var value = this._elements[0].style[arg];
                if (!value) {
                    var temp = document.defaultView.getComputedStyle(this._elements[0], null);
                    value = temp[arg];
                }
                return value;
            }
            else {
                this.forE(function (e, i, name, value) {
                    e.style[name] = value;
                }, arg, val);
                return this;
            }
        };
        Main.prototype.show = function () {
            this.css("display", "block");
            return this;
        };
        Main.prototype.hide = function () {
            this.css("display", "none");
            return this;
        };
        Main.prototype.toggle = function () {
            if (this.css("display") == "none") {
                this.show();
            }
            else {
                this.hide();
            }
            return this;
        };
        Main.prototype.html = function (arg) {
            if (arg === undefined) {
                return this._elements[0].innerHTML;
            }
            else {
                this.forE(function (e, i, value) {
                    e.innerHTML = value;
                }, arg);
                return this;
            }
        };
        Main.prototype.val = function (arg) {
            if (arg === undefined) {
                return this._elements[0].value;
            }
            else {
                this.forE(function (e, i, value) {
                    e.value = value;
                }, arg);
                return this;
            }
        };
        Main.prototype.getForm = function () {
            var data = new Object, elements = Helper.getEelement('input,textarea', this._elements[0]);
            for (var i = 0, len = elements.length; i < len; i++) {
                var element = elements[i];
                if (element.required && element.value == "") {
                    element.style.border = "1px solid red";
                    return;
                }
                ;
                switch (element.type.toLowerCase()) {
                    case 'submit':
                        break;
                    case 'hidden':
                    case 'password':
                    case 'text':
                    case 'email':
                    case 'textarea':
                        data[element.name] = element.value;
                        break;
                    case 'checkbox':
                    case 'radio':
                        if (element.checked) {
                            data[element.name] = element.value;
                        }
                        break;
                    default:
                        break;
                }
            }
            ;
            return data;
        };
        Main.prototype.clearForm = function () {
            var elements = Helper.getEelement('input,textarea', this._elements[0]);
            for (var i = 0, len = elements.length; i < len; i++) {
                var element = elements[i];
                switch (element.type.toLowerCase()) {
                    case 'submit':
                        break;
                    case 'hidden':
                    case 'password':
                    case 'text':
                    case 'email':
                    case 'textarea':
                        element.value = "";
                        break;
                    case 'checkbox':
                    case 'radio':
                        element.checked = false;
                        break;
                    default:
                        break;
                }
            }
            return this;
        };
        Main.prototype.addChild = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            (_a = this._elements[0].appendChild).call.apply(_a, [this._elements[0]].concat(args));
            return this;
            var _a;
        };
        Main.prototype.insertBefore = function (arg) {
            this.getParent().insertBefore(arg, this._elements[0]);
            return this;
        };
        Main.prototype.insertAfter = function (arg) {
            var parent = this.getParent();
            if (parent.lastChild == this._elements[0]) {
                parent.appendChild(arg);
            }
            else {
                parent.insertBefore(arg, this.next());
            }
            return this;
        };
        Main.prototype.removeChild = function (arg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (arg) {
                (_a = this._elements[0].removeChild).call.apply(_a, [this._elements[0], arg].concat(args));
            }
            else {
                this.forE(function (e) {
                    e.innerHTML = "";
                });
            }
            return this;
            var _a;
        };
        Main.prototype.removeSelf = function () {
            this.forE(function (e) {
                e.parentNode.removeChild(e);
            });
            return this;
        };
        Main.prototype.addEvent = function (event, func) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var fun = func;
            if (args.length > 0) {
                fun = function (e) {
                    func.apply(this, args); //继承监听函数,并传入参数以初始化;
                };
            }
            ;
            this.forE(function (e, i, event, func) {
                if (e) {
                    if (e.attachEvent) {
                        e.attachEvent('on' + event, func);
                    }
                    else if (e.addEventListener) {
                        e.addEventListener(event, func, false);
                    }
                    else {
                        e["on" + event] = func;
                    }
                }
            }, event, func);
            return this;
        };
        Main.prototype.removeEvent = function (event, func) {
            this.forE(function (e, i, event, func) {
                if (e.removeEventListener) {
                    e.removeEventListener(event, func, false);
                }
                else if (e.detachEvent) {
                    e.detachEvent("on" + event, func);
                }
                else {
                    delete e["on" + event];
                }
            }, event, func);
            return this;
        };
        return Main;
    })(Base);
    ZoDream.Main = Main;
    var Method;
    (function (Method) {
        Method[Method["GET"] = 0] = "GET";
        Method[Method["POST"] = 1] = "POST";
    })(Method || (Method = {}));
    ;
    var AjaxModel = (function () {
        function AjaxModel(url, success, method, data, error, async) {
            if (url === void 0) { url = null; }
            if (success === void 0) { success = null; }
            if (method === void 0) { method = Method.GET; }
            if (data === void 0) { data = null; }
            if (error === void 0) { error = null; }
            if (async === void 0) { async = true; }
            this.url = url;
            this.success = success;
            this.method = method;
            this.data = data;
            this.error = error;
            this.async = async;
        }
        return AjaxModel;
    })();
    ZoDream.AjaxModel = AjaxModel;
    var Ajax = (function (_super) {
        __extends(Ajax, _super);
        function Ajax(_models) {
            _super.call(this);
            this._models = _models;
            this._getHttp();
            this._request();
        }
        Ajax.prototype._getHttp = function () {
            if (ActiveXObject) {
                try {
                    this._http = new ActiveXObject("Msxml2.XMLHTTP"); //IE高版本创建XMLHTTP  
                }
                catch (E) {
                    this._http = new ActiveXObject("Microsoft.XMLHTTP"); //IE低版本创建XMLHTTP  
                }
            }
            else {
                this._http = new XMLHttpRequest();
            }
        };
        Ajax.prototype._request = function () {
            this._http.open(this._models.method, this._models.url, this._models.async);
            this._http.onreadystatechange = this._response.bind(this);
            this._http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            this._http.send(this._models.data);
        };
        Ajax.prototype._response = function () {
            if (this._http.readyState == 4) {
                if (this._http.status == 200) {
                    var data;
                    try {
                        data = JSON.parse(this._http.responseText + "");
                    }
                    catch (error) {
                        data = this._http.responseText;
                    }
                    if (typeof this._models.success == "function") {
                        this._models.success(data, this._http);
                    }
                }
                else {
                    if (typeof this._models.error == "function") {
                        this._models.error(this._http.responseText, this._http.status, this._http);
                    }
                    else if (typeof this._models.success == "function") {
                        this._models.success(this._http.responseText, this._http.status, this._http);
                    }
                }
            }
        };
        Ajax.get = function (url, func) {
            var model;
            if (typeof url == "string") {
                model = new AjaxModel(url, func);
            }
            else {
                model = url;
            }
            new Ajax(model);
        };
        Ajax.post = function (url, data, func) {
            var model;
            if (typeof url == "string") {
                model = new AjaxModel(url, func, Method.POST, data);
            }
            else {
                model = url;
            }
            new Ajax(model);
        };
        return Ajax;
    })(Base);
    ZoDream.Ajax = Ajax;
    var ZoDate = (function (_super) {
        __extends(ZoDate, _super);
        function ZoDate() {
            _super.apply(this, arguments);
        }
        ZoDate.getFormat = function () {
            var date = new Date();
            return date.getFullYear() + "-" +
                this.toString(date.getMonth() + 1) + "-" + this.toString(date.getDate())
                + " " + this.toString(date.getHours()) + ":" + this.toString(date.getMinutes())
                + ":" + this.toString(date.getSeconds());
        };
        ZoDate.toString = function (num) {
            var str = "" + num;
            if (num >= 0 && num <= 9) {
                str = "0" + str;
            }
            return str;
        };
        return ZoDate;
    })(Base);
    ZoDream.ZoDate = ZoDate;
    var Helper = (function (_super) {
        __extends(Helper, _super);
        function Helper() {
            _super.apply(this, arguments);
        }
        Helper.prototype.getName = function (arg) {
            var val = "";
            for (var i = 0; i < arg.length; i++) {
                val += arg.charCodeAt(i).toString(16);
            }
            return val;
        };
        Helper.getEelement = function (name, parent) {
            if (parent === void 0) { parent = window.document; }
            if (name.indexOf(",") > 0) {
                return this._getBrother(name, parent);
            }
            else if (name.indexOf(" ") > 0) {
                return this._getPosterity(name, parent);
            }
            else if (name.indexOf(">") > 0) {
                return this._getChildren(name, parent);
            }
            else {
                return this.getPosterityByNmae(name, parent);
            }
        };
        Helper._getBrother = function (name, parent) {
            if (parent === void 0) { parent = window.document; }
            var names = name.split(","), data = Array();
            for (var i = 0, len = names.length; i < len; i++) {
                var args = this.getEelement(names[i], parent);
                if (args instanceof Array || args instanceof HTMLCollection) {
                    Array.prototype.push.apply(data, args);
                }
                else if (typeof args == "object") {
                    data.push(args);
                }
            }
            return data;
        };
        Helper._getPosterity = function (name, parent) {
            if (parent === void 0) { parent = window.document; }
            return this._getElements(name, " ", parent);
        };
        Helper._getChildren = function (name, parent) {
            if (parent === void 0) { parent = window.document; }
            return this._getElements(name, ">", parent, this._getChildrenByName);
        };
        Helper._getElements = function (name, separator, elements, func) {
            if (func === void 0) { func = this.getEelement; }
            var names = name.split(separator);
            if (!(elements instanceof Array)) {
                elements = [elements];
            }
            for (var i = 0, len = names.length; i < len; i++) {
                var eles = Array();
                for (var j = 0, leng = elements.length; j < leng; j++) {
                    var element = elements[j];
                    var args = func(names[i], element);
                    if (args instanceof Array || args instanceof HTMLCollection) {
                        Array.prototype.push.apply(eles, args);
                    }
                    else if (typeof args == "object") {
                        eles.push(args);
                    }
                }
                elements = eles;
            }
            ;
            return elements;
        };
        Helper._getChildrenByName = function (name, parent) {
            var args = Array(), elements = parent.childNodes;
            for (var i = 0, len = elements.length; i < len; i++) {
                var element = elements[i];
                switch (name.charAt(0)) {
                    case '.':
                        if (element.getAttribute("class").indexOf(name.slice(1)) >= 0) {
                            args.push(element);
                        }
                        break;
                    case '#':
                        if (element.getAttribute("id") === name.slice(1)) {
                            args.push(element);
                        }
                        break;
                    case '@':
                        if (element.getAttribute("name") === name.slice(1)) {
                            args.push(element);
                        }
                        break;
                    default:
                        break;
                }
            }
            return args;
        };
        Helper.getPosterityByNmae = function (name, parent) {
            if (parent === void 0) { parent = window.document; }
            switch (name.charAt(0)) {
                case '.':
                    name = name.slice(1);
                    return this._getPosterityByClass(name, parent);
                    break;
                case '#':
                    name = name.slice(1);
                    return parent.getElementById(name);
                    break;
                case '@':
                    name = name.slice(1);
                    return window.document.getElementsByName(name);
                    break;
                case '$':
                    name = name.slice(1);
                    return this._getPosterityByIndex(Number(name), parent);
                    break;
                default:
                    return parent.getElementsByTagName(name);
                    break;
            }
        };
        Helper._getPosterityByIndex = function (index, parent) {
            if (parent === void 0) { parent = window.document; }
            var elements = parent.getElementsByTagName("*");
            for (var i = 0, len = elements.length; i < len; i++) {
                if (elements[i].nodeType == 1) {
                    index--;
                    if (index < 0) {
                        return elements[i];
                    }
                }
            }
            return null;
        };
        Helper._getPosterityByClass = function (name, parent) {
            if (parent === void 0) { parent = window.document; }
            var elements = parent.getElementsByTagName("*"), classElements = Array();
            for (var i = 0, len = elements.length; i < len; i++) {
                var element = elements[i];
                if (element.nodeType == 1) {
                    if (element.getAttribute("class") == name) {
                        classElements.push(element);
                    }
                }
            }
            ;
            return classElements;
        };
        Helper.clone = function (obj) {
            var o;
            switch (typeof obj) {
                case 'undefined':
                    break;
                case 'string':
                    o = obj + '';
                    break;
                case 'number':
                    o = obj - 0;
                    break;
                case 'boolean':
                    o = obj;
                    break;
                case 'object':
                    if (obj === null) {
                        o = null;
                    }
                    else {
                        if (obj instanceof Array) {
                            o = [];
                            for (var i = 0, len = obj.length; i < len; i++) {
                                o.push(this.clone(obj[i]));
                            }
                        }
                        else {
                            o = {};
                            for (var k in obj) {
                                o[k] = this.clone(obj[k]);
                            }
                        }
                    }
                    break;
                default:
                    o = obj;
                    break;
            }
            return o;
        };
        return Helper;
    })(Base);
    ZoDream.Helper = Helper;
})(ZoDream || (ZoDream = {}));
//# sourceMappingURL=zodream.js.map