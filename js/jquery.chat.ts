enum ChatStatus {
    STOP,
    PAUSE,
    RUNNING
}

enum ChatDirection {
    Left,
    Right
}

interface ChatInterface {
    start(): this;
    pause(): this;
    stop(): this;
}

class ChatPlayText implements ChatInterface {
    constructor(
        public element: JQuery,
        public text: string,
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

    public start(): this {
        if (this._handle) {
            return this;
        }
        let instance = this;
        let char;
        this._handle = setInterval(function() {
            if (instance._index >= instance.text.length) {
                instance.stop();
                instance.callback();
                return;
            }
            char = instance.text[instance._index];
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
            char = instance.text[instance._index];
            if (instance._otherElement) {
                instance._otherElement.append(char);
            } else {
                instance.element.append(char);
            }
            instance._index ++;
        }, this.speed);
        this._status = ChatStatus.RUNNING;
        return this;
    }

    public pause(): this {
        if (this._handle) {
            clearInterval(this._handle);
            this._handle = 0;
        }
        this._status = ChatStatus.PAUSE;
        return this;
    }

    public stop(): this {
        if (this._handle) {
            clearInterval(this._handle);
        }
        this.init();
        return this;
    }

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

}

class Group {
    constructor(
        public text: string,
        public direction: ChatDirection = ChatDirection.Left
    ) {

    }
}

class ChatPlayGroup implements ChatInterface {
    constructor(
        public element: JQuery,
        group: any,
        public callback: Function,
        public options: ChatOptions
    ) {
        this.group = group;
    }

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
        if (!this._text) {
            return ChatStatus.STOP;
        }
        return this._text.status;
    }

    public pause(): this {
        if (this._text) {
            this._text.pause();
        }
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    }

    public start(): this {
        if (this._text) {
            this._text.start();
            return this;
        }
        if (this._index >= this._group.length) {
            return this;
        }
        this._text = this._createText();
        this._text.start();
        return this;
    }

    public next() {
        if (this._index >= this._group.length - 1) {
            this.callback();
            return;
        }
        this._index ++;
        this.start();
    }

    public stop(): this {
        if (this._text) {
            this._text.stop();
        }
        this._index = 0;
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    }

    private _createText(): ChatPlayText {
        let group = this._group[this._index];

        let element = document.createElement("div");
         element.className = ChatDirection.Left == group.direction ? this.options.leftClass : this.options.rightClass;
        this.element.append(element);

        let instance = this;
        return new ChatPlayText($(element), group.text, function() {
            instance._text = null;
            if (instance._handle) {
                clearTimeout(instance._handle);
            }
            instance._handle = setTimeout(function() {
                instance.next();
            }, instance.options.space);
        }, this.options.wordSpace)
    }
}

class Chat implements ChatInterface {
    constructor(
        public element: JQuery,
        options?: ChatOptions
    ) {
        this.options = $.extend({}, new ChatDefaultOptions(), options);
        
    }

    public options: ChatOptions;

    private _index:number = 0;

    private _handle: number;

    private _group: ChatPlayGroup;

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
        if (!this._group) {
            return ChatStatus.STOP;
        }
        return this._group.status;
    }

    public pause(): this {
        if (this._group) {
            this._group.pause();
        }
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    }

    public toggle(): this {
        if (this.status == ChatStatus.RUNNING) {
            this.pause();
        } else {
            this.start();
        }
        return this;
    }

    public start(): this {
        if (this._group) {
            this._group.start();
            return this;
        }
        if (this._index >= this.options.data.length) {
            return this;
        }
        let instance = this;
        this._group = new ChatPlayGroup(
            this.element, 
            this.options.data[this._index], 
            function() {
                if (instance._handle) {
                    clearTimeout(instance._handle);
                }
                instance._handle = setTimeout(function() {
                    instance.next();
                }, instance.options.groupSpace);
            }, 
            this.options
        );
        this._group.start();
        return this;
    }

    public stop(): this {
        if (this._group) {
            this._group.stop();
        }
        this._index = 0;
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    }

    public previous() {
        this.go(this._index - 1);
    }

    public next() {
        this.go(this._index + 1);
    }

    set index(arg: number) {
        this.go(arg);
    }

    get index(): number {
        return this.index;
    }

    public go(arg: number) {
        if (arg < 0 || arg >= this.options.data.length) {
            return;
        }
        if (arg == this._index) {
            this.start();
        }
        this.stop();
        this.element.html("");
        this._group = null;
        this._index = arg;
        this.start();
    }
}



interface ChatOptions {
    data?: any[],
    wordSpace?: number,   //每个字的间隔时间
    groupSpace?: number,
    space?: number,  //每一段的间隔时间
    leftClass?: string,
    rightClass?: string,
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