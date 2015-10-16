"use strict";

var zodream = {};

zodream.ready = function() {
	if(!zodream.elements) {
		zodream.elements = {};		
	};
	switch (typeof arguments[0]) {
		case "string":
			zodream.name = zodream.getName(arguments[0]);
		case "undefined":
			if( !zodream.elements[zodream.name] || arguments[1] === true)
			{
				zodream.elements[ zodream.name ] = new zodream.fn(arguments[0], zodream);
			}
			return zodream.elements[zodream.name];
			break;
		case "object":
		default:
			return new zodream.fn(arguments[0]);
			break;
	};
};

zodream.extend = function() {
	for (var i = 0,len = arguments.length; i < len; i++) {
		var arg = arguments[i];
		if(typeof arg === "object") {
			for (var key in arg) {
				if (arg.hasOwnProperty(key)) {
					this[key] = arg[key];
				}
			};
		}
	};
};

zodream.fn = function(name) {
	this.elements = [];
	this.parent = arguments[1] || null;
	this.init(name);
};

zodream.fn.prototype = {
	init: function(name) {
		switch (typeof name) {
			case "string":
				this.elements = zodream.getEelementsByTag( name , arguments[1] || window.document);
				break;
			case "undefined":
				break;
			case "object":
				if(name instanceof Array || name instanceof HTMLCollection) {
					if(name[0] instanceof HTMLCollection) {
						this.elements = name[0];
					}else{
						this.elements = name;						
					}
				}else {
					this.elements = [name];					
				}
				break;
			default:
				break;
		};
	},
	parents: function() {
		return this.elements[0].parentNode;
	},
	children: function() {
		var args = Array();
		var child = this.elements[0].childNodes;	
		for( var i = 0 , len = child.length ; i < len ; i++){
			if(child[i].nodeName != "#text" || /\s/.test(child[i].nodeValue))
			{
				args.push(child[i]);
			}
		}
		return args;
	},
	prev: function() {
		var obj = this.elements[0].previousSibling;
		while(obj != null && obj.id == undefined){
			obj = obj.previousSibling;
			if(obj == null){
				break;
			}
		}
		return obj;
	},
	next: function() {
		var obj = this.elements[0].nextSibling;
		while(obj != null && obj.id == undefined){
			obj = obj.nextSibling;
			if(obj == null){
				break;
			}
		}
		return obj;
	},
	getSibling: function() {
		var a = [];
		var b = this.elements[0].parentNode.children;
		for(var i =0 , len = b.length ; i< len; i++) {
			if( b[i] !== this.elements[0] ) a.push( b[i] );
		}
		return a;	
	},
	getChildren: function(name) {
		return this.forE(function(e) {
			return zodream.getEelementsByTag(name, e)
		});
	},
	attr: function(name) {
		if(arguments[1] === undefined) {
			return this.elements[0].getAttribute(name);
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
			}, name , arguments[1]);
			return this;
		}
	},
	addClass: function(className) {
		this.forE(function(e, i , value) {
			e.className += " " + value;
		}, className);
		return this;
	},
	removeClass: function(className) {
		var classNames = this.attr('class');
		this.attr('class', classNames.replace(className, ""));
		return this;
	},
	css: function(name) {
		if(arguments[1] === undefined) {
			if(typeof this.elements[0] != "object") return;
			var value = this.elements[0].style[name]; 
			if(!value) {
				var temp = this.elements[0].currentStyle || document.defaultView.getComputedStyle(this.elements[0], null);
				value = temp[name];
			}
			return value;
		}else {
			this.forE(function(e, i , name, value) {
				e.style[name] = value;
			}, name , arguments[1]);
			return this;
		}
	},
	show: function() {
		this.css("display", "block");
		return this;
	},
	hide: function() {
		this.css("display", "none");
		return this;	
	},
	toggle: function() {
		if(this.css("display") == "none") {
			this.show();
		}else {
			this.hide();
		}
		return this;
	},
	html: function() {
		if(arguments[0] === undefined) {
			return this.elements[0].innerHTML;
		}else {
			this.forE(function(e, i , value) {
				e.innerHTML = value;
			}, arguments[0]);
			return this;
		}
	},
	val: function() {
		if(arguments[0] === undefined) {
			return this.elements[0].value;
		}else {
			this.forE(function(e, i , value) {
				e.value = value;
			}, arguments[0]);
			return this;
		}
	},
	getForm: function() {
		var data = "",
			elements = zodream.getEelementsByTag('input,textarea', this.elements[0]);
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
					data += "&" + element.name + "=" + zodream.encode(element.value);
					break; 
				case 'textarea':
					data += "&" + element.name + "=" + zodream.encode( zodream.toHtml(element.value) );
					break; 
				case 'checkbox':    
				case 'radio':
					if( element.checked ) {
						data += "&" + element.name + "=" + element.value;
					}
					break;
				default:
					break;
			} 
		};
		data = data.substr(1);
		return data;
	},
	clearForm: function() {
		var elements = zodream.getEelementsByTag('input,textarea', this.elements[0]);
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
	},
	forE: function(func) {
		var data = Array();
		if(typeof func === "function") {
			for (var i = 0, len = this.elements.length; i < len; i++) {
				var args = Array.prototype.slice.call(arguments, 1);
				args.unshift( this.elements[i], i );
				var returnData = func.apply( null, args);
				if(returnData instanceof Array || returnData instanceof HTMLCollection) {
					Array.prototype.push.apply(data , returnData);
				}else {
					data.push(returnData);
				}
			};
		}
		return data;
	},
	addChild: function() {
		for (var i = 0,len = arguments.length; i < len; i++) {
			this.elements[0].appendChild(arguments[i]);
		}
		return this;
	},
	insertBefore: function(element) {
		this.parents().insertBefore(element , this.elements[0]);
		return this;
	},
	insertAfter: function( element ){
		var parent = this.parents();
		if(parent.lastChild == this.elements[0]){
			parent.appendChild( element );
		}else{
			parent.insertBefore( element, this.next() );
		}
		return this;
	},
	removeChild: function() {
		if(arguments[0]) {
			for (var i = 0,len = arguments.length; i < len; i++) {
				this.forE(function(e, i , ele) {
					e.removeChild(ele);
				}, arguments[i]);
			}
		}else {
			this.forE(function(e) {
				e.innerHTML = "";
			});
		}
		return this;
	},
	removeSelf: function() {
		this.forE(function(e) {
			e.parentNode.removeChild(e);
		});	
		return this;
	},
	remove: function() {
		for (var i = 0, len = arguments.length; i < len; i++) {
			for (var j = 0; j < this.elements.length; j++) {
				if(this.elements[j] == arguments[i])
				{
					this.elements.splice( j , 1);
				}
			};
		};
	},
	removeAt: function() {
		arguments.sort(this.desc);
		for (var i = 0, len = arguments.length; i < len; i++) {
			this.elements.splice( arguments[i] - i , 1);
		}
	},
	addEvent: function() {
		var args = Array.prototype.slice.call(arguments),
			event = args.shift(),
			fun = args.shift(),
			func = fun;
		if(args.lenght > 0)
		{
			func = function(e)
			{
				fun.apply( this, arguments);  //继承监听函数,并传入参数以初始化;
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
	},
	removeEvent: function(event, func) {
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
	},
	clear: function() {
		this.parent.remove();
	},
	desc: function(a, b) {
		return a>b?1:-1;
	},
	asc: function(a, b) {
		return a<b?1:-1;
	}
};

zodream.extend({
	getName: function(tag) {
		var val="";
　　　　for(var i = 0; i < tag.length; i++){
			val += tag.charCodeAt(i).toString(16);
　　　　}
　　　　return val;
	},
	getEelementsByTag: function(name) {
		var element = arguments[1] || window.document;
		if(name.indexOf(",") > 0) {
			return zodream._getMore(name, element);
		}else if( name.indexOf(" ") > 0 ) {
			return zodream._getNextAll(name , element);
		}else if( name.indexOf(">") > 0) {
			return zodream._getNext(name, element);
		}else {
			return zodream.getChild(name, element);
		}
	},
	_getMore: function(name) {
		var names = name.split(","),
			data = Array();
		for (var i = 0, len = names.length; i < len; i++) {
			var args = this.getEelementsByTag( names[i], arguments[1] || window.document );
			if(args instanceof Array || args instanceof HTMLCollection) {
				Array.prototype.push.apply(data, args ); 			
			}else if(typeof args == "object"){
				data.push( args );
			}
		}
		return data;
	},
	_getNextAll: function(name) {
		return this._getElements(name, " " , arguments[1] || window.document , this.getEelementsByTag);
	},
	_getNext: function(name) {
		return this._getElements(name, ">" , arguments[1] || window.document , this.getChildByTag);
	},
	_getElements: function(name, separator ,elements, func ) {
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
	},
	getChildByTag: function( tag , ele) {
		if(typeof tag != "string") {
			return;
		}
		var args = Array(),
			elements = ele.childNodes;
		for (var i = 0, len = elements.length; i < len; i++) {
			var element = elements[i];
			switch (tag.charAt(0)) {
				case '.':
					if(element.getAttribute("class").indexOf(tag.slice(1)) >= 0) {
						args.push(element);
					}
					break;
				case '#':
					if( element.getAttribute("id") === tag.slice(1)) {
						args.push(element);
					}
					break;
				case '@':
					if( element.getAttribute("name") === tag.slice(1)) {
						args.push(element);
					}
					break;
				default:
					break;
			}
		}
		
		return args;
	},
	getChild: function(name) {
		var parent = arguments[1] || window.document;
		switch (name.charAt(0)) {
			case '.':
				name = name.slice(1);
				return this.getChildByClass(name, parent);
				break;
			case '#':
				name = name.slice(1);
				return [parent.getElementById(name)];
				break;
			case '@':
				name = name.slice(1);
				return window.document.getElementsByName(name);
				break;
			case '$':
				name = name.slice(1);
				return this.getChildByIndex( Number(name), parent);
				break;
			default:
				return parent.getElementsByTagName(name);
				break;
		}
	},
	getChildByIndex: function(index) {
		var parent = arguments[1] || window.document,
			elements = parent.getElementsByTagName("*");
		for (var i = 0, len = elements.length; i < len; i++) {
			if(elements[i].nodeType == 1) {
				index --;
				if(index < 0) {
					return elements[i];
				}
			}
		}
	},
	getChildByClass: function(name) {
		var parent = arguments[1] || window.document,
			elements = parent.getElementsByTagName("*"),
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
	},
	ajax: {
		default: {
			method: "GET",
			url: '',
			data: null,
			success: function() {},
			error: function() {},
			async: true
		},
		settings: {},
		http: null,
		getHttp: function() {
			if(window.ActiveXObject) {
				try {  
					this.http = new ActiveXObject("Msxml2.XMLHTTP");//IE高版本创建XMLHTTP  
				}  
				catch(E) {
					this.http = new ActiveXObject("Microsoft.XMLHTTP");//IE低版本创建XMLHTTP  
				}  
			}else {
				this.http = new XMLHttpRequest();
			}
		},
		request: function() {
			this.http.open( this.settings.method , this.settings.url, this.settings.async);  
			this.http.onreadystatechange = this.response.bind(this); 
			this.http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			this.http.send( this.settings.data );  
		},
		response: function() {
			if (this.http.readyState == 4) { 
				if (this.http.status == 200) {  
					//var text = decodeURI( this.http.responseText );
					var data;
					try {
						data = zodream.parseJSON(this.http.responseText );
					} catch (error) {
						data = this.http.responseText;
					}
					if(typeof this.settings.success == "function") {
						this.settings.success( data , this.http );						
					}
				}else {
					if(typeof this.settings.error == "function") {
						this.settings.error(this.http.responseText, this.http.status, this.http);
					}else if(typeof this.settings.success == "function") {
						this.settings.success(this.http.responseText, this.http.status, this.http);						
					}
				}
			}
		},
		get: function( url, func) {
			var data;
			if(typeof url == "string")
			{
				data = {
					url: arguments[0],
					success: arguments[1],
				};
			}else {
				data = arguments[0];
			}
			this.load(data);
		},
		post: function() {
			var data;
			if(typeof url == "string")
			{
				data = {
					method: "POST",
					url: arguments[0],
					data: arguments[1],
					success: arguments[2],
				};
			}else {
				data = arguments[0];
			}
			if( data.data === false) return;
			this.load(data);
			
		},
		load: function( data ) {
			zodream.extend.call( this.settings , this.default, data);
			this.getHttp();
			this.request();
		}
	},
	date: {
		getNowFormatDate: function() {
			var date = new Date();
			return date.getFullYear() + "-" + 
					this.toFull(date.getMonth() + 1) + "-" + this.toFull(date.getDate())
					+ " " + this.toFull(date.getHours()) + ":" + this.toFull(date.getMinutes())
					+ ":" + this.toFull(date.getSeconds());
		},
		toFull: function ( num ) {
			if (num >= 0 && num <= 9) {
				num = "0" + num;
			}
			return num;
		}
	},
	url: function() {
		return window.location.href;
	},
	forE: function(func) {
		var data = Array();
		if(typeof func === "function") {
			for (var i = 0, len = this.length; i < len; i++) {
				var args = Array.prototype.slice.call(arguments, 1);
				args.unshift( this[i], i );
				data.push( func.apply( null, args) );
			};
		}
		return data;
	},
	clone: function(obj) { 
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
	},
	parseJSON: function( data ) {
		return JSON.parse( data + "" );
	},
	refresh: function() {
		window.location.reload();
	},
	htmlTo: function(data) {
		return data.replace(/(&nbsp;)/g, " ").replace(/(\<br\>)/g, "\r\n");
	},
	toHtml: function(data) {
		return data.replace(/[ ]/g, "&nbsp;").replace(/\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029)/g, "<br>");
	},
	encode: function(data){  
		return encodeURI(data).replace(/&/g, '%26').replace(/\+/g,'%2B').replace(/\s/g,'%20').replace(/#/g,'%23');  
	}
});



(function() {
	window.Z = function() {
		return zodream.ready.apply(null, arguments);
	};	
})();