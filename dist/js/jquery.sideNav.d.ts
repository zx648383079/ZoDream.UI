/// <reference types="jquery" />
declare class SideNav {
    element: JQuery;
    constructor(element: JQuery, option?: SideNavOption);
    option: SideNavOption;
    box: JQuery;
    /**
     * init
     */
    init(): void;
    private _bindEvent();
    private _initBox();
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
    speed?: number;
    easing?: string;
    target?: string;
}
declare class SideNavDefaultOption implements SideNavOption {
    maxLength: number;
    fixedTop: number;
    speed: number;
    easing: string;
}
