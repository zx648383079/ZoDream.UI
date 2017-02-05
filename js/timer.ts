let vendors = ['webkit', 'moz'];
for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
        window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame || !window.cancelAnimationFrame ) {
    let lastTime = 0;
    window.requestAnimationFrame = function(callback): number {
      let currTime: number = new Date().getTime();
      //为了使setTimteout的尽可能的接近每秒60帧的效果
      let timeToCall: number = Math.max( 0, 16 - ( currTime - lastTime ) ); 
      let id: number = window.setTimeout( function() {
        callback( currTime + timeToCall );
      }, timeToCall );
      lastTime = currTime + timeToCall;
      return id;
    };
    
    window.cancelAnimationFrame = function(id) {
      window.clearTimeout(id);
    };
}

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
        callback: Function,
        space: number = 16,
        time: number = 0
    ) {
        this.add(callback, space, time);
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