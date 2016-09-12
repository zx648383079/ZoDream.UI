if ("Notification" in window) {
    var ask = Notification.requestPermission();
    ask.then(function (permission) {
        if (permission === "granted") {
            var msg = new Notification("Title", {
                body: "",
                icon: "",
            });
            msg.addEventListener("click", function (event) {
                alert("");
            });
        }
    });
}
$(document).ready(function () {
    $(".expand .title").click(function () {
        $(this).parent().toggleClass("active");
    });
    $(".tab .tab-header>li").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
        $(this).parent().parent().find(".tab-content>li").eq($(this).index()).addClass("active").siblings().removeClass("active");
    });
});
//# sourceMappingURL=zodream.js.map