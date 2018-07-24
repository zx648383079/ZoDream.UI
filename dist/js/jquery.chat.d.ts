/// <reference types="jquery" />
interface ChatMenuItem {
    name?: string;
    text?: string;
    icon?: string;
    toggle?: () => boolean;
    onclick?: (menuItem: JQuery) => void;
    children?: Array<ChatMenuItem>;
}
declare class ChatMenu {
    private box;
    private menus;
    /**
     *
     */
    constructor(box: JQuery, menus?: Array<ChatMenuItem>);
    private events;
    private menuMap;
    bindEvent(): void;
    clickLi(li: JQuery): void;
    addMenu(menu: ChatMenuItem | any): this;
    show(x: number, y: number): this;
    hide(): void;
    refresh(): void;
    private getMenuHtml(menus);
    private getMenuItemHtml(menu);
    private cleanMenuList(menus?);
    on(event: string, callback: Function): this;
    hasEvent(event: string): boolean;
    trigger(event: string, ...args: any[]): any;
}
declare class ChatAddUserBox {
    box: JQuery;
    private parent;
    /**
     *
     */
    constructor(box: JQuery, parent: ChatRoom);
    show(): void;
}
declare class ChatUserInfoBox {
    box: JQuery;
    private parent;
    /**
     *
     */
    constructor(box: JQuery, parent: ChatRoom);
    show(): void;
}
declare class ChatSearchBox {
    box: JQuery;
    private parent;
    /**
     *
     */
    constructor(box: JQuery, parent: ChatRoom);
    /**
     * bindEvent
     */
    bindEvent(): void;
    show(): void;
}
declare class ChatEditor {
    box: JQuery;
    private parent;
    constructor(box: JQuery, parent: ChatMessageBox);
    insertHtmlAtCaret(html: string): void;
}
declare class ChatMessageBox {
    box: JQuery;
    private parent;
    /**
     *
     */
    constructor(box: JQuery, parent: ChatRoom);
    editor: ChatEditor;
    refresh(): void;
    /**
     * bindEvent
     */
    bindEvent(): void;
}
declare class ChatUserBox {
    box: JQuery;
    private parent;
    /**
     *
     */
    constructor(box: JQuery, parent: ChatRoom);
    menu: ChatMenu;
    refresh(): void;
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
