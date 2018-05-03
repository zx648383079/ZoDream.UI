/// <reference types="jquery" />
declare class Carousel {
    element: JQuery;
    constructor(element: JQuery, options?: CarouselOptions);
    options: CarouselOptions;
    width: number;
    private _itemWidth;
    private _itemLength;
    private _left;
    private _handle;
    private _stopTime;
    left: number;
    private _box;
    private _addEvent();
    private _copyItem(items);
    private _init();
    next(range?: number): void;
    previous(range?: number): void;
    goto(index: number): void;
    goLeft(left: number, hasAnimate?: boolean): void;
    clone(obj: any): any;
}
interface CarouselOptions {
    range?: number;
    itemTag?: string;
    boxTag?: string;
    spaceTime?: number;
    animationTime?: string | number;
    animationMode?: string;
    previousTag?: string;
    nextTag?: string;
    thumbMode?: string;
}
declare class CarouselDefaultOptions implements CarouselOptions {
    itemTag: string;
    boxTag: string;
    spaceTime: number;
    animationTime: string | number;
    animationMode: string;
    previousTag: string;
    nextTag: string;
}
