(function() {
	/**
	 * 导航栏
	 */
	Z(".nav .brand").addEvent('click',function() {	
		if(!Z(".nav ul").attr("class"))
		{
			Z().attr("class","open");
			Z(".short").addClass("open");
		}else{
			Z().attr("class","");
			Z(".short").removeClass("open");
		}
	});
	/**
	 * 弹出框及遮罩
	 */
	Z(".close").addEvent('click', function() {
		Z('.shade,#create').hide();
	});
	Z(".add").addEvent('click', function() {
		Z('.shade,#create').hide();
		var obj = document.createElement("li");
		obj.innerHTML = Z("@title").val();
		Z(obj).addEvent('click', zodream.selected ).attr( "draggable", "true")
			.addEvent('dragstart', zodream.dragstart ).addEvent('dragover', zodream.dragover )
			.addEvent('drop', zodream.drop );;
		
		if( zodream.selectElement === null) {
			Z(".editbox ul").addChild(obj);
			return;
		}
		
		zodream.addElement(obj, zodream.selectElement);
		
		
	});
	Z(".create").addEvent('click', function() {
		Z('.shade,#create').show();
	});
	
	/**
	 * 自定义全局方法
	 */
	zodream.extend({
		selectElement: null,
		select: function( element ) {
			if(this.selectElement) {
				Z(this.selectElement).css("background-color", "transparent");				
			}
			this.selectElement = element;
			
			if(this.selectElement) {
				Z(this.selectElement).css("background-color", "#e82");		
			}
		},
		selected: function() {
			var child = Z(this).getChildren( "ul");
			if( child.length < 1 || Z(child).css("display") == "none" ) {
				zodream.select(this);
			};
		},
		more: function() {
			Z(Z(this).next()).toggle();
			if(Z(this).html() == "+") {
				Z(this).html("-");			
			}else {
				zodream.select(Z(this).parents());
				Z(this).html("+");
			}
		},
		addElement: function( obj , element) {
			var uls = Z(element).getChildren("ul");
			if(uls.length > 0) {
				Z(uls[0]).addChild(obj);
				return;
			}
			var span = document.createElement("span");
			span.innerHTML = "+";
			span.className = "more";
			Z(span).addEvent('click', zodream.more);
			var ul = document.createElement("ul");
			ul.appendChild( obj );
			Z(ul).addEvent('dragover', zodream.dragover ).addEvent('drop', zodream.drop );
			Z(element).addChild(span);
			Z(element).addChild(ul);	
		},
		dragElement: null,
		dragstart: function(ev) {
			zodream.dragElement = ev.target;
			ev.dataTransfer.setData("Text", "id");
		},
		dragover: function(ev) {
			ev.stopPropagation();
			ev.preventDefault();
			zodream.select(ev.target);
		},
		drop: function(ev) {
			ev.stopPropagation();
			ev.preventDefault();
			if(zodream.dragElement) {
				var parent = Z(zodream.dragElement).parents();
				zodream.addElement( zodream.dragElement , ev.target);
				if(Z(parent).getChildren("li").length < 1) {
					Z(Z(parent).prev()).removeSelf();
					Z(parent).removeSelf();
				}
			}
			zodream.dragElement = null;
		},
	});
	/**
	 * 拖拽
	 */
	Z(".editbox li").attr( "draggable", "true");
	Z(".editbox li").addEvent('dragstart', zodream.dragstart );
	Z(".editbox li,.editbox ul").addEvent('dragover', zodream.dragover );
	Z(".editbox li,.editbox ul").addEvent('drop', zodream.drop );
	
	/**
	 * 展开分类
	 */
	Z(".editbox li .more").addEvent('click', zodream.more);
	/**
	 * 选中分类
	 */
	Z(".editbox li").addEvent('click', zodream.selected );
	/**
	 * 操作分类
	 */
	Z(".editbox .tool a").addEvent('click', function() {
		Z(".editbox li", true ).forE(function(e , i , ele) {
			if(Z(e).css("background-color") !== "transparent") {
				switch (Z(ele).html()) {
					case "删除":
						if(Z(e).getSibling().length < 1) {
							Z(Z(Z(e).parents()).prev()).removeSelf();
							Z(Z(e).parents()).removeSelf();
						}else {
							Z(e).removeSelf();							
						}
						break;
					case "上移":
						var pre = Z(e).prev();
						if(pre) {
							Z(pre).insertBefore(e);
						}
						break;
					case "下移":
						var next = Z(e).next();
						if(next) {
							Z(next).insertAfter(e);
						}
						break;
					default:
						break;
				};
			}
		}, this );
	});
})();