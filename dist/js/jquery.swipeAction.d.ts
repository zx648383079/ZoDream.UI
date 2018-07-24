/// <reference types="jquery" />
declare enum SwipeMode {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
}
interface Point {
    x: number;
    y: number;
}
declare class SwipeAction {
    element: JQuery;
    constructor(element: JQuery, options?: SwipeActionOption);
    options: SwipeActionOption;
    private _currentMode;
    private _leftWidth;
    private _rightWidth;
    refresh(): this;
    private _bindEvent();
    touchEnd(distance: number): this;
    touchMove(x: number): this;
    mode(mode: SwipeMode): this;
    left(x: number): this;
}
interface SwipeActionOption {
    leftBox?: string;
    rightBox?: string;
}
declare class SwipeActionDefaultOption implements SwipeActionOption {
    leftBox: string;
    rightBox: string;
}
