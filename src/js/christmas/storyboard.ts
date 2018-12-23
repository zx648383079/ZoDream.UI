class Storyboard {

    constructor(
        public canvas: HTMLCanvasElement
    ) {
        this.context = this.canvas.getContext('2d');
    }

    public context: CanvasRenderingContext2D;

    /**
     * width
     */
    public width() {
        return this.canvas.width;
    }

    /**
     * height
     */
    public height() {
        return this.canvas.height;
    }

    public clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return this;
    }

    public draw(image: HTMLImageElement|Storyboard|HTMLCanvasElement, x: number = 0, y: number = 0, ...args: number[]): boolean {
        const img = image instanceof Storyboard ? image.canvas : image;
        if (args.length >= 7) {
            let centerX = (args[2] + args[4]), centerY = (args[3] + args[5]);
            this.context.save();
            this.context.translate(centerX, centerY);
            this.context.rotate(args[6]);
            this.context.drawImage(img, x, y, args[0], args[1], 0, 0, args[4], args[5]);
            this.context.restore();
        } else if (args.length == 6) {
            this.context.drawImage(img, x, y, args[0], args[1], args[2], args[3], args[4], args[5]);
        } else if (args.length >= 2) {
            this.context.drawImage(img, x, y, args[0], args[1]);
        } else {
            this.context.drawImage(img, x, y);
        }
        return true;
    }

    /**
     * fullScreen
     */
    public fullScreen() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        return this;
    }

    public static create(width: number|Storyboard, height?: number): Storyboard {
        let canvas = document.createElement("canvas");
        if (typeof width == 'object') {
            canvas.width = width.width();
            canvas.height = width.height();
        } else {
            canvas.width = width;
            canvas.height = height;
        }
        return new Storyboard(canvas);
    }

    public static parse(element: HTMLCanvasElement|string): Storyboard {
        return new Storyboard(typeof element == 'string' ? document.getElementById(element) as HTMLCanvasElement : element);
    }
}