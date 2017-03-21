 class SelectBox {
     constructor(
         public element: JQuery,
         options?: SelectBoxOptions
     ) {
         this.options = $.extend({}, new SelectBoxDefaultOptions(), options);

     }

     public options: SelectBoxOptions;

}

interface SelectBoxOptions {
    data?: any,
    onClick?: (item: string, element: JQuery) => any
 }

 class SelectBoxDefaultOptions implements SelectBoxOptions {
     
 }
 
 ;(function($: any) {
  $.fn.select = function(options ?: SelectBoxOptions) {
    return new SelectBox(this, options); 
  };
})(jQuery);