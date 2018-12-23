class SnowSprite {

    /**
     *
     */
    constructor(
        private maxWidth: number,
        private maxHeight: number
    ) {
        this.image = Preloader.get<HTMLImageElement>('snow');
        this.reset();
    }

    public x: number = 0;
    public y: number = 0;
    public kind: number = 0;
    public size: number = 0;
    public speedX: number = 0;
    public speedY: number = 0;
    public deg: number = 0;
    private image: HTMLImageElement;

    /**
     * reset
     */
    public reset() {
        this.x = Math.random() * this.maxWidth;
        this.size = Math.random() * 20 + 10;
        //this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * .8 + .2;
        this.kind = Math.floor(Math.random() * 6);
    }

    public update(windSpeed: number) {
        let degDelta = (windSpeed > 0 ? 1 : -1) * (Math.random() * 0.6 + 0.2);
        this.speedX = windSpeed * (this.kind * .01 + 1 - this.size / 100);
        this.x += this.speedX;
        this.y += this.speedY;
        this.deg += degDelta;
    }

    /**
     * isOut
     */
    public isOut() {
        return this.x < 0 || this.x > this.maxWidth || this.y > this.maxHeight;
    }

    /**
     * draw
     */
    public draw(ctx: Storyboard) {
        if (this.isOut()) {
            return;
        }
        ctx.draw(this.image, this.kind * 200, 0, 200, 200, this.x, this.y, this.size, this.size, this.deg * Math.PI / 180);
    }
}