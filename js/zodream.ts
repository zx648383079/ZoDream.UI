module ZoDream {
	export class Base {
		
	}
	
	export class Main extends Base {
		private _elements: HTMLDocument[];
		
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
				child = child.parentNode;
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
			var obj = this._elements[0].previousSibling;
			while(obj != null && obj.id == undefined){
				obj = obj.previousSibling;
				if(obj == null){
					break;
				}
			}
			return obj;
		}
		
		public next() {
			var obj = this._elements[0].nextSibling;
			while(obj != null && obj.id == undefined){
				obj = obj.nextSibling;
				if(obj == null){
					break;
				}
			}
			return obj;
		}
		
		public getSibling() {
			var a = [];
			var b = this._elements[0].parentNode.childNodes;
			for(var i =0 , len = b.length ; i< len; i++) {
				if( b[i] !== this._elements[0] ) a.push( b[i] );
			}
			return a;	
		}
		
		public forE(func: Function) {
			var data = Array();
			if(typeof func === "function") {
				for (var i = 0, len = this._elements.length; i < len; i++) {
					var args = Array.prototype.slice.call(arguments, 1);
					args.unshift( this._elements[i], i );
					var returnData = func.apply( null, args);
					if(returnData instanceof Array || returnData instanceof HTMLCollection) {
						Array.prototype.push.apply(data , returnData);
					}else {
						data.push(returnData);
					}
				};
			}
			return data;
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
			if( window.ActiveXObject ) {
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
			parent: HTMLDocument = window.document) {
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
			parent: HTMLDocument = window.document) {
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
			parent: HTMLDocument = window.document) {
			return this._getElements(name, " " , parent);
		}
		
		private static _getChildren(
			name: string, 
			parent: HTMLDocument = window.document) {
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
				var element = elements[i];
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
			parent: HTMLDocument = window.document) {
			switch (name.charAt(0)) {
				case '.':
					name = name.slice(1);
					return this._getPosterityByClass(name, parent);
					break;
				case '#':
					name = name.slice(1);
					return parent.getElementById(name);
					break;
				case '@':
					name = name.slice(1);
					return window.document.getElementsByName(name);
					break;
				case '$':
					name = name.slice(1);
					return new NodeListof<Element>( this._getPosterityByIndex( Number(name), parent) );
					break;
				default:
					return parent.getElementsByTagName(name);
					break;
			}
		}
		
		private static _getPosterityByIndex(
			index: number,
			parent: HTMLDocument = window.document) {
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
			parent: HTMLDocument = window.document) {
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
		
		public static clone(obj: any) {
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