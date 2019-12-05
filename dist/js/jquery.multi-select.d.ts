/// <reference types="jquery" />
/**
 * 缓存数据
 */
declare class CacheUrl {
    /**
     * 缓存的数据
     */
    private static _cacheData;
    /**
     * 缓存的事件
     */
    private static _event;
    static hasData(url: string): boolean;
    static hasEvent(url: string): boolean;
    static addEvent(url: string, callback: (data: any) => void): void;
    /**
     * 获取数据通过回调返回
     * @param url
     * @param callback
     */
    static getData(url: string, callback: (data: any) => void): void;
    /**
     * 设置数据并回调
     * @param url
     * @param data
     */
    static setData(url: string, data: any): void;
}
declare abstract class Eve {
    options: any;
    on(event: string, callback: Function): this;
    hasEvent(event: string): boolean;
    trigger(event: string, ...args: any[]): any;
}
/*!
 * jquery.city - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
declare class MultiSelect extends Eve {
    element: JQuery;
    constructor(element: JQuery, options?: MultiSelectOptions);
    options: MultiSelectOptions;
    private _index;
    private _val;
    get val(): string;
    set val(arg: string);
    private _selectedPath;
    protected init(): void;
    /**
     * 获取生成标签的头和身体
     */
    private _getHtml;
    /**
     * 获取一个数据的id和显示的文字
     * @param item
     * @param i
     */
    private _getIdAndName;
    private _create;
    private _bindEvent;
    bodyMap(callback: (id: string, name: string, index: number) => any, index?: number): void;
    /**
     * 加载下一页不进行选择
     */
    selected(id?: string | number, index?: number): this;
    private _getNextData;
    /**
     * 选中并触发加载下一页 不进行自动关闭
     */
    selectedId(id: string | number, index?: number): void;
    addElement(data: any, title?: string, selected?: string | number): this;
    remove(start?: number): this;
    map(callback: (id: string, name: string, index: number) => any): this;
    text(link?: string): string;
    lastText(): string;
    all(): Array<string>;
    change(callback: (id?: string | number, index?: number, selected?: string | number) => any): this;
    done(callback: Function): this;
    /**
     * 根据ID查找无限树的路径
     * @param id
     */
    getPath(id: string): Array<string>;
}
interface MultiSelectOptions {
    [setting: string]: any;
    default?: string;
    data?: any;
    onchange?: () => any;
    ondone?: Function;
    id?: string;
    name?: string;
    tag?: string;
    children?: string;
}
declare class MultiSelectDefaultOptions implements MultiSelectOptions {
    id: string;
    name: string;
    children: string;
}
