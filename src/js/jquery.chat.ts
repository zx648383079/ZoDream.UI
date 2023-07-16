interface ChatMenuItem {
    name?: string,
    text?: string,
    icon?: string,
    toggle?: (target: JQuery, menu: ChatMenu)=>boolean,
    onclick?: (menuItem: JQuery, target: JQuery, menu: ChatMenu) => void|false,
    children?: Array<ChatMenuItem>
}

interface ChatGroupItem {
    name: string,
    count: number,
    online_count: number,
    users: Array<ChatUserItem>
}

interface ChatUserItem {
    id: number,
    name: string,
    avatar: string,
    brief: string,
    new_count?: number,
    last_message?: ChatMessageItem
}

enum ChatType {
    MESSAGE,
    MORE,
    TIP,
    TIME
}

interface ChatMessageItem {
    type: ChatType
    content?: string,
    time?: number,
    user?: ChatUserItem
}

abstract class ChatBaseBox {
    private cache_element: any = {};
    public box: JQuery;
    private events: any = {};

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

    public find(tag: string): JQuery {
        if (this.cache_element.hasOwnProperty(tag)) {
            return this.cache_element[tag];
        }
        return this.cache_element[tag] = this.box.find(tag);
    }

    public show() {
        this.box.show();
        return this;
    }

    public hide() {
        this.box.hide();
    }
}

class ChatMenu extends ChatBaseBox {
    /**
     *
     */
    constructor(
        box: JQuery,
        private menus: Array<ChatMenuItem> = []
    ) {
        super();
        this.box = box;
        this.bindEvent();
    }


    private menuMap: any;
    private target: JQuery;

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
            if (menu && menu.onclick && menu.onclick(li, this.target, this) === false) {
                return;
            }
        }
        if (name && this.hasEvent(name) && this.trigger(name, li, menu, this.target, this) === false) {
            return;
        }
        this.trigger('click', li, menu, this.target);
    }

    public addMenu(menu: ChatMenuItem | any) {
        this.menus.push(menu);
        return this;
    }

    public showPosition(x: number, y: number, target?: JQuery) {
        this.refresh();
        this.box.css({
            'left': x + 'px',
            'top': y + 'px'
        }).show();
        this.target = target;
        return this;
    }

    public hide() {
        this.box.hide();
        this.target = null;
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
            if (menu.toggle && menu.toggle(this.target, this) === false) {
                return;
            }
            real_menu.push(menu);
        });
        return real_menu;
    }


}

class ChatAddUserBox extends ChatBaseBox {
    /**
     *
     */
    constructor(
        public box: JQuery,
        private parent: ChatRoom
    ) {
        super();
    }
}

class ChatUserInfoBox extends ChatBaseBox {
    /**
     *
     */
    constructor(
        public box: JQuery,
        private parent: ChatRoom
    ) {
        super();
    }
}

class ChatSearchBox extends ChatBaseBox {
    /**
     *
     */
    constructor(
        public box: JQuery,
        private parent: ChatRoom
    ) {
        super();
        this.bindEvent();
    }

    private users: Array<ChatUserItem> = [];

    private render() {
        let tpl = `<div class="dialog-info">
        <div class="dialog-info-avatar">
            <img src="{0}" alt="">
        </div>
        <div class="dialog-info-name">
            <h3>{1}</h3>
            <p>{2}</p>
        </div>
    </div>`,
        html = '';
        this.users.forEach(user => {
            html += ZUtils.str.format(tpl, user.avatar, user.name, user.brief);
        });
        this.find('.dialog-search-list').html(html);
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

}

class ChatEditor {
    constructor(
        public box: JQuery,
        private parent: ChatMessageBox
    ) {
        
    }

    public html(): string {
        return this.box.html();
    }

    public text(): string {
        return this.box.text();
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

class ChatMessageBox extends ChatBaseBox {
    /**
     *
     */
    constructor(
        public box: JQuery,
        private parent: ChatRoom,
        private send?: ChatUserItem,
        public revice?: ChatUserItem
    ) {
        super();
        this.refresh();
        this.bindEvent();
    }

    public editor: ChatEditor;

    private messages: Array<ChatMessageItem> = [];

    public refresh() {
        this.editor = new ChatEditor(this.find('.dialog-message-text'), this);
        this.renderTitle();
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

    private renderTitle() {
        if (!this.revice) {
            return;
        }
        this.find('.dialog-title').html('与 '+ this.revice.name +' 聊天中');
    }

    public addMessage(message: ChatMessageItem) {
        this.messages.push(message);
        this.renderMessage();
    }

    public prependMessage(messages: Array<ChatMessageItem>) {
        this.messages = messages.concat(this.messages);
        this.renderMessage();
    }

    private renderMessage() {
        let html = '',
            messages = this.cleanMessage();
        messages.forEach(item => {
            html += this.renderMessageItem(item);
        });
        this.find('.dialog-message-box').html(html);
    }

    private renderMessageItem(item: ChatMessageItem) {
        switch (item.type) {
            case ChatType.MORE:
                return '<p class="message-more">加载更多</p>';
            case ChatType.TIME:
                return '<p class="message-line">' + item.content +'</p>';
            case ChatType.TIP:
                return '<p class="message-tip">' + item.content +'</p>';
            case ChatType.MESSAGE:
            default:
                break;
        }
        if (item.user.id == this.send.id) {
            return ZUtils.str.format(`<div class="message-right">
            <img class="avatar" src="{0}">
            <div class="content">
                {1}
            </div>
        </div>`, item.user.avatar, item.content);
        }
        return ZUtils.str.format(`<div class="message-left">
        <img class="avatar" src="{0}">
        <div class="content">
            {1}
        </div>
    </div>`, item.user.avatar, item.content);
    }

    private cleanMessage(): Array<ChatMessageItem> {
        let messages: Array<ChatMessageItem> = [
            {
                type: ChatType.MORE
            }
        ],
            lastTime: number = 0;
        this.messages.forEach(item => {
            if (item.time - lastTime > 200) {
                lastTime = item.time;
                this.messages.push({
                    content: ZUtils.time + '',
                    type: ChatType.TIME
                });
            }
        });
        return messages;
    }


}

class ChatUserBox extends ChatBaseBox {
    /**
     *
     */
    constructor(
        public box: JQuery,
        private parent: ChatRoom
    ) {
        super();
        this.refresh();
        this.bindEvent();
    }

    private user: ChatUserItem;
    private last_friends: Array<ChatUserItem>;
    private friends: Array<ChatGroupItem>;
    private groups: Array<ChatUserItem>;
    public menu: ChatMenu;

    public refresh() {
        this.menu = new ChatMenu(this.find('.dialog-menu'), USER_MENU);
    }

    private renderGroup() {
        let tpl = `<div class="dialog-user">
        <div class="dialog-user-avatar">
            <img src="{0}" alt="">
        </div>
        <div class="dialog-user-info">
            <p>
                <span class="name">{1}</span>
            </p>
            <p>
                <span class="content">{2}</span>
            </p>
        </div>
    </div>`,
        html = '';
        this.groups.forEach(group => {
            html += ZUtils.str.format(tpl, group.avatar, group.name, group.brief);
        });
        this.find('.dialog-tab-box .dialog-tab-item').eq(2).html(html);
    }

    private renderFriends() {
        let panel = `
        <div class="dialog-panel expanded">
        <div class="dialog-panel-header">
            <i class="dialog-panel-icon"></i>
            <span>{0} ({1} / {2})</span>
        </div>
        <div class="dialog-panel-box">
            {3}
        </div>
    </div>
        `,
            tpl = `<div class="dialog-user">
            <div class="dialog-user-avatar">
                <img src="{0}" alt="">
            </div>
            <div class="dialog-user-info">
                <p>
                    <span class="name">{1}</span>
                </p>
                <p>
                    <span class="content">{2}</span>
                </p>
            </div>
        </div>`,
        html = '';
        this.friends.forEach(group => {
            let groupHtml = '';
            group.users.forEach(user => {
                groupHtml += ZUtils.str.format(tpl, user.avatar, user.name, user.brief);
            });
            html += ZUtils.str.format(panel, group.name, group.online_count, group.count, groupHtml);
        });
        this.find('.dialog-tab-box .dialog-tab-item').eq(1).html(html);
    }

    private renderLastFriends() {
        let tpl = `<div class="dialog-user">
        <div class="dialog-user-avatar">
            <img src="{0}" alt="">
        </div>
        <div class="dialog-user-info">
            <p>
                <span class="name">{1}</span>
                <span class="time">{2}</span>
            </p>
            <p>
                <span class="content">{3}</span>
                <span class="count">{4}</span>
            </p>
        </div>
    </div>`,
        html = '';
        this.last_friends.forEach(user => {
            html += ZUtils.str.format(tpl, user.avatar, user.name, user.last_message.time, user.last_message.content, user.new_count);
        });
        this.find('.dialog-tab-box .dialog-tab-item').eq(0).html(html);
    }

    private renderUser() {
        let tpl = `<div class="dialog-info-avatar">
        <img src="{0}" alt="">
    </div>
    <div class="dialog-info-name">
        <h3>{1}</h3>
        <p>{2}</p>
    </div>
    <div class="dialog-message-count">
    {3}
    </div>`;
        this.find('.dialog-info').html(ZUtils.str.format(tpl, this.user.avatar, this.user.name, this.user.brief, this.user.new_count));
    }

    public bindEvent() {
        let _this = this;
        $(document).on('click', function() {
            _this.menu.hide();
        });
        this.box.on('click', function() {
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
            _this.menu.showPosition(event.clientX, event.clientY, $(this));
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

let room = new ChatRoom($('.dialog-chat-page')),
    fixed_room = new ChatRoom($('.dialog-fixed'));



$(function() {
    $('.dialog-box').on('click', '.dialog-header .fa-close', function() {
        $(this).closest('.dialog-box').hide();
    });
});