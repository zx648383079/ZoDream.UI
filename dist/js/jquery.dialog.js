var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Eve = (function () {
    function Eve() {
    }
    Eve.prototype.on = function (event, callback) {
        this.options['on' + event] = callback;
        return this;
    };
    Eve.prototype.hasEvent = function (event) {
        return this.options.hasOwnProperty('on' + event);
    };
    Eve.prototype.trigger = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var realEvent = 'on' + event;
        if (!this.hasEvent(event)) {
            return;
        }
        return (_a = this.options[realEvent]).call.apply(_a, [this].concat(args));
        var _a;
    };
    return Eve;
}());
var Box = (function (_super) {
    __extends(Box, _super);
    function Box() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Box.prototype.showPosition = function () {
        this.setPosition();
        this.box.show();
        return this;
    };
    Box.prototype.setPosition = function () {
        var offset = this.element.offset();
        var x = offset.left - $(window).scrollLeft();
        var y = offset.top + this.element.outerHeight() - $(window).scrollTop();
        this.box.css({ left: x + "px", top: y + "px" });
        return this;
    };
    /**
     * 根据可能是相对值获取绝对值
     * @param abservable
     * @param reltive
     */
    Box.getReal = function (abservable, reltive) {
        if (reltive > 1) {
            return reltive;
        }
        return abservable * reltive;
    };
    return Box;
}(Eve));
var DialogCore = (function (_super) {
    __extends(DialogCore, _super);
    function DialogCore(option, id) {
        var _this = _super.call(this) || this;
        _this.id = id;
        _this._status = DialogStatus.closed;
        _this.options = $.extend({}, _this.getDefaultOption(), option);
        _this.options.type = Dialog.parseEnum(_this.options.type, DialogType);
        return _this;
    }
    Object.defineProperty(DialogCore.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (arg) {
            arg = Dialog.parseEnum(arg, DialogStatus);
            // 相同状态不做操作
            if (this._status == arg) {
                return;
            }
            switch (arg) {
                case DialogStatus.show:
                    this.showBox();
                    break;
                case DialogStatus.hide:
                    this.hideBox();
                    break;
                case DialogStatus.closing:
                    this.closingBox();
                    break;
                case DialogStatus.closed:
                    this.closeBox();
                    break;
                default:
                    throw "status error:" + arg;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DialogCore.prototype, "y", {
        get: function () {
            if (!this._y) {
                this._y = this.box.offset().top - $(window).scrollTop();
            }
            return this._y;
        },
        set: function (y) {
            this._y = y;
            this.css('top', y + 'px');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DialogCore.prototype, "height", {
        get: function () {
            if (!this._height) {
                this._height = this.box.height();
            }
            return this._height;
        },
        set: function (height) {
            this._height = height;
            this.box.height(height);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 改变状态
     * @param status
     * @param hasEvent
     */
    DialogCore.prototype.changeStatus = function (status, hasEvent) {
        if (hasEvent === void 0) { hasEvent = false; }
        if (hasEvent) {
            this._status = status;
            return;
        }
        this.status = status;
    };
    /**
     * 获取默认设置
     */
    DialogCore.prototype.getDefaultOption = function () {
        return new DefaultDialogOption();
    };
    /**
     * 创建并显示控件
     */
    DialogCore.prototype.showBox = function () {
        if (!this.box) {
            this.init();
        }
        if (false == this.trigger('show')) {
            console.log('show stop!');
            return false;
        }
        this.box.show();
        this._status = DialogStatus.show;
        return true;
    };
    /**
     * 创建并隐藏控件
     */
    DialogCore.prototype.hideBox = function () {
        if (!this.box) {
            this.init();
        }
        if (false == this.trigger('hide')) {
            console.log('hide stop!');
            return false;
        }
        this.box.hide();
        this._status = DialogStatus.hide;
        return true;
    };
    /**
     * 动画关闭，有关闭动画
     */
    DialogCore.prototype.closingBox = function () {
        if (!this.box) {
            return false;
        }
        if (this.status == DialogStatus.closing
            || this.status == DialogStatus.closed) {
            return false;
        }
        if (false == this.trigger('closing')) {
            console.log('closing stop!');
            return false;
        }
        this._status = DialogStatus.closing;
        var instance = this;
        this.box.addClass('dialog-closing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            if (instance.status == DialogStatus.closing) {
                // 防止中途改变当前状态
                instance.closeBox();
            }
        });
        return true;
    };
    /**
     * 删除控件
     */
    DialogCore.prototype.closeBox = function () {
        if (!this.box) {
            return false;
        }
        if (this.trigger('closed') == false) {
            console.log('closed stop!');
            return false;
        }
        this._status = DialogStatus.closed;
        if (this._dialogBg) {
            this._dialogBg.remove();
            this._dialogBg = undefined;
        }
        Dialog.removeItem(this.id);
        this.box.remove();
        this.box = undefined;
        return true;
    };
    DialogCore.prototype.createCore = function () {
        this.box = $('<div class="dialog dialog-' + DialogType[this.options.type] + '" data-type="dialog" dialog-id=' + this.id + '></div>');
        return this;
    };
    DialogCore.prototype.css = function (key, value) {
        return this.box.css(key, value);
    };
    DialogCore.prototype.show = function () {
        this.status = DialogStatus.show;
        return this;
    };
    DialogCore.prototype.hide = function () {
        this.status = DialogStatus.hide;
        return this;
    };
    DialogCore.prototype.close = function () {
        this.status = DialogStatus.closing;
        return this;
    };
    DialogCore.prototype.toggle = function () {
        if (this.status == DialogStatus.hide) {
            this.show();
            return;
        }
        this.hide();
    };
    /**
     * 获取相同类型弹出框的最上面
     */
    DialogCore.prototype.getDialogTop = function () {
        var _this = this;
        var y;
        var instance = this;
        Dialog.map(function (item) {
            if (item.options.type != _this.options.type || item.id == instance.id) {
                return;
            }
            if (!y || item.y < y) {
                y = item.y;
            }
        });
        return y;
    };
    DialogCore.prototype.getDialogBottom = function () {
        var _this = this;
        var y;
        var instance = this;
        Dialog.map(function (item) {
            if (item.options.type != _this.options.type || item.id == instance.id) {
                return;
            }
            var bottom = item.y + item.height;
            if (!y || bottom > y) {
                y = bottom;
            }
        });
        return y;
    };
    DialogCore.prototype._getBottom = function () {
        return Math.max($(window).height() * .33 - this.height / 2, 0);
    };
    DialogCore.prototype._getTop = function () {
        return Math.max($(window).height() / 2 - this.height / 2, 0);
    };
    DialogCore.prototype._getLeft = function () {
        return Math.max($(window).width() / 2 - this.box.width() / 2, 0);
    };
    DialogCore.prototype._getRight = function () {
        return Math.max($(window).width() / 2 - this.box.width() / 2, 0);
    };
    DialogCore.prototype._getWidth = function () {
        var width = Dialog.$window.width();
        if (this.options.width > 1) {
            return width;
        }
        return width * this.options.width;
    };
    DialogCore.prototype._getHeight = function () {
        var height = Dialog.$window.height();
        if (this.options.height > 1) {
            return height;
        }
        return height * this.options.height;
    };
    DialogCore.prototype._getLeftTop = function (direction, width, height, boxWidth, boxHeight) {
        switch (direction) {
            case DialogDirection.leftTop:
                return [0, 0];
            case DialogDirection.top:
                return [(boxHeight - width) / 2, 0];
            case DialogDirection.rightTop:
                return [boxHeight - width, 0];
            case DialogDirection.right:
                return [boxHeight - width, (boxHeight - height) / 2];
            case DialogDirection.rightBottom:
                return [boxHeight - width, boxHeight - height];
            case DialogDirection.bottom:
                return [(boxHeight - width) / 2, boxHeight - height];
            case DialogDirection.leftBottom:
                return [0, boxHeight - height];
            case DialogDirection.left:
                return [0, (boxHeight - height) / 2];
            case DialogDirection.center:
            default:
                return [(boxHeight - width) / 2, (boxHeight - height) / 2];
        }
    };
    return DialogCore;
}(Box));
var DefaultDialogOption = (function () {
    function DefaultDialogOption() {
        this.title = '提示';
        this.type = DialogType.tip;
        this.canMove = true;
        this.ondone = function () {
            this.close();
        };
    }
    return DefaultDialogOption;
}());
var Dialog = (function () {
    function Dialog() {
    }
    /**
     * 创造弹出框
     * @param option
     */
    Dialog.create = function (option) {
        if (!option.type) {
            option.type = DialogType.tip;
        }
        option.type = this.parseEnum(option.type, DialogType);
        var method = this.getMethod(option.type);
        var element = new method(option);
        return element;
    };
    Dialog.parseEnum = function (val, type) {
        if (typeof val == 'string') {
            return type[val];
        }
        return val;
    };
    /**
     * 提示
     * @param content
     * @param time
     */
    Dialog.tip = function (content, time) {
        if (time === void 0) { time = 2000; }
        if (typeof content != 'object') {
            content = { content: content, time: time };
        }
        content.type = DialogType.tip;
        return this.create(content).show();
    };
    /**
     * 消息
     * @param content
     * @param time
     */
    Dialog.message = function (content, time) {
        if (time === void 0) { time = 2000; }
        if (typeof content != 'object') {
            content = { content: content, time: time };
        }
        content.type = DialogType.message;
        return this.create(content).show();
    };
    /**
     * 加载
     * @param time
     */
    Dialog.loading = function (time) {
        if (time === void 0) { time = 0; }
        if (typeof time != 'object') {
            time = { time: time };
        }
        time.type = DialogType.loading;
        return this.create(time).show();
    };
    /**
     * 内容弹窗
     * @param content
     * @param hasYes
     * @param hasNo
     */
    Dialog.content = function (content, hasYes, hasNo) {
        if (typeof content != 'object') {
            content = {
                content: content,
                hasYes: hasYes,
                hasNo: hasNo
            };
        }
        content.type = DialogType.content;
        return this.create(content).show();
    };
    /**
     * 普通弹窗
     * @param content
     * @param title
     * @param hasYes
     * @param hasNo
     */
    Dialog.box = function (content, title, hasYes, hasNo) {
        if (title === void 0) { title = '提示'; }
        if (typeof content != 'object') {
            content = {
                content: content,
                title: title,
                hasYes: hasYes,
                hasNo: hasNo
            };
        }
        content.type = DialogType.box;
        return this.create(content).show();
    };
    /**
     * 表格弹窗
     * @param content
     * @param title
     * @param done
     * @param hasYes
     * @param hasNo
     */
    Dialog.from = function (content, title, done, hasYes, hasNo) {
        if (title === void 0) { title = '提示'; }
        return this.create({
            type: DialogType.box,
            content: content,
            title: title,
            hasYes: hasYes,
            hasNo: hasNo,
            ondone: done
        }).show();
    };
    /**
     * 页面弹窗
     * @param content
     * @param title
     * @param hasYes
     * @param hasNo
     */
    Dialog.page = function (content, title, hasYes, hasNo) {
        if (title === void 0) { title = '提示'; }
        if (typeof content != 'object') {
            content = {
                content: content,
                title: title,
                hasYes: hasYes,
                hasNo: hasNo
            };
        }
        content.type = DialogType.page;
        return this.create(content).show();
    };
    /**
     * 桌面提醒
     * @param title
     * @param content
     * @param icon
     */
    Dialog.notify = function (title, content, icon) {
        if (title === void 0) { title = '通知'; }
        if (content === void 0) { content = ''; }
        if (icon === void 0) { icon = ''; }
        if (typeof title != 'object') {
            title = {
                title: title,
                content: content,
                ico: icon
            };
        }
        title.type = DialogType.notify;
        return this.create(title).show();
    };
    /**
     * 添加弹出框
     * @param element
     */
    Dialog.addItem = function (element) {
        this._data[++this._guid] = element;
        element.id = this._guid;
        if (this._needBg(element.options.type)
            && !element.options.target) {
            this.showBg();
        }
    };
    Dialog.hasItem = function (id) {
        if (id === void 0) { id = this._guid; }
        return this._data.hasOwnProperty(id + '');
    };
    Dialog.get = function (id) {
        if (id === void 0) { id = this._guid; }
        if (this.hasItem(id)) {
            return this._data[id];
        }
        throw "error:" + id;
    };
    /**
     * 根据id删除弹出框
     * @param id
     */
    Dialog.removeItem = function (id) {
        if (id === void 0) { id = this._guid; }
        if (!this.hasItem(id)) {
            return;
        }
        this._data[id].close();
        if (this._needBg(this._data[id].options.type)) {
            this.closeBg();
        }
        delete this._data[id];
    };
    /**
     * 删除所有弹出框
     */
    Dialog.remove = function () {
        this.map(function (item) {
            item.close();
        });
    };
    /**
     * 判断是否需要使用遮罩
     * @param type
     */
    Dialog._needBg = function (type) {
        return type != DialogType.tip
            && type != DialogType.message
            && type != DialogType.page
            && type != DialogType.notify
            && type != DialogType.pop;
    };
    /**
     * 循环所有弹出框
     * @param callback
     */
    Dialog.map = function (callback) {
        for (var id in this._data) {
            if (!this.hasItem(id)) {
                continue;
            }
            var result = callback(this._data[id]);
            if (result == false) {
                return;
            }
        }
    };
    /**
     * 显示遮罩
     */
    Dialog.showBg = function (target, isPublic) {
        if (target === void 0) { target = $(document.body); }
        if (isPublic === void 0) { isPublic = true; }
        var instance = this;
        if (!this._dialogBg) {
            this._dialogBg = $('<div class="dialog-bg"></div>');
            this._dialogBg.click(function (e) {
                e.stopPropagation();
                instance.remove();
            });
        }
        // 更改遮罩的位置
        target.append(this._dialogBg);
        this._dialogBg.toggleClass('dialog-bg-private', !isPublic);
        this._bgLock++;
        this._dialogBg.show();
    };
    /**
     * 隐藏遮罩
     */
    Dialog.closeBg = function () {
        if (!this._dialogBg) {
            return;
        }
        this._bgLock--;
        if (this._bgLock > 0) {
            return;
        }
        this._dialogBg.hide();
    };
    Dialog.addMethod = function (type, dialog) {
        this.methods[type] = dialog;
    };
    Dialog.hasMethod = function (type) {
        return this.methods.hasOwnProperty(type.toString());
    };
    Dialog.getMethod = function (type) {
        return this.methods[type];
    };
    return Dialog;
}());
Dialog.methods = {};
Dialog._data = {};
Dialog._guid = 0; // id标记
Dialog._tipData = [];
Dialog._bgLock = 0;
Dialog.$window = $(window);
/**
 * 弹出框类型
 */
var DialogType;
(function (DialogType) {
    DialogType[DialogType["tip"] = 0] = "tip";
    DialogType[DialogType["message"] = 1] = "message";
    DialogType[DialogType["notify"] = 2] = "notify";
    DialogType[DialogType["pop"] = 3] = "pop";
    DialogType[DialogType["loading"] = 4] = "loading";
    DialogType[DialogType["select"] = 5] = "select";
    DialogType[DialogType["image"] = 6] = "image";
    DialogType[DialogType["disk"] = 7] = "disk";
    DialogType[DialogType["form"] = 8] = "form";
    DialogType[DialogType["content"] = 9] = "content";
    DialogType[DialogType["box"] = 10] = "box";
    DialogType[DialogType["page"] = 11] = "page";
})(DialogType || (DialogType = {}));
/**
 * 弹出框位置
 */
var DialogDirection;
(function (DialogDirection) {
    DialogDirection[DialogDirection["top"] = 0] = "top";
    DialogDirection[DialogDirection["right"] = 1] = "right";
    DialogDirection[DialogDirection["bottom"] = 2] = "bottom";
    DialogDirection[DialogDirection["left"] = 3] = "left";
    DialogDirection[DialogDirection["center"] = 4] = "center";
    DialogDirection[DialogDirection["leftTop"] = 5] = "leftTop";
    DialogDirection[DialogDirection["rightTop"] = 6] = "rightTop";
    DialogDirection[DialogDirection["rightBottom"] = 7] = "rightBottom";
    DialogDirection[DialogDirection["leftBottom"] = 8] = "leftBottom";
})(DialogDirection || (DialogDirection = {}));
/**
 * 弹出框状态
 */
var DialogStatus;
(function (DialogStatus) {
    DialogStatus[DialogStatus["hide"] = 0] = "hide";
    DialogStatus[DialogStatus["show"] = 1] = "show";
    DialogStatus[DialogStatus["closing"] = 2] = "closing";
    DialogStatus[DialogStatus["closed"] = 3] = "closed"; //已关闭
})(DialogStatus || (DialogStatus = {}));
var DialogPlugin = (function () {
    function DialogPlugin(element, option) {
        this.element = element;
        this.option = option;
        var instance = this;
        this.element.click(function () {
            if (!instance.dialog) {
                instance.dialog = Dialog.create(instance._parseOption($(this)));
            }
            instance.dialog.show();
        });
    }
    DialogPlugin.prototype._parseOption = function (element) {
        var option = $.extend({}, this.option);
        option.type = Dialog.parseEnum(element.attr('dialog-type') || this.option.type, DialogType);
        option.content = element.attr('dialog-content') || this.option.content;
        option.url = element.attr('dialog-url') || this.option.url;
        option.time = parseInt(element.attr('dialog-time')) || this.option.time;
        if (option.type == DialogType.pop && !option.target) {
            option.target = element;
        }
        return option;
    };
    return DialogPlugin;
}());
;
(function ($) {
    $.fn.dialog = function (option) {
        return new DialogPlugin(this, option);
    };
})(jQuery);
var DialogTip = (function (_super) {
    __extends(DialogTip, _super);
    function DialogTip(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogTip.prototype.init = function () {
        Dialog.addItem(this);
        this.createCore().createContent()
            .appendParent().setProperty().bindEvent()
            .addTime();
    };
    DialogTip.prototype.getDefaultOption = function () {
        return new DefaultDialogTipOption();
    };
    /**
     * 设置内容
     */
    DialogTip.prototype.createContent = function () {
        this.box.text(this.options.content);
        return this;
    };
    /**
     * 添加到容器上
     */
    DialogTip.prototype.appendParent = function () {
        if (!this.box) {
            return this;
        }
        if (!this.options.target) {
            $(document.body).append(this.box);
            return this;
        }
        this.options.target.append(this.box);
        this.box.addClass("dialog-private");
        return this;
    };
    /**
     * 设置属性
     */
    DialogTip.prototype.setProperty = function () {
        var maxWidth = Dialog.$window.width();
        var width = this.box.width();
        this.y = (this.getDialogTop() || (Dialog.$window.height() * 0.68 + 30)) - 30 - this.height;
        this.css('left', (maxWidth - width) / 2 + 'px');
        return this;
    };
    /**
     * 绑定事件
     */
    DialogTip.prototype.bindEvent = function () {
        this.box.click(function (e) {
            e.stopPropagation();
        });
        var instance = this;
        $(window).resize(function () {
            if (instance.box) {
                instance.resize();
                return;
            }
        });
        return this;
    };
    /**
     * 重设尺寸
     */
    DialogTip.prototype.resize = function () {
        var maxWidth = Dialog.$window.width();
        var width = this.box.width();
        this.css('left', (maxWidth - width) / 2 + 'px');
        this.trigger('resize');
    };
    DialogTip.prototype.addTime = function () {
        if (this.options.time <= 0) {
            return;
        }
        var instance = this;
        this._timeHandle = setTimeout(function () {
            instance._timeHandle = undefined;
            instance.close();
        }, this.options.time);
    };
    DialogTip.prototype.stopTime = function () {
        if (!this._timeHandle) {
            return;
        }
        clearTimeout(this._timeHandle);
        this._timeHandle = undefined;
    };
    DialogTip.prototype.closingBox = function () {
        if (!_super.prototype.closingBox.call(this)) {
            return false;
        }
        this.stopTime();
        return true;
    };
    DialogTip.prototype.closeBox = function () {
        if (!_super.prototype.closeBox.call(this)) {
            return false;
        }
        this.changeOther();
        this.stopTime();
        return true;
    };
    DialogTip.prototype.changeOther = function () {
        var instance = this;
        Dialog.map(function (item) {
            if (item.options.type != DialogType.tip || item.y >= instance.y) {
                return;
            }
            item.y += instance.height + 30;
        });
    };
    return DialogTip;
}(DialogCore));
var DefaultDialogTipOption = (function () {
    function DefaultDialogTipOption() {
        this.time = 2000;
    }
    return DefaultDialogTipOption;
}());
Dialog.addMethod(DialogType.tip, DialogTip);
var DialogMessage = (function (_super) {
    __extends(DialogMessage, _super);
    function DialogMessage(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogMessage.prototype.setProperty = function () {
        this.height;
        this.y = (this.getDialogBottom() || (Dialog.$window.height() * 0.1 - 30)) + 30;
        return this;
    };
    DialogMessage.prototype.bindEvent = function () {
        return this;
    };
    DialogMessage.prototype.changeOther = function () {
        var instance = this;
        Dialog.map(function (item) {
            if (item.options.type != DialogType.message || item.y <= instance.y) {
                return;
            }
            item.y -= instance.height + 30;
        });
    };
    return DialogMessage;
}(DialogTip));
Dialog.addMethod(DialogType.message, DialogMessage);
var DialogNotify = (function (_super) {
    __extends(DialogNotify, _super);
    function DialogNotify(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogNotify.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogNotify.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
    /**
     * 获取默认设置
     */
    DialogNotify.prototype.getDefaultOption = function () {
        return new DefaultDialogNotifyOption();
    };
    DialogNotify.prototype.showBox = function () {
        if (this.notify) {
            return false;
        }
        Dialog.addItem(this);
        this._createNotify();
        return true;
    };
    DialogNotify.prototype.hideBox = function () {
        return this.closeBox();
    };
    DialogNotify.prototype.closingBox = function () {
        return this.closeBox();
    };
    DialogNotify.prototype.closeBox = function () {
        if (this.status == DialogStatus.closing
            || this.status == DialogStatus.closed) {
            return false;
        }
        if (false == this.trigger('closed')) {
            console.log('closed stop!');
            return false;
        }
        this._closeNotify();
        Dialog.removeItem(this.id);
        this.changeStatus(DialogStatus.closed);
        this.stopTime();
        return true;
    };
    DialogNotify.prototype._createNotify = function () {
        var instance = this;
        if ("Notification" in window) {
            var ask = Notification.requestPermission();
            ask.then(function (permission) {
                if (permission !== "granted") {
                    console.log('您的浏览器支持但未开启桌面提醒！');
                }
                instance.notify = new Notification(instance.options.title, {
                    body: instance.options.content,
                    icon: instance.options.ico,
                });
                instance.notify.addEventListener("click", function (event) {
                    instance.trigger('done');
                });
            });
            return;
        }
        console.log('您的浏览器不支持桌面提醒！');
    };
    DialogNotify.prototype._closeNotify = function () {
        if (!this.notify) {
            return;
        }
        this.notify.close();
        this.notify = undefined;
    };
    return DialogNotify;
}(DialogTip));
var DefaultDialogNotifyOption = (function (_super) {
    __extends(DefaultDialogNotifyOption, _super);
    function DefaultDialogNotifyOption() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.title = '提示';
        return _this;
    }
    return DefaultDialogNotifyOption;
}(DefaultDialogTipOption));
Dialog.addMethod(DialogType.notify, DialogNotify);
var DialogPop = (function (_super) {
    __extends(DialogPop, _super);
    function DialogPop(option, id) {
        var _this = _super.call(this, option, id) || this;
        if (_this.options.direction) {
            _this.options.direction = Dialog.parseEnum(_this.options.direction, DialogDirection);
        }
        return _this;
    }
    DialogPop.prototype.setProperty = function () {
        this._setPopProperty();
        return this;
    };
    /**
     * 添加到容器上
     */
    DialogPop.prototype.appendParent = function () {
        if (!this.box) {
            return this;
        }
        $(document.body).append(this.box);
        return this;
    };
    DialogPop.prototype.bindEvent = function () {
        return this;
    };
    DialogPop.prototype._getRandomDirection = function () {
        return Math.floor((Math.random() * 8));
    };
    DialogPop.prototype._setPopProperty = function () {
        if (!this.options.direction) {
            this.options.direction = this._getRandomDirection();
        }
        this.box.addClass('dialog-pop-' + DialogDirection[this.options.direction]);
        var offest = this.options.target.offset();
        var _a = this._getPopLeftTop(Dialog.parseEnum(this.options.direction, DialogCore), this.box.outerWidth(), this.box.outerHeight(), offest.left, offest.top, this.options.target.outerWidth(), this.options.target.outerHeight()), x = _a[0], y = _a[1];
        this.box.css({
            left: x + 'px',
            top: y + 'px'
        });
    };
    DialogPop.prototype._getPopLeftTop = function (direction, width, height, x, y, boxWidth, boxHeight) {
        var space = 30; // 空隙
        switch (direction) {
            case DialogDirection.rightTop:
            case DialogDirection.right:
                return [x + boxWidth + space, y + (boxHeight - height) / 2];
            case DialogDirection.rightBottom:
            case DialogDirection.bottom:
                return [x + (boxWidth - width) / 2, y + boxHeight + space];
            case DialogDirection.leftBottom:
            case DialogDirection.left:
                return [x - width - space, y + (boxHeight - height) / 2];
            case DialogDirection.center:
            case DialogDirection.leftTop:
            case DialogDirection.top:
            default:
                return [x + (boxWidth - width) / 2, y - height - space];
        }
    };
    return DialogPop;
}(DialogTip));
Dialog.addMethod(DialogType.pop, DialogPop);
var DialogLoading = (function (_super) {
    __extends(DialogLoading, _super);
    function DialogLoading(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogLoading.prototype.getDefaultOption = function () {
        return new DefaultDialogLoadingOption();
    };
    DialogLoading.prototype.createContent = function () {
        this.box.html(this._getLoading());
        return this;
    };
    DialogLoading.prototype.setProperty = function () {
        var target = this.options.target || Dialog.$window;
        var maxWidth = target.width();
        var width = this.box.width();
        var maxHeight = target.height();
        var height = this.box.height();
        this.css({
            left: (maxWidth - width) / 2 + 'px',
            top: (maxHeight - height) / 2 + 'px'
        });
        return this;
    };
    DialogLoading.prototype._getLoading = function () {
        var html = '';
        var num = this.options.count;
        for (; num > 0; num--) {
            html += '<span></span>';
        }
        return '<div class="' + this.options.extra + '">' + html + '</div>';
    };
    DialogLoading.prototype.showBox = function () {
        if (!_super.prototype.showBox.call(this)) {
            return false;
        }
        if (!this.options.target) {
            Dialog.showBg();
            return true;
        }
        Dialog.showBg(this.options.target, false);
        return true;
    };
    DialogLoading.prototype.hideBox = function () {
        if (!_super.prototype.hideBox.call(this)) {
            return false;
        }
        Dialog.closeBg();
        return true;
    };
    DialogLoading.prototype.closingBox = function () {
        if (!_super.prototype.closingBox.call(this)) {
            return false;
        }
        Dialog.closeBg();
        return true;
    };
    DialogLoading.prototype.closeBox = function () {
        var status = this.status;
        if (!_super.prototype.closeBox.call(this)) {
            return false;
        }
        if (status != DialogStatus.closing) {
            Dialog.closeBg();
        }
        return true;
    };
    return DialogLoading;
}(DialogTip));
var DefaultDialogLoadingOption = (function () {
    function DefaultDialogLoadingOption() {
        this.extra = 'loading'; //额外的class
        this.count = 5;
        this.time = 0;
    }
    return DefaultDialogLoadingOption;
}());
Dialog.addMethod(DialogType.loading, DialogLoading);
var DialogContent = (function (_super) {
    __extends(DialogContent, _super);
    function DialogContent(option, id) {
        var _this = _super.call(this, option, id) || this;
        _this._isLoading = false; //加载中 显示时候出现加载动画
        if (!_this.options.content && _this.options.url) {
            var instance_1 = _this;
            _this.isLoading = true;
            $.get(_this.options.url, function (html) {
                instance_1.options.content = html;
                this.isLoading = false;
                instance_1.init();
            });
        }
        return _this;
    }
    Object.defineProperty(DialogContent.prototype, "isLoading", {
        get: function () {
            return this._isLoading;
        },
        set: function (arg) {
            this._isLoading = arg;
            this._toggleLoading();
            // 加载完成时显示元素
            if (!this._isLoading && this.status == DialogStatus.show) {
                this.showBox();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 显示加载动画
     */
    DialogContent.prototype._toggleLoading = function (arg) {
        if (arg === void 0) { arg = this.status; }
        if (!this.isLoading || arg != DialogStatus.show) {
            if (this._loadingDialog) {
                this._loadingDialog.close();
                this._loadingDialog = undefined;
            }
            return;
        }
        if (this._loadingDialog) {
            this._loadingDialog.show();
            return;
        }
        this._loadingDialog = Dialog.loading().show();
    };
    DialogContent.prototype.init = function () {
        Dialog.addItem(this);
        this.createCore().createContent()
            .appendParent().setProperty().bindEvent();
        if (this.status == DialogStatus.show) {
            this.showBox();
        }
    };
    DialogContent.prototype.getDefaultOption = function () {
        return new DefaultDialogContentOption();
    };
    /**
     * 设置内容
     */
    DialogContent.prototype.createContent = function () {
        this.box.html(this.getContentHtml() + this.getFooterHtml());
        return this;
    };
    /**
     * 添加到容器上
     */
    DialogContent.prototype.appendParent = function () {
        $(document.body).append(this.box);
        return this;
    };
    /**
     * 设置属性
     */
    DialogContent.prototype.setProperty = function () {
        return this;
    };
    /**
     * 绑定事件
     */
    DialogContent.prototype.bindEvent = function () {
        this.box.click(function (e) {
            e.stopPropagation();
        });
        this.onClick(".dialog-yes", function () {
            this.trigger('done');
        });
        this.onClick(".dialog-close", function () {
            this.close();
        });
        return this;
    };
    DialogContent.prototype.getContentHtml = function (content) {
        if (content === void 0) { content = this.options.content; }
        if (typeof content == 'object') {
            content = JSON.stringify(content);
        }
        return '<div class="dialog-body">' + content + '</div>';
    };
    DialogContent.prototype.getFooterHtml = function () {
        if (!this.options.hasYes && !this.options.hasNo && (typeof this.options.button == 'object' && this.options.button instanceof Array && this.options.button.length == 0)) {
            return '';
        }
        var html = '<div class="dialog-footer">';
        if (this.options.hasYes) {
            html += '<button class="dialog-yes">' + (typeof this.options.hasYes == 'string' ? this.options.hasYes : '确认') + '</button>';
        }
        if (this.options.hasNo) {
            html += '<button class="dialog-close">' + (typeof this.options.hasNo == 'string' ? this.options.hasNo : '取消') + '</button>';
        }
        if (typeof this.options.button == 'string') {
            this.options.button = [this.options.button];
        }
        $.each(this.options.button, function (i, item) {
            if (typeof item == 'string') {
                html += '<button">' + item + '</button>';
                return;
            }
            html += '<button class="' + item.tag + '">' + item.content + '</button>';
        });
        return html += '</div>';
    };
    DialogContent.prototype.onClick = function (tag, callback) {
        var instance = this;
        this.box.on('click', tag, function (e) {
            callback.call(instance, $(this));
        });
    };
    DialogContent.prototype.showBox = function () {
        if (this.isLoading) {
            this.changeStatus(DialogStatus.show);
            return false;
        }
        if (!_super.prototype.showBox.call(this)) {
            return false;
        }
        Dialog.showBg(this.options.target);
        return true;
    };
    DialogContent.prototype.hideBox = function () {
        if (this.isLoading) {
            this.changeStatus(DialogStatus.hide);
            return false;
        }
        if (!_super.prototype.hideBox.call(this)) {
            return false;
        }
        Dialog.closeBg();
        return true;
    };
    DialogContent.prototype.closingBox = function () {
        if (this.isLoading) {
            this.changeStatus(DialogStatus.hide);
            return false;
        }
        if (!_super.prototype.closingBox.call(this)) {
            return false;
        }
        Dialog.closeBg();
        return true;
    };
    DialogContent.prototype.closeBox = function () {
        if (this.isLoading) {
            this.changeStatus(DialogStatus.hide);
            return false;
        }
        var status = this.status;
        if (!_super.prototype.closeBox.call(this)) {
            return false;
        }
        if (status != DialogStatus.closing) {
            Dialog.closeBg();
        }
        return true;
    };
    return DialogContent;
}(DialogCore));
var DefaultDialogContentOption = (function () {
    function DefaultDialogContentOption() {
        this.hasYes = true;
        this.hasNo = true;
        this.time = 0;
        this.button = [];
    }
    return DefaultDialogContentOption;
}());
Dialog.addMethod(DialogType.content, DialogContent);
var DialogBox = (function (_super) {
    __extends(DialogBox, _super);
    function DialogBox(option, id) {
        return _super.call(this, option, id) || this;
    }
    /**
     * 设置内容
     */
    DialogBox.prototype.createContent = function () {
        this.box.html(this.getHeaderHtml() + this.getContentHtml() + this.getFooterHtml());
        return this;
    };
    DialogBox.prototype.setProperty = function () {
        var target = this.options.target || Dialog.$window;
        var maxWidth = target.width();
        var width = this.box.width();
        var maxHeight = target.height();
        var height = this.box.height();
        if (maxWidth > width && maxHeight > height) {
            this.css({
                left: (maxWidth - width) / 2 + 'px',
                top: (maxHeight - height) / 2 + 'px'
            });
            return this;
        }
        this.options.type = DialogType.page;
        this.box.addClass("dialog-page");
        Dialog.closeBg();
        return this;
    };
    DialogBox.prototype.bindEvent = function () {
        // 点击标题栏移动
        var instance = this;
        var isMove = false;
        var x, y;
        this.box.find(".dialog-header .dialog-title").mousedown(function (e) {
            isMove = true;
            x = e.pageX - parseInt(instance.box.css('left'));
            y = e.pageY - parseInt(instance.box.css('top'));
            instance.box.fadeTo(20, .5);
        });
        $(document).mousemove(function (e) {
            if (!isMove) {
                return;
            }
            instance.box.css({
                top: e.pageY - y,
                left: e.pageX - x
            });
        }).mouseup(function () {
            isMove = false;
            if (instance.box) {
                instance.box.fadeTo('fast', 1);
            }
        });
        $(window).resize(function () {
            if (instance.box) {
                instance.resize();
                return;
            }
        });
        return _super.prototype.bindEvent.call(this);
    };
    /**
     * 重设尺寸
     */
    DialogBox.prototype.resize = function () {
        this.setProperty();
        this.trigger('resize');
    };
    DialogBox.prototype.getDefaultOption = function () {
        return new DefaultDialogBoxOption();
    };
    DialogBox.prototype.getHeaderHtml = function () {
        var html = '<div class="dialog-header"><div class="dialog-title">';
        if (this.options.ico) {
            html += '<i class="fa fa-' + this.options.ico + '"></i>';
        }
        if (this.options.title) {
            html += this.options.title;
        }
        return html + '</div><i class="fa fa-close dialog-close"></i></div>';
    };
    return DialogBox;
}(DialogContent));
var DefaultDialogBoxOption = (function (_super) {
    __extends(DefaultDialogBoxOption, _super);
    function DefaultDialogBoxOption() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.title = '提示';
        _this.canMove = true;
        return _this;
    }
    return DefaultDialogBoxOption;
}(DefaultDialogContentOption));
Dialog.addMethod(DialogType.box, DialogBox);
var DialogForm = (function (_super) {
    __extends(DialogForm, _super);
    function DialogForm(option, id) {
        return _super.call(this, option, id) || this;
    }
    Object.defineProperty(DialogForm.prototype, "data", {
        /**
         * 表单数据
         */
        get: function () {
            if (!this._data) {
                this._data = this._getFormData();
            }
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DialogForm.prototype, "elements", {
        /**
         * 表单控件
         */
        get: function () {
            if (!this._elements) {
                this._elements = this._getFormElement();
            }
            return this._elements;
        },
        enumerable: true,
        configurable: true
    });
    DialogForm.prototype.getContentHtml = function (content) {
        if (content === void 0) { content = this.options.content; }
        return '<div class="dialog-body">' + this._createForm(content) + '</div>';
    };
    DialogForm.prototype._createForm = function (data) {
        if (typeof data != 'object') {
            return data;
        }
        var html = '';
        var instance = this;
        $.each(data, function (name, item) {
            html += instance._createInput(name, item);
        });
        return html;
    };
    DialogForm.prototype._createInput = function (name, data) {
        if (typeof data != 'object') {
            data = { label: data };
        }
        if (!data.type) {
            data.type = !data.item ? 'text' : 'select';
        }
        var attr = '';
        var html = '';
        var defaultVal = '';
        if (data.default) {
            defaultVal = data.defaultVal;
        }
        if (data.label) {
            html += '<label>' + data.label + '</label>';
        }
        if (data.id) {
            attr += ' id="' + data.id + '"';
        }
        if (data.class) {
            attr += ' class="' + data.class + '"';
        }
        if (data.required) {
            attr += ' required="required"';
        }
        if (data.placeholder) {
            attr += ' placeholder="' + data.placeholder + '"';
        }
        switch (data.type) {
            case 'textarea':
                html += '<textarea name="' + name + '" ' + attr + '>' + defaultVal + '</textarea>';
                break;
            case 'select':
                var option_1 = '';
                $.each(data.item, function (val, label) {
                    if (val == defaultVal) {
                        val += '" selected="selected';
                    }
                    option_1 += '<option value="' + val + '">' + label + '</option>';
                });
                html += '<select name="' + name + '" ' + attr + '>' + option_1 + '<select>';
                break;
            case 'radio':
            case 'checkbox':
                html += '<div' + attr + '>';
                $.each(data.item, function (val, label) {
                    if (val == defaultVal) {
                        val += '" checked="checked';
                    }
                    html += '<input type="' + data.type + '" name="' + name + '" value="' + val + '">' + label;
                });
                html += '<div>';
                break;
            default:
                html += '<input type="' + data.type + '" name="' + name + '" ' + attr + ' value="' + defaultVal + '">';
                break;
        }
        return '<div class="input-group">' + html + '</div>';
    };
    /**
     * 获取表单控件
     */
    DialogForm.prototype._getFormElement = function () {
        var elements = {};
        var instance = this;
        this.box.find('input,select,textarea,button').each(function (i, ele) {
            var item = $(ele);
            var name = item.attr('name');
            if (!name) {
                return;
            }
            if (!item.is('[type=ridio]') && !item.is('[type=checkbox]') && name.indexOf('[]') < 0) {
                elements[name] = item;
                return;
            }
            if (!elements.hasOwnProperty(name)) {
                elements[name] = item;
                return;
            }
            elements[name].push(ele);
        });
        return elements;
    };
    /**
     * 获取表单数据
     */
    DialogForm.prototype._getFormData = function () {
        var formData = {};
        $.each(this.elements, function (name, element) {
            if (element.is('[type=ridio]')) {
                element.each(function (i, ele) {
                    var item = $(ele);
                    if (item.attr('checked')) {
                        formData[name] = item.val();
                    }
                });
                return;
            }
            if (element.is('[type=checkbox]')) {
                var data_1 = [];
                element.each(function (i, ele) {
                    var item = $(ele);
                    if (item.attr('checked')) {
                        data_1.push(item.val());
                    }
                });
                formData[name] = data_1;
                return;
            }
            if (name.indexOf('[]') > 0) {
                var data_2 = [];
                element.each(function (i, ele) {
                    var item = $(ele);
                    data_2.push(item.val());
                });
                formData[name] = data_2;
                return;
            }
            formData[name] = element.val();
        });
        return formData;
    };
    return DialogForm;
}(DialogBox));
Dialog.addMethod(DialogType.form, DialogForm);
var DialogPage = (function (_super) {
    __extends(DialogPage, _super);
    function DialogPage(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogPage.prototype.getHeaderHtml = function () {
        var html = '<div class="dialog-header"><i class="fa fa-arrow-left"></i><div class="dialog-title">';
        if (this.options.ico) {
            html += '<i class="fa fa-' + this.options.ico + '"></i>';
        }
        if (this.options.title) {
            html += this.options.title;
        }
        return html + '</div><i class="fa fa-close dialog-close"></i></div>';
    };
    /**
     * 绑定事件
     */
    DialogPage.prototype.bindEvent = function () {
        this.box.click(function (e) {
            e.stopPropagation();
        });
        this.onClick(".dialog-header .fa-arrow-left", function () {
            this.close();
        });
        this.onClick(".dialog-yes", function () {
            this.trigger('done');
        });
        this.onClick(".dialog-close", function () {
            this.close();
        });
        return this;
    };
    return DialogPage;
}(DialogBox));
Dialog.addMethod(DialogType.page, DialogPage);
var DialogImage = (function (_super) {
    __extends(DialogImage, _super);
    function DialogImage(option, id) {
        var _this = _super.call(this, option, id) || this;
        _this._index = 0;
        return _this;
    }
    Object.defineProperty(DialogImage.prototype, "src", {
        get: function () {
            return this._src;
        },
        set: function (img) {
            if (!img) {
                img = this.options.content;
            }
            this._src = img;
            this.box.find('.dialog-body img').attr('src', img);
        },
        enumerable: true,
        configurable: true
    });
    DialogImage.prototype.createContent = function () {
        this.box.html(this.getContentHtml());
        return this;
    };
    DialogImage.prototype.setProperty = function () {
        var target = this.options.target || Dialog.$window;
        var maxWidth = target.width();
        var width = this.box.width();
        var maxHeight = target.height();
        var height = this.box.height();
        this.css({
            left: (maxWidth - width) / 2 + 'px',
            top: (maxHeight - height) / 2 + 'px'
        });
        return this;
    };
    /**
     * 绑定事件
     */
    DialogImage.prototype.bindEvent = function () {
        this.box.click(function (e) {
            e.stopPropagation();
        });
        this.onClick(".dialog-close", function () {
            this.close();
        });
        this.onClick(".dialog-previous", function () {
            this.previous();
        });
        this.onClick(".dialog-next", function () {
            this.next();
        });
        var instance = this;
        $(window).resize(function () {
            if (instance.box) {
                instance.resize();
                return;
            }
        });
        this.box.find('.dialog-body img').bind("load", function () {
            if (instance.box) {
                instance.resize();
                return;
            }
        });
        return this;
    };
    /**
     * 重设尺寸
     */
    DialogImage.prototype.resize = function () {
        this.setProperty();
        this.trigger('resize');
    };
    DialogImage.prototype.previous = function () {
        this.src = this.trigger('previous', --this._index);
    };
    DialogImage.prototype.next = function () {
        this.src = this.trigger('next', ++this._index);
    };
    DialogImage.prototype.getContentHtml = function () {
        if (!this.options.content) {
            this.options.content = this.trigger('next', ++this._index);
        }
        return '<i class="fa fa-chevron-left dialog-previous"></i><div class="dialog-body"><img src="' + this.options.content + '"></div><i class="fa fa-chevron-right dialog-next"></i><i class="fa fa-close dialog-close"></i>';
    };
    return DialogImage;
}(DialogContent));
var DefaultDialogImageOption = (function () {
    function DefaultDialogImageOption() {
        this.onnext = function (index) {
            return $(document.body).find('img').eq(index).attr('src');
        };
        this.onprevious = function (index) {
            return $(document.body).find('img').eq(index).attr('src');
        };
    }
    return DefaultDialogImageOption;
}());
Dialog.addMethod(DialogType.image, DialogImage);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LnRzIiwiYm94LnRzIiwiY29yZS50cyIsImRlZmF1bHQudHMiLCJkaWFsb2cudHMiLCJlbnVtLnRzIiwianF1ZXJ5LmRpYWxvZy50cyIsInRpcC50cyIsIm1lc3NhZ2UudHMiLCJub3RpZnkudHMiLCJwb3AudHMiLCJsb2FkaW5nLnRzIiwiY29udGVudC50cyIsImZvcm0udHMiLCJwYWdlLnRzIiwiaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0lBQUE7SUFtQkEsQ0FBQTtJQWhCQSxnQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLFFBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHNCQUFBLEdBQUEsVUFBQSxLQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQkFBQSxHQUFBLFVBQUEsS0FBQTtRQUFBLGNBQUE7YUFBQSxVQUFBLEVBQUEscUJBQUEsRUFBQSxJQUFBO1lBQUEsNkJBQUE7O1FBQ0EsSUFBQSxTQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxZQUFBLElBQUEsU0FBQSxJQUFBLEdBQUE7O0lBQ0EsQ0FBQTtJQUNBLFVBQUE7QUFBQSxDQW5CQSxBQW1CQSxJQUFBO0FDbkJBO0lBQUEsdUJBQUE7SUFBQTs7SUFnQ0EsQ0FBQTtJQTFCQSwwQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEseUJBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsU0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBR0E7Ozs7T0FJQTtJQUNBLFdBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQSxPQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsT0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLFVBQUE7QUFBQSxDQWhDQSxBQWdDQSxDQWhDQSxHQUFBLEdBZ0NBO0FDaENBO0lBQUEsOEJBQUE7SUFDQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtRQUZBLFlBSUEsaUJBQUEsU0FHQTtRQUxBLFFBQUEsR0FBQSxFQUFBLENBQUE7UUFTQSxhQUFBLEdBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQTtRQU5BLEtBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsS0FBQSxDQUFBLGdCQUFBLEVBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7O0lBQ0EsQ0FBQTtJQU1BLHNCQUFBLDhCQUFBO2FBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLENBQUE7YUFFQSxVQUFBLEdBQUE7WUFDQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7WUFDQSxXQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxNQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLEtBQUEsWUFBQSxDQUFBLElBQUE7b0JBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxJQUFBO29CQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0EsS0FBQSxZQUFBLENBQUEsT0FBQTtvQkFDQSxJQUFBLENBQUEsVUFBQSxFQUFBLENBQUE7b0JBQ0EsS0FBQSxDQUFBO2dCQUNBLEtBQUEsWUFBQSxDQUFBLE1BQUE7b0JBQ0EsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsQ0FBQTtnQkFDQTtvQkFDQSxNQUFBLGVBQUEsR0FBQSxHQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTs7O09BeEJBO0lBK0JBLHNCQUFBLHlCQUFBO2FBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTthQUVBLFVBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTs7O09BTEE7SUFTQSxzQkFBQSw4QkFBQTthQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxNQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxNQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7OztPQUxBO0lBT0E7Ozs7T0FJQTtJQUNBLGlDQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUEsUUFBQTtRQUFBLHlCQUFBLEVBQUEsZ0JBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxNQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxNQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxxQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsbUJBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBOztPQUVBO0lBQ0EsNEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSw0QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxLQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLCtCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxPQUFBO2VBQ0EsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSw4RUFBQSxFQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxhQUFBO2dCQUNBLFFBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSw2QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxTQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUlBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSw0QkFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLGlDQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBT0Esd0JBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxLQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx5QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx5QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwwQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwyQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxpQ0FBQSxHQUFBO1FBQUEsaUJBWUE7UUFYQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxRQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQ0FBQSxHQUFBO1FBQUEsaUJBYUE7UUFaQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxRQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQSxHQUFBLE1BQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBR0EsK0JBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNEJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNkJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsOEJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsOEJBQUEsR0FBQTtRQUNBLElBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQ0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsT0FBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxHQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFFBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLEtBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsRUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFdBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsRUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxNQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxVQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxJQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQTtZQUNBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBQ0EsaUJBQUE7QUFBQSxDQTdTQSxBQTZTQSxDQTdTQSxHQUFBLEdBNlNBO0FDN1NBO0lBQUE7UUFDQSxVQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsU0FBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUE7UUFDQSxZQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsV0FBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUFBLDBCQUFBO0FBQUEsQ0FQQSxBQU9BLElBQUE7QUNQQTtJQUFBO0lBa1NBLENBQUE7SUFsUkE7OztPQUdBO0lBQ0EsYUFBQSxHQUFBLFVBQUEsTUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsT0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsSUFBQTtRQUFBLHFCQUFBLEVBQUEsV0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7OztPQUlBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLElBQUE7UUFBQSxxQkFBQSxFQUFBLFdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsSUFBQTtRQUFBLHFCQUFBLEVBQUEsUUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7O09BS0E7SUFDQSxjQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLE1BQUEsRUFBQSxNQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7O09BTUE7SUFDQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQTtnQkFDQSxPQUFBLEVBQUEsT0FBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7Ozs7T0FPQTtJQUNBLFdBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsVUFBQSxDQUFBLEdBQUE7WUFDQSxPQUFBLEVBQUEsT0FBQTtZQUNBLEtBQUEsRUFBQSxLQUFBO1lBQ0EsTUFBQSxFQUFBLE1BQUE7WUFDQSxLQUFBLEVBQUEsS0FBQTtZQUNBLE1BQUEsRUFBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7Ozs7T0FNQTtJQUNBLFdBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUE7UUFBQSxzQkFBQSxFQUFBLFlBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2dCQUNBLE1BQUEsRUFBQSxNQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7T0FLQTtJQUNBLGFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQTtRQUFBLHNCQUFBLEVBQUEsWUFBQTtRQUFBLHdCQUFBLEVBQUEsWUFBQTtRQUFBLHFCQUFBLEVBQUEsU0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsS0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLEdBQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7Z0JBQ0EsT0FBQSxFQUFBLE9BQUE7Z0JBQ0EsR0FBQSxFQUFBLElBQUE7YUFDQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGNBQUEsR0FBQSxVQUFBLE9BQUE7UUFDQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7ZUFDQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBRUEsY0FBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsVUFBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGlCQUFBLEdBQUEsVUFBQSxFQUFBO1FBQUEsbUJBQUEsRUFBQSxLQUFBLElBQUEsQ0FBQSxLQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsYUFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUE7WUFDQSxJQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxjQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsSUFBQSxVQUFBLENBQUEsR0FBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsT0FBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsSUFBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsTUFBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLFVBQUEsR0FBQSxVQUFBLFFBQUE7UUFDQSxHQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGFBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQSxRQUFBO1FBQUEsdUJBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBO1FBQUEseUJBQUEsRUFBQSxlQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUFBLCtCQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsVUFBQTtRQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsbUJBQUEsRUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGNBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0JBQUEsR0FBQSxVQUFBLElBQUEsRUFBQSxNQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0JBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0JBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxhQUFBO0FBQUEsQ0FsU0EsQUFrU0E7QUFoU0EsY0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUVBLFlBQUEsR0FBQSxFQUFBLENBQUE7QUFFQSxZQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQTtBQUVBLGVBQUEsR0FBQSxFQUFBLENBQUE7QUFJQSxjQUFBLEdBQUEsQ0FBQSxDQUFBO0FBRUEsY0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQ2RBOztHQUVBO0FBQ0EsSUFBQSxVQWFBO0FBYkEsV0FBQSxVQUFBO0lBQ0EseUNBQUEsQ0FBQTtJQUNBLGlEQUFBLENBQUE7SUFDQSwrQ0FBQSxDQUFBO0lBQ0EseUNBQUEsQ0FBQTtJQUNBLGlEQUFBLENBQUE7SUFDQSwrQ0FBQSxDQUFBO0lBQ0EsNkNBQUEsQ0FBQTtJQUNBLDJDQUFBLENBQUE7SUFDQSwyQ0FBQSxDQUFBO0lBQ0EsaURBQUEsQ0FBQTtJQUNBLDBDQUFBLENBQUE7SUFDQSw0Q0FBQSxDQUFBO0FBQ0EsQ0FBQSxFQWJBLFVBQUEsS0FBQSxVQUFBLFFBYUE7QUFFQTs7R0FFQTtBQUNBLElBQUEsZUFVQTtBQVZBLFdBQUEsZUFBQTtJQUNBLG1EQUFBLENBQUE7SUFDQSx1REFBQSxDQUFBO0lBQ0EseURBQUEsQ0FBQTtJQUNBLHFEQUFBLENBQUE7SUFDQSx5REFBQSxDQUFBO0lBQ0EsMkRBQUEsQ0FBQTtJQUNBLDZEQUFBLENBQUE7SUFDQSxtRUFBQSxDQUFBO0lBQ0EsaUVBQUEsQ0FBQTtBQUNBLENBQUEsRUFWQSxlQUFBLEtBQUEsZUFBQSxRQVVBO0FBRUE7O0dBRUE7QUFDQSxJQUFBLFlBS0E7QUFMQSxXQUFBLFlBQUE7SUFDQSwrQ0FBQSxDQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLHFEQUFBLENBQUE7SUFDQSxtREFBQSxDQUFBLENBQUEsS0FBQTtBQUNBLENBQUEsRUFMQSxZQUFBLEtBQUEsWUFBQSxRQUtBO0FDekNBO0lBQ0Esc0JBQ0EsT0FBQSxFQUNBLE1BQUE7UUFEQSxZQUFBLEdBQUEsT0FBQSxDQUFBO1FBQ0EsV0FBQSxHQUFBLE1BQUEsQ0FBQTtRQUVBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFJQSxtQ0FBQSxHQUFBLFVBQUEsT0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxtQkFBQTtBQUFBLENBM0JBLEFBMkJBLElBQUE7QUFFQSxDQUFBO0FBQUEsQ0FBQSxVQUFBLENBQUE7SUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLE1BQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQSxDQUFBO0FBQ0EsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUM3QkE7SUFBQSw2QkFBQTtJQUNBLG1CQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFNQSx3QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUE7YUFDQSxZQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUE7YUFDQSxPQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsc0JBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsZ0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLElBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDZCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsMkJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsRUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDRCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLFlBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxVQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsUUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLFVBQUEsQ0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGdCQUFBO0FBQUEsQ0FsSUEsQUFrSUEsQ0FsSUEsVUFBQSxHQWtJQTtBQUVBO0lBQUE7UUFDQSxTQUFBLEdBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUFBLDZCQUFBO0FBQUEsQ0FGQSxBQUVBLElBQUE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUN4SUE7SUFBQSxpQ0FBQTtJQUNBLHVCQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUNBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0Esb0JBQUE7QUFBQSxDQTNCQSxBQTJCQSxDQTNCQSxTQUFBLEdBMkJBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBO0FDNUJBO0lBQUEsZ0NBQUE7SUFFQSxzQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBTUEsb0NBQUEsR0FBQTtRQUNBLE1BQUEsSUFBQSxLQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGtDQUFBLEdBQUE7UUFDQSxNQUFBLElBQUEsS0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHVDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSx5QkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsOEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQTtlQUNBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxjQUFBLElBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsR0FBQSxHQUFBLFlBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUE7WUFDQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsVUFBQTtnQkFDQSxFQUFBLENBQUEsQ0FBQSxVQUFBLEtBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtvQkFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxZQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUE7b0JBQ0EsSUFBQSxFQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQTtvQkFDQSxJQUFBLEVBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBO2lCQUNBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsS0FBQTtvQkFDQSxRQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxTQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUJBQUE7QUFBQSxDQXpGQSxBQXlGQSxDQXpGQSxTQUFBLEdBeUZBO0FBRUE7SUFBQSw2Q0FBQTtJQUFBO1FBQUEscUVBRUE7UUFEQSxXQUFBLEdBQUEsSUFBQSxDQUFBOztJQUNBLENBQUE7SUFBQSxnQ0FBQTtBQUFBLENBRkEsQUFFQSxDQUZBLHNCQUFBLEdBRUE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7QUNoR0E7SUFBQSw2QkFBQTtJQUNBLG1CQUNBLE1BQUEsRUFDQSxFQUFBO1FBRkEsWUFJQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLFNBSUE7UUFIQSxFQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLGVBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTs7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxnQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw2QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx1Q0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsbUJBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsR0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLDJOQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLENBQUEsR0FBQSxJQUFBO1lBQ0EsR0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGtDQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxTQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsRUFBQSxDQUFBLENBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxRQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxLQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxRQUFBLEdBQUEsS0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFdBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE1BQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsVUFBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsSUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsS0FBQSxHQUFBLEtBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxHQUFBLENBQUE7WUFDQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLEdBQUEsS0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGdCQUFBO0FBQUEsQ0FuRUEsQUFtRUEsQ0FuRUEsU0FBQSxHQW1FQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQ3BFQTtJQUFBLGlDQUFBO0lBQ0EsdUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHdDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSwwQkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQTtZQUNBLElBQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQTtZQUNBLEdBQUEsRUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUNBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsR0FBQSxDQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsZUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsT0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsT0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGtDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLFVBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQ0FBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsUUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQkFBQTtBQUFBLENBN0VBLEFBNkVBLENBN0VBLFNBQUEsR0E2RUE7QUFFQTtJQUFBO1FBQ0EsVUFBQSxHQUFBLFNBQUEsQ0FBQSxDQUFBLFVBQUE7UUFDQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsU0FBQSxHQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSxpQ0FBQTtBQUFBLENBSkEsQUFJQSxJQUFBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBO0FDN0VBO0lBQUEsaUNBQUE7SUFFQSx1QkFDQSxNQUFBLEVBQ0EsRUFBQTtRQUZBLFlBSUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQSxTQVVBO1FBRUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQSxnQkFBQTtRQVhBLEVBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO1lBQ0EsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLFVBQUEsSUFBQTtnQkFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUE7Z0JBQ0EsVUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBOztJQUNBLENBQUE7SUFNQSxzQkFBQSxvQ0FBQTthQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7WUFDQSxZQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7OztPQVRBO0lBV0E7O09BRUE7SUFDQSxzQ0FBQSxHQUFBLFVBQUEsR0FBQTtRQUFBLG9CQUFBLEVBQUEsTUFBQSxJQUFBLENBQUEsTUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsSUFBQSxHQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGNBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNEJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsYUFBQSxFQUFBO2FBQ0EsWUFBQSxFQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsU0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQSx3Q0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsMEJBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EscUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxvQ0FBQSxHQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLG1DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxzQ0FBQSxHQUFBLFVBQUEsT0FBQTtRQUFBLHdCQUFBLEVBQUEsVUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLDJCQUFBLEdBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxRQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLFlBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLDZCQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsNkJBQUEsR0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLFdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsK0JBQUEsR0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLFdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLENBQUEsRUFBQSxJQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLElBQUEsV0FBQSxHQUFBLElBQUEsR0FBQSxXQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsSUFBQSxpQkFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsV0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLFFBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLFVBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsT0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLE9BQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxrQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxVQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLFFBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0JBQUE7QUFBQSxDQWxNQSxBQWtNQSxDQWxNQSxVQUFBLEdBa01BO0FBRUE7SUFBQTtRQUNBLFdBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxVQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsU0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLFdBQUEsR0FBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBQUEsaUNBQUE7QUFBQSxDQUxBLEFBS0EsSUFBQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQSxhQUFBLENBQUEsQ0FBQTtBWGxOQTtJQUFBLDZCQUFBO0lBQ0EsbUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxJQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQTtnQkFDQSxJQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7Z0JBQ0EsR0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO2FBQ0EsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDZCQUFBLEdBQUE7UUFDQSxVQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxNQUFBLEdBQUEsSUFBQSxDQUFBO1lBQ0EsQ0FBQSxHQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBO2dCQUNBLEdBQUEsRUFBQSxDQUFBLENBQUEsS0FBQSxHQUFBLENBQUE7Z0JBQ0EsSUFBQSxFQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQTtZQUNBLE1BQUEsR0FBQSxLQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxpQkFBQSxTQUFBLFdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxzQkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBR0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLHVEQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsa0JBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsc0RBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQkFBQTtBQUFBLENBN0ZBLEFBNkZBLENBN0ZBLGFBQUEsR0E2RkE7QUFFQTtJQUFBLDBDQUFBO0lBQUE7UUFBQSxxRUFHQTtRQUZBLFdBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxhQUFBLEdBQUEsSUFBQSxDQUFBOztJQUNBLENBQUE7SUFBQSw2QkFBQTtBQUFBLENBSEEsQUFHQSxDQUhBLDBCQUFBLEdBR0E7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QVkxR0E7SUFBQSw4QkFBQTtJQUNBLG9CQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFPQSxzQkFBQSw0QkFBQTtRQUhBOztXQUVBO2FBQ0E7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTs7O09BQUE7SUFNQSxzQkFBQSxnQ0FBQTtRQUhBOztXQUVBO2FBQ0E7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBO1FBQ0EsQ0FBQTs7O09BQUE7SUFFQSxtQ0FBQSxHQUFBLFVBQUEsT0FBQTtRQUFBLHdCQUFBLEVBQUEsVUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUE7UUFDQSxNQUFBLENBQUEsMkJBQUEsR0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQ0FBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsSUFBQSxFQUFBLElBQUE7WUFDQSxJQUFBLElBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQSxJQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFVBQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLHNCQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsVUFBQTtnQkFDQSxJQUFBLElBQUEsa0JBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxHQUFBLGFBQUEsQ0FBQTtnQkFDQSxLQUFBLENBQUE7WUFDQSxLQUFBLFFBQUE7Z0JBQ0EsSUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQSxLQUFBO29CQUNBLEVBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO3dCQUNBLEdBQUEsSUFBQSxzQkFBQSxDQUFBO29CQUNBLENBQUE7b0JBQ0EsUUFBQSxJQUFBLGlCQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsR0FBQSxLQUFBLEdBQUEsV0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxnQkFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLEdBQUEsR0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBO2dCQUNBLEtBQUEsQ0FBQTtZQUNBLEtBQUEsT0FBQSxDQUFBO1lBQ0EsS0FBQSxVQUFBO2dCQUNBLElBQUEsSUFBQSxNQUFBLEdBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUEsS0FBQTtvQkFDQSxFQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTt3QkFDQSxHQUFBLElBQUEsb0JBQUEsQ0FBQTtvQkFDQSxDQUFBO29CQUNBLElBQUEsSUFBQSxlQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLEdBQUEsSUFBQSxHQUFBLFdBQUEsR0FBQSxHQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLElBQUEsT0FBQSxDQUFBO2dCQUNBLEtBQUEsQ0FBQTtZQUNBO2dCQUNBLElBQUEsSUFBQSxlQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsVUFBQSxHQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7Z0JBQ0EsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSwyQkFBQSxHQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxvQ0FBQSxHQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxpQkFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGlDQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUEsT0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtvQkFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7b0JBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7d0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtvQkFDQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO2dCQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtvQkFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7b0JBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7d0JBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtvQkFDQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7Z0JBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO29CQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtvQkFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUJBQUE7QUFBQSxDQTVLQSxBQTRLQSxDQTVLQSxTQUFBLEdBNEtBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FDOUtBO0lBQUEsOEJBQUE7SUFDQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsa0NBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLHVGQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsa0JBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsc0RBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsK0JBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQkFBQTtBQUFBLENBdENBLEFBc0NBLENBdENBLFNBQUEsR0FzQ0E7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7QUNuQ0E7SUFBQSwrQkFBQTtJQUVBLHFCQUNBLE1BQUEsRUFDQSxFQUFBO1FBRkEsWUFJQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLFNBQ0E7UUFFQSxZQUFBLEdBQUEsQ0FBQSxDQUFBOztJQUZBLENBQUE7SUFNQSxzQkFBQSw0QkFBQTthQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxHQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTs7O09BUkE7SUFVQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlDQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO1lBQ0EsR0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUVBLElBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSw0QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwwQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsdUZBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxpR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGtCQUFBO0FBQUEsQ0FsR0EsQUFrR0EsQ0FsR0EsYUFBQSxHQWtHQTtBQUVBO0lBQUE7UUFDQSxXQUFBLEdBQUEsVUFBQSxLQUFBO1lBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUE7UUFDQSxlQUFBLEdBQUEsVUFBQSxLQUFBO1lBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQUEsK0JBQUE7QUFBQSxDQVBBLEFBT0EsSUFBQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsRUFBQSxXQUFBLENBQUEsQ0FBQSIsImZpbGUiOiJqcXVlcnkuZGlhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYWJzdHJhY3QgY2xhc3MgRXZlIHtcclxuICAgIHB1YmxpYyBvcHRpb25zOiBhbnk7XHJcblxyXG4gICAgcHVibGljIG9uKGV2ZW50OiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IHRoaXMge1xyXG4gICAgICAgIHRoaXMub3B0aW9uc1snb24nICsgZXZlbnRdID0gY2FsbGJhY2s7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhhc0V2ZW50KGV2ZW50OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmhhc093blByb3BlcnR5KCdvbicgKyBldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRyaWdnZXIoZXZlbnQ6IHN0cmluZywgLi4uIGFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgbGV0IHJlYWxFdmVudCA9ICdvbicgKyBldmVudDtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzRXZlbnQoZXZlbnQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1tyZWFsRXZlbnRdLmNhbGwodGhpcywgLi4uYXJncyk7XHJcbiAgICB9XHJcbn0iLCJpbnRlcmZhY2UgRGlhbG9nQm94T3B0aW9uIGV4dGVuZHMgRGlhbG9nQ29udGVudE9wdGlvbiB7XHJcbiAgICBpY28/OiBzdHJpbmcsICAgICAgIC8vIOagh+mimOagj+eahOWbvuagh1xyXG4gICAgdGl0bGU/OiBzdHJpbmcsICAgICAvLyDmoIfpophcclxuICAgIGNhbk1vdmU/OiBib29sZWFuLCAgICAgICAgLy/mmK/lkKblhYHorrjnp7vliqhcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nQm94IGV4dGVuZHMgRGlhbG9nQ29udGVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ0JveE9wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7lhoXlrrlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guaHRtbCh0aGlzLmdldEhlYWRlckh0bWwoKSArIHRoaXMuZ2V0Q29udGVudEh0bWwoKSsgdGhpcy5nZXRGb290ZXJIdG1sKCkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICBsZXQgdGFyZ2V0ID0gdGhpcy5vcHRpb25zLnRhcmdldCB8fCBEaWFsb2cuJHdpbmRvdztcclxuICAgICAgICBsZXQgbWF4V2lkdGggPSB0YXJnZXQud2lkdGgoKTtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmJveC53aWR0aCgpO1xyXG4gICAgICAgIGxldCBtYXhIZWlnaHQgPSB0YXJnZXQuaGVpZ2h0KCk7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMuYm94LmhlaWdodCgpO1xyXG4gICAgICAgIGlmIChtYXhXaWR0aCA+IHdpZHRoICYmIG1heEhlaWdodCA+IGhlaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAobWF4V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgIHRvcDogKG1heEhlaWdodCAtIGhlaWdodCkgLyAyICsgJ3B4J1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub3B0aW9ucy50eXBlID0gRGlhbG9nVHlwZS5wYWdlO1xyXG4gICAgICAgIHRoaXMuYm94LmFkZENsYXNzKFwiZGlhbG9nLXBhZ2VcIik7XHJcbiAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIC8vIOeCueWHu+agh+mimOagj+enu+WKqFxyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGlzTW92ZSA9IGZhbHNlO1xyXG4gICAgICAgIGxldCB4LCB5O1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoXCIuZGlhbG9nLWhlYWRlciAuZGlhbG9nLXRpdGxlXCIpLm1vdXNlZG93bihmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGlzTW92ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHggPSBlLnBhZ2VYIC0gcGFyc2VJbnQoaW5zdGFuY2UuYm94LmNzcygnbGVmdCcpKTtcclxuICAgICAgICAgICAgeSA9IGUucGFnZVkgLSBwYXJzZUludChpbnN0YW5jZS5ib3guY3NzKCd0b3AnKSk7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmJveC5mYWRlVG8oMjAsIC41KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkKGRvY3VtZW50KS5tb3VzZW1vdmUoZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBpZiAoIWlzTW92ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmJveC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wOiBlLnBhZ2VZIC0geSxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGUucGFnZVggLSB4XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkubW91c2V1cChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaXNNb3ZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5ib3gpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLmJveC5mYWRlVG8oJ2Zhc3QnLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5ib3gpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLnJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLmJpbmRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN6K6+5bC65a+4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZXNpemUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXRQcm9wZXJ0eSgpO1xyXG4gICAgICAgIHRoaXMudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nQm94T3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgZ2V0SGVhZGVySHRtbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJkaWFsb2ctaGVhZGVyXCI+PGRpdiBjbGFzcz1cImRpYWxvZy10aXRsZVwiPic7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pY28pIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPGkgY2xhc3M9XCJmYSBmYS0nICsgdGhpcy5vcHRpb25zLmljbyArICdcIj48L2k+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50aXRsZSkge1xyXG4gICAgICAgICAgICBodG1sICs9IHRoaXMub3B0aW9ucy50aXRsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGh0bWwgKyAnPC9kaXY+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZSBkaWFsb2ctY2xvc2VcIj48L2k+PC9kaXY+JztcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nQm94T3B0aW9uIGV4dGVuZHMgRGVmYXVsdERpYWxvZ0NvbnRlbnRPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dCb3hPcHRpb24ge1xyXG4gICAgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonO1xyXG4gICAgY2FuTW92ZTogYm9vbGVhbiA9IHRydWU7XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5ib3gsIERpYWxvZ0JveCk7IiwiYWJzdHJhY3QgY2xhc3MgRGlhbG9nQ29yZSBleHRlbmRzIEJveCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBwdWJsaWMgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdE9wdGlvbigpLCBvcHRpb24pO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50eXBlID0gIERpYWxvZy5wYXJzZUVudW08RGlhbG9nVHlwZT4odGhpcy5vcHRpb25zLnR5cGUsIERpYWxvZ1R5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcHRpb25zOiBEaWFsb2dPcHRpb247XHJcblxyXG4gICAgcHJpdmF0ZSBfc3RhdHVzOiBEaWFsb2dTdGF0dXMgPSBEaWFsb2dTdGF0dXMuY2xvc2VkO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgc3RhdHVzKCk6IERpYWxvZ1N0YXR1cyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXR1cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHN0YXR1cyhhcmc6IERpYWxvZ1N0YXR1cykge1xyXG4gICAgICAgIGFyZyA9IERpYWxvZy5wYXJzZUVudW08RGlhbG9nU3RhdHVzPihhcmcsIERpYWxvZ1N0YXR1cyk7XHJcbiAgICAgICAgLy8g55u45ZCM54q25oCB5LiN5YGa5pON5L2cXHJcbiAgICAgICAgaWYgKHRoaXMuX3N0YXR1cyA9PSBhcmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKGFyZykge1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ1N0YXR1cy5zaG93OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Qm94KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dTdGF0dXMuaGlkZTpcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZUJveCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nU3RhdHVzLmNsb3Npbmc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NpbmdCb3goKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ1N0YXR1cy5jbG9zZWQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlQm94KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IFwic3RhdHVzIGVycm9yOlwiKyBhcmc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIF9kaWFsb2dCZzogSlF1ZXJ5OyAgLy8g6Ieq5bex55qE6IOM5pmv6YGu572pXHJcblxyXG4gICAgcHJpdmF0ZSBfeTogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICghdGhpcy5feSkge1xyXG4gICAgICAgICAgICB0aGlzLl95ID0gdGhpcy5ib3gub2Zmc2V0KCkudG9wIC0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5feTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHkoeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5feSA9IHk7XHJcbiAgICAgICAgdGhpcy5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICghdGhpcy5faGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlaWdodCA9IHRoaXMuYm94LmhlaWdodCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgaGVpZ2h0KGhlaWdodDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuYm94LmhlaWdodChoZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pS55Y+Y54q25oCBXHJcbiAgICAgKiBAcGFyYW0gc3RhdHVzIFxyXG4gICAgICogQHBhcmFtIGhhc0V2ZW50IFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY2hhbmdlU3RhdHVzKHN0YXR1czogRGlhbG9nU3RhdHVzLCBoYXNFdmVudDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKGhhc0V2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlum7mOiupOiuvue9rlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpOiBEaWFsb2dPcHRpb24ge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ09wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuW5tuaYvuekuuaOp+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2hvd0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdzaG93JykpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3Nob3cgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJveC5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLnNob3c7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rlubbpmpDol4/mjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGhpZGVCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJveCkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZhbHNlID09IHRoaXMudHJpZ2dlcignaGlkZScpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdoaWRlIHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ib3guaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IERpYWxvZ1N0YXR1cy5oaWRlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yqo55S75YWz6Zet77yM5pyJ5YWz6Zet5Yqo55S7XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjbG9zaW5nQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmNsb3NpbmcgXHJcbiAgICAgICAgfHwgdGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmNsb3NlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLnRyaWdnZXIoJ2Nsb3NpbmcnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2luZyBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IERpYWxvZ1N0YXR1cy5jbG9zaW5nO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ib3guYWRkQ2xhc3MoJ2RpYWxvZy1jbG9zaW5nJykub25lKCd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2luZykge1xyXG4gICAgICAgICAgICAgICAgLy8g6Ziy5q2i5Lit6YCU5pS55Y+Y5b2T5YmN54q25oCBXHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5jbG9zZUJveCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKDpmaTmjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNsb3NlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy50cmlnZ2VyKCdjbG9zZWQnKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2VkIHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLmNsb3NlZDtcclxuICAgICAgICBpZiAodGhpcy5fZGlhbG9nQmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGlhbG9nQmcucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cucmVtb3ZlSXRlbSh0aGlzLmlkKTsgXHJcbiAgICAgICAgdGhpcy5ib3gucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5ib3ggPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IGluaXQoKTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29yZSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveCA9ICQoJzxkaXYgY2xhc3M9XCJkaWFsb2cgZGlhbG9nLScrIERpYWxvZ1R5cGVbdGhpcy5vcHRpb25zLnR5cGVdICsnXCIgZGF0YS10eXBlPVwiZGlhbG9nXCIgZGlhbG9nLWlkPScrIHRoaXMuaWQgKyc+PC9kaXY+Jyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZUNvbnRlbnQoKTogdGhpcztcclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc2V0UHJvcGVydHkoKTogdGhpcztcclxuXHJcblxyXG4gICAgcHVibGljIGNzcyhrZXk6IGFueSwgdmFsdWU/OiBzdHJpbmd8IG51bWJlcik6IEpRdWVyeSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYm94LmNzcyhrZXksIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvdygpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IERpYWxvZ1N0YXR1cy5zaG93O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWRlKCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gRGlhbG9nU3RhdHVzLmhpZGU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsb3NlKCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gRGlhbG9nU3RhdHVzLmNsb3Npbmc7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRvZ2dsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmhpZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bnm7jlkIznsbvlnovlvLnlh7rmoYbnmoTmnIDkuIrpnaJcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldERpYWxvZ1RvcCgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCB5O1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgRGlhbG9nLm1hcChpdGVtID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucy50eXBlICE9IHRoaXMub3B0aW9ucy50eXBlIHx8IGl0ZW0uaWQgPT0gaW5zdGFuY2UuaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXkgfHwgaXRlbS55IDwgeSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IGl0ZW0ueTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldERpYWxvZ0JvdHRvbSgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCB5O1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgRGlhbG9nLm1hcChpdGVtID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucy50eXBlICE9IHRoaXMub3B0aW9ucy50eXBlIHx8IGl0ZW0uaWQgPT0gaW5zdGFuY2UuaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgYm90dG9tID0gaXRlbS55ICsgaXRlbS5oZWlnaHQ7XHJcbiAgICAgICAgICAgIGlmICgheSB8fCBib3R0b20gPiB5KSB7XHJcbiAgICAgICAgICAgICAgICB5ID0gYm90dG9tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBwcml2YXRlIF9nZXRCb3R0b20oKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLmhlaWdodCgpICogLjMzIC0gdGhpcy5oZWlnaHQgLyAyLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRUb3AoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLmhlaWdodCgpIC8gMiAtIHRoaXMuaGVpZ2h0IC8gMiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0TGVmdCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgkKHdpbmRvdykud2lkdGgoKSAvIDIgLSB0aGlzLmJveC53aWR0aCgpIC8gMiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UmlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLndpZHRoKCkgLyAyIC0gdGhpcy5ib3gud2lkdGgoKSAvIDIsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFdpZHRoKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gRGlhbG9nLiR3aW5kb3cud2lkdGgoKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndpZHRoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB3aWR0aCAqIHRoaXMub3B0aW9ucy53aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gRGlhbG9nLiR3aW5kb3cuaGVpZ2h0KCk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oZWlnaHQgPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoZWlnaHQgKiB0aGlzLm9wdGlvbnMuaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldExlZnRUb3AoZGlyZWN0aW9uOiBEaWFsb2dEaXJlY3Rpb24sIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBib3hXaWR0aDogbnVtYmVyLCBib3hIZWlnaHQ6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnRUb3A6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIDBdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi50b3A6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyhib3hIZWlnaHQgLSB3aWR0aCkgLyAyLCAwXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHRUb3A6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2JveEhlaWdodCAtIHdpZHRoLCAwXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2JveEhlaWdodCAtIHdpZHRoLCAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodEJvdHRvbTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbYm94SGVpZ2h0IC0gd2lkdGgsIGJveEhlaWdodCAtIGhlaWdodF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmJvdHRvbTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbKGJveEhlaWdodCAtIHdpZHRoKSAvIDIsIGJveEhlaWdodCAtIGhlaWdodF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnRCb3R0b206XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIGJveEhlaWdodCAtIGhlaWdodF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmNlbnRlcjpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbKGJveEhlaWdodCAtIHdpZHRoKSAvIDIsIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiY2xhc3MgRGVmYXVsdERpYWxvZ09wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ09wdGlvbiB7XHJcbiAgICB0aXRsZTogc3RyaW5nID0gJ+aPkOekuic7XHJcbiAgICB0eXBlPzogRGlhbG9nVHlwZSA9IERpYWxvZ1R5cGUudGlwO1xyXG4gICAgY2FuTW92ZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBvbmRvbmU6IEZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgRGlhbG9nIHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIG1ldGhvZHM6IHtbdHlwZTogbnVtYmVyXTogRnVuY3Rpb259ID0ge307XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2RhdGE6IHtbaWQ6IG51bWJlcl06IERpYWxvZ0NvcmV9ID0ge307XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2d1aWQ6IG51bWJlciA9IDA7IC8vIGlk5qCH6K6wXHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3RpcERhdGE6IEFycmF5PG51bWJlcj4gPSBbXTtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZGlhbG9nQmc6IEpRdWVyeTtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfYmdMb2NrOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgJHdpbmRvdyA9ICQod2luZG93KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+mAoOW8ueWHuuahhlxyXG4gICAgICogQHBhcmFtIG9wdGlvbiBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUob3B0aW9uPzogRGlhbG9nT3B0aW9uKTogRGlhbG9nQ29yZSB7XHJcbiAgICAgICAgaWYgKCFvcHRpb24udHlwZSkge1xyXG4gICAgICAgICAgICBvcHRpb24udHlwZSA9IERpYWxvZ1R5cGUudGlwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvcHRpb24udHlwZSA9IHRoaXMucGFyc2VFbnVtPERpYWxvZ1R5cGU+KG9wdGlvbi50eXBlLCBEaWFsb2dUeXBlKTtcclxuICAgICAgICBsZXQgbWV0aG9kID0gdGhpcy5nZXRNZXRob2Qob3B0aW9uLnR5cGUpO1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gbmV3IG1ldGhvZChvcHRpb24pO1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2VFbnVtPFQ+KHZhbDogYW55LCB0eXBlOiBhbnkpOiBUIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZVt2YWxdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5o+Q56S6XHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSB0aW1lIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHRpcChjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dUaXBPcHRpb24sIHRpbWU6IG51bWJlciA9IDIwMDApOiBEaWFsb2dDb3JlIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtjb250ZW50OiBjb250ZW50LCB0aW1lOiB0aW1lfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS50aXA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa2iOaBr1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGltZSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBtZXNzYWdlKGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ01lc3NhZ2VPcHRpb24sIHRpbWU6IG51bWJlciA9IDIwMDApOiBEaWFsb2dDb3JlIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtjb250ZW50OiBjb250ZW50LCB0aW1lOiB0aW1lfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS5tZXNzYWdlO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZShjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb1cclxuICAgICAqIEBwYXJhbSB0aW1lIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGxvYWRpbmcodGltZTogbnVtYmVyIHwgRGlhbG9nT3B0aW9uID0gMCk6IERpYWxvZ0NvcmUge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGltZSAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aW1lID0ge3RpbWU6IHRpbWV9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aW1lLnR5cGUgPSBEaWFsb2dUeXBlLmxvYWRpbmc7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKHRpbWUpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWGheWuueW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNvbnRlbnQoY29udGVudDogc3RyaW5nIHwgRGlhbG9nT3B0aW9uLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgICAgIGhhc05vOiBoYXNOb1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLmNvbnRlbnQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaZrumAmuW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGJveChjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dPcHRpb24sIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JywgaGFzWWVzPzogYm9vbGVhbiwgaGFzTm8/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICAgICAgaGFzWWVzOiBoYXNZZXMsXHJcbiAgICAgICAgICAgICAgICBoYXNObzogaGFzTm9cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS5ib3g7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOihqOagvOW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gZG9uZSBcclxuICAgICAqIEBwYXJhbSBoYXNZZXMgXHJcbiAgICAgKiBAcGFyYW0gaGFzTm8gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZnJvbShjb250ZW50OiBhbnksIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JywgZG9uZT86IEZ1bmN0aW9uLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUoe1xyXG4gICAgICAgICAgICB0eXBlOiBEaWFsb2dUeXBlLmJveCxcclxuICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgaGFzTm86IGhhc05vLFxyXG4gICAgICAgICAgICBvbmRvbmU6IGRvbmVcclxuICAgICAgICB9KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpobXpnaLlvLnnqpdcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBwYWdlKGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ09wdGlvbiwgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgICAgIGhhc05vOiBoYXNOb1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLnBhZ2U7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOahjOmdouaPkOmGklxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gaWNvbiBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBub3RpZnkodGl0bGU6IHN0cmluZyAgfCBEaWFsb2dPcHRpb24gPSAn6YCa55+lJywgY29udGVudDogc3RyaW5nID0gJycsIGljb246IHN0cmluZyA9ICcnKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aXRsZSAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aXRsZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICBpY286IGljb25cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGl0bGUudHlwZSA9IERpYWxvZ1R5cGUubm90aWZ5O1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZSh0aXRsZSkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhZGRJdGVtKGVsZW1lbnQ6IERpYWxvZ0NvcmUpIHtcclxuICAgICAgICB0aGlzLl9kYXRhWysrdGhpcy5fZ3VpZF0gPSBlbGVtZW50O1xyXG4gICAgICAgIGVsZW1lbnQuaWQgPSB0aGlzLl9ndWlkO1xyXG4gICAgICAgIGlmICh0aGlzLl9uZWVkQmcoZWxlbWVudC5vcHRpb25zLnR5cGUpIFxyXG4gICAgICAgICYmICFlbGVtZW50Lm9wdGlvbnMudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0JnKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzSXRlbShpZDogbnVtYmVyIHwgc3RyaW5nID0gdGhpcy5fZ3VpZCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGlkICsgJycpXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQoaWQ6IG51bWJlciB8IHN0cmluZyA9IHRoaXMuX2d1aWQpIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IFwiZXJyb3I6XCIgKyBpZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk5Yig6Zmk5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gaWQgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlSXRlbShpZDogbnVtYmVyID0gdGhpcy5fZ3VpZCkge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RhdGFbaWRdLmNsb3NlKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX25lZWRCZyh0aGlzLl9kYXRhW2lkXS5vcHRpb25zLnR5cGUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgdGhpcy5fZGF0YVtpZF07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKDpmaTmiYDmnInlvLnlh7rmoYZcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByZW1vdmUoKSB7XHJcbiAgICAgICAgdGhpcy5tYXAoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICBpdGVtLmNsb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKTmlq3mmK/lkKbpnIDopoHkvb/nlKjpga7nvalcclxuICAgICAqIEBwYXJhbSB0eXBlIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfbmVlZEJnKHR5cGU6IERpYWxvZ1R5cGUgfCBzdHJpbmcgfCBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdHlwZSAhPSBEaWFsb2dUeXBlLnRpcCBcclxuICAgICAgICAmJiB0eXBlICE9IERpYWxvZ1R5cGUubWVzc2FnZVxyXG4gICAgICAgICYmIHR5cGUgIT0gRGlhbG9nVHlwZS5wYWdlIFxyXG4gICAgICAgICYmIHR5cGUgIT0gRGlhbG9nVHlwZS5ub3RpZnlcclxuICAgICAgICAmJiB0eXBlICE9IERpYWxvZ1R5cGUucG9wO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5b6q546v5omA5pyJ5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbWFwKGNhbGxiYWNrOiAoaXRlbTogRGlhbG9nQ29yZSkgPT4gYW55KSB7XHJcbiAgICAgICAgZm9yKGxldCBpZCBpbiB0aGlzLl9kYXRhKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGNhbGxiYWNrKHRoaXMuX2RhdGFbaWRdKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S66YGu572pXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2hvd0JnKHRhcmdldDogSlF1ZXJ5ID0gJChkb2N1bWVudC5ib2R5KSwgaXNQdWJsaWM6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBpZiAoIXRoaXMuX2RpYWxvZ0JnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnID0gJCgnPGRpdiBjbGFzcz1cImRpYWxvZy1iZ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLl9kaWFsb2dCZy5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDmm7TmlLnpga7nvannmoTkvY3nva5cclxuICAgICAgICB0YXJnZXQuYXBwZW5kKHRoaXMuX2RpYWxvZ0JnKTtcclxuICAgICAgICB0aGlzLl9kaWFsb2dCZy50b2dnbGVDbGFzcygnZGlhbG9nLWJnLXByaXZhdGUnLCAhaXNQdWJsaWMpO1xyXG4gICAgICAgIHRoaXMuX2JnTG9jayArKztcclxuICAgICAgICB0aGlzLl9kaWFsb2dCZy5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpmpDol4/pga7nvalcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjbG9zZUJnKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fZGlhbG9nQmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9iZ0xvY2stLTtcclxuICAgICAgICBpZiAodGhpcy5fYmdMb2NrID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RpYWxvZ0JnLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGFkZE1ldGhvZCh0eXBlOiBEaWFsb2dUeXBlLCBkaWFsb2c6IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5tZXRob2RzW3R5cGVdID0gZGlhbG9nO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzTWV0aG9kKHR5cGU6IERpYWxvZ1R5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXRob2RzLmhhc093blByb3BlcnR5KHR5cGUudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRNZXRob2QodHlwZTogRGlhbG9nVHlwZSk6IEZ1bmN0aW9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXRob2RzW3R5cGVdO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIOW8ueWHuuahhuexu+Wei1xyXG4gKi9cclxuZW51bSBEaWFsb2dUeXBlIHtcclxuICAgIHRpcCxcclxuICAgIG1lc3NhZ2UsXHJcbiAgICBub3RpZnksXHJcbiAgICBwb3AsXHJcbiAgICBsb2FkaW5nLFxyXG4gICAgc2VsZWN0LFxyXG4gICAgaW1hZ2UsXHJcbiAgICBkaXNrLFxyXG4gICAgZm9ybSxcclxuICAgIGNvbnRlbnQsXHJcbiAgICBib3gsXHJcbiAgICBwYWdlXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlvLnlh7rmoYbkvY3nva5cclxuICovXHJcbmVudW0gRGlhbG9nRGlyZWN0aW9uIHtcclxuICAgIHRvcCxcclxuICAgIHJpZ2h0LFxyXG4gICAgYm90dG9tLFxyXG4gICAgbGVmdCxcclxuICAgIGNlbnRlcixcclxuICAgIGxlZnRUb3AsXHJcbiAgICByaWdodFRvcCxcclxuICAgIHJpZ2h0Qm90dG9tLFxyXG4gICAgbGVmdEJvdHRvbVxyXG59XHJcblxyXG4vKipcclxuICog5by55Ye65qGG54q25oCBXHJcbiAqL1xyXG5lbnVtIERpYWxvZ1N0YXR1cyB7XHJcbiAgICBoaWRlLFxyXG4gICAgc2hvdyxcclxuICAgIGNsb3NpbmcsICAgLy/lhbPpl63kuK1cclxuICAgIGNsb3NlZCAgICAvL+W3suWFs+mXrVxyXG59IiwiY2xhc3MgRGlhbG9nUGx1Z2luIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgcHVibGljIG9wdGlvbj86IERpYWxvZ09wdGlvblxyXG4gICAgKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2UuZGlhbG9nKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaWFsb2cgPSBEaWFsb2cuY3JlYXRlKGluc3RhbmNlLl9wYXJzZU9wdGlvbigkKHRoaXMpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5zdGFuY2UuZGlhbG9nLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGlhbG9nOiBEaWFsb2dDb3JlO1xyXG5cclxuICAgIHByaXZhdGUgX3BhcnNlT3B0aW9uKGVsZW1lbnQ6IEpRdWVyeSkge1xyXG4gICAgICAgIGxldCBvcHRpb246IERpYWxvZ09wdGlvbiA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbik7XHJcbiAgICAgICAgb3B0aW9uLnR5cGUgPSBEaWFsb2cucGFyc2VFbnVtPERpYWxvZ1R5cGU+KGVsZW1lbnQuYXR0cignZGlhbG9nLXR5cGUnKSB8fCB0aGlzLm9wdGlvbi50eXBlLCBEaWFsb2dUeXBlKTtcclxuICAgICAgICBvcHRpb24uY29udGVudCA9IGVsZW1lbnQuYXR0cignZGlhbG9nLWNvbnRlbnQnKSB8fCB0aGlzLm9wdGlvbi5jb250ZW50O1xyXG4gICAgICAgIG9wdGlvbi51cmwgPSBlbGVtZW50LmF0dHIoJ2RpYWxvZy11cmwnKSB8fCB0aGlzLm9wdGlvbi51cmw7XHJcbiAgICAgICAgb3B0aW9uLnRpbWUgPSBwYXJzZUludChlbGVtZW50LmF0dHIoJ2RpYWxvZy10aW1lJykpIHx8IHRoaXMub3B0aW9uLnRpbWU7XHJcbiAgICAgICAgaWYgKG9wdGlvbi50eXBlID09IERpYWxvZ1R5cGUucG9wICYmICFvcHRpb24udGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIG9wdGlvbi50YXJnZXQgPSBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3B0aW9uO1xyXG4gICAgfVxyXG59XHJcblxyXG47KGZ1bmN0aW9uKCQ6IGFueSkge1xyXG4gICAgJC5mbi5kaWFsb2cgPSBmdW5jdGlvbihvcHRpb24gPzogRGlhbG9nT3B0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2dQbHVnaW4odGhpcywgb3B0aW9uKTtcclxuICAgIH07XHJcbn0pKGpRdWVyeSk7IiwiaW50ZXJmYWNlIERpYWxvZ1RpcE9wdGlvbiBleHRlbmRzIERpYWxvZ09wdGlvbiB7XHJcbiAgICB0aW1lPzogbnVtYmVyLCAgICAgICAgIC8v5pi+56S65pe26Ze0XHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ1RpcCBleHRlbmRzIERpYWxvZ0NvcmUge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcHRpb25zOiBEaWFsb2dUaXBPcHRpb247XHJcblxyXG4gICAgcHJpdmF0ZSBfdGltZUhhbmRsZTogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBpbml0KCkge1xyXG4gICAgICAgIERpYWxvZy5hZGRJdGVtKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQ29yZSgpLmNyZWF0ZUNvbnRlbnQoKVxyXG4gICAgICAgIC5hcHBlbmRQYXJlbnQoKS5zZXRQcm9wZXJ0eSgpLmJpbmRFdmVudCgpXHJcbiAgICAgICAgLmFkZFRpbWUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dUaXBPcHRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruWGheWuuVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC50ZXh0KHRoaXMub3B0aW9ucy5jb250ZW50KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOWIsOWuueWZqOS4ilxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYXBwZW5kUGFyZW50KCk6IHRoaXMge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnRhcmdldCkge1xyXG4gICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0aGlzLmJveCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMudGFyZ2V0LmFwcGVuZCh0aGlzLmJveCk7XHJcbiAgICAgICAgdGhpcy5ib3guYWRkQ2xhc3MoXCJkaWFsb2ctcHJpdmF0ZVwiKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruWxnuaAp1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gRGlhbG9nLiR3aW5kb3cud2lkdGgoKTtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmJveC53aWR0aCgpO1xyXG4gICAgICAgIHRoaXMueSA9ICh0aGlzLmdldERpYWxvZ1RvcCgpIHx8IChEaWFsb2cuJHdpbmRvdy5oZWlnaHQoKSAqIDAuNjggKyAzMCkpIC0gMzAgLSB0aGlzLmhlaWdodDsgXHJcbiAgICAgICAgdGhpcy5jc3MoJ2xlZnQnLCAobWF4V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4Jyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnu5Hlrprkuovku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuYm94KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5yZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN6K6+5bC65a+4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZXNpemUoKSB7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gRGlhbG9nLiR3aW5kb3cud2lkdGgoKTtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmJveC53aWR0aCgpO1xyXG4gICAgICAgIHRoaXMuY3NzKCdsZWZ0JywgKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcpO1xyXG4gICAgICAgIHRoaXMudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFkZFRpbWUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50aW1lIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuX3RpbWVIYW5kbGUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5fdGltZUhhbmRsZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaW5zdGFuY2UuY2xvc2UoKTtcclxuICAgICAgICB9LCB0aGlzLm9wdGlvbnMudGltZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHN0b3BUaW1lKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fdGltZUhhbmRsZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lSGFuZGxlKTtcclxuICAgICAgICB0aGlzLl90aW1lSGFuZGxlID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zaW5nQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghc3VwZXIuY2xvc2luZ0JveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdG9wVGltZSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXN1cGVyLmNsb3NlQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNoYW5nZU90aGVyKCk7XHJcbiAgICAgICAgdGhpcy5zdG9wVGltZSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjaGFuZ2VPdGhlcigpIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIERpYWxvZy5tYXAoaXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLm9wdGlvbnMudHlwZSAhPSBEaWFsb2dUeXBlLnRpcCB8fCBpdGVtLnkgPj0gaW5zdGFuY2UueSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGl0ZW0ueSArPSBpbnN0YW5jZS5oZWlnaHQgKyAzMDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ1RpcE9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ1RpcE9wdGlvbiB7XHJcbiAgICB0aW1lOiBudW1iZXIgPSAyMDAwO1xyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUudGlwLCBEaWFsb2dUaXApOyIsImludGVyZmFjZSBEaWFsb2dNZXNzYWdlT3B0aW9uIGV4dGVuZHMgRGlhbG9nVGlwT3B0aW9uIHtcclxuXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ01lc3NhZ2UgZXh0ZW5kcyBEaWFsb2dUaXAge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmhlaWdodDtcclxuICAgICAgICB0aGlzLnkgPSAodGhpcy5nZXREaWFsb2dCb3R0b20oKSB8fCAoRGlhbG9nLiR3aW5kb3cuaGVpZ2h0KCkgKiAwLjEgLSAzMCkpICsgMzA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2hhbmdlT3RoZXIoKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBEaWFsb2cubWFwKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5vcHRpb25zLnR5cGUgIT0gRGlhbG9nVHlwZS5tZXNzYWdlIHx8IGl0ZW0ueSA8PSBpbnN0YW5jZS55KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaXRlbS55IC09IGluc3RhbmNlLmhlaWdodCArIDMwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUubWVzc2FnZSwgRGlhbG9nTWVzc2FnZSk7IiwiaW50ZXJmYWNlIERpYWxvZ05vdGlmeU9wdGlvbiBleHRlbmRzIERpYWxvZ1RpcE9wdGlvbiB7XHJcbiAgICB0aXRsZT86IHN0cmluZyxcclxuICAgIGljbz86IHN0cmluZ1xyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dOb3RpZnkgZXh0ZW5kcyBEaWFsb2dUaXAge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nTm90aWZ5T3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3B0aW9uczogRGlhbG9nTm90aWZ5T3B0aW9uO1xyXG5cclxuICAgIHB1YmxpYyBub3RpZnk6IE5vdGlmaWNhdGlvbjsgLy8g57O757uf6YCa55+lXHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bpu5jorqTorr7nva5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nTm90aWZ5T3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNob3dCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMubm90aWZ5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLmFkZEl0ZW0odGhpcyk7XHJcbiAgICAgICAgdGhpcy5fY3JlYXRlTm90aWZ5KCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGhpZGVCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvc2VCb3goKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2luZ0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbG9zZUJveCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmNsb3NpbmcgXHJcbiAgICAgICAgfHwgdGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmNsb3NlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLnRyaWdnZXIoJ2Nsb3NlZCcpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbG9zZWQgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jbG9zZU5vdGlmeSgpO1xyXG4gICAgICAgIERpYWxvZy5yZW1vdmVJdGVtKHRoaXMuaWQpOyBcclxuICAgICAgICB0aGlzLmNoYW5nZVN0YXR1cyhEaWFsb2dTdGF0dXMuY2xvc2VkKTtcclxuICAgICAgICB0aGlzLnN0b3BUaW1lKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlTm90aWZ5KCkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgaWYgKFwiTm90aWZpY2F0aW9uXCIgaW4gd2luZG93KSB7XHJcbiAgICAgICAgICAgIGxldCBhc2sgPSBOb3RpZmljYXRpb24ucmVxdWVzdFBlcm1pc3Npb24oKTtcclxuICAgICAgICAgICAgYXNrLnRoZW4ocGVybWlzc2lvbiA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVybWlzc2lvbiAhPT0gXCJncmFudGVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5oKo55qE5rWP6KeI5Zmo5pSv5oyB5L2G5pyq5byA5ZCv5qGM6Z2i5o+Q6YaS77yBJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLm5vdGlmeSA9IG5ldyBOb3RpZmljYXRpb24oaW5zdGFuY2Uub3B0aW9ucy50aXRsZSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IGluc3RhbmNlLm9wdGlvbnMuY29udGVudCxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiBpbnN0YW5jZS5vcHRpb25zLmljbyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2Uubm90aWZ5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBldmVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UudHJpZ2dlcignZG9uZScpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCfmgqjnmoTmtY/op4jlmajkuI3mlK/mjIHmoYzpnaLmj5DphpLvvIEnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jbG9zZU5vdGlmeSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubm90aWZ5KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ub3RpZnkuY2xvc2UoKTtcclxuICAgICAgICB0aGlzLm5vdGlmeSA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dOb3RpZnlPcHRpb24gZXh0ZW5kcyBEZWZhdWx0RGlhbG9nVGlwT3B0aW9uIGltcGxlbWVudHMgRGlhbG9nTm90aWZ5T3B0aW9uIHtcclxuICAgIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JztcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLm5vdGlmeSwgRGlhbG9nTm90aWZ5KTsiLCJpbnRlcmZhY2UgRGlhbG9nUG9wT3B0aW9uIGV4dGVuZHMgRGlhbG9nVGlwT3B0aW9uIHtcclxuICAgIGRpcmVjdGlvbj86IERpYWxvZ0RpcmVjdGlvbiB8IHN0cmluZyB8IG51bWJlcixcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nUG9wIGV4dGVuZHMgRGlhbG9nVGlwIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nUG9wT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID0gRGlhbG9nLnBhcnNlRW51bTxEaWFsb2dEaXJlY3Rpb24+KHRoaXMub3B0aW9ucy5kaXJlY3Rpb24sIERpYWxvZ0RpcmVjdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5fc2V0UG9wUHJvcGVydHkoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOWIsOWuueWZqOS4ilxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYXBwZW5kUGFyZW50KCk6IHRoaXMge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHRoaXMuYm94KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFJhbmRvbURpcmVjdGlvbigpOiBEaWFsb2dEaXJlY3Rpb24ge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogOCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NldFBvcFByb3BlcnR5KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID0gdGhpcy5fZ2V0UmFuZG9tRGlyZWN0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94LmFkZENsYXNzKCdkaWFsb2ctcG9wLScgKyBEaWFsb2dEaXJlY3Rpb25bdGhpcy5vcHRpb25zLmRpcmVjdGlvbl0pO1xyXG4gICAgICAgIGxldCBvZmZlc3QgPSB0aGlzLm9wdGlvbnMudGFyZ2V0Lm9mZnNldCgpO1xyXG4gICAgICAgIGxldCBbeCwgeV0gPSB0aGlzLl9nZXRQb3BMZWZ0VG9wKERpYWxvZy5wYXJzZUVudW08RGlhbG9nRGlyZWN0aW9uPih0aGlzLm9wdGlvbnMuZGlyZWN0aW9uLCBEaWFsb2dDb3JlKSwgdGhpcy5ib3gub3V0ZXJXaWR0aCgpLCB0aGlzLmJveC5vdXRlckhlaWdodCgpLCBvZmZlc3QubGVmdCwgb2ZmZXN0LnRvcCwgdGhpcy5vcHRpb25zLnRhcmdldC5vdXRlcldpZHRoKCksIHRoaXMub3B0aW9ucy50YXJnZXQub3V0ZXJIZWlnaHQoKSk7XHJcbiAgICAgICAgdGhpcy5ib3guY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogeCArICdweCcsXHJcbiAgICAgICAgICAgIHRvcDogeSArICdweCdcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRQb3BMZWZ0VG9wKGRpcmVjdGlvbjogRGlhbG9nRGlyZWN0aW9uLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIGJveFdpZHRoOiBudW1iZXIsIGJveEhlaWdodDogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgbGV0IHNwYWNlID0gMzA7IC8vIOepuumamVxyXG4gICAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0VG9wOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbeCArIGJveFdpZHRoICsgc3BhY2UsIHkgKyAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodEJvdHRvbTpcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24uYm90dG9tOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt4ICsgKGJveFdpZHRoIC0gd2lkdGgpIC8gMiwgIHkgKyBib3hIZWlnaHQgKyBzcGFjZV07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnRCb3R0b206XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ggLSB3aWR0aCAtIHNwYWNlLCB5ICsgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24uY2VudGVyOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0VG9wOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi50b3A6XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ggKyAoYm94V2lkdGggLSB3aWR0aCkgLyAyLCB5IC0gaGVpZ2h0IC0gc3BhY2VdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLnBvcCwgRGlhbG9nUG9wKTsiLCJpbnRlcmZhY2UgRGlhbG9nTG9hZGluZ09wdGlvbiBleHRlbmRzIERpYWxvZ1RpcE9wdGlvbiB7XHJcbiAgICBjb3VudD86IG51bWJlcjtcclxuICAgIGV4dHJhPzogc3RyaW5nXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ0xvYWRpbmcgZXh0ZW5kcyBEaWFsb2dUaXAge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dMb2FkaW5nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dMb2FkaW5nT3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guaHRtbCh0aGlzLl9nZXRMb2FkaW5nKCkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLm9wdGlvbnMudGFyZ2V0IHx8IERpYWxvZy4kd2luZG93O1xyXG4gICAgICAgIGxldCBtYXhXaWR0aCA9IHRhcmdldC53aWR0aCgpO1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuYm94LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IG1heEhlaWdodCA9IHRhcmdldC5oZWlnaHQoKTtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5ib3guaGVpZ2h0KCk7XHJcbiAgICAgICAgdGhpcy5jc3Moe1xyXG4gICAgICAgICAgICBsZWZ0OiAobWF4V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4JyxcclxuICAgICAgICAgICAgdG9wOiAobWF4SGVpZ2h0IC0gaGVpZ2h0KSAvIDIgKyAncHgnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0TG9hZGluZygpIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgIGxldCBudW0gPSB0aGlzLm9wdGlvbnMuY291bnQ7XHJcbiAgICAgICAgZm9yKDsgbnVtID4gMDsgbnVtIC0tKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxzcGFuPjwvc3Bhbj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCInKyB0aGlzLm9wdGlvbnMuZXh0cmEgKydcIj4nKyBodG1sICsnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2hvd0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXN1cGVyLnNob3dCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnRhcmdldCkge1xyXG4gICAgICAgICAgICBEaWFsb2cuc2hvd0JnKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuc2hvd0JnKHRoaXMub3B0aW9ucy50YXJnZXQsIGZhbHNlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaGlkZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXN1cGVyLmhpZGVCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NpbmdCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zaW5nQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zZUJveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0YXR1cyAhPSBEaWFsb2dTdGF0dXMuY2xvc2luZykge1xyXG4gICAgICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nTG9hZGluZ09wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ0xvYWRpbmdPcHRpb24ge1xyXG4gICAgZXh0cmE6IHN0cmluZyA9ICdsb2FkaW5nJzsgICAgICAvL+mineWklueahGNsYXNzXHJcbiAgICBjb3VudDogbnVtYmVyID0gNTtcclxuICAgIHRpbWU6IG51bWJlciA9IDA7XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5sb2FkaW5nLCBEaWFsb2dMb2FkaW5nKTtcclxuXHJcbiIsImludGVyZmFjZSBEaWFsb2dCdXR0b24ge1xyXG4gICAgY29udGVudDogc3RyaW5nLFxyXG4gICAgdGFnPzogc3RyaW5nXHJcbn1cclxuXHJcbmludGVyZmFjZSBEaWFsb2dDb250ZW50T3B0aW9uIGV4dGVuZHMgRGlhbG9nT3B0aW9uIHtcclxuICAgIHVybD86IHN0cmluZywgICAgICAgLy8gYWpheOivt+axglxyXG4gICAgYnV0dG9uPzogc3RyaW5nIHwgc3RyaW5nW118IERpYWxvZ0J1dHRvbltdLFxyXG4gICAgaGFzWWVzPzogYm9vbGVhbiB8IHN0cmluZzsgLy8g5piv5ZCm5pyJ56Gu5a6a5oyJ6ZKuXHJcbiAgICBoYXNObz86IGJvb2xlYW4gfCBzdHJpbmc7ICAvLyDmmK/lkKbmnInlj5bmtojmjInpkq5cclxuICAgIG9uZG9uZT86IEZ1bmN0aW9uICAgICAgICAvL+eCueehruWumuaXtuinpuWPkVxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dDb250ZW50IGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dDb250ZW50T3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5jb250ZW50ICYmIHRoaXMub3B0aW9ucy51cmwpIHtcclxuICAgICAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAkLmdldCh0aGlzLm9wdGlvbnMudXJsLCBmdW5jdGlvbihodG1sKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5vcHRpb25zLmNvbnRlbnQgPSBodG1sO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLmluaXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2lzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlOyAvL+WKoOi9veS4rSDmmL7npLrml7blgJnlh7rnjrDliqDovb3liqjnlLtcclxuXHJcbiAgICBwcml2YXRlIF9sb2FkaW5nRGlhbG9nOiBEaWFsb2dDb3JlO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNMb2FkaW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0xvYWRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBpc0xvYWRpbmcoYXJnOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gYXJnO1xyXG4gICAgICAgIHRoaXMuX3RvZ2dsZUxvYWRpbmcoKTtcclxuICAgICAgICAvLyDliqDovb3lrozmiJDml7bmmL7npLrlhYPntKBcclxuICAgICAgICBpZiAoIXRoaXMuX2lzTG9hZGluZyAmJiB0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuc2hvdykge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dCb3goKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrliqDovb3liqjnlLtcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfdG9nZ2xlTG9hZGluZyhhcmc6IERpYWxvZ1N0YXR1cyA9IHRoaXMuc3RhdHVzKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzTG9hZGluZyB8fCBhcmcgIT0gRGlhbG9nU3RhdHVzLnNob3cpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdEaWFsb2cpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdEaWFsb2cuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdEaWFsb2cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fbG9hZGluZ0RpYWxvZykge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nRGlhbG9nLnNob3coKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sb2FkaW5nRGlhbG9nID0gRGlhbG9nLmxvYWRpbmcoKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoKSB7XHJcbiAgICAgICAgRGlhbG9nLmFkZEl0ZW0odGhpcyk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVDb3JlKCkuY3JlYXRlQ29udGVudCgpXHJcbiAgICAgICAgLmFwcGVuZFBhcmVudCgpLnNldFByb3BlcnR5KCkuYmluZEV2ZW50KCk7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5zaG93KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0JveCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dDb250ZW50T3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7lhoXlrrlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guaHRtbCh0aGlzLmdldENvbnRlbnRIdG1sKCkrIHRoaXMuZ2V0Rm9vdGVySHRtbCgpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOWIsOWuueWZqOS4ilxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYXBwZW5kUGFyZW50KCk6IHRoaXMge1xyXG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHRoaXMuYm94KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruWxnuaAp1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnu5Hlrprkuovku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy15ZXNcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignZG9uZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2ctY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0Q29udGVudEh0bWwoY29udGVudDogc3RyaW5nID0gdGhpcy5vcHRpb25zLmNvbnRlbnQpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImRpYWxvZy1ib2R5XCI+JysgY29udGVudCArJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldEZvb3Rlckh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5oYXNZZXMgJiYgIXRoaXMub3B0aW9ucy5oYXNObyAmJiAodHlwZW9mIHRoaXMub3B0aW9ucy5idXR0b24gPT0gJ29iamVjdCcgJiYgdGhpcy5vcHRpb25zLmJ1dHRvbiBpbnN0YW5jZW9mIEFycmF5ICYmIHRoaXMub3B0aW9ucy5idXR0b24ubGVuZ3RoID09IDApKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImRpYWxvZy1mb290ZXJcIj4nO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGFzWWVzKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJkaWFsb2cteWVzXCI+JysgKHR5cGVvZiB0aGlzLm9wdGlvbnMuaGFzWWVzID09ICdzdHJpbmcnID8gdGhpcy5vcHRpb25zLmhhc1llcyA6ICfnoa7orqQnKSArJzwvYnV0dG9uPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGFzTm8pIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cImRpYWxvZy1jbG9zZVwiPicrICh0eXBlb2YgdGhpcy5vcHRpb25zLmhhc05vID09ICdzdHJpbmcnID8gdGhpcy5vcHRpb25zLmhhc05vIDogJ+WPlua2iCcpICsnPC9idXR0b24+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuYnV0dG9uID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5idXR0b24gPSBbdGhpcy5vcHRpb25zLmJ1dHRvbl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQuZWFjaCh0aGlzLm9wdGlvbnMuYnV0dG9uLCAoaSwgaXRlbSk9PiB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGJ1dHRvblwiPicraXRlbSsnPC9idXR0b24+JztcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiJytpdGVtLnRhZysnXCI+JytpdGVtLmNvbnRlbnQrJzwvYnV0dG9uPic7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGh0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQ2xpY2sodGFnOiBzdHJpbmcsIGNhbGxiYWNrOiAoZWxlbWVudDogSlF1ZXJ5KSA9PiBhbnkpIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYm94Lm9uKCdjbGljaycsIHRhZywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKGluc3RhbmNlLCAkKHRoaXMpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2hvd0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGlhbG9nU3RhdHVzLnNob3cpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc3VwZXIuc2hvd0JveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLnNob3dCZyh0aGlzLm9wdGlvbnMudGFyZ2V0KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaGlkZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGlhbG9nU3RhdHVzLmhpZGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc3VwZXIuaGlkZUJveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2luZ0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGlhbG9nU3RhdHVzLmhpZGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc3VwZXIuY2xvc2luZ0JveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2VCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlU3RhdHVzKERpYWxvZ1N0YXR1cy5oaWRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zZUJveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0YXR1cyAhPSBEaWFsb2dTdGF0dXMuY2xvc2luZykge1xyXG4gICAgICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nQ29udGVudE9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ0NvbnRlbnRPcHRpb24ge1xyXG4gICAgaGFzWWVzOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIGhhc05vOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHRpbWU6IG51bWJlciA9IDA7XHJcbiAgICBidXR0b246IHN0cmluZ1tdID0gW107XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5jb250ZW50LCBEaWFsb2dDb250ZW50KTsiLCJjbGFzcyBEaWFsb2dGb3JtIGV4dGVuZHMgRGlhbG9nQm94IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9kYXRhOiB7W25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOihqOWNleaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGRhdGEoKToge1tuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0ge1xyXG4gICAgICAgIGlmICghdGhpcy5fZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZ2V0Rm9ybURhdGEoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZWxlbWVudHM6IHtbbmFtZTogc3RyaW5nXTogSlF1ZXJ5fTtcclxuICAgIC8qKlxyXG4gICAgICog6KGo5Y2V5o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZWxlbWVudHMoKToge1tuYW1lOiBzdHJpbmddOiBKUXVlcnl9IHtcclxuICAgICAgICBpZiAoIXRoaXMuX2VsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzID0gdGhpcy5fZ2V0Rm9ybUVsZW1lbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRDb250ZW50SHRtbChjb250ZW50OiBzdHJpbmcgPSB0aGlzLm9wdGlvbnMuY29udGVudCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWJvZHlcIj4nKyB0aGlzLl9jcmVhdGVGb3JtKGNvbnRlbnQpICsnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVGb3JtKGRhdGE6IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKG5hbWU6IHN0cmluZywgaXRlbTogYW55KSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gaW5zdGFuY2UuX2NyZWF0ZUlucHV0KG5hbWUsIGl0ZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBodG1sO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZUlucHV0KG5hbWU6IHN0cmluZywgZGF0YTogYW55KTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodHlwZW9mIGRhdGEgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgZGF0YSA9IHtsYWJlbDogZGF0YX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGF0YS50eXBlKSB7XHJcbiAgICAgICAgICAgIGRhdGEudHlwZSA9ICFkYXRhLml0ZW0gPyAndGV4dCcgOiAnc2VsZWN0JztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGF0dHIgPSAnJztcclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgIGxldCBkZWZhdWx0VmFsID0gJyc7XHJcbiAgICAgICAgaWYgKGRhdGEuZGVmYXVsdCkge1xyXG4gICAgICAgICAgICBkZWZhdWx0VmFsID0gZGF0YS5kZWZhdWx0VmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5sYWJlbCkge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8bGFiZWw+JytkYXRhLmxhYmVsKyc8L2xhYmVsPic7IFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5pZCkge1xyXG4gICAgICAgICAgICBhdHRyICs9ICcgaWQ9XCInK2RhdGEuaWQrJ1wiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEuY2xhc3MpIHtcclxuICAgICAgICAgICAgYXR0ciArPSAnIGNsYXNzPVwiJytkYXRhLmNsYXNzKydcIic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLnJlcXVpcmVkKSB7XHJcbiAgICAgICAgICAgIGF0dHIgKz0gJyByZXF1aXJlZD1cInJlcXVpcmVkXCInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5wbGFjZWhvbGRlcikge1xyXG4gICAgICAgICAgICBhdHRyICs9ICcgcGxhY2Vob2xkZXI9XCInK2RhdGEucGxhY2Vob2xkZXIrJ1wiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoIChkYXRhLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSAndGV4dGFyZWEnOlxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPHRleHRhcmVhIG5hbWU9XCInK25hbWUrJ1wiICcrYXR0cisnPicrZGVmYXVsdFZhbCsnPC90ZXh0YXJlYT4nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XHJcbiAgICAgICAgICAgICAgICBsZXQgb3B0aW9uID0gJyc7XHJcbiAgICAgICAgICAgICAgICAkLmVhY2goZGF0YS5pdGVtLCBmdW5jdGlvbih2YWwsIGxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbCA9PSBkZWZhdWx0VmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCArPSAnXCIgc2VsZWN0ZWQ9XCJzZWxlY3RlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbiArPSAnPG9wdGlvbiB2YWx1ZT1cIicrdmFsKydcIj4nK2xhYmVsKyc8L29wdGlvbj4nO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8c2VsZWN0IG5hbWU9XCInK25hbWUrJ1wiICcrYXR0cisnPicrb3B0aW9uKyc8c2VsZWN0Pic7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAncmFkaW8nOlxyXG4gICAgICAgICAgICBjYXNlICdjaGVja2JveCc6XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2JythdHRyKyc+J1xyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGRhdGEuaXRlbSwgZnVuY3Rpb24odmFsLCBsYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwgPT0gZGVmYXVsdFZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgKz0gJ1wiIGNoZWNrZWQ9XCJjaGVja2VkJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCInK2RhdGEudHlwZSsnXCIgbmFtZT1cIicrbmFtZSsnXCIgdmFsdWU9XCInK3ZhbCsnXCI+JyArIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2Pic7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwiJytkYXRhLnR5cGUrJ1wiIG5hbWU9XCInK25hbWUrJ1wiICcrYXR0cisnIHZhbHVlPVwiJytkZWZhdWx0VmFsKydcIj4nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+JytodG1sKyc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6KGo5Y2V5o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2dldEZvcm1FbGVtZW50KCk6e1tuYW1lOnN0cmluZ106IEpRdWVyeX0ge1xyXG4gICAgICAgIGxldCBlbGVtZW50cyA9IHt9O1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZCgnaW5wdXQsc2VsZWN0LHRleHRhcmVhLGJ1dHRvbicpLmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICBsZXQgbmFtZSA9IGl0ZW0uYXR0cignbmFtZScpO1xyXG4gICAgICAgICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWl0ZW0uaXMoJ1t0eXBlPXJpZGlvXScpICYmICFpdGVtLmlzKCdbdHlwZT1jaGVja2JveF0nKSAmJiBuYW1lLmluZGV4T2YoJ1tdJykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50c1tuYW1lXSA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFlbGVtZW50cy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudHNbbmFtZV0gPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnRzW25hbWVdLnB1c2goZWxlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZWxlbWVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5booajljZXmlbDmja5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0Rm9ybURhdGEoKToge1tuYW1lOiBzdHJpbmddOiBhbnl9IHtcclxuICAgICAgICBsZXQgZm9ybURhdGEgPSB7fTtcclxuICAgICAgICAkLmVhY2godGhpcy5lbGVtZW50cywgZnVuY3Rpb24obmFtZTogc3RyaW5nLCBlbGVtZW50OiBKUXVlcnkpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXMoJ1t0eXBlPXJpZGlvXScpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uYXR0cignY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhW25hbWVdID0gaXRlbS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pcygnW3R5cGU9Y2hlY2tib3hdJykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uYXR0cignY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGl0ZW0udmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGFbbmFtZV0gPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuYW1lLmluZGV4T2YoJ1tdJykgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChpdGVtLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGFbbmFtZV0gPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvcm1EYXRhW25hbWVdID0gZWxlbWVudC52YWwoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZm9ybURhdGE7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLmZvcm0sIERpYWxvZ0Zvcm0pOyIsImNsYXNzIERpYWxvZ1BhZ2UgZXh0ZW5kcyBEaWFsb2dCb3gge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRIZWFkZXJIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImRpYWxvZy1oZWFkZXJcIj48aSBjbGFzcz1cImZhIGZhLWFycm93LWxlZnRcIj48L2k+PGRpdiBjbGFzcz1cImRpYWxvZy10aXRsZVwiPic7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pY28pIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPGkgY2xhc3M9XCJmYSBmYS0nICsgdGhpcy5vcHRpb25zLmljbyArICdcIj48L2k+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50aXRsZSkge1xyXG4gICAgICAgICAgICBodG1sICs9IHRoaXMub3B0aW9ucy50aXRsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGh0bWwgKyAnPC9kaXY+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZSBkaWFsb2ctY2xvc2VcIj48L2k+PC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOe7keWumuS6i+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94LmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLWhlYWRlciAuZmEtYXJyb3ctbGVmdFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2cteWVzXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2RvbmUnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLWNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLnBhZ2UsIERpYWxvZ1BhZ2UpOyIsImludGVyZmFjZSBEaWFsb2dJbWFnZU9wdGlvbiBleHRlbmRzIERpYWxvZ09wdGlvbiB7XHJcbiAgICBvbm5leHQ/OiAoaW5kZXg6IG51bWJlcikgPT4gc3RyaW5nLFxyXG4gICAgb25wcmV2aW91cz86IChpbmRleDogbnVtYmVyKSA9PiBzdHJpbmdcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nSW1hZ2UgZXh0ZW5kcyBEaWFsb2dDb250ZW50IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5kZXg6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHJpdmF0ZSBfc3JjOiBzdHJpbmc7XHJcblxyXG4gICAgcHVibGljIGdldCBzcmMoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgc3JjKGltZzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFpbWcpIHtcclxuICAgICAgICAgICAgaW1nID0gdGhpcy5vcHRpb25zLmNvbnRlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3NyYyA9IGltZztcclxuICAgICAgICB0aGlzLmJveC5maW5kKCcuZGlhbG9nLWJvZHkgaW1nJykuYXR0cignc3JjJywgaW1nKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5odG1sKHRoaXMuZ2V0Q29udGVudEh0bWwoKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLm9wdGlvbnMudGFyZ2V0IHx8IERpYWxvZy4kd2luZG93O1xyXG4gICAgICAgIGxldCBtYXhXaWR0aCA9IHRhcmdldC53aWR0aCgpO1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuYm94LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IG1heEhlaWdodCA9IHRhcmdldC5oZWlnaHQoKTtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5ib3guaGVpZ2h0KCk7XHJcbiAgICAgICAgdGhpcy5jc3Moe1xyXG4gICAgICAgICAgICBsZWZ0OiAobWF4V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4JyxcclxuICAgICAgICAgICAgdG9wOiAobWF4SGVpZ2h0IC0gaGVpZ2h0KSAvIDIgKyAncHgnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnu5Hlrprkuovku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2ctY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLXByZXZpb3VzXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy1uZXh0XCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5ib3gpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLnJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZCgnLmRpYWxvZy1ib2R5IGltZycpLmJpbmQoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuYm94KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5yZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN6K6+5bC65a+4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZXNpemUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXRQcm9wZXJ0eSgpO1xyXG4gICAgICAgIHRoaXMudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHByZXZpb3VzKCkge1xyXG4gICAgICAgIHRoaXMuc3JjID0gdGhpcy50cmlnZ2VyKCdwcmV2aW91cycsIC0tIHRoaXMuX2luZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmV4dCgpIHtcclxuICAgICAgICB0aGlzLnNyYyA9IHRoaXMudHJpZ2dlcignbmV4dCcsICsrIHRoaXMuX2luZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0Q29udGVudEh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5jb250ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jb250ZW50ID0gdGhpcy50cmlnZ2VyKCduZXh0JywgKysgdGhpcy5faW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJzxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1sZWZ0IGRpYWxvZy1wcmV2aW91c1wiPjwvaT48ZGl2IGNsYXNzPVwiZGlhbG9nLWJvZHlcIj48aW1nIHNyYz1cIicrIHRoaXMub3B0aW9ucy5jb250ZW50ICsnXCI+PC9kaXY+PGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLXJpZ2h0IGRpYWxvZy1uZXh0XCI+PC9pPjxpIGNsYXNzPVwiZmEgZmEtY2xvc2UgZGlhbG9nLWNsb3NlXCI+PC9pPic7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dJbWFnZU9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ0ltYWdlT3B0aW9uIHtcclxuICAgIG9ubmV4dDogKGluZGV4OiBudW1iZXIpID0+IHN0cmluZyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuICQoZG9jdW1lbnQuYm9keSkuZmluZCgnaW1nJykuZXEoaW5kZXgpLmF0dHIoJ3NyYycpO1xyXG4gICAgfTtcclxuICAgIG9ucHJldmlvdXM6IChpbmRleDogbnVtYmVyKSA9PiBzdHJpbmcgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgIHJldHVybiAkKGRvY3VtZW50LmJvZHkpLmZpbmQoJ2ltZycpLmVxKGluZGV4KS5hdHRyKCdzcmMnKTtcclxuICAgIH07XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5pbWFnZSwgRGlhbG9nSW1hZ2UpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
