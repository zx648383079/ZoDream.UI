class Stage {
    /**
     *
     */
    constructor(
        element: HTMLCanvasElement|string
    ) {
        this.canvas = Storyboard.parse(element);
    }

    public canvas: Storyboard;
}