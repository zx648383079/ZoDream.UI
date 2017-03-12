 class Select {
     constructor(
         public element: JQuery,
         options?: SelectOptions
     ) {
         this.options = $.extend({}, new SelectDefaultOptions(), options);
         if (!this.options.name) {
             this.options.name = this.element.attr("data-name");
         }
         this._input = $('input[name="'+this.options.name+'"]');
     }

     public options: SelectOptions;

     private _box: JQuery;

     private _select: JQuery;

     private _input: JQuery;

     private _data: any;

     set data(arg: any) {
        this.data = arg;
     }

     get data(): any {
         return this._data;
     }

     private _init() {
         this._box = $("#" + this.options.name + '-select');
         if (this._box.length == 0) {
             this._createHtml();
         }
         this._select = this._box.find("ul");
     }

     private _createHtml() {
          this._box = $('<div id="'+ this.options.name + '-select' +'" class="select-box"><ul></ul></div>');
          $(document.body).append(this._box);
     }

     public refresh() {
        let html = '';
        let instance = this;
        $.each(this._data, function(i, item) {
            if (instance.options.textTag) {
                html += '<li data-value="'+ item[instance.options.valueTag] +'">'+ item[instance.options.textTag]  + '</li>';
                return;
            }
            html += '<li data-value="'+ i +'">'+ item + '</li>';
        });
        this._select.html(html);
     }

     public item(value: string| number): JQuery {
        return this._select.find('li[data-value="'+value+'"]');
     }

     public selected(value: string| number) {
         this._select.find("li").removeClass("selected");
         this.item(value).addClass("selected");
     }

     private _bindEvent() {
         let instance = this;
         this.element.click(function() {
             instance.show();
         });
         $(document).click(function() {
            instance.hide();
         });
         this._select.click(function(e) {
             if (e.stopPropagation) {
                e.stopPropagation();
                return;
             }
             e.cancelBubble = true;
         });
         this._select.on("click", "li", function() {
            let item = $(this);
            item.addClass("selected").siblings().removeClass("selected");
            let value = item.attr("data-value");
            instance._input.val(value);
            instance.options.onClick.call(instance, value, item);
         });
     }

     public show() {
         this._box.show();
     }

     public hide() {
         this._box.hide();
     }
}

interface SelectOptions {
    name?: string,
    default?: string | number,
    data?: any,
    textTag?: string,
    valueTag?: string,
    onClick?: (item: string, element: JQuery) => any
 }

 class SelectDefaultOptions implements SelectOptions {
     
 }
 
 ;(function($: any) {
  $.fn.select = function(options ?: SelectOptions) {
    return new Select(this, options); 
  };
})(jQuery);