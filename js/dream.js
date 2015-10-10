jQuery(document).ready(function($){
	$(".nav .brand").click(function(){
		if(!$(".nav ul").attr("class"))
		{
			$(".nav ul").attr("class","open");
			$(".short").addClass("open");
		}else{
			$(".nav ul").attr("class","");
			$(".short").removeClass("open");
		}
	})
});

var zodream = function(name) {
	this.elements = [];
	this.init(name);
	if(window.zodream == undefined){
		window.zodream = this;
	}
	return this;
};

zodream.prototype = {
	init: function(name) {
		if(typeof name === "string")
		{
			var names = name.split(" "),
				element = [window.document];
			for (var i = 0,len = names.length; i < len; i++) {
				var eles = Array();
				for (var j = 0,leng = element.length; j < leng; j++) {
					var ele = element[j];
					eles.push(this.getChild(names[i], ele));
				}
				element = eles;
			};
			this.elements = element;
		}else {
			this.elements = [name];
		}
	},
	ready: function( wait ) {
		wait("zodream");
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
				return parent.getElementById(name);
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
		var parent = arguments[1] || window.document,
			elements = parent.getElementByTagName("*"),
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
			for (var i = 0, len = this.elements.length; i < len; i++) {
				this.elements[i][name] = arguments[1];
			};
		}
	},
	addClass: function(className) {
		for (var i = 0, len = this.elements.length; i < len; i++) {
			this.elements[i].class += " " + className;
		};
	},
	removeClass: function(className) {
		var classNames = this.attr('class');
		this.attr('class', classNames.replace(className, ""));
	},
	css: function(name) {
		if(arguments[1] === undefined) {
			return this.elements[0].style[name];
		}else {
			for (var i = 0, len = this.elements.length; i < len; i++) {
				this.elements[i].style[name] = arguments[1];
			};
		}
	},
	html: function() {
		if(arguments[0] === undefined) {
			return this.elements[0].innerHTML;
		}else {
			for (var i = 0, len = this.elements.length; i < len; i++) {
				this.elements[i].innerHTML = arguments[1];
			};
		}
	},
	text: function() {
		
	},
	val: function() {
		if(arguments[0] === undefined) {
			return this.elements[0].value;
		}else {
			for (var i = 0, len = this.elements.length; i < len; i++) {
				this.elements[i].value = arguments[1];
			};
		}
	},
	forE: function() {
		var func = arguments.shift();
		if(typeof func === "function") {
			for (var i = 0, len = this.elements.length; i < len; i++) {
				var args = arguments;
				args.unshift(this.elements[i], i );
				func.apply(null, args);
			};
		}
	},
	remove: function() {
		for (var i = 0, len = arguments.length; i < len; i++) {
			for (var j = 0; j < this.elements.length; j++) {
				if(this.elements[j] == arguments[i]) {
					this.elements.splice(j,1);
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
	addEvent: function(event, func) {
		for (var i = 0, len = this.elements.length; i < len; i++) {
			var element = this.elements[i];
			if(element.attachEvent){
				element.attachEvent('on' + event, func);
			}else if(element.addEventListener){
				element.addEventListener(event, func, false);
			}else{
				element["on" + event] = func;
			}
		};
	},
	removeEvent: function(event, func) {
		for (var i = 0, len = this.elements.length; i < len; i++) {
			var element = this.elements[i];
			if (element.removeEventListener) {
				element.removeEventListener(event, func, false);
			} else if (element.detachEvent) {
				element.detachEvent("on" + event, func);
			}else {
				delete element["on" + event];
			}
		};
	},
	desc: function(a, b) {
		return a>b?1:-1;
	},
	asc: function(a, b) {
		return a<b?1:-1;
	}
};

/**
 * 编辑器
 */
var defaults = {
	width: "100%",
	height: 50,
	border: 1
}
var editor = function( id ){
	this.settings = {};
	this.create( id , arguments[1] || null);
};

editor.prototype = {
	attr: function(id, proper) {
		return this.getProper( this.getElement(id) , proper , arguments[2] || null);
	},
	getProper: function( element, proper, value) {
		if(typeof proper === "string" && value === null)
		{
			return element[proper];
		}else if(value !== null){
			element[proper] = value;
		}else if(typeof proper === "object") {
			for (var key in proper) {
				if (proper.hasOwnProperty(key)) {
					element[key] = proper[key];
				}
			}
		}	
	},
	css: function( id , proper ) {
		return this.getProper( this.getElement(id).style , proper , arguments[2] || null);
	},
	create: function( id ) {
		this.textBox = this.getElement(id);
		this.hidetTextBox();
		this.extend( defaults, arguments[1] || null );
		this.addEditor();
		this.write();
	},
	hidetTextBox: function() {
		this.css( this.textBox , "display" ,"none");
	},
	addEditor: function() {
		var edit = document.createElement('iframe');
		this.attr(edit, {
			'id': 'editor',
			'frameBorder': this.settings.border
		});
		this.css(edit, {
			'width': this.tostring( this.settings.width , "px"),
			'height': this.tostring( this.settings.height , "px")
		});
		this.inertNext(edit , this.textBox);
		this.win = edit.contentWindow;
		this.doc = this.win.document;
		this.doc.designMode = 'On';         
		this.doc.contentEditable = true;
	},
	inertNext: function( newElement , element ) {
		var parent = element.parentNode;
   		if( parent.lastChild == element ) {
			parent.appendChild( newElement );
		}else {
			parent.insertBefore( newElement, element.nextSibling );
		}
	},
	tostring: function(value , after ) {
		if(typeof value === "string") {
			return value;
		}else {
			return value + after;
		}
	},
	extend: function() {
		for (var i = 0,len = arguments.length; i < len; i++) {
			var arg = arguments[i];
			if(typeof arg === "object") {
				for (var key in arg) {
					if (arg.hasOwnProperty(key)) {
						this.settings[key] = arg[key];
					}
				}
			}
		}
	},
	getElement: function( id ) {
		return typeof(id) === "string" ? document.getElementById(id) : id;
	},
	getSet: function(key) {
		return this.settings[key];
	},
	getHtml: function() {
		return this.doc.body.innerHTML;
	},
	getString: function() {
		
	},
	write: function() {
		this.doc.open();
		this.doc.writeln('<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body></body></html>');
		this.doc.close();
	},
}

