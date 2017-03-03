class Pager {
    constructor(
        public element: JQuery,
        option?: PagerOption
    ) {
        this.option = $.extend({}, new PagerDefaultOption(), option);
    }

    public option: PagerOption;
}

interface PagerOption {

}

class PagerDefaultOption implements PagerOption {

}


;(function($: any) {
  $.fn.pager = function(option ?: PagerOption) {
    return new Pager(this, option); 
  };
})(jQuery);