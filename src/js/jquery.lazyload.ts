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
       public diff: number|Function = 0
    ) {
       element.on('lazy-refresh', () => {
           this.refresh();
       });
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
       if (this.mode == LazyMode.once && this._lastHeight != undefined) {
           return false;
       }
       if (this.element.parent().length < 1) {
           // 判断元素是否被移除
           return false;
       }
       if (typeof this.diff == 'function') {
           return this.diff.call(this, height, bottom);
       }
       let top = this.element.offset().top;
       return top + this.diff >= height && top < bottom;
    }

    public run(height: number, bottom: number, index: number = 0): boolean {
       // if (!this.canRun(height, bottom)) {
       //     return false;
       // }
       this.callback.call(this, this.element, height, bottom, index);
       this._lastHeight = height;
       return true;
    }
}

class Lazy {
    constructor(
       public element: JQuery,
       options ? : LazyOptions
    ) {
       this.options = $.extend({}, new LazyDefaultOptions(), options);
       let $window = $(window);
       let instance = this;
       this._init();
       $window.scroll(function () {
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
       let index: number = 0;
       for (let i = 0, length = this._data.length; i < length; i ++) {
           let item = this._data[i];
           if (item.canRun(height, bottom)) {
               item.run(height, bottom, index ++);
           }
           // if (item.run(height, bottom) && item.mode == LazyMode.once) {
           //     this._data.splice(i, 1);
           // }
       }
    }
    // 暂时只做一次
    private _init() {
       this._data = [];
       let instance = this;
       this.element.each(function (i, ele) {
           let item = new LazyItem(
               $(ele), 
               typeof instance.options.callback != 'function' ? Lazy.getMethod(instance.options.callback) : instance.options.callback,
               instance.options.mode, 
               instance.options.diff);
           instance._data.push(item);
       });
       $.each(this.options.data, (i, item: any) => {
           if (item instanceof LazyItem) {
               this._data.push(item);
               return;
           }
           if (typeof i == 'string') {
               item['tag'] = i;
           }
           $(item.tag).each(function (i, ele) {
               let lazyItem = new LazyItem(
                   $(ele), 
                   typeof item.callback != 'function' ? Lazy.getMethod(item.callback) : item.callback, 
                   item.mode || LazyMode.once, 
                   item.diff || 0 );
               instance._data.push(lazyItem);
           })
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
Lazy.addMethod('img', function (imgEle: JQuery) {
   let img = imgEle.attr('data-src');
   $("<img />")
       .bind("load", function () {
           if (imgEle.is('img') || imgEle.is('video')) {
               imgEle.attr('src', img);
               return;
           }
           imgEle.css('background-image', 'url(' + img + ')');
       }).attr('src', img);
});
/**
 * 加载模板，需要引用 template 函数
 */
Lazy.addMethod('tpl', function (tplEle: JQuery) {
   let url = tplEle.attr('data-url');
   tplEle.addClass('lazy-loading');
   let templateId = tplEle.attr('data-tpl');
   $.get(url, data => {
       let html = '';
       if (typeof data === 'object') {
            if (data.code != 200) {
                return;
            }
            html = typeof data.data != 'string' ? template(templateId, data.data) : data.data;
       } else {
           html = data;
       }
       tplEle.removeClass('lazy-loading');
       tplEle.html(html);
       tplEle.trigger('lazyLoaded');
   }, typeof templateId === 'undefined' ? null : 'json');
});
/**
 * 滚动加载模板，需要引用 template 函数
 */
Lazy.addMethod('scroll', function (moreEle: JQuery) {
   let page: number = parseInt(moreEle.attr('data-page') || '0') + 1;
   let url = moreEle.attr('data-url');
   let templateId = moreEle.attr('data-tpl');
   let target = moreEle.attr('data-target');
   $.getJSON(url, {
       page: page
   }, function (data) {
       if (data.code != 200) {
           return;
       }
       if (typeof data.data != 'string') {
           data.data = template(templateId, data.data);
       }
       $(target).html(data.data);
       moreEle.attr('data-page', page);
   });
});

interface LazyOptions {
   [setting: string]: any,
   data ? : {[tag: string]: string | Object} | Array <Object> | Array < Lazy > ,
   tag ? : string | JQuery,
   callback ? : string | Function, // 回调
   mode ? : LazyMode, //执行模式
   diff ? : number|Function, //距离可视化区域的距离
}

class LazyDefaultOptions implements LazyOptions {
    mode: LazyMode = LazyMode.once;
    diff: number = 0
}

;
(function ($: any) {
    $.fn.lazyload = function (options ? : LazyOptions) {
        return new Lazy(this, options);
    };
})(jQuery);