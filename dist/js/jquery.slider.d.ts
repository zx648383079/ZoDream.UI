/// <reference types="jquery" />
/// <reference types="jquery" />
declare abstract class Eve {
    options: any;
    on(event: string, callback: Function): this;
    hasEvent(event: string): boolean;
    trigger(event: string, ...args: any[]): any;
}
declare class Point {
    index: number;
    width?: number;
    height?: number;
    constructor(index: number, x: number | JQuery, width?: number, height?: number);
    x: number;
    elements: Array<JQuery>;
    /**
     * 取元素的x
     * @param width
     */
    getLeft(width: number, align: string): number;
    /**
     * 获取元素的宽和高
     */
    getElementWidthAndHeight(): [number, number];
    /**
     * 应用当前的宽和高
     */
    applyWidthAndHeight(keepScale?: boolean): void;
}
declare class SliderItem extends Eve {
    element: JQuery;
    constructor(element: JQuery, options: SliderOptions);
    options: SliderOptions;
    private _data;
    private _length;
    private _index;
    private _box;
    private _time;
    private _lastWidth;
    private getItemWidth;
    private getItemHeight;
    private _timeCallback;
    private _extendOption;
    private bindResize;
    /**
     * 初始化只有一张
     */
    private _initOnly;
    /**
     * 设置一张图的高度
     * @param item
     */
    private _resetOnly;
    private _needMove;
    private _copyItem;
    private _init;
    private _bindEvent;
    /**
     * 获取配置
     * @param name
     */
    private _getOption;
    private _getWidth;
    private _setTime;
    /**
     * 添加跳转点
     * @param count
     */
    private _addListPoint;
    /**
     * 浏览器尺寸变化
     */
    resize(): void;
    private _applySize;
    get index(): number;
    set index(index: number);
    /**
     * 下一个
     */
    next(): void;
    /**
     * 上一个
     */
    previous(): void;
    /**
     * 获取起始点和终点
     * @param index
     */
    private _getPoint;
    /**
     * 跳转
     * @param index
     */
    goto(index: number): void;
    private _changePoint;
    private _showPoint;
    private _movePoint;
    /**
     * 移动动画及回调
     * @param left
     * @param callback
     */
    private _goAndCallback;
    run(): void;
}
/*!
 * jquery.slider - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
declare class Slider {
    element: JQuery;
    constructor(element: JQuery, options?: SliderOptions);
    options: SliderOptions;
    private _data;
    private _timer;
    addItem(item: SliderItem | JQuery): void;
    /**
     * 倒序循环
     * @param callback 返回false 结束循环，返回 true 删除
     * @param i 初始值
     */
    map(callback: (item: SliderItem, index: number) => any, i?: number | number[]): void;
    private _runTimer;
    private _cancelTimer;
}
interface SliderOptions {
    item?: string;
    box?: string;
    width?: number | {
        [w: number]: number;
    };
    height?: number;
    spacetime?: number;
    animationtime?: number;
    animationmode?: string;
    previous?: string;
    next?: string;
    haspoint?: boolean;
    pointevent?: string;
    auto?: boolean;
    align?: string;
    onchange?: (start: Point, end: Point) => any;
}
declare class SliderDefaultOptions implements SliderOptions {
    item: string;
    spacetime: number;
    animationtime: number;
    animationmode: string;
    previous: string;
    next: string;
    haspoint: boolean;
    pointevent: string;
    auto: boolean;
    align: string;
}
