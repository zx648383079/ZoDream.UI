var TargetMode;
(function (TargetMode) {
    TargetMode[TargetMode["tab"] = 0] = "tab";
    TargetMode[TargetMode["self"] = 1] = "self";
    TargetMode[TargetMode["blank"] = 2] = "blank";
    TargetMode[TargetMode["window"] = 3] = "window";
})(TargetMode || (TargetMode = {}));
var NavbarDefaultOption = /** @class */ (function () {
    function NavbarDefaultOption() {
    }
    return NavbarDefaultOption;
}());
var NavItem = /** @class */ (function () {
    function NavItem(name, ico, url, children, target, id, image) {
        if (url === void 0) { url = 'javascript:;'; }
        if (target === void 0) { target = TargetMode.tab; }
        this.name = name;
        this.ico = ico;
        this.url = url;
        this.children = children;
        this.target = target;
        this.id = id;
        this.image = image;
    }
    NavItem.prototype.getChild = function (allId) {
        if (allId.length < 1) {
            return this;
        }
        if (!this.children) {
            throw new Error('error id: ' + allId[0]);
        }
        var id = allId.shift();
        if (!this.children.hasOwnProperty(id)) {
            throw new Error('error id: ' + id);
        }
        return this.children[id].getChild(allId);
    };
    NavItem.prototype.addItem = function (id, item) {
        this.removeItem(id);
        if (!this.children) {
            this.children = {};
        }
        this.children[id] = item;
        this._renderChild(id, item);
        return this;
    };
    NavItem.prototype.removeItem = function (id) {
        if (!this.children) {
            return this;
        }
        if (this.children.hasOwnProperty(id)) {
            this.children[id].remove();
            delete this.children[id];
        }
        return this;
    };
    NavItem.prototype.remove = function () {
        this.element.remove();
    };
    NavItem.prototype.addActive = function () {
        this.element.addClass("active").siblings().removeClass("active");
        return this;
    };
    NavItem.prototype.active = function (id) {
        this.addActive();
        if (!id || id.length == 0 || !this.children) {
            this.element.trigger('click');
            return this;
        }
        var k = typeof id == 'string' ? id : id.shift();
        if (!this.children.hasOwnProperty(k)) {
            throw new Error('error id: ' + k);
        }
        if (typeof id == 'string') {
            this.children[k].active();
            return this;
        }
        this.children[k].active(id);
        return this;
    };
    NavItem.prototype.render = function (id) {
        this.id = id;
        this.element = $('<li></li>');
        this.element.data(this);
        var html = '<a href="' + this.url + '">';
        if (this.ico) {
            html += '<i class="fa fa-' + this.ico + '"></i>';
        }
        if (this.image) {
            html += '<i class="fa image-icon" style="background-image: url(' + this.image + ')"></i>';
        }
        html += '<span>' + this.name + '</span></a>';
        this.element.append(html);
        this._renderChildren();
        return this.element;
    };
    NavItem.prototype._addUl = function () {
        if (this.ul) {
            return;
        }
        this.ul = $('<ul></ul>');
        this.element.append(this.ul);
    };
    NavItem.prototype._renderChildren = function () {
        if (!this.children) {
            return;
        }
        this._addUl();
        var k = this.id + '/';
        var instance = this;
        $.each(this.children, function (id, item) {
            instance.ul.append(item.render(k + id));
        });
    };
    NavItem.prototype._renderChild = function (id, item) {
        this._addUl();
        this.ul.append(item.render(this.id + '/' + id));
    };
    NavItem.prototype.clone = function () {
        var item = new NavItem(this.name, this.ico, this.url);
        item.id = this.id;
        return item;
    };
    NavItem.parse = function (data) {
        if (data instanceof NavItem) {
            return data;
        }
        var item = new NavItem(data['name']);
        if (data.hasOwnProperty('ico')) {
            item.ico = data['ico'];
        }
        if (data.hasOwnProperty('image')) {
            item.image = data['image'];
        }
        if (data.hasOwnProperty('target')) {
            item.target = typeof data['target'] == 'string' ? TargetMode[data['target']] : data['target'];
        }
        if (data.hasOwnProperty('url')) {
            item.url = data['url'];
        }
        if (data.hasOwnProperty('children')) {
            item.children = {};
            $.each(data['children'], function (id, child) {
                item.children[id] = NavItem.parse(child);
            });
        }
        return item;
    };
    return NavItem;
}());
var Tab = /** @class */ (function () {
    function Tab(element, option) {
        this.element = element;
        this.option = option;
        this._data = [];
        this._head = this.element.find(".zd-tab-head ul");
        this._body = this.element.find(".zd-tab-body");
        this._bindEvent();
    }
    Tab.prototype._bindEvent = function () {
        var instance = this;
        this._head.on("click", ".zd-tab-item", function () {
            instance.showItem($(this).index());
        });
        this._head.on("click", ".zd-tab-item .fa-times", function () {
            // 当所有标签页关闭时会出错，页面错乱
            instance.removeItem($(this).parent().index());
        });
    };
    Tab.prototype.setProperty = function () {
        var items = this._head.find('.zd-tab-item');
        var width = items.width();
        this._head.width(items.length * width);
    };
    Tab.prototype.addItem = function (item) {
        if (this.hasItem(item)) {
            this.showItem(item);
            return;
        }
        this._head.append('<li class="zd-tab-item"><span>' + item.name + '</span><i class="fa fa-times"></i></li>');
        this._body.append('<iframe class="zd-tab-item" height="100%" src="' + item.url + '"></iframe>');
        this._data.push(item.clone());
        this.showItem(this._data.length - 1);
        this.setProperty();
    };
    Tab.prototype.hasItem = function (item) {
        if (typeof item != 'string') {
            item = item.id;
        }
        return this._getIndexById(item) >= 0;
    };
    Tab.prototype.removeItem = function (index) {
        if (this._data.length < 2) {
            return;
        }
        if (typeof index == 'string') {
            index = this._getIndexById(index);
        }
        if (index < 0 || index >= this._data.length) {
            return;
        }
        var item = this._head.find('.zd-tab-item').eq(index);
        if (item.hasClass("active")) {
            this.showItem(index - 1);
        }
        item.remove();
        this._body.find('.zd-tab-item').eq(index).remove();
        this._data.splice(index, 1);
    };
    Tab.prototype.showItem = function (index) {
        if (this._data.length < 1) {
            return;
        }
        if (typeof index == 'string') {
            index = this._getIndexById(index);
        }
        else if (typeof index == 'object') {
            index = this._getIndexById(index.id);
        }
        if (index < 0) {
            index = 0;
        }
        if (index >= this._data.length) {
            index = this._data.length - 1;
        }
        this._head.find('.zd-tab-item').eq(index).addClass("active").siblings().removeClass("active");
        this._body.find('.zd-tab-item').eq(index).addClass("active").siblings().removeClass("active");
        if (this.option.active) {
            this.option.active(this._data[index]);
        }
        this._setHistory(this._data[index]);
    };
    Tab.prototype._getIndexById = function (id) {
        for (var i = this._data.length - 1; i >= 0; i--) {
            if (this._data[i].id == id) {
                return i;
            }
        }
        return -1;
    };
    Tab.prototype._setHistory = function (item) {
        var url = window.location.href.split('#')[0] + '#' + item.id;
        history.pushState(item, item.name, url);
    };
    return Tab;
}());
var Navbar = /** @class */ (function () {
    function Navbar(element, option) {
        this.element = element;
        this.option = $.extend({}, new NavbarDefaultOption(), option);
        this.tab = $(this.option.tab).tab({
            active: function (item) {
                //console.log(item);
            }
        });
        this._bottom = this.element.find('.nav-bottom');
        this._top = this.element.find('.nav-top');
        this.refresh();
        this._bindEvent();
        // 刷新浏览器时跳转
        var url = window.location.href.split('#');
        if (url.length > 1) {
            this.open(url[1]);
        }
        else if (this.option.default) {
            this.open(this.option.default);
        }
    }
    /**
     * 绑定事件
     */
    Navbar.prototype._bindEvent = function () {
        var instance = this;
        this.element.on("click", 'li a', function (e) {
            e.preventDefault();
        });
        this.element.on("click", 'li', function () {
            var item = $(this).data();
            instance.openItem(item);
        });
        $(window).bind('popstate', function (e) {
            // 浏览器返回跳转
            var item = e.originalEvent.state;
            instance.tab.showItem(item);
        });
        $(window).resize(function () {
            instance._setProperty();
            instance.tab.setProperty();
        });
    };
    Navbar.prototype._setProperty = function () {
        this._top.height($(window).height() - this._top.offset().top - this._bottom.height());
    };
    Navbar.prototype.open = function (path, isTop) {
        if (isTop === void 0) { isTop = true; }
        var _a;
        _a = this._pathToId(path, isTop), isTop = _a[0], path = _a[1];
        var id = path.shift();
        if (this.option.data.hasOwnProperty(id)) {
            this.option.data[id].active(path);
            return;
        }
        if (this.option.bottom.hasOwnProperty(id)) {
            this.option.bottom[id].active(path);
            return;
        }
        throw new Error('error id: ' + id);
    };
    Navbar.prototype.openItem = function (item) {
        item.addActive();
        if (item.url.indexOf('#') >= 0 || item.url.indexOf('javascript:') >= 0) {
            return;
        }
        switch (item.target) {
            case TargetMode.tab:
                this.tab.addItem(item);
                break;
            case TargetMode.blank:
                window.open(item.url, '_blank');
                break;
            case TargetMode.self:
                window.location.href = item.url;
                break;
            case TargetMode.window:
                window.open(item.url);
                break;
            default:
                break;
        }
    };
    Navbar.prototype.refresh = function () {
        this._addItem(this._top, this.option.data);
        if (!this.option.bottom) {
            this._setProperty();
            return;
        }
        this._addItem(this._bottom, this.option.bottom);
        this._setProperty();
    };
    // 动态添加
    Navbar.prototype.addItem = function (path, item) {
        var _a = this._pathToId(path), isTop = _a[0], allId = _a[1];
        var id = allId.pop();
        if (allId.length > 0) {
            this.getItem(allId).addItem(id, NavItem.parse(item));
            return;
        }
        this.removeItem([id], isTop);
        var data = {};
        data[id] = item;
        if (isTop) {
            this.option.data[id] = item;
            this._addItem(this._top, data);
            return;
        }
        this.option.data[id] = item;
        this._addItem(this._bottom, data);
        return;
    };
    Navbar.prototype.removeItem = function (path, isTop) {
        if (isTop === void 0) { isTop = true; }
        var _a;
        _a = this._pathToId(path, isTop), isTop = _a[0], path = _a[1];
        var id = path.pop();
        if (path.length > 0) {
            this.getItem(path).removeItem(id);
            return this;
        }
        if (isTop && this.option.data.hasOwnProperty(id)) {
            this.option.data[id].remove();
            delete this.option.data[id];
            return this;
        }
        if (this.option.bottom.hasOwnProperty(id)) {
            this.option.bottom[id].remove();
            delete this.option.bottom[id];
            return this;
        }
        return this;
    };
    /**
     *
     * @param path
     * @param isTop
     */
    Navbar.prototype.getItem = function (path, isTop) {
        if (isTop === void 0) { isTop = true; }
        var _a;
        _a = this._pathToId(path, isTop), isTop = _a[0], path = _a[1];
        var id = path.shift();
        if (isTop && this.option.data.hasOwnProperty(id)) {
            return this.option.data[id].getChild(path);
        }
        if (this.option.bottom.hasOwnProperty(id)) {
            return this.option.bottom[id].getChild(path);
        }
        throw new Error('error id: ' + id);
    };
    /**
     * 路径转换成Id
     * @param path
     */
    Navbar.prototype._pathToId = function (path, isTop) {
        if (isTop === void 0) { isTop = true; }
        if (typeof path != 'string') {
            return [isTop, path];
        }
        if (!isTop) {
            return [isTop, [path]];
        }
        var paths = path.split(':');
        if (paths.length > 1 && paths[0] == 'bottom') {
            isTop = false;
            path = paths[1];
        }
        paths = path.split('/');
        var allId = [];
        paths.forEach(function (id) {
            if (id == '') {
                return;
            }
            allId.push(id);
        });
        return [isTop, allId];
    };
    Navbar.prototype._addItem = function (element, data) {
        $.each(data, function (id, item) {
            item = NavItem.parse(item);
            element.append(item.render(id));
            data[id] = item;
        });
    };
    return Navbar;
}());
;
(function ($) {
    $.fn.tab = function (option) {
        return new Tab(this, option);
    };
    $.fn.navbar = function (option) {
        return new Navbar(this, option);
    };
})(jQuery);
