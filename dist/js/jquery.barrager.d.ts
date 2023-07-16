/// <reference types="jquery" />
/// <reference types="jquery" />
declare class Darrager {
    element: JQuery;
    constructor(element: JQuery, options?: DarragerOptions);
    options: DarragerOptions;
    private _init;
    private _createElement;
    private _bindEvent;
    /**
     * remove
     */
    remove(): void;
}
interface DarragerOptions {
    img?: string;
    url?: string;
    content?: string;
    close?: boolean;
    bottom?: number;
    max?: number;
    speed?: number;
    color?: string;
}
declare class DarragerDefaultOptions implements DarragerOptions {
    close: boolean;
    bottom: number;
    max: number;
    speed: number;
    color: string;
}
