/// <reference types="jquery" />
/*!
 * jquery.carousel - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
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
    private _addEvent;
    private _copyItem;
    private _init;
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
