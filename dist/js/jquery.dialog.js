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
                    this._show();
                    break;
                case DialogStatus.hide:
                    this._hide();
                    break;
                case DialogStatus.closing:
                    this._animationClose();
                    break;
                case DialogStatus.closed:
                    this._close();
                    break;
                default:
                    throw "status error:" + arg;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 获取默认设置
     */
    DialogCore.prototype.getDefaultOption = function () {
        return new DefaultDialogOption();
    };
    /**
     * 创建并显示控件
     */
    DialogCore.prototype._show = function () {
        if (!this.box) {
            this.init();
        }
        if (false == this.trigger('show')) {
            console.log('show stop!');
            return;
        }
        this.box.show();
        this._status = DialogStatus.show;
    };
    /**
     * 创建并隐藏控件
     */
    DialogCore.prototype._hide = function () {
        if (!this.box) {
            this.init();
        }
        if (false == this.trigger('hide')) {
            console.log('hide stop!');
            return;
        }
        this.box.hide();
        this._status = DialogStatus.hide;
    };
    /**
     * 动画关闭，有关闭动画
     */
    DialogCore.prototype._animationClose = function () {
        if (!this.box) {
            return;
        }
        if (this.status == DialogStatus.closing
            || this.status == DialogStatus.closed) {
            return;
        }
        if (this._timeHandle) {
            clearTimeout(this._timeHandle);
            this._timeHandle = undefined;
        }
        if (false == this.trigger('closing')) {
            console.log('closing stop!');
            return;
        }
        this._status = DialogStatus.closing;
        var instance = this;
        this.box.addClass('dialog-closing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            if (instance.status == DialogStatus.closing) {
                // 防止中途改变当前状态
                instance._close();
            }
        });
    };
    /**
     * 删除控件
     */
    DialogCore.prototype._close = function () {
        if (!this.box) {
            return;
        }
        if (this.trigger('closed') == false) {
            console.log('closed stop!');
            return;
        }
        this._status = DialogStatus.closed;
        if (this._dialogBg) {
            this._dialogBg.remove();
            this._dialogBg = undefined;
        }
        Dialog.removeItem(this.id);
        this.box.remove();
        this.box = undefined;
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
    DialogCore.prototype._getBottom = function () {
        return Math.max($(window).height() * .33 - this.box.height() / 2, 0);
    };
    DialogCore.prototype._getTop = function () {
        return Math.max($(window).height() / 2 - this.box.height() / 2, 0);
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
        this.extra = 'loading'; //额外的class
        this.count = 5;
        this.type = DialogType.tip;
        this.hasYes = true;
        this.hasNo = true;
        this.time = 0;
        this.button = [];
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
        if (element.options.type == DialogType.message) {
            element.options.y = this.getMessageTop();
            this._messageData.push(element.id);
            return;
        }
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
        this.sortMessageAndDelete(this._data[id]);
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
    Dialog.showBg = function (target) {
        if (target === void 0) { target = $(document.body); }
        var instance = this;
        if (!this._dialogBg) {
            this._dialogBg = $('<div class="dialog-bg"></div>');
            this._dialogBg.click(function (e) {
                e.stopPropagation();
                instance.remove();
            });
            // 更改遮罩的位置
            target.append(this._dialogBg);
        }
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
    Dialog.sortMessageAndDelete = function (element) {
        if (element.options.type != DialogType.message) {
            return;
        }
        var i = this._messageData.indexOf(element.id);
        if (i < 0) {
            return;
        }
        this._messageData.splice(i, 1);
        var y = element.options.y;
        for (; i < this._messageData.length; i++) {
            var item = this._data[this._messageData[i]];
            item.css('top', y + 'px');
            item.options.y = y;
            y += item.element.height() + 20;
        }
    };
    Dialog.getMessageTop = function () {
        var length = this._messageData.length;
        if (length < 1) {
            return 30;
        }
        var item = this._data[this._messageData[length - 1]];
        return item.options.y + item.element.height() + 20;
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
Dialog._messageData = [];
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
        option.type = element.attr('dialog-type') || this.option.type;
        option.content = element.attr('dialog-content') || this.option.content;
        option.url = element.attr('dialog-url') || this.option.url;
        option.time = parseInt(element.attr('dialog-time')) || this.option.time;
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
        this.createCore().createContent().setProperty();
    };
    DialogTip.prototype.getDefaultOption = function () {
        return new DefaultDialogTipOption();
    };
    DialogTip.prototype.createContent = function () {
        this.box.text(this.options.content);
        return this;
    };
    DialogTip.prototype.setProperty = function () {
        $(document.body).append(this.box);
        var maxWidth = Dialog.$window.width();
        var width = this.box.width();
        this.css('left', (maxWidth - width) / 2 + 'px');
        return this;
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
    DialogMessage.prototype.init = function () {
    };
    DialogMessage.prototype.setProperty = function () {
        var y = Dialog.getMessageTop();
        this.css('top', y + 'px');
        return this;
    };
    return DialogMessage;
}(DialogTip));
Dialog.addMethod(DialogType.message, DialogMessage);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LnRzIiwiYm94LnRzIiwiY29yZS50cyIsImRlZmF1bHQudHMiLCJkaWFsb2cudHMiLCJlbnVtLnRzIiwianF1ZXJ5LmRpYWxvZy50cyIsInRpcC50cyIsIm1lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0lBQUE7SUFtQkEsQ0FBQTtJQWhCQSxnQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLFFBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHNCQUFBLEdBQUEsVUFBQSxLQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQkFBQSxHQUFBLFVBQUEsS0FBQTtRQUFBLGNBQUE7YUFBQSxVQUFBLEVBQUEscUJBQUEsRUFBQSxJQUFBO1lBQUEsNkJBQUE7O1FBQ0EsSUFBQSxTQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxZQUFBLElBQUEsU0FBQSxJQUFBLEdBQUE7O0lBQ0EsQ0FBQTtJQUNBLFVBQUE7QUFBQSxDQW5CQSxBQW1CQSxJQUFBO0FDbkJBO0lBQUEsdUJBQUE7SUFBQTs7SUFnQ0EsQ0FBQTtJQTFCQSwwQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEseUJBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsU0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBR0E7Ozs7T0FJQTtJQUNBLFdBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQSxPQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsT0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLFVBQUE7QUFBQSxDQWhDQSxBQWdDQSxDQWhDQSxHQUFBLEdBZ0NBO0FDaENBO0lBQUEsOEJBQUE7SUFDQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtRQUZBLFlBSUEsaUJBQUEsU0FHQTtRQUxBLFFBQUEsR0FBQSxFQUFBLENBQUE7UUFTQSxhQUFBLEdBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQTtRQU5BLEtBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsS0FBQSxDQUFBLGdCQUFBLEVBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7O0lBQ0EsQ0FBQTtJQU1BLHNCQUFBLDhCQUFBO2FBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLENBQUE7YUFFQSxVQUFBLEdBQUE7WUFDQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7WUFDQSxXQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxNQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLEtBQUEsWUFBQSxDQUFBLElBQUE7b0JBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxJQUFBO29CQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0EsS0FBQSxZQUFBLENBQUEsT0FBQTtvQkFDQSxJQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7b0JBQ0EsS0FBQSxDQUFBO2dCQUNBLEtBQUEsWUFBQSxDQUFBLE1BQUE7b0JBQ0EsSUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsQ0FBQTtnQkFDQTtvQkFDQSxNQUFBLGVBQUEsR0FBQSxHQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTs7O09BeEJBO0lBK0JBOztPQUVBO0lBQ0EscUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLG1CQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQTs7T0FFQTtJQUNBLDBCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDBCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLG9DQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUE7ZUFDQSxJQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsWUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSw4RUFBQSxFQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxhQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDJCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxTQUFBLENBQUE7SUFDQSxDQUFBO0lBSUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLDRCQUFBLEdBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsaUNBQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxHQUFBLFNBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFPQSx3QkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLEtBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxHQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxHQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxHQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDJCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQSwrQkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw0QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw2QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdDQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUEsU0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxPQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLEdBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsUUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsS0FBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsV0FBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxFQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE1BQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFVBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLElBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0E7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFDQSxpQkFBQTtBQUFBLENBdE9BLEFBc09BLENBdE9BLEdBQUEsR0FzT0E7QUN0T0E7SUFBQTtRQUNBLFVBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxVQUFBLEdBQUEsU0FBQSxDQUFBLENBQUEsVUFBQTtRQUNBLFVBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxTQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQTtRQUNBLFdBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxVQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsU0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLFdBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxZQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsV0FBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUFBLDBCQUFBO0FBQUEsQ0FiQSxBQWFBLElBQUE7QUNiQTtJQUFBO0lBb1VBLENBQUE7SUFsVEE7OztPQUdBO0lBQ0EsYUFBQSxHQUFBLFVBQUEsTUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsT0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsSUFBQTtRQUFBLHFCQUFBLEVBQUEsV0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7OztPQUlBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLElBQUE7UUFBQSxxQkFBQSxFQUFBLFdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsSUFBQTtRQUFBLHFCQUFBLEVBQUEsUUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7O09BS0E7SUFDQSxjQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLE1BQUEsRUFBQSxNQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7O09BTUE7SUFDQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQTtnQkFDQSxPQUFBLEVBQUEsT0FBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7Ozs7T0FPQTtJQUNBLFdBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsVUFBQSxDQUFBLEdBQUE7WUFDQSxPQUFBLEVBQUEsT0FBQTtZQUNBLEtBQUEsRUFBQSxLQUFBO1lBQ0EsTUFBQSxFQUFBLE1BQUE7WUFDQSxLQUFBLEVBQUEsS0FBQTtZQUNBLE1BQUEsRUFBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7Ozs7T0FNQTtJQUNBLFdBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUE7UUFBQSxzQkFBQSxFQUFBLFlBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2dCQUNBLE1BQUEsRUFBQSxNQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7T0FLQTtJQUNBLGFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQTtRQUFBLHNCQUFBLEVBQUEsWUFBQTtRQUFBLHdCQUFBLEVBQUEsWUFBQTtRQUFBLHFCQUFBLEVBQUEsU0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsS0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLEdBQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7Z0JBQ0EsT0FBQSxFQUFBLE9BQUE7Z0JBQ0EsR0FBQSxFQUFBLElBQUE7YUFDQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGNBQUEsR0FBQSxVQUFBLE9BQUE7UUFDQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7ZUFDQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBRUEsY0FBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsVUFBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGlCQUFBLEdBQUEsVUFBQSxFQUFBO1FBQUEsbUJBQUEsRUFBQSxLQUFBLElBQUEsQ0FBQSxLQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLG9CQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsYUFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUE7WUFDQSxJQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxjQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsSUFBQSxVQUFBLENBQUEsR0FBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsT0FBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsSUFBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsTUFBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLFVBQUEsR0FBQSxVQUFBLFFBQUE7UUFDQSxHQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGFBQUEsR0FBQSxVQUFBLE1BQUE7UUFBQSx1QkFBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQUEsK0JBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFVBQUE7WUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsY0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwyQkFBQSxHQUFBLFVBQUEsT0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsR0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQkFBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsTUFBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsYUFBQTtBQUFBLENBcFVBLEFBb1VBO0FBbFVBLGNBQUEsR0FBQSxFQUFBLENBQUE7QUFFQSxZQUFBLEdBQUEsRUFBQSxDQUFBO0FBRUEsWUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUE7QUFFQSxlQUFBLEdBQUEsRUFBQSxDQUFBO0FBRUEsbUJBQUEsR0FBQSxFQUFBLENBQUE7QUFJQSxjQUFBLEdBQUEsQ0FBQSxDQUFBO0FBRUEsY0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQ2hCQTs7R0FFQTtBQUNBLElBQUEsVUFhQTtBQWJBLFdBQUEsVUFBQTtJQUNBLHlDQUFBLENBQUE7SUFDQSxpREFBQSxDQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLHlDQUFBLENBQUE7SUFDQSxpREFBQSxDQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLDZDQUFBLENBQUE7SUFDQSwyQ0FBQSxDQUFBO0lBQ0EsMkNBQUEsQ0FBQTtJQUNBLGlEQUFBLENBQUE7SUFDQSwwQ0FBQSxDQUFBO0lBQ0EsNENBQUEsQ0FBQTtBQUNBLENBQUEsRUFiQSxVQUFBLEtBQUEsVUFBQSxRQWFBO0FBRUE7O0dBRUE7QUFDQSxJQUFBLGVBVUE7QUFWQSxXQUFBLGVBQUE7SUFDQSxtREFBQSxDQUFBO0lBQ0EsdURBQUEsQ0FBQTtJQUNBLHlEQUFBLENBQUE7SUFDQSxxREFBQSxDQUFBO0lBQ0EseURBQUEsQ0FBQTtJQUNBLDJEQUFBLENBQUE7SUFDQSw2REFBQSxDQUFBO0lBQ0EsbUVBQUEsQ0FBQTtJQUNBLGlFQUFBLENBQUE7QUFDQSxDQUFBLEVBVkEsZUFBQSxLQUFBLGVBQUEsUUFVQTtBQUVBOztHQUVBO0FBQ0EsSUFBQSxZQUtBO0FBTEEsV0FBQSxZQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLCtDQUFBLENBQUE7SUFDQSxxREFBQSxDQUFBO0lBQ0EsbURBQUEsQ0FBQSxDQUFBLEtBQUE7QUFDQSxDQUFBLEVBTEEsWUFBQSxLQUFBLFlBQUEsUUFLQTtBQ3pDQTtJQUNBLHNCQUNBLE9BQUEsRUFDQSxNQUFBO1FBREEsWUFBQSxHQUFBLE9BQUEsQ0FBQTtRQUNBLFdBQUEsR0FBQSxNQUFBLENBQUE7UUFFQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBSUEsbUNBQUEsR0FBQSxVQUFBLE9BQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxHQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxtQkFBQTtBQUFBLENBeEJBLEFBd0JBLElBQUE7QUFFQSxDQUFBO0FBQUEsQ0FBQSxVQUFBLENBQUE7SUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLE1BQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQSxDQUFBO0FBQ0EsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUMxQkE7SUFBQSw2QkFBQTtJQUNBLG1CQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx3QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxzQkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLCtCQUFBLEdBQUE7UUFDQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZ0JBQUE7QUFBQSxDQTNCQSxBQTJCQSxDQTNCQSxVQUFBLEdBMkJBO0FBRUE7SUFBQTtRQUNBLFNBQUEsR0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBQUEsNkJBQUE7QUFBQSxDQUZBLEFBRUEsSUFBQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQ2pDQTtJQUFBLGlDQUFBO0lBQ0EsdUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDRCQUFBLEdBQUE7SUFFQSxDQUFBO0lBRUEsbUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0Esb0JBQUE7QUFBQSxDQWpCQSxBQWlCQSxDQWpCQSxTQUFBLEdBaUJBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBIiwiZmlsZSI6ImpxdWVyeS5kaWFsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhYnN0cmFjdCBjbGFzcyBFdmUge1xyXG4gICAgcHVibGljIG9wdGlvbnM6IGFueTtcclxuXHJcbiAgICBwdWJsaWMgb24oZXZlbnQ6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zWydvbicgKyBldmVudF0gPSBjYWxsYmFjaztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGFzRXZlbnQoZXZlbnQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ29uJyArIGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJpZ2dlcihldmVudDogc3RyaW5nLCAuLi4gYXJnczogYW55W10pIHtcclxuICAgICAgICBsZXQgcmVhbEV2ZW50ID0gJ29uJyArIGV2ZW50O1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNFdmVudChldmVudCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3JlYWxFdmVudF0uY2FsbCh0aGlzLCAuLi5hcmdzKTtcclxuICAgIH1cclxufSIsImFic3RyYWN0IGNsYXNzIEJveCBleHRlbmRzIEV2ZSB7XHJcblxyXG4gICAgcHVibGljIGVsZW1lbnQ6IEpRdWVyeTtcclxuXHJcbiAgICBwdWJsaWMgYm94OiBKUXVlcnk7XHJcblxyXG4gICAgcHJvdGVjdGVkIHNob3dQb3NpdGlvbigpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5ib3guc2hvdygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzZXRQb3NpdGlvbigpOiB0aGlzIHtcclxuICAgICAgICBsZXQgb2Zmc2V0ID0gdGhpcy5lbGVtZW50Lm9mZnNldCgpO1xyXG4gICAgICAgIGxldCB4ID0gb2Zmc2V0LmxlZnQgLSAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpO1xyXG4gICAgICAgIGxldCB5ID0gb2Zmc2V0LnRvcCArIHRoaXMuZWxlbWVudC5vdXRlckhlaWdodCgpIC0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgICAgIHRoaXMuYm94LmNzcyh7bGVmdDogeCArIFwicHhcIiwgdG9wOiB5ICsgXCJweFwifSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2u5Y+v6IO95piv55u45a+55YC86I635Y+W57ud5a+55YC8XHJcbiAgICAgKiBAcGFyYW0gYWJzZXJ2YWJsZSBcclxuICAgICAqIEBwYXJhbSByZWx0aXZlIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldFJlYWwoYWJzZXJ2YWJsZTogbnVtYmVyLCByZWx0aXZlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGlmIChyZWx0aXZlID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVsdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFic2VydmFibGUgKiByZWx0aXZlO1xyXG4gICAgfVxyXG59IiwiYWJzdHJhY3QgY2xhc3MgRGlhbG9nQ29yZSBleHRlbmRzIEJveCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBwdWJsaWMgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdE9wdGlvbigpLCBvcHRpb24pO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50eXBlID0gIERpYWxvZy5wYXJzZUVudW08RGlhbG9nVHlwZT4odGhpcy5vcHRpb25zLnR5cGUsIERpYWxvZ1R5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcHRpb25zOiBEaWFsb2dPcHRpb247XHJcblxyXG4gICAgcHJpdmF0ZSBfc3RhdHVzOiBEaWFsb2dTdGF0dXMgPSBEaWFsb2dTdGF0dXMuY2xvc2VkO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgc3RhdHVzKCk6IERpYWxvZ1N0YXR1cyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXR1cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHN0YXR1cyhhcmc6IERpYWxvZ1N0YXR1cykge1xyXG4gICAgICAgIGFyZyA9IERpYWxvZy5wYXJzZUVudW08RGlhbG9nU3RhdHVzPihhcmcsIERpYWxvZ1N0YXR1cyk7XHJcbiAgICAgICAgLy8g55u45ZCM54q25oCB5LiN5YGa5pON5L2cXHJcbiAgICAgICAgaWYgKHRoaXMuX3N0YXR1cyA9PSBhcmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKGFyZykge1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ1N0YXR1cy5zaG93OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nU3RhdHVzLmhpZGU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dTdGF0dXMuY2xvc2luZzpcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvbkNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dTdGF0dXMuY2xvc2VkOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJzdGF0dXMgZXJyb3I6XCIrIGFyZztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgX2RpYWxvZ0JnOiBKUXVlcnk7ICAvLyDoh6rlt7HnmoTog4zmma/pga7nvalcclxuXHJcbiAgICBwcml2YXRlIF90aW1lSGFuZGxlOiBudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bpu5jorqTorr7nva5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKTogRGlhbG9nT3B0aW9uIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dPcHRpb24oKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rlubbmmL7npLrmjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2hvdygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdzaG93JykpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3Nob3cgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJveC5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLnNob3c7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rlubbpmpDol4/mjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfaGlkZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdoaWRlJykpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2hpZGUgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJveC5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLmhpZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliqjnlLvlhbPpl63vvIzmnInlhbPpl63liqjnlLtcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfYW5pbWF0aW9uQ2xvc2UoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJveCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2luZyBcclxuICAgICAgICB8fCB0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2VkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX3RpbWVIYW5kbGUpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVIYW5kbGUpO1xyXG4gICAgICAgICAgICB0aGlzLl90aW1lSGFuZGxlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdjbG9zaW5nJykpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Nsb3Npbmcgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBEaWFsb2dTdGF0dXMuY2xvc2luZztcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYm94LmFkZENsYXNzKCdkaWFsb2ctY2xvc2luZycpLm9uZSgnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCcsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmNsb3NpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIOmYsuatouS4remAlOaUueWPmOW9k+WJjeeKtuaAgVxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX2Nsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIoOmZpOaOp+S7tlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9jbG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudHJpZ2dlcignY2xvc2VkJykgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Nsb3NlZCBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IERpYWxvZ1N0YXR1cy5jbG9zZWQ7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RpYWxvZ0JnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9kaWFsb2dCZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLnJlbW92ZUl0ZW0odGhpcy5pZCk7IFxyXG4gICAgICAgIHRoaXMuYm94LnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuYm94ID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhYnN0cmFjdCBpbml0KCk7XHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvcmUoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3ggPSAkKCc8ZGl2IGNsYXNzPVwiZGlhbG9nIGRpYWxvZy0nKyBEaWFsb2dUeXBlW3RoaXMub3B0aW9ucy50eXBlXSArJ1wiIGRhdGEtdHlwZT1cImRpYWxvZ1wiIGRpYWxvZy1pZD0nKyB0aGlzLmlkICsnPjwvZGl2PicpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVDb250ZW50KCk6IHRoaXM7XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IHNldFByb3BlcnR5KCk6IHRoaXM7XHJcblxyXG5cclxuICAgIHB1YmxpYyBjc3Moa2V5OiBhbnksIHZhbHVlPzogc3RyaW5nfCBudW1iZXIpOiBKUXVlcnkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJveC5jc3Moa2V5LCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3coKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBEaWFsb2dTdGF0dXMuc2hvdztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlkZSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IERpYWxvZ1N0YXR1cy5oaWRlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbG9zZSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IERpYWxvZ1N0YXR1cy5jbG9zaW5nO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0b2dnbGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5oaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBfZ2V0Qm90dG9tKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KCQod2luZG93KS5oZWlnaHQoKSAqIC4zMyAtIHRoaXMuYm94LmhlaWdodCgpIC8gMiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0VG9wKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KCQod2luZG93KS5oZWlnaHQoKSAvIDIgLSB0aGlzLmJveC5oZWlnaHQoKSAvIDIsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldExlZnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLndpZHRoKCkgLyAyIC0gdGhpcy5ib3gud2lkdGgoKSAvIDIsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFJpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KCQod2luZG93KS53aWR0aCgpIC8gMiAtIHRoaXMuYm94LndpZHRoKCkgLyAyLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRXaWR0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB3aWR0aCA9IERpYWxvZy4kd2luZG93LndpZHRoKCk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy53aWR0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHdpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gd2lkdGggKiB0aGlzLm9wdGlvbnMud2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0SGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IERpYWxvZy4kd2luZG93LmhlaWdodCgpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGVpZ2h0ID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGVpZ2h0ICogdGhpcy5vcHRpb25zLmhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRMZWZ0VG9wKGRpcmVjdGlvbjogRGlhbG9nRGlyZWN0aW9uLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgYm94V2lkdGg6IG51bWJlciwgYm94SGVpZ2h0OiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0VG9wOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFswLCAwXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24udG9wOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsoYm94SGVpZ2h0IC0gd2lkdGgpIC8gMiwgMF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0VG9wOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtib3hIZWlnaHQgLSB3aWR0aCwgMF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtib3hIZWlnaHQgLSB3aWR0aCwgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHRCb3R0b206XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2JveEhlaWdodCAtIHdpZHRoLCBib3hIZWlnaHQgLSBoZWlnaHRdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5ib3R0b206XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyhib3hIZWlnaHQgLSB3aWR0aCkgLyAyLCBib3hIZWlnaHQgLSBoZWlnaHRdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0Qm90dG9tOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFswLCBib3hIZWlnaHQgLSBoZWlnaHRdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFswLCAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5jZW50ZXI6XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyhib3hIZWlnaHQgLSB3aWR0aCkgLyAyLCAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImNsYXNzIERlZmF1bHREaWFsb2dPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dPcHRpb24ge1xyXG4gICAgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonO1xyXG4gICAgZXh0cmE6IHN0cmluZyA9ICdsb2FkaW5nJzsgICAgICAvL+mineWklueahGNsYXNzXHJcbiAgICBjb3VudDogbnVtYmVyID0gNTtcclxuICAgIHR5cGU/OiBEaWFsb2dUeXBlID0gRGlhbG9nVHlwZS50aXA7XHJcbiAgICBoYXNZZXM6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgaGFzTm86IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgdGltZTogbnVtYmVyID0gMDtcclxuICAgIGJ1dHRvbjogc3RyaW5nW10gPSBbXTtcclxuICAgIGNhbk1vdmU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgb25kb25lOiBGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgIH1cclxufSIsImNsYXNzIERpYWxvZyB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBtZXRob2RzOiB7W3R5cGU6IG51bWJlcl06IEZ1bmN0aW9ufSA9IHt9O1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9kYXRhOiB7W2lkOiBudW1iZXJdOiBEaWFsb2dDb3JlfSA9IHt9O1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9ndWlkOiBudW1iZXIgPSAwOyAvLyBpZOagh+iusFxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF90aXBEYXRhOiBBcnJheTxudW1iZXI+ID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX21lc3NhZ2VEYXRhOiBBcnJheTxudW1iZXI+ID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2RpYWxvZ0JnOiBKUXVlcnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2JnTG9jazogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljICR3aW5kb3cgPSAkKHdpbmRvdyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvpgKDlvLnlh7rmoYZcclxuICAgICAqIEBwYXJhbSBvcHRpb24gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9wdGlvbj86IERpYWxvZ09wdGlvbik6IERpYWxvZ0NvcmUge1xyXG4gICAgICAgIGlmICghb3B0aW9uLnR5cGUpIHtcclxuICAgICAgICAgICAgb3B0aW9uLnR5cGUgPSBEaWFsb2dUeXBlLnRpcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0aW9uLnR5cGUgPSB0aGlzLnBhcnNlRW51bTxEaWFsb2dUeXBlPihvcHRpb24udHlwZSwgRGlhbG9nVHlwZSk7XHJcbiAgICAgICAgbGV0IG1ldGhvZCA9IHRoaXMuZ2V0TWV0aG9kKG9wdGlvbi50eXBlKTtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IG5ldyBtZXRob2Qob3B0aW9uKTtcclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHBhcnNlRW51bTxUPih2YWw6IGFueSwgdHlwZTogYW55KTogVCB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVbdmFsXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaPkOekulxyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGltZSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB0aXAoY29udGVudDogc3RyaW5nIHwgRGlhbG9nVGlwT3B0aW9uLCB0aW1lOiBudW1iZXIgPSAyMDAwKTogRGlhbG9nQ29yZSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7Y29udGVudDogY29udGVudCwgdGltZTogdGltZX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUudGlwO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZShjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmtojmga9cclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpbWUgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbWVzc2FnZShjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dPcHRpb24sIHRpbWU6IG51bWJlciA9IDIwMDApOiBEaWFsb2dDb3JlIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtjb250ZW50OiBjb250ZW50LCB0aW1lOiB0aW1lfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS5tZXNzYWdlO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZShjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb1cclxuICAgICAqIEBwYXJhbSB0aW1lIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGxvYWRpbmcodGltZTogbnVtYmVyIHwgRGlhbG9nT3B0aW9uID0gMCk6IERpYWxvZ0NvcmUge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGltZSAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aW1lID0ge3RpbWU6IHRpbWV9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aW1lLnR5cGUgPSBEaWFsb2dUeXBlLmxvYWRpbmc7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKHRpbWUpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWGheWuueW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNvbnRlbnQoY29udGVudDogc3RyaW5nIHwgRGlhbG9nT3B0aW9uLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgICAgIGhhc05vOiBoYXNOb1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLmNvbnRlbnQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaZrumAmuW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGJveChjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dPcHRpb24sIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JywgaGFzWWVzPzogYm9vbGVhbiwgaGFzTm8/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICAgICAgaGFzWWVzOiBoYXNZZXMsXHJcbiAgICAgICAgICAgICAgICBoYXNObzogaGFzTm9cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS5ib3g7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOihqOagvOW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gZG9uZSBcclxuICAgICAqIEBwYXJhbSBoYXNZZXMgXHJcbiAgICAgKiBAcGFyYW0gaGFzTm8gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZnJvbShjb250ZW50OiBhbnksIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JywgZG9uZT86IEZ1bmN0aW9uLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUoe1xyXG4gICAgICAgICAgICB0eXBlOiBEaWFsb2dUeXBlLmJveCxcclxuICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgaGFzTm86IGhhc05vLFxyXG4gICAgICAgICAgICBvbmRvbmU6IGRvbmVcclxuICAgICAgICB9KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpobXpnaLlvLnnqpdcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBwYWdlKGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ09wdGlvbiwgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgICAgIGhhc05vOiBoYXNOb1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLnBhZ2U7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOahjOmdouaPkOmGklxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gaWNvbiBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBub3RpZnkodGl0bGU6IHN0cmluZyAgfCBEaWFsb2dPcHRpb24gPSAn6YCa55+lJywgY29udGVudDogc3RyaW5nID0gJycsIGljb246IHN0cmluZyA9ICcnKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aXRsZSAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aXRsZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICBpY286IGljb25cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGl0bGUudHlwZSA9IERpYWxvZ1R5cGUubm90aWZ5O1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZSh0aXRsZSkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhZGRJdGVtKGVsZW1lbnQ6IERpYWxvZ0NvcmUpIHtcclxuICAgICAgICB0aGlzLl9kYXRhWysrdGhpcy5fZ3VpZF0gPSBlbGVtZW50O1xyXG4gICAgICAgIGVsZW1lbnQuaWQgPSB0aGlzLl9ndWlkO1xyXG4gICAgICAgIGlmIChlbGVtZW50Lm9wdGlvbnMudHlwZSA9PSBEaWFsb2dUeXBlLm1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5vcHRpb25zLnkgPSB0aGlzLmdldE1lc3NhZ2VUb3AoKTtcclxuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZURhdGEucHVzaChlbGVtZW50LmlkKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fbmVlZEJnKGVsZW1lbnQub3B0aW9ucy50eXBlKSBcclxuICAgICAgICAmJiAhZWxlbWVudC5vcHRpb25zLnRhcmdldCkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dCZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGhhc0l0ZW0oaWQ6IG51bWJlciB8IHN0cmluZyA9IHRoaXMuX2d1aWQpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShpZCArICcnKVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0KGlkOiBudW1iZXIgfCBzdHJpbmcgPSB0aGlzLl9ndWlkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzSXRlbShpZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFbaWRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBcImVycm9yOlwiICsgaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOWIoOmZpOW8ueWHuuahhlxyXG4gICAgICogQHBhcmFtIGlkIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUl0ZW0oaWQ6IG51bWJlciA9IHRoaXMuX2d1aWQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzSXRlbShpZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kYXRhW2lkXS5jbG9zZSgpO1xyXG4gICAgICAgIHRoaXMuc29ydE1lc3NhZ2VBbmREZWxldGUodGhpcy5fZGF0YVtpZF0pO1xyXG4gICAgICAgIGlmICh0aGlzLl9uZWVkQmcodGhpcy5fZGF0YVtpZF0ub3B0aW9ucy50eXBlKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2RhdGFbaWRdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yig6Zmk5omA5pyJ5by55Ye65qGGXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlKCkge1xyXG4gICAgICAgIHRoaXMubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgaXRlbS5jbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yik5pat5piv5ZCm6ZyA6KaB5L2/55So6YGu572pXHJcbiAgICAgKiBAcGFyYW0gdHlwZSBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX25lZWRCZyh0eXBlOiBEaWFsb2dUeXBlIHwgc3RyaW5nIHwgbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgIT0gRGlhbG9nVHlwZS50aXAgXHJcbiAgICAgICAgJiYgdHlwZSAhPSBEaWFsb2dUeXBlLm1lc3NhZ2VcclxuICAgICAgICAmJiB0eXBlICE9IERpYWxvZ1R5cGUucGFnZSBcclxuICAgICAgICAmJiB0eXBlICE9IERpYWxvZ1R5cGUubm90aWZ5XHJcbiAgICAgICAgJiYgdHlwZSAhPSBEaWFsb2dUeXBlLnBvcDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOW+queOr+aJgOacieW8ueWHuuahhlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG1hcChjYWxsYmFjazogKGl0ZW06IERpYWxvZ0NvcmUpID0+IGFueSkge1xyXG4gICAgICAgIGZvcihsZXQgaWQgaW4gdGhpcy5fZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzSXRlbShpZCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBjYWxsYmFjayh0aGlzLl9kYXRhW2lkXSk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuumBrue9qVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHNob3dCZyh0YXJnZXQ6IEpRdWVyeSA9ICQoZG9jdW1lbnQuYm9keSkpIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIGlmICghdGhpcy5fZGlhbG9nQmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGlhbG9nQmcgPSAkKCc8ZGl2IGNsYXNzPVwiZGlhbG9nLWJnXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIOabtOaUuemBrue9qeeahOS9jee9rlxyXG4gICAgICAgICAgICB0YXJnZXQuYXBwZW5kKHRoaXMuX2RpYWxvZ0JnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYmdMb2NrICsrO1xyXG4gICAgICAgIHRoaXMuX2RpYWxvZ0JnLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj+mBrue9qVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNsb3NlQmcoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9kaWFsb2dCZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2JnTG9jay0tO1xyXG4gICAgICAgIGlmICh0aGlzLl9iZ0xvY2sgPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZGlhbG9nQmcuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgc29ydE1lc3NhZ2VBbmREZWxldGUoZWxlbWVudDogRGlhbG9nQ29yZSkge1xyXG4gICAgICAgIGlmIChlbGVtZW50Lm9wdGlvbnMudHlwZSAhPSBEaWFsb2dUeXBlLm1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaSA9IHRoaXMuX21lc3NhZ2VEYXRhLmluZGV4T2YoZWxlbWVudC5pZCk7XHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWVzc2FnZURhdGEuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgIGxldCB5ID0gZWxlbWVudC5vcHRpb25zLnk7XHJcbiAgICAgICAgZm9yKDsgaSA8IHRoaXMuX21lc3NhZ2VEYXRhLmxlbmd0aDsgaSArKykge1xyXG4gICAgICAgICAgICBsZXQgaXRlbSA9IHRoaXMuX2RhdGFbdGhpcy5fbWVzc2FnZURhdGFbaV1dO1xyXG4gICAgICAgICAgICBpdGVtLmNzcygndG9wJywgeSArICdweCcpO1xyXG4gICAgICAgICAgICBpdGVtLm9wdGlvbnMueSA9IHk7XHJcbiAgICAgICAgICAgIHkgKz0gaXRlbS5lbGVtZW50LmhlaWdodCgpICsgMjA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0TWVzc2FnZVRvcCgpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBsZW5ndGggPSB0aGlzLl9tZXNzYWdlRGF0YS5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDMwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaXRlbSA9IHRoaXMuX2RhdGFbdGhpcy5fbWVzc2FnZURhdGFbbGVuZ3RoIC0gMV1dO1xyXG4gICAgICAgIHJldHVybiBpdGVtLm9wdGlvbnMueSArIGl0ZW0uZWxlbWVudC5oZWlnaHQoKSAgKyAyMDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGFkZE1ldGhvZCh0eXBlOiBEaWFsb2dUeXBlLCBkaWFsb2c6IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5tZXRob2RzW3R5cGVdID0gZGlhbG9nO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzTWV0aG9kKHR5cGU6IERpYWxvZ1R5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXRob2RzLmhhc093blByb3BlcnR5KHR5cGUudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRNZXRob2QodHlwZTogRGlhbG9nVHlwZSk6IEZ1bmN0aW9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXRob2RzW3R5cGVdO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIOW8ueWHuuahhuexu+Wei1xyXG4gKi9cclxuZW51bSBEaWFsb2dUeXBlIHtcclxuICAgIHRpcCxcclxuICAgIG1lc3NhZ2UsXHJcbiAgICBub3RpZnksXHJcbiAgICBwb3AsXHJcbiAgICBsb2FkaW5nLFxyXG4gICAgc2VsZWN0LFxyXG4gICAgaW1hZ2UsXHJcbiAgICBkaXNrLFxyXG4gICAgZm9ybSxcclxuICAgIGNvbnRlbnQsXHJcbiAgICBib3gsXHJcbiAgICBwYWdlXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlvLnlh7rmoYbkvY3nva5cclxuICovXHJcbmVudW0gRGlhbG9nRGlyZWN0aW9uIHtcclxuICAgIHRvcCxcclxuICAgIHJpZ2h0LFxyXG4gICAgYm90dG9tLFxyXG4gICAgbGVmdCxcclxuICAgIGNlbnRlcixcclxuICAgIGxlZnRUb3AsXHJcbiAgICByaWdodFRvcCxcclxuICAgIHJpZ2h0Qm90dG9tLFxyXG4gICAgbGVmdEJvdHRvbVxyXG59XHJcblxyXG4vKipcclxuICog5by55Ye65qGG54q25oCBXHJcbiAqL1xyXG5lbnVtIERpYWxvZ1N0YXR1cyB7XHJcbiAgICBoaWRlLFxyXG4gICAgc2hvdyxcclxuICAgIGNsb3NpbmcsICAgLy/lhbPpl63kuK1cclxuICAgIGNsb3NlZCAgICAvL+W3suWFs+mXrVxyXG59IiwiY2xhc3MgRGlhbG9nUGx1Z2luIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgcHVibGljIG9wdGlvbj86IERpYWxvZ09wdGlvblxyXG4gICAgKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2UuZGlhbG9nKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaWFsb2cgPSBEaWFsb2cuY3JlYXRlKGluc3RhbmNlLl9wYXJzZU9wdGlvbigkKHRoaXMpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5zdGFuY2UuZGlhbG9nLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGlhbG9nOiBEaWFsb2dDb3JlO1xyXG5cclxuICAgIHByaXZhdGUgX3BhcnNlT3B0aW9uKGVsZW1lbnQ6IEpRdWVyeSkge1xyXG4gICAgICAgIGxldCBvcHRpb246IERpYWxvZ09wdGlvbiA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbik7XHJcbiAgICAgICAgb3B0aW9uLnR5cGUgPSBlbGVtZW50LmF0dHIoJ2RpYWxvZy10eXBlJykgfHwgdGhpcy5vcHRpb24udHlwZTtcclxuICAgICAgICBvcHRpb24uY29udGVudCA9IGVsZW1lbnQuYXR0cignZGlhbG9nLWNvbnRlbnQnKSB8fCB0aGlzLm9wdGlvbi5jb250ZW50O1xyXG4gICAgICAgIG9wdGlvbi51cmwgPSBlbGVtZW50LmF0dHIoJ2RpYWxvZy11cmwnKSB8fCB0aGlzLm9wdGlvbi51cmw7XHJcbiAgICAgICAgb3B0aW9uLnRpbWUgPSBwYXJzZUludChlbGVtZW50LmF0dHIoJ2RpYWxvZy10aW1lJykpIHx8IHRoaXMub3B0aW9uLnRpbWU7XHJcbiAgICAgICAgcmV0dXJuIG9wdGlvbjtcclxuICAgIH1cclxufVxyXG5cclxuOyhmdW5jdGlvbigkOiBhbnkpIHtcclxuICAgICQuZm4uZGlhbG9nID0gZnVuY3Rpb24ob3B0aW9uID86IERpYWxvZ09wdGlvbikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nUGx1Z2luKHRoaXMsIG9wdGlvbik7XHJcbiAgICB9O1xyXG59KShqUXVlcnkpOyIsImludGVyZmFjZSBEaWFsb2dUaXBPcHRpb24gZXh0ZW5kcyBEaWFsb2dPcHRpb24ge1xyXG4gICAgdGltZT86IG51bWJlciwgICAgICAgICAvL+aYvuekuuaXtumXtFxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dUaXAgZXh0ZW5kcyBEaWFsb2dDb3JlIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuICAgICAgICB0aGlzLmNyZWF0ZUNvcmUoKS5jcmVhdGVDb250ZW50KCkuc2V0UHJvcGVydHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dUaXBPcHRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC50ZXh0KHRoaXMub3B0aW9ucy5jb250ZW50KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0aGlzLmJveCk7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gRGlhbG9nLiR3aW5kb3cud2lkdGgoKTtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmJveC53aWR0aCgpO1xyXG4gICAgICAgIHRoaXMuY3NzKCdsZWZ0JywgKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nVGlwT3B0aW9uIGltcGxlbWVudHMgRGlhbG9nVGlwT3B0aW9uIHtcclxuICAgIHRpbWU6IG51bWJlciA9IDIwMDA7XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS50aXAsIERpYWxvZ1RpcCk7IiwiaW50ZXJmYWNlIERpYWxvZ01lc3NhZ2VPcHRpb24gZXh0ZW5kcyBEaWFsb2dUaXBPcHRpb24ge1xyXG5cclxufVxyXG5cclxuY2xhc3MgRGlhbG9nTWVzc2FnZSBleHRlbmRzIERpYWxvZ1RpcCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICBsZXQgeSA9IERpYWxvZy5nZXRNZXNzYWdlVG9wKCk7XHJcbiAgICAgICAgdGhpcy5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLm1lc3NhZ2UsIERpYWxvZ01lc3NhZ2UpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
