var zodream = function(name) {
	this.elements = [];
	this.parent = arguments[1] || null;
	this.init(name);
	return this;
};

zodream.prototype = {
	init: function(name) {
		if(typeof name === "string")
		{
			this.elements = this.getMore( name , arguments[1] || window.document);
		}else {
			this.elements = [name];
		}
	},
	getMore: function(name) {
		var names = name.split(","),
			elements = Array();
		for (var i = 0, len = names.length; i < len; i++) {
			Array.prototype.push.apply(elements, this.getNext( names[i], arguments[1] || window.document ) );
		};
		return elements;
	},
	getNext: function(name) {
		var names = name.split(" "),
			element = [arguments[1] || window.document];
		for (var i = 0, len = names.length; i < len; i++) {
			var eles = Array();
			for (var j = 0,leng = element.length; j < leng; j++) {
				var ele = element[j];
				Array.prototype.push.apply(eles, this.getChild(names[i], ele) ); 
			}
			element = eles;
		};
		return element;
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
		}
	},
	addClass: function(className) {
		this.forE(function(e, i , value) {
			e.className += " " + value;
		}, className);
	},
	removeClass: function(className) {
		var classNames = this.attr('class');
		this.attr('class', classNames.replace(className, ""));
	},
	css: function(name) {
		if(arguments[1] === undefined) {
			return this.elements[0].style[name];
		}else {
			this.forE(function(e, i , name, value) {
				e.style[name] = value;
			}, name , arguments[1]);
		}
	},
	show: function() {
		this.css("display", "block");
	},
	hide: function() {
		this.css("display", "none");		
	},
	html: function() {
		if(arguments[0] === undefined) {
			return this.elements[0].innerHTML;
		}else {
			this.forE(function(e, i , value) {
				e.innerHTML = value;
			}, arguments[0]);
		}
	},
	val: function() {
		if(arguments[0] === undefined) {
			return this.elements[0].value;
		}else {
			this.forE(function(e, i , value) {
				e.value = value;
			}, arguments[0]);
		}
	},
	getForm: function() {
		var data = "",
			elements = this.getMore('input,textarea', this.elements[0]);
		for (var i = 0, len = elements.length; i < len; i++) {
			var element = elements[i];
			if(element.required && element.value == "") {
				element.style.border = "1px solid red";
				return false;
			};
			switch (element.type.toLowerCase()) {    
				case 'submit':
					break;
				case 'hidden':    
				case 'password':    
				case 'text':
				case 'email':
					data += "&" + element.name + "=" + Helper.encode(element.value);
					break; 
				case 'textarea':
					data += "&" + element.name + "=" + Helper.encode( Helper.toHtml(element.value) );
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
		var elements = this.getMore('input,textarea', this.elements[0]);
		for (var i = 0, len = elements.length; i < len; i++) {
			var element = elements[i];
			switch ( element.type.toLowerCase() ) {    
				case 'submit':
				case 'hidden':
					break;  
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
	},
	forE: function(func) {
		var data = Array();
		if(typeof func === "function") {
			for (var i = 0, len = this.elements.length; i < len; i++) {
				var args = Array.prototype.slice.call(arguments, 1);
				args.unshift( this.elements[i], i );
				data.push( func.apply( null, args) );
			};
		}
		return data;
	},
	addChild: function() {
		for (var i = 0,len = arguments.length; i < len; i++) {
			this.forE(function(e, i , ele) {
				e.appendChild(ele);
			}, arguments[i]);
		}
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
	},
	removeSelf: function() {
		this.forE(function(e) {
			e.parentNode.removeChild(e);
		});	
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

var Helper = {
	ajax: {
		default: {
			method: "GET",
			url: '',
			data: null,
			success: null,
			error: null,
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
						data = Helper.parseJSON(this.http.responseText );
					} catch (error) {
						data = this.http.responseText;
					}
					this.settings.success( data , this.http );
				}else {
					this.settings.error(this.http.responseText, this.http.status, this.http);
				}
			}
		},
		get: function(url, func) {
			var data;
			if(arguments.length > 1)
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
			if(arguments.length > 1)
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
			Helper.extend.call( this.settings , this.default, data);
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
	extend: function() {
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
};

var Z = function() {
	this.remove = function() {
		if(arguments[0])
		{
			for (var i = 0,len = arguments.length; i < len; i++) {
				delete this.elements[arguments[i]];
			}
		}else {
			delete this.elements[this.name];
		}
	};
	this.getName = function(tag) {
		var val="";
　　　　for(var i = 0; i < tag.length; i++){
			val += tag.charCodeAt(i).toString(16);
　　　　}
　　　　return val;
	}
	
	if(arguments[0]) {
		this.name = this.getName(arguments[0]);
	}
	if(!this.elements) {
		this.elements = {};		
	}
	if( !this.elements[name] )
	{
		this.elements[name] = new zodream(arguments[0], this);
	}
	return this.elements[name];
};

(function() {
	window.Z = Z;	
})();