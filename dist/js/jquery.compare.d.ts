/// <reference types="jquery" />
/// <reference types="jquery" />
declare class Compare {
    element: JQuery;
    option?: CompareOption;
    constructor(element: JQuery, option?: CompareOption);
    private _dialog;
    private _cookieName;
    private _items;
    private _count;
    private _data;
    init(): void;
    map(callback: (item: any) => any): void;
    addItem(data: any): void;
    private _bindEvent;
    private _showData;
    private _getLiHtml;
    removeItem(item: JQuery | number): void;
    private _setCookie;
    removeAll(): void;
}
interface CompareOption {
    max?: number;
    onClick?: (element: JQuery) => any;
    onChange?: (data: Array<any>) => any;
}
