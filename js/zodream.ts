$(document).ready(function() {
    $(".expand .title").click(function() {
        $(this).parent().toggleClass("active");
    });

    $(".tab .headers>li").click(function() {
        $(this).addClass("active").siblings().removeClass("active");
        $(this).parent().parent().find(".items>li").eq($(this).index()).addClass("active").siblings().removeClass("active");
    });
});