declare const vendors: Array<string>;
declare class Time {
    callback: Function;
    space: number;
    time: number;
    constructor(callback: Function, space?: number, time?: number);
    private _index;
    isActive: boolean;
    private _time;
    run(): void;
}
declare class Timer {
    constructor(callback?: Function, space?: number, time?: number);
    times: Array<Time>;
    isAuto: boolean;
    add(callback: Function, space?: number, time?: number): this;
    start(): void;
    private _loop;
    private _handle;
    stop(): void;
}
declare class Preloader {
    private static caches;
    static loadImg(name: string, url: string, cb?: Function): void;
    /**
     * get<T>
     */
    static get<T>(name: string): T;
}
declare class Scene implements ICanDraw {
    private fps;
    stage: Stage;
    children: Sprite[];
    canvas: Storyboard;
    setFPS(fps: number): void;
    /**
     * addChild
     */
    addChild(kid: Sprite): this;
    /**
     * init
     */
    init(): void;
    update(): void;
    draw(ctx: Storyboard): void;
    /**
     * destory
     */
    destory(): void;
}
interface ICanDraw {
    draw(ctx: Storyboard): any;
}
declare abstract class Sprite implements ICanDraw {
    draw(ctx: Storyboard): void;
}
declare class Stage {
    /**
     *
     */
    constructor(element: HTMLCanvasElement | string);
    canvas: Storyboard;
    scene: Scene;
    timer: Timer;
    /**
     * init
     */
    init(): void;
    /**
     * loop
     */
    loop(): void;
    /**
     * nevigate
     */
    nevigate(scene: Scene): void;
    /**
     * update
     */
    update(): void;
    /**
     * draw
     */
    draw(): void;
}
declare class Storyboard {
    canvas: HTMLCanvasElement;
    constructor(canvas: HTMLCanvasElement);
    context: CanvasRenderingContext2D;
    /**
     * width
     */
    width(): number;
    /**
     * height
     */
    height(): number;
    clear(): this;
    draw(image: HTMLImageElement | Storyboard | HTMLCanvasElement, x?: number, y?: number, ...args: number[]): boolean;
    /**
     * fullScreen
     */
    fullScreen(): this;
    static create(width: number | Storyboard, height?: number): Storyboard;
    static parse(element: HTMLCanvasElement | string): Storyboard;
}
interface ITime {
    time: number;
    count: number;
    handle: Function;
}
declare class MainScene extends Scene {
    /**
     * init
     */
    init(): void;
    private _time;
    private _wind;
    private createSprite;
    private getWind;
    update(): void;
}
declare class MainStage extends Stage {
    constructor(element: HTMLCanvasElement | string);
    /**
     * init
     */
    init(): void;
}
declare class SnowSprite {
    private maxWidth;
    private maxHeight;
    /**
     *
     */
    constructor(maxWidth: number, maxHeight: number);
    x: number;
    y: number;
    kind: number;
    size: number;
    speedX: number;
    speedY: number;
    deg: number;
    private image;
    /**
     * reset
     */
    reset(): void;
    update(windSpeed: number): void;
    /**
     * isOut
     */
    isOut(): boolean;
    /**
     * draw
     */
    draw(ctx: Storyboard): void;
}
