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

    /**
     * init
     */
    public init() {
        
    }

    /**
     * nevigate
     */
    public nevigate(scene: Scene) {
        this.scene && this.scene.destory();
        this.canvas.clear();
        this.scene = scene;
        this.scene.stage = this;
        this.scene.init();
    }
}