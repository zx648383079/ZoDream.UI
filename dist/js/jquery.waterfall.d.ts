/// <reference types="jquery" />
/// <reference types="jquery" />
interface IWaterFallOption {
    items?: string[] | IWaterFallImageSource[] | IWaterFallSource[] | IWaterFallSizeSource[];
    min: number;
    gap: number;
    render?: (item: IBound) => HTMLElement;
}
interface IWaterFallSizeSource {
    width: number;
    height: number;
}
interface IWaterFallSource {
    originalWidth: number;
    originalHeight: number;
}
interface IWaterFallImageSource extends IWaterFallSource {
    src: string;
}
interface IWaterFallImage extends IWaterFallSource {
    src?: string;
    image?: HTMLImageElement;
}
interface IWaterFallRang {
    y: number;
    x: number;
    width: number;
}
interface IBound extends IWaterFallRang {
    height: number;
}
interface IWaterFallItem extends IWaterFallImage, IBound {
    scale: number;
}
declare class HorizontalBar {
    max: number;
    gap: number;
    constructor(max: number, gap: number, items?: IBound[]);
    private items;
    /**
     * 返回去除了边框的可以用
     */
    get minRang(): IWaterFallRang;
    get bottom(): number;
    leftHeight(rang: IWaterFallRang): number;
    rightHeight(rang: IWaterFallRang): number;
    push(rect: IBound): void;
    reset(items?: IBound[]): void;
    private isFullLine;
    private compareX;
    private computedWidth;
    private computedHeight;
}
declare class WaterFall {
    private container;
    private option;
    constructor(container: JQuery<HTMLDivElement>, option: IWaterFallOption);
    private items;
    private bar;
    push(items: IWaterFallImage[]): void;
    preload(items: string[], cb: (items: IWaterFallImage[]) => void): void;
    resize(): void;
    private bindEvent;
    private renderItem;
    private randomColor;
    private computed;
}
