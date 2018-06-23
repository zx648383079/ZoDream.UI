/// <reference types="jquery" />
declare class Grid {
    element: JQuery;
    constructor(element: JQuery, options?: GridOptions);
    options: GridOptions;
    refresh(): void;
    refreshOne(element: JQuery): void;
}
declare class Size {
    option: Object;
    constructor(width: number | Object | string, height?: number | string, option?: Object);
    setSize(element: JQuery, width?: number): void;
    static parseNumber(num: number | string): number;
    static parse(obj: Object | Array<string | number> | Size): Size;
}
interface GridOptions {
    tag?: string;
    data?: Object | Array<Size | Object>;
}
declare class GridDefaultOptions implements GridOptions {
    tag: 'img';
}
