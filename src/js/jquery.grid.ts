 /*!
 * jquery.grid - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
 class Grid {
     constructor(
         public element: JQuery,
         options?: GridOptions
     ) {
         this.options = $.extend({}, new GridDefaultOptions(), options);
         this.refresh();
         let instance = this;
         $(window).on('resize', function() {
            instance.refresh();
         });
     }

     public options: GridOptions;

     public refresh() {
         let instance = this;
        this.element.each(function(i, element) {
            instance.refreshOne($(element));
        });
     }

     public refreshOne(element: JQuery) {
        let width: number = element.width();
        let items = element.find(this.options.tag);
        $(this.options.data).each(function(i: string| number, item: Object) {
            let size = Size.parse(item);
            if (typeof i == 'number') {
                size.setSize(items.eq(i), width);
            } else {
                size.setSize(element.find(i), width);
            }
        });
     }
}

class Size {
    constructor(
        width: number| Object | string,
        height?: number | string,
        public option: Object = {}
    ) {
        if (typeof width == 'object') {
            this.option = width;
        } else {
            this.option['width'] = width;
            this.option['height'] = height;
        }
        for (let i in this.option) {
            if (this.option.hasOwnProperty(i)) {
                this.option[i] = Size.parseNumber(this.option[i]);
            }
        }
    }

    public setSize(element: JQuery, width: number = 1) {
        if (element.length < 1) {
            return;
        }
        let obj: any = $.extend({}, this.option);
        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                obj[i] = obj[i] * width + 'px';
            }
        }
        element.css(obj);
    }

    public static parseNumber(num: number | string): number {
        if (typeof num == 'number') {
            return num;
        }
        let a = parseFloat(num);
        if (num.indexOf('%') > 0) {
            return a / 100;
        }
        if (num.indexOf('‰') > 0) {
            return a / 1000;
        }
        return a;
    }

    public static parse(obj: Object | Array<string|number> | Size): Size {
        if (obj instanceof Size) {
            return obj;
        }
        if (obj instanceof Array) {
            return new Size(obj[0], obj[1]);
        }
        return new Size(obj);
    }
}

interface GridOptions {
     tag?: string,
     data?: Object | Array<Size | Object>;
 }

 class GridDefaultOptions implements GridOptions {
     tag: 'img';
 }
 
 ;(function($: any) {

  $.fn.grid = function(options ?: GridOptions) {
    return new Grid(this, options); 
  };
  
})(jQuery);