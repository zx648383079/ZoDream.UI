$(document).ready(function () {
    $("#weight .grid").draggable({
        connectToSortable: ".row",
        helper: "clone",
        opacity: .3,
        revert: "invalid"
    });
    $("#main .row").sortable({
        connectWith: ".row"
    });
    $(".panel .fa-close").click(function() {
        $(this).parent().parent().addClass("min");
    });

    $(".panel>.head>.title").click(function() {
        let panel = $(this).parent().parent();
        if (panel.hasClass("min")) {
            panel.removeClass("min");
        }
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
  })
});