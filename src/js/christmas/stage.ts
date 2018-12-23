class Stage {
    /**
     *
     */
    constructor(
        element: HTMLCanvasElement|string
    ) {
        this.canvas = Storyboard.parse(element);
        this.canvas.fullScreen();
        this.init();
    }

    public canvas: Storyboard;

    public scene: Scene;

    public timer: Timer;

    /**
     * init
     */
    public init() {
        this.loop();
    }

    /**
     * loop
     */
    public loop() {
        this.timer = new Timer(this.update.bind(this))
    }

    /**
     * nevigate
     */
    public nevigate(scene: Scene) {
        this.scene && this.scene.destory();
        //this.canvas.clear();
        this.scene = scene;
        this.scene.stage = this;
        this.scene.init();
    }

    /**
     * update
     */
    public update() {
        this.scene.update();
        this.draw();
    }

    /**
     * draw
     */
    public draw() {
        this.canvas.clear();
        this.scene.draw(this.canvas);
    }
}