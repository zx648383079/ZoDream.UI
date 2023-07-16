/// <reference types="jquery" />
/// <reference types="jquery" />
declare class Fly {
    element: JQuery;
    constructor(element: JQuery, options?: FlyOptions);
    options: FlyOptions;
    setOptions(options: any): void;
    play(): void;
    move(): void;
    destroy(): void;
}
interface FlyOptions {
    autoPlay?: boolean;
    vertex_Rtop?: number;
    speed?: number;
    start?: any;
    end?: any;
    onEnd?: Function;
    count?: number;
    steps?: number;
    curvature?: number;
    vertex_top?: number;
    vertex_left?: number;
}
declare class FlyDefaultOptions implements FlyOptions {
    autoPlay: boolean;
    vertex_Rtop: number;
    speed: number;
}
