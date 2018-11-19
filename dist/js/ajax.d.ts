declare enum AjaxType {
    JSON = 0,
    XML = 1,
    TEXT = 2
}
declare enum AjaxMethod {
    GET = 0,
    POST = 1
}
declare class Ajax {
    static request(option: AjaxOption): any;
    static parser(type: AjaxType, xhr: XMLHttpRequest): any;
    static createXMLHttpRequest(): XMLHttpRequest;
    static filter(data: any): any;
    static each(data: any, callback: (key: number | string, item: any) => any): void;
    static upload(option: AjaxOption): void;
    static webSocket(url: string, message: (ev: Event) => any, open?: (ev: Event) => any, close?: (ev: Event) => any, error?: (ev: Event) => any): WebSocket;
}
interface AjaxOption {
    url: string;
    onComplete?: Function;
    onRunning?: (xhr?: XMLHttpRequest) => any;
    onProgress?: (ev: ProgressEvent) => any;
    success?: (data: any, text: string) => any;
    type?: AjaxType;
    error?: (status: number, readyState: number, xhr: XMLHttpRequest) => any;
    data?: any;
    method?: AjaxMethod;
    async: boolean;
    user?: string;
    password?: string;
}
declare class Url {
    source: string;
    constructor(source?: string);
    scheme: string;
    host: string;
    user: string;
    password: string;
    port: number;
    data: Object;
    static parserData(arg: string): Object;
    static getData(args: any): string;
    private static filterValue;
    fragment: string;
    path: string;
    getHost(): string;
    toString(): string;
}
