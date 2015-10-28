module ZoDream {
	export class Base {
		
	}
	
	export class Main extends Base {
		private _elements: HTMLElement[];
		constructor(
			name: any,
			parent: HTMLDocument = window.document) {
			super();
			
			switch (typeof name) {
				case "string":
					this._elements = Helper.getEelement( name , parent);
					break;
				case "undefined":
					break;
				case "object":
					if(name instanceof Array || name instanceof HTMLCollection) {
						if(name[0] instanceof HTMLCollection) {
							this._elements = name[0];
						}else{
							this._elements = name;						
						}
					}else {
						this._elements = [name];					
					}
					break;
				default:
					break;
			}
		}
		
		public getParent(index: number = 1) {
			var child = this._elements[0];
			for (var i = 0; i < index; i++) {
				child = <HTMLElement>child.parentNode;
			}
			return child;
		}
		
		public getChildren() {
			var args = Array();
			var child = this._elements[0].childNodes;	
			for( var i = 0 , len = child.length ; i < len ; i++){
				if(child[i].nodeName != "#text" || /\s/.test(child[i].nodeValue))
				{
					args.push(child[i]);
				}
			}
			return args;
		}
		
		public prev() {
			var obj = <HTMLElement>this._elements[0].previousSibling;
			while(obj != null && obj.id == undefined){
				obj = <HTMLElement>obj.previousSibling;
				if(obj == null){
					break;
				}
			}
			return obj;
		}
		
		public next() {
			var obj = <HTMLElement>this._elements[0].nextSibling;
			while(obj != null && obj.id == undefined){
				obj = <HTMLElement>obj.nextSibling;
				if(obj == null){
					break;
				}
			}
			return obj;
		}
		
		public getSibling() {
			var a = [];
			var b = this._elements[0].parentNode.childNodes;
			for(var i =0 , len = b.length ; i < len; i++) {
				if( b[i] !== this._elements[0] ) {
					a.push( b[i] );					
				}
			}
			return a;	
		}
		
		public forE(func: (element: any,i: number,...args: any[])=> any, ...args: any[] ): any{
			var data = Array();
			if(typeof func === "function") {
				for (var i = 0, len = this._elements.length; i < len; i++) {
					var returnData = func(this._elements[i], i, ...args);
					if(returnData instanceof Array || returnData instanceof HTMLCollection) {
						Array.prototype.push.apply(data , returnData);
					}else {
						data.push(returnData);
					}
				};
			}
			return data;
		}
		
		public getPosterity(arg: string) {
			return this.forE(function(e) {
				return Helper.getEelement(arg, e)
			});
		}
		
		public attr(arg?: string, val?: string): any {
			if(val === undefined) {
				return this._elements[0].getAttribute(arg);
			}else {
				this.forE(function(e, i , name, value) {
					switch (name) {
						case "class":
							name += "Name";
							break;
						default:
							break;
					}
					e[name] = value;
				}, arg , val);
				return this;
			}
		}
		
		public addClass(arg: string) {
			this.forE(function(e, i , value) {
				e.className += " " + value;
			}, arg);
			return this;
		}
		
		public removeClass(arg: string) {
			var classNames = this.attr('class');
			this.attr('class', classNames.replace(arg, ""));
			return this;
		}
		
		public css(arg: string, val?: string) {
			if(val === undefined) {
				if(typeof this._elements[0] != "object") return;
				var value = this._elements[0].style[arg]; 
				if(!value) {
					var temp = this._elements[0].currentStyle || document.defaultView.getComputedStyle(this._elements[0], null);
					value = temp[arg];
				}
				return value;
			}else {
				this.forE(function(e, i , name, value) {
					e.style[name] = value;
				}, arg , val);
				return this;
			}
		}
		
		public show() {
			this.css("display", "block");
			return this;
		}
		
		public hide() {
			this.css("display", "none");
			return this;
		}
		
		public toggle() {
			if(this.css("display") == "none") {
				this.show();
			}else {
				this.hide();
			}
			return this;
		}
		
		public html(arg?: string): any {
			if(arg === undefined) {
				return this._elements[0].innerHTML;
			}else {
				this.forE(function(e, i , value) {
					e.innerHTML = value;
				}, arg);
				return this;
			}
		}
		
		public val(arg?: string): any {
			if(arg === undefined) {
				return (<HTMLInputElement>this._elements[0]).value;
			}else {
				this.forE(function(e, i , value) {
					e.value = value;
				}, arg);
				return this;
			}
		}
		
		public getForm() {
			var data = new Object,
				elements = Helper.getEelement('input,textarea', this._elements[0]);
			for (var i = 0, len = elements.length; i < len; i++) {
				var element = elements[i];
				if(element.required && element.value == "") {
					element.style.border = "1px solid red";
					return;
				};
				switch (element.type.toLowerCase()) {    
					case 'submit':
						break;
					case 'hidden':    
					case 'password':    
					case 'text':
					case 'email':
					case 'textarea':
						data[element.name] = element.value;
						break; 
					case 'checkbox':    
					case 'radio':
						if( element.checked ) {
							data[element.name] = element.value;
						}
						break;
					default:
						break;
				} 
			};
			return data;
		}
		
		public clearForm() {
			var elements = Helper.getEelement('input,textarea', this._elements[0]);
			for (var i = 0, len = elements.length; i < len; i++) {
				var element = elements[i];
				switch ( element.type.toLowerCase() ) {    
					case 'submit':
						break;  
					case 'hidden':
					case 'password':    
					case 'text':
					case 'email':
					case 'textarea':
						element.value = "";
						break;
					case 'checkbox':    
					case 'radio':
						element.checked = false;
						break;
					default:
						break;
				}
			}
			return this;
		}
		
		public addChild(...args: any[]) {
			this._elements[0].appendChild.call( this._elements[0] ,...args);
			return this;
		}
		
		public insertBefore(arg: any) {
			this.getParent().insertBefore(arg , this._elements[0]);
			return this;
		}
		
		public insertAfter(arg: any) {
			var parent = this.getParent();
			if(parent.lastChild == this._elements[0]){
				parent.appendChild( arg );
			}else{
				parent.insertBefore( arg, this.next() );
			}
			return this;
		}
		
		public removeChild(arg?: Node,...args: any[]) {
			if( arg ) {
				this._elements[0].removeChild.call( this._elements[0] , arg ,...args);
			}else {
				this.forE(function(e) {
					e.innerHTML = "";
				});
			}
			return this;
		}
		
		public removeSelf() {
			this.forE(function(e) {
				e.parentNode.removeChild(e);
			});	
			return this;
		}
		
		public addEvent(event: string, func: Function, ...args: any[]) {
			var fun = func;
			if(args.length > 0)
			{
				fun = function(e)
				{
					func.apply( this, args );  //继承监听函数,并传入参数以初始化;
				}
			};
			
			this.forE(function(e, i, event , func) {
				if(e) {
					if(e.attachEvent){
						e.attachEvent('on' + event, func);
					}else if(e.addEventListener){
						e.addEventListener(event, func, false);
					}else{
						e["on" + event] = func;
					}
				}
			}, event , func);
			return this;
		}
		
		public removeEvent(event: string, func: Function) {
			this.forE(function(e, i, event , func) {
				if (e.removeEventListener) {
					e.removeEventListener(event, func, false);
				} else if (e.detachEvent) {
					e.detachEvent("on" + event, func);
				}else {
					delete e["on" + event];
				}
			}, event , func);
			return this;
		}
	}
	
	enum Method {GET, POST};
	
	export class AjaxModel {
		
		constructor(
			public url: string = null, 
			public success: Function = null,			
			public method: Method = Method.GET, 			
			public data: any = null,
			public error: Function = null,
			public async: boolean = true
		) {
			
		}
	}
	
	export class Ajax extends Base {
		private _http:any;
		
		constructor(private _models: AjaxModel) {
			super();
			this._getHttp();
			this._request();
		}
		
		private _getHttp(): void {
			if( ActiveXObject ) {
				try {  
					this._http = new ActiveXObject("Msxml2.XMLHTTP");//IE高版本创建XMLHTTP  
				}  
				catch(E) {
					this._http = new ActiveXObject("Microsoft.XMLHTTP");//IE低版本创建XMLHTTP  
				}  
			}else {
				this._http = new XMLHttpRequest();
			}
		}
		
		private _request(): void {
			this._http.open( this._models.method , this._models.url, this._models.async);  
			this._http.onreadystatechange = this._response.bind(this); 
			this._http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			this._http.send( this._models.data );
		}
		
		private _response(): void {
			if (this._http.readyState == 4) { 
				if (this._http.status == 200) {  
					var data;
					try {
						data = JSON.parse( this._http.responseText + "" );
					} catch (error) {
						data = this._http.responseText;
					}
					if(typeof this._models.success == "function") {
						this._models.success( data , this._http );						
					}
				}else {
					if(typeof this._models.error == "function") {
						this._models.error(this._http.responseText, this._http.status, this._http);
					}else if(typeof this._models.success == "function") {
						this._models.success(this._http.responseText, this._http.status, this._http);						
					}
				}
			}
		}
		
		public static get(url: any, func?: Function): void {
			var model:AjaxModel;
			if(typeof url == "string") {
				model = new AjaxModel(url, func);
			}else {
				model = url;
			}
			new Ajax(model);
		}
		
		public static post(url: any, data?: any, func?: Function) {
			var model:AjaxModel;
			if(typeof url == "string") {
				model = new AjaxModel(url, func, Method.POST, data);
			}else {
				model = url;
			}
			new Ajax(model);
		}
	}
	
	export class ZoDate extends Base {
		public static getFormat():string {
			var date = new Date();
			return date.getFullYear() + "-" + 
					this.toString(date.getMonth() + 1) + "-" + this.toString(date.getDate())
					+ " " + this.toString(date.getHours()) + ":" + this.toString(date.getMinutes())
					+ ":" + this.toString(date.getSeconds());
		}
		
		private static toString(num: number):string {
			var str = "" + num;
			if (num >= 0 && num <= 9) {
				str = "0" + str;
			}
			return str;
		}
	}
	
	export class Helper extends Base {
		public getName(arg: string): string {
			var val="";
	　　　　for(var i = 0; i < arg.length; i++){
				val += arg.charCodeAt(i).toString(16);
	　　　　}
	　　　　return val;
		}
		
		public static getEelement(
			name: string, 
			parent: HTMLDocument | HTMLElement = window.document) {
			if(name.indexOf(",") > 0) {
				return this._getBrother(name, parent);
			}else if( name.indexOf(" ") > 0 ) {
				return this._getPosterity(name , parent);
			}else if( name.indexOf(">") > 0) {
				return this._getChildren(name, parent);
			}else {
				return this.getPosterityByNmae(name, parent);
			}
		}
		
		private static _getBrother(
			name: string,
			parent: HTMLDocument | HTMLElement = window.document) {
			var names = name.split(","),
			data = Array();
			for (var i = 0, len = names.length; i < len; i++) {
				var args = this.getEelement( names[i], parent );
				if(args instanceof Array || args instanceof HTMLCollection) {
					Array.prototype.push.apply(data, args ); 			
				}else if(typeof args == "object"){
					data.push( args );
				}
			}
			return data;
		}
		
		private static _getPosterity(
			name: string, 
			parent: HTMLDocument | HTMLElement = window.document) {
			return this._getElements(name, " " , parent);
		}
		
		private static _getChildren(
			name: string, 
			parent: HTMLDocument | HTMLElement = window.document) {
			return this._getElements(name, ">" , parent , this._getChildrenByName);
		}
		
		private static _getElements(
			name: string,
			separator: string,
			elements: any, 
			func: Function = this.getEelement ) {
			var names = name.split(separator);
			if(!(elements instanceof Array)) {
				elements = [elements];
			}
			for (var i = 0, len = names.length; i < len; i++) {
				var eles = Array();
				for (var j = 0,leng = elements.length; j < leng; j++) {
					var element = elements[j];
					var args = func( names[i], element );
					if(args instanceof Array || args instanceof HTMLCollection) {
						Array.prototype.push.apply(eles, args ); 			
					}else if(typeof args == "object"){
						eles.push( args );
					}
				}
				elements = eles;
			};
			return elements;
		}
		
		private static _getChildrenByName(
			name: string, 
			parent: HTMLDocument) {
			var args = Array(),
				elements = parent.childNodes;
			for (var i = 0, len = elements.length; i < len; i++) {
				var element = <Element>elements[i];
				switch (name.charAt(0)) {
					case '.':
						if(element.getAttribute("class").indexOf(name.slice(1)) >= 0) {
							args.push(element);
						}
						break;
					case '#':
						if( element.getAttribute("id") === name.slice(1)) {
							args.push(element);
						}
						break;
					case '@':
						if( element.getAttribute("name") === name.slice(1)) {
							args.push(element);
						}
						break;
					default:
						break;
				}
			}
			
			return args;
		}
		
		public static getPosterityByNmae(
			name: string,
			parent: HTMLDocument | HTMLElement = window.document): any {
			switch (name.charAt(0)) {
				case '.':
					name = name.slice(1);
					return this._getPosterityByClass(name, parent);
					break;
				case '#':
					name = name.slice(1);
					return (<HTMLDocument>parent).getElementById(name);
					break;
				case '@':
					name = name.slice(1);
					return window.document.getElementsByName(name);
					break;
				case '$':
					name = name.slice(1);
					return  this._getPosterityByIndex( Number(name), parent);
					break;
				default:
					return parent.getElementsByTagName(name);
					break;
			}
		}
		
		private static _getPosterityByIndex(
			index: number,
			parent: HTMLDocument | HTMLElement = window.document): any {
			var elements = parent.getElementsByTagName("*");
			for (var i = 0, len = elements.length; i < len; i++) {
				if(elements[i].nodeType == 1) {
					index --;
					if(index < 0) {
						return elements[i];
					}
				}
			}
			return null;
		}
		
		private static _getPosterityByClass(
			name: string,
			parent: HTMLDocument | HTMLElement = window.document): any[] {
			var elements = parent.getElementsByTagName("*"),
				classElements = Array();
			for (var i = 0, len = elements.length; i < len; i++) {
				var element = elements[i];
				if(element.nodeType == 1) {
					if(element.getAttribute("class") == name) {
						classElements.push(element);
					}				
				}
			};
			return classElements;
		}
		
		public static clone(obj: any): any {
			var o;  
			switch(typeof obj){  
				case 'undefined': 
					break;  
				case 'string'   : 
					o = obj + '';
					break;  
				case 'number'   : 
					o = obj - 0;
					break;  
				case 'boolean'  : 
					o = obj;
					break;  
				case 'object'   :  
					if(obj === null){  
						o = null;  
					}else{  
						if(obj instanceof Array){  
							o = [];  
							for(var i = 0, len = obj.length; i < len; i++){  
								o.push(this.clone(obj[i]));  
							}  
						}else{  
							o = {};  
							for(var k in obj){  
								o[k] = this.clone(obj[k]);  
							}  
						}  
					}  
					break;  
				default:          
					o = obj;
					break;  
			}  
			return o; 
		}
	}
}