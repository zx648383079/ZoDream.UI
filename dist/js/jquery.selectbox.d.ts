/// <reference types="jquery" />
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
    ondone?: (val: any, option: JQuery, index: number) => any;
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
