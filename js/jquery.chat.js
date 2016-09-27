var ChatStatus;
(function (ChatStatus) {
    ChatStatus[ChatStatus["STOP"] = 0] = "STOP";
    ChatStatus[ChatStatus["PAUSE"] = 1] = "PAUSE";
    ChatStatus[ChatStatus["RUNNING"] = 2] = "RUNNING";
})(ChatStatus || (ChatStatus = {}));
var ChatDirection;
(function (ChatDirection) {
    ChatDirection[ChatDirection["Left"] = 0] = "Left";
    ChatDirection[ChatDirection["Right"] = 1] = "Right";
})(ChatDirection || (ChatDirection = {}));
var ChatPlayText = (function () {
    function ChatPlayText(element, text, callback, speed) {
        if (speed === void 0) { speed = 100; }
        this.element = element;
        this.text = text;
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
    ChatPlayText.prototype.start = function () {
        if (this._handle) {
            return this;
        }
        var instance = this;
        var char;
        this._handle = setInterval(function () {
            if (instance._index >= instance.text.length) {
                instance.stop();
                instance.callback();
                return;
            }
            char = instance.text[instance._index];
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
            char = instance.text[instance._index];
            if (instance._otherElement) {
                instance._otherElement.append(char);
            }
            else {
                instance.element.append(char);
            }
            instance._index++;
        }, this.speed);
        this._status = ChatStatus.RUNNING;
        return this;
    };
    ChatPlayText.prototype.pause = function () {
        if (this._handle) {
            clearInterval(this._handle);
            this._handle = 0;
        }
        this._status = ChatStatus.PAUSE;
        return this;
    };
    ChatPlayText.prototype.stop = function () {
        if (this._handle) {
            clearInterval(this._handle);
        }
        this.init();
        return this;
    };
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
    return ChatPlayText;
}());
var Group = (function () {
    function Group(text, direction) {
        if (direction === void 0) { direction = ChatDirection.Left; }
        this.text = text;
        this.direction = direction;
    }
    return Group;
}());
var ChatPlayGroup = (function () {
    function ChatPlayGroup(element, group, callback, options) {
        this.element = element;
        this.callback = callback;
        this.options = options;
        this._index = 0;
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
            if (!this._text) {
                return ChatStatus.STOP;
            }
            return this._text.status;
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
    ChatPlayGroup.prototype.pause = function () {
        if (this._text) {
            this._text.pause();
        }
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    };
    ChatPlayGroup.prototype.start = function () {
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
    };
    ChatPlayGroup.prototype.next = function () {
        if (this._index >= this._group.length - 1) {
            this.callback();
            return;
        }
        this._index++;
        this.start();
    };
    ChatPlayGroup.prototype.stop = function () {
        if (this._text) {
            this._text.stop();
        }
        this._index = 0;
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    };
    ChatPlayGroup.prototype._createText = function () {
        var group = this._group[this._index];
        var element = document.createElement("div");
        element.className = ChatDirection.Left == group.direction ? this.options.leftClass : this.options.rightClass;
        this.element.append(element);
        var instance = this;
        return new ChatPlayText($(element), group.text, function () {
            instance._text = null;
            if (instance._handle) {
                clearTimeout(instance._handle);
            }
            instance._handle = setTimeout(function () {
                instance.next();
            }, instance.options.space);
        }, this.options.wordSpace);
    };
    return ChatPlayGroup;
}());
var Chat = (function () {
    function Chat(element, options) {
        this.element = element;
        this._index = 0;
        this.options = $.extend({}, new ChatDefaultOptions(), options);
    }
    Object.defineProperty(Chat.prototype, "status", {
        get: function () {
            if (!this._group) {
                return ChatStatus.STOP;
            }
            return this._group.status;
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
    Chat.prototype.pause = function () {
        if (this._group) {
            this._group.pause();
        }
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    };
    Chat.prototype.toggle = function () {
        if (this.status == ChatStatus.RUNNING) {
            this.pause();
        }
        else {
            this.start();
        }
        return this;
    };
    Chat.prototype.start = function () {
        if (this._group) {
            this._group.start();
            return this;
        }
        if (this._index >= this.options.data.length) {
            return this;
        }
        var instance = this;
        this._group = new ChatPlayGroup(this.element, this.options.data[this._index], function () {
            if (instance._handle) {
                clearTimeout(instance._handle);
            }
            instance._handle = setTimeout(function () {
                instance.next();
            }, instance.options.groupSpace);
        }, this.options);
        this._group.start();
        return this;
    };
    Chat.prototype.stop = function () {
        if (this._group) {
            this._group.stop();
        }
        this._index = 0;
        if (this._handle) {
            clearTimeout(this._handle);
        }
        return this;
    };
    Chat.prototype.previous = function () {
        this.go(this._index - 1);
    };
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
    Chat.prototype.go = function (arg) {
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
//# sourceMappingURL=jquery.chat.js.map