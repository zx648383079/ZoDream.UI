class Time {
    constructor(
        public callback: Function,
        public space: number = 16,
        public time: number = 0
    ) {

    }

    private _index: number = 0;

    public isActive: boolean = true;

    private _time: number = 0;

    public run() {
        if (!this.isActive) {
            return;
        }
        this._index += 16;
        if (this._index < this.space) {
            return;
        }
        this.callback();
        this._index = 0;
        this._time ++;
        if (this.time > 0 && this._time >= this.time) {
            this.isActive = false;
            return;
        }
    }
}

class Timer {
    constructor(
        callback?: Function,
        space: number = 16,
        time: number = 0
    ) {
        if (callback) {
            this.add(callback, space, time);
        }
        if (this.isAuto) {
            this.start();
        }
    }

    public times: Array<Time> = [];

    public isAuto: boolean = true;

    public add(callback: Function, space: number = 16, time: number = 0) {
        this.times.push(new Time(callback, space, time));
        return this;
    }

    public start() {
        this._loop();
    }

    private _loop() {
        this.stop();
        let instance = this;
        this._handle = window.requestAnimationFrame(function() {
            let isEnd = true;
            instance.times.forEach(time => {
                if (time.isActive) {
                    time.run();
                    isEnd = false;
                }
            });

            if (instance.isAuto) {
                instance.stop();
                return;
            }
            instance._loop();
        });
    }

    private _handle: number;

    public stop() {
        if (this._handle) {
            window.cancelAnimationFrame(this._handle);
        }
        this._handle = null;
    }
}