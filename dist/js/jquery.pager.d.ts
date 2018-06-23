/// <reference types="jquery" />
declare class Pager {
    element: JQuery;
    constructor(element: JQuery, option?: PagerOption);
    option: PagerOption;
    private _data;
    index: number;
    total: number;
    length: number;
    paginate(page?: number): void;
    previous(): void;
    next(): void;
    change(index?: number | string, total?: number | string): void;
    refresh(): void;
    private _initPage;
    private _addHtml;
    private _replace;
}
interface PagerOption {
    total?: number;
    length?: number;
    page?: string;
    current?: string;
    label?: string;
    paginate?: (page: number, pager: Pager) => any;
}
declare class PagerDefaultOption implements PagerOption {
    total: number;
    length: number;
    page: string;
    current: string;
    label: string;
}
