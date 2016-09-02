if ("Notification" in window) {
    let ask = Notification.requestPermission();
    ask.then( permission => {
        if ( permission === "granted") {
            let msg = new Notification("Title", {
                body: "",
                icon: "",
            });
            msg.addEventListener("click", event => {
                alert("");
            })
        }
    });
}
$(document).ready(function() {
    $(".expand .title").click(function() {
        $(this).parent().toggleClass("active");
    });

    $(".tab .headers>li").click(function() {
        $(this).addClass("active").siblings().removeClass("active");
        $(this).parent().parent().find(".items>li").eq($(this).index()).addClass("active").siblings().removeClass("active");
    });
});