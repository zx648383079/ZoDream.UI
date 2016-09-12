var TimerKind;
(function (TimerKind) {
    TimerKind[TimerKind["Once"] = 0] = "Once";
    TimerKind[TimerKind["Forever"] = 1] = "Forever";
})(TimerKind || (TimerKind = {}));
var Timer = (function () {
    function Timer(callback, time, kind) {
        if (time === void 0) { time = 1000; }
        if (kind === void 0) { kind = TimerKind.Forever; }
        this.callback = callback;
        this.time = time;
        this.kind = kind;
    }
    Timer.prototype.stop = function () {
        if (!this.handle) {
            return;
        }
        if (this.kind == TimerKind.Forever) {
            clearInterval(this.handle);
        }
        else {
            clearTimeout(this.handle);
        }
    };
    Timer.prototype.start = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (!this.callback) {
            return;
        }
        if (this.kind == TimerKind.Forever) {
            this.handle = setInterval.apply(void 0, [this.callback, this.time].concat(args));
        }
        else {
            this.handle = setTimeout.apply(void 0, [this.callback, this.time].concat(args));
        }
    };
    return Timer;
}());
var Chat = (function () {
    function Chat(element, options) {
        this.element = element;
        this.index = -1;
        this.options = $.extend({}, new ChatDefaultOptions(), options);
    }
    Chat.prototype.appendText = function (element, text, callback) {
        var i = 0, length = text.length;
        if (length == 0) {
            return;
        }
        var chat = this;
        this.startTimer(function () {
            if (i >= length) {
                chat.stopTimer();
                callback();
                return;
            }
            element.append(text[i]);
            i++;
        }, this.options.wordSpace);
    };
    ;
    Chat.prototype.createElement = function (obj, callback) {
        var element, text;
        if (typeof obj != "object") {
            element = this.createDivElement(this.index % 2);
            text = obj;
        }
        else if (obj.hasOwnProperty("direction")) {
            text = obj.text;
            element = this.createDivElement(obj.direction);
        }
        else {
            text = obj.text;
            element = this.createDivElement(this.index % 2);
        }
        this.appendText($(element), text, callback);
    };
    Chat.prototype.createDivElement = function (direction) {
        if (direction === void 0) { direction = ChatDirection.Left; }
        var element = document.createElement("div");
        element.className = ChatDirection.Left == direction ? this.options.leftClass : this.options.rightClass;
        this.element.append(element);
        return element;
    };
    Chat.prototype.stopTimer = function () {
        if (!this.timer) {
            return;
        }
        clearInterval(this.timer);
    };
    Chat.prototype.startTimer = function (callback, time) {
        if (time === void 0) { time = this.options.wordSpace; }
        this.stopTimer();
        this.timer = setInterval(callback, time);
    };
    Chat.prototype.start = function () {
        this.stop();
        this.element.html("");
        this.index = -1;
        this.createCallback();
    };
    Chat.prototype.stop = function () {
        if (!this.mainTimer) {
            return;
        }
        clearTimeout(this.mainTimer);
        this.stopTimer();
    };
    Chat.prototype.createCallback = function () {
        this.index++;
        if (this.options.data.length <= this.index) {
            clearTimeout(this.mainTimer);
            return;
        }
        var time = this.options.space;
        if (this.index % 2 == 0) {
            time = 3000;
        }
        var chat = this;
        this.mainTimer = setTimeout(function () {
            if (chat.index % 2 == 0) {
                chat.element.html("");
            }
            chat.createElement(chat.options.data[chat.index], function () {
                chat.createCallback();
            });
        }, time);
    };
    return Chat;
}());
var ChatDirection;
(function (ChatDirection) {
    ChatDirection[ChatDirection["Left"] = 0] = "Left";
    ChatDirection[ChatDirection["Right"] = 1] = "Right";
})(ChatDirection || (ChatDirection = {}));
var ChatDefaultOptions = (function () {
    function ChatDefaultOptions() {
        this.data = [];
        this.wordSpace = 200; //每个字的间隔时间
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