class Scene implements ICanDraw {

    private fps = 60;

    public stage: Stage;

    public children: Sprite[] = [];

    public canvas: Storyboard;

    public setFPS(fps: number) {
        this.fps = fps;
    }

    /**
     * addChild
     */
    public addChild(kid: Sprite) {
        this.children.push(kid);
        return this;
    }

    /**
     * init
     */
    public init() {
        if (!this.canvas) {
            this.canvas = Storyboard.create(this.stage.canvas);
        }
    }

    public update() {

    }

    public draw(ctx: Storyboard) {
        this.canvas.clear();
        this.children.forEach(item => {
            item.draw(this.canvas);
        });
        ctx.draw(this.canvas);
    }


    /**
     * destory
     */
    public destory() {
        
    }
}