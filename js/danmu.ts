module Zodream {
	export class App {
		public static main(arg: string | HTMLDivElement,...args: any[]) {
			if(!window.requestAnimationFrame || !window.cancelAnimationFrame) {
				new RequestAnimationNextFrame();
			}
			return new Program(typeof arg === "string" ? <HTMLDivElement>document.getElementById(arg) : arg);
		}
	}
	
	export class Program {
		private _carrier: HTMLDivElement;
		private _container: HTMLDivElement;
		
		constructor(arg: HTMLDivElement) {
			this._carrier = arg;
			this._update();
		}
		
		private _createContainer(): void {
			this._container = document.createElement("div");
		}
		
		public addChildren(...args: string[]): void {
			this.addChild.call(this, ...args);
		}
		
		private addChild(arg: string): void {
			var child = document.createElement("div");
			child.innerHTML = arg;
			child.style.left = window.innerWidth + "px";
			child.style.top = this._carrier.children.length * 40 + "px";
			this._carrier.appendChild(child);
		}
		
		private _update() {
			window.requestAnimationFrame(this._update.bind(this));
			for (var i = 0; i < this._carrier.children.length; i++) {
				var child =<HTMLDivElement>this._carrier.children[i];
				if( Animation.left(child) + this._getWidth(child) < 0 ) {
					//this._container.appendChild(child);
					this._carrier.removeChild(child);
				}
			}
		}
		
		private _getWidth(arg: HTMLDivElement): number{
			return parseInt(window.getComputedStyle(arg).width , 10);
		}
	}
	
	export class Animation {
		public static left(arg: HTMLDivElement, distance: number = 1): number {
			var x = parseInt(arg.style.left, 10) - distance;
			arg.style.left = x + "px";
			return x;
		}
		
		public static right(...args: HTMLDivElement[]) {
			args.forEach(arg => {
				arg.style.left = (parseInt(arg.style.left, 10) + 1) + "px";
			});
		}
		
		public static top(...args: HTMLDivElement[]) {
			args.forEach(arg => {
				arg.style.top = (parseInt(arg.style.top, 10) - 1) + "px";
			});
		}
		
		public static bottom(...args: HTMLDivElement[]) {
			args.forEach(arg => {
				arg.style.top = (parseInt(arg.style.top, 10) + 1) + "px";
			});
		}
		
		private static _getNumber(arg: string | number): number {
			if(typeof arg === "string") {
				return parseInt(arg, 10);
			}
			return <number>arg;
		}
	}
	
	export class RequestAnimationNextFrame {
		private _lastTime: number;
		
		private _prefixes: string[];
		
		private _requestAnimationFrame: (callback: FrameRequestCallback) => number;
		
		private _cancelAnimationFrame: (handle: number) => void;
		
		constructor() {
			this._lastTime = 0;
			this._prefixes = 'webkit moz ms o'.split(' '); 
			this._requestAnimationFrame = window.requestAnimationFrame;
			this._cancelAnimationFrame = window.cancelAnimationFrame;
			for( var i = 0, len = this._prefixes.length; i < len; i++ ) {
				if ( this._requestAnimationFrame && this._cancelAnimationFrame ) {
					break;
				}
				this._requestAnimationFrame = this._requestAnimationFrame || 
											  window[ this._prefixes[i] + 'RequestAnimationFrame' ];
				this._cancelAnimationFrame = this._cancelAnimationFrame || 
											 window[ this._prefixes[i] + 'CancelAnimationFrame' ] || 
											 window[ this._prefixes[i] + 'CancelRequestAnimationFrame' ];
			}
			if ( !this._requestAnimationFrame || !this._cancelAnimationFrame ) {
				this._requestAnimationFrame = this._setTimeOut;
				
				this._cancelAnimationFrame = this._clearTimeOut;
			}
			window.requestAnimationFrame = this._requestAnimationFrame; 
			window.cancelAnimationFrame = this._cancelAnimationFrame;
		}
		
		private _setTimeOut(callback: FrameRequestCallback): number{
			var currTime = new Date().getTime();
			var timeToCall = Math.max( 0, 16 - ( currTime - this._lastTime ) ); 
			var id = window.setTimeout( function() {
				callback( currTime + timeToCall );
			}, timeToCall );
			this._lastTime = currTime + timeToCall;
			return id;
		}
		
		private _clearTimeOut(handle: number): void {
			window.clearTimeout( handle );
		}
	}
		
	export class Configs {
		
	}
}