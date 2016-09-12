enum TimerKind {
    Once,
    Forever
}

class Timer {
    constructor(
        public callback?: any,
        public time: number = 1000,
        public kind: TimerKind = TimerKind.Forever
    ) {

    }

    private handle: number;

    public stop() {
        if (!this.handle) {
            return;
        }
        if (this.kind == TimerKind.Forever) {
            clearInterval(this.handle);
        } else {
            clearTimeout(this.handle);
        }
    }

    public start(...args: any[]) {
        if (!this.callback) {
            return;
        }
        if (this.kind == TimerKind.Forever) {
            this.handle = setInterval(this.callback, this.time, ...args);
        } else {
            this.handle = setTimeout(this.callback, this.time, ...args);
        }
    }
}

class Chat {
    constructor(
        public element: JQuery,
        options?: ChatOptions
    ) {
        this.options = $.extend({}, new ChatDefaultOptions(), options);
        
    }

    public options: ChatOptions;

    public index: number = -1;

    public mainTimer: number;

    public timer: number;

    public appendText(element: JQuery, text: string, callback: Function) {
      let i = 0, length = text.length;
      if (length == 0) {
        return;
      }
      let chat = this;
      this.startTimer(function() {
        if (i >= length) {
          chat.stopTimer();
          callback();
          return;
        }
        element.append(text[i]);
        i ++;
      }, this.options.wordSpace)
    };

    public createElement(obj: any, callback: Function) {
      let element: HTMLElement, text: string;
      if (typeof obj != "object") {
        element = this.createDivElement(this.index % 2);
        text = obj;
      } else if (obj.hasOwnProperty("direction")){
        text = obj.text;
        element = this.createDivElement(obj.direction);
      } else {
        text = obj.text;
        element = this.createDivElement(this.index % 2);
      }
      this.appendText($(element), text, callback);
    }

    public createDivElement(direction: ChatDirection = ChatDirection.Left): HTMLDivElement {
      let element = document.createElement("div");
      element.className = ChatDirection.Left == direction ? this.options.leftClass : this.options.rightClass;
      this.element.append(element);
      return element;
    }

    public stopTimer() {
        if (!this.timer) {
            return;
        }
        clearInterval(this.timer);
    }

    public startTimer(callback: Function, time: number = this.options.wordSpace) {
        this.stopTimer();
        this.timer = setInterval(callback, time);
    }

    public start() {
        this.stop();
        this.element.html("");
        this.index = -1;
        this.createCallback();
    }

    public stop() {
        if (!this.mainTimer) {
            return;
        }
        clearTimeout(this.mainTimer);
        this.stopTimer();
    }

    public createCallback() {
        this.index ++;
        if(this.options.data.length <= this.index) {
          clearTimeout(this.mainTimer);
          return;
        }
        let time: number = this.options.space;
        if (this.index % 2 == 0) {
          time = 3000;
        }
        let chat = this;
        this.mainTimer = setTimeout(function() {
          if (chat.index % 2 == 0) {
            chat.element.html("");
          }
          chat.createElement(chat.options.data[chat.index], function() {
              chat.createCallback();
          });
        }, time);
    }
}

enum ChatDirection {
    Left,
    Right
}

interface ChatOptions {
    data?: any[],
    wordSpace?: number,   //每个字的间隔时间
    space?: number,  //每一段的间隔时间
    leftClass?: string,
    rightClass?: string,
}

class ChatDefaultOptions implements ChatOptions {
    data:any[] = [];
    wordSpace: number = 200;   //每个字的间隔时间
    space: number = 1000;  //每一段的间隔时间
    leftClass: string = "left";
    rightClass: string = "right";
}

 ;(function($: any) {
  $.fn.chat = function(options?: ChatOptions) {
    return new Chat(this, options); 
  };
})(jQuery);