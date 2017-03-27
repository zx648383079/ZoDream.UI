 enum LazyMode {
     once,
     every
 }

 class LazyItem {
     constructor(
         public element: JQuery,
         public callback: (element: JQuery)=>void,
         public mode: LazyMode = LazyMode.once,
         public diff: number = 0
     ) {
        
     }

     private _lastHeight: number; // 上次执行的高度

     public canRun(height: number, bottom: number): boolean {
        if (this.mode == LazyMode.once && this._lastHeight) {
            return false
        }
        let top = this.element.offset().top;
        return top + this.diff >= height && top < bottom;
     }

     public run(height: number, bottom: number): boolean {
        if (this.mode == LazyMode.once && this._lastHeight) {
            return false;
        }
        let top = this.element.offset().top;
        if (top + this.diff < height || top >= bottom) {
            return false;
        }
        this.callback(this.element);
        this._lastHeight = height + this.diff;
        return true;
     }
 }
 
 class Lazy {
     constructor(
         public element: JQuery,
         options?: LazyOptions
     ) {
         this.options = $.extend({}, new LazyDefaultOptions(), options);
         let $window = $(window);
         let instance = this;
         this._init();
         $window.scroll(function() {
            let height = $window.scrollTop();
            let bottom = $window.height() + height;
            instance.run(height, bottom);
         });
     }

     public options: LazyOptions;

     private _data: Array<LazyItem>;

     public run(height: number, bottom: number) {
        if (!this._data) {
            return;
        }
        for(let i = this._data.length - 1; i >= 0; i --) {
            let item = this._data[i];
            if (item.run(height, bottom) && item.mode == LazyMode.once) {
                this._data.splice(i, 1);
            }
        }
     }
     // 暂时只做一次
     private _init() {
        this._data = [];
        let instance = this;
        this.element.each(function(i, ele) {
            let item = new LazyItem($(ele), instance.options.callback, instance.options.mode, instance.options.diff);
            instance._data.push(item);
        });
     }

}

interface LazyOptions {
    data?: {[tag: string]: string | Object} | Array<Object> | Array<Lazy>,
    tag?: string| JQuery,
    callback?: (element: JQuery)=>void,
    mode?: LazyMode,
    diff?: number,  
 }

 class LazyDefaultOptions implements LazyOptions {
    mode: LazyMode = LazyMode.once;
    diff: number = 0
 }
 
 ;(function($: any) {
  $.fn.lazyload = function(options ?: LazyOptions) {
    return new Lazy(this, options); 
  };
})(jQuery);