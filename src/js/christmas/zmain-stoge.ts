class MainStage extends Stage {

    constructor(
        element: HTMLCanvasElement|string
    ) {
        super(element);
    }

    /**
     * init
     */
    public init() {
        this.nevigate(new MainScene());
    }
}