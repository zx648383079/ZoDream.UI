/// <reference types="jquery" />
declare class Region {
    element: JQuery;
    constructor(element: JQuery, option?: RegionOption);
    option: RegionOption;
    selectList: Array<JQuery>;
    map(callback: (ele: JQuery, i: number, count: number) => any, start?: number): void;
    init(): void;
    val: Array<string | number>;
    eq(i: number): JQuery;
    getOptionData(i: number): any;
    getOptionTip(i: number): string;
    showOption(element: JQuery, i: number): void;
    getSelectHtml(data: any, selected?: number | string, defaultLabel?: string, selectedCallback?: Function): string;
    getOptionHtml(id: string | number, text: string, isSelected?: boolean): string;
}
interface RegionOption {
    default?: Array<string>;
    data?: any;
    tips?: string | Array<string>;
}
declare class RegionDefaultOption implements RegionOption {
    data: string;
    tips: string;
}
