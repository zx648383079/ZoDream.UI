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
		zodream.ajax.post(zodream.url(), Z('#create form').getForm(), function(msg){
			if(msg.status == 0)
			{
				Z('.shade,#create').hide();
				var obj = document.createElement("li");
				obj.innerHTML = Z("@title").val();
				Z(obj).addEvent('click', zodream.selected ).attr( "draggable", "true")
					.addEvent('dragstart', zodream.dragstart ).addEvent('dragover', zodream.dragover )
					.addEvent('drop', zodream.drop );;
				
				if( zodream.selectElement === null) {
					Z(".treebox ul").addChild(obj);
					return;
				}
				zodream.addElement(obj, zodream.selectElement);
				Z().clearForm('#create form');
			}
		});
	});
	Z(".create").addEvent('click', function() {
		Z('.shade,#create').show();
		Z('@pid').val(Z(zodream.selectElement).attr("data"));
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
			if(this.selectElement === element) {
				this.selectElement = null;
				return;
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
				var pid = 0,
					id = Z(zodream.dragElement).attr("data");
				if(ev.target.tagName.toLowerCase() == "ul") {
					ev.target.appendChild(zodream.dragElement);
					pid = Z(Z(ev.target).parents()).attr("data");
				}else {
					zodream.addElement( zodream.dragElement , ev.target);
					pid = Z(ev.target).attr("data");
				}
				zodream.ajax.get(zodream.url() + "&id=" + id + "&mode=parent&pid=" + pid);
				
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
	Z(".treebox li").attr( "draggable", "true");
	Z(".treebox li").addEvent('dragstart', zodream.dragstart );
	Z(".treebox li,.treebox ul").addEvent('dragover', zodream.dragover );
	Z(".treebox li,.treebox ul").addEvent('drop', zodream.drop );
	
	/**
	 * 展开分类
	 */
	Z(".treebox li .more").addEvent('click', zodream.more);
	/**
	 * 选中分类
	 */
	Z(".treebox li").addEvent('click', zodream.selected );
	/**
	 * 操作分类
	 */
	Z(".treebox .tool a").addEvent('click', function() {
		Z(".treebox li", true ).forE(function(e , i , ele) {
			if(Z(e).css("background-color") !== "transparent") {
				var id = Z(e).attr("data");
				switch (Z(ele).html()) {
					case "删除":
						if(Z(e).getSibling().length < 1) {
							Z(Z(Z(e).parents()).prev()).removeSelf();
							Z(Z(e).parents()).removeSelf();
						}else {
							Z(e).removeSelf();							
						}
						zodream.ajax.get(zodream.url() + "&id=" + id + "&mode=delete");
						break;
					case "上移":
						var pre = Z(e).prev();
						if(pre) {
							Z(pre).insertBefore(e);
							zodream.ajax.get(zodream.url() + "&id=" + id + "&mode=move&num=1");
						}
						break;
					case "下移":
						var next = Z(e).next();
						if(next) {
							Z(next).insertAfter(e);
							zodream.ajax.get(zodream.url() + "&id=" + id + "&mode=move&num=2");
						}
						break;
					case "编辑":
						Z('@id').val(id);
						Z("#create .head").html("编辑");
						Z(".add").html("保存");
						zodream.ajax.get(zodream.url() + "&id=" + id, function(msg) {
							if(msg.status == 0) {
								Z("@title").val(msg.data.title);
								Z("@content").val(msg.data.content);
								Z('.shade,#create').show();
							}
						});
						break;
					default:
						break;
				};
			}
		}, this );
	});
})();