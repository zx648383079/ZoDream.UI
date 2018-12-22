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
declare class Scene {
    private fps;
    stage: Stage;
    setFPS(fps: number): void;
    /**
     * init
     */
    init(): void;
    update(): void;
    /**
     * destory
     */
    destory(): void;
}
declare class Sprite {
}
declare class Stage {
    /**
     *
     */
    constructor(element: HTMLCanvasElement | string);
    canvas: Storyboard;
    scene: Scene;
    /**
     * init
     */
    init(): void;
    /**
     * nevigate
     */
    nevigate(scene: Scene): void;
}
declare class Storyboard {
    canvas: HTMLCanvasElement;
    constructor(canvas: HTMLCanvasElement);
    context: CanvasRenderingContext2D;
    clear(): this;
    draw(ctx: Storyboard): boolean;
    /**
     * fullScreen
     */
    fullScreen(): this;
    static create(width: number, height: number): Storyboard;
    static parse(element: HTMLCanvasElement | string): Storyboard;
}
declare class MainScene extends Scene {
}
declare class MainStage extends Stage {
    constructor(element: HTMLCanvasElement | string);
    /**
     * init
     */
    init(): void;
}
declare class SnowSprite {
    /**
     * draw
     */
    draw(ctx: Storyboard): void;
}
