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
