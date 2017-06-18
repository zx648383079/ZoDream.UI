enum TargetMode {
    tab,
    self,
    blank,
    window
}
class NavItem {
    constructor(
        public name: string,
        public ico?: string,
        public url: string = 'javascript:;',
        public children?: {[id: string]: NavItem},
        public target: TargetMode = TargetMode.tab,
        public id?: string
    ) {

    }

    public element: JQuery;

    public ul: JQuery;

    public getChild(allId: string[]): NavItem {
        if (allId.length < 1) {
            return this;
        }
        if (!this.children) {
            throw new Error('error id: '+ allId[0]);
        }
        let id = allId.shift();
        if (!this.children.hasOwnProperty(id)) {
            throw new Error('error id: '+ id);
        }
        return this.children[id].getChild(allId);
    }

    public addItem(id: string, item: NavItem): this {
        this.removeItem(id);
        if (!this.children) {
            this.children = {};
        }
        this.children[id] = item;
        this._renderChild(id, item);
        return this;
    }

    public removeItem(id: string): this {
        if (!this.children) {
            return this;
        }
        if (this.children.hasOwnProperty(id)) {
            this.children[id].remove();
            delete this.children[id];
        }
        return this;
    }

    public remove() {
        this.element.remove();
    }

    public addActive(): this {
        this.element.addClass("active").siblings().removeClass("active");
        return this;
    }

    public active(id?: string[] | string): this {
        this.addActive();
        if (!id || id.length == 0 || !this.children) {
            this.element.trigger('click');
            return this;
        }
        let k = typeof id == 'string' ? id : id.shift();
        if (!this.children.hasOwnProperty(k)) {
            throw new Error('error id: '+ k);
        }
        if (typeof id == 'string') {
            this.children[k].active();
            return this;
        }
        this.children[k].active(id);
        return this;
    }

    public render(id: string): JQuery {
        this.id = id;
        this.element = $('<li></li>');
        this.element.data(this);
        let html = '<a href="' + this.url + '">';
        if (this.ico) {
            html += '<i class="fa fa-'+this.ico+'"></i>';
        }
        html += '<span>'+this.name+'</span></a>';
        this.element.append(html);
        this._renderChildren();
        return this.element;
    }


    private _addUl() {
        if (this.ul) {
            return;
        }
        this.ul = $('<ul></ul>');
        this.element.append(this.ul);
    }

    private _renderChildren() {
        if (!this.children) {
            return;
        }
        this._addUl();
        let k = this.id + '/';
        let instance = this;
        $.each(this.children, function(id: string, item: NavItem) {
            instance.ul.append(item.render(k + id));
        });
    }

    private _renderChild(id: string, item: NavItem) {
        this._addUl();
        this.ul.append(item.render(this.id + '/' + id));
    }

    public clone(): NavItem {
        let item = new NavItem(this.name, this.ico, this.url);
        item.id = this.id;
        return item;
    }

    public static parse(data: Object): NavItem {
        if (data instanceof NavItem) {
            return data;
        }
        let item = new NavItem(data['name']);
        if (data.hasOwnProperty('ico')) {
            item.ico = data['ico'];
        }
        if (data.hasOwnProperty('target')) {
            item.target = typeof data['target'] == 'string' ? TargetMode[data['target']] : data['target'];
        }
        if (data.hasOwnProperty('url')) {
            item.url = data['url'];
        }
        if (data.hasOwnProperty('children')) {
            item.children = {};
            $.each(data['children'], function(id: string, child: Object) {
                item.children[id] = NavItem.parse(child);
            });
        }
        return item;
    }
}


interface NavbarOption {
    data?: {[id: string]: any};
    bottom?: {[id: string]: any};
    tab?: JQuery,
    default?: string,
}

class NavbarDefaultOption implements NavbarOption {
    
}

interface TabOption {
    active: (NavItem)=>void
}

class Tab {
    constructor(
        public element: JQuery,
        public option: TabOption
    ) {
        this._head = this.element.find(".zd-tab-head ul");
        this._body = this.element.find(".zd-tab-body");
        
    }

    private _data: Array<NavItem> = [];

    private _head: JQuery;

    private _body: JQuery;

    private _bindEvent() {
        let instance = this;
        this._head.on("click", ".zd-tab-item", function() {
            instance.showItem($(this).index());
        });
        this._head.on("click", ".zd-tab-item .fa-close", function() {
            // 当所有标签页关闭时会出错，页面错乱
            instance.removeItem($(this).parent().index());
        });
    }

    public setProperty() {
        let items = this._head.find('.zd-tab-item');
        let width = items.width();
        this._head.width(items.length * width);
    }

    public addItem(item: NavItem) {
        if (this.hasItem(item)) {
            this.showItem(item);
            return;
        }
        this._head.append('<li class="zd-tab-item"><span>' + item.name + '</span><i class="fa fa-close"></i></li>');
        this._body.append('<iframe class="zd-tab-item" height="100%" src="' + item.url + '"></iframe>');
        this._data.push(item.clone());
        this.showItem(this._data.length - 1);
        this.setProperty();
    }

    public hasItem(item: NavItem| string): boolean {
        if (typeof item != 'string') {
            item = item.id;
        }
        return this._getIndexById(item) >= 0;
    }

    public removeItem(index: number | string) {
        if (this._data.length < 2) {
            return;
        }
        if (typeof index == 'string') {
            index = this._getIndexById(index);
        }
        if (index < 0 || index >= this._data.length) {
            return;
        }
        let item = this._head.find('.zd-tab-item').eq(index);
        if (item.hasClass("active")) {
            this.showItem(index - 1);
        }
        item.remove();
        this._body.find('.zd-tab-item').eq(index).remove();
        this._data.splice(index, 1);
    }

    public showItem(index: number | string | NavItem) {
        if (this._data.length < 1) {
            return;
        }
        if (typeof index == 'string') {
            index = this._getIndexById(index);
        } else if (typeof index == 'object') {
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
    }

    private _getIndexById(id: string): number {
        for (let i = this._data.length - 1; i >= 0; i--) {
            if (this._data[i].id == id) {
                return i;
            }
        }
        return -1;
    }

    private _setHistory(item: NavItem) {
        let url = window.location.href.split('#')[0] + '#' +item.id;
        history.pushState(item, item.name, url);
    }
}

class Navbar {
    constructor(
        public element: JQuery,
        option?: NavbarOption
    ) {
        this.option = $.extend({}, new NavbarDefaultOption(), option);
        this.tab = this.option.tab.tab({
            active: function(item: NavItem) {
                //console.log(item);
            }
        });
        this._bottom = this.element.find('.nav-bottom');
        this._top = this.element.find('.nav-top');
        this.refresh();
        this._bindEvent();
        // 刷新浏览器时跳转
        let url = window.location.href.split('#');
        if (url.length > 1) {
            this.open(url[1]);
        } else if (this.option.default) {
            this.open(this.option.default);
        }
    }

    public option: NavbarOption;
    
    public tab: Tab;

    private _bottom: JQuery;
    private _top: JQuery;

    /**
     * 绑定事件
     */
    private _bindEvent() {
        let instance = this;
        this.element.on("click", 'li a', function(e) {
            e.preventDefault();
        });
        this.element.on("click", 'li', function() {
            let item: NavItem = $(this).data();
            instance.openItem(item);
        });
        $(window).bind('popstate', function(e) {
            // 浏览器返回跳转
            let item: NavItem = e.originalEvent.state;
            instance.tab.showItem(item);
        });
        $(window).resize(function() {
            instance._setProperty();
            instance.tab.setProperty();
        });
    }

    private _setProperty() {
        this._top.height($(window).height() - this._top.offset().top - this._bottom.height());
    }

    public open(path: string| string[], isTop: boolean = true) {
        [isTop, path] = this._pathToId(path, isTop);
        let id = path.shift();
        if (this.option.data.hasOwnProperty(id)) {
            this.option.data[id].active(path);
            return;
        }
        if (this.option.bottom.hasOwnProperty(id)) {
            this.option.bottom[id].active(path);
            return;
        }
        throw new Error('error id: '+ id);
    }

    public openItem(item: NavItem) {
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
    }

    public refresh() {
        this._addItem(this._top, this.option.data); 
        if (!this.option.bottom) {
            this._setProperty();
            return;
        }
        this._addItem(this._bottom, this.option.bottom);
        this._setProperty();
    }

    // 动态添加
    public addItem(path: string, item: NavItem| Object) {
        let [isTop, allId] = this._pathToId(path);
        let id = allId.pop();
        if (allId.length > 0) {
            this.getItem(allId).addItem(id, NavItem.parse(item));
            return;
        }
        this.removeItem([id], isTop);
        let data = {};
        data[id] = item;
        if (isTop) {
            this.option.data[id] = item;
            this._addItem(this._top, data);
            return;
        }
        this.option.data[id] = item;
        this._addItem(this._bottom, data);
        return;
    }

    public removeItem(path: string| string[], isTop: boolean = true): this {
        [isTop, path] = this._pathToId(path, isTop);
        let id = path.pop();
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
    }

    /**
     * 
     * @param path 
     * @param isTop 
     */
    public getItem(path: string| string[], isTop: boolean = true): NavItem {
        [isTop, path] = this._pathToId(path, isTop);
        let id = path.shift();
        if (isTop && this.option.data.hasOwnProperty(id)) {
            return this.option.data[id].getChild(path);
        }
        if (this.option.bottom.hasOwnProperty(id)) {
            return this.option.bottom[id].getChild(path);
        }
        throw new Error('error id: '+ id);
    }

    /**
     * 路径转换成Id
     * @param path 
     */
    private _pathToId(path: string| string[], isTop: boolean = true): [boolean, string[]] {
        if (typeof path != 'string') {
            return [isTop, path];
        }
        if (!isTop) {
            return [isTop, [path]];
        }
        let paths = path.split(':');
        if (paths.length > 1 && paths[0] == 'bottom') {
            isTop = false;
            path = paths[1];
        }
        paths = path.split('/');
        let allId = [];
        paths.forEach(id => {
            if (id == '') {
                return;
            }
            allId.push(id);
        });
        return [isTop, allId];
    }

    private _addItem(element: JQuery, data: {[id: string]: NavItem}) {
        $.each(data, function(id: string, item: NavItem) {
            item = NavItem.parse(item);
            element.append(item.render(id));
            data[id] = item;
        });
    }
}

;(function($: any) {
    $.fn.tab = function(option ?: TabOption) {
        return new Tab(this, option); 
    };
    $.fn.navbar = function(option ?: NavbarOption) {
        return new Navbar(this, option); 
    };
})(jQuery);