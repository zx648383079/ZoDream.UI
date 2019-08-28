/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */
interface ITweenGroup {
    [name: string]: Tween;
}

class TweenManager {
    private _tweens: ITweenGroup = {};

    private _tweensAddedDuringUpdate: ITweenGroup = {};

    public all(): Tween[] {
        return Object.keys(this._tweens).map(function (tweenId) {
			return this._tweens[tweenId];
		}.bind(this))
    }

    public clear() {
        this._tweens = {};
    }

    /**
     * add
     */
    public add(item: Tween) {
        this._tweens[item.id] = item;
		this._tweensAddedDuringUpdate[item.id] = item;
    }

    /**
     * remove
     */
    public remove(item: Tween) {
        delete this._tweens[item.id];
		delete this._tweensAddedDuringUpdate[item.id];
    }

    /**
     * update
     */
    public update(time?: number, preserve?: boolean): boolean {
        let tweenIds = Object.keys(this._tweens);

		if (tweenIds.length === 0) {
			return false;
		}

        time = time !== undefined ? time : this.now();
        
		while (tweenIds.length > 0) {
			this._tweensAddedDuringUpdate = {};
			for (let i = 0; i < tweenIds.length; i++) {
				let tween = this._tweens[tweenIds[i]];

				if (tween && tween.update(time) === false) {
					tween.isPlaying = false;

					if (!preserve) {
						delete this._tweens[tweenIds[i]];
					}
				}
			}
			tweenIds = Object.keys(this._tweensAddedDuringUpdate);
		}
		return true;
    }

    private static _nextId = 0;

    public nextId(): number {
        return TweenManager._nextId ++;
    }

    public now(): number {
        return Date.now !== undefined ? Date.now() : new Date().getTime();
	}
	
	public loop() {
		const animate = (time?: number) => {
			requestAnimationFrame(animate);
			TWEEN.update(time);
		}
		requestAnimationFrame(animate);
	}
}

class Tween {

    constructor(
        private _object: any,
        private _manager: TweenManager = TWEEN
    ) {
        this._id = TWEEN.nextId();
    }

    private _valuesStart = {};
	private _valuesEnd = {};
	private _valuesStartRepeat = {};
	private _duration = 1000;
	private _repeat = 0;
	private _repeatDelayTime: number = undefined;
	private _yoyo = false;
	private _reversed = false;
	private _delayTime = 0;
	private _startTime: number = null;
	private _easingFunction: (arg: number) => number = TweenEasing.Linear.None;
	private _interpolationFunction: (end: number[], val: number) => number = TweenInterpolation.Linear;
	private _chainedTweens: Tween[] = [];
	private _onStartCallback: (data: any) => void | null = null;
	private _onStartCallbackFired = false;
	private _onUpdateCallback: (ob: any, arg: number) => void = null;
	private _onRepeatCallback: (ob: any) => void = null;
	private _onCompleteCallback: (ob: any) => void = null;
	private _onStopCallback: (ob: any) => void = null;
    
    private _id: number;

    public isPlaying: boolean = false;

    public get id(): number {
        return this._id;
    }

    /**
     * to
     */
    public to(properties: any, duration?: number) {
        this._valuesEnd = Object.create(properties);
		if (duration !== undefined) {
			this._duration = duration;
		}
		return this;
    }

    /**
     * duration
     */
    public duration(duration: number) {
        this._duration = duration;
        return this;
    }

    /**
     * start
     */
    public start(time?: number) {
        this._manager.add(this);

		this.isPlaying = true;

		this._onStartCallbackFired = false;

		this._startTime = time !== undefined ? typeof time === 'string' ? TWEEN.now() + parseFloat(time) : time : TWEEN.now();
		this._startTime += this._delayTime;
		for (var property in this._valuesEnd) {
			if (this._valuesEnd[property] instanceof Array) {
				if (this._valuesEnd[property].length === 0) {
					continue;
				}
				this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);
			}
			if (this._object[property] === undefined) {
				continue;
			}
			this._valuesStart[property] = this._object[property];
			if ((this._valuesStart[property] instanceof Array) === false) {
				this._valuesStart[property] *= 1.0; 
			}
			this._valuesStartRepeat[property] = this._valuesStart[property] || 0;
		}
		return this;
    }

    /**
     * stop
     */
    public stop() {
        if (!this.isPlaying) {
			return this;
		}

		this._manager.remove(this);
		this.isPlaying = false;

		if (this._onStopCallback !== null) {
			this._onStopCallback(this._object);
		}
		this.stopChainedTweens();
		return this;
    }

    /**
     * end
     */
    public end() {
        this.update(Infinity);
		return this;
    }

    /**
     * stopChainedTweens
     */
    public stopChainedTweens() {
        for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
			this._chainedTweens[i].stop();
		}
    }

    /**
     * manager
     */
    public manager(manager: TweenManager) {
        this._manager = manager;
		return this;
    }

    /**
     * delay
     */
    public delay(amount: number) {
        this._delayTime = amount;
        return this;
    }

    /**
     * repeat
     */
    public repeat(times: number) {
        this._repeat = times;
        return this;
    }

    /**
     * repeatDelay
     */
    public repeatDelay(amount: number) {
        this._repeatDelayTime = amount;
		return this;
    }

    public yoyo(yoyo: boolean) {
		this._yoyo = yoyo;
		return this;
    }
    
    public easing(easingFunction: (arg: number) => number) {
		this._easingFunction = easingFunction;
		return this;
	}
	public interpolation(interpolationFunction) {
		this._interpolationFunction = interpolationFunction;
		return this;

	}

	public chain(...args: Tween[]) {
		this._chainedTweens = args;
		return this;
	}

	public onStart(callback: (ob: any) => void) {
		this._onStartCallback = callback;
		return this;
	}

	public onUpdate(callback: (ob: any, arg: number) => void) {
		this._onUpdateCallback = callback;
		return this;
	}

	public onRepeat(callback: (ob: any) => void) {
		this._onRepeatCallback = callback;
		return this;
	}

	public onComplete(callback: (ob: any) => void) {
		this._onCompleteCallback = callback;
		return this;
	}

	public onStop(callback: (ob: any) => void) {
		this._onStopCallback = callback;
		return this;
	}

    /**
     * update
     */
    public update(time: number): boolean {
        let property: string;
		let elapsed: number;
		let value: number;

		if (time < this._startTime) {
			return true;
		}

		if (this._onStartCallbackFired === false) {
			if (this._onStartCallback !== null) {
				this._onStartCallback(this._object);
			}

			this._onStartCallbackFired = true;
		}

		elapsed = (time - this._startTime) / this._duration;
		elapsed = (this._duration === 0 || elapsed > 1) ? 1 : elapsed;

		value = this._easingFunction(elapsed);

		for (property in this._valuesEnd) {

			// Don't update properties that do not exist in the source object
			if (this._valuesStart[property] === undefined) {
				continue;
			}

			let start = this._valuesStart[property] || 0;
			let end = this._valuesEnd[property];

			if (end instanceof Array) {

				this._object[property] = this._interpolationFunction(end, value);

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if (typeof (end) === 'string') {

					if (end.charAt(0) === '+' || end.charAt(0) === '-') {
						end = start + parseFloat(end);
					} else {
						end = parseFloat(end);
					}
				}

				// Protect against non numeric properties.
				if (typeof (end) === 'number') {
					this._object[property] = start + (end - start) * value;
				}

			}

		}

		if (this._onUpdateCallback !== null) {
			this._onUpdateCallback(this._object, elapsed);
		}

		if (elapsed === 1) {

			if (this._repeat > 0) {

				if (isFinite(this._repeat)) {
					this._repeat--;
				}

				// Reassign starting values, restart by making startTime = now
				for (property in this._valuesStartRepeat) {

					if (typeof (this._valuesEnd[property]) === 'string') {
						this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
					}

					if (this._yoyo) {
						var tmp = this._valuesStartRepeat[property];

						this._valuesStartRepeat[property] = this._valuesEnd[property];
						this._valuesEnd[property] = tmp;
					}

					this._valuesStart[property] = this._valuesStartRepeat[property];

				}

				if (this._yoyo) {
					this._reversed = !this._reversed;
				}

				if (this._repeatDelayTime !== undefined) {
					this._startTime = time + this._repeatDelayTime;
				} else {
					this._startTime = time + this._delayTime;
				}

				if (this._onRepeatCallback !== null) {
					this._onRepeatCallback(this._object);
				}

				return true;

			} else {

				if (this._onCompleteCallback !== null) {

					this._onCompleteCallback(this._object);
				}

				for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					this._chainedTweens[i].start(this._startTime + this._duration);
				}

				return false;

			}

		}

		return true;
    }
}

const TweenEasing = {
	Linear: {
		None: (k: number) => k,
	},
	Quadratic: {
		In: (k: number) => k * k,

		Out: (k: number) => k * (2 - k),

		InOut: (k: number) => {
			if ((k *= 2) < 1) {
				return 0.5 * k * k;
			}
			return - 0.5 * (--k * (k - 2) - 1);
		}

	},

	Cubic: {

		In: (k: number) => k * k * k,

		Out: (k: number) => --k * k * k + 1,

		InOut: (k: number) => {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k + 2);

		}

	},

	Quartic: {

		In: (k: number) => k * k * k * k,

		Out: (k: number) => 1 - (--k * k * k * k),

		InOut: (k: number) => {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k;
			}

			return - 0.5 * ((k -= 2) * k * k * k - 2);

		}

	},

	Quintic: {

		In: (k: number) => k * k * k * k * k,

		Out: (k: number) => --k * k * k * k * k + 1,

		InOut: (k: number) => {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k * k * k + 2);

		}

	},

	Sinusoidal: {

		In: (k: number) => 1 - Math.cos(k * Math.PI / 2),

		Out: (k: number) => Math.sin(k * Math.PI / 2),

		InOut: (k: number) => 0.5 * (1 - Math.cos(Math.PI * k)),

	},

	Exponential: {

		In: (k: number) => k === 0 ? 0 : Math.pow(1024, k - 1),

		Out: (k: number) => k === 1 ? 1 : 1 - Math.pow(2, - 10 * k),

		InOut: (k: number) => {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if ((k *= 2) < 1) {
				return 0.5 * Math.pow(1024, k - 1);
			}

			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

		}

	},

	Circular: {

		In: (k: number) => 1 - Math.sqrt(1 - k * k),

		Out: (k: number) => Math.sqrt(1 - (--k * k)),

		InOut: (k: number) => {

			if ((k *= 2) < 1) {
				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: (k: number) => {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);

		},

		Out: (k: number) => {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;

		},

		InOut: (k: number) => {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			k *= 2;

			if (k < 1) {
				return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
			}

			return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;

		}

	},

	Back: {

		In:(k: number) => {

			const s = 1.70158;

			return k * k * ((s + 1) * k - s);

		},

		Out: (k: number) => {

			const s = 1.70158;

			return --k * k * ((s + 1) * k + s) + 1;

		},

		InOut: (k: number) => {

			const s = 1.70158 * 1.525;

			if ((k *= 2) < 1) {
				return 0.5 * (k * k * ((s + 1) * k - s));
			}

			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

		}

	},

	Bounce: {

		In: (k: number) => 1 - TweenEasing.Bounce.Out(1 - k),

		Out: (k: number) => {

			if (k < (1 / 2.75)) {
				return 7.5625 * k * k;
			} else if (k < (2 / 2.75)) {
				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
			} else if (k < (2.5 / 2.75)) {
				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
			} else {
				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
			}

		},

		InOut: (k: number) => {

			if (k < 0.5) {
				return TweenEasing.Bounce.In(k * 2) * 0.5;
			}

			return TweenEasing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

		}

	}
};

const TweenInterpolation = {

	Linear: function (v: number[], k: number) {
		const m = v.length - 1;
		const f = m * k;
		const i = Math.floor(f);
		const fn = TweenInterpolation.Utils.Linear;

		if (k < 0) {
			return fn(v[0], v[1], f);
		}

		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}

		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

	},

	Bezier: function (v: number[], k: number) {

		let b = 0;
		const n = v.length - 1;
		const pw = Math.pow;
		const bn = TweenInterpolation.Utils.Bernstein;

		for (let i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;

	},

	CatmullRom: function (v: number[], k: number) {

		const m = v.length - 1;
		let f = m * k;
		let i = Math.floor(f);
		const fn = TweenInterpolation.Utils.CatmullRom;

		if (v[0] === v[m]) {

			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}

			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

		} else {

			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

		}

	},

	Utils: {

		Linear: function (p0: number, p1: number, t: number) {
			return (p1 - p0) * t + p0;
		},

		Bernstein: function (n: number, i: number) {
			const fc = TweenInterpolation.Utils.Factorial;
			return fc(n) / fc(i) / fc(n - i);

		},

		Factorial: (function () {

			const a = [1];

			return function (n: number) {
				let s = 1;

				if (a[n]) {
					return a[n];
				}

				for (let i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;
				return s;

			};

		})(),

		CatmullRom: (p0: number, p1: number, p2: number, p3: number, t: number) => {
			const v0 = (p2 - p0) * 0.5;
			const v1 = (p3 - p1) * 0.5;
			const t2 = t * t;
			const t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
		}

	}

};

const TWEEN = new TweenManager();
