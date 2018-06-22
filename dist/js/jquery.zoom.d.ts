/// <reference types="jquery" />
declare class Zoom {
    element: JQuery;
    constructor(element: JQuery, option?: ZoomOption);
    option: ZoomOption;
    private _mBox;
    private _li;
    private _index;
    index: number;
    private _initMBox();
    private _initLeft();
    private _initRight();
    private _bindEvent();
    previous(): void;
    next(): void;
    static iTi(abservable: number, reltive: number): number;
}
declare class ZoomBox {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    opacity: number;
    constructor(x?: number, y?: number, z?: number, width?: number, height?: number, opacity?: number);
    apple(element: JQuery, option: ZoomOption): void;
    toNext(option: ZoomOption, ltr?: boolean): ZoomBox;
    private _getSpace(space);
}
interface ZoomOption {
    scale?: number;
    maxWidth?: number;
    maxHeight?: number;
    space?: number;
    spaceTime?: number;
    animationTime?: number;
    animationMode?: string;
    opacity?: number;
    item?: string;
    previous?: string;
    next?: string;
    auto?: boolean;
}
declare class ZoomDefaultOption implements ZoomOption {
    scale: number;
    space: number;
    spaceTime: number;
    animationTime: number;
    animationMode: string;
    item: string;
    previous: string;
    next: string;
    auto: boolean;
}
