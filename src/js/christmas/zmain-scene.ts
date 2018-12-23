interface ITime {
    time: number,
    count: number,
    handle: Function,
}

class MainScene extends Scene {

    /**
     * init
     */
    public init() {
        super.init();
        this.createSprite();
    }

    private _time: number = 0;
    private _wind = 0;

    private createSprite() {
        this._time ++;
        if (this._time > 1000000) {
            this._time = 0;
        }
        if (this._time % 40 > 0) {
            return;
        }
        let count = Math.floor(Math.random() * this.canvas.width() / 200);
        if (count < 1) {
            return;
        }
        for (; count > 0; count --) {
            this.addChild(new SnowSprite(this.canvas.width(), this.canvas.height()))
        }
    }

    private getWind() {
        if (this._time % 200 > 0) {
            return this._wind;
        }
        let old_wind = this._wind;
        this._wind = (Math.random() > .5 ? 1 : -1) * Math.random();
        if (Math.abs(old_wind - this._wind) > 1) {
            this._wind = old_wind > 0 ? old_wind - .1 : old_wind + .1;
        }
        return this._wind;
    }

    public update() {
        let windSpeed = this.getWind();//Math.random() < 0.5 ? 0.0005 : -0.0005;
        for (let i = this.children.length - 1; i >= 0; i--) {
            const kid = this.children[i] as SnowSprite;
            if (kid.isOut()) {
                this.children.splice(i, 1);
                return;
            }
            kid.update(windSpeed);
        }
        this.createSprite();
    }
}