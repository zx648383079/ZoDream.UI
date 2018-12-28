class Tab {
    constructor(
        public element: JQuery,
        public option: TabOption
    ) {
        this._head = this.element.find(".zd-tab-head ul");
        this._body = this.element.find(".zd-tab-body");
        this._bindEvent();
    }

    private _data: Array<NavItem> = [];

    private _head: JQuery;

    private _body: JQuery;

    private _bindEvent() {
        let instance = this;
        this._head.on("click", ".zd-tab-item", function() {
            instance.showItem($(this).index());
        });
        this._head.on("click", ".zd-tab-item .fa-times", function() {
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
        this._head.append('<li class="zd-tab-item"><span>' + item.name + '</span><i class="fa fa-times"></i></li>');
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