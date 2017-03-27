$(document).ready(function() {
    $(".zd-tab .zd-tab-head .zd-tab-item").click(function() {
        let $this = $(this);
        $this.addClass("active").siblings().removeClass("active");
        $this.parents(".zd-tab").find(".zd-tab-body .zd-tab-item").eq($this.index()).addClass("active").siblings().removeClass("active");
    });
    $(".zd-tab .zd-tab-head .fa-close").click(function() {
        let li = $(this).parent();
        li.parents(".zd-tab").find(".zd-tab-body .zd-tab-item").eq(li.index()).remove();
        li.remove();
    });
});