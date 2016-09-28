enum ChatStatus {
    STOP,      //停止
    PAUSE,     //暂停
    RUNNING,   //运行中
    COMPLETE   //完成
}

enum ChatDirection {
    Left,
    Right
}

enum ChatAnimation {
    None,
    Write
}

interface ChatInterface {
    start(): this;
    pause(): this;
    stop(): this;
}

class Group {
    constructor(
        public text: string,
        public direction: ChatDirection = ChatDirection.Left,
        public animation: ChatAnimation = ChatAnimation.Write
    ) {

    }
}

let vendors = ['webkit', 'moz'];
for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
        window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame || !window.cancelAnimationFrame ) {
    let lastTime = 0;
    window.requestAnimationFrame = function(callback): number {
      let currTime: number = new Date().getTime();
      //为了使setTimteout的尽可能的接近每秒60帧的效果
      let timeToCall: number = Math.max( 0, 16 - ( currTime - lastTime ) ); 
      let id: number = window.setTimeout( function() {
        callback( currTime + timeToCall );
      }, timeToCall );
      lastTime = currTime + timeToCall;
      return id;
    };
    
    window.cancelAnimationFrame = function(id) {
      window.clearTimeout(id);
    };
}

enum TimerMode {
    Once,
    Forever
}

class Timer {
    constructor(
        public callback: Function,
        public time: number = 16,
        public mode: TimerMode = TimerMode.Once
    ) {
        this._index = 0;
        this._loop();
    }

    private _index: number;

    private _loop() {
        this.stop();
        let instance = this;
        this._handle = window.requestAnimationFrame(function() {
            instance._index += 16;
            if (instance._index < instance.time) {
                instance._loop();
                return;
            }
            instance.callback();
            if (instance.mode == TimerMode.Once) {
                instance.stop();
                return;
            }
            instance._loop();
        });
    }

    private _handle: number;

    public stop() {
        if (this._handle) {
            window.cancelAnimationFrame(this._handle);
        }
        this._handle = null;
    }
}

class ChatPlayText implements ChatInterface {
    constructor(
        public element: JQuery,
        public group: Group,
        public callback?: Function,
        public speed: number = 100
    ) {
        this.init();
    }

    public init() {
        this._status = ChatStatus.STOP
        this._index = 0;
        this._handle = 0;
    }

    private _status: ChatStatus;

    private _index:number;

    private _handle: number;

    private _otherElement: JQuery;

    set status(arg: ChatStatus) {
        switch(arg) {
            case ChatStatus.PAUSE:
                this.pause();
                break;
            case ChatStatus.STOP:
                this.stop();
                break;
            case ChatStatus.RUNNING:
                this.start();
                break;
        }
    }

    get status(): ChatStatus {
        return this._status;
    }

    /** 开始 */
    public start(): this {
        if (this.status == ChatStatus.COMPLETE ||
        this.status == ChatStatus.RUNNING || 
        this._handle) {
            return this;
        }
        /*switch (this.group.animation) {
            case ChatAnimation.Write:
                this._createWriteAnimation();
                break;
            case ChatAnimation.None:
            default:
                this._createNoneAnimation();
                break;
        }*/
        switch (this.group.direction) {
            case ChatDirection.Left:
                this._createWriteAnimation();
                break;
            case ChatDirection.Right:
            default:
                this._createNoneAnimation();
                break;
        }
        return this;
    }

    /** 暂停 */
    public pause(): this {
        if (this._status == ChatStatus.COMPLETE) {
            return this;
        }
        if (this._handle) {
            clearInterval(this._handle);
            this._handle = 0;
        }
        this._status = ChatStatus.PAUSE;
        return this;
    }

    /** 停止 */
    public stop(): this {
        if (this._handle) {
            clearInterval(this._handle);
        }
        if (this._status == ChatStatus.COMPLETE) {
            return this;
        }
        this.init();
        return this;
    }

    /** 根据标记创造元素 */
    private _createElementByTag(tag: string): this {
        if (this._otherElement) {
            return this;
        }
        let element = document.createElement("span");
        switch (tag) {
            case "{":
                element.className = "red link";
                break;
            case "[":
                element.className = "red";
                break;
            case "(":
                element.className = "red block";
            default:
                break;
        }
        this.element.append(element);
        this._otherElement = $(element);
        return this;
    }

    /** 无动画效果 */
    private _createNoneAnimation() {
        this.element.append(this.group.text.replace(/\[(.+?)\]/g, '<span class="red">$1</span>'));
        this.stop();
        this._status = ChatStatus.COMPLETE;
        if (this.callback) {
            this.callback();
        }
    }

    /** 输入效果 */
    private _createWriteAnimation() {
        let instance = this;
        let char;
        this._handle = setInterval(function() {
            if (instance._index >= instance.group.text.length) {
                instance.stop();
                instance._status = ChatStatus.COMPLETE
                if (instance.callback) {
                    instance.callback();
                }
                return;
            }
            char = instance.group.text[instance._index];
            switch (char) {
                case "[":
                    instance._createElementByTag(char);
                    instance._index ++;
                    break;
                case "]":
                    instance._otherElement = null;
                    instance._index ++;
                    break;
                default:
                    break;
            }
            char = instance.group.text[instance._index];
            if (instance._otherElement) {
                instance._otherElement.append(char);
            } else {
                instance.element.append(char);
            }
            instance._index ++;
        }, this.speed);
        this._status = ChatStatus.RUNNING;
    }

    /** 清除 */
    public clear() {
        if (this._handle) {
            clearInterval(this._handle);
        }
        this.callback = null;
        this._status = ChatStatus.COMPLETE;
    }
}

/** 组操作 */
class ChatPlayGroup implements ChatInterface {
    constructor(
        public element: JQuery,
        group: any,
        public callback: Function,
        public options: ChatOptions
    ) {
        this.group = group;
    }

    /** 格式化之后的组 */
    private _group: Group[];

    set group(arg: any) {
        this._group = [];
        if (arg instanceof Array) {
            for (let i = 0, length = arg.length; i < length; i ++) {
                if (arg[i] instanceof Group) {
                    this._group.push(arg[i]);
                } else {
                    this._group.push(new Group(arg[i], i % 2 == 0 ? ChatDirection.Left : ChatDirection.Right));
                }
            }
            return;
        }
        if (arg instanceof Group) {
            this._group.push(arg);
            return;
        }
        this._group.push(new Group(arg));
    }

    private _index:number = 0;

    private _handle: number;

    private _text: ChatPlayText;

    private _status: ChatStatus = ChatStatus.STOP;

    set status(arg: ChatStatus) {
        switch(arg) {
            case ChatStatus.PAUSE:
                this.pause();
                break;
            case ChatStatus.STOP:
                this.stop();
                break;
            case ChatStatus.RUNNING:
                this.start();
                break;
        }
    }

    get status(): ChatStatus {
        return this._status;
    }

    /** 获取当前组 */
    public currentGroup(): Group {
        return this._group[this._index];
    }

    /** 暂停 */
    public pause(): this {
        if (this._status == ChatStatus.COMPLETE) {
            return this;
        }
        this._status = ChatStatus.PAUSE;
        if (this._text) {
            this._text.pause();
        }
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    }

    /** 开始 */
    public start(): this {
        if (this._status == ChatStatus.COMPLETE) {
            this.next();
            return this;
        }
        if (this.status == ChatStatus.RUNNING) {
            return this;
        }
        this._status = ChatStatus.RUNNING;
        if (this._text) {
            this._text.start();
            return this;
        }
        if (this._index >= this._group.length) {
            this._status = ChatStatus.COMPLETE;
            return this;
        }
        if (this.options.callback) {
            this.options.callback(this);
            return;
        }
        return this.createTextAndStart();
    }

    /** 新建并开始 */
    public createTextAndStart(): this {
        if (this.status != ChatStatus.RUNNING) {
            return this;
        }
        if (this._text) {
            this._text.clear();
            this._text = null;
        }
        this._text = this._createText();
        this._text.start();
        return this;
    }

    /** 下一个 */
    public next() {
        if (this._index < this._group.length - 1) {
            this.stop();
            this._index ++;
            this.start();
            return;
        }
        if (this.callback) {
            this.callback();
        }
    }

    /** 停止 */
    public stop(): this {
        if (this._status == ChatStatus.COMPLETE) {
            return this;
        }
        this._status = ChatStatus.STOP;
        if (this._text) {
            this._text.stop();
        }
        this._index = 0;
        if (this._handle) {
            clearTimeout(this._handle);
        }
        this._handle = 0;
        return this;
    }

    /** 创建新的文本 */
    private _createText(): ChatPlayText {
        let group = this._group[this._index];
        let element = document.createElement("div");
         element.className = ChatDirection.Left == group.direction ? this.options.leftClass : this.options.rightClass;
        this.element.append(element);

        let instance = this;
        return new ChatPlayText($(element), group, function() {
            instance._text = null;
            if (instance._handle) {
                clearTimeout(instance._handle);
            }
            if (instance._index >= instance._group.length - 1) {
                instance._status = ChatStatus.COMPLETE;
            }
            instance._handle = setTimeout(function() {
                instance.next();
            }, instance.options.space);
        }, this.options.wordSpace)
    }

    /** 清除所有 */
    public clear() {
        this.stop();
        this.callback = null;
        if (this._text) {
            this._text.clear();
        }
        this._text = null;
        this._status = ChatStatus.COMPLETE;
    }
}

/**
 * 总控制器
 * JQuery 拓展类
 */
class Chat implements ChatInterface {
    constructor(
        public element: JQuery,
        options?: ChatOptions
    ) {
        this.options = $.extend({}, new ChatDefaultOptions(), options);
        
    }
    
    /** 设置 */
    public options: ChatOptions;

    /** 当前执行的组 */
    private _index:number = 0;

    /** 定时器的指针 */
    private _handle: number;

    /** 当前执行组 */
    private _group: ChatPlayGroup;

    private _status: ChatStatus = ChatStatus.STOP;

    set status(arg: ChatStatus) {
        switch(arg) {
            case ChatStatus.PAUSE:
                this.pause();
                break;
            case ChatStatus.STOP:
                this.stop();
                break;
            case ChatStatus.RUNNING:
                this.start();
                break;
        }
    }

    get status(): ChatStatus {
        return this._status;
    }

    /** 暂停 */
    public pause(): this {
        this._status = ChatStatus.PAUSE;
        if (this._group) {
            this._group.pause();
        }
        if (this._handle) {
            cancelAnimationFrame(this._handle);
        }
        return this;
    }

    /** 暂停/播放 */
    public toggle(): this {
        if (this.status == ChatStatus.RUNNING) {
            this.pause();
        } else {
            this.start();
        }
        return this;
    }

    /** 播放 */
    public start(): this {
        if (this.status == ChatStatus.RUNNING) {
            return this;
        }
        this._status = ChatStatus.RUNNING;
        if (this._group) {
            this._group.start();
            return this;
        }
        if (this._index >= this.options.data.length) {
            this._status = ChatStatus.COMPLETE;
            return this;
        }
        this.element.html("");
        let instance = this;
        let time: number = 0;
        this._group = new ChatPlayGroup(
            this.element, 
            this.options.data[this._index], 
            function() {
                if (instance._handle) {
                    clearTimeout(instance._handle);
                }
                instance._handle = setTimeout(function() {
                    if (instance.status != ChatStatus.RUNNING) {
                        return;
                    }
                    instance.next();
                }, instance.options.groupSpace);
            }, 
            this.options
        );
        this._group.start();
        return this;
    }

    /** 停止 */
    public stop(): this {
        this._status = ChatStatus.STOP;
        if (this._group) {
            this._group.stop();
        }
        this._index = 0;
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    }

    /** 上一组 */
    public previous() {
        this.go(this._index - 1);
    }

    /** 下一组 */
    public next() {
        this.go(this._index + 1);
    }

    set index(arg: number) {
        this.go(arg);
    }

    get index(): number {
        return this.index;
    }

    /** 跳到第几个 */
    public go(arg: number) {
        if (arg < 0 || arg >= this.options.data.length) {
            return;
        }
        if (arg == this._index) {
            this.start();
        }
        this.clear();
        this._index = arg;
        this.start();
    }

    /** 清除所有 */
    public clear() {
        this.stop();
        if (this._group) {
            this._group.clear();
            this._group = null;
        }
        this.element.html("");
    }
}



interface ChatOptions {
    data?: any[],
    wordSpace?: number,   //每个字的间隔时间
    groupSpace?: number,
    space?: number,  //每一段的间隔时间
    leftClass?: string,
    rightClass?: string,
    callback?: (ChatPlayGroup) => void    //执行事件
}

class ChatDefaultOptions implements ChatOptions {
    data:any[] = [];
    wordSpace: number = 200;   //每个字的间隔时间
    groupSpace: number = 3000; //每一组
    space: number = 1000;  //每一段的间隔时间
    leftClass: string = "left";
    rightClass: string = "right";
}

 ;(function($: any) {
  $.fn.chat = function(options?: ChatOptions) {
    return new Chat(this, options); 
  };
})(jQuery);