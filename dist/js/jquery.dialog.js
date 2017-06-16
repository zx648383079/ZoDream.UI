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
/**
 * 缓存数据
 */
var CacheUrl = (function () {
    function CacheUrl() {
    }
    CacheUrl.hasData = function (url) {
        return this._cacheData.hasOwnProperty(url);
    };
    CacheUrl.hasEvent = function (url) {
        return this._event.hasOwnProperty(url);
    };
    /**
     * 获取数据通过回调返回
     * @param url
     * @param callback
     */
    CacheUrl.getData = function (url, callback) {
        if (this.hasData(url)) {
            callback(this._cacheData[url]);
            return;
        }
        if (this.hasEvent(url)) {
            this._event[url].push(callback);
            return;
        }
        this._event[url] = [callback];
        var instance = this;
        $.getJSON(url, function (data) {
            if (data.code == 0) {
                instance.setData(url, data.data);
                return;
            }
            console.log('URL ERROR! ' + url);
        });
    };
    /**
     * 设置数据并回调
     * @param url
     * @param data
     */
    CacheUrl.setData = function (url, data) {
        this._cacheData[url] = data;
        if (!this.hasEvent(url)) {
            return;
        }
        this._event[url].forEach(function (callback) {
            callback(data);
        });
        delete this._event[url];
    };
    return CacheUrl;
}());
/**
 * 缓存的数据
 */
CacheUrl._cacheData = {};
/**
 * 缓存的事件
 */
CacheUrl._event = {};
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
    Dialog.form = function (content, title, done, hasYes, hasNo) {
        if (title === void 0) { title = '提示'; }
        return this.create({
            type: DialogType.form,
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
        this._dialogBg.unbind();
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
var DialogDiskType;
(function (DialogDiskType) {
    DialogDiskType[DialogDiskType["file"] = 0] = "file";
    DialogDiskType[DialogDiskType["directory"] = 1] = "directory";
})(DialogDiskType || (DialogDiskType = {}));
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
    DialogContent.prototype.getContentHtml = function () {
        var content = this.options.content;
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
        console.log('show', this.status);
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
        console.log('closeing', this.status);
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
    DialogForm.prototype.getContentHtml = function () {
        return '<div class="dialog-body">' + this._createForm(this.options.content) + '</div>';
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
var DialogDisk = (function (_super) {
    __extends(DialogDisk, _super);
    function DialogDisk(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogDisk.prototype.bindEvent = function () {
        this.catalogBox = this.box.find('.dialog-body .dialog-catalog');
        this.fileBox = this.box.find('.dialog-body .dialog-content');
        var instance = this;
        if (typeof this.options.catalog == 'object') {
            this.showCatalog(this.options.catalog);
        }
        else {
            $.getJSON(this.options.catalog, function (data) {
                if (data.code == 0) {
                    instance.showCatalog(data.data);
                }
            });
        }
        if (typeof this.options.content == 'object') {
            this.showFile(this.options.content);
        }
        else {
            $.getJSON(this.options.content, function (data) {
                if (data.code == 0) {
                    instance.showFile(data.data);
                }
            });
        }
        this.catalogBox.on('click', '.tree-item', function () {
            var file = $(this);
            file.addClass('active').siblings().removeClass('active');
            instance.open(file.attr('data-url'));
        });
        this.fileBox.on('click', '.folder-item', function () {
            var file = $(this);
            file.addClass('active').siblings().removeClass('active');
            instance.open(file.attr('data-url'));
        });
        this.fileBox.on('click', '.file-item', function () {
            var file = $(this);
            file.addClass('active');
            if (!instance.options.multiple) {
                file.siblings().removeClass('active');
            }
            instance.trigger('openFile', file.attr('data-url'), file);
        });
        return _super.prototype.bindEvent.call(this);
    };
    DialogDisk.prototype.getContentHtml = function () {
        return '<div class="dialog-body"><div class="dialog-catalog"></div><div class="dialog-content"></div></div>';
    };
    DialogDisk.prototype.getDefaultOption = function () {
        return new DefaultDialogDiskOption();
    };
    DialogDisk.prototype.open = function (url) {
        var _this = this;
        if (!url) {
            console.log('url is empty');
            return;
        }
        CacheUrl.getData(url, function (data) {
            _this.showFile(data);
        });
    };
    /**
     * 获取选中的文件路径
     */
    DialogDisk.prototype.val = function () {
        if (!this.options.multiple) {
            return this.fileBox.find('.file-item.active').attr('data-url');
        }
        var data = [];
        this.mapSelectedFile(function (url) {
            data.push(url);
        });
        return data;
    };
    /**
     * 循环选中的文件
     * @param callback
     */
    DialogDisk.prototype.mapSelectedFile = function (callback) {
        this.fileBox.find('.file-item.active').each(function (i, ele) {
            var item = $(ele);
            var url = item.attr('data-url');
            if (callback.call(item, url, item, i) == false) {
                return false;
            }
        });
        return this;
    };
    /**
     * 循环所有
     * @param callback
     * @param hasFolder 是否包含文件夹
     */
    DialogDisk.prototype.map = function (callback, hasFolder) {
        if (hasFolder === void 0) { hasFolder = false; }
        var tag = '.file-item';
        if (hasFolder) {
            tag = '.folder-item,' + tag;
        }
        this.fileBox.find(tag).each(function (i, ele) {
            var item = $(ele);
            var url = item.attr('data-url');
            if (callback.call(item, url, item, i) == false) {
                return false;
            }
        });
        return this;
    };
    /**
     * 显示文件
     * @param data
     */
    DialogDisk.prototype.showFile = function (data) {
        var _this = this;
        var html = '';
        $.each(data, function (i, item) {
            item.type = Dialog.parseEnum(item.type, DialogDiskType);
            if (item.type == DialogDiskType.file) {
                html += _this._getFileItem(item);
                return;
            }
            html += _this._getFolderItem(item);
        });
        this.fileBox.html(html);
    };
    DialogDisk.prototype._getFileItem = function (data) {
        return '<div class="file-item" data-url="' + data[this.options.url] + '"><i class="fa fa-file-o"></i><div class="file-name">' + data[this.options.name] + '</div></div>';
    };
    DialogDisk.prototype._getFolderItem = function (data) {
        return '<div class="folder-item" data-url="' + data[this.options.url] + '"><i class="fa fa-folder-o"></i><div class="file-name">' + data[this.options.name] + '</div></div>';
    };
    /**
     * 显示目录
     * @param data
     */
    DialogDisk.prototype.showCatalog = function (data) {
        var _this = this;
        var html = '';
        $.each(data, function (i, item) {
            html += _this._getCatalogItem(item);
        });
        if (html == '') {
            this.catalogBox.hide();
            return;
        }
        this.catalogBox.html('<ul class="tree">' + html + '</ul>');
    };
    DialogDisk.prototype._getCatalogItem = function (data) {
        var html = '<li class="tree-item" data-url="' + data[this.options.url] + '"><div class="tree-header">' + data[this.options.name] + '</div>';
        if (data.hasOwnProperty(this.options.children)) {
            html += this._getCatalogChild(data[this.options.children]);
        }
        return html + '</li>';
    };
    DialogDisk.prototype._getCatalogChild = function (data) {
        var _this = this;
        var html = '';
        $.each(data, function (i, item) {
            html += _this._getCatalogItem(item);
        });
        return '<ul class="tree-child">' + html + '</ul>';
    };
    return DialogDisk;
}(DialogBox));
var DefaultDialogDiskOption = (function (_super) {
    __extends(DefaultDialogDiskOption, _super);
    function DefaultDialogDiskOption() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'name';
        _this.title = '文件管理';
        _this.children = 'children';
        _this.url = 'url';
        _this.multiple = false;
        _this.onclosing = function () {
            this.hide();
            return false;
        };
        return _this;
    }
    return DefaultDialogDiskOption;
}(DefaultDialogBoxOption));
Dialog.addMethod(DialogType.disk, DialogDisk);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhY2hlLnRzIiwiZXZlbnQudHMiLCJib3gudHMiLCJjb3JlLnRzIiwiZGVmYXVsdC50cyIsImRpYWxvZy50cyIsImVudW0udHMiLCJqcXVlcnkuZGlhbG9nLnRzIiwidGlwLnRzIiwibWVzc2FnZS50cyIsIm5vdGlmeS50cyIsInBvcC50cyIsImxvYWRpbmcudHMiLCJjb250ZW50LnRzIiwiZm9ybS50cyIsInBhZ2UudHMiLCJpbWFnZS50cyIsImRpc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVBO0FBQ0E7SUFBQTtJQTJEQSxDQUFBO0lBaERBLGdCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLFFBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsRUFBQSxVQUFBLElBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxRQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZUFBQTtBQUFBLENBM0RBLEFBMkRBO0FBMURBOztHQUVBO0FBQ0EsbUJBQUEsR0FBQSxFQUFBLENBQUE7QUFFQTs7R0FFQTtBQUNBLGVBQUEsR0FBQSxFQUFBLENBQUE7QUNaQTtJQUFBO0lBbUJBLENBQUE7SUFoQkEsZ0JBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsUUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxzQkFBQSxHQUFBLFVBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUJBQUEsR0FBQSxVQUFBLEtBQUE7UUFBQSxjQUFBO2FBQUEsVUFBQSxFQUFBLHFCQUFBLEVBQUEsSUFBQTtZQUFBLDZCQUFBOztRQUNBLElBQUEsU0FBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsWUFBQSxJQUFBLFNBQUEsSUFBQSxHQUFBOztJQUNBLENBQUE7SUFDQSxVQUFBO0FBQUEsQ0FuQkEsQUFtQkEsSUFBQTtBQ25CQTtJQUFBLHVCQUFBO0lBQUE7O0lBZ0NBLENBQUE7SUExQkEsMEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsVUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBOzs7O09BSUE7SUFDQSxXQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUEsT0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxVQUFBO0FBQUEsQ0FoQ0EsQUFnQ0EsQ0FoQ0EsR0FBQSxHQWdDQTtBQ2hDQTtJQUFBLDhCQUFBO0lBQ0Esb0JBQ0EsTUFBQSxFQUNBLEVBQUE7UUFGQSxZQUlBLGlCQUFBLFNBR0E7UUFMQSxRQUFBLEdBQUEsRUFBQSxDQUFBO1FBU0EsYUFBQSxHQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUE7UUFOQSxLQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLEtBQUEsQ0FBQSxnQkFBQSxFQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBOztJQUNBLENBQUE7SUFNQSxzQkFBQSw4QkFBQTthQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxHQUFBO1lBQ0EsR0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxFQUFBLFlBQUEsQ0FBQSxDQUFBO1lBQ0EsV0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxJQUFBO29CQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0EsS0FBQSxZQUFBLENBQUEsSUFBQTtvQkFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7b0JBQ0EsS0FBQSxDQUFBO2dCQUNBLEtBQUEsWUFBQSxDQUFBLE9BQUE7b0JBQ0EsSUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxNQUFBO29CQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0E7b0JBQ0EsTUFBQSxlQUFBLEdBQUEsR0FBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7OztPQXhCQTtJQStCQSxzQkFBQSx5QkFBQTthQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7YUFFQSxVQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7OztPQUxBO0lBU0Esc0JBQUEsOEJBQUE7YUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsQ0FBQTthQUVBLFVBQUEsTUFBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBOzs7T0FMQTtJQU9BOzs7O09BSUE7SUFDQSxpQ0FBQSxHQUFBLFVBQUEsTUFBQSxFQUFBLFFBQUE7UUFBQSx5QkFBQSxFQUFBLGdCQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EscUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLG1CQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQTs7T0FFQTtJQUNBLDRCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxHQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsNEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQTtlQUNBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsOEVBQUEsRUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxRQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsNkJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFJQSwrQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBLENBQUEsNEJBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxpQ0FBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQU9BLHdCQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEseUJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEseUJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsMEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsMkJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUFBLGlCQVlBO1FBWEEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsUUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0NBQUEsR0FBQTtRQUFBLGlCQWFBO1FBWkEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsUUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUEsR0FBQSxNQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBLCtCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDRCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDZCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0NBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQSxTQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE9BQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsR0FBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxRQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxLQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxXQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEVBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsTUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsVUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsSUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGlCQUFBO0FBQUEsQ0E3U0EsQUE2U0EsQ0E3U0EsR0FBQSxHQTZTQTtBQzdTQTtJQUFBO1FBQ0EsVUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFNBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsWUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFdBQUEsR0FBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSwwQkFBQTtBQUFBLENBUEEsQUFPQSxJQUFBO0FDUEE7SUFBQTtJQWdSQSxDQUFBO0lBaFFBOzs7T0FHQTtJQUNBLGFBQUEsR0FBQSxVQUFBLE1BQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLE9BQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0JBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxJQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7OztPQUlBO0lBQ0EsVUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLElBQUE7UUFBQSxxQkFBQSxFQUFBLFdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7T0FJQTtJQUNBLGNBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxJQUFBO1FBQUEscUJBQUEsRUFBQSxXQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGNBQUEsR0FBQSxVQUFBLElBQUE7UUFBQSxxQkFBQSxFQUFBLFFBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7OztPQUtBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQTtnQkFDQSxPQUFBLEVBQUEsT0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7OztPQU1BO0lBQ0EsVUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQTtRQUFBLHNCQUFBLEVBQUEsWUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLEdBQUE7Z0JBQ0EsT0FBQSxFQUFBLE9BQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7Z0JBQ0EsTUFBQSxFQUFBLE1BQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7YUFDQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7Ozs7O09BT0E7SUFDQSxXQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQTtRQUFBLHNCQUFBLEVBQUEsWUFBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLFVBQUEsQ0FBQSxJQUFBO1lBQ0EsT0FBQSxFQUFBLE9BQUE7WUFDQSxLQUFBLEVBQUEsS0FBQTtZQUNBLE1BQUEsRUFBQSxNQUFBO1lBQ0EsS0FBQSxFQUFBLEtBQUE7WUFDQSxNQUFBLEVBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7O09BTUE7SUFDQSxXQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQTtnQkFDQSxPQUFBLEVBQUEsT0FBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7O09BS0E7SUFDQSxhQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLElBQUE7UUFBQSxzQkFBQSxFQUFBLFlBQUE7UUFBQSx3QkFBQSxFQUFBLFlBQUE7UUFBQSxxQkFBQSxFQUFBLFNBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEtBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxHQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLEdBQUEsRUFBQSxJQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxLQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxjQUFBLEdBQUEsVUFBQSxPQUFBO1FBQ0EsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxPQUFBLENBQUE7UUFDQSxPQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsY0FBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsVUFBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGlCQUFBLEdBQUEsVUFBQSxFQUFBO1FBQUEsbUJBQUEsRUFBQSxLQUFBLElBQUEsQ0FBQSxLQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsT0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsYUFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUE7WUFDQSxJQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxVQUFBLEdBQUEsVUFBQSxRQUFBO1FBQ0EsR0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLE1BQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxhQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUEsUUFBQTtRQUFBLHVCQUFBLEVBQUEsU0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtRQUFBLHlCQUFBLEVBQUEsZUFBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLFVBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLG1CQUFBLEVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxjQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQkFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBLE1BQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQkFBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQkFBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGFBQUE7QUFBQSxDQWhSQSxBQWdSQTtBQTlRQSxjQUFBLEdBQUEsRUFBQSxDQUFBO0FBRUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUVBLFlBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBO0FBRUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUlBLGNBQUEsR0FBQSxDQUFBLENBQUE7QUFFQSxjQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FDZEE7O0dBRUE7QUFDQSxJQUFBLFVBYUE7QUFiQSxXQUFBLFVBQUE7SUFDQSx5Q0FBQSxDQUFBO0lBQ0EsaURBQUEsQ0FBQTtJQUNBLCtDQUFBLENBQUE7SUFDQSx5Q0FBQSxDQUFBO0lBQ0EsaURBQUEsQ0FBQTtJQUNBLCtDQUFBLENBQUE7SUFDQSw2Q0FBQSxDQUFBO0lBQ0EsMkNBQUEsQ0FBQTtJQUNBLDJDQUFBLENBQUE7SUFDQSxpREFBQSxDQUFBO0lBQ0EsMENBQUEsQ0FBQTtJQUNBLDRDQUFBLENBQUE7QUFDQSxDQUFBLEVBYkEsVUFBQSxLQUFBLFVBQUEsUUFhQTtBQUVBOztHQUVBO0FBQ0EsSUFBQSxlQVVBO0FBVkEsV0FBQSxlQUFBO0lBQ0EsbURBQUEsQ0FBQTtJQUNBLHVEQUFBLENBQUE7SUFDQSx5REFBQSxDQUFBO0lBQ0EscURBQUEsQ0FBQTtJQUNBLHlEQUFBLENBQUE7SUFDQSwyREFBQSxDQUFBO0lBQ0EsNkRBQUEsQ0FBQTtJQUNBLG1FQUFBLENBQUE7SUFDQSxpRUFBQSxDQUFBO0FBQ0EsQ0FBQSxFQVZBLGVBQUEsS0FBQSxlQUFBLFFBVUE7QUFFQTs7R0FFQTtBQUNBLElBQUEsWUFLQTtBQUxBLFdBQUEsWUFBQTtJQUNBLCtDQUFBLENBQUE7SUFDQSwrQ0FBQSxDQUFBO0lBQ0EscURBQUEsQ0FBQTtJQUNBLG1EQUFBLENBQUEsQ0FBQSxLQUFBO0FBQ0EsQ0FBQSxFQUxBLFlBQUEsS0FBQSxZQUFBLFFBS0E7QUFFQSxJQUFBLGNBR0E7QUFIQSxXQUFBLGNBQUE7SUFDQSxtREFBQSxDQUFBO0lBQ0EsNkRBQUEsQ0FBQTtBQUNBLENBQUEsRUFIQSxjQUFBLEtBQUEsY0FBQSxRQUdBO0FDOUNBO0lBQ0Esc0JBQ0EsT0FBQSxFQUNBLE1BQUE7UUFEQSxZQUFBLEdBQUEsT0FBQSxDQUFBO1FBQ0EsV0FBQSxHQUFBLE1BQUEsQ0FBQTtRQUVBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFJQSxtQ0FBQSxHQUFBLFVBQUEsT0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxtQkFBQTtBQUFBLENBM0JBLEFBMkJBLElBQUE7QUFFQSxDQUFBO0FBQUEsQ0FBQSxVQUFBLENBQUE7SUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLE1BQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQSxDQUFBO0FBQ0EsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUM3QkE7SUFBQSw2QkFBQTtJQUNBLG1CQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFNQSx3QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUE7YUFDQSxZQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUE7YUFDQSxPQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsc0JBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsZ0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLElBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDZCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsMkJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsRUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDRCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLFlBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxVQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsUUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLFVBQUEsQ0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGdCQUFBO0FBQUEsQ0FsSUEsQUFrSUEsQ0FsSUEsVUFBQSxHQWtJQTtBQUVBO0lBQUE7UUFDQSxTQUFBLEdBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUFBLDZCQUFBO0FBQUEsQ0FGQSxBQUVBLElBQUE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUN4SUE7SUFBQSxpQ0FBQTtJQUNBLHVCQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUNBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0Esb0JBQUE7QUFBQSxDQTNCQSxBQTJCQSxDQTNCQSxTQUFBLEdBMkJBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBO0FDNUJBO0lBQUEsZ0NBQUE7SUFFQSxzQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBTUEsb0NBQUEsR0FBQTtRQUNBLE1BQUEsSUFBQSxLQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGtDQUFBLEdBQUE7UUFDQSxNQUFBLElBQUEsS0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHVDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSx5QkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsOEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQTtlQUNBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxjQUFBLElBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsR0FBQSxHQUFBLFlBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUE7WUFDQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsVUFBQTtnQkFDQSxFQUFBLENBQUEsQ0FBQSxVQUFBLEtBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtvQkFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxZQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUE7b0JBQ0EsSUFBQSxFQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQTtvQkFDQSxJQUFBLEVBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBO2lCQUNBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsS0FBQTtvQkFDQSxRQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxTQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUJBQUE7QUFBQSxDQXpGQSxBQXlGQSxDQXpGQSxTQUFBLEdBeUZBO0FBRUE7SUFBQSw2Q0FBQTtJQUFBO1FBQUEscUVBRUE7UUFEQSxXQUFBLEdBQUEsSUFBQSxDQUFBOztJQUNBLENBQUE7SUFBQSxnQ0FBQTtBQUFBLENBRkEsQUFFQSxDQUZBLHNCQUFBLEdBRUE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7QUNoR0E7SUFBQSw2QkFBQTtJQUNBLG1CQUNBLE1BQUEsRUFDQSxFQUFBO1FBRkEsWUFJQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLFNBSUE7UUFIQSxFQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLGVBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTs7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxnQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw2QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx1Q0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsbUJBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsR0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLDJOQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLENBQUEsR0FBQSxJQUFBO1lBQ0EsR0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGtDQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxTQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsRUFBQSxDQUFBLENBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxRQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxLQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxRQUFBLEdBQUEsS0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFdBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE1BQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsVUFBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsSUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsS0FBQSxHQUFBLEtBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxHQUFBLENBQUE7WUFDQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLEdBQUEsS0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGdCQUFBO0FBQUEsQ0FuRUEsQUFtRUEsQ0FuRUEsU0FBQSxHQW1FQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQ3BFQTtJQUFBLGlDQUFBO0lBQ0EsdUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHdDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSwwQkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQTtZQUNBLElBQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQTtZQUNBLEdBQUEsRUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUNBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsR0FBQSxDQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsZUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsT0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsT0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGtDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLFVBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQ0FBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsUUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQkFBQTtBQUFBLENBN0VBLEFBNkVBLENBN0VBLFNBQUEsR0E2RUE7QUFFQTtJQUFBO1FBQ0EsVUFBQSxHQUFBLFNBQUEsQ0FBQSxDQUFBLFVBQUE7UUFDQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsU0FBQSxHQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSxpQ0FBQTtBQUFBLENBSkEsQUFJQSxJQUFBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBO0FDN0VBO0lBQUEsaUNBQUE7SUFFQSx1QkFDQSxNQUFBLEVBQ0EsRUFBQTtRQUZBLFlBSUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQSxTQVVBO1FBRUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQSxnQkFBQTtRQVhBLEVBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO1lBQ0EsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLFVBQUEsSUFBQTtnQkFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUE7Z0JBQ0EsVUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBOztJQUNBLENBQUE7SUFNQSxzQkFBQSxvQ0FBQTthQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7WUFDQSxZQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7OztPQVRBO0lBV0E7O09BRUE7SUFDQSxzQ0FBQSxHQUFBLFVBQUEsR0FBQTtRQUFBLG9CQUFBLEVBQUEsTUFBQSxJQUFBLENBQUEsTUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsSUFBQSxHQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGNBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNEJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsYUFBQSxFQUFBO2FBQ0EsWUFBQSxFQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsU0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQSx3Q0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsMEJBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EscUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxvQ0FBQSxHQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLG1DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxzQ0FBQSxHQUFBO1FBQ0EsSUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLDJCQUFBLEdBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxRQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLFlBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLDZCQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsNkJBQUEsR0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLFdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsK0JBQUEsR0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLFdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLENBQUEsRUFBQSxJQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLElBQUEsV0FBQSxHQUFBLElBQUEsR0FBQSxXQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsSUFBQSxpQkFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsV0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLFFBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLFVBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsT0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLE9BQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxrQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxVQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLFFBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0JBQUE7QUFBQSxDQXJNQSxBQXFNQSxDQXJNQSxVQUFBLEdBcU1BO0FBRUE7SUFBQTtRQUNBLFdBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxVQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsU0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLFdBQUEsR0FBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBQUEsaUNBQUE7QUFBQSxDQUxBLEFBS0EsSUFBQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQSxhQUFBLENBQUEsQ0FBQTtBWHJOQTtJQUFBLDZCQUFBO0lBQ0EsbUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxJQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQTtnQkFDQSxJQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7Z0JBQ0EsR0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO2FBQ0EsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDZCQUFBLEdBQUE7UUFDQSxVQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxNQUFBLEdBQUEsSUFBQSxDQUFBO1lBQ0EsQ0FBQSxHQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBO2dCQUNBLEdBQUEsRUFBQSxDQUFBLENBQUEsS0FBQSxHQUFBLENBQUE7Z0JBQ0EsSUFBQSxFQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQTtZQUNBLE1BQUEsR0FBQSxLQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxpQkFBQSxTQUFBLFdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxzQkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBR0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLHVEQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsa0JBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsc0RBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQkFBQTtBQUFBLENBN0ZBLEFBNkZBLENBN0ZBLGFBQUEsR0E2RkE7QUFFQTtJQUFBLDBDQUFBO0lBQUE7UUFBQSxxRUFHQTtRQUZBLFdBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxhQUFBLEdBQUEsSUFBQSxDQUFBOztJQUNBLENBQUE7SUFBQSw2QkFBQTtBQUFBLENBSEEsQUFHQSxDQUhBLDBCQUFBLEdBR0E7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QVkxR0E7SUFBQSw4QkFBQTtJQUNBLG9CQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFPQSxzQkFBQSw0QkFBQTtRQUhBOztXQUVBO2FBQ0E7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTs7O09BQUE7SUFNQSxzQkFBQSxnQ0FBQTtRQUhBOztXQUVBO2FBQ0E7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBO1FBQ0EsQ0FBQTs7O09BQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLDJCQUFBLEdBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQ0FBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsSUFBQSxFQUFBLElBQUE7WUFDQSxJQUFBLElBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQSxJQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFVBQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLHNCQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsVUFBQTtnQkFDQSxJQUFBLElBQUEsa0JBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxHQUFBLGFBQUEsQ0FBQTtnQkFDQSxLQUFBLENBQUE7WUFDQSxLQUFBLFFBQUE7Z0JBQ0EsSUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQSxLQUFBO29CQUNBLEVBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO3dCQUNBLEdBQUEsSUFBQSxzQkFBQSxDQUFBO29CQUNBLENBQUE7b0JBQ0EsUUFBQSxJQUFBLGlCQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsR0FBQSxLQUFBLEdBQUEsV0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxnQkFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLEdBQUEsR0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBO2dCQUNBLEtBQUEsQ0FBQTtZQUNBLEtBQUEsT0FBQSxDQUFBO1lBQ0EsS0FBQSxVQUFBO2dCQUNBLElBQUEsSUFBQSxNQUFBLEdBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUEsS0FBQTtvQkFDQSxFQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTt3QkFDQSxHQUFBLElBQUEsb0JBQUEsQ0FBQTtvQkFDQSxDQUFBO29CQUNBLElBQUEsSUFBQSxlQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLEdBQUEsSUFBQSxHQUFBLFdBQUEsR0FBQSxHQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLElBQUEsT0FBQSxDQUFBO2dCQUNBLEtBQUEsQ0FBQTtZQUNBO2dCQUNBLElBQUEsSUFBQSxlQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsVUFBQSxHQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7Z0JBQ0EsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSwyQkFBQSxHQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxvQ0FBQSxHQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxpQkFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGlDQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUEsT0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtvQkFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7b0JBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7d0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtvQkFDQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO2dCQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtvQkFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7b0JBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7d0JBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtvQkFDQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7Z0JBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO29CQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtvQkFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUJBQUE7QUFBQSxDQTVLQSxBQTRLQSxDQTVLQSxTQUFBLEdBNEtBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FDOUtBO0lBQUEsOEJBQUE7SUFDQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsa0NBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLHVGQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsa0JBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsc0RBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsK0JBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQkFBQTtBQUFBLENBdENBLEFBc0NBLENBdENBLFNBQUEsR0FzQ0E7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7QUNuQ0E7SUFBQSwrQkFBQTtJQUVBLHFCQUNBLE1BQUEsRUFDQSxFQUFBO1FBRkEsWUFJQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLFNBQ0E7UUFFQSxZQUFBLEdBQUEsQ0FBQSxDQUFBOztJQUZBLENBQUE7SUFNQSxzQkFBQSw0QkFBQTthQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxHQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTs7O09BUkE7SUFVQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlDQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO1lBQ0EsR0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUVBLElBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSw0QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwwQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsdUZBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxpR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGtCQUFBO0FBQUEsQ0FsR0EsQUFrR0EsQ0FsR0EsYUFBQSxHQWtHQTtBQUVBO0lBQUE7UUFDQSxXQUFBLEdBQUEsVUFBQSxLQUFBO1lBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUE7UUFDQSxlQUFBLEdBQUEsVUFBQSxLQUFBO1lBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQUEsK0JBQUE7QUFBQSxDQVBBLEFBT0EsSUFBQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsRUFBQSxXQUFBLENBQUEsQ0FBQTtBQ3pHQTtJQUFBLDhCQUFBO0lBQ0Esb0JBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQVFBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLElBQUE7Z0JBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO29CQUNBLFFBQUEsQ0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsSUFBQTtnQkFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7b0JBQ0EsUUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxZQUFBLEVBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsY0FBQSxFQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFlBQUEsRUFBQTtZQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxpQkFBQSxTQUFBLFdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLHFHQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLHVCQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx5QkFBQSxHQUFBLFVBQUEsR0FBQTtRQUFBLGlCQVFBO1FBUEEsRUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxRQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsRUFBQSxVQUFBLElBQUE7WUFDQSxLQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSx3QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsZUFBQSxDQUFBLFVBQUEsR0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0Esb0NBQUEsR0FBQSxVQUFBLFFBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSx3QkFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBLFNBQUE7UUFBQSwwQkFBQSxFQUFBLGlCQUFBO1FBQ0EsSUFBQSxHQUFBLEdBQUEsWUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEdBQUEsR0FBQSxlQUFBLEdBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSw2QkFBQSxHQUFBLFVBQUEsSUFBQTtRQUFBLGlCQVdBO1FBVkEsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLEVBQUEsSUFBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLGNBQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsSUFBQSxjQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLElBQUEsS0FBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlDQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLG1DQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsdURBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxjQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUNBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxNQUFBLENBQUEscUNBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSx5REFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLGNBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxnQ0FBQSxHQUFBLFVBQUEsSUFBQTtRQUFBLGlCQVVBO1FBVEEsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLEVBQUEsSUFBQTtZQUNBLElBQUEsSUFBQSxLQUFBLENBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsbUJBQUEsR0FBQSxJQUFBLEdBQUEsT0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0NBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxrQ0FBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLDZCQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsUUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHFDQUFBLEdBQUEsVUFBQSxJQUFBO1FBQUEsaUJBTUE7UUFMQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsRUFBQSxJQUFBO1lBQ0EsSUFBQSxJQUFBLEtBQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSx5QkFBQSxHQUFBLElBQUEsR0FBQSxPQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsaUJBQUE7QUFBQSxDQXBMQSxBQW9MQSxDQXBMQSxTQUFBLEdBb0xBO0FBRUE7SUFBQSwyQ0FBQTtJQUFBO1FBQUEscUVBVUE7UUFUQSxVQUFBLEdBQUEsTUFBQSxDQUFBO1FBQ0EsV0FBQSxHQUFBLE1BQUEsQ0FBQTtRQUNBLGNBQUEsR0FBQSxVQUFBLENBQUE7UUFDQSxTQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsY0FBQSxHQUFBLEtBQUEsQ0FBQTtRQUNBLGVBQUEsR0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBLENBQUE7O0lBQ0EsQ0FBQTtJQUFBLDhCQUFBO0FBQUEsQ0FWQSxBQVVBLENBVkEsc0JBQUEsR0FVQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQSIsImZpbGUiOiJqcXVlcnkuZGlhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIOe8k+WtmOaVsOaNrlxyXG4gKi9cclxuY2xhc3MgQ2FjaGVVcmwge1xyXG4gICAgLyoqXHJcbiAgICAgKiDnvJPlrZjnmoTmlbDmja5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2NhY2hlRGF0YToge1t1cmw6IHN0cmluZ106IGFueX0gPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOe8k+WtmOeahOS6i+S7tlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZXZlbnQ6IHtbdXJsOiBzdHJpbmddOiBBcnJheTwoZGF0YTogYW55KSA9PiB2b2lkPn0gPSB7fTtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGhhc0RhdGEodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVEYXRhLmhhc093blByb3BlcnR5KHVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBoYXNFdmVudCh1cmw6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudC5oYXNPd25Qcm9wZXJ0eSh1cmwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5pWw5o2u6YCa6L+H5Zue6LCD6L+U5ZueXHJcbiAgICAgKiBAcGFyYW0gdXJsIFxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldERhdGEodXJsOiBzdHJpbmcsIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiB2b2lkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzRGF0YSh1cmwpKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMuX2NhY2hlRGF0YVt1cmxdKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5oYXNFdmVudCh1cmwpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50W3VybF0ucHVzaChjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZXZlbnRbdXJsXSA9IFtjYWxsYmFja107XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICAkLmdldEpTT04odXJsLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmNvZGUgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2Uuc2V0RGF0YSh1cmwsIGRhdGEuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1VSTCBFUlJPUiEgJyArIHVybCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7mlbDmja7lubblm57osINcclxuICAgICAqIEBwYXJhbSB1cmwgXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzZXREYXRhKHVybDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcclxuICAgICAgICB0aGlzLl9jYWNoZURhdGFbdXJsXSA9IGRhdGE7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0V2ZW50KHVybCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9ldmVudFt1cmxdLmZvckVhY2goY2FsbGJhY2s9PntcclxuICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50W3VybF07XHJcbiAgICB9XHJcbn0iLCJhYnN0cmFjdCBjbGFzcyBFdmUge1xyXG4gICAgcHVibGljIG9wdGlvbnM6IGFueTtcclxuXHJcbiAgICBwdWJsaWMgb24oZXZlbnQ6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zWydvbicgKyBldmVudF0gPSBjYWxsYmFjaztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGFzRXZlbnQoZXZlbnQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ29uJyArIGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJpZ2dlcihldmVudDogc3RyaW5nLCAuLi4gYXJnczogYW55W10pIHtcclxuICAgICAgICBsZXQgcmVhbEV2ZW50ID0gJ29uJyArIGV2ZW50O1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNFdmVudChldmVudCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3JlYWxFdmVudF0uY2FsbCh0aGlzLCAuLi5hcmdzKTtcclxuICAgIH1cclxufSIsImludGVyZmFjZSBEaWFsb2dCb3hPcHRpb24gZXh0ZW5kcyBEaWFsb2dDb250ZW50T3B0aW9uIHtcclxuICAgIGljbz86IHN0cmluZywgICAgICAgLy8g5qCH6aKY5qCP55qE5Zu+5qCHXHJcbiAgICB0aXRsZT86IHN0cmluZywgICAgIC8vIOagh+mimFxyXG4gICAgY2FuTW92ZT86IGJvb2xlYW4sICAgICAgICAvL+aYr+WQpuWFgeiuuOenu+WKqFxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dCb3ggZXh0ZW5kcyBEaWFsb2dDb250ZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nQm94T3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruWGheWuuVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5odG1sKHRoaXMuZ2V0SGVhZGVySHRtbCgpICsgdGhpcy5nZXRDb250ZW50SHRtbCgpKyB0aGlzLmdldEZvb3Rlckh0bWwoKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLm9wdGlvbnMudGFyZ2V0IHx8IERpYWxvZy4kd2luZG93O1xyXG4gICAgICAgIGxldCBtYXhXaWR0aCA9IHRhcmdldC53aWR0aCgpO1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuYm94LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IG1heEhlaWdodCA9IHRhcmdldC5oZWlnaHQoKTtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5ib3guaGVpZ2h0KCk7XHJcbiAgICAgICAgaWYgKG1heFdpZHRoID4gd2lkdGggJiYgbWF4SGVpZ2h0ID4gaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3NzKHtcclxuICAgICAgICAgICAgICAgIGxlZnQ6IChtYXhXaWR0aCAtIHdpZHRoKSAvIDIgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAobWF4SGVpZ2h0IC0gaGVpZ2h0KSAvIDIgKyAncHgnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnR5cGUgPSBEaWFsb2dUeXBlLnBhZ2U7XHJcbiAgICAgICAgdGhpcy5ib3guYWRkQ2xhc3MoXCJkaWFsb2ctcGFnZVwiKTtcclxuICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgLy8g54K55Ye75qCH6aKY5qCP56e75YqoXHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBsZXQgaXNNb3ZlID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IHgsIHk7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZChcIi5kaWFsb2ctaGVhZGVyIC5kaWFsb2ctdGl0bGVcIikubW91c2Vkb3duKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgaXNNb3ZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgeCA9IGUucGFnZVggLSBwYXJzZUludChpbnN0YW5jZS5ib3guY3NzKCdsZWZ0JykpO1xyXG4gICAgICAgICAgICB5ID0gZS5wYWdlWSAtIHBhcnNlSW50KGluc3RhbmNlLmJveC5jc3MoJ3RvcCcpKTtcclxuICAgICAgICAgICAgaW5zdGFuY2UuYm94LmZhZGVUbygyMCwgLjUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoZG9jdW1lbnQpLm1vdXNlbW92ZShmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNNb3ZlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5zdGFuY2UuYm94LmNzcyh7XHJcbiAgICAgICAgICAgICAgICB0b3A6IGUucGFnZVkgLSB5LFxyXG4gICAgICAgICAgICAgICAgbGVmdDogZS5wYWdlWCAtIHhcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KS5tb3VzZXVwKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpc01vdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLmJveCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuYm94LmZhZGVUbygnZmFzdCcsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLmJveCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gc3VwZXIuYmluZEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43orr7lsLrlr7hcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlc2l6ZSgpIHtcclxuICAgICAgICB0aGlzLnNldFByb3BlcnR5KCk7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dCb3hPcHRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBnZXRIZWFkZXJIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImRpYWxvZy1oZWFkZXJcIj48ZGl2IGNsYXNzPVwiZGlhbG9nLXRpdGxlXCI+JztcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmljbykge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8aSBjbGFzcz1cImZhIGZhLScgKyB0aGlzLm9wdGlvbnMuaWNvICsgJ1wiPjwvaT4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRpdGxlKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5vcHRpb25zLnRpdGxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaHRtbCArICc8L2Rpdj48aSBjbGFzcz1cImZhIGZhLWNsb3NlIGRpYWxvZy1jbG9zZVwiPjwvaT48L2Rpdj4nO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dCb3hPcHRpb24gZXh0ZW5kcyBEZWZhdWx0RGlhbG9nQ29udGVudE9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ0JveE9wdGlvbiB7XHJcbiAgICB0aXRsZTogc3RyaW5nID0gJ+aPkOekuic7XHJcbiAgICBjYW5Nb3ZlOiBib29sZWFuID0gdHJ1ZTtcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLmJveCwgRGlhbG9nQm94KTsiLCJhYnN0cmFjdCBjbGFzcyBEaWFsb2dDb3JlIGV4dGVuZHMgQm94IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIHB1YmxpYyBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5nZXREZWZhdWx0T3B0aW9uKCksIG9wdGlvbik7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnR5cGUgPSAgRGlhbG9nLnBhcnNlRW51bTxEaWFsb2dUeXBlPih0aGlzLm9wdGlvbnMudHlwZSwgRGlhbG9nVHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9wdGlvbnM6IERpYWxvZ09wdGlvbjtcclxuXHJcbiAgICBwcml2YXRlIF9zdGF0dXM6IERpYWxvZ1N0YXR1cyA9IERpYWxvZ1N0YXR1cy5jbG9zZWQ7XHJcblxyXG4gICAgcHVibGljIGdldCBzdGF0dXMoKTogRGlhbG9nU3RhdHVzIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc3RhdHVzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgc3RhdHVzKGFyZzogRGlhbG9nU3RhdHVzKSB7XHJcbiAgICAgICAgYXJnID0gRGlhbG9nLnBhcnNlRW51bTxEaWFsb2dTdGF0dXM+KGFyZywgRGlhbG9nU3RhdHVzKTtcclxuICAgICAgICAvLyDnm7jlkIznirbmgIHkuI3lgZrmk43kvZxcclxuICAgICAgICBpZiAodGhpcy5fc3RhdHVzID09IGFyZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN3aXRjaCAoYXJnKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nU3RhdHVzLnNob3c6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dCb3goKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ1N0YXR1cy5oaWRlOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlQm94KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dTdGF0dXMuY2xvc2luZzpcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2luZ0JveCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nU3RhdHVzLmNsb3NlZDpcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VCb3goKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJzdGF0dXMgZXJyb3I6XCIrIGFyZztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHByaXZhdGUgX2RpYWxvZ0JnOiBKUXVlcnk7ICAvLyDoh6rlt7HnmoTog4zmma/pga7nvalcclxuXHJcbiAgICBwcml2YXRlIF95OiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIGdldCB5KCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl95KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3kgPSB0aGlzLmJveC5vZmZzZXQoKS50b3AgLSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl95O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgeSh5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl95ID0geTtcclxuICAgICAgICB0aGlzLmNzcygndG9wJywgeSArICdweCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9oZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5faGVpZ2h0ID0gdGhpcy5ib3guaGVpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBoZWlnaHQoaGVpZ2h0OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5ib3guaGVpZ2h0KGhlaWdodCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmlLnlj5jnirbmgIFcclxuICAgICAqIEBwYXJhbSBzdGF0dXMgXHJcbiAgICAgKiBAcGFyYW0gaGFzRXZlbnQgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjaGFuZ2VTdGF0dXMoc3RhdHVzOiBEaWFsb2dTdGF0dXMsIGhhc0V2ZW50OiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoaGFzRXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RhdHVzID0gc3RhdHVzO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6buY6K6k6K6+572uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCk6IERpYWxvZ09wdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nT3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65bm25pi+56S65o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzaG93Qm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLnRyaWdnZXIoJ3Nob3cnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc2hvdyBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94LnNob3coKTtcclxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBEaWFsb2dTdGF0dXMuc2hvdztcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuW5tumakOiXj+aOp+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgaGlkZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdoaWRlJykpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2hpZGUgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJveC5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLmhpZGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliqjnlLvlhbPpl63vvIzmnInlhbPpl63liqjnlLtcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNsb3NpbmdCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJveCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2luZyBcclxuICAgICAgICB8fCB0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2VkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZhbHNlID09IHRoaXMudHJpZ2dlcignY2xvc2luZycpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbG9zaW5nIHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLmNsb3Npbmc7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLmJveC5hZGRDbGFzcygnZGlhbG9nLWNsb3NpbmcnKS5vbmUoJ3dlYmtpdEFuaW1hdGlvbkVuZCBtb3pBbmltYXRpb25FbmQgTVNBbmltYXRpb25FbmQgb2FuaW1hdGlvbmVuZCBhbmltYXRpb25lbmQnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2Uuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5jbG9zaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDpmLLmraLkuK3pgJTmlLnlj5jlvZPliY3nirbmgIFcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLmNsb3NlQm94KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIoOmZpOaOp+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2VCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJveCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnRyaWdnZXIoJ2Nsb3NlZCcpID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbG9zZWQgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBEaWFsb2dTdGF0dXMuY2xvc2VkO1xyXG4gICAgICAgIGlmICh0aGlzLl9kaWFsb2dCZykge1xyXG4gICAgICAgICAgICB0aGlzLl9kaWFsb2dCZy5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5fZGlhbG9nQmcgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5yZW1vdmVJdGVtKHRoaXMuaWQpOyBcclxuICAgICAgICB0aGlzLmJveC5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLmJveCA9IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWJzdHJhY3QgaW5pdCgpO1xyXG5cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb3JlKCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94ID0gJCgnPGRpdiBjbGFzcz1cImRpYWxvZyBkaWFsb2ctJysgRGlhbG9nVHlwZVt0aGlzLm9wdGlvbnMudHlwZV0gKydcIiBkYXRhLXR5cGU9XCJkaWFsb2dcIiBkaWFsb2ctaWQ9JysgdGhpcy5pZCArJz48L2Rpdj4nKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgY3JlYXRlQ29udGVudCgpOiB0aGlzO1xyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBzZXRQcm9wZXJ0eSgpOiB0aGlzO1xyXG5cclxuXHJcbiAgICBwdWJsaWMgY3NzKGtleTogYW55LCB2YWx1ZT86IHN0cmluZ3wgbnVtYmVyKTogSlF1ZXJ5IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ib3guY3NzKGtleSwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzaG93KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gRGlhbG9nU3RhdHVzLnNob3c7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhpZGUoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBEaWFsb2dTdGF0dXMuaGlkZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xvc2UoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBEaWFsb2dTdGF0dXMuY2xvc2luZztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9nZ2xlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuaGlkZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3coKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluebuOWQjOexu+Wei+W8ueWHuuahhueahOacgOS4iumdolxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGlhbG9nVG9wKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgbGV0IHk7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBEaWFsb2cubWFwKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5vcHRpb25zLnR5cGUgIT0gdGhpcy5vcHRpb25zLnR5cGUgfHwgaXRlbS5pZCA9PSBpbnN0YW5jZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgheSB8fCBpdGVtLnkgPCB5KSB7XHJcbiAgICAgICAgICAgICAgICB5ID0gaXRlbS55O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGlhbG9nQm90dG9tKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgbGV0IHk7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBEaWFsb2cubWFwKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5vcHRpb25zLnR5cGUgIT0gdGhpcy5vcHRpb25zLnR5cGUgfHwgaXRlbS5pZCA9PSBpbnN0YW5jZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBib3R0b20gPSBpdGVtLnkgKyBpdGVtLmhlaWdodDtcclxuICAgICAgICAgICAgaWYgKCF5IHx8IGJvdHRvbSA+IHkpIHtcclxuICAgICAgICAgICAgICAgIHkgPSBib3R0b207XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIHByaXZhdGUgX2dldEJvdHRvbSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgkKHdpbmRvdykuaGVpZ2h0KCkgKiAuMzMgLSB0aGlzLmhlaWdodCAvIDIsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFRvcCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgkKHdpbmRvdykuaGVpZ2h0KCkgLyAyIC0gdGhpcy5oZWlnaHQgLyAyLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRMZWZ0KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KCQod2luZG93KS53aWR0aCgpIC8gMiAtIHRoaXMuYm94LndpZHRoKCkgLyAyLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRSaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgkKHdpbmRvdykud2lkdGgoKSAvIDIgLSB0aGlzLmJveC53aWR0aCgpIC8gMiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0V2lkdGgoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgd2lkdGggPSBEaWFsb2cuJHdpbmRvdy53aWR0aCgpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMud2lkdGggPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB3aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHdpZHRoICogdGhpcy5vcHRpb25zLndpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldEhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSBEaWFsb2cuJHdpbmRvdy5oZWlnaHQoKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmhlaWdodCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhlaWdodCAqIHRoaXMub3B0aW9ucy5oZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0TGVmdFRvcChkaXJlY3Rpb246IERpYWxvZ0RpcmVjdGlvbiwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGJveFdpZHRoOiBudW1iZXIsIGJveEhlaWdodDogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ubGVmdFRvcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbMCwgMF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnRvcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbKGJveEhlaWdodCAtIHdpZHRoKSAvIDIsIDBdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodFRvcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbYm94SGVpZ2h0IC0gd2lkdGgsIDBdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbYm94SGVpZ2h0IC0gd2lkdGgsIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0Qm90dG9tOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtib3hIZWlnaHQgLSB3aWR0aCwgYm94SGVpZ2h0IC0gaGVpZ2h0XTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24uYm90dG9tOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsoYm94SGVpZ2h0IC0gd2lkdGgpIC8gMiwgYm94SGVpZ2h0IC0gaGVpZ2h0XTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ubGVmdEJvdHRvbTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbMCwgYm94SGVpZ2h0IC0gaGVpZ2h0XTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ubGVmdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbMCwgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24uY2VudGVyOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsoYm94SGVpZ2h0IC0gd2lkdGgpIC8gMiwgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBEZWZhdWx0RGlhbG9nT3B0aW9uIGltcGxlbWVudHMgRGlhbG9nT3B0aW9uIHtcclxuICAgIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JztcclxuICAgIHR5cGU/OiBEaWFsb2dUeXBlID0gRGlhbG9nVHlwZS50aXA7XHJcbiAgICBjYW5Nb3ZlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIG9uZG9uZTogRnVuY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICB9XHJcbn0iLCJjbGFzcyBEaWFsb2cge1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgbWV0aG9kczoge1t0eXBlOiBudW1iZXJdOiBGdW5jdGlvbn0gPSB7fTtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZGF0YToge1tpZDogbnVtYmVyXTogRGlhbG9nQ29yZX0gPSB7fTtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZ3VpZDogbnVtYmVyID0gMDsgLy8gaWTmoIforrBcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfdGlwRGF0YTogQXJyYXk8bnVtYmVyPiA9IFtdO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9kaWFsb2dCZzogSlF1ZXJ5O1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9iZ0xvY2s6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyAkd2luZG93ID0gJCh3aW5kb3cpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yib6YCg5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gb3B0aW9uIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShvcHRpb24/OiBEaWFsb2dPcHRpb24pOiBEaWFsb2dDb3JlIHtcclxuICAgICAgICBpZiAoIW9wdGlvbi50eXBlKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbi50eXBlID0gRGlhbG9nVHlwZS50aXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wdGlvbi50eXBlID0gdGhpcy5wYXJzZUVudW08RGlhbG9nVHlwZT4ob3B0aW9uLnR5cGUsIERpYWxvZ1R5cGUpO1xyXG4gICAgICAgIGxldCBtZXRob2QgPSB0aGlzLmdldE1ldGhvZChvcHRpb24udHlwZSk7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBuZXcgbWV0aG9kKG9wdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBwYXJzZUVudW08VD4odmFsOiBhbnksIHR5cGU6IGFueSk6IFQge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlW3ZhbF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmj5DnpLpcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpbWUgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgdGlwKGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ1RpcE9wdGlvbiwgdGltZTogbnVtYmVyID0gMjAwMCk6IERpYWxvZ0NvcmUge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge2NvbnRlbnQ6IGNvbnRlbnQsIHRpbWU6IHRpbWV9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLnRpcDtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUoY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5raI5oGvXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSB0aW1lIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG1lc3NhZ2UoY29udGVudDogc3RyaW5nIHwgRGlhbG9nTWVzc2FnZU9wdGlvbiwgdGltZTogbnVtYmVyID0gMjAwMCk6IERpYWxvZ0NvcmUge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge2NvbnRlbnQ6IGNvbnRlbnQsIHRpbWU6IHRpbWV9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLm1lc3NhZ2U7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9vVxyXG4gICAgICogQHBhcmFtIHRpbWUgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbG9hZGluZyh0aW1lOiBudW1iZXIgfCBEaWFsb2dPcHRpb24gPSAwKTogRGlhbG9nQ29yZSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aW1lICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRpbWUgPSB7dGltZTogdGltZX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRpbWUudHlwZSA9IERpYWxvZ1R5cGUubG9hZGluZztcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUodGltZSkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YaF5a655by556qXXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSBoYXNZZXMgXHJcbiAgICAgKiBAcGFyYW0gaGFzTm8gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY29udGVudChjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dPcHRpb24sIGhhc1llcz86IGJvb2xlYW4sIGhhc05vPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgIGhhc1llczogaGFzWWVzLFxyXG4gICAgICAgICAgICAgICAgaGFzTm86IGhhc05vXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUuY29udGVudDtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUoY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pmu6YCa5by556qXXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSB0aXRsZSBcclxuICAgICAqIEBwYXJhbSBoYXNZZXMgXHJcbiAgICAgKiBAcGFyYW0gaGFzTm8gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYm94KGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ09wdGlvbiwgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgICAgIGhhc05vOiBoYXNOb1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLmJveDtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUoY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6KGo5qC85by556qXXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSB0aXRsZSBcclxuICAgICAqIEBwYXJhbSBkb25lIFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBmb3JtKGNvbnRlbnQ6IGFueSwgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonLCBkb25lPzogRnVuY3Rpb24sIGhhc1llcz86IGJvb2xlYW4sIGhhc05vPzogYm9vbGVhbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIHR5cGU6IERpYWxvZ1R5cGUuZm9ybSxcclxuICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgaGFzTm86IGhhc05vLFxyXG4gICAgICAgICAgICBvbmRvbmU6IGRvbmVcclxuICAgICAgICB9KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpobXpnaLlvLnnqpdcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBwYWdlKGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ09wdGlvbiwgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgICAgIGhhc05vOiBoYXNOb1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLnBhZ2U7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOahjOmdouaPkOmGklxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gaWNvbiBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBub3RpZnkodGl0bGU6IHN0cmluZyAgfCBEaWFsb2dPcHRpb24gPSAn6YCa55+lJywgY29udGVudDogc3RyaW5nID0gJycsIGljb246IHN0cmluZyA9ICcnKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aXRsZSAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aXRsZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICBpY286IGljb25cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGl0bGUudHlwZSA9IERpYWxvZ1R5cGUubm90aWZ5O1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZSh0aXRsZSkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhZGRJdGVtKGVsZW1lbnQ6IERpYWxvZ0NvcmUpIHtcclxuICAgICAgICB0aGlzLl9kYXRhWysrdGhpcy5fZ3VpZF0gPSBlbGVtZW50O1xyXG4gICAgICAgIGVsZW1lbnQuaWQgPSB0aGlzLl9ndWlkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzSXRlbShpZDogbnVtYmVyIHwgc3RyaW5nID0gdGhpcy5fZ3VpZCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGlkICsgJycpXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQoaWQ6IG51bWJlciB8IHN0cmluZyA9IHRoaXMuX2d1aWQpIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IFwiZXJyb3I6XCIgKyBpZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk5Yig6Zmk5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gaWQgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlSXRlbShpZDogbnVtYmVyID0gdGhpcy5fZ3VpZCkge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RhdGFbaWRdLmNsb3NlKCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2RhdGFbaWRdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yig6Zmk5omA5pyJ5by55Ye65qGGXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlKCkge1xyXG4gICAgICAgIHRoaXMubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgaXRlbS5jbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5b6q546v5omA5pyJ5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbWFwKGNhbGxiYWNrOiAoaXRlbTogRGlhbG9nQ29yZSkgPT4gYW55KSB7XHJcbiAgICAgICAgZm9yKGxldCBpZCBpbiB0aGlzLl9kYXRhKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGNhbGxiYWNrKHRoaXMuX2RhdGFbaWRdKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S66YGu572pXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2hvd0JnKHRhcmdldDogSlF1ZXJ5ID0gJChkb2N1bWVudC5ib2R5KSwgaXNQdWJsaWM6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBpZiAoIXRoaXMuX2RpYWxvZ0JnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnID0gJCgnPGRpdiBjbGFzcz1cImRpYWxvZy1iZ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLl9kaWFsb2dCZy5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDmm7TmlLnpga7nvannmoTkvY3nva5cclxuICAgICAgICB0YXJnZXQuYXBwZW5kKHRoaXMuX2RpYWxvZ0JnKTtcclxuICAgICAgICB0aGlzLl9kaWFsb2dCZy50b2dnbGVDbGFzcygnZGlhbG9nLWJnLXByaXZhdGUnLCAhaXNQdWJsaWMpO1xyXG4gICAgICAgIHRoaXMuX2JnTG9jayArKztcclxuICAgICAgICB0aGlzLl9kaWFsb2dCZy5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpmpDol4/pga7nvalcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjbG9zZUJnKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fZGlhbG9nQmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9iZ0xvY2stLTtcclxuICAgICAgICBpZiAodGhpcy5fYmdMb2NrID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RpYWxvZ0JnLnVuYmluZCgpO1xyXG4gICAgICAgIHRoaXMuX2RpYWxvZ0JnLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGFkZE1ldGhvZCh0eXBlOiBEaWFsb2dUeXBlLCBkaWFsb2c6IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5tZXRob2RzW3R5cGVdID0gZGlhbG9nO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzTWV0aG9kKHR5cGU6IERpYWxvZ1R5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXRob2RzLmhhc093blByb3BlcnR5KHR5cGUudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRNZXRob2QodHlwZTogRGlhbG9nVHlwZSk6IEZ1bmN0aW9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXRob2RzW3R5cGVdO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIOW8ueWHuuahhuexu+Wei1xyXG4gKi9cclxuZW51bSBEaWFsb2dUeXBlIHtcclxuICAgIHRpcCxcclxuICAgIG1lc3NhZ2UsXHJcbiAgICBub3RpZnksXHJcbiAgICBwb3AsXHJcbiAgICBsb2FkaW5nLFxyXG4gICAgc2VsZWN0LFxyXG4gICAgaW1hZ2UsXHJcbiAgICBkaXNrLFxyXG4gICAgZm9ybSxcclxuICAgIGNvbnRlbnQsXHJcbiAgICBib3gsXHJcbiAgICBwYWdlXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlvLnlh7rmoYbkvY3nva5cclxuICovXHJcbmVudW0gRGlhbG9nRGlyZWN0aW9uIHtcclxuICAgIHRvcCxcclxuICAgIHJpZ2h0LFxyXG4gICAgYm90dG9tLFxyXG4gICAgbGVmdCxcclxuICAgIGNlbnRlcixcclxuICAgIGxlZnRUb3AsXHJcbiAgICByaWdodFRvcCxcclxuICAgIHJpZ2h0Qm90dG9tLFxyXG4gICAgbGVmdEJvdHRvbVxyXG59XHJcblxyXG4vKipcclxuICog5by55Ye65qGG54q25oCBXHJcbiAqL1xyXG5lbnVtIERpYWxvZ1N0YXR1cyB7XHJcbiAgICBoaWRlLFxyXG4gICAgc2hvdyxcclxuICAgIGNsb3NpbmcsICAgLy/lhbPpl63kuK1cclxuICAgIGNsb3NlZCAgICAvL+W3suWFs+mXrVxyXG59XHJcblxyXG5lbnVtIERpYWxvZ0Rpc2tUeXBlIHtcclxuICAgIGZpbGUsXHJcbiAgICBkaXJlY3RvcnlcclxufSIsImNsYXNzIERpYWxvZ1BsdWdpbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICAgIHB1YmxpYyBvcHRpb24/OiBEaWFsb2dPcHRpb25cclxuICAgICkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIWluc3RhbmNlLmRpYWxvZykge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuZGlhbG9nID0gRGlhbG9nLmNyZWF0ZShpbnN0YW5jZS5fcGFyc2VPcHRpb24oJCh0aGlzKSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmRpYWxvZy5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpYWxvZzogRGlhbG9nQ29yZTtcclxuXHJcbiAgICBwcml2YXRlIF9wYXJzZU9wdGlvbihlbGVtZW50OiBKUXVlcnkpIHtcclxuICAgICAgICBsZXQgb3B0aW9uOiBEaWFsb2dPcHRpb24gPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb24pO1xyXG4gICAgICAgIG9wdGlvbi50eXBlID0gRGlhbG9nLnBhcnNlRW51bTxEaWFsb2dUeXBlPihlbGVtZW50LmF0dHIoJ2RpYWxvZy10eXBlJykgfHwgdGhpcy5vcHRpb24udHlwZSwgRGlhbG9nVHlwZSk7XHJcbiAgICAgICAgb3B0aW9uLmNvbnRlbnQgPSBlbGVtZW50LmF0dHIoJ2RpYWxvZy1jb250ZW50JykgfHwgdGhpcy5vcHRpb24uY29udGVudDtcclxuICAgICAgICBvcHRpb24udXJsID0gZWxlbWVudC5hdHRyKCdkaWFsb2ctdXJsJykgfHwgdGhpcy5vcHRpb24udXJsO1xyXG4gICAgICAgIG9wdGlvbi50aW1lID0gcGFyc2VJbnQoZWxlbWVudC5hdHRyKCdkaWFsb2ctdGltZScpKSB8fCB0aGlzLm9wdGlvbi50aW1lO1xyXG4gICAgICAgIGlmIChvcHRpb24udHlwZSA9PSBEaWFsb2dUeXBlLnBvcCAmJiAhb3B0aW9uLnRhcmdldCkge1xyXG4gICAgICAgICAgICBvcHRpb24udGFyZ2V0ID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9wdGlvbjtcclxuICAgIH1cclxufVxyXG5cclxuOyhmdW5jdGlvbigkOiBhbnkpIHtcclxuICAgICQuZm4uZGlhbG9nID0gZnVuY3Rpb24ob3B0aW9uID86IERpYWxvZ09wdGlvbikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nUGx1Z2luKHRoaXMsIG9wdGlvbik7XHJcbiAgICB9O1xyXG59KShqUXVlcnkpOyIsImludGVyZmFjZSBEaWFsb2dUaXBPcHRpb24gZXh0ZW5kcyBEaWFsb2dPcHRpb24ge1xyXG4gICAgdGltZT86IG51bWJlciwgICAgICAgICAvL+aYvuekuuaXtumXtFxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dUaXAgZXh0ZW5kcyBEaWFsb2dDb3JlIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3B0aW9uczogRGlhbG9nVGlwT3B0aW9uO1xyXG5cclxuICAgIHByaXZhdGUgX3RpbWVIYW5kbGU6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuICAgICAgICBEaWFsb2cuYWRkSXRlbSh0aGlzKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUNvcmUoKS5jcmVhdGVDb250ZW50KClcclxuICAgICAgICAuYXBwZW5kUGFyZW50KCkuc2V0UHJvcGVydHkoKS5iaW5kRXZlbnQoKVxyXG4gICAgICAgIC5hZGRUaW1lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nVGlwT3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7lhoXlrrlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3gudGV4dCh0aGlzLm9wdGlvbnMuY29udGVudCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDliLDlrrnlmajkuIpcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGFwcGVuZFBhcmVudCgpOiB0aGlzIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy50YXJnZXQpIHtcclxuICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5hcHBlbmQodGhpcy5ib3gpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnRhcmdldC5hcHBlbmQodGhpcy5ib3gpO1xyXG4gICAgICAgIHRoaXMuYm94LmFkZENsYXNzKFwiZGlhbG9nLXByaXZhdGVcIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7lsZ7mgKdcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIGxldCBtYXhXaWR0aCA9IERpYWxvZy4kd2luZG93LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5ib3gud2lkdGgoKTtcclxuICAgICAgICB0aGlzLnkgPSAodGhpcy5nZXREaWFsb2dUb3AoKSB8fCAoRGlhbG9nLiR3aW5kb3cuaGVpZ2h0KCkgKiAwLjY4ICsgMzApKSAtIDMwIC0gdGhpcy5oZWlnaHQ7IFxyXG4gICAgICAgIHRoaXMuY3NzKCdsZWZ0JywgKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog57uR5a6a5LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLmJveCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeiuvuWwuuWvuFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVzaXplKCkge1xyXG4gICAgICAgIGxldCBtYXhXaWR0aCA9IERpYWxvZy4kd2luZG93LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5ib3gud2lkdGgoKTtcclxuICAgICAgICB0aGlzLmNzcygnbGVmdCcsIChtYXhXaWR0aCAtIHdpZHRoKSAvIDIgKyAncHgnKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhZGRUaW1lKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudGltZSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLl90aW1lSGFuZGxlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UuX3RpbWVIYW5kbGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmNsb3NlKCk7XHJcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zLnRpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzdG9wVGltZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3RpbWVIYW5kbGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZUhhbmRsZSk7XHJcbiAgICAgICAgdGhpcy5fdGltZUhhbmRsZSA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2luZ0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXN1cGVyLmNsb3NpbmdCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3RvcFRpbWUoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2VCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zZUJveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VPdGhlcigpO1xyXG4gICAgICAgIHRoaXMuc3RvcFRpbWUoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2hhbmdlT3RoZXIoKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBEaWFsb2cubWFwKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5vcHRpb25zLnR5cGUgIT0gRGlhbG9nVHlwZS50aXAgfHwgaXRlbS55ID49IGluc3RhbmNlLnkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpdGVtLnkgKz0gaW5zdGFuY2UuaGVpZ2h0ICsgMzA7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dUaXBPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dUaXBPcHRpb24ge1xyXG4gICAgdGltZTogbnVtYmVyID0gMjAwMDtcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLnRpcCwgRGlhbG9nVGlwKTsiLCJpbnRlcmZhY2UgRGlhbG9nTWVzc2FnZU9wdGlvbiBleHRlbmRzIERpYWxvZ1RpcE9wdGlvbiB7XHJcblxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dNZXNzYWdlIGV4dGVuZHMgRGlhbG9nVGlwIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy55ID0gKHRoaXMuZ2V0RGlhbG9nQm90dG9tKCkgfHwgKERpYWxvZy4kd2luZG93LmhlaWdodCgpICogMC4xIC0gMzApKSArIDMwO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNoYW5nZU90aGVyKCkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgRGlhbG9nLm1hcChpdGVtID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucy50eXBlICE9IERpYWxvZ1R5cGUubWVzc2FnZSB8fCBpdGVtLnkgPD0gaW5zdGFuY2UueSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGl0ZW0ueSAtPSBpbnN0YW5jZS5oZWlnaHQgKyAzMDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLm1lc3NhZ2UsIERpYWxvZ01lc3NhZ2UpOyIsImludGVyZmFjZSBEaWFsb2dOb3RpZnlPcHRpb24gZXh0ZW5kcyBEaWFsb2dUaXBPcHRpb24ge1xyXG4gICAgdGl0bGU/OiBzdHJpbmcsXHJcbiAgICBpY28/OiBzdHJpbmdcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nTm90aWZ5IGV4dGVuZHMgRGlhbG9nVGlwIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ05vdGlmeU9wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9wdGlvbnM6IERpYWxvZ05vdGlmeU9wdGlvbjtcclxuXHJcbiAgICBwdWJsaWMgbm90aWZ5OiBOb3RpZmljYXRpb247IC8vIOezu+e7n+mAmuefpVxyXG5cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6buY6K6k6K6+572uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ05vdGlmeU9wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzaG93Qm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLm5vdGlmeSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5hZGRJdGVtKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2NyZWF0ZU5vdGlmeSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBoaWRlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNsb3NlQm94KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NpbmdCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvc2VCb3goKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2VCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5jbG9zaW5nIFxyXG4gICAgICAgIHx8IHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5jbG9zZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdjbG9zZWQnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2VkIHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY2xvc2VOb3RpZnkoKTtcclxuICAgICAgICBEaWFsb2cucmVtb3ZlSXRlbSh0aGlzLmlkKTsgXHJcbiAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGlhbG9nU3RhdHVzLmNsb3NlZCk7XHJcbiAgICAgICAgdGhpcy5zdG9wVGltZSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZU5vdGlmeSgpIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIGlmIChcIk5vdGlmaWNhdGlvblwiIGluIHdpbmRvdykge1xyXG4gICAgICAgICAgICBsZXQgYXNrID0gTm90aWZpY2F0aW9uLnJlcXVlc3RQZXJtaXNzaW9uKCk7XHJcbiAgICAgICAgICAgIGFzay50aGVuKHBlcm1pc3Npb24gPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlcm1pc3Npb24gIT09IFwiZ3JhbnRlZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+aCqOeahOa1j+iniOWZqOaUr+aMgeS9huacquW8gOWQr+ahjOmdouaPkOmGku+8gScpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5ub3RpZnkgPSBuZXcgTm90aWZpY2F0aW9uKGluc3RhbmNlLm9wdGlvbnMudGl0bGUsIHtcclxuICAgICAgICAgICAgICAgICAgICBib2R5OiBpbnN0YW5jZS5vcHRpb25zLmNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogaW5zdGFuY2Uub3B0aW9ucy5pY28sXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLm5vdGlmeS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnRyaWdnZXIoJ2RvbmUnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygn5oKo55qE5rWP6KeI5Zmo5LiN5pSv5oyB5qGM6Z2i5o+Q6YaS77yBJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY2xvc2VOb3RpZnkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm5vdGlmeSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubm90aWZ5LmNsb3NlKCk7XHJcbiAgICAgICAgdGhpcy5ub3RpZnkgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nTm90aWZ5T3B0aW9uIGV4dGVuZHMgRGVmYXVsdERpYWxvZ1RpcE9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ05vdGlmeU9wdGlvbiB7XHJcbiAgICB0aXRsZTogc3RyaW5nID0gJ+aPkOekuic7XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5ub3RpZnksIERpYWxvZ05vdGlmeSk7IiwiaW50ZXJmYWNlIERpYWxvZ1BvcE9wdGlvbiBleHRlbmRzIERpYWxvZ1RpcE9wdGlvbiB7XHJcbiAgICBkaXJlY3Rpb24/OiBEaWFsb2dEaXJlY3Rpb24gfCBzdHJpbmcgfCBudW1iZXIsXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ1BvcCBleHRlbmRzIERpYWxvZ1RpcCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ1BvcE9wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9IERpYWxvZy5wYXJzZUVudW08RGlhbG9nRGlyZWN0aW9uPih0aGlzLm9wdGlvbnMuZGlyZWN0aW9uLCBEaWFsb2dEaXJlY3Rpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuX3NldFBvcFByb3BlcnR5KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDliLDlrrnlmajkuIpcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGFwcGVuZFBhcmVudCgpOiB0aGlzIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0aGlzLmJveCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRSYW5kb21EaXJlY3Rpb24oKTogRGlhbG9nRGlyZWN0aW9uIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIDgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zZXRQb3BQcm9wZXJ0eSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9IHRoaXMuX2dldFJhbmRvbURpcmVjdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJveC5hZGRDbGFzcygnZGlhbG9nLXBvcC0nICsgRGlhbG9nRGlyZWN0aW9uW3RoaXMub3B0aW9ucy5kaXJlY3Rpb25dKTtcclxuICAgICAgICBsZXQgb2ZmZXN0ID0gdGhpcy5vcHRpb25zLnRhcmdldC5vZmZzZXQoKTtcclxuICAgICAgICBsZXQgW3gsIHldID0gdGhpcy5fZ2V0UG9wTGVmdFRvcChEaWFsb2cucGFyc2VFbnVtPERpYWxvZ0RpcmVjdGlvbj4odGhpcy5vcHRpb25zLmRpcmVjdGlvbiwgRGlhbG9nQ29yZSksIHRoaXMuYm94Lm91dGVyV2lkdGgoKSwgdGhpcy5ib3gub3V0ZXJIZWlnaHQoKSwgb2ZmZXN0LmxlZnQsIG9mZmVzdC50b3AsIHRoaXMub3B0aW9ucy50YXJnZXQub3V0ZXJXaWR0aCgpLCB0aGlzLm9wdGlvbnMudGFyZ2V0Lm91dGVySGVpZ2h0KCkpO1xyXG4gICAgICAgIHRoaXMuYm94LmNzcyh7XHJcbiAgICAgICAgICAgIGxlZnQ6IHggKyAncHgnLFxyXG4gICAgICAgICAgICB0b3A6IHkgKyAncHgnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UG9wTGVmdFRvcChkaXJlY3Rpb246IERpYWxvZ0RpcmVjdGlvbiwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyLCBib3hXaWR0aDogbnVtYmVyLCBib3hIZWlnaHQ6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIGxldCBzcGFjZSA9IDMwOyAvLyDnqbrpmplcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodFRvcDpcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ggKyBib3hXaWR0aCArIHNwYWNlLCB5ICsgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHRCb3R0b206XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmJvdHRvbTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbeCArIChib3hXaWR0aCAtIHdpZHRoKSAvIDIsICB5ICsgYm94SGVpZ2h0ICsgc3BhY2VdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0Qm90dG9tOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt4IC0gd2lkdGggLSBzcGFjZSwgeSArIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmNlbnRlcjpcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ubGVmdFRvcDpcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24udG9wOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt4ICsgKGJveFdpZHRoIC0gd2lkdGgpIC8gMiwgeSAtIGhlaWdodCAtIHNwYWNlXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5wb3AsIERpYWxvZ1BvcCk7IiwiaW50ZXJmYWNlIERpYWxvZ0xvYWRpbmdPcHRpb24gZXh0ZW5kcyBEaWFsb2dUaXBPcHRpb24ge1xyXG4gICAgY291bnQ/OiBudW1iZXI7XHJcbiAgICBleHRyYT86IHN0cmluZ1xyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dMb2FkaW5nIGV4dGVuZHMgRGlhbG9nVGlwIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nTG9hZGluZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nTG9hZGluZ09wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94Lmh0bWwodGhpcy5fZ2V0TG9hZGluZygpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICBsZXQgdGFyZ2V0ID0gdGhpcy5vcHRpb25zLnRhcmdldCB8fCBEaWFsb2cuJHdpbmRvdztcclxuICAgICAgICBsZXQgbWF4V2lkdGggPSB0YXJnZXQud2lkdGgoKTtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmJveC53aWR0aCgpO1xyXG4gICAgICAgIGxldCBtYXhIZWlnaHQgPSB0YXJnZXQuaGVpZ2h0KCk7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMuYm94LmhlaWdodCgpO1xyXG4gICAgICAgIHRoaXMuY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcsXHJcbiAgICAgICAgICAgIHRvcDogKG1heEhlaWdodCAtIGhlaWdodCkgLyAyICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldExvYWRpbmcoKSB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICBsZXQgbnVtID0gdGhpcy5vcHRpb25zLmNvdW50O1xyXG4gICAgICAgIGZvcig7IG51bSA+IDA7IG51bSAtLSkge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8c3Bhbj48L3NwYW4+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJysgdGhpcy5vcHRpb25zLmV4dHJhICsnXCI+JysgaHRtbCArJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNob3dCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFzdXBlci5zaG93Qm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy50YXJnZXQpIHtcclxuICAgICAgICAgICAgRGlhbG9nLnNob3dCZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLnNob3dCZyh0aGlzLm9wdGlvbnMudGFyZ2V0LCBmYWxzZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGhpZGVCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFzdXBlci5oaWRlQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zaW5nQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghc3VwZXIuY2xvc2luZ0JveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2VCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xyXG4gICAgICAgIGlmICghc3VwZXIuY2xvc2VCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdGF0dXMgIT0gRGlhbG9nU3RhdHVzLmNsb3NpbmcpIHtcclxuICAgICAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ0xvYWRpbmdPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dMb2FkaW5nT3B0aW9uIHtcclxuICAgIGV4dHJhOiBzdHJpbmcgPSAnbG9hZGluZyc7ICAgICAgLy/pop3lpJbnmoRjbGFzc1xyXG4gICAgY291bnQ6IG51bWJlciA9IDU7XHJcbiAgICB0aW1lOiBudW1iZXIgPSAwO1xyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUubG9hZGluZywgRGlhbG9nTG9hZGluZyk7XHJcblxyXG4iLCJpbnRlcmZhY2UgRGlhbG9nQnV0dG9uIHtcclxuICAgIGNvbnRlbnQ6IHN0cmluZyxcclxuICAgIHRhZz86IHN0cmluZ1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRGlhbG9nQ29udGVudE9wdGlvbiBleHRlbmRzIERpYWxvZ09wdGlvbiB7XHJcbiAgICB1cmw/OiBzdHJpbmcsICAgICAgIC8vIGFqYXjor7fmsYJcclxuICAgIGJ1dHRvbj86IHN0cmluZyB8IHN0cmluZ1tdfCBEaWFsb2dCdXR0b25bXSxcclxuICAgIGhhc1llcz86IGJvb2xlYW4gfCBzdHJpbmc7IC8vIOaYr+WQpuacieehruWumuaMiemSrlxyXG4gICAgaGFzTm8/OiBib29sZWFuIHwgc3RyaW5nOyAgLy8g5piv5ZCm5pyJ5Y+W5raI5oyJ6ZKuXHJcbiAgICBvbmRvbmU/OiBGdW5jdGlvbiAgICAgICAgLy/ngrnnoa7lrprml7bop6blj5FcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nQ29udGVudCBleHRlbmRzIERpYWxvZ0NvcmUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nQ29udGVudE9wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuY29udGVudCAmJiB0aGlzLm9wdGlvbnMudXJsKSB7XHJcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgJC5nZXQodGhpcy5vcHRpb25zLnVybCwgZnVuY3Rpb24oaHRtbCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2Uub3B0aW9ucy5jb250ZW50ID0gaHRtbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5pbml0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pc0xvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTsgLy/liqDovb3kuK0g5pi+56S65pe25YCZ5Ye6546w5Yqg6L295Yqo55S7XHJcblxyXG4gICAgcHJpdmF0ZSBfbG9hZGluZ0RpYWxvZzogRGlhbG9nQ29yZTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlzTG9hZGluZygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNMb2FkaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgaXNMb2FkaW5nKGFyZzogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IGFyZztcclxuICAgICAgICB0aGlzLl90b2dnbGVMb2FkaW5nKCk7XHJcbiAgICAgICAgLy8g5Yqg6L295a6M5oiQ5pe25pi+56S65YWD57SgXHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0xvYWRpbmcgJiYgdGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLnNob3cpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93Qm94KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65Yqg6L295Yqo55S7XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3RvZ2dsZUxvYWRpbmcoYXJnOiBEaWFsb2dTdGF0dXMgPSB0aGlzLnN0YXR1cykge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0xvYWRpbmcgfHwgYXJnICE9IERpYWxvZ1N0YXR1cy5zaG93KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9sb2FkaW5nRGlhbG9nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkaW5nRGlhbG9nLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkaW5nRGlhbG9nID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdEaWFsb2cpIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGluZ0RpYWxvZy5zaG93KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbG9hZGluZ0RpYWxvZyA9IERpYWxvZy5sb2FkaW5nKCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0KCkge1xyXG4gICAgICAgIERpYWxvZy5hZGRJdGVtKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQ29yZSgpLmNyZWF0ZUNvbnRlbnQoKVxyXG4gICAgICAgIC5hcHBlbmRQYXJlbnQoKS5zZXRQcm9wZXJ0eSgpLmJpbmRFdmVudCgpO1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuc2hvdykge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dCb3goKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nQ29udGVudE9wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5YaF5a65XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94Lmh0bWwodGhpcy5nZXRDb250ZW50SHRtbCgpKyB0aGlzLmdldEZvb3Rlckh0bWwoKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDliLDlrrnlmajkuIpcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGFwcGVuZFBhcmVudCgpOiB0aGlzIHtcclxuICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0aGlzLmJveCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7lsZ7mgKdcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog57uR5a6a5LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2cteWVzXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2RvbmUnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLWNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldENvbnRlbnRIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGNvbnRlbnQgPSB0aGlzLm9wdGlvbnMuY29udGVudDtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJkaWFsb2ctYm9keVwiPicrIGNvbnRlbnQgKyc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRGb290ZXJIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuaGFzWWVzICYmICF0aGlzLm9wdGlvbnMuaGFzTm8gJiYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuYnV0dG9uID09ICdvYmplY3QnICYmIHRoaXMub3B0aW9ucy5idXR0b24gaW5zdGFuY2VvZiBBcnJheSAmJiB0aGlzLm9wdGlvbnMuYnV0dG9uLmxlbmd0aCA9PSAwKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJkaWFsb2ctZm9vdGVyXCI+JztcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmhhc1llcykge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGlhbG9nLXllc1wiPicrICh0eXBlb2YgdGhpcy5vcHRpb25zLmhhc1llcyA9PSAnc3RyaW5nJyA/IHRoaXMub3B0aW9ucy5oYXNZZXMgOiAn56Gu6K6kJykgKyc8L2J1dHRvbj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmhhc05vKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJkaWFsb2ctY2xvc2VcIj4nKyAodHlwZW9mIHRoaXMub3B0aW9ucy5oYXNObyA9PSAnc3RyaW5nJyA/IHRoaXMub3B0aW9ucy5oYXNObyA6ICflj5bmtognKSArJzwvYnV0dG9uPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmJ1dHRvbiA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuYnV0dG9uID0gW3RoaXMub3B0aW9ucy5idXR0b25dO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkLmVhY2godGhpcy5vcHRpb25zLmJ1dHRvbiwgKGksIGl0ZW0pPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0gPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxidXR0b25cIj4nK2l0ZW0rJzwvYnV0dG9uPic7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cIicraXRlbS50YWcrJ1wiPicraXRlbS5jb250ZW50Kyc8L2J1dHRvbj4nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBodG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkNsaWNrKHRhZzogc3RyaW5nLCBjYWxsYmFjazogKGVsZW1lbnQ6IEpRdWVyeSkgPT4gYW55KSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLmJveC5vbignY2xpY2snLCB0YWcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChpbnN0YW5jZSwgJCh0aGlzKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNob3dCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlU3RhdHVzKERpYWxvZ1N0YXR1cy5zaG93KTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygnc2hvdycsIHRoaXMuc3RhdHVzKTtcclxuICAgICAgICBpZiAoIXN1cGVyLnNob3dCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5zaG93QmcodGhpcy5vcHRpb25zLnRhcmdldCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGhpZGVCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlU3RhdHVzKERpYWxvZ1N0YXR1cy5oaWRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXN1cGVyLmhpZGVCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NpbmdCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlU3RhdHVzKERpYWxvZ1N0YXR1cy5oaWRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygnY2xvc2VpbmcnLCB0aGlzLnN0YXR1cyk7XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zaW5nQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGlhbG9nU3RhdHVzLmhpZGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcclxuICAgICAgICBpZiAoIXN1cGVyLmNsb3NlQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3RhdHVzICE9IERpYWxvZ1N0YXR1cy5jbG9zaW5nKSB7XHJcbiAgICAgICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dDb250ZW50T3B0aW9uIGltcGxlbWVudHMgRGlhbG9nQ29udGVudE9wdGlvbiB7XHJcbiAgICBoYXNZZXM6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgaGFzTm86IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgdGltZTogbnVtYmVyID0gMDtcclxuICAgIGJ1dHRvbjogc3RyaW5nW10gPSBbXTtcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLmNvbnRlbnQsIERpYWxvZ0NvbnRlbnQpOyIsImNsYXNzIERpYWxvZ0Zvcm0gZXh0ZW5kcyBEaWFsb2dCb3gge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RhdGE6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6KGo5Y2V5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZGF0YSgpOiB7W25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9kYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9nZXRGb3JtRGF0YSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9lbGVtZW50czoge1tuYW1lOiBzdHJpbmddOiBKUXVlcnl9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDooajljZXmjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBlbGVtZW50cygpOiB7W25hbWU6IHN0cmluZ106IEpRdWVyeX0ge1xyXG4gICAgICAgIGlmICghdGhpcy5fZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHMgPSB0aGlzLl9nZXRGb3JtRWxlbWVudCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldENvbnRlbnRIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWJvZHlcIj4nKyB0aGlzLl9jcmVhdGVGb3JtKHRoaXMub3B0aW9ucy5jb250ZW50KSArJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlRm9ybShkYXRhOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICQuZWFjaChkYXRhLCBmdW5jdGlvbihuYW1lOiBzdHJpbmcsIGl0ZW06IGFueSkge1xyXG4gICAgICAgICAgICBodG1sICs9IGluc3RhbmNlLl9jcmVhdGVJbnB1dChuYW1lLCBpdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVJbnB1dChuYW1lOiBzdHJpbmcsIGRhdGE6IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSB7bGFiZWw6IGRhdGF9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRhdGEudHlwZSkge1xyXG4gICAgICAgICAgICBkYXRhLnR5cGUgPSAhZGF0YS5pdGVtID8gJ3RleHQnIDogJ3NlbGVjdCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBhdHRyID0gJyc7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICBsZXQgZGVmYXVsdFZhbCA9ICcnO1xyXG4gICAgICAgIGlmIChkYXRhLmRlZmF1bHQpIHtcclxuICAgICAgICAgICAgZGVmYXVsdFZhbCA9IGRhdGEuZGVmYXVsdFZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEubGFiZWwpIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPGxhYmVsPicrZGF0YS5sYWJlbCsnPC9sYWJlbD4nOyBcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEuaWQpIHtcclxuICAgICAgICAgICAgYXR0ciArPSAnIGlkPVwiJytkYXRhLmlkKydcIic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLmNsYXNzKSB7XHJcbiAgICAgICAgICAgIGF0dHIgKz0gJyBjbGFzcz1cIicrZGF0YS5jbGFzcysnXCInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5yZXF1aXJlZCkge1xyXG4gICAgICAgICAgICBhdHRyICs9ICcgcmVxdWlyZWQ9XCJyZXF1aXJlZFwiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEucGxhY2Vob2xkZXIpIHtcclxuICAgICAgICAgICAgYXR0ciArPSAnIHBsYWNlaG9sZGVyPVwiJytkYXRhLnBsYWNlaG9sZGVyKydcIic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN3aXRjaCAoZGF0YS50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RleHRhcmVhJzpcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzx0ZXh0YXJlYSBuYW1lPVwiJytuYW1lKydcIiAnK2F0dHIrJz4nK2RlZmF1bHRWYWwrJzwvdGV4dGFyZWE+JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzZWxlY3QnOlxyXG4gICAgICAgICAgICAgICAgbGV0IG9wdGlvbiA9ICcnO1xyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGRhdGEuaXRlbSwgZnVuY3Rpb24odmFsLCBsYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwgPT0gZGVmYXVsdFZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgKz0gJ1wiIHNlbGVjdGVkPVwic2VsZWN0ZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24gKz0gJzxvcHRpb24gdmFsdWU9XCInK3ZhbCsnXCI+JytsYWJlbCsnPC9vcHRpb24+JztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPHNlbGVjdCBuYW1lPVwiJytuYW1lKydcIiAnK2F0dHIrJz4nK29wdGlvbisnPHNlbGVjdD4nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3JhZGlvJzpcclxuICAgICAgICAgICAgY2FzZSAnY2hlY2tib3gnOlxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdicrYXR0cisnPidcclxuICAgICAgICAgICAgICAgICQuZWFjaChkYXRhLml0ZW0sIGZ1bmN0aW9uKHZhbCwgbGFiZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsID09IGRlZmF1bHRWYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsICs9ICdcIiBjaGVja2VkPVwiY2hlY2tlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwiJytkYXRhLnR5cGUrJ1wiIG5hbWU9XCInK25hbWUrJ1wiIHZhbHVlPVwiJyt2YWwrJ1wiPicgKyBsYWJlbDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdj4nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8aW5wdXQgdHlwZT1cIicrZGF0YS50eXBlKydcIiBuYW1lPVwiJytuYW1lKydcIiAnK2F0dHIrJyB2YWx1ZT1cIicrZGVmYXVsdFZhbCsnXCI+JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cFwiPicraHRtbCsnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluihqOWNleaOp+S7tlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9nZXRGb3JtRWxlbWVudCgpOntbbmFtZTpzdHJpbmddOiBKUXVlcnl9IHtcclxuICAgICAgICBsZXQgZWxlbWVudHMgPSB7fTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoJ2lucHV0LHNlbGVjdCx0ZXh0YXJlYSxidXR0b24nKS5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICBsZXQgaXRlbSA9ICQoZWxlKTtcclxuICAgICAgICAgICAgbGV0IG5hbWUgPSBpdGVtLmF0dHIoJ25hbWUnKTtcclxuICAgICAgICAgICAgaWYgKCFuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpdGVtLmlzKCdbdHlwZT1yaWRpb10nKSAmJiAhaXRlbS5pcygnW3R5cGU9Y2hlY2tib3hdJykgJiYgbmFtZS5pbmRleE9mKCdbXScpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudHNbbmFtZV0gPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZWxlbWVudHMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnRzW25hbWVdID0gaXRlbTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50c1tuYW1lXS5wdXNoKGVsZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6KGo5Y2V5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2dldEZvcm1EYXRhKCk6IHtbbmFtZTogc3RyaW5nXTogYW55fSB7XHJcbiAgICAgICAgbGV0IGZvcm1EYXRhID0ge307XHJcbiAgICAgICAgJC5lYWNoKHRoaXMuZWxlbWVudHMsIGZ1bmN0aW9uKG5hbWU6IHN0cmluZywgZWxlbWVudDogSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzKCdbdHlwZT1yaWRpb10nKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmF0dHIoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YVtuYW1lXSA9IGl0ZW0udmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXMoJ1t0eXBlPWNoZWNrYm94XScpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmF0dHIoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChpdGVtLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhW25hbWVdID0gZGF0YTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobmFtZS5pbmRleE9mKCdbXScpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuZWFjaChmdW5jdGlvbihpLCBlbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9ICQoZWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goaXRlbS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhW25hbWVdID0gZGF0YTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JtRGF0YVtuYW1lXSA9IGVsZW1lbnQudmFsKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZvcm1EYXRhO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5mb3JtLCBEaWFsb2dGb3JtKTsiLCJjbGFzcyBEaWFsb2dQYWdlIGV4dGVuZHMgRGlhbG9nQm94IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0SGVhZGVySHRtbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJkaWFsb2ctaGVhZGVyXCI+PGkgY2xhc3M9XCJmYSBmYS1hcnJvdy1sZWZ0XCI+PC9pPjxkaXYgY2xhc3M9XCJkaWFsb2ctdGl0bGVcIj4nO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaWNvKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxpIGNsYXNzPVwiZmEgZmEtJyArIHRoaXMub3B0aW9ucy5pY28gKyAnXCI+PC9pPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudGl0bGUpIHtcclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLm9wdGlvbnMudGl0bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBodG1sICsgJzwvZGl2PjxpIGNsYXNzPVwiZmEgZmEtY2xvc2UgZGlhbG9nLWNsb3NlXCI+PC9pPjwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnu5Hlrprkuovku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy1oZWFkZXIgLmZhLWFycm93LWxlZnRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLXllc1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdkb25lJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy1jbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5wYWdlLCBEaWFsb2dQYWdlKTsiLCJpbnRlcmZhY2UgRGlhbG9nSW1hZ2VPcHRpb24gZXh0ZW5kcyBEaWFsb2dPcHRpb24ge1xyXG4gICAgb25uZXh0PzogKGluZGV4OiBudW1iZXIpID0+IHN0cmluZyxcclxuICAgIG9ucHJldmlvdXM/OiAoaW5kZXg6IG51bWJlcikgPT4gc3RyaW5nXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ0ltYWdlIGV4dGVuZHMgRGlhbG9nQ29udGVudCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luZGV4OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHByaXZhdGUgX3NyYzogc3RyaW5nO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgc3JjKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NyYztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHNyYyhpbWc6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghaW1nKSB7XHJcbiAgICAgICAgICAgIGltZyA9IHRoaXMub3B0aW9ucy5jb250ZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zcmMgPSBpbWc7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZCgnLmRpYWxvZy1ib2R5IGltZycpLmF0dHIoJ3NyYycsIGltZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guaHRtbCh0aGlzLmdldENvbnRlbnRIdG1sKCkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICBsZXQgdGFyZ2V0ID0gdGhpcy5vcHRpb25zLnRhcmdldCB8fCBEaWFsb2cuJHdpbmRvdztcclxuICAgICAgICBsZXQgbWF4V2lkdGggPSB0YXJnZXQud2lkdGgoKTtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmJveC53aWR0aCgpO1xyXG4gICAgICAgIGxldCBtYXhIZWlnaHQgPSB0YXJnZXQuaGVpZ2h0KCk7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMuYm94LmhlaWdodCgpO1xyXG4gICAgICAgIHRoaXMuY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcsXHJcbiAgICAgICAgICAgIHRvcDogKG1heEhlaWdodCAtIGhlaWdodCkgLyAyICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog57uR5a6a5LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLWNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy1wcmV2aW91c1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91cygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2ctbmV4dFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuYm94KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5yZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoJy5kaWFsb2ctYm9keSBpbWcnKS5iaW5kKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLmJveCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeiuvuWwuuWvuFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVzaXplKCkge1xyXG4gICAgICAgIHRoaXMuc2V0UHJvcGVydHkoKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBwcmV2aW91cygpIHtcclxuICAgICAgICB0aGlzLnNyYyA9IHRoaXMudHJpZ2dlcigncHJldmlvdXMnLCAtLSB0aGlzLl9pbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG5leHQoKSB7XHJcbiAgICAgICAgdGhpcy5zcmMgPSB0aGlzLnRyaWdnZXIoJ25leHQnLCArKyB0aGlzLl9pbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldENvbnRlbnRIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuY29udGVudCkge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuY29udGVudCA9IHRoaXMudHJpZ2dlcignbmV4dCcsICsrIHRoaXMuX2luZGV4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICc8aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tbGVmdCBkaWFsb2ctcHJldmlvdXNcIj48L2k+PGRpdiBjbGFzcz1cImRpYWxvZy1ib2R5XCI+PGltZyBzcmM9XCInKyB0aGlzLm9wdGlvbnMuY29udGVudCArJ1wiPjwvZGl2PjxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1yaWdodCBkaWFsb2ctbmV4dFwiPjwvaT48aSBjbGFzcz1cImZhIGZhLWNsb3NlIGRpYWxvZy1jbG9zZVwiPjwvaT4nO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nSW1hZ2VPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dJbWFnZU9wdGlvbiB7XHJcbiAgICBvbm5leHQ6IChpbmRleDogbnVtYmVyKSA9PiBzdHJpbmcgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgIHJldHVybiAkKGRvY3VtZW50LmJvZHkpLmZpbmQoJ2ltZycpLmVxKGluZGV4KS5hdHRyKCdzcmMnKTtcclxuICAgIH07XHJcbiAgICBvbnByZXZpb3VzOiAoaW5kZXg6IG51bWJlcikgPT4gc3RyaW5nID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gJChkb2N1bWVudC5ib2R5KS5maW5kKCdpbWcnKS5lcShpbmRleCkuYXR0cignc3JjJyk7XHJcbiAgICB9O1xyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUuaW1hZ2UsIERpYWxvZ0ltYWdlKTsiLCJpbnRlcmZhY2UgRGlhbG9nRGlza09wdGlvbiBleHRlbmRzIERpYWxvZ0JveE9wdGlvbiB7XHJcbiAgICBjYXRhbG9nPzogYW55LCAgICAgICAgLy/nm67lvZVcclxuICAgIG5hbWU/OiBzdHJpbmcsXHJcbiAgICBjaGlsZHJlbj86IHN0cmluZyxcclxuICAgIHVybD86IHN0cmluZywgICAgICAgICAvL3VybOagh+iusFxyXG4gICAgbXVsdGlwbGU/OiBib29sZWFuLCAgICAvL+aYr+WQpuWFgeiuuOWkmumAiVxyXG4gICAgb25vcGVuRmlsZT86ICh1cmw6IHN0cmluZywgZWxlbWVudDogSlF1ZXJ5KSA9PiBhbnkgIC8v5omT5byA5paH5Lu26Kem5Y+R5pe26Ze0XHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ0Rpc2sgZXh0ZW5kcyBEaWFsb2dCb3gge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dEaXNrT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3B0aW9uczogRGlhbG9nRGlza09wdGlvbjtcclxuXHJcbiAgICBwdWJsaWMgY2F0YWxvZ0JveDogSlF1ZXJ5O1xyXG5cclxuICAgIHB1YmxpYyBmaWxlQm94OiBKUXVlcnk7XHJcblxyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmNhdGFsb2dCb3ggPSB0aGlzLmJveC5maW5kKCcuZGlhbG9nLWJvZHkgLmRpYWxvZy1jYXRhbG9nJyk7XHJcbiAgICAgICAgdGhpcy5maWxlQm94ID0gdGhpcy5ib3guZmluZCgnLmRpYWxvZy1ib2R5IC5kaWFsb2ctY29udGVudCcpO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuY2F0YWxvZyA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dDYXRhbG9nKHRoaXMub3B0aW9ucy5jYXRhbG9nKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkLmdldEpTT04odGhpcy5vcHRpb25zLmNhdGFsb2csIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvZGUgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnNob3dDYXRhbG9nKGRhdGEuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jb250ZW50ID09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0ZpbGUodGhpcy5vcHRpb25zLmNvbnRlbnQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQuZ2V0SlNPTih0aGlzLm9wdGlvbnMuY29udGVudCwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuY29kZSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Uuc2hvd0ZpbGUoZGF0YS5kYXRhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2F0YWxvZ0JveC5vbignY2xpY2snLCAnLnRyZWUtaXRlbScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZmlsZSA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIGZpbGUuYWRkQ2xhc3MoJ2FjdGl2ZScpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5vcGVuKGZpbGUuYXR0cignZGF0YS11cmwnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5maWxlQm94Lm9uKCdjbGljaycsICcuZm9sZGVyLWl0ZW0nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGZpbGUgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICBmaWxlLmFkZENsYXNzKCdhY3RpdmUnKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgaW5zdGFuY2Uub3BlbihmaWxlLmF0dHIoJ2RhdGEtdXJsJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZmlsZUJveC5vbignY2xpY2snLCAnLmZpbGUtaXRlbScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZmlsZSA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIGZpbGUuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpZiAoIWluc3RhbmNlLm9wdGlvbnMubXVsdGlwbGUpIHtcclxuICAgICAgICAgICAgICAgIGZpbGUuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5zdGFuY2UudHJpZ2dlcignb3BlbkZpbGUnLCBmaWxlLmF0dHIoJ2RhdGEtdXJsJyksIGZpbGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzdXBlci5iaW5kRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0Q29udGVudEh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJkaWFsb2ctYm9keVwiPjxkaXYgY2xhc3M9XCJkaWFsb2ctY2F0YWxvZ1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJkaWFsb2ctY29udGVudFwiPjwvZGl2PjwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nRGlza09wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcGVuKHVybDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCF1cmwpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3VybCBpcyBlbXB0eScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIENhY2hlVXJsLmdldERhdGEodXJsLCBkYXRhID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zaG93RmlsZShkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlumAieS4reeahOaWh+S7tui3r+W+hFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdmFsKCk6IHN0cmluZ3wgQXJyYXk8c3RyaW5nPiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMubXVsdGlwbGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsZUJveC5maW5kKCcuZmlsZS1pdGVtLmFjdGl2ZScpLmF0dHIoJ2RhdGEtdXJsJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkYXRhID0gW107XHJcbiAgICAgICAgdGhpcy5tYXBTZWxlY3RlZEZpbGUodXJsID0+IHtcclxuICAgICAgICAgICAgZGF0YS5wdXNoKHVybCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlvqrnjq/pgInkuK3nmoTmlofku7ZcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBcclxuICAgICAqL1xyXG4gICAgcHVibGljIG1hcFNlbGVjdGVkRmlsZShjYWxsYmFjazogKHVybDogc3RyaW5nLCBlbGVtZW50OiBKUXVlcnksIGluZGV4OiBudW1iZXIpID0+IGFueSk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuZmlsZUJveC5maW5kKCcuZmlsZS1pdGVtLmFjdGl2ZScpLmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gaXRlbS5hdHRyKCdkYXRhLXVybCcpO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChpdGVtLCB1cmwsIGl0ZW0sIGkpID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOW+queOr+aJgOaciVxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxyXG4gICAgICogQHBhcmFtIGhhc0ZvbGRlciDmmK/lkKbljIXlkKvmlofku7blpLkgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBtYXAoY2FsbGJhY2s6ICh1cmw6IHN0cmluZywgZWxlbWVudDogSlF1ZXJ5LCBpbmRleDogbnVtYmVyKSA9PiBhbnksIGhhc0ZvbGRlcjogYm9vbGVhbiA9IGZhbHNlKTogdGhpcyB7XHJcbiAgICAgICAgbGV0IHRhZyA9ICcuZmlsZS1pdGVtJztcclxuICAgICAgICBpZiAoaGFzRm9sZGVyKSB7XHJcbiAgICAgICAgICAgIHRhZyA9ICcuZm9sZGVyLWl0ZW0sJyArIHRhZztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5maWxlQm94LmZpbmQodGFnKS5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICBsZXQgaXRlbSA9ICQoZWxlKTtcclxuICAgICAgICAgICAgbGV0IHVybCA9IGl0ZW0uYXR0cignZGF0YS11cmwnKTtcclxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoaXRlbSwgdXJsLCBpdGVtLCBpKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrmlofku7ZcclxuICAgICAqIEBwYXJhbSBkYXRhIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2hvd0ZpbGUoZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICAkLmVhY2goZGF0YSwgKGksIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaXRlbS50eXBlID0gRGlhbG9nLnBhcnNlRW51bTxEaWFsb2dEaXNrVHlwZT4oaXRlbS50eXBlLCBEaWFsb2dEaXNrVHlwZSk7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gRGlhbG9nRGlza1R5cGUuZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRGaWxlSXRlbShpdGVtKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldEZvbGRlckl0ZW0oaXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5maWxlQm94Lmh0bWwoaHRtbClcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRGaWxlSXRlbShkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZmlsZS1pdGVtXCIgZGF0YS11cmw9XCInICsgZGF0YVt0aGlzLm9wdGlvbnMudXJsXSArJ1wiPjxpIGNsYXNzPVwiZmEgZmEtZmlsZS1vXCI+PC9pPjxkaXYgY2xhc3M9XCJmaWxlLW5hbWVcIj4nK2RhdGFbdGhpcy5vcHRpb25zLm5hbWVdKyc8L2Rpdj48L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldEZvbGRlckl0ZW0oZGF0YSkge1xyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImZvbGRlci1pdGVtXCIgZGF0YS11cmw9XCInICsgZGF0YVt0aGlzLm9wdGlvbnMudXJsXSArJ1wiPjxpIGNsYXNzPVwiZmEgZmEtZm9sZGVyLW9cIj48L2k+PGRpdiBjbGFzcz1cImZpbGUtbmFtZVwiPicrZGF0YVt0aGlzLm9wdGlvbnMubmFtZV0rJzwvZGl2PjwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrnm67lvZVcclxuICAgICAqIEBwYXJhbSBkYXRhIFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2hvd0NhdGFsb2coZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICAkLmVhY2goZGF0YSwgKGksIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRDYXRhbG9nSXRlbShpdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoaHRtbCA9PSAnJykge1xyXG4gICAgICAgICAgICB0aGlzLmNhdGFsb2dCb3guaGlkZSgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2F0YWxvZ0JveC5odG1sKCc8dWwgY2xhc3M9XCJ0cmVlXCI+JyArIGh0bWwgKyc8L3VsPicpXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0Q2F0YWxvZ0l0ZW0oZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnPGxpIGNsYXNzPVwidHJlZS1pdGVtXCIgZGF0YS11cmw9XCInICsgZGF0YVt0aGlzLm9wdGlvbnMudXJsXSArJ1wiPjxkaXYgY2xhc3M9XCJ0cmVlLWhlYWRlclwiPicgKyBkYXRhW3RoaXMub3B0aW9ucy5uYW1lXSArICc8L2Rpdj4nO1xyXG4gICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KHRoaXMub3B0aW9ucy5jaGlsZHJlbikpIHtcclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRDYXRhbG9nQ2hpbGQoZGF0YVt0aGlzLm9wdGlvbnMuY2hpbGRyZW5dKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGh0bWwgKyAnPC9saT4nO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldENhdGFsb2dDaGlsZChkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgICQuZWFjaChkYXRhLCAoaSwgaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldENhdGFsb2dJdGVtKGl0ZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiAnPHVsIGNsYXNzPVwidHJlZS1jaGlsZFwiPicgKyBodG1sICsgJzwvdWw+JztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ0Rpc2tPcHRpb24gZXh0ZW5kcyBEZWZhdWx0RGlhbG9nQm94T3B0aW9uIGltcGxlbWVudHMgRGlhbG9nRGlza09wdGlvbiB7XHJcbiAgICBuYW1lOiBzdHJpbmcgPSAnbmFtZSc7XHJcbiAgICB0aXRsZTogc3RyaW5nID0gJ+aWh+S7tueuoeeQhic7XHJcbiAgICBjaGlsZHJlbjogc3RyaW5nID0gJ2NoaWxkcmVuJztcclxuICAgIHVybDogc3RyaW5nID0gJ3VybCc7XHJcbiAgICBtdWx0aXBsZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgb25jbG9zaW5nOiAoKSA9PiBhbnkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5kaXNrLCBEaWFsb2dEaXNrKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
