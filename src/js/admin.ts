$(function() {
    $(document).on('click', '.tab-box .tab-header .tab-item', function() {
        const $this = $(this);
        const index = $this.index();
        toggleTab($this, $this.closest('.tab-box').find('.tab-body .tab-item').eq(index), index);
    }).on('click', '.tab-box .tab-header .fa-close', function() {
        const li = $(this).closest('.tab-item');
        li.parents(".tab-box").find(".tab-body .tab-item").eq(li.index()).remove();
        li.remove();
    }).on('tab:toggle', '.tab-box .tab-body .tab-item', function() {
        const $this = $(this);
        if ($this.hasClass('active')) {
            return;
        }
        const index = $this.index();
        toggleTab($this.closest('.tab-box').find('.tab-header .tab-item').eq(index), $this, index);
    });
    const toggleTab = (tabHeader: JQuery, tabBody: JQuery, index: number) => {
        tabHeader.addClass('active').siblings().removeClass('active');
        tabBody.addClass('active').siblings().removeClass('active');
        tabBody.trigger('tab:actived', index);
    };
});