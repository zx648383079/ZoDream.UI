class NavItem {
    constructor(
        public name: string,
        public ico?: string,
        public url: string = 'javascript:;',
        public children?: {[id: string]: NavItem},
        public target: TargetMode = TargetMode.tab,
        public id?: string,
        public image?: string,
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
        if (this.image) {
            html += '<i class="fa image-icon" style="background-image: url('+ this.image +')"></i>';
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
            $.each(data['children'], function(id: string, child: Object) {
                item.children[id] = NavItem.parse(child);
            });
        }
        return item;
    }
}