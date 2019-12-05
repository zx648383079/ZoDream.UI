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
declare class SelectBox extends Eve {
    element: JQuery;
    constructor(element: JQuery, options?: SelectBoxOptions);
    options: SelectBoxOptions;
    box: JQuery;
    private _index;
    private _real_index;
    private _ulBox;
    private booted;
    private _init;
    private _bindEvent;
    private triggerChange;
    /**
     * 滑动
     * @param distance 距离的绝对值
     * @param isUp 是否是上滑
     * @param x 触发的位置，自动定位到第几级
     */
    touchMove(distance: number, isUp?: boolean, x?: number): this;
    /**
     * 显示
     */
    show(): this;
    /**
     * 隐藏并重置
     */
    hide(): this;
    /**
     * 重置
     */
    restore(): this;
    /**
     * 刷新
     */
    refresh(): this;
    /**
     * 根据值自动选中
     * @param val
     */
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
    drawColum(data: any, index: number): void;
    /**
     * 刷新第几级的数据
     * @param column 第几级
     */
    refreshColumn(column?: number): this;
    private _createOptionHtml;
    /**
     * 获取一个数据的id和显示的文字
     * @param item
     * @param i
     */
    private _getValueAndText;
    /**
     * 选中哪一个
     * @param option
     * @param column  第几级
     */
    selected(option: JQuery | number, column?: number): this;
    /**
     * 选中第几行
     * @param index 行号 0 开始
     * @param column 第几级
     */
    selectedIndex(index?: number, column?: number): this;
    /**
     * 选中哪个值
     * @param id 值
     * @param column  第几级
     */
    selectedValue(id: number | string, column?: number): this;
    /**
     * 选中哪一行
     * @param option 行元素
     * @param column 第几级
     */
    selectedOption(option: JQuery, column?: number): this;
    /**
     * 获取当前的选中值 一级是单个值，多级是值的集合
     */
    val(): any;
    /**
     * 循环所有选中的项
     * @param cb (option: JQuery, index: number) => any
     */
    mapSelected(cb: (option: JQuery, index: number) => any): this;
    /**
     * 获取当前选中的选项
     * @param column 第几级
     */
    getSelectedOption(column?: number): JQuery<HTMLElement>;
    /**
     * 触发通知
     */
    notify(): this;
    /**
     * range
     */
    range(start: number, end: number, step?: number): number[];
}
interface SelectBoxOptions {
    title?: string;
    data?: any;
    default?: string | number;
    column?: number;
    textTag?: string;
    valueTag?: string;
    childrenTag?: string;
    createOption?: (item: any, key: string | number) => string;
    lineHeight?: number;
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
    /**
     * 刷新更新数据选项
     */
    refresh(): this;
    private _getTitle;
}
