 class Fly {
     constructor(
         public element: JQuery,
         options?: FlyOptions
     ) {
         this.setOptions(options);
         
         if (this.options.autoPlay) {
             this.play();
         }
     }

     public options: FlyOptions;

     public setOptions (options) {
      this.options = $.extend(true, {}, new FlyDefaultOptions(), options);
      let settings = this.options,
        start = settings.start,
        end = settings.end;

      this.element.css({marginTop: '0px', marginLeft: '0px', position: 'fixed'}).appendTo('body');
      // 运动过程中有改变大小
      if (end.width != null && end.height != null) {
        $.extend(true, start, {
          width: this.element.width(),
          height: this.element.height()
        });
      }
      // 运动轨迹最高点top值
      let vertex_top = Math.min(start.top, end.top) - Math.abs(start.left - end.left) / 3;
      if (vertex_top < settings.vertex_Rtop) {
        // 可能出现起点或者终点就是运动曲线顶点的情况
        vertex_top = Math.min(settings.vertex_Rtop, Math.min(start.top, end.top));
      }

      /**
       * ======================================================
       * 运动轨迹在页面中的top值可以抽象成函数 y = a * x*x + b;
       * a = curvature
       * b = vertex_top
       * ======================================================
       */

      let distance = Math.sqrt(Math.pow(start.top - end.top, 2) + Math.pow(start.left - end.left, 2)),
        // 元素移动次数
        steps = Math.ceil(Math.min(Math.max(Math.log(distance) / 0.05 - 75, 30), 100) / settings.speed),
        ratio = start.top == vertex_top ? 0 : -Math.sqrt((end.top - vertex_top) / (start.top - vertex_top)),
        vertex_left = (ratio * start.left - end.left) / (ratio - 1),
        // 特殊情况，出现顶点left==终点left，将曲率设置为0，做直线运动。
        curvature = end.left == vertex_left ? 0 : (end.top - vertex_top) / Math.pow(end.left - vertex_left, 2);

      $.extend(true, settings, {
        count: -1, // 每次重置为-1
        steps: steps,
        vertex_left: vertex_left,
        vertex_top: vertex_top,
        curvature: curvature
      });
    };

     public play() {
         this.move();
     }

     public move() {
      let settings = this.options,
        start = settings.start,
        count = settings.count,
        steps = settings.steps,
        end = settings.end;
      // 计算left top值
      let left = start.left + (end.left - start.left) * count / steps,
        top = settings.curvature == 0 ? start.top + (end.top - start.top) * count / steps : settings.curvature * Math.pow(left - settings.vertex_left, 2) + settings.vertex_top;
      // 运动过程中有改变大小
      if (end.width != null && end.height != null) {
        let i = steps / 2,
          width = end.width - (end.width - start.width) * Math.cos(count < i ? 0 : (count - i) / (steps - i) * Math.PI / 2),
          height = end.height - (end.height - start.height) * Math.cos(count < i ? 0 : (count - i) / (steps - i) * Math.PI / 2);
        this.element.css({width: width + "px", height: height + "px", "font-size": Math.min(width, height) + "px"});
      }
      this.element.css({
        left: left + "px",
        top: top + "px"
      });
      settings.count ++;
      // 定时任务
      let time = window.requestAnimationFrame($.proxy(this.move, this));
      if (count == steps) {
        window.cancelAnimationFrame(time);
        // fire callback
        settings.onEnd.apply(this);
      }
    }

     public destroy() {
         this.element.remove();
     }
}



interface FlyOptions {
    autoPlay?: boolean,
    vertex_Rtop?: number, // 默认顶点高度top值
    speed?: number,
    start?: any, // top, left, width, height
    end?: any,
    onEnd?: Function,
    count?: number,
    steps?: number,
    curvature?: number,
    vertex_top?: number,
    vertex_left?: number
 }

 class FlyDefaultOptions implements FlyOptions {
    autoPlay: boolean = true;
    vertex_Rtop: number = 20; // 默认顶点高度top值
    speed: number = 1.2;
 }
 
 ;(function($: any) {

  $.fn.fly = function(options ?: FlyOptions) {
    return new Fly(this, options); 
  };
  
})(jQuery);