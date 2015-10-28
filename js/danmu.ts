module Zodream {
	export class App {
		public static main(arg: string | HTMLDivElement,...args: any[]) {
			return new Program(typeof arg === "string" ? <HTMLDivElement>document.getElementById(arg) : arg);
		}
	}
	
	export class Program {
		private _carrier: HTMLDivElement;
		private _children: HTMLCollection;
		
		constructor(arg: HTMLDivElement) {
			this._carrier = arg;
			this._children = arg.children;
		}
		
		public addChildren(...args: string[]): void {
			this.addChild.call(this, ...args);
		}
		
		private addChild(arg: string): void {
			var child = document.createElement("div");
			child.innerHTML = arg;
			this._carrier.appendChild(child);
		}
	}
	
	export class Configs {
		
	}
}