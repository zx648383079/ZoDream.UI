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
			this.elements = this.getMore(name);
		}else {
			this.elements = [name];
		}
	},
	getMore: function(name) {
		var names = name.split(",");
		var elements = Array();
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
				return this.getElementByClass(name, parent);
				break;
			case '#':
				name = name.slice(1);
				return [parent.getElementById(name)];
				break;
			case '@':
				name = name.slice(1);
				return parent.getElementsByName(name);
				break;
			default:
				return parent.getElementsByTagName(name);
				break;
		}
	},
	getElementByClass: function(name) {
		var parent = arguments[1] || window.document;
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
	text: function() {
		
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
		var data = "";
		var elements = this.getMore('input,textarea', this.elements[0]);
		for (var i = 0, len = elements.length; i < len; i++) {
			var element = elements[i];
			switch (element.type.toLowerCase()) {    
				case 'submit':
					break;
				case 'hidden':    
				case 'password':    
				case 'text':
				case 'email':
				case 'textarea':
					data += "&" + element.name + "=" + element.value;
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
	forE: function() {
		var args = Array.prototype.slice.call(arguments);
		var func = args.shift();
		var data = Array();
		if(typeof func === "function") {
			for (var i = 0, len = this.elements.length; i < len; i++) {
				args.unshift(this.elements[i], i );
				data.push(func.apply(null, args));
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
			this.forE(function(e, j, ele) {
				if(e == ele) {
					this.elements.splice( j, 1 );
				}
			}, arguments[i]);
		};
	},
	removeAt: function() {
		arguments.sort(this.desc);
		for (var i = 0, len = arguments.length; i < len; i++) {
			this.elements.splice( arguments[i] - i , 1);
		}
	},
	addEvent: function() {
		var event, fun, func,args;
		args = Array.prototype.slice.call(arguments);
		event = args.shift();
		func = fun = args.shift();
		if(args.lenght > 0)
		{
			func = function(e)
			{
				fun.apply(this, arguments);  //继承监听函数,并传入参数以初始化;
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
		request: function(method, url, msg, async) {
			this.getHttp();
			this.responseCallback = null;
			this.http.open( url?"GET":method, url || method, async || true);  
			this.http.onreadystatechange = this.response;  
			this.http.send( msg );  
		},
		response: function() {
			if (this.http.readyState == 4) {  
				if (this.http.status == 200) {  
					//var text = decodeURI( this.http.responseText );
				}
				this.responseCallback(this.http.responseText, this.http.status, this.http);
			}
		},
		responseCallback: null,
		get: function(url, func) {
			this.request(url);
			this.responseCallback = func;
		},
		post: function(url, data, func) {
			this.request("POST", url , data );
			this.responseCallback = func;
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