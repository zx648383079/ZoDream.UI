/*!
 * jquery.lazyload - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
/// <reference types="jquery" />
declare enum LazyMode {
    once = 0,
    every = 1
}
declare class LazyItem {
    element: JQuery;
    callback: Function;
    mode: LazyMode;
    diff: number | Function;
    constructor(element: JQuery, callback: Function, mode?: LazyMode, diff?: number | Function);
    private _lastHeight;
    /**
     * 重新刷新
     */
    refresh(): void;
    /**
     * 判断能否执行
     * @param height
     * @param bottom
     */
    canRun(height: number, bottom: number): boolean;
    run(height: number, bottom: number): boolean;
}
declare class Lazy {
    element: JQuery;
    constructor(element: JQuery, options?: LazyOptions);
    options: LazyOptions;
    private _data;
    /**
     * 页面滚动触发更新
     */
    scrollInvote(): void;
    run(height: number, bottom: number): void;
    private _init;
    /**
     * 全局方法集合
     */
    static methods: {
        [name: string]: Function;
    };
    /**
     * 添加方法
     * @param name
     * @param callback
     */
    static addMethod(name: string, callback: Function): void;
    /**
     * 获取方法
     * @param name
     */
    static getMethod(name: string): Function;
}
interface LazyOptions {
    [setting: string]: any;
    data?: {
        [tag: string]: string | Object;
    } | Array<Object> | Array<Lazy>;
    tag?: string | JQuery;
    callback?: string | Function;
    mode?: LazyMode;
    diff?: number | Function;
}
declare class LazyDefaultOptions implements LazyOptions {
    mode: LazyMode;
    diff: number;
}
