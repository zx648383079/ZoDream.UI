$(function () {
    $(document).on('click', '.tab-box .tab-header .tab-item', function () {
        var $this = $(this);
        var index = $this.index();
        toggleTab($this, $this.closest('.tab-box').find('.tab-body .tab-item').eq(index), index);
    }).on('click', '.tab-box .tab-header .fa-close', function () {
        var li = $(this).closest('.tab-item');
        li.parents(".tab-box").find(".tab-body .tab-item").eq(li.index()).remove();
        li.remove();
    }).on('tab:toggle', '.tab-box .tab-body .tab-item', function () {
        var $this = $(this);
        if ($this.hasClass('active')) {
            return;
        }
        var index = $this.index();
        toggleTab($this.closest('.tab-box').find('.tab-header .tab-item').eq(index), $this, index);
    });
    var toggleTab = function (tabHeader, tabBody, index) {
        tabHeader.addClass('active').siblings().removeClass('active');
        tabBody.addClass('active').siblings().removeClass('active');
        tabBody.trigger('tab:actived', index);
    };
});
