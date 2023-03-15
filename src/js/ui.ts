$(document).ready(function () {
    let weightOption = {
        sort: true,
        group: {
            name: 'advanced',
            pull: true,
            put: true
        },
        animation: 150
    };
    $("#weight .zd-list-view").sortable({
        sort: false,
        group: {
            name: 'advanced',
            pull: 'clone',
            put: false
        },
        animation: 150,
        onEnd: function(evt){
            let weight = $(evt.item).find('.weight-list');
            if (weight.length == 0) {
                return;
            }
            weight.sortable(weightOption);
        }
    });
    let propertyPanel = $("#property");
    let weightPanel = $("#weight");
    $("#main .weight-list").sortable(weightOption);
    $("#main").on("click", '.action .fa-remove', function() {
        $(this).parent().parent().remove();
    });
    $("#main").on("click", '.action .fa-gear', function() {
        propertyPanel.show();
    });
    $("#main").on("click", '.weight-list', function() {
        weightPanel.show();
    });
    $(".zd-tab .zd-tab-head .zd-tab-item").on('click', function() {
        let $this = $(this);
        $this.addClass("active").siblings().removeClass("active");
        $this.parents(".zd-tab").find(".zd-tab-body .zd-tab-item").eq($this.index()).addClass("active").siblings().removeClass("active");
    });
    $(".zd-panel .fa-close").on('click', function() {
        $(this).parent().parent().hide();
    });
});