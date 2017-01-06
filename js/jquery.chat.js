var ChatStatus;
(function (ChatStatus) {
    ChatStatus[ChatStatus["STOP"] = 0] = "STOP";
    ChatStatus[ChatStatus["PAUSE"] = 1] = "PAUSE";
    ChatStatus[ChatStatus["RUNNING"] = 2] = "RUNNING";
    ChatStatus[ChatStatus["COMPLETE"] = 3] = "COMPLETE"; //完成
})(ChatStatus || (ChatStatus = {}));
var ChatDirection;
(function (ChatDirection) {
    ChatDirection[ChatDirection["Left"] = 0] = "Left";
    ChatDirection[ChatDirection["Right"] = 1] = "Right";
})(ChatDirection || (ChatDirection = {}));
var ChatAnimation;
(function (ChatAnimation) {
    ChatAnimation[ChatAnimation["None"] = 0] = "None";
    ChatAnimation[ChatAnimation["Write"] = 1] = "Write";
})(ChatAnimation || (ChatAnimation = {}));
var Group = (function () {
    function Group(text, direction, animation) {
        if (direction === void 0) { direction = ChatDirection.Left; }
        if (animation === void 0) { animation = ChatAnimation.Write; }
        this.text = text;
        this.direction = direction;
        this.animation = animation;
    }
    return Group;
}());
var vendors = ['webkit', 'moz'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame =
        window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}
if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime_1 = 0;
    window.requestAnimationFrame = function (callback) {
        var currTime = new Date().getTime();
        //为了使setTimteout的尽可能的接近每秒60帧的效果
        var timeToCall = Math.max(0, 16 - (currTime - lastTime_1));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime_1 = currTime + timeToCall;
        return id;
    };
    window.cancelAnimationFrame = function (id) {
        window.clearTimeout(id);
    };
}
var TimerMode;
(function (TimerMode) {
    TimerMode[TimerMode["Once"] = 0] = "Once";
    TimerMode[TimerMode["Forever"] = 1] = "Forever";
})(TimerMode || (TimerMode = {}));
var Timer = (function () {
    function Timer(callback, time, mode) {
        if (time === void 0) { time = 16; }
        if (mode === void 0) { mode = TimerMode.Once; }
        this.callback = callback;
        this.time = time;
        this.mode = mode;
        this._index = 0;
        this._loop();
    }
    Timer.prototype._loop = function () {
        this.stop();
        var instance = this;
        this._handle = window.requestAnimationFrame(function () {
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
    };
    Timer.prototype.stop = function () {
        if (this._handle) {
            window.cancelAnimationFrame(this._handle);
        }
        this._handle = null;
    };
    return Timer;
}());
var ChatPlayText = (function () {
    function ChatPlayText(element, group, callback, speed) {
        if (speed === void 0) { speed = 100; }
        this.element = element;
        this.group = group;
        this.callback = callback;
        this.speed = speed;
        this.init();
    }
    ChatPlayText.prototype.init = function () {
        this._status = ChatStatus.STOP;
        this._index = 0;
        this._handle = 0;
    };
    Object.defineProperty(ChatPlayText.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (arg) {
            switch (arg) {
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
        },
        enumerable: true,
        configurable: true
    });
    /** 开始 */
    ChatPlayText.prototype.start = function () {
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
    };
    /** 暂停 */
    ChatPlayText.prototype.pause = function () {
        if (this._status == ChatStatus.COMPLETE) {
            return this;
        }
        if (this._handle) {
            clearInterval(this._handle);
            this._handle = 0;
        }
        this._status = ChatStatus.PAUSE;
        return this;
    };
    /** 停止 */
    ChatPlayText.prototype.stop = function () {
        if (this._handle) {
            clearInterval(this._handle);
        }
        if (this._status == ChatStatus.COMPLETE) {
            return this;
        }
        this.init();
        return this;
    };
    /** 根据标记创造元素 */
    ChatPlayText.prototype._createElementByTag = function (tag) {
        if (this._otherElement) {
            return this;
        }
        var element = document.createElement("span");
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
    };
    /** 无动画效果 */
    ChatPlayText.prototype._createNoneAnimation = function () {
        this.element.append(this.group.text.replace(/\[(.+?)\]/g, '<span class="red">$1</span>'));
        this.stop();
        this._status = ChatStatus.COMPLETE;
        if (this.callback) {
            this.callback();
        }
    };
    /** 输入效果 */
    ChatPlayText.prototype._createWriteAnimation = function () {
        var instance = this;
        var char;
        this._handle = setInterval(function () {
            if (instance._index >= instance.group.text.length) {
                instance.stop();
                instance._status = ChatStatus.COMPLETE;
                if (instance.callback) {
                    instance.callback();
                }
                return;
            }
            char = instance.group.text[instance._index];
            switch (char) {
                case "[":
                    instance._createElementByTag(char);
                    instance._index++;
                    break;
                case "]":
                    instance._otherElement = null;
                    instance._index++;
                    break;
                default:
                    break;
            }
            char = instance.group.text[instance._index];
            if (instance._otherElement) {
                instance._otherElement.append(char);
            }
            else {
                instance.element.append(char);
            }
            instance._index++;
        }, this.speed);
        this._status = ChatStatus.RUNNING;
    };
    /** 清除 */
    ChatPlayText.prototype.clear = function () {
        if (this._handle) {
            clearInterval(this._handle);
        }
        this.callback = null;
        this._status = ChatStatus.COMPLETE;
    };
    return ChatPlayText;
}());
/** 组操作 */
var ChatPlayGroup = (function () {
    function ChatPlayGroup(element, group, callback, options) {
        this.element = element;
        this.callback = callback;
        this.options = options;
        this._index = 0;
        this._status = ChatStatus.STOP;
        this.group = group;
    }
    Object.defineProperty(ChatPlayGroup.prototype, "group", {
        set: function (arg) {
            this._group = [];
            if (arg instanceof Array) {
                for (var i = 0, length_1 = arg.length; i < length_1; i++) {
                    if (arg[i] instanceof Group) {
                        this._group.push(arg[i]);
                    }
                    else {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatPlayGroup.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (arg) {
            switch (arg) {
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
        },
        enumerable: true,
        configurable: true
    });
    /** 获取当前组 */
    ChatPlayGroup.prototype.currentGroup = function () {
        return this._group[this._index];
    };
    /** 暂停 */
    ChatPlayGroup.prototype.pause = function () {
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
    };
    /** 开始 */
    ChatPlayGroup.prototype.start = function () {
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
    };
    /** 新建并开始 */
    ChatPlayGroup.prototype.createTextAndStart = function () {
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
    };
    /** 下一个 */
    ChatPlayGroup.prototype.next = function () {
        if (this._index < this._group.length - 1) {
            this.stop();
            this._index++;
            this.start();
            return;
        }
        if (this.callback) {
            this.callback();
        }
    };
    /** 停止 */
    ChatPlayGroup.prototype.stop = function () {
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
    };
    /** 创建新的文本 */
    ChatPlayGroup.prototype._createText = function () {
        var group = this._group[this._index];
        var element = document.createElement("div");
        element.className = ChatDirection.Left == group.direction ? this.options.leftClass : this.options.rightClass;
        this.element.append(element);
        var instance = this;
        return new ChatPlayText($(element), group, function () {
            instance._text = null;
            if (instance._handle) {
                clearTimeout(instance._handle);
            }
            if (instance._index >= instance._group.length - 1) {
                instance._status = ChatStatus.COMPLETE;
            }
            instance._handle = setTimeout(function () {
                instance.next();
            }, instance.options.space);
        }, this.options.wordSpace);
    };
    /** 清除所有 */
    ChatPlayGroup.prototype.clear = function () {
        this.stop();
        this.callback = null;
        if (this._text) {
            this._text.clear();
        }
        this._text = null;
        this._status = ChatStatus.COMPLETE;
    };
    return ChatPlayGroup;
}());
/**
 * 总控制器
 * JQuery 拓展类
 */
var Chat = (function () {
    function Chat(element, options) {
        this.element = element;
        /** 当前执行的组 */
        this._index = 0;
        this._status = ChatStatus.STOP;
        this.options = $.extend({}, new ChatDefaultOptions(), options);
    }
    Object.defineProperty(Chat.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (arg) {
            switch (arg) {
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
        },
        enumerable: true,
        configurable: true
    });
    /** 暂停 */
    Chat.prototype.pause = function () {
        this._status = ChatStatus.PAUSE;
        if (this._group) {
            this._group.pause();
        }
        if (this._handle) {
            cancelAnimationFrame(this._handle);
        }
        return this;
    };
    /** 暂停/播放 */
    Chat.prototype.toggle = function () {
        if (this.status == ChatStatus.RUNNING) {
            this.pause();
        }
        else {
            this.start();
        }
        return this;
    };
    /** 播放 */
    Chat.prototype.start = function () {
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
        var instance = this;
        var time = 0;
        this._group = new ChatPlayGroup(this.element, this.options.data[this._index], function () {
            if (instance._handle) {
                clearTimeout(instance._handle);
            }
            instance._handle = setTimeout(function () {
                if (instance.status != ChatStatus.RUNNING) {
                    return;
                }
                instance.next();
            }, instance.options.groupSpace);
        }, this.options);
        this._group.start();
        return this;
    };
    /** 停止 */
    Chat.prototype.stop = function () {
        this._status = ChatStatus.STOP;
        if (this._group) {
            this._group.stop();
        }
        this._index = 0;
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    };
    /** 上一组 */
    Chat.prototype.previous = function () {
        this.go(this._index - 1);
    };
    /** 下一组 */
    Chat.prototype.next = function () {
        this.go(this._index + 1);
    };
    Object.defineProperty(Chat.prototype, "index", {
        get: function () {
            return this.index;
        },
        set: function (arg) {
            this.go(arg);
        },
        enumerable: true,
        configurable: true
    });
    /** 跳到第几个 */
    Chat.prototype.go = function (arg) {
        if (arg < 0 || arg >= this.options.data.length) {
            return;
        }
        if (arg == this._index) {
            this.start();
        }
        this.clear();
        this._index = arg;
        this.start();
    };
    /** 清除所有 */
    Chat.prototype.clear = function () {
        this.stop();
        if (this._group) {
            this._group.clear();
            this._group = null;
        }
        this.element.html("");
    };
    return Chat;
}());
var ChatDefaultOptions = (function () {
    function ChatDefaultOptions() {
        this.data = [];
        this.wordSpace = 200; //每个字的间隔时间
        this.groupSpace = 3000; //每一组
        this.space = 1000; //每一段的间隔时间
        this.leftClass = "left";
        this.rightClass = "right";
    }
    return ChatDefaultOptions;
}());
;
(function ($) {
    $.fn.chat = function (options) {
        return new Chat(this, options);
    };
})(jQuery);
