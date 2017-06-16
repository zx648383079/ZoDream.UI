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
/**
 * 已知问题
 * 如果一个不能关闭， 多个将出现错乱
 */
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
    Dialog.pop = function (content, target, time) {
        if (time === void 0) { time = 2000; }
        if (typeof content != 'object') {
            content = { content: content, time: time, target: target };
        }
        content.type = DialogType.pop;
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
        //这里可能导致 突然显示出来
        $(document).mousemove(function (e) {
            if (!isMove || instance.status != DialogStatus.show) {
                return;
            }
            instance.box.css({
                top: e.pageY - y,
                left: e.pageX - x
            });
        }).mouseup(function () {
            isMove = false;
            if (instance.box && instance.status == DialogStatus.show) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhY2hlLnRzIiwiZXZlbnQudHMiLCJib3gudHMiLCJjb3JlLnRzIiwiZGVmYXVsdC50cyIsImRpYWxvZy50cyIsImVudW0udHMiLCJqcXVlcnkuZGlhbG9nLnRzIiwidGlwLnRzIiwibWVzc2FnZS50cyIsIm5vdGlmeS50cyIsInBvcC50cyIsImxvYWRpbmcudHMiLCJjb250ZW50LnRzIiwiZm9ybS50cyIsInBhZ2UudHMiLCJpbWFnZS50cyIsImRpc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVBO0FBQ0E7SUFBQTtJQTJEQSxDQUFBO0lBaERBLGdCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLFFBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsRUFBQSxVQUFBLElBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxRQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZUFBQTtBQUFBLENBM0RBLEFBMkRBO0FBMURBOztHQUVBO0FBQ0EsbUJBQUEsR0FBQSxFQUFBLENBQUE7QUFFQTs7R0FFQTtBQUNBLGVBQUEsR0FBQSxFQUFBLENBQUE7QUNaQTtJQUFBO0lBbUJBLENBQUE7SUFoQkEsZ0JBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsUUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxzQkFBQSxHQUFBLFVBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUJBQUEsR0FBQSxVQUFBLEtBQUE7UUFBQSxjQUFBO2FBQUEsVUFBQSxFQUFBLHFCQUFBLEVBQUEsSUFBQTtZQUFBLDZCQUFBOztRQUNBLElBQUEsU0FBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsWUFBQSxJQUFBLFNBQUEsSUFBQSxHQUFBOztJQUNBLENBQUE7SUFDQSxVQUFBO0FBQUEsQ0FuQkEsQUFtQkEsSUFBQTtBQ25CQTtJQUFBLHVCQUFBO0lBQUE7O0lBZ0NBLENBQUE7SUExQkEsMEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsVUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBOzs7O09BSUE7SUFDQSxXQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUEsT0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxVQUFBO0FBQUEsQ0FoQ0EsQUFnQ0EsQ0FoQ0EsR0FBQSxHQWdDQTtBQ2hDQTs7O0dBR0E7QUFDQTtJQUFBLDhCQUFBO0lBQ0Esb0JBQ0EsTUFBQSxFQUNBLEVBQUE7UUFGQSxZQUlBLGlCQUFBLFNBR0E7UUFMQSxRQUFBLEdBQUEsRUFBQSxDQUFBO1FBU0EsYUFBQSxHQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUE7UUFOQSxLQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLEtBQUEsQ0FBQSxnQkFBQSxFQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBOztJQUNBLENBQUE7SUFNQSxzQkFBQSw4QkFBQTthQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxHQUFBO1lBQ0EsR0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxFQUFBLFlBQUEsQ0FBQSxDQUFBO1lBQ0EsV0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxJQUFBO29CQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0EsS0FBQSxZQUFBLENBQUEsSUFBQTtvQkFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7b0JBQ0EsS0FBQSxDQUFBO2dCQUNBLEtBQUEsWUFBQSxDQUFBLE9BQUE7b0JBQ0EsSUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxNQUFBO29CQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0E7b0JBQ0EsTUFBQSxlQUFBLEdBQUEsR0FBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7OztPQXhCQTtJQStCQSxzQkFBQSx5QkFBQTthQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7YUFFQSxVQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7OztPQUxBO0lBU0Esc0JBQUEsOEJBQUE7YUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsQ0FBQTthQUVBLFVBQUEsTUFBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBOzs7T0FMQTtJQU9BOzs7O09BSUE7SUFDQSxpQ0FBQSxHQUFBLFVBQUEsTUFBQSxFQUFBLFFBQUE7UUFBQSx5QkFBQSxFQUFBLGdCQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EscUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLG1CQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQTs7T0FFQTtJQUNBLDRCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxHQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsNEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQTtlQUNBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsOEVBQUEsRUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxRQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsNkJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFJQSwrQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBLENBQUEsNEJBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxpQ0FBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQU9BLHdCQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEseUJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEseUJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsMEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsMkJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUFBLGlCQVlBO1FBWEEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsUUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0NBQUEsR0FBQTtRQUFBLGlCQWFBO1FBWkEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsUUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUEsR0FBQSxNQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBLCtCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDRCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDZCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0NBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQSxTQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE9BQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsR0FBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxRQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxLQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxXQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEVBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsTUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsVUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsSUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGlCQUFBO0FBQUEsQ0E3U0EsQUE2U0EsQ0E3U0EsR0FBQSxHQTZTQTtBQ2pUQTtJQUFBO1FBQ0EsVUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFNBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsWUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFdBQUEsR0FBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSwwQkFBQTtBQUFBLENBUEEsQUFPQSxJQUFBO0FDUEE7SUFBQTtJQXVSQSxDQUFBO0lBdlFBOzs7T0FHQTtJQUNBLGFBQUEsR0FBQSxVQUFBLE1BQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLE9BQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0JBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxJQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7OztPQUlBO0lBQ0EsVUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLElBQUE7UUFBQSxxQkFBQSxFQUFBLFdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7T0FJQTtJQUNBLGNBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxJQUFBO1FBQUEscUJBQUEsRUFBQSxXQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLFVBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsSUFBQTtRQUFBLHFCQUFBLEVBQUEsV0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGNBQUEsR0FBQSxVQUFBLElBQUE7UUFBQSxxQkFBQSxFQUFBLFFBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7OztPQUtBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQTtnQkFDQSxPQUFBLEVBQUEsT0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7OztPQU1BO0lBQ0EsVUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQTtRQUFBLHNCQUFBLEVBQUEsWUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLEdBQUE7Z0JBQ0EsT0FBQSxFQUFBLE9BQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7Z0JBQ0EsTUFBQSxFQUFBLE1BQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7YUFDQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7Ozs7O09BT0E7SUFDQSxXQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQTtRQUFBLHNCQUFBLEVBQUEsWUFBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLFVBQUEsQ0FBQSxJQUFBO1lBQ0EsT0FBQSxFQUFBLE9BQUE7WUFDQSxLQUFBLEVBQUEsS0FBQTtZQUNBLE1BQUEsRUFBQSxNQUFBO1lBQ0EsS0FBQSxFQUFBLEtBQUE7WUFDQSxNQUFBLEVBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7O09BTUE7SUFDQSxXQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQTtnQkFDQSxPQUFBLEVBQUEsT0FBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7O09BS0E7SUFDQSxhQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLElBQUE7UUFBQSxzQkFBQSxFQUFBLFlBQUE7UUFBQSx3QkFBQSxFQUFBLFlBQUE7UUFBQSxxQkFBQSxFQUFBLFNBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEtBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxHQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLEdBQUEsRUFBQSxJQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxLQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxjQUFBLEdBQUEsVUFBQSxPQUFBO1FBQ0EsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxPQUFBLENBQUE7UUFDQSxPQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsY0FBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsVUFBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGlCQUFBLEdBQUEsVUFBQSxFQUFBO1FBQUEsbUJBQUEsRUFBQSxLQUFBLElBQUEsQ0FBQSxLQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsT0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsYUFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUE7WUFDQSxJQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxVQUFBLEdBQUEsVUFBQSxRQUFBO1FBQ0EsR0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLE1BQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxhQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUEsUUFBQTtRQUFBLHVCQUFBLEVBQUEsU0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtRQUFBLHlCQUFBLEVBQUEsZUFBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLFVBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLG1CQUFBLEVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxjQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsTUFBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsYUFBQTtBQUFBLENBdlJBLEFBdVJBO0FBclJBLGNBQUEsR0FBQSxFQUFBLENBQUE7QUFFQSxZQUFBLEdBQUEsRUFBQSxDQUFBO0FBRUEsWUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUE7QUFFQSxlQUFBLEdBQUEsRUFBQSxDQUFBO0FBSUEsY0FBQSxHQUFBLENBQUEsQ0FBQTtBQUVBLGNBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUNkQTs7R0FFQTtBQUNBLElBQUEsVUFhQTtBQWJBLFdBQUEsVUFBQTtJQUNBLHlDQUFBLENBQUE7SUFDQSxpREFBQSxDQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLHlDQUFBLENBQUE7SUFDQSxpREFBQSxDQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLDZDQUFBLENBQUE7SUFDQSwyQ0FBQSxDQUFBO0lBQ0EsMkNBQUEsQ0FBQTtJQUNBLGlEQUFBLENBQUE7SUFDQSwwQ0FBQSxDQUFBO0lBQ0EsNENBQUEsQ0FBQTtBQUNBLENBQUEsRUFiQSxVQUFBLEtBQUEsVUFBQSxRQWFBO0FBRUE7O0dBRUE7QUFDQSxJQUFBLGVBVUE7QUFWQSxXQUFBLGVBQUE7SUFDQSxtREFBQSxDQUFBO0lBQ0EsdURBQUEsQ0FBQTtJQUNBLHlEQUFBLENBQUE7SUFDQSxxREFBQSxDQUFBO0lBQ0EseURBQUEsQ0FBQTtJQUNBLDJEQUFBLENBQUE7SUFDQSw2REFBQSxDQUFBO0lBQ0EsbUVBQUEsQ0FBQTtJQUNBLGlFQUFBLENBQUE7QUFDQSxDQUFBLEVBVkEsZUFBQSxLQUFBLGVBQUEsUUFVQTtBQUVBOztHQUVBO0FBQ0EsSUFBQSxZQUtBO0FBTEEsV0FBQSxZQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLCtDQUFBLENBQUE7SUFDQSxxREFBQSxDQUFBO0lBQ0EsbURBQUEsQ0FBQSxDQUFBLEtBQUE7QUFDQSxDQUFBLEVBTEEsWUFBQSxLQUFBLFlBQUEsUUFLQTtBQUVBLElBQUEsY0FHQTtBQUhBLFdBQUEsY0FBQTtJQUNBLG1EQUFBLENBQUE7SUFDQSw2REFBQSxDQUFBO0FBQ0EsQ0FBQSxFQUhBLGNBQUEsS0FBQSxjQUFBLFFBR0E7QUM5Q0E7SUFDQSxzQkFDQSxPQUFBLEVBQ0EsTUFBQTtRQURBLFlBQUEsR0FBQSxPQUFBLENBQUE7UUFDQSxXQUFBLEdBQUEsTUFBQSxDQUFBO1FBRUEsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUlBLG1DQUFBLEdBQUEsVUFBQSxPQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxHQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsSUFBQSxVQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsTUFBQSxHQUFBLE9BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLG1CQUFBO0FBQUEsQ0EzQkEsQUEyQkEsSUFBQTtBQUVBLENBQUE7QUFBQSxDQUFBLFVBQUEsQ0FBQTtJQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsTUFBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBLENBQUE7QUFDQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQzdCQTtJQUFBLDZCQUFBO0lBQ0EsbUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQU1BLHdCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQTthQUNBLFlBQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLFNBQUEsRUFBQTthQUNBLE9BQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxzQkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxnQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsK0JBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsNkJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsMEJBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwyQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxFQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsWUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLFVBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw0QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxRQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZ0JBQUE7QUFBQSxDQWxJQSxBQWtJQSxDQWxJQSxVQUFBLEdBa0lBO0FBRUE7SUFBQTtRQUNBLFNBQUEsR0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBQUEsNkJBQUE7QUFBQSxDQUZBLEFBRUEsSUFBQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQ3hJQTtJQUFBLGlDQUFBO0lBQ0EsdUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsR0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxVQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsQ0FBQSxDQUFBLElBQUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxvQkFBQTtBQUFBLENBM0JBLEFBMkJBLENBM0JBLFNBQUEsR0EyQkE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQUEsYUFBQSxDQUFBLENBQUE7QUM1QkE7SUFBQSxnQ0FBQTtJQUVBLHNCQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFNQSxvQ0FBQSxHQUFBO1FBQ0EsTUFBQSxJQUFBLEtBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0Esa0NBQUEsR0FBQTtRQUNBLE1BQUEsSUFBQSxLQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsdUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLHlCQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsYUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxPQUFBO2VBQ0EsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0NBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLGNBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxHQUFBLEdBQUEsWUFBQSxDQUFBLGlCQUFBLEVBQUEsQ0FBQTtZQUNBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxVQUFBO2dCQUNBLEVBQUEsQ0FBQSxDQUFBLFVBQUEsS0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO29CQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQTtvQkFDQSxJQUFBLEVBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBO29CQUNBLElBQUEsRUFBQSxRQUFBLENBQUEsT0FBQSxDQUFBLEdBQUE7aUJBQ0EsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBO29CQUNBLFFBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxHQUFBLFNBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQkFBQTtBQUFBLENBekZBLEFBeUZBLENBekZBLFNBQUEsR0F5RkE7QUFFQTtJQUFBLDZDQUFBO0lBQUE7UUFBQSxxRUFFQTtRQURBLFdBQUEsR0FBQSxJQUFBLENBQUE7O0lBQ0EsQ0FBQTtJQUFBLGdDQUFBO0FBQUEsQ0FGQSxBQUVBLENBRkEsc0JBQUEsR0FFQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtBQ2hHQTtJQUFBLDZCQUFBO0lBQ0EsbUJBQ0EsTUFBQSxFQUNBLEVBQUE7UUFGQSxZQUlBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUEsU0FJQTtRQUhBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsZUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBOztJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGdDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDZCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHVDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxtQkFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxHQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsMk5BQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUE7WUFDQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUE7U0FDQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsa0NBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxLQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFFBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLEtBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUEsR0FBQSxLQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsV0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsTUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxTQUFBLEdBQUEsS0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxJQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxLQUFBLEdBQUEsS0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLEdBQUEsQ0FBQTtZQUNBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsR0FBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZ0JBQUE7QUFBQSxDQW5FQSxBQW1FQSxDQW5FQSxTQUFBLEdBbUVBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FDcEVBO0lBQUEsaUNBQUE7SUFDQSx1QkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsd0NBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLDBCQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLG1DQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO1lBQ0EsR0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxHQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLEVBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxlQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxPQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxPQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsa0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsVUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdDQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxRQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9CQUFBO0FBQUEsQ0E3RUEsQUE2RUEsQ0E3RUEsU0FBQSxHQTZFQTtBQUVBO0lBQUE7UUFDQSxVQUFBLEdBQUEsU0FBQSxDQUFBLENBQUEsVUFBQTtRQUNBLFVBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxTQUFBLEdBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUFBLGlDQUFBO0FBQUEsQ0FKQSxBQUlBLElBQUE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQUEsYUFBQSxDQUFBLENBQUE7QUM3RUE7SUFBQSxpQ0FBQTtJQUVBLHVCQUNBLE1BQUEsRUFDQSxFQUFBO1FBRkEsWUFJQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLFNBVUE7UUFFQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBLGdCQUFBO1FBWEEsRUFBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7WUFDQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEVBQUEsVUFBQSxJQUFBO2dCQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQTtnQkFDQSxVQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7O0lBQ0EsQ0FBQTtJQU1BLHNCQUFBLG9DQUFBO2FBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtRQUNBLENBQUE7YUFFQSxVQUFBLEdBQUE7WUFDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQTtZQUNBLFlBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTs7O09BVEE7SUFXQTs7T0FFQTtJQUNBLHNDQUFBLEdBQUEsVUFBQSxHQUFBO1FBQUEsb0JBQUEsRUFBQSxNQUFBLElBQUEsQ0FBQSxNQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxJQUFBLEdBQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLGNBQUEsR0FBQSxTQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsY0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw0QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUE7YUFDQSxZQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHdDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSwwQkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxxQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLG9DQUFBLEdBQUE7UUFDQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsbUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHNDQUFBLEdBQUE7UUFDQSxJQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsMkJBQUEsR0FBQSxPQUFBLEdBQUEsUUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHFDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLFFBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsWUFBQSxLQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsNkJBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSw2QkFBQSxHQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsV0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSwrQkFBQSxHQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsV0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLFVBQUEsQ0FBQSxFQUFBLElBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxXQUFBLEdBQUEsSUFBQSxHQUFBLFdBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLGlCQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxXQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLElBQUEsUUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsUUFBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsVUFBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxPQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsT0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGtDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLFVBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsUUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQkFBQTtBQUFBLENBbk1BLEFBbU1BLENBbk1BLFVBQUEsR0FtTUE7QUFFQTtJQUFBO1FBQ0EsV0FBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFVBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxTQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsV0FBQSxHQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSxpQ0FBQTtBQUFBLENBTEEsQUFLQSxJQUFBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBO0FYbk5BO0lBQUEsNkJBQUE7SUFDQSxtQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLElBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBO2dCQUNBLElBQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQTtnQkFDQSxHQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7YUFDQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNkJBQUEsR0FBQTtRQUNBLFVBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLE1BQUEsR0FBQSxJQUFBLENBQUE7WUFDQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsR0FBQSxDQUFBLENBQUEsS0FBQSxHQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFFQSxlQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsSUFBQSxRQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxRQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQTtnQkFDQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBO2dCQUNBLElBQUEsRUFBQSxDQUFBLENBQUEsS0FBQSxHQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUE7WUFDQSxNQUFBLEdBQUEsS0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsSUFBQSxRQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLGlCQUFBLFNBQUEsV0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsMEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0NBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLHNCQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsdURBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxrQkFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLFFBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxzREFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBO0FBQUEsQ0EvRkEsQUErRkEsQ0EvRkEsYUFBQSxHQStGQTtBQUVBO0lBQUEsMENBQUE7SUFBQTtRQUFBLHFFQUdBO1FBRkEsV0FBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLGFBQUEsR0FBQSxJQUFBLENBQUE7O0lBQ0EsQ0FBQTtJQUFBLDZCQUFBO0FBQUEsQ0FIQSxBQUdBLENBSEEsMEJBQUEsR0FHQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBWTVHQTtJQUFBLDhCQUFBO0lBQ0Esb0JBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQU9BLHNCQUFBLDRCQUFBO1FBSEE7O1dBRUE7YUFDQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBOzs7T0FBQTtJQU1BLHNCQUFBLGdDQUFBO1FBSEE7O1dBRUE7YUFDQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUE7UUFDQSxDQUFBOzs7T0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsMkJBQUEsR0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsUUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdDQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUEsSUFBQTtZQUNBLElBQUEsSUFBQSxRQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQ0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBLElBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLEdBQUEsUUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsVUFBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsc0JBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxnQkFBQSxHQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxVQUFBO2dCQUNBLElBQUEsSUFBQSxrQkFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLEdBQUEsYUFBQSxDQUFBO2dCQUNBLEtBQUEsQ0FBQTtZQUNBLEtBQUEsUUFBQTtnQkFDQSxJQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBLEtBQUE7b0JBQ0EsRUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7d0JBQ0EsR0FBQSxJQUFBLHNCQUFBLENBQUE7b0JBQ0EsQ0FBQTtvQkFDQSxRQUFBLElBQUEsaUJBQUEsR0FBQSxHQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsR0FBQSxXQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxJQUFBLGdCQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsR0FBQSxHQUFBLFFBQUEsR0FBQSxVQUFBLENBQUE7Z0JBQ0EsS0FBQSxDQUFBO1lBQ0EsS0FBQSxPQUFBLENBQUE7WUFDQSxLQUFBLFVBQUE7Z0JBQ0EsSUFBQSxJQUFBLE1BQUEsR0FBQSxJQUFBLEdBQUEsR0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQSxLQUFBO29CQUNBLEVBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO3dCQUNBLEdBQUEsSUFBQSxvQkFBQSxDQUFBO29CQUNBLENBQUE7b0JBQ0EsSUFBQSxJQUFBLGVBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsR0FBQSxJQUFBLEdBQUEsV0FBQSxHQUFBLEdBQUEsR0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxPQUFBLENBQUE7Z0JBQ0EsS0FBQSxDQUFBO1lBQ0E7Z0JBQ0EsSUFBQSxJQUFBLGVBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxVQUFBLEdBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtnQkFDQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLDJCQUFBLEdBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLG9DQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLGlCQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsUUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLElBQUEsRUFBQSxPQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO29CQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtvQkFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTt3QkFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO29CQUNBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7Z0JBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO29CQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtvQkFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTt3QkFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO29CQUNBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtnQkFDQSxPQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUE7b0JBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO29CQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQkFBQTtBQUFBLENBNUtBLEFBNEtBLENBNUtBLFNBQUEsR0E0S0E7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7QUM5S0E7SUFBQSw4QkFBQTtJQUNBLG9CQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxrQ0FBQSxHQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsdUZBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxrQkFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLFFBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxzREFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsOEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSwrQkFBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlCQUFBO0FBQUEsQ0F0Q0EsQUFzQ0EsQ0F0Q0EsU0FBQSxHQXNDQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtBQ25DQTtJQUFBLCtCQUFBO0lBRUEscUJBQ0EsTUFBQSxFQUNBLEVBQUE7UUFGQSxZQUlBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUEsU0FDQTtRQUVBLFlBQUEsR0FBQSxDQUFBLENBQUE7O0lBRkEsQ0FBQTtJQU1BLHNCQUFBLDRCQUFBO2FBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7YUFFQSxVQUFBLEdBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLEdBQUEsR0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBOzs7T0FSQTtJQVVBLG1DQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7WUFDQSxHQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7U0FDQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsK0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBRUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDRCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSx1RkFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLGlHQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0Esa0JBQUE7QUFBQSxDQWxHQSxBQWtHQSxDQWxHQSxhQUFBLEdBa0dBO0FBRUE7SUFBQTtRQUNBLFdBQUEsR0FBQSxVQUFBLEtBQUE7WUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTtRQUNBLGVBQUEsR0FBQSxVQUFBLEtBQUE7WUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSwrQkFBQTtBQUFBLENBUEEsQUFPQSxJQUFBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBO0FDekdBO0lBQUEsOEJBQUE7SUFDQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBUUEsOEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsSUFBQTtnQkFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7b0JBQ0EsUUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxJQUFBO2dCQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtvQkFDQSxRQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFlBQUEsRUFBQTtZQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxjQUFBLEVBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsWUFBQSxFQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLGlCQUFBLFNBQUEsV0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEscUdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsdUJBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQUEsaUJBUUE7UUFQQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLFFBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLFVBQUEsSUFBQTtZQUNBLEtBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHdCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxlQUFBLENBQUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxvQ0FBQSxHQUFBLFVBQUEsUUFBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtZQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7T0FJQTtJQUNBLHdCQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUEsU0FBQTtRQUFBLDBCQUFBLEVBQUEsaUJBQUE7UUFDQSxJQUFBLEdBQUEsR0FBQSxZQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsR0FBQSxHQUFBLGVBQUEsR0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLDZCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQUEsaUJBV0E7UUFWQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsRUFBQSxJQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsY0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxLQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLElBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxNQUFBLENBQUEsbUNBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSx1REFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLGNBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLE1BQUEsQ0FBQSxxQ0FBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLHlEQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsY0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGdDQUFBLEdBQUEsVUFBQSxJQUFBO1FBQUEsaUJBVUE7UUFUQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsRUFBQSxJQUFBO1lBQ0EsSUFBQSxJQUFBLEtBQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxtQkFBQSxHQUFBLElBQUEsR0FBQSxPQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQ0FBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLElBQUEsSUFBQSxHQUFBLGtDQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsNkJBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxPQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUNBQUEsR0FBQSxVQUFBLElBQUE7UUFBQSxpQkFNQTtRQUxBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxFQUFBLElBQUE7WUFDQSxJQUFBLElBQUEsS0FBQSxDQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLHlCQUFBLEdBQUEsSUFBQSxHQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxpQkFBQTtBQUFBLENBcExBLEFBb0xBLENBcExBLFNBQUEsR0FvTEE7QUFFQTtJQUFBLDJDQUFBO0lBQUE7UUFBQSxxRUFVQTtRQVRBLFVBQUEsR0FBQSxNQUFBLENBQUE7UUFDQSxXQUFBLEdBQUEsTUFBQSxDQUFBO1FBQ0EsY0FBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLFNBQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxjQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsZUFBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTs7SUFDQSxDQUFBO0lBQUEsOEJBQUE7QUFBQSxDQVZBLEFBVUEsQ0FWQSxzQkFBQSxHQVVBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBIiwiZmlsZSI6ImpxdWVyeS5kaWFsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICog57yT5a2Y5pWw5o2uXHJcbiAqL1xyXG5jbGFzcyBDYWNoZVVybCB7XHJcbiAgICAvKipcclxuICAgICAqIOe8k+WtmOeahOaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfY2FjaGVEYXRhOiB7W3VybDogc3RyaW5nXTogYW55fSA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog57yT5a2Y55qE5LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIF9ldmVudDoge1t1cmw6IHN0cmluZ106IEFycmF5PChkYXRhOiBhbnkpID0+IHZvaWQ+fSA9IHt9O1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzRGF0YSh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZURhdGEuaGFzT3duUHJvcGVydHkodXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGhhc0V2ZW50KHVybDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50Lmhhc093blByb3BlcnR5KHVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmlbDmja7pgJrov4flm57osIPov5Tlm55cclxuICAgICAqIEBwYXJhbSB1cmwgXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0RGF0YSh1cmw6IHN0cmluZywgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IHZvaWQpIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNEYXRhKHVybCkpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sodGhpcy5fY2FjaGVEYXRhW3VybF0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmhhc0V2ZW50KHVybCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRbdXJsXS5wdXNoKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9ldmVudFt1cmxdID0gW2NhbGxiYWNrXTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICQuZ2V0SlNPTih1cmwsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuY29kZSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5zZXREYXRhKHVybCwgZGF0YS5kYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVVJMIEVSUk9SISAnICsgdXJsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruaVsOaNruW5tuWbnuiwg1xyXG4gICAgICogQHBhcmFtIHVybCBcclxuICAgICAqIEBwYXJhbSBkYXRhIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHNldERhdGEodXJsOiBzdHJpbmcsIGRhdGE6IGFueSkge1xyXG4gICAgICAgIHRoaXMuX2NhY2hlRGF0YVt1cmxdID0gZGF0YTtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzRXZlbnQodXJsKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2V2ZW50W3VybF0uZm9yRWFjaChjYWxsYmFjaz0+e1xyXG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRbdXJsXTtcclxuICAgIH1cclxufSIsImFic3RyYWN0IGNsYXNzIEV2ZSB7XHJcbiAgICBwdWJsaWMgb3B0aW9uczogYW55O1xyXG5cclxuICAgIHB1YmxpYyBvbihldmVudDogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiB0aGlzIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnNbJ29uJyArIGV2ZW50XSA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNFdmVudChldmVudDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnb24nICsgZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cmlnZ2VyKGV2ZW50OiBzdHJpbmcsIC4uLiBhcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIGxldCByZWFsRXZlbnQgPSAnb24nICsgZXZlbnQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0V2ZW50KGV2ZW50KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbcmVhbEV2ZW50XS5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG59IiwiaW50ZXJmYWNlIERpYWxvZ0JveE9wdGlvbiBleHRlbmRzIERpYWxvZ0NvbnRlbnRPcHRpb24ge1xyXG4gICAgaWNvPzogc3RyaW5nLCAgICAgICAvLyDmoIfpopjmoI/nmoTlm77moIdcclxuICAgIHRpdGxlPzogc3RyaW5nLCAgICAgLy8g5qCH6aKYXHJcbiAgICBjYW5Nb3ZlPzogYm9vbGVhbiwgICAgICAgIC8v5piv5ZCm5YWB6K6456e75YqoXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ0JveCBleHRlbmRzIERpYWxvZ0NvbnRlbnQge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dCb3hPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5YaF5a65XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94Lmh0bWwodGhpcy5nZXRIZWFkZXJIdG1sKCkgKyB0aGlzLmdldENvbnRlbnRIdG1sKCkrIHRoaXMuZ2V0Rm9vdGVySHRtbCgpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMub3B0aW9ucy50YXJnZXQgfHwgRGlhbG9nLiR3aW5kb3c7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gdGFyZ2V0LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5ib3gud2lkdGgoKTtcclxuICAgICAgICBsZXQgbWF4SGVpZ2h0ID0gdGFyZ2V0LmhlaWdodCgpO1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmJveC5oZWlnaHQoKTtcclxuICAgICAgICBpZiAobWF4V2lkdGggPiB3aWR0aCAmJiBtYXhIZWlnaHQgPiBoZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5jc3Moe1xyXG4gICAgICAgICAgICAgICAgbGVmdDogKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcsXHJcbiAgICAgICAgICAgICAgICB0b3A6IChtYXhIZWlnaHQgLSBoZWlnaHQpIC8gMiArICdweCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMudHlwZSA9IERpYWxvZ1R5cGUucGFnZTtcclxuICAgICAgICB0aGlzLmJveC5hZGRDbGFzcyhcImRpYWxvZy1wYWdlXCIpO1xyXG4gICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICAvLyDngrnlh7vmoIfpopjmoI/np7vliqhcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIGxldCBpc01vdmUgPSBmYWxzZTtcclxuICAgICAgICBsZXQgeCwgeTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLmRpYWxvZy1oZWFkZXIgLmRpYWxvZy10aXRsZVwiKS5tb3VzZWRvd24oZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBpc01vdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB4ID0gZS5wYWdlWCAtIHBhcnNlSW50KGluc3RhbmNlLmJveC5jc3MoJ2xlZnQnKSk7XHJcbiAgICAgICAgICAgIHkgPSBlLnBhZ2VZIC0gcGFyc2VJbnQoaW5zdGFuY2UuYm94LmNzcygndG9wJykpO1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5ib3guZmFkZVRvKDIwLCAuNSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8v6L+Z6YeM5Y+v6IO95a+86Ie0IOeqgeeEtuaYvuekuuWHuuadpVxyXG4gICAgICAgICQoZG9jdW1lbnQpLm1vdXNlbW92ZShmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNNb3ZlIHx8IGluc3RhbmNlLnN0YXR1cyAhPSBEaWFsb2dTdGF0dXMuc2hvdykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmJveC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wOiBlLnBhZ2VZIC0geSxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGUucGFnZVggLSB4XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkubW91c2V1cChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaXNNb3ZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5ib3ggJiYgaW5zdGFuY2Uuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5zaG93KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5ib3guZmFkZVRvKCdmYXN0JywgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuYm94KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5yZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzdXBlci5iaW5kRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeiuvuWwuuWvuFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVzaXplKCkge1xyXG4gICAgICAgIHRoaXMuc2V0UHJvcGVydHkoKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ0JveE9wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEhlYWRlckh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWhlYWRlclwiPjxkaXYgY2xhc3M9XCJkaWFsb2ctdGl0bGVcIj4nO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaWNvKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxpIGNsYXNzPVwiZmEgZmEtJyArIHRoaXMub3B0aW9ucy5pY28gKyAnXCI+PC9pPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudGl0bGUpIHtcclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLm9wdGlvbnMudGl0bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBodG1sICsgJzwvZGl2PjxpIGNsYXNzPVwiZmEgZmEtY2xvc2UgZGlhbG9nLWNsb3NlXCI+PC9pPjwvZGl2Pic7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ0JveE9wdGlvbiBleHRlbmRzIERlZmF1bHREaWFsb2dDb250ZW50T3B0aW9uIGltcGxlbWVudHMgRGlhbG9nQm94T3B0aW9uIHtcclxuICAgIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JztcclxuICAgIGNhbk1vdmU6IGJvb2xlYW4gPSB0cnVlO1xyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUuYm94LCBEaWFsb2dCb3gpOyIsIi8qKlxyXG4gKiDlt7Lnn6Xpl67pophcclxuICog5aaC5p6c5LiA5Liq5LiN6IO95YWz6Zet77yMIOWkmuS4quWwhuWHuueOsOmUmeS5sVxyXG4gKi9cclxuYWJzdHJhY3QgY2xhc3MgRGlhbG9nQ29yZSBleHRlbmRzIEJveCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBwdWJsaWMgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdE9wdGlvbigpLCBvcHRpb24pO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50eXBlID0gIERpYWxvZy5wYXJzZUVudW08RGlhbG9nVHlwZT4odGhpcy5vcHRpb25zLnR5cGUsIERpYWxvZ1R5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcHRpb25zOiBEaWFsb2dPcHRpb247XHJcblxyXG4gICAgcHJpdmF0ZSBfc3RhdHVzOiBEaWFsb2dTdGF0dXMgPSBEaWFsb2dTdGF0dXMuY2xvc2VkO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgc3RhdHVzKCk6IERpYWxvZ1N0YXR1cyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXR1cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHN0YXR1cyhhcmc6IERpYWxvZ1N0YXR1cykge1xyXG4gICAgICAgIGFyZyA9IERpYWxvZy5wYXJzZUVudW08RGlhbG9nU3RhdHVzPihhcmcsIERpYWxvZ1N0YXR1cyk7XHJcbiAgICAgICAgLy8g55u45ZCM54q25oCB5LiN5YGa5pON5L2cXHJcbiAgICAgICAgaWYgKHRoaXMuX3N0YXR1cyA9PSBhcmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKGFyZykge1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ1N0YXR1cy5zaG93OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Qm94KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dTdGF0dXMuaGlkZTpcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZUJveCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nU3RhdHVzLmNsb3Npbmc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NpbmdCb3goKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ1N0YXR1cy5jbG9zZWQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlQm94KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IFwic3RhdHVzIGVycm9yOlwiKyBhcmc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIF9kaWFsb2dCZzogSlF1ZXJ5OyAgLy8g6Ieq5bex55qE6IOM5pmv6YGu572pXHJcblxyXG4gICAgcHJpdmF0ZSBfeTogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgeSgpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICghdGhpcy5feSkge1xyXG4gICAgICAgICAgICB0aGlzLl95ID0gdGhpcy5ib3gub2Zmc2V0KCkudG9wIC0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5feTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHkoeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5feSA9IHk7XHJcbiAgICAgICAgdGhpcy5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICghdGhpcy5faGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hlaWdodCA9IHRoaXMuYm94LmhlaWdodCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgaGVpZ2h0KGhlaWdodDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuYm94LmhlaWdodChoZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pS55Y+Y54q25oCBXHJcbiAgICAgKiBAcGFyYW0gc3RhdHVzIFxyXG4gICAgICogQHBhcmFtIGhhc0V2ZW50IFxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY2hhbmdlU3RhdHVzKHN0YXR1czogRGlhbG9nU3RhdHVzLCBoYXNFdmVudDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKGhhc0V2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlum7mOiupOiuvue9rlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpOiBEaWFsb2dPcHRpb24ge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ09wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuW5tuaYvuekuuaOp+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2hvd0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdzaG93JykpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3Nob3cgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJveC5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLnNob3c7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rlubbpmpDol4/mjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGhpZGVCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJveCkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZhbHNlID09IHRoaXMudHJpZ2dlcignaGlkZScpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdoaWRlIHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ib3guaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IERpYWxvZ1N0YXR1cy5oaWRlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yqo55S75YWz6Zet77yM5pyJ5YWz6Zet5Yqo55S7XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjbG9zaW5nQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmNsb3NpbmcgXHJcbiAgICAgICAgfHwgdGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmNsb3NlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLnRyaWdnZXIoJ2Nsb3NpbmcnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2luZyBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IERpYWxvZ1N0YXR1cy5jbG9zaW5nO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ib3guYWRkQ2xhc3MoJ2RpYWxvZy1jbG9zaW5nJykub25lKCd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2luZykge1xyXG4gICAgICAgICAgICAgICAgLy8g6Ziy5q2i5Lit6YCU5pS55Y+Y5b2T5YmN54q25oCBXHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5jbG9zZUJveCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKDpmaTmjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNsb3NlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy50cmlnZ2VyKCdjbG9zZWQnKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2VkIHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLmNsb3NlZDtcclxuICAgICAgICBpZiAodGhpcy5fZGlhbG9nQmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGlhbG9nQmcucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cucmVtb3ZlSXRlbSh0aGlzLmlkKTsgXHJcbiAgICAgICAgdGhpcy5ib3gucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5ib3ggPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IGluaXQoKTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29yZSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveCA9ICQoJzxkaXYgY2xhc3M9XCJkaWFsb2cgZGlhbG9nLScrIERpYWxvZ1R5cGVbdGhpcy5vcHRpb25zLnR5cGVdICsnXCIgZGF0YS10eXBlPVwiZGlhbG9nXCIgZGlhbG9nLWlkPScrIHRoaXMuaWQgKyc+PC9kaXY+Jyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZUNvbnRlbnQoKTogdGhpcztcclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc2V0UHJvcGVydHkoKTogdGhpcztcclxuXHJcblxyXG4gICAgcHVibGljIGNzcyhrZXk6IGFueSwgdmFsdWU/OiBzdHJpbmd8IG51bWJlcik6IEpRdWVyeSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYm94LmNzcyhrZXksIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvdygpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IERpYWxvZ1N0YXR1cy5zaG93O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWRlKCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gRGlhbG9nU3RhdHVzLmhpZGU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsb3NlKCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gRGlhbG9nU3RhdHVzLmNsb3Npbmc7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRvZ2dsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmhpZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bnm7jlkIznsbvlnovlvLnlh7rmoYbnmoTmnIDkuIrpnaJcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldERpYWxvZ1RvcCgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCB5O1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgRGlhbG9nLm1hcChpdGVtID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucy50eXBlICE9IHRoaXMub3B0aW9ucy50eXBlIHx8IGl0ZW0uaWQgPT0gaW5zdGFuY2UuaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXkgfHwgaXRlbS55IDwgeSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IGl0ZW0ueTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldERpYWxvZ0JvdHRvbSgpOiBudW1iZXIgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGxldCB5O1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgRGlhbG9nLm1hcChpdGVtID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucy50eXBlICE9IHRoaXMub3B0aW9ucy50eXBlIHx8IGl0ZW0uaWQgPT0gaW5zdGFuY2UuaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgYm90dG9tID0gaXRlbS55ICsgaXRlbS5oZWlnaHQ7XHJcbiAgICAgICAgICAgIGlmICgheSB8fCBib3R0b20gPiB5KSB7XHJcbiAgICAgICAgICAgICAgICB5ID0gYm90dG9tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBwcml2YXRlIF9nZXRCb3R0b20oKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLmhlaWdodCgpICogLjMzIC0gdGhpcy5oZWlnaHQgLyAyLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRUb3AoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLmhlaWdodCgpIC8gMiAtIHRoaXMuaGVpZ2h0IC8gMiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0TGVmdCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgkKHdpbmRvdykud2lkdGgoKSAvIDIgLSB0aGlzLmJveC53aWR0aCgpIC8gMiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UmlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLndpZHRoKCkgLyAyIC0gdGhpcy5ib3gud2lkdGgoKSAvIDIsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFdpZHRoKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gRGlhbG9nLiR3aW5kb3cud2lkdGgoKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndpZHRoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB3aWR0aCAqIHRoaXMub3B0aW9ucy53aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gRGlhbG9nLiR3aW5kb3cuaGVpZ2h0KCk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oZWlnaHQgPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoZWlnaHQgKiB0aGlzLm9wdGlvbnMuaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldExlZnRUb3AoZGlyZWN0aW9uOiBEaWFsb2dEaXJlY3Rpb24sIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBib3hXaWR0aDogbnVtYmVyLCBib3hIZWlnaHQ6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnRUb3A6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIDBdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi50b3A6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyhib3hIZWlnaHQgLSB3aWR0aCkgLyAyLCAwXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHRUb3A6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2JveEhlaWdodCAtIHdpZHRoLCAwXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2JveEhlaWdodCAtIHdpZHRoLCAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodEJvdHRvbTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbYm94SGVpZ2h0IC0gd2lkdGgsIGJveEhlaWdodCAtIGhlaWdodF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmJvdHRvbTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbKGJveEhlaWdodCAtIHdpZHRoKSAvIDIsIGJveEhlaWdodCAtIGhlaWdodF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnRCb3R0b206XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIGJveEhlaWdodCAtIGhlaWdodF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmNlbnRlcjpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbKGJveEhlaWdodCAtIHdpZHRoKSAvIDIsIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiY2xhc3MgRGVmYXVsdERpYWxvZ09wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ09wdGlvbiB7XHJcbiAgICB0aXRsZTogc3RyaW5nID0gJ+aPkOekuic7XHJcbiAgICB0eXBlPzogRGlhbG9nVHlwZSA9IERpYWxvZ1R5cGUudGlwO1xyXG4gICAgY2FuTW92ZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBvbmRvbmU6IEZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgRGlhbG9nIHtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIG1ldGhvZHM6IHtbdHlwZTogbnVtYmVyXTogRnVuY3Rpb259ID0ge307XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2RhdGE6IHtbaWQ6IG51bWJlcl06IERpYWxvZ0NvcmV9ID0ge307XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2d1aWQ6IG51bWJlciA9IDA7IC8vIGlk5qCH6K6wXHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX3RpcERhdGE6IEFycmF5PG51bWJlcj4gPSBbXTtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfZGlhbG9nQmc6IEpRdWVyeTtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfYmdMb2NrOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgJHdpbmRvdyA9ICQod2luZG93KTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+mAoOW8ueWHuuahhlxyXG4gICAgICogQHBhcmFtIG9wdGlvbiBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGU8VD4ob3B0aW9uPzogRGlhbG9nT3B0aW9uKTogVCB7XHJcbiAgICAgICAgaWYgKCFvcHRpb24udHlwZSkge1xyXG4gICAgICAgICAgICBvcHRpb24udHlwZSA9IERpYWxvZ1R5cGUudGlwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvcHRpb24udHlwZSA9IHRoaXMucGFyc2VFbnVtPERpYWxvZ1R5cGU+KG9wdGlvbi50eXBlLCBEaWFsb2dUeXBlKTtcclxuICAgICAgICBsZXQgbWV0aG9kOiBhbnkgPSB0aGlzLmdldE1ldGhvZChvcHRpb24udHlwZSk7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBuZXcgbWV0aG9kKG9wdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBwYXJzZUVudW08VD4odmFsOiBhbnksIHR5cGU6IGFueSk6IFQge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlW3ZhbF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmj5DnpLpcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpbWUgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgdGlwKGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ1RpcE9wdGlvbiwgdGltZTogbnVtYmVyID0gMjAwMCk6IERpYWxvZ1RpcCB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7Y29udGVudDogY29udGVudCwgdGltZTogdGltZX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUudGlwO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZTxEaWFsb2dUaXA+KGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa2iOaBr1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGltZSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBtZXNzYWdlKGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ01lc3NhZ2VPcHRpb24sIHRpbWU6IG51bWJlciA9IDIwMDApOiBEaWFsb2dNZXNzYWdlIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtjb250ZW50OiBjb250ZW50LCB0aW1lOiB0aW1lfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS5tZXNzYWdlO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZTxEaWFsb2dNZXNzYWdlPihjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBwb3AoY29udGVudDogc3RyaW5nIHwgRGlhbG9nUG9wT3B0aW9uLCB0YXJnZXQ6IEpRdWVyeSwgdGltZTogbnVtYmVyID0gMjAwMCk6IERpYWxvZ1BvcCB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7Y29udGVudDogY29udGVudCwgdGltZTogdGltZSwgdGFyZ2V0OiB0YXJnZXR9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLnBvcDtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGU8RGlhbG9nUG9wPihjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliqDovb1cclxuICAgICAqIEBwYXJhbSB0aW1lIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGxvYWRpbmcodGltZTogbnVtYmVyIHwgRGlhbG9nT3B0aW9uID0gMCk6IERpYWxvZ0xvYWRpbmcge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGltZSAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aW1lID0ge3RpbWU6IHRpbWV9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aW1lLnR5cGUgPSBEaWFsb2dUeXBlLmxvYWRpbmc7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlPERpYWxvZ0xvYWRpbmc+KHRpbWUpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWGheWuueW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNvbnRlbnQoY29udGVudDogc3RyaW5nIHwgRGlhbG9nT3B0aW9uLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pOiBEaWFsb2dDb250ZW50IHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgICAgIGhhc05vOiBoYXNOb1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLmNvbnRlbnQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlPERpYWxvZ0NvbnRlbnQ+KGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaZrumAmuW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGJveChjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dPcHRpb24sIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JywgaGFzWWVzPzogYm9vbGVhbiwgaGFzTm8/OiBib29sZWFuKTogRGlhbG9nQm94IHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgICAgIGhhc05vOiBoYXNOb1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLmJveDtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGU8RGlhbG9nQm94Pihjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDooajmoLzlvLnnqpdcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGRvbmUgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGZvcm0oY29udGVudDogYW55LCB0aXRsZTogc3RyaW5nID0gJ+aPkOekuicsIGRvbmU/OiBGdW5jdGlvbiwgaGFzWWVzPzogYm9vbGVhbiwgaGFzTm8/OiBib29sZWFuKTogRGlhbG9nRm9ybSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlPERpYWxvZ0Zvcm0+KHtcclxuICAgICAgICAgICAgdHlwZTogRGlhbG9nVHlwZS5mb3JtLFxyXG4gICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIGhhc1llczogaGFzWWVzLFxyXG4gICAgICAgICAgICBoYXNObzogaGFzTm8sXHJcbiAgICAgICAgICAgIG9uZG9uZTogZG9uZVxyXG4gICAgICAgIH0pLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmhtemdouW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHBhZ2UoY29udGVudDogc3RyaW5nIHwgRGlhbG9nT3B0aW9uLCB0aXRsZTogc3RyaW5nID0gJ+aPkOekuicsIGhhc1llcz86IGJvb2xlYW4sIGhhc05vPzogYm9vbGVhbik6IERpYWxvZ1BhZ2Uge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICAgICAgICAgIGhhc1llczogaGFzWWVzLFxyXG4gICAgICAgICAgICAgICAgaGFzTm86IGhhc05vXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUucGFnZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGU8RGlhbG9nUGFnZT4oY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qGM6Z2i5o+Q6YaSXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSBpY29uIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG5vdGlmeSh0aXRsZTogc3RyaW5nICB8IERpYWxvZ09wdGlvbiA9ICfpgJrnn6UnLCBjb250ZW50OiBzdHJpbmcgPSAnJywgaWNvbjogc3RyaW5nID0gJycpOiBEaWFsb2dOb3RpZnkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGl0bGUgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgdGl0bGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgaWNvOiBpY29uXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRpdGxlLnR5cGUgPSBEaWFsb2dUeXBlLm5vdGlmeTtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGU8RGlhbG9nTm90aWZ5Pih0aXRsZSkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBhZGRJdGVtKGVsZW1lbnQ6IERpYWxvZ0NvcmUpIHtcclxuICAgICAgICB0aGlzLl9kYXRhWysrdGhpcy5fZ3VpZF0gPSBlbGVtZW50O1xyXG4gICAgICAgIGVsZW1lbnQuaWQgPSB0aGlzLl9ndWlkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzSXRlbShpZDogbnVtYmVyIHwgc3RyaW5nID0gdGhpcy5fZ3VpZCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGlkICsgJycpXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQoaWQ6IG51bWJlciB8IHN0cmluZyA9IHRoaXMuX2d1aWQpIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IFwiZXJyb3I6XCIgKyBpZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk5Yig6Zmk5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gaWQgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlSXRlbShpZDogbnVtYmVyID0gdGhpcy5fZ3VpZCkge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RhdGFbaWRdLmNsb3NlKCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX2RhdGFbaWRdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yig6Zmk5omA5pyJ5by55Ye65qGGXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlKCkge1xyXG4gICAgICAgIHRoaXMubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgaXRlbS5jbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5b6q546v5omA5pyJ5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbWFwKGNhbGxiYWNrOiAoaXRlbTogRGlhbG9nQ29yZSkgPT4gYW55KSB7XHJcbiAgICAgICAgZm9yKGxldCBpZCBpbiB0aGlzLl9kYXRhKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGNhbGxiYWNrKHRoaXMuX2RhdGFbaWRdKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S66YGu572pXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2hvd0JnKHRhcmdldDogSlF1ZXJ5ID0gJChkb2N1bWVudC5ib2R5KSwgaXNQdWJsaWM6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBpZiAoIXRoaXMuX2RpYWxvZ0JnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnID0gJCgnPGRpdiBjbGFzcz1cImRpYWxvZy1iZ1wiPjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLl9kaWFsb2dCZy5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDmm7TmlLnpga7nvannmoTkvY3nva5cclxuICAgICAgICB0YXJnZXQuYXBwZW5kKHRoaXMuX2RpYWxvZ0JnKTtcclxuICAgICAgICB0aGlzLl9kaWFsb2dCZy50b2dnbGVDbGFzcygnZGlhbG9nLWJnLXByaXZhdGUnLCAhaXNQdWJsaWMpO1xyXG4gICAgICAgIHRoaXMuX2JnTG9jayArKztcclxuICAgICAgICB0aGlzLl9kaWFsb2dCZy5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpmpDol4/pga7nvalcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjbG9zZUJnKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fZGlhbG9nQmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9iZ0xvY2stLTtcclxuICAgICAgICBpZiAodGhpcy5fYmdMb2NrID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RpYWxvZ0JnLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGFkZE1ldGhvZCh0eXBlOiBEaWFsb2dUeXBlLCBkaWFsb2c6IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5tZXRob2RzW3R5cGVdID0gZGlhbG9nO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzTWV0aG9kKHR5cGU6IERpYWxvZ1R5cGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXRob2RzLmhhc093blByb3BlcnR5KHR5cGUudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRNZXRob2QodHlwZTogRGlhbG9nVHlwZSk6IEZ1bmN0aW9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXRob2RzW3R5cGVdO1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIOW8ueWHuuahhuexu+Wei1xyXG4gKi9cclxuZW51bSBEaWFsb2dUeXBlIHtcclxuICAgIHRpcCxcclxuICAgIG1lc3NhZ2UsXHJcbiAgICBub3RpZnksXHJcbiAgICBwb3AsXHJcbiAgICBsb2FkaW5nLFxyXG4gICAgc2VsZWN0LFxyXG4gICAgaW1hZ2UsXHJcbiAgICBkaXNrLFxyXG4gICAgZm9ybSxcclxuICAgIGNvbnRlbnQsXHJcbiAgICBib3gsXHJcbiAgICBwYWdlXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlvLnlh7rmoYbkvY3nva5cclxuICovXHJcbmVudW0gRGlhbG9nRGlyZWN0aW9uIHtcclxuICAgIHRvcCxcclxuICAgIHJpZ2h0LFxyXG4gICAgYm90dG9tLFxyXG4gICAgbGVmdCxcclxuICAgIGNlbnRlcixcclxuICAgIGxlZnRUb3AsXHJcbiAgICByaWdodFRvcCxcclxuICAgIHJpZ2h0Qm90dG9tLFxyXG4gICAgbGVmdEJvdHRvbVxyXG59XHJcblxyXG4vKipcclxuICog5by55Ye65qGG54q25oCBXHJcbiAqL1xyXG5lbnVtIERpYWxvZ1N0YXR1cyB7XHJcbiAgICBoaWRlLFxyXG4gICAgc2hvdyxcclxuICAgIGNsb3NpbmcsICAgLy/lhbPpl63kuK1cclxuICAgIGNsb3NlZCAgICAvL+W3suWFs+mXrVxyXG59XHJcblxyXG5lbnVtIERpYWxvZ0Rpc2tUeXBlIHtcclxuICAgIGZpbGUsXHJcbiAgICBkaXJlY3RvcnlcclxufSIsImNsYXNzIERpYWxvZ1BsdWdpbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICAgIHB1YmxpYyBvcHRpb24/OiBEaWFsb2dPcHRpb25cclxuICAgICkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIWluc3RhbmNlLmRpYWxvZykge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuZGlhbG9nID0gRGlhbG9nLmNyZWF0ZShpbnN0YW5jZS5fcGFyc2VPcHRpb24oJCh0aGlzKSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmRpYWxvZy5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpYWxvZzogRGlhbG9nQ29yZTtcclxuXHJcbiAgICBwcml2YXRlIF9wYXJzZU9wdGlvbihlbGVtZW50OiBKUXVlcnkpIHtcclxuICAgICAgICBsZXQgb3B0aW9uOiBEaWFsb2dPcHRpb24gPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb24pO1xyXG4gICAgICAgIG9wdGlvbi50eXBlID0gRGlhbG9nLnBhcnNlRW51bTxEaWFsb2dUeXBlPihlbGVtZW50LmF0dHIoJ2RpYWxvZy10eXBlJykgfHwgdGhpcy5vcHRpb24udHlwZSwgRGlhbG9nVHlwZSk7XHJcbiAgICAgICAgb3B0aW9uLmNvbnRlbnQgPSBlbGVtZW50LmF0dHIoJ2RpYWxvZy1jb250ZW50JykgfHwgdGhpcy5vcHRpb24uY29udGVudDtcclxuICAgICAgICBvcHRpb24udXJsID0gZWxlbWVudC5hdHRyKCdkaWFsb2ctdXJsJykgfHwgdGhpcy5vcHRpb24udXJsO1xyXG4gICAgICAgIG9wdGlvbi50aW1lID0gcGFyc2VJbnQoZWxlbWVudC5hdHRyKCdkaWFsb2ctdGltZScpKSB8fCB0aGlzLm9wdGlvbi50aW1lO1xyXG4gICAgICAgIGlmIChvcHRpb24udHlwZSA9PSBEaWFsb2dUeXBlLnBvcCAmJiAhb3B0aW9uLnRhcmdldCkge1xyXG4gICAgICAgICAgICBvcHRpb24udGFyZ2V0ID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9wdGlvbjtcclxuICAgIH1cclxufVxyXG5cclxuOyhmdW5jdGlvbigkOiBhbnkpIHtcclxuICAgICQuZm4uZGlhbG9nID0gZnVuY3Rpb24ob3B0aW9uID86IERpYWxvZ09wdGlvbikge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nUGx1Z2luKHRoaXMsIG9wdGlvbik7XHJcbiAgICB9O1xyXG59KShqUXVlcnkpOyIsImludGVyZmFjZSBEaWFsb2dUaXBPcHRpb24gZXh0ZW5kcyBEaWFsb2dPcHRpb24ge1xyXG4gICAgdGltZT86IG51bWJlciwgICAgICAgICAvL+aYvuekuuaXtumXtFxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dUaXAgZXh0ZW5kcyBEaWFsb2dDb3JlIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3B0aW9uczogRGlhbG9nVGlwT3B0aW9uO1xyXG5cclxuICAgIHByaXZhdGUgX3RpbWVIYW5kbGU6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuICAgICAgICBEaWFsb2cuYWRkSXRlbSh0aGlzKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUNvcmUoKS5jcmVhdGVDb250ZW50KClcclxuICAgICAgICAuYXBwZW5kUGFyZW50KCkuc2V0UHJvcGVydHkoKS5iaW5kRXZlbnQoKVxyXG4gICAgICAgIC5hZGRUaW1lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nVGlwT3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7lhoXlrrlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3gudGV4dCh0aGlzLm9wdGlvbnMuY29udGVudCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDliLDlrrnlmajkuIpcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGFwcGVuZFBhcmVudCgpOiB0aGlzIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy50YXJnZXQpIHtcclxuICAgICAgICAgICAgJChkb2N1bWVudC5ib2R5KS5hcHBlbmQodGhpcy5ib3gpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnRhcmdldC5hcHBlbmQodGhpcy5ib3gpO1xyXG4gICAgICAgIHRoaXMuYm94LmFkZENsYXNzKFwiZGlhbG9nLXByaXZhdGVcIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7lsZ7mgKdcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIGxldCBtYXhXaWR0aCA9IERpYWxvZy4kd2luZG93LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5ib3gud2lkdGgoKTtcclxuICAgICAgICB0aGlzLnkgPSAodGhpcy5nZXREaWFsb2dUb3AoKSB8fCAoRGlhbG9nLiR3aW5kb3cuaGVpZ2h0KCkgKiAwLjY4ICsgMzApKSAtIDMwIC0gdGhpcy5oZWlnaHQ7IFxyXG4gICAgICAgIHRoaXMuY3NzKCdsZWZ0JywgKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog57uR5a6a5LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLmJveCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeiuvuWwuuWvuFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVzaXplKCkge1xyXG4gICAgICAgIGxldCBtYXhXaWR0aCA9IERpYWxvZy4kd2luZG93LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5ib3gud2lkdGgoKTtcclxuICAgICAgICB0aGlzLmNzcygnbGVmdCcsIChtYXhXaWR0aCAtIHdpZHRoKSAvIDIgKyAncHgnKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhZGRUaW1lKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudGltZSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLl90aW1lSGFuZGxlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2UuX3RpbWVIYW5kbGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmNsb3NlKCk7XHJcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zLnRpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzdG9wVGltZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3RpbWVIYW5kbGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZUhhbmRsZSk7XHJcbiAgICAgICAgdGhpcy5fdGltZUhhbmRsZSA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2luZ0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXN1cGVyLmNsb3NpbmdCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3RvcFRpbWUoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2VCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zZUJveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jaGFuZ2VPdGhlcigpO1xyXG4gICAgICAgIHRoaXMuc3RvcFRpbWUoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2hhbmdlT3RoZXIoKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBEaWFsb2cubWFwKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5vcHRpb25zLnR5cGUgIT0gRGlhbG9nVHlwZS50aXAgfHwgaXRlbS55ID49IGluc3RhbmNlLnkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpdGVtLnkgKz0gaW5zdGFuY2UuaGVpZ2h0ICsgMzA7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dUaXBPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dUaXBPcHRpb24ge1xyXG4gICAgdGltZTogbnVtYmVyID0gMjAwMDtcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLnRpcCwgRGlhbG9nVGlwKTsiLCJpbnRlcmZhY2UgRGlhbG9nTWVzc2FnZU9wdGlvbiBleHRlbmRzIERpYWxvZ1RpcE9wdGlvbiB7XHJcblxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dNZXNzYWdlIGV4dGVuZHMgRGlhbG9nVGlwIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy55ID0gKHRoaXMuZ2V0RGlhbG9nQm90dG9tKCkgfHwgKERpYWxvZy4kd2luZG93LmhlaWdodCgpICogMC4xIC0gMzApKSArIDMwO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNoYW5nZU90aGVyKCkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgRGlhbG9nLm1hcChpdGVtID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucy50eXBlICE9IERpYWxvZ1R5cGUubWVzc2FnZSB8fCBpdGVtLnkgPD0gaW5zdGFuY2UueSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGl0ZW0ueSAtPSBpbnN0YW5jZS5oZWlnaHQgKyAzMDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLm1lc3NhZ2UsIERpYWxvZ01lc3NhZ2UpOyIsImludGVyZmFjZSBEaWFsb2dOb3RpZnlPcHRpb24gZXh0ZW5kcyBEaWFsb2dUaXBPcHRpb24ge1xyXG4gICAgdGl0bGU/OiBzdHJpbmcsXHJcbiAgICBpY28/OiBzdHJpbmdcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nTm90aWZ5IGV4dGVuZHMgRGlhbG9nVGlwIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ05vdGlmeU9wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9wdGlvbnM6IERpYWxvZ05vdGlmeU9wdGlvbjtcclxuXHJcbiAgICBwdWJsaWMgbm90aWZ5OiBOb3RpZmljYXRpb247IC8vIOezu+e7n+mAmuefpVxyXG5cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6buY6K6k6K6+572uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ05vdGlmeU9wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzaG93Qm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLm5vdGlmeSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5hZGRJdGVtKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX2NyZWF0ZU5vdGlmeSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBoaWRlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNsb3NlQm94KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NpbmdCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvc2VCb3goKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2VCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5jbG9zaW5nIFxyXG4gICAgICAgIHx8IHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5jbG9zZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdjbG9zZWQnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2VkIHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY2xvc2VOb3RpZnkoKTtcclxuICAgICAgICBEaWFsb2cucmVtb3ZlSXRlbSh0aGlzLmlkKTsgXHJcbiAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGlhbG9nU3RhdHVzLmNsb3NlZCk7XHJcbiAgICAgICAgdGhpcy5zdG9wVGltZSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZU5vdGlmeSgpIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIGlmIChcIk5vdGlmaWNhdGlvblwiIGluIHdpbmRvdykge1xyXG4gICAgICAgICAgICBsZXQgYXNrID0gTm90aWZpY2F0aW9uLnJlcXVlc3RQZXJtaXNzaW9uKCk7XHJcbiAgICAgICAgICAgIGFzay50aGVuKHBlcm1pc3Npb24gPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBlcm1pc3Npb24gIT09IFwiZ3JhbnRlZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+aCqOeahOa1j+iniOWZqOaUr+aMgeS9huacquW8gOWQr+ahjOmdouaPkOmGku+8gScpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5ub3RpZnkgPSBuZXcgTm90aWZpY2F0aW9uKGluc3RhbmNlLm9wdGlvbnMudGl0bGUsIHtcclxuICAgICAgICAgICAgICAgICAgICBib2R5OiBpbnN0YW5jZS5vcHRpb25zLmNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogaW5zdGFuY2Uub3B0aW9ucy5pY28sXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLm5vdGlmeS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnRyaWdnZXIoJ2RvbmUnKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygn5oKo55qE5rWP6KeI5Zmo5LiN5pSv5oyB5qGM6Z2i5o+Q6YaS77yBJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY2xvc2VOb3RpZnkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm5vdGlmeSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubm90aWZ5LmNsb3NlKCk7XHJcbiAgICAgICAgdGhpcy5ub3RpZnkgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nTm90aWZ5T3B0aW9uIGV4dGVuZHMgRGVmYXVsdERpYWxvZ1RpcE9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ05vdGlmeU9wdGlvbiB7XHJcbiAgICB0aXRsZTogc3RyaW5nID0gJ+aPkOekuic7XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5ub3RpZnksIERpYWxvZ05vdGlmeSk7IiwiaW50ZXJmYWNlIERpYWxvZ1BvcE9wdGlvbiBleHRlbmRzIERpYWxvZ1RpcE9wdGlvbiB7XHJcbiAgICBkaXJlY3Rpb24/OiBEaWFsb2dEaXJlY3Rpb24gfCBzdHJpbmcgfCBudW1iZXIsXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ1BvcCBleHRlbmRzIERpYWxvZ1RpcCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ1BvcE9wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9IERpYWxvZy5wYXJzZUVudW08RGlhbG9nRGlyZWN0aW9uPih0aGlzLm9wdGlvbnMuZGlyZWN0aW9uLCBEaWFsb2dEaXJlY3Rpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuX3NldFBvcFByb3BlcnR5KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDliLDlrrnlmajkuIpcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGFwcGVuZFBhcmVudCgpOiB0aGlzIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0aGlzLmJveCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRSYW5kb21EaXJlY3Rpb24oKTogRGlhbG9nRGlyZWN0aW9uIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoTWF0aC5yYW5kb20oKSAqIDgpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zZXRQb3BQcm9wZXJ0eSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9IHRoaXMuX2dldFJhbmRvbURpcmVjdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJveC5hZGRDbGFzcygnZGlhbG9nLXBvcC0nICsgRGlhbG9nRGlyZWN0aW9uW3RoaXMub3B0aW9ucy5kaXJlY3Rpb25dKTtcclxuICAgICAgICBsZXQgb2ZmZXN0ID0gdGhpcy5vcHRpb25zLnRhcmdldC5vZmZzZXQoKTtcclxuICAgICAgICBsZXQgW3gsIHldID0gdGhpcy5fZ2V0UG9wTGVmdFRvcChEaWFsb2cucGFyc2VFbnVtPERpYWxvZ0RpcmVjdGlvbj4odGhpcy5vcHRpb25zLmRpcmVjdGlvbiwgRGlhbG9nQ29yZSksIHRoaXMuYm94Lm91dGVyV2lkdGgoKSwgdGhpcy5ib3gub3V0ZXJIZWlnaHQoKSwgb2ZmZXN0LmxlZnQsIG9mZmVzdC50b3AsIHRoaXMub3B0aW9ucy50YXJnZXQub3V0ZXJXaWR0aCgpLCB0aGlzLm9wdGlvbnMudGFyZ2V0Lm91dGVySGVpZ2h0KCkpO1xyXG4gICAgICAgIHRoaXMuYm94LmNzcyh7XHJcbiAgICAgICAgICAgIGxlZnQ6IHggKyAncHgnLFxyXG4gICAgICAgICAgICB0b3A6IHkgKyAncHgnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UG9wTGVmdFRvcChkaXJlY3Rpb246IERpYWxvZ0RpcmVjdGlvbiwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyLCBib3hXaWR0aDogbnVtYmVyLCBib3hIZWlnaHQ6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIGxldCBzcGFjZSA9IDMwOyAvLyDnqbrpmplcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodFRvcDpcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ggKyBib3hXaWR0aCArIHNwYWNlLCB5ICsgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHRCb3R0b206XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmJvdHRvbTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbeCArIChib3hXaWR0aCAtIHdpZHRoKSAvIDIsICB5ICsgYm94SGVpZ2h0ICsgc3BhY2VdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0Qm90dG9tOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt4IC0gd2lkdGggLSBzcGFjZSwgeSArIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmNlbnRlcjpcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ubGVmdFRvcDpcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24udG9wOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt4ICsgKGJveFdpZHRoIC0gd2lkdGgpIC8gMiwgeSAtIGhlaWdodCAtIHNwYWNlXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5wb3AsIERpYWxvZ1BvcCk7IiwiaW50ZXJmYWNlIERpYWxvZ0xvYWRpbmdPcHRpb24gZXh0ZW5kcyBEaWFsb2dUaXBPcHRpb24ge1xyXG4gICAgY291bnQ/OiBudW1iZXI7XHJcbiAgICBleHRyYT86IHN0cmluZ1xyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dMb2FkaW5nIGV4dGVuZHMgRGlhbG9nVGlwIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nTG9hZGluZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nTG9hZGluZ09wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94Lmh0bWwodGhpcy5fZ2V0TG9hZGluZygpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICBsZXQgdGFyZ2V0ID0gdGhpcy5vcHRpb25zLnRhcmdldCB8fCBEaWFsb2cuJHdpbmRvdztcclxuICAgICAgICBsZXQgbWF4V2lkdGggPSB0YXJnZXQud2lkdGgoKTtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmJveC53aWR0aCgpO1xyXG4gICAgICAgIGxldCBtYXhIZWlnaHQgPSB0YXJnZXQuaGVpZ2h0KCk7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMuYm94LmhlaWdodCgpO1xyXG4gICAgICAgIHRoaXMuY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcsXHJcbiAgICAgICAgICAgIHRvcDogKG1heEhlaWdodCAtIGhlaWdodCkgLyAyICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldExvYWRpbmcoKSB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICBsZXQgbnVtID0gdGhpcy5vcHRpb25zLmNvdW50O1xyXG4gICAgICAgIGZvcig7IG51bSA+IDA7IG51bSAtLSkge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8c3Bhbj48L3NwYW4+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJysgdGhpcy5vcHRpb25zLmV4dHJhICsnXCI+JysgaHRtbCArJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNob3dCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFzdXBlci5zaG93Qm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy50YXJnZXQpIHtcclxuICAgICAgICAgICAgRGlhbG9nLnNob3dCZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLnNob3dCZyh0aGlzLm9wdGlvbnMudGFyZ2V0LCBmYWxzZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGhpZGVCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFzdXBlci5oaWRlQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zaW5nQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghc3VwZXIuY2xvc2luZ0JveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2VCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xyXG4gICAgICAgIGlmICghc3VwZXIuY2xvc2VCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdGF0dXMgIT0gRGlhbG9nU3RhdHVzLmNsb3NpbmcpIHtcclxuICAgICAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ0xvYWRpbmdPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dMb2FkaW5nT3B0aW9uIHtcclxuICAgIGV4dHJhOiBzdHJpbmcgPSAnbG9hZGluZyc7ICAgICAgLy/pop3lpJbnmoRjbGFzc1xyXG4gICAgY291bnQ6IG51bWJlciA9IDU7XHJcbiAgICB0aW1lOiBudW1iZXIgPSAwO1xyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUubG9hZGluZywgRGlhbG9nTG9hZGluZyk7XHJcblxyXG4iLCJpbnRlcmZhY2UgRGlhbG9nQnV0dG9uIHtcclxuICAgIGNvbnRlbnQ6IHN0cmluZyxcclxuICAgIHRhZz86IHN0cmluZ1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRGlhbG9nQ29udGVudE9wdGlvbiBleHRlbmRzIERpYWxvZ09wdGlvbiB7XHJcbiAgICB1cmw/OiBzdHJpbmcsICAgICAgIC8vIGFqYXjor7fmsYJcclxuICAgIGJ1dHRvbj86IHN0cmluZyB8IHN0cmluZ1tdfCBEaWFsb2dCdXR0b25bXSxcclxuICAgIGhhc1llcz86IGJvb2xlYW4gfCBzdHJpbmc7IC8vIOaYr+WQpuacieehruWumuaMiemSrlxyXG4gICAgaGFzTm8/OiBib29sZWFuIHwgc3RyaW5nOyAgLy8g5piv5ZCm5pyJ5Y+W5raI5oyJ6ZKuXHJcbiAgICBvbmRvbmU/OiBGdW5jdGlvbiAgICAgICAgLy/ngrnnoa7lrprml7bop6blj5FcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nQ29udGVudCBleHRlbmRzIERpYWxvZ0NvcmUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nQ29udGVudE9wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuY29udGVudCAmJiB0aGlzLm9wdGlvbnMudXJsKSB7XHJcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgJC5nZXQodGhpcy5vcHRpb25zLnVybCwgZnVuY3Rpb24oaHRtbCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2Uub3B0aW9ucy5jb250ZW50ID0gaHRtbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5pbml0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pc0xvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTsgLy/liqDovb3kuK0g5pi+56S65pe25YCZ5Ye6546w5Yqg6L295Yqo55S7XHJcblxyXG4gICAgcHJpdmF0ZSBfbG9hZGluZ0RpYWxvZzogRGlhbG9nQ29yZTtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlzTG9hZGluZygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNMb2FkaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgaXNMb2FkaW5nKGFyZzogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX2lzTG9hZGluZyA9IGFyZztcclxuICAgICAgICB0aGlzLl90b2dnbGVMb2FkaW5nKCk7XHJcbiAgICAgICAgLy8g5Yqg6L295a6M5oiQ5pe25pi+56S65YWD57SgXHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0xvYWRpbmcgJiYgdGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLnNob3cpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93Qm94KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65Yqg6L295Yqo55S7XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3RvZ2dsZUxvYWRpbmcoYXJnOiBEaWFsb2dTdGF0dXMgPSB0aGlzLnN0YXR1cykge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0xvYWRpbmcgfHwgYXJnICE9IERpYWxvZ1N0YXR1cy5zaG93KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9sb2FkaW5nRGlhbG9nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkaW5nRGlhbG9nLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkaW5nRGlhbG9nID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdEaWFsb2cpIHtcclxuICAgICAgICAgICAgdGhpcy5fbG9hZGluZ0RpYWxvZy5zaG93KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbG9hZGluZ0RpYWxvZyA9IERpYWxvZy5sb2FkaW5nKCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0KCkge1xyXG4gICAgICAgIERpYWxvZy5hZGRJdGVtKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQ29yZSgpLmNyZWF0ZUNvbnRlbnQoKVxyXG4gICAgICAgIC5hcHBlbmRQYXJlbnQoKS5zZXRQcm9wZXJ0eSgpLmJpbmRFdmVudCgpO1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuc2hvdykge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dCb3goKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nQ29udGVudE9wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5YaF5a65XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94Lmh0bWwodGhpcy5nZXRDb250ZW50SHRtbCgpKyB0aGlzLmdldEZvb3Rlckh0bWwoKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDliLDlrrnlmajkuIpcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGFwcGVuZFBhcmVudCgpOiB0aGlzIHtcclxuICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0aGlzLmJveCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7lsZ7mgKdcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog57uR5a6a5LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2cteWVzXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2RvbmUnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLWNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldENvbnRlbnRIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGNvbnRlbnQgPSB0aGlzLm9wdGlvbnMuY29udGVudDtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IEpTT04uc3RyaW5naWZ5KGNvbnRlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJkaWFsb2ctYm9keVwiPicrIGNvbnRlbnQgKyc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRGb290ZXJIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuaGFzWWVzICYmICF0aGlzLm9wdGlvbnMuaGFzTm8gJiYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuYnV0dG9uID09ICdvYmplY3QnICYmIHRoaXMub3B0aW9ucy5idXR0b24gaW5zdGFuY2VvZiBBcnJheSAmJiB0aGlzLm9wdGlvbnMuYnV0dG9uLmxlbmd0aCA9PSAwKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJkaWFsb2ctZm9vdGVyXCI+JztcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmhhc1llcykge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGlhbG9nLXllc1wiPicrICh0eXBlb2YgdGhpcy5vcHRpb25zLmhhc1llcyA9PSAnc3RyaW5nJyA/IHRoaXMub3B0aW9ucy5oYXNZZXMgOiAn56Gu6K6kJykgKyc8L2J1dHRvbj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmhhc05vKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJkaWFsb2ctY2xvc2VcIj4nKyAodHlwZW9mIHRoaXMub3B0aW9ucy5oYXNObyA9PSAnc3RyaW5nJyA/IHRoaXMub3B0aW9ucy5oYXNObyA6ICflj5bmtognKSArJzwvYnV0dG9uPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmJ1dHRvbiA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuYnV0dG9uID0gW3RoaXMub3B0aW9ucy5idXR0b25dO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkLmVhY2godGhpcy5vcHRpb25zLmJ1dHRvbiwgKGksIGl0ZW0pPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0gPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxidXR0b25cIj4nK2l0ZW0rJzwvYnV0dG9uPic7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cIicraXRlbS50YWcrJ1wiPicraXRlbS5jb250ZW50Kyc8L2J1dHRvbj4nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBodG1sICs9ICc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvbkNsaWNrKHRhZzogc3RyaW5nLCBjYWxsYmFjazogKGVsZW1lbnQ6IEpRdWVyeSkgPT4gYW55KSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLmJveC5vbignY2xpY2snLCB0YWcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChpbnN0YW5jZSwgJCh0aGlzKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNob3dCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlU3RhdHVzKERpYWxvZ1N0YXR1cy5zaG93KTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXN1cGVyLnNob3dCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5zaG93QmcodGhpcy5vcHRpb25zLnRhcmdldCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGhpZGVCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlU3RhdHVzKERpYWxvZ1N0YXR1cy5oaWRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXN1cGVyLmhpZGVCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NpbmdCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlU3RhdHVzKERpYWxvZ1N0YXR1cy5oaWRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXN1cGVyLmNsb3NpbmdCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZVN0YXR1cyhEaWFsb2dTdGF0dXMuaGlkZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHN0YXR1cyA9IHRoaXMuc3RhdHVzO1xyXG4gICAgICAgIGlmICghc3VwZXIuY2xvc2VCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdGF0dXMgIT0gRGlhbG9nU3RhdHVzLmNsb3NpbmcpIHtcclxuICAgICAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ0NvbnRlbnRPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dDb250ZW50T3B0aW9uIHtcclxuICAgIGhhc1llczogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBoYXNObzogYm9vbGVhbiA9IHRydWU7XHJcbiAgICB0aW1lOiBudW1iZXIgPSAwO1xyXG4gICAgYnV0dG9uOiBzdHJpbmdbXSA9IFtdO1xyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUuY29udGVudCwgRGlhbG9nQ29udGVudCk7IiwiY2xhc3MgRGlhbG9nRm9ybSBleHRlbmRzIERpYWxvZ0JveCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZGF0YToge1tuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDooajljZXmlbDmja5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBkYXRhKCk6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119IHtcclxuICAgICAgICBpZiAoIXRoaXMuX2RhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2dldEZvcm1EYXRhKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2VsZW1lbnRzOiB7W25hbWU6IHN0cmluZ106IEpRdWVyeX07XHJcbiAgICAvKipcclxuICAgICAqIOihqOWNleaOp+S7tlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGVsZW1lbnRzKCk6IHtbbmFtZTogc3RyaW5nXTogSlF1ZXJ5fSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9lbGVtZW50cykge1xyXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50cyA9IHRoaXMuX2dldEZvcm1FbGVtZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50cztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0Q29udGVudEh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJkaWFsb2ctYm9keVwiPicrIHRoaXMuX2NyZWF0ZUZvcm0odGhpcy5vcHRpb25zLmNvbnRlbnQpICsnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVGb3JtKGRhdGE6IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKG5hbWU6IHN0cmluZywgaXRlbTogYW55KSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gaW5zdGFuY2UuX2NyZWF0ZUlucHV0KG5hbWUsIGl0ZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBodG1sO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZUlucHV0KG5hbWU6IHN0cmluZywgZGF0YTogYW55KTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodHlwZW9mIGRhdGEgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgZGF0YSA9IHtsYWJlbDogZGF0YX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGF0YS50eXBlKSB7XHJcbiAgICAgICAgICAgIGRhdGEudHlwZSA9ICFkYXRhLml0ZW0gPyAndGV4dCcgOiAnc2VsZWN0JztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGF0dHIgPSAnJztcclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgIGxldCBkZWZhdWx0VmFsID0gJyc7XHJcbiAgICAgICAgaWYgKGRhdGEuZGVmYXVsdCkge1xyXG4gICAgICAgICAgICBkZWZhdWx0VmFsID0gZGF0YS5kZWZhdWx0VmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5sYWJlbCkge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8bGFiZWw+JytkYXRhLmxhYmVsKyc8L2xhYmVsPic7IFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5pZCkge1xyXG4gICAgICAgICAgICBhdHRyICs9ICcgaWQ9XCInK2RhdGEuaWQrJ1wiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEuY2xhc3MpIHtcclxuICAgICAgICAgICAgYXR0ciArPSAnIGNsYXNzPVwiJytkYXRhLmNsYXNzKydcIic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLnJlcXVpcmVkKSB7XHJcbiAgICAgICAgICAgIGF0dHIgKz0gJyByZXF1aXJlZD1cInJlcXVpcmVkXCInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5wbGFjZWhvbGRlcikge1xyXG4gICAgICAgICAgICBhdHRyICs9ICcgcGxhY2Vob2xkZXI9XCInK2RhdGEucGxhY2Vob2xkZXIrJ1wiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoIChkYXRhLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSAndGV4dGFyZWEnOlxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPHRleHRhcmVhIG5hbWU9XCInK25hbWUrJ1wiICcrYXR0cisnPicrZGVmYXVsdFZhbCsnPC90ZXh0YXJlYT4nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XHJcbiAgICAgICAgICAgICAgICBsZXQgb3B0aW9uID0gJyc7XHJcbiAgICAgICAgICAgICAgICAkLmVhY2goZGF0YS5pdGVtLCBmdW5jdGlvbih2YWwsIGxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbCA9PSBkZWZhdWx0VmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCArPSAnXCIgc2VsZWN0ZWQ9XCJzZWxlY3RlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbiArPSAnPG9wdGlvbiB2YWx1ZT1cIicrdmFsKydcIj4nK2xhYmVsKyc8L29wdGlvbj4nO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8c2VsZWN0IG5hbWU9XCInK25hbWUrJ1wiICcrYXR0cisnPicrb3B0aW9uKyc8c2VsZWN0Pic7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAncmFkaW8nOlxyXG4gICAgICAgICAgICBjYXNlICdjaGVja2JveCc6XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2JythdHRyKyc+J1xyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGRhdGEuaXRlbSwgZnVuY3Rpb24odmFsLCBsYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwgPT0gZGVmYXVsdFZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgKz0gJ1wiIGNoZWNrZWQ9XCJjaGVja2VkJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCInK2RhdGEudHlwZSsnXCIgbmFtZT1cIicrbmFtZSsnXCIgdmFsdWU9XCInK3ZhbCsnXCI+JyArIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2Pic7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwiJytkYXRhLnR5cGUrJ1wiIG5hbWU9XCInK25hbWUrJ1wiICcrYXR0cisnIHZhbHVlPVwiJytkZWZhdWx0VmFsKydcIj4nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+JytodG1sKyc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6KGo5Y2V5o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2dldEZvcm1FbGVtZW50KCk6e1tuYW1lOnN0cmluZ106IEpRdWVyeX0ge1xyXG4gICAgICAgIGxldCBlbGVtZW50cyA9IHt9O1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZCgnaW5wdXQsc2VsZWN0LHRleHRhcmVhLGJ1dHRvbicpLmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICBsZXQgbmFtZSA9IGl0ZW0uYXR0cignbmFtZScpO1xyXG4gICAgICAgICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWl0ZW0uaXMoJ1t0eXBlPXJpZGlvXScpICYmICFpdGVtLmlzKCdbdHlwZT1jaGVja2JveF0nKSAmJiBuYW1lLmluZGV4T2YoJ1tdJykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50c1tuYW1lXSA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFlbGVtZW50cy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudHNbbmFtZV0gPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnRzW25hbWVdLnB1c2goZWxlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZWxlbWVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5booajljZXmlbDmja5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0Rm9ybURhdGEoKToge1tuYW1lOiBzdHJpbmddOiBhbnl9IHtcclxuICAgICAgICBsZXQgZm9ybURhdGEgPSB7fTtcclxuICAgICAgICAkLmVhY2godGhpcy5lbGVtZW50cywgZnVuY3Rpb24obmFtZTogc3RyaW5nLCBlbGVtZW50OiBKUXVlcnkpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXMoJ1t0eXBlPXJpZGlvXScpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uYXR0cignY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhW25hbWVdID0gaXRlbS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pcygnW3R5cGU9Y2hlY2tib3hdJykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uYXR0cignY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGl0ZW0udmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGFbbmFtZV0gPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuYW1lLmluZGV4T2YoJ1tdJykgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChpdGVtLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGFbbmFtZV0gPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvcm1EYXRhW25hbWVdID0gZWxlbWVudC52YWwoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZm9ybURhdGE7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLmZvcm0sIERpYWxvZ0Zvcm0pOyIsImNsYXNzIERpYWxvZ1BhZ2UgZXh0ZW5kcyBEaWFsb2dCb3gge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRIZWFkZXJIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImRpYWxvZy1oZWFkZXJcIj48aSBjbGFzcz1cImZhIGZhLWFycm93LWxlZnRcIj48L2k+PGRpdiBjbGFzcz1cImRpYWxvZy10aXRsZVwiPic7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pY28pIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPGkgY2xhc3M9XCJmYSBmYS0nICsgdGhpcy5vcHRpb25zLmljbyArICdcIj48L2k+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50aXRsZSkge1xyXG4gICAgICAgICAgICBodG1sICs9IHRoaXMub3B0aW9ucy50aXRsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGh0bWwgKyAnPC9kaXY+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZSBkaWFsb2ctY2xvc2VcIj48L2k+PC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOe7keWumuS6i+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94LmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLWhlYWRlciAuZmEtYXJyb3ctbGVmdFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2cteWVzXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2RvbmUnKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLWNsb3NlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLnBhZ2UsIERpYWxvZ1BhZ2UpOyIsImludGVyZmFjZSBEaWFsb2dJbWFnZU9wdGlvbiBleHRlbmRzIERpYWxvZ09wdGlvbiB7XHJcbiAgICBvbm5leHQ/OiAoaW5kZXg6IG51bWJlcikgPT4gc3RyaW5nLFxyXG4gICAgb25wcmV2aW91cz86IChpbmRleDogbnVtYmVyKSA9PiBzdHJpbmdcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nSW1hZ2UgZXh0ZW5kcyBEaWFsb2dDb250ZW50IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5kZXg6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHJpdmF0ZSBfc3JjOiBzdHJpbmc7XHJcblxyXG4gICAgcHVibGljIGdldCBzcmMoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc3JjO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgc3JjKGltZzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFpbWcpIHtcclxuICAgICAgICAgICAgaW1nID0gdGhpcy5vcHRpb25zLmNvbnRlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3NyYyA9IGltZztcclxuICAgICAgICB0aGlzLmJveC5maW5kKCcuZGlhbG9nLWJvZHkgaW1nJykuYXR0cignc3JjJywgaW1nKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5odG1sKHRoaXMuZ2V0Q29udGVudEh0bWwoKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLm9wdGlvbnMudGFyZ2V0IHx8IERpYWxvZy4kd2luZG93O1xyXG4gICAgICAgIGxldCBtYXhXaWR0aCA9IHRhcmdldC53aWR0aCgpO1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuYm94LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IG1heEhlaWdodCA9IHRhcmdldC5oZWlnaHQoKTtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5ib3guaGVpZ2h0KCk7XHJcbiAgICAgICAgdGhpcy5jc3Moe1xyXG4gICAgICAgICAgICBsZWZ0OiAobWF4V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4JyxcclxuICAgICAgICAgICAgdG9wOiAobWF4SGVpZ2h0IC0gaGVpZ2h0KSAvIDIgKyAncHgnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnu5Hlrprkuovku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2ctY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLXByZXZpb3VzXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy1uZXh0XCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5ib3gpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLnJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZCgnLmRpYWxvZy1ib2R5IGltZycpLmJpbmQoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuYm94KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5yZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN6K6+5bC65a+4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZXNpemUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXRQcm9wZXJ0eSgpO1xyXG4gICAgICAgIHRoaXMudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHByZXZpb3VzKCkge1xyXG4gICAgICAgIHRoaXMuc3JjID0gdGhpcy50cmlnZ2VyKCdwcmV2aW91cycsIC0tIHRoaXMuX2luZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbmV4dCgpIHtcclxuICAgICAgICB0aGlzLnNyYyA9IHRoaXMudHJpZ2dlcignbmV4dCcsICsrIHRoaXMuX2luZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0Q29udGVudEh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5jb250ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jb250ZW50ID0gdGhpcy50cmlnZ2VyKCduZXh0JywgKysgdGhpcy5faW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJzxpIGNsYXNzPVwiZmEgZmEtY2hldnJvbi1sZWZ0IGRpYWxvZy1wcmV2aW91c1wiPjwvaT48ZGl2IGNsYXNzPVwiZGlhbG9nLWJvZHlcIj48aW1nIHNyYz1cIicrIHRoaXMub3B0aW9ucy5jb250ZW50ICsnXCI+PC9kaXY+PGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLXJpZ2h0IGRpYWxvZy1uZXh0XCI+PC9pPjxpIGNsYXNzPVwiZmEgZmEtY2xvc2UgZGlhbG9nLWNsb3NlXCI+PC9pPic7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dJbWFnZU9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ0ltYWdlT3B0aW9uIHtcclxuICAgIG9ubmV4dDogKGluZGV4OiBudW1iZXIpID0+IHN0cmluZyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuICQoZG9jdW1lbnQuYm9keSkuZmluZCgnaW1nJykuZXEoaW5kZXgpLmF0dHIoJ3NyYycpO1xyXG4gICAgfTtcclxuICAgIG9ucHJldmlvdXM6IChpbmRleDogbnVtYmVyKSA9PiBzdHJpbmcgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgIHJldHVybiAkKGRvY3VtZW50LmJvZHkpLmZpbmQoJ2ltZycpLmVxKGluZGV4KS5hdHRyKCdzcmMnKTtcclxuICAgIH07XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5pbWFnZSwgRGlhbG9nSW1hZ2UpOyIsImludGVyZmFjZSBEaWFsb2dEaXNrT3B0aW9uIGV4dGVuZHMgRGlhbG9nQm94T3B0aW9uIHtcclxuICAgIGNhdGFsb2c/OiBhbnksICAgICAgICAvL+ebruW9lVxyXG4gICAgbmFtZT86IHN0cmluZyxcclxuICAgIGNoaWxkcmVuPzogc3RyaW5nLFxyXG4gICAgdXJsPzogc3RyaW5nLCAgICAgICAgIC8vdXJs5qCH6K6wXHJcbiAgICBtdWx0aXBsZT86IGJvb2xlYW4sICAgIC8v5piv5ZCm5YWB6K645aSa6YCJXHJcbiAgICBvbm9wZW5GaWxlPzogKHVybDogc3RyaW5nLCBlbGVtZW50OiBKUXVlcnkpID0+IGFueSAgLy/miZPlvIDmlofku7bop6blj5Hml7bpl7RcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nRGlzayBleHRlbmRzIERpYWxvZ0JveCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ0Rpc2tPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcHRpb25zOiBEaWFsb2dEaXNrT3B0aW9uO1xyXG5cclxuICAgIHB1YmxpYyBjYXRhbG9nQm94OiBKUXVlcnk7XHJcblxyXG4gICAgcHVibGljIGZpbGVCb3g6IEpRdWVyeTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuY2F0YWxvZ0JveCA9IHRoaXMuYm94LmZpbmQoJy5kaWFsb2ctYm9keSAuZGlhbG9nLWNhdGFsb2cnKTtcclxuICAgICAgICB0aGlzLmZpbGVCb3ggPSB0aGlzLmJveC5maW5kKCcuZGlhbG9nLWJvZHkgLmRpYWxvZy1jb250ZW50Jyk7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5jYXRhbG9nID09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0NhdGFsb2codGhpcy5vcHRpb25zLmNhdGFsb2cpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICQuZ2V0SlNPTih0aGlzLm9wdGlvbnMuY2F0YWxvZywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuY29kZSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Uuc2hvd0NhdGFsb2coZGF0YS5kYXRhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNvbnRlbnQgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93RmlsZSh0aGlzLm9wdGlvbnMuY29udGVudCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJC5nZXRKU09OKHRoaXMub3B0aW9ucy5jb250ZW50LCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb2RlID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5zaG93RmlsZShkYXRhLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYXRhbG9nQm94Lm9uKCdjbGljaycsICcudHJlZS1pdGVtJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBmaWxlID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgZmlsZS5hZGRDbGFzcygnYWN0aXZlJykuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLm9wZW4oZmlsZS5hdHRyKCdkYXRhLXVybCcpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmZpbGVCb3gub24oJ2NsaWNrJywgJy5mb2xkZXItaXRlbScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsZXQgZmlsZSA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIGZpbGUuYWRkQ2xhc3MoJ2FjdGl2ZScpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5vcGVuKGZpbGUuYXR0cignZGF0YS11cmwnKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5maWxlQm94Lm9uKCdjbGljaycsICcuZmlsZS1pdGVtJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBmaWxlID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgZmlsZS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2Uub3B0aW9ucy5tdWx0aXBsZSkge1xyXG4gICAgICAgICAgICAgICAgZmlsZS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnN0YW5jZS50cmlnZ2VyKCdvcGVuRmlsZScsIGZpbGUuYXR0cignZGF0YS11cmwnKSwgZmlsZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLmJpbmRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRDb250ZW50SHRtbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImRpYWxvZy1ib2R5XCI+PGRpdiBjbGFzcz1cImRpYWxvZy1jYXRhbG9nXCI+PC9kaXY+PGRpdiBjbGFzcz1cImRpYWxvZy1jb250ZW50XCI+PC9kaXY+PC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dEaXNrT3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9wZW4odXJsOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIXVybCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndXJsIGlzIGVtcHR5Jyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgQ2FjaGVVcmwuZ2V0RGF0YSh1cmwsIGRhdGEgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dGaWxlKGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6YCJ5Lit55qE5paH5Lu26Lev5b6EXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB2YWwoKTogc3RyaW5nfCBBcnJheTxzdHJpbmc+IHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5tdWx0aXBsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlQm94LmZpbmQoJy5maWxlLWl0ZW0uYWN0aXZlJykuYXR0cignZGF0YS11cmwnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRhdGEgPSBbXTtcclxuICAgICAgICB0aGlzLm1hcFNlbGVjdGVkRmlsZSh1cmwgPT4ge1xyXG4gICAgICAgICAgICBkYXRhLnB1c2godXJsKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOW+queOr+mAieS4reeahOaWh+S7tlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbWFwU2VsZWN0ZWRGaWxlKGNhbGxiYWNrOiAodXJsOiBzdHJpbmcsIGVsZW1lbnQ6IEpRdWVyeSwgaW5kZXg6IG51bWJlcikgPT4gYW55KTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5maWxlQm94LmZpbmQoJy5maWxlLWl0ZW0uYWN0aXZlJykuZWFjaChmdW5jdGlvbihpLCBlbGUpIHtcclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBpdGVtLmF0dHIoJ2RhdGEtdXJsJyk7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjay5jYWxsKGl0ZW0sIHVybCwgaXRlbSwgaSkgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5b6q546v5omA5pyJXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXHJcbiAgICAgKiBAcGFyYW0gaGFzRm9sZGVyIOaYr+WQpuWMheWQq+aWh+S7tuWkuSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIG1hcChjYWxsYmFjazogKHVybDogc3RyaW5nLCBlbGVtZW50OiBKUXVlcnksIGluZGV4OiBudW1iZXIpID0+IGFueSwgaGFzRm9sZGVyOiBib29sZWFuID0gZmFsc2UpOiB0aGlzIHtcclxuICAgICAgICBsZXQgdGFnID0gJy5maWxlLWl0ZW0nO1xyXG4gICAgICAgIGlmIChoYXNGb2xkZXIpIHtcclxuICAgICAgICAgICAgdGFnID0gJy5mb2xkZXItaXRlbSwnICsgdGFnO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmZpbGVCb3guZmluZCh0YWcpLmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gaXRlbS5hdHRyKCdkYXRhLXVybCcpO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChpdGVtLCB1cmwsIGl0ZW0sIGkpID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuaWh+S7tlxyXG4gICAgICogQHBhcmFtIGRhdGEgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzaG93RmlsZShkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgICQuZWFjaChkYXRhLCAoaSwgaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBpdGVtLnR5cGUgPSBEaWFsb2cucGFyc2VFbnVtPERpYWxvZ0Rpc2tUeXBlPihpdGVtLnR5cGUsIERpYWxvZ0Rpc2tUeXBlKTtcclxuICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSBEaWFsb2dEaXNrVHlwZS5maWxlKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldEZpbGVJdGVtKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0Rm9sZGVySXRlbShpdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmZpbGVCb3guaHRtbChodG1sKVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldEZpbGVJdGVtKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJmaWxlLWl0ZW1cIiBkYXRhLXVybD1cIicgKyBkYXRhW3RoaXMub3B0aW9ucy51cmxdICsnXCI+PGkgY2xhc3M9XCJmYSBmYS1maWxlLW9cIj48L2k+PGRpdiBjbGFzcz1cImZpbGUtbmFtZVwiPicrZGF0YVt0aGlzLm9wdGlvbnMubmFtZV0rJzwvZGl2PjwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0Rm9sZGVySXRlbShkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZm9sZGVyLWl0ZW1cIiBkYXRhLXVybD1cIicgKyBkYXRhW3RoaXMub3B0aW9ucy51cmxdICsnXCI+PGkgY2xhc3M9XCJmYSBmYS1mb2xkZXItb1wiPjwvaT48ZGl2IGNsYXNzPVwiZmlsZS1uYW1lXCI+JytkYXRhW3RoaXMub3B0aW9ucy5uYW1lXSsnPC9kaXY+PC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuebruW9lVxyXG4gICAgICogQHBhcmFtIGRhdGEgXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzaG93Q2F0YWxvZyhkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgICQuZWFjaChkYXRhLCAoaSwgaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldENhdGFsb2dJdGVtKGl0ZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChodG1sID09ICcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2F0YWxvZ0JveC5oaWRlKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYXRhbG9nQm94Lmh0bWwoJzx1bCBjbGFzcz1cInRyZWVcIj4nICsgaHRtbCArJzwvdWw+JylcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRDYXRhbG9nSXRlbShkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICc8bGkgY2xhc3M9XCJ0cmVlLWl0ZW1cIiBkYXRhLXVybD1cIicgKyBkYXRhW3RoaXMub3B0aW9ucy51cmxdICsnXCI+PGRpdiBjbGFzcz1cInRyZWUtaGVhZGVyXCI+JyArIGRhdGFbdGhpcy5vcHRpb25zLm5hbWVdICsgJzwvZGl2Pic7XHJcbiAgICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkodGhpcy5vcHRpb25zLmNoaWxkcmVuKSkge1xyXG4gICAgICAgICAgICBodG1sICs9IHRoaXMuX2dldENhdGFsb2dDaGlsZChkYXRhW3RoaXMub3B0aW9ucy5jaGlsZHJlbl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaHRtbCArICc8L2xpPic7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0Q2F0YWxvZ0NoaWxkKGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBodG1sID0gJyc7XHJcbiAgICAgICAgJC5lYWNoKGRhdGEsIChpLCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0Q2F0YWxvZ0l0ZW0oaXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuICc8dWwgY2xhc3M9XCJ0cmVlLWNoaWxkXCI+JyArIGh0bWwgKyAnPC91bD4nO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nRGlza09wdGlvbiBleHRlbmRzIERlZmF1bHREaWFsb2dCb3hPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dEaXNrT3B0aW9uIHtcclxuICAgIG5hbWU6IHN0cmluZyA9ICduYW1lJztcclxuICAgIHRpdGxlOiBzdHJpbmcgPSAn5paH5Lu2566h55CGJztcclxuICAgIGNoaWxkcmVuOiBzdHJpbmcgPSAnY2hpbGRyZW4nO1xyXG4gICAgdXJsOiBzdHJpbmcgPSAndXJsJztcclxuICAgIG11bHRpcGxlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBvbmNsb3Npbmc6ICgpID0+IGFueSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLmRpc2ssIERpYWxvZ0Rpc2spOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
