$(document).ready(function () {
    $("#weight .grid").draggable({
        connectToSortable: ".row",
        helper: "clone",
        opacity: .3,
        revert: "invalid",
        start: function () {
            $("#main").addClass("hover");
        },
        stop: function () {
            $("#main").removeClass("hover");
        }
    });
    $("#main .row").sortable({
        connectWith: ".row"
    });
    $(".panel .fa-close").click(function () {
        $(this).parent().parent().addClass("min");
    });
    $(".panel>.head>.title").click(function () {
        var panel = $(this).parent().parent();
        if (panel.hasClass("min")) {
            panel.removeClass("min");
        }
    });
    $(".menu>li>.head").click(function () {
        $(this).parent().toggleClass("active");
    });
    $.htmlClean($("#main").html(), {
        format: true,
        allowedAttributes: [
            ["id"],
            ["class"],
            ["data-toggle"],
            ["data-target"],
            ["data-parent"],
            ["role"],
            ["data-dismiss"],
            ["aria-labelledby"],
            ["aria-hidden"],
            ["data-slide-to"],
            ["data-slide"]
        ]
    });
});
//# sourceMappingURL=ui.js.map