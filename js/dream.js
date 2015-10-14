(function() {
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
	Z(".close").addEvent('click', function() {
		Z('.shade,#create').hide();
		Z('.shade,#view').hide();
	});
	Z(".create").addEvent('click', function() {
		Z('.shade,#create').show();
	});
	Z(".editbox li .more").addEvent('click', function() {
		Z(Z(this).next()).toggle();
		if(Z(this).html() == "+") {
			Z(this).html("-");			
		}else {
			Z(this).html("+");
		}
	});
})();