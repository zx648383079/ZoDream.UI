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