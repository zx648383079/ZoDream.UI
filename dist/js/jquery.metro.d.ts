/// <reference types="jquery" />
declare class Metro {
    element: JQuery;
    constructor(element: JQuery, options?: MetroOptions);
    options: MetroOptions;
    private _elementList;
    private _width;
    private _smallWidth;
    columnCount: number;
    Width: number;
    refresh(): void;
    getSmallWidth(): number;
    getSpace(): number;
    getMiddleWidth(): number;
    getLargeWidth(): number;
    addMetro(...args: MetroItem[]): void;
    createElement(item: MetroItem): void;
    removeElement(): void;
}
declare class MetroElement {
    metro?: Metro;
    constructor(item?: MetroItem, metro?: Metro);
    element: HTMLElement;
    size: MetroSize;
    setSize(): MetroElement;
}
declare enum MetroSize {
    Small = 0,
    Middle = 1,
    Large = 2
}
declare class MetroItem {
    size: MetroSize;
    content: any;
}
interface MetroOptions {
    data: MetroItem[];
    space?: number;
    className?: string;
    maxSmallWith: number;
    createMetro?: (arg: MetroItem, metro: Metro) => HTMLElement;
}
declare class MetroDefaultOptions implements MetroOptions {
    data: MetroItem[];
    space: number;
    maxSmallWith: number;
    className: string;
    createMetro: (arg: MetroItem, metro: Metro) => HTMLDivElement;
}
