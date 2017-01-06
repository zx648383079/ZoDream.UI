$(document).ready(function () {
    $(".leftMenu .navicon").click(function () {
        $(".leftMenu").toggleClass("min");
    });
    $(".leftMenu li>a").click(function () {
        var li = $(this).parent();
        if (li.hasClass("active")) {
            li.removeClass("active");
            return;
        }
        $(".leftMenu li").removeClass("active");
        li.addClass("active");
    });
    $(".tabHeader li").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
        $(".tabContent iframe").eq($(this).index()).addClass("active").siblings().removeClass("active");
    });
    $(".tabHeader .fa-close").click(function () {
        var li = $(this).parent();
        $(".tabContent iframe").eq(li.index()).remove();
        li.remove();
    });
    $(window).resize(function () {
        $(".table").css("height", $(document).height() + "px");
    });
});
