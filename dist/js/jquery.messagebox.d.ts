/// <reference types="jquery" />
declare class MessageBox {
    element: JQuery;
    constructor(element: JQuery, option?: MessageBoxOptions);
    option: MessageBoxOptions;
    addMoveEvent(): void;
    addCloseEvent(): void;
    static tip(content: string, time?: number): void;
    static notify(content: string, width?: number, time?: number): void;
    static timer(callback: Function, time?: number): void;
}
interface MessageBoxOptions {
    titleTag?: string;
    minTag?: string;
    closeTag?: string;
}
declare class MessageBoxDefaultOptions implements MessageBoxOptions {
    titleTag: string;
    minTag: string;
    closeTag: string;
}
