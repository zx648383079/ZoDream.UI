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
    private _length;
    private _ulBox;
    private _init;
    private _bindEvent;
    show(): this;
    hide(): this;
    refresh(): this;
    selected(option: JQuery | number): this;
    selectedIndex(index?: number): this;
    selectedValue(id: number | string): this;
    selectedOption(option: JQuery): this;
    val(): string;
    notify(): this;
}
interface SelectBoxOptions {
    title?: string;
    data?: any;
    default?: string | number;
    textTag?: string;
    valueTag?: string;
    onclick?: (item: string, element: JQuery) => any;
    ondone?: (val: any, option: JQuery, index: number) => any;
}
declare class SelectBoxDefaultOptions implements SelectBoxOptions {
    title: string;
    textTag: string;
    valueTag: string;
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
