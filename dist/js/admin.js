$(document).ready(function () {
    $(".zd-tab .zd-tab-head .zd-tab-item").on('click', function () {
        var $this = $(this);
        $this.addClass("active").siblings().removeClass("active");
        $this.parents(".zd-tab").find(".zd-tab-body .zd-tab-item").eq($this.index()).addClass("active").siblings().removeClass("active");
    });
    $(".zd-tab .zd-tab-head .fa-close").on('click', function () {
        var li = $(this).parent();
        li.parents(".zd-tab").find(".zd-tab-body .zd-tab-item").eq(li.index()).remove();
        li.remove();
    });
});
