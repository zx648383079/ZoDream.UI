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
    $(".expand .title").on('click', function () {
        $(this).parent().toggleClass("active");
    });
    $(".tab .tab-header>li").on('click', function () {
        $(this).addClass("active").siblings().removeClass("active");
        $(this).parent().parent().find(".tab-content>li").eq($(this).index()).addClass("active").siblings().removeClass("active");
    });
    var content = $("#productShow #content");
    if (content.width() < 600) {
        content.find("table").each(function (index, elem) {
            var table = $(elem);
            table.css("width", "100%");
            var html = table.html();
            var matches = [];
            var match;
            var patt = new RegExp('<tr([^<>]*)>\s*(<td[^<>]*>.+?<\/td>)(.+?)<\/tr>', 'g');
            while ((match = patt.exec(html)) != null) {
                matches.push(match);
            }
            var td = '<td rowspan="' + matches.length + '"><div style="width:' + (table.width() - 100) + 'px; overflow:auto"><table style="width:877px">';
            $(matches).each(function (i, item) {
                td += '<tr' + item[1] + '>' + item[3] + '</tr>';
            });
            td += '</table></div></td>';
            html = '';
            $(matches).each(function (i, item) {
                if (i == 0) {
                    html += '<tr' + item[1] + '>' + item[2] + td + '</tr>';
                }
                else {
                    html += '<tr' + item[1] + '>' + item[2] + '</tr>';
                }
            });
            table.html(html);
        });
    }
});
