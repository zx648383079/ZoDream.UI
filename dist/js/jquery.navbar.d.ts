/// <reference types="jquery" />
/// <reference types="jquery" />
declare enum TargetMode {
    tab = 0,
    self = 1,
    blank = 2,
    window = 3
}
interface NavbarOption {
    data?: {
        [id: string]: any;
    };
    bottom?: {
        [id: string]: any;
    };
    tab?: JQuery;
    default?: string;
}
declare class NavbarDefaultOption implements NavbarOption {
}
interface TabOption {
    active: (NavItem: any) => void;
}
declare class NavItem {
    name: string;
    ico?: string;
    url: string;
    children?: {
        [id: string]: NavItem;
    };
    target: TargetMode;
    id?: string;
    image?: string;
    constructor(name: string, ico?: string, url?: string, children?: {
        [id: string]: NavItem;
    }, target?: TargetMode, id?: string, image?: string);
    element: JQuery;
    ul: JQuery;
    getChild(allId: string[]): NavItem;
    addItem(id: string, item: NavItem): this;
    removeItem(id: string): this;
    remove(): void;
    addActive(): this;
    active(id?: string[] | string): this;
    render(id: string): JQuery;
    private _addUl;
    private _renderChildren;
    private _renderChild;
    clone(): NavItem;
    static parse(data: Object): NavItem;
}
declare class Tab {
    element: JQuery;
    option: TabOption;
    constructor(element: JQuery, option: TabOption);
    private _data;
    private _head;
    private _body;
    private _bindEvent;
    setProperty(): void;
    addItem(item: NavItem): void;
    hasItem(item: NavItem | string): boolean;
    removeItem(index: number | string): void;
    showItem(index: number | string | NavItem): void;
    private _getIndexById;
    private _setHistory;
}
declare class Navbar {
    element: JQuery;
    constructor(element: JQuery, option?: NavbarOption);
    option: NavbarOption;
    tab: Tab;
    private _bottom;
    private _top;
    /**
     * 绑定事件
     */
    private _bindEvent;
    private _setProperty;
    open(path: string | string[], isTop?: boolean): void;
    openItem(item: NavItem): void;
    refresh(): void;
    addItem(path: string, item: NavItem | any): void;
    removeItem(path: string | string[], isTop?: boolean): this;
    /**
     *
     * @param path
     * @param isTop
     */
    getItem(path: string | string[], isTop?: boolean): NavItem;
    /**
     * 路径转换成Id
     * @param path
     */
    private _pathToId;
    private _addItem;
}
