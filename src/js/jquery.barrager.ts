class Darrager {
    constructor(
        public element: JQuery,
        options?: DarragerOptions
    ) {
        this.options = $.extend({}, new DarragerDefaultOptions(), options);
    }

    public options: DarragerOptions;
}


interface DarragerOptions {

}

class DarragerDefaultOptions implements DarragerOptions {
     
}

;(function($: any) {
    $.fn.barrager = function(options ?: DarragerOptions) {
      return new Darrager(this, options); 
    };
})(jQuery);