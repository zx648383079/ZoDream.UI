interface ChatMenuItem {
    name?: string,
    text?: string,
    icon?: string,
    toggle?: ()=>boolean,
    onclick?: (menuItem: JQuery) => void,
    children?: Array<ChatMenuItem>
}

class ChatMenu {
    /**
     *
     */
    constructor(
        private box: JQuery,
        private menus: Array<ChatMenuItem> = []
    ) {
        this.bindEvent();
    }

    private events: any = {};
    private menuMap: any;

    public bindEvent() {
        let _this = this;
        this.box.on('click', 'li', function() {
            _this.clickLi($(this));
        });
    }

    public clickLi(li: JQuery) {
        let name = li.attr('data-name'),
            menu: ChatMenuItem;
        if (name && this.menuMap.hasOwnProperty(name)) {
            menu = this.menuMap[name];
            if (menu && menu.onclick) {
                menu.onclick(li);
            }
        }
        if (name && this.hasEvent(name)) {
            this.trigger(name, li, menu);
        }
        this.trigger('click', li, menu);
    }

    public addMenu(menu: ChatMenuItem | any) {
        this.menus.push(menu);
        return this;
    }

    public show(x: number, y: number) {
        this.refresh();
        this.box.css({
            'left': x + 'px',
            'top': y + 'px'
        }).show();
        return this;
    }

    public hide() {
        this.box.hide();
    }

    public refresh() {
        this.menuMap = {};
        let menus = this.cleanMenuList(this.menus),
            html = menus ? this.getMenuHtml(menus) : '';
        this.box.html(html);
    }

    private getMenuHtml(menus: Array<ChatMenuItem>): string {
        let html = '';
        menus.forEach(menu => {
            html += this.getMenuItemHtml(menu);
        });
        return '<ul>'+ html + '</ul>';
    }

    private getMenuItemHtml(menu: ChatMenuItem): string {
        let name = (menu.text || menu.name),
            html = '<li data-name="'+  name
        +'"><span><i class="fa fa-'+menu.icon+'"></i>' + (menu.text || menu.name),
            menus = this.cleanMenuList(menu.children);
        this.menuMap[name] = menu;
        if (menus && menus.length > 0) {
            return html + '<i class="fa fa-chevron-right"></i></span>' + this.getMenuHtml(menus) + '</li>';
        }
        return html + '</span></li>';
    }

    private cleanMenuList(menus?: Array<ChatMenuItem>): Array<ChatMenuItem> {
        if (!menus || menus.length == 0) {
            return null;
        }
        let real_menu = [];
        menus.forEach(menu => {
            if (menu.toggle && menu.toggle() === false) {
                return;
            }
            real_menu.push(menu);
        });
        return real_menu;
    }

    public on(event: string, callback: Function): this {
        this.events[event] = callback;
        return this;
    }

    public hasEvent(event: string): boolean {
        return this.events.hasOwnProperty(event);
    }

    public trigger(event: string, ... args: any[]) {
        if (!this.hasEvent(event)) {
            return;
        }
        return this.events[event].call(this, ...args);
    }
}

class ChatAddUserBox {
    /**
     *
     */
    constructor(
        public box: JQuery,
        private parent: ChatRoom
    ) {
        
    }

    public show() {
        this.box.show();
    }
}

class ChatUserInfoBox {
    /**
     *
     */
    constructor(
        public box: JQuery,
        private parent: ChatRoom
    ) {
        
    }

    public show() {
        this.box.show();
    }
}

class ChatSearchBox {
    /**
     *
     */
    constructor(
        public box: JQuery,
        private parent: ChatRoom
    ) {
        this.bindEvent();
    }

    /**
     * bindEvent
     */
    public bindEvent() {
        let _this = this;
        this.box.on('click', '.dialog-search-list .dialog-info', function() {
            _this.parent.addBox.show();
        });
        this.box.on('click', '.dialog-tab-header .dialog-tab-item', function() {
            let $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
        });
    }

    public show() {
        this.box.show();
    }
}

class ChatEditor {
    constructor(
        public box: JQuery,
        private parent: ChatMessageBox
    ) {
        
    }

    public insertHtmlAtCaret(html: string) {
        let sel: Selection, range: Range, editor = this.box;
        if (!editor.is(":focus")) {
            editor.focus();
            range = document.createRange();
            range.setStartAfter(editor[0]);
            range.setEnd(editor[0], editor[0].childNodes.length);
    
        }
        if (!window.getSelection) {
            return;
        }
        sel = window.getSelection();
        if (!sel.getRangeAt || !sel.rangeCount) {
            return;
        }
        if (!range) {
            range = sel.getRangeAt(0);
            range.deleteContents();
        }
        let el = document.createElement("div");
        el.innerHTML = html;
        let frag = document.createDocumentFragment(), node, lastNode;
        while ( (node = el.firstChild) ) {
            lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

class ChatMessageBox {
    /**
     *
     */
    constructor(
        public box: JQuery,
        private parent: ChatRoom
    ) {
        this.refresh();
        this.bindEvent();
    }

    public editor: ChatEditor;

    public refresh() {
        this.editor = new ChatEditor(this.box.find('.dialog-message-text'), this);
    }

    /**
     * bindEvent
     */
    public bindEvent() {
        let _this = this;
        this.box.on('click', '.fa-smile-o', function() {
            _this.editor.insertHtmlAtCaret('<img src="./image/avatar.jpg" alt="">');
        });
    }
}

class ChatUserBox {
    /**
     *
     */
    constructor(
        public box: JQuery,
        private parent: ChatRoom
    ) {
        this.refresh();
        this.bindEvent();
    }

    public menu: ChatMenu;

    public refresh() {
        this.menu = new ChatMenu(this.box.find('.dialog-menu'), USER_MENU);
    }

    public bindEvent() {
        let _this = this;
        $(document).click(function() {
            _this.menu.hide();
        });
        this.box.click(function() {
            if ($(this).hasClass('dialog-min')) {
                $(this).removeClass('dialog-min');
            }
        });
        this.box.on('click', '.dialog-header .fa-minus', function(e) {
            e.stopPropagation();
            _this.box.addClass('dialog-min');
        });

        this.box.on('click', '.dialog-header .fa-plus', function() {
            _this.parent.searchBox.show();
        });
        this.box.on('click', '.dialog-tab .dialog-tab-header .dialog-tab-item', function() {
            let $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            $this.closest('.dialog-tab').find('.dialog-tab-box .dialog-tab-item').eq($this.index()).addClass('active').siblings().removeClass('active');
        });
        this.box.on('click', '.dialog-panel .dialog-panel-header', function() {
            $(this).closest('.dialog-panel').toggleClass('expanded');
        });
        this.box.on('click', '.dialog-tab .dialog-user', function() {
            $(this).closest('.dialog-chat').find('.dialog-chat-room').show();
        });
        this.box.on('contextmenu', '.dialog-tab .dialog-user', function(event) {
            _this.menu.show(event.clientX, event.clientY);
            return false;
        });
        this.menu.on('click', function() {
            console.log(arguments);
            _this.parent.userBox.show();
        });
    }
}

class ChatRoom {
    constructor(
        public target: JQuery
    ) {
        this.refresh();
    }

    public mainBox: ChatUserBox;
    public addBox: ChatAddUserBox;
    public userBox: ChatUserInfoBox;
    public searchBox: ChatSearchBox;
    public chatBox: ChatMessageBox;

    public refresh() {
        this.mainBox = new ChatUserBox(this.target.find('.dialog-chat-box'), this);
        this.addBox = new ChatAddUserBox(this.target.find('.dialog-add-box'), this);
        this.userBox = new ChatUserInfoBox(this.target.find('.dialog-user-box'), this);
        this.searchBox = new ChatSearchBox(this.target.find('.dialog-search-box'), this);
        this.chatBox = new ChatMessageBox(this.target.find('.dialog-chat-room'), this);
    }
}

const USER_MENU: Array<ChatMenuItem> = [
    {
        icon: 'eye',
        text: '查看资料'
    },
    {
        icon: 'bookmark',
        text: '移动好友'
    },
    {
        icon: 'trash',
        text: '删除好友'
    },
];

new ChatRoom($('.dialog-chat-page'));

$(function() {
    $('.dialog-box').on('click', '.dialog-header .fa-close', function() {
        $(this).closest('.dialog-box').hide();
    });
});