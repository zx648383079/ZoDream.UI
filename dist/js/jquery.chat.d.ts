/// <reference types="jquery" />
/// <reference types="jquery" />
interface ChatMenuItem {
    name?: string;
    text?: string;
    icon?: string;
    toggle?: (target: JQuery, menu: ChatMenu) => boolean;
    onclick?: (menuItem: JQuery, target: JQuery, menu: ChatMenu) => void | false;
    children?: Array<ChatMenuItem>;
}
interface ChatGroupItem {
    name: string;
    count: number;
    online_count: number;
    users: Array<ChatUserItem>;
}
interface ChatUserItem {
    id: number;
    name: string;
    avatar: string;
    brief: string;
    new_count?: number;
    last_message?: ChatMessageItem;
}
declare enum ChatType {
    MESSAGE = 0,
    MORE = 1,
    TIP = 2,
    TIME = 3
}
interface ChatMessageItem {
    type: ChatType;
    content?: string;
    time?: number;
    user?: ChatUserItem;
}
declare abstract class ChatBaseBox {
    private cache_element;
    box: JQuery;
    private events;
    on(event: string, callback: Function): this;
    hasEvent(event: string): boolean;
    trigger(event: string, ...args: any[]): any;
    find(tag: string): JQuery;
    show(): this;
    hide(): void;
}
declare class ChatMenu extends ChatBaseBox {
    private menus;
    /**
     *
     */
    constructor(box: JQuery, menus?: Array<ChatMenuItem>);
    private menuMap;
    private target;
    bindEvent(): void;
    clickLi(li: JQuery): void;
    addMenu(menu: ChatMenuItem | any): this;
    showPosition(x: number, y: number, target?: JQuery): this;
    hide(): void;
    refresh(): void;
    private getMenuHtml;
    private getMenuItemHtml;
    private cleanMenuList;
}
declare class ChatAddUserBox extends ChatBaseBox {
    box: JQuery;
    private parent;
    /**
     *
     */
    constructor(box: JQuery, parent: ChatRoom);
}
declare class ChatUserInfoBox extends ChatBaseBox {
    box: JQuery;
    private parent;
    /**
     *
     */
    constructor(box: JQuery, parent: ChatRoom);
}
declare class ChatSearchBox extends ChatBaseBox {
    box: JQuery;
    private parent;
    /**
     *
     */
    constructor(box: JQuery, parent: ChatRoom);
    private users;
    private render;
    /**
     * bindEvent
     */
    bindEvent(): void;
}
declare class ChatEditor {
    box: JQuery;
    private parent;
    constructor(box: JQuery, parent: ChatMessageBox);
    html(): string;
    text(): string;
    insertHtmlAtCaret(html: string): void;
}
declare class ChatMessageBox extends ChatBaseBox {
    box: JQuery;
    private parent;
    private send?;
    revice?: ChatUserItem;
    /**
     *
     */
    constructor(box: JQuery, parent: ChatRoom, send?: ChatUserItem, revice?: ChatUserItem);
    editor: ChatEditor;
    private messages;
    refresh(): void;
    /**
     * bindEvent
     */
    bindEvent(): void;
    private renderTitle;
    addMessage(message: ChatMessageItem): void;
    prependMessage(messages: Array<ChatMessageItem>): void;
    private renderMessage;
    private renderMessageItem;
    private cleanMessage;
}
declare class ChatUserBox extends ChatBaseBox {
    box: JQuery;
    private parent;
    /**
     *
     */
    constructor(box: JQuery, parent: ChatRoom);
    private user;
    private last_friends;
    private friends;
    private groups;
    menu: ChatMenu;
    refresh(): void;
    private renderGroup;
    private renderFriends;
    private renderLastFriends;
    private renderUser;
    bindEvent(): void;
}
declare class ChatRoom {
    target: JQuery;
    constructor(target: JQuery);
    mainBox: ChatUserBox;
    addBox: ChatAddUserBox;
    userBox: ChatUserInfoBox;
    searchBox: ChatSearchBox;
    chatBox: ChatMessageBox;
    refresh(): void;
}
declare const USER_MENU: Array<ChatMenuItem>;
declare let room: ChatRoom, fixed_room: ChatRoom;
