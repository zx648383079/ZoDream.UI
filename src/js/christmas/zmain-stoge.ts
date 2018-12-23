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
        Preloader.loadImg('snow', 'image/snow.png', () => {
            this.nevigate(new MainScene());
            super.init();
        });
        
    }
}