/// <reference types="jquery" />
declare module ZUtils {
    class time {
        /**
         * 获取真实的月份
         */
        static getRealMonth(date: Date): number;
        /**
         * 格式化日期
         */
        static format(date: Date, fmt?: string): string;
    }
    class str {
        static format(arg: string, ...args: any[]): string;
    }
}
declare class FilterBox {
    element: JQuery;
    constructor(element: JQuery, options: FilterOption);
    options: FilterOption;
    private _selectedProperty;
    refresh(): void;
    createHtml(): string;
    private _createSelectedHtml();
    private _createPropertiesHtml();
    private _createPropertyHtml(attr);
    private _createCommonPropertyHtml(attr);
    private _createRangePropertyHtml(attr);
    private _createSearchHtml();
    private _createSortHtml();
}
interface FilterOption {
    properties?: any;
    sorts?: any;
    data?: any;
}
declare class FilterDefaultOption implements FilterOption {
}
