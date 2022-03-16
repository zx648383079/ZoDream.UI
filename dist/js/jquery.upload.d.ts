/// <reference types="jquery" />
declare abstract class Eve {
    options: any;
    on(event: string, callback: Function): this;
    hasEvent(event: string): boolean;
    trigger(event: string, ...args: any[]): any;
}
/*!
 * jquery.upload - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
/**
 * EXAMPLE:
 * $('#upload').upload({
 *      url: 'upload.php',
 *      name: 'file',
 *      template: '{url}',
 *      grid: '.img'
 * });
 */
declare class Upload extends Eve {
    element?: JQuery;
    constructor(element?: JQuery, option?: UploadOption);
    options: UploadOption;
    success: (data: any, currentElement: JQuery) => boolean;
    getElement: (tag: string, currentElement: JQuery) => JQuery;
    private currentElement;
    addEvent(): void;
    start(currentElement?: JQuery): void;
    uploadFiles(files: FileList): void;
    uploadMany(files: FileList): void;
    uploadOne(file: File): void;
    uploadForm(data: FormData, cb?: (data: any) => void): void;
    formatFileSize(fileSize: number): string;
    sliceUpload(file: File, cb?: (data: any, currentElement: JQuery) => void): void;
    /** 图片压缩 start  */
    photoCompress(file: File, options: any, cb: (data: string) => void): void;
    private _canvasDataURL;
    /**
     * 将以base64的图片url数据转换为Blob
     * @param urlData
     *            用url方式表示的base64图片数据
     */
    convertBase64UrlToBlob(urlData: string): Blob;
    /** 压缩处理end  */
    deal(data: any): void;
    getData(): any;
    replace(data: Object): string;
}
interface UploadOption {
    [setting: string]: any;
    url?: string;
    name?: string;
    isAppend?: boolean;
    template?: string | Function;
    grid?: string;
    data?: any;
    timeout?: number;
    removeTag?: string;
    removeCallback?: (eventObject: JQuery.Event, ...eventData: any[]) => any;
    multiple?: boolean;
    fileClass?: string;
    filter?: string;
    ondealfile?: (file: File) => FormData | void;
    ondealfiles?: (file: FileList) => FormData | void;
    onbefore?: (data: FormData, currentElement: JQuery) => any;
    onafter?: (data: any, currentElement: JQuery) => any;
    onsuccess?: (data: any, currentElement: JQuery) => boolean;
    dynamic?: boolean;
    getElement?: (tag: string, currentElement: JQuery) => JQuery;
    onprogress?: (data: any) => void;
    allowMultiple?: boolean;
}
declare class UploadDefaultOption implements UploadOption {
    [setting: string]: any;
    name: string;
    isAppend: boolean;
    template: string;
    removeTag: string;
    removeCallback: (eventObject: JQuery.Event, ...eventData: any[]) => any;
    multiple: boolean;
    allowMultiple: boolean;
    data: any;
    fileClass: string;
    filter: string;
    onafter: (data: any) => any;
    dynamic: boolean;
    getElement: (tag: string, currentElement: JQuery) => JQuery;
}
