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
declare class SelectBox extends Eve {
    element: JQuery;
    constructor(element: JQuery, options?: SelectBoxOptions);
    options: SelectBoxOptions;
    box: JQuery;
    private _index;
    private _real_index;
    private _ulBox;
    private _init;
    private _bindEvent;
    /**
     * 滑动
     * @param distance
     * @param isUp
     * @param x
     */
    touchMove(distance: number, isUp?: boolean, x?: number): this;
    show(): this;
    hide(): this;
    restore(): this;
    refresh(): this;
    applyValue(val: any): this;
    /**
* 根据ID查找无限树的路径
* @param id
*/
    getPath(id: string): Array<number>;
    private _createUl;
    private _getBoxClass;
    private _getOptionByIndex;
    private _getColumnOption;
    private _getChildren;
    private _refreshUl;
    refreshColumn(column?: number): this;
    private _createOptionHtml;
    /**
     * 获取一个数据的id和显示的文字
     * @param item
     * @param i
     */
    private _getValueAndText;
    selected(option: JQuery | number, column?: number): this;
    selectedIndex(index?: number, column?: number): this;
    selectedValue(id: number | string, column?: number): this;
    selectedOption(option: JQuery, column?: number): this;
    val(): any;
    mapSelected(cb: (option: JQuery, index: number) => any): this;
    getSelectedOption(index?: number): JQuery<HTMLElement>;
    notify(): this;
}
interface SelectBoxOptions {
    title?: string;
    data?: any;
    default?: string | number;
    column?: number;
    textTag?: string;
    valueTag?: string;
    childrenTag?: string;
    lineHeight?: number;
    onclick?: (item: string, element: JQuery) => any;
    ondone?: (val: string | number, text: string, option: JQuery, index: number) => any;
}
declare class SelectBoxDefaultOptions implements SelectBoxOptions {
    title: string;
    column: number;
    textTag: string;
    valueTag: string;
    childrenTag: string;
    lineHeight: number;
}
declare class SelectElemnt {
    element: JQuery;
    constructor(element: JQuery);
    selectInput: JQuery;
    box: SelectBox;
    private _init;
    private _getOptions;
    refresh(): this;
    private _getTitle;
}
