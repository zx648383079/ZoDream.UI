class Storyboard {

    constructor(
        public canvas: HTMLCanvasElement
    ) {
        this.context = this.canvas.getContext('2d');
    }

    public context: CanvasRenderingContext2D;













    public clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return this;
    }

    public draw(ctx: Storyboard): boolean {
        ctx.context.drawImage(this.canvas, 0, 0);
        return true;
    }

    public static create(width: number, height: number): Storyboard {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return new Storyboard(canvas);
    }

    public static parse(element: HTMLCanvasElement|string): Storyboard {
        return new Storyboard(typeof element == 'string' ? document.getElementById(element) as HTMLCanvasElement : element);
    }
}