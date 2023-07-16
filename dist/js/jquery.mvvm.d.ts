/// <reference types="jquery" />
/// <reference types="jquery" />
declare class Mvvm {
    element: JQuery;
    option: MvvmOption;
    constructor(element: JQuery, option: MvvmOption);
    _data: any;
    _render: () => string;
    _proxy(key: any): void;
    _defineReactive(key: string, value?: any): void;
    compiler(): void;
}
interface MvvmOption {
    data: any;
    render: () => string;
}
