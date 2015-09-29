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
})

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

