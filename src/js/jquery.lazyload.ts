 /*!
 * jquery.lazyload - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */

 enum LazyMode {
     once,
     every
 }

 class LazyItem {
     constructor(
         public element: JQuery,
         public callback: Function,
         public mode: LazyMode = LazyMode.once,
         public diff: number = 0
     ) {
        
     }

     private _lastHeight: number; // 上次执行的高度
     /**
      * 重新刷新
      */
     public refresh() {
         this._lastHeight = undefined;
     }
     /**
      * 判断能否执行
      * @param height 
      * @param bottom 
      */
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
        this.callback.call(this, this.element);
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
            instance.scrollInvote();
         });
         // 首次执行
         this.scrollInvote();
     }

     public options: LazyOptions;

     private _data: Array<LazyItem>;

     /**
      * 页面滚动触发更新
      */
     public scrollInvote() {
         let $window = $(window);
        let height = $window.scrollTop();
        let bottom = $window.height() + height;
        this.run(height, bottom);
     }

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
        if (typeof this.options.callback != 'function') {
             this.options.callback = Lazy.getMethod(this.options.callback);
        }
        this._data = [];
        let instance = this;
        this.element.each(function(i, ele) {
            let item = new LazyItem($(ele), instance.options.callback, instance.options.mode, instance.options.diff);
            instance._data.push(item);
        });
    }

    /**
     * 全局方法集合
     */
    public static methods: {[name: string]: Function} = {};

    /**
     * 添加方法
     * @param name 
     * @param callback 
     */
    public static addMethod(name: string, callback: Function) {
        this.methods[name] = callback;
    }

    /**
     * 获取方法
     * @param name 
     */
    public static getMethod(name: string): Function {
        return this.methods[name];
    }
}
/**
 * 加载图片，如需加载动画控制请自定义
 */
Lazy.addMethod('img', function(imgEle: JQuery) {
    var img = imgEle.attr('data-original');
    $("<img />")
    .bind("load", function() {
        imgEle.attr('src', img);
    }).attr('src', img);
});
/**
 * 加载模板，需要引用 template 函数
 */
Lazy.addMethod('tpl', function(tplEle: JQuery) {
    var url = tplEle.attr('data-url');
    var templateId = tplEle.attr('data-tpl');
    $.getJSON(url, function(data) {
        if (data.code != 0) {
            return;
        }
        if (typeof data.data != 'string') {
            data.data = template(templateId, data.data);
        }
        tplEle.html(data.data);
    });
});

interface LazyOptions {
    [setting: string]: any,
    data?: {[tag: string]: string | Object} | Array<Object> | Array<Lazy>,
    tag?: string| JQuery,
    callback?: string | Function, // 回调
    mode?: LazyMode,   //执行模式
    diff?: number,     //距离可视化区域的距离
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