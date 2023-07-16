/// <reference types="jquery" />
/// <reference types="jquery" />
declare class SliderItem {
    element: JQuery;
    options: BoxSliderOptions;
    constructor(element: JQuery, options: BoxSliderOptions);
    height: number;
    private _boxHeight;
    minHeight: number;
    private _top;
    private _box;
    private _time;
    status: boolean;
    maxHeight: number;
    private _animation;
    private _init;
    refresh(): void;
    run(): void;
    /**
     * 设置移动距离和循环距离
     * @param min
     * @param max
     */
    setMinAndMax(min: number, max?: number): this;
    play(): void;
    stop(): void;
    private _setTime;
    /**
     * 下一个
     */
    next(): void;
    /**
     * 移动动画及回调
     * @param left
     * @param callback
     */
    private _goAndCallback;
}
declare class BoxSlider {
    element: JQuery;
    constructor(element: JQuery, options?: BoxSliderOptions);
    options: BoxSliderOptions;
    private _data;
    private _timer;
    private _timeCallback;
    private _init;
    private _startTimer;
    private _runTimer;
    private _cancelTimer;
    /**
     * 倒序循环
     * @param callback 返回false 结束循环，返回 true 删除
     * @param i 初始值
     */
    map(callback: (item: SliderItem, index: number) => any, i?: number | number[]): void;
    play(...index: number[]): void;
    stop(...index: number[]): void;
}
interface BoxSliderOptions {
    spaceTime?: number;
    animationTime?: number;
    animationMode?: string;
    auto?: boolean;
    itemTag?: string;
    refresh?: boolean;
}
declare class BoxSliderDefaultOptions implements BoxSliderOptions {
    spaceTime: number;
    animationTime: number;
    animationMode: string;
    auto: boolean;
    itemTag: string;
    refresh: boolean;
}
