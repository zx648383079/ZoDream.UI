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