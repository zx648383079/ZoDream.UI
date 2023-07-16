/// <reference types="jquery" />
/// <reference types="jquery" />
declare class SideNav {
    element: JQuery;
    constructor(element: JQuery, option?: SideNavOption);
    option: SideNavOption;
    box: JQuery;
    headers: Array<JQuery>;
    private _offsets;
    private _scrollHeight;
    private _activeId;
    private _window;
    /**
     * init
     */
    init(): void;
    private _bindEvent;
    private _getScrollTop;
    private _getScrollHeight;
    private _getOffsetHeight;
    /**
     * refresh
     */
    refresh(): void;
    /**
     * setActive
     */
    setActive(): void;
    private _clear;
    private _initBox;
    fixed(): void;
    /**
     * scrollTo
     */
    scrollTo(target: any, callback?: any): void;
    /**
     * getHeaders
     */
    getHeaders(): void;
}
interface SideNavOption {
    maxLength?: number;
    fixedTop?: number;
    maxFixedTop?: Function | number;
    speed?: number;
    easing?: string;
    target?: string;
    active?: string;
    offset?: number;
    title?: string;
    contentLength?: number;
}
declare class SideNavDefaultOption implements SideNavOption {
    maxLength: number;
    fixedTop: number;
    speed: number;
    easing: string;
    active: string;
    offset: number;
    title: string;
    contentLength: number;
}
