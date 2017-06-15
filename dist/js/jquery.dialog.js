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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhY2hlLnRzIiwiZXZlbnQudHMiLCJib3gudHMiLCJjb3JlLnRzIiwiZGVmYXVsdC50cyIsImRpYWxvZy50cyIsImVudW0udHMiLCJqcXVlcnkuZGlhbG9nLnRzIiwidGlwLnRzIiwibWVzc2FnZS50cyIsIm5vdGlmeS50cyIsInBvcC50cyIsImxvYWRpbmcudHMiLCJjb250ZW50LnRzIiwiZm9ybS50cyIsInBhZ2UudHMiLCJpbWFnZS50cyIsImRpc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVBO0FBQ0E7SUFBQTtJQTJEQSxDQUFBO0lBaERBLGdCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLFFBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsRUFBQSxVQUFBLElBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxRQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZUFBQTtBQUFBLENBM0RBLEFBMkRBO0FBMURBOztHQUVBO0FBQ0EsbUJBQUEsR0FBQSxFQUFBLENBQUE7QUFFQTs7R0FFQTtBQUNBLGVBQUEsR0FBQSxFQUFBLENBQUE7QUNaQTtJQUFBO0lBbUJBLENBQUE7SUFoQkEsZ0JBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsUUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxzQkFBQSxHQUFBLFVBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUJBQUEsR0FBQSxVQUFBLEtBQUE7UUFBQSxjQUFBO2FBQUEsVUFBQSxFQUFBLHFCQUFBLEVBQUEsSUFBQTtZQUFBLDZCQUFBOztRQUNBLElBQUEsU0FBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsWUFBQSxJQUFBLFNBQUEsSUFBQSxHQUFBOztJQUNBLENBQUE7SUFDQSxVQUFBO0FBQUEsQ0FuQkEsQUFtQkEsSUFBQTtBQ25CQTtJQUFBLHVCQUFBO0lBQUE7O0lBZ0NBLENBQUE7SUExQkEsMEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsVUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBOzs7O09BSUE7SUFDQSxXQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUEsT0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxVQUFBO0FBQUEsQ0FoQ0EsQUFnQ0EsQ0FoQ0EsR0FBQSxHQWdDQTtBQ2hDQTtJQUFBLDhCQUFBO0lBQ0Esb0JBQ0EsTUFBQSxFQUNBLEVBQUE7UUFGQSxZQUlBLGlCQUFBLFNBR0E7UUFMQSxRQUFBLEdBQUEsRUFBQSxDQUFBO1FBU0EsYUFBQSxHQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUE7UUFOQSxLQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLEtBQUEsQ0FBQSxnQkFBQSxFQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBOztJQUNBLENBQUE7SUFNQSxzQkFBQSw4QkFBQTthQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxHQUFBO1lBQ0EsR0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxFQUFBLFlBQUEsQ0FBQSxDQUFBO1lBQ0EsV0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxJQUFBO29CQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0EsS0FBQSxZQUFBLENBQUEsSUFBQTtvQkFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7b0JBQ0EsS0FBQSxDQUFBO2dCQUNBLEtBQUEsWUFBQSxDQUFBLE9BQUE7b0JBQ0EsSUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxNQUFBO29CQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0E7b0JBQ0EsTUFBQSxlQUFBLEdBQUEsR0FBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7OztPQXhCQTtJQStCQSxzQkFBQSx5QkFBQTthQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7YUFFQSxVQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7OztPQUxBO0lBU0Esc0JBQUEsOEJBQUE7YUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsQ0FBQTthQUVBLFVBQUEsTUFBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBOzs7T0FMQTtJQU9BOzs7O09BSUE7SUFDQSxpQ0FBQSxHQUFBLFVBQUEsTUFBQSxFQUFBLFFBQUE7UUFBQSx5QkFBQSxFQUFBLGdCQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EscUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLG1CQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQTs7T0FFQTtJQUNBLDRCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxHQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsNEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQTtlQUNBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsOEVBQUEsRUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxRQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsNkJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFJQSwrQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBLENBQUEsNEJBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxpQ0FBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQU9BLHdCQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEseUJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEseUJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsMEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsMkJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUFBLGlCQVlBO1FBWEEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsUUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0NBQUEsR0FBQTtRQUFBLGlCQWFBO1FBWkEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsUUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUEsR0FBQSxNQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBLCtCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDRCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDZCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0NBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQSxTQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE9BQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsR0FBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxRQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxLQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxXQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEVBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsTUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsVUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsSUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGlCQUFBO0FBQUEsQ0E3U0EsQUE2U0EsQ0E3U0EsR0FBQSxHQTZTQTtBQzdTQTtJQUFBO1FBQ0EsVUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFNBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsWUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFdBQUEsR0FBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSwwQkFBQTtBQUFBLENBUEEsQUFPQSxJQUFBO0FDUEE7SUFBQTtJQWtTQSxDQUFBO0lBbFJBOzs7T0FHQTtJQUNBLGFBQUEsR0FBQSxVQUFBLE1BQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLE9BQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0JBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxJQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7OztPQUlBO0lBQ0EsVUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLElBQUE7UUFBQSxxQkFBQSxFQUFBLFdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7T0FJQTtJQUNBLGNBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxJQUFBO1FBQUEscUJBQUEsRUFBQSxXQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGNBQUEsR0FBQSxVQUFBLElBQUE7UUFBQSxxQkFBQSxFQUFBLFFBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7OztPQUtBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQTtnQkFDQSxPQUFBLEVBQUEsT0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7OztPQU1BO0lBQ0EsVUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQTtRQUFBLHNCQUFBLEVBQUEsWUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLEdBQUE7Z0JBQ0EsT0FBQSxFQUFBLE9BQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7Z0JBQ0EsTUFBQSxFQUFBLE1BQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7YUFDQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7Ozs7O09BT0E7SUFDQSxXQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQTtRQUFBLHNCQUFBLEVBQUEsWUFBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLFVBQUEsQ0FBQSxJQUFBO1lBQ0EsT0FBQSxFQUFBLE9BQUE7WUFDQSxLQUFBLEVBQUEsS0FBQTtZQUNBLE1BQUEsRUFBQSxNQUFBO1lBQ0EsS0FBQSxFQUFBLEtBQUE7WUFDQSxNQUFBLEVBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7O09BTUE7SUFDQSxXQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQTtnQkFDQSxPQUFBLEVBQUEsT0FBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7O09BS0E7SUFDQSxhQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLElBQUE7UUFBQSxzQkFBQSxFQUFBLFlBQUE7UUFBQSx3QkFBQSxFQUFBLFlBQUE7UUFBQSxxQkFBQSxFQUFBLFNBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEtBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxHQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLEdBQUEsRUFBQSxJQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxLQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxjQUFBLEdBQUEsVUFBQSxPQUFBO1FBQ0EsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxPQUFBLENBQUE7UUFDQSxPQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO2VBQ0EsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGNBQUEsR0FBQSxVQUFBLEVBQUE7UUFBQSxtQkFBQSxFQUFBLEtBQUEsSUFBQSxDQUFBLEtBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLFVBQUEsR0FBQSxVQUFBLEVBQUE7UUFBQSxtQkFBQSxFQUFBLEtBQUEsSUFBQSxDQUFBLEtBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxpQkFBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE9BQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGFBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLEdBQUE7ZUFDQSxJQUFBLElBQUEsVUFBQSxDQUFBLE9BQUE7ZUFDQSxJQUFBLElBQUEsVUFBQSxDQUFBLElBQUE7ZUFDQSxJQUFBLElBQUEsVUFBQSxDQUFBLE1BQUE7ZUFDQSxJQUFBLElBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxVQUFBLEdBQUEsVUFBQSxRQUFBO1FBQ0EsR0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLE1BQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxhQUFBLEdBQUEsVUFBQSxNQUFBLEVBQUEsUUFBQTtRQUFBLHVCQUFBLEVBQUEsU0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtRQUFBLHlCQUFBLEVBQUEsZUFBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLFVBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLG1CQUFBLEVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxjQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsTUFBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsYUFBQTtBQUFBLENBbFNBLEFBa1NBO0FBaFNBLGNBQUEsR0FBQSxFQUFBLENBQUE7QUFFQSxZQUFBLEdBQUEsRUFBQSxDQUFBO0FBRUEsWUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUE7QUFFQSxlQUFBLEdBQUEsRUFBQSxDQUFBO0FBSUEsY0FBQSxHQUFBLENBQUEsQ0FBQTtBQUVBLGNBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUNkQTs7R0FFQTtBQUNBLElBQUEsVUFhQTtBQWJBLFdBQUEsVUFBQTtJQUNBLHlDQUFBLENBQUE7SUFDQSxpREFBQSxDQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLHlDQUFBLENBQUE7SUFDQSxpREFBQSxDQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLDZDQUFBLENBQUE7SUFDQSwyQ0FBQSxDQUFBO0lBQ0EsMkNBQUEsQ0FBQTtJQUNBLGlEQUFBLENBQUE7SUFDQSwwQ0FBQSxDQUFBO0lBQ0EsNENBQUEsQ0FBQTtBQUNBLENBQUEsRUFiQSxVQUFBLEtBQUEsVUFBQSxRQWFBO0FBRUE7O0dBRUE7QUFDQSxJQUFBLGVBVUE7QUFWQSxXQUFBLGVBQUE7SUFDQSxtREFBQSxDQUFBO0lBQ0EsdURBQUEsQ0FBQTtJQUNBLHlEQUFBLENBQUE7SUFDQSxxREFBQSxDQUFBO0lBQ0EseURBQUEsQ0FBQTtJQUNBLDJEQUFBLENBQUE7SUFDQSw2REFBQSxDQUFBO0lBQ0EsbUVBQUEsQ0FBQTtJQUNBLGlFQUFBLENBQUE7QUFDQSxDQUFBLEVBVkEsZUFBQSxLQUFBLGVBQUEsUUFVQTtBQUVBOztHQUVBO0FBQ0EsSUFBQSxZQUtBO0FBTEEsV0FBQSxZQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLCtDQUFBLENBQUE7SUFDQSxxREFBQSxDQUFBO0lBQ0EsbURBQUEsQ0FBQSxDQUFBLEtBQUE7QUFDQSxDQUFBLEVBTEEsWUFBQSxLQUFBLFlBQUEsUUFLQTtBQUVBLElBQUEsY0FHQTtBQUhBLFdBQUEsY0FBQTtJQUNBLG1EQUFBLENBQUE7SUFDQSw2REFBQSxDQUFBO0FBQ0EsQ0FBQSxFQUhBLGNBQUEsS0FBQSxjQUFBLFFBR0E7QUM5Q0E7SUFDQSxzQkFDQSxPQUFBLEVBQ0EsTUFBQTtRQURBLFlBQUEsR0FBQSxPQUFBLENBQUE7UUFDQSxXQUFBLEdBQUEsTUFBQSxDQUFBO1FBRUEsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUlBLG1DQUFBLEdBQUEsVUFBQSxPQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxHQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsSUFBQSxVQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsTUFBQSxHQUFBLE9BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLG1CQUFBO0FBQUEsQ0EzQkEsQUEyQkEsSUFBQTtBQUVBLENBQUE7QUFBQSxDQUFBLFVBQUEsQ0FBQTtJQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsTUFBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBLENBQUE7QUFDQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQzdCQTtJQUFBLDZCQUFBO0lBQ0EsbUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQU1BLHdCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQTthQUNBLFlBQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLFNBQUEsRUFBQTthQUNBLE9BQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxzQkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxnQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsK0JBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsNkJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsMEJBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwyQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxFQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsWUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLFVBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw0QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxRQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZ0JBQUE7QUFBQSxDQWxJQSxBQWtJQSxDQWxJQSxVQUFBLEdBa0lBO0FBRUE7SUFBQTtRQUNBLFNBQUEsR0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBQUEsNkJBQUE7QUFBQSxDQUZBLEFBRUEsSUFBQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQ3hJQTtJQUFBLGlDQUFBO0lBQ0EsdUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsR0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxVQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsQ0FBQSxDQUFBLElBQUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxvQkFBQTtBQUFBLENBM0JBLEFBMkJBLENBM0JBLFNBQUEsR0EyQkE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQUEsYUFBQSxDQUFBLENBQUE7QUM1QkE7SUFBQSxnQ0FBQTtJQUVBLHNCQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFNQSxvQ0FBQSxHQUFBO1FBQ0EsTUFBQSxJQUFBLEtBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0Esa0NBQUEsR0FBQTtRQUNBLE1BQUEsSUFBQSxLQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsdUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLHlCQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsYUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxPQUFBO2VBQ0EsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0NBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLGNBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxHQUFBLEdBQUEsWUFBQSxDQUFBLGlCQUFBLEVBQUEsQ0FBQTtZQUNBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxVQUFBO2dCQUNBLEVBQUEsQ0FBQSxDQUFBLFVBQUEsS0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO29CQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQTtvQkFDQSxJQUFBLEVBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBO29CQUNBLElBQUEsRUFBQSxRQUFBLENBQUEsT0FBQSxDQUFBLEdBQUE7aUJBQ0EsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBO29CQUNBLFFBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxHQUFBLFNBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQkFBQTtBQUFBLENBekZBLEFBeUZBLENBekZBLFNBQUEsR0F5RkE7QUFFQTtJQUFBLDZDQUFBO0lBQUE7UUFBQSxxRUFFQTtRQURBLFdBQUEsR0FBQSxJQUFBLENBQUE7O0lBQ0EsQ0FBQTtJQUFBLGdDQUFBO0FBQUEsQ0FGQSxBQUVBLENBRkEsc0JBQUEsR0FFQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtBQ2hHQTtJQUFBLDZCQUFBO0lBQ0EsbUJBQ0EsTUFBQSxFQUNBLEVBQUE7UUFGQSxZQUlBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUEsU0FJQTtRQUhBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsZUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBOztJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGdDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDZCQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHVDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxtQkFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxHQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsMk5BQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUE7WUFDQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUE7U0FDQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsa0NBQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxLQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFFBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLEtBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUEsR0FBQSxLQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsV0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsTUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxTQUFBLEdBQUEsS0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxJQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxLQUFBLEdBQUEsS0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLEdBQUEsQ0FBQTtZQUNBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsR0FBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBQ0EsZ0JBQUE7QUFBQSxDQW5FQSxBQW1FQSxDQW5FQSxTQUFBLEdBbUVBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FDcEVBO0lBQUEsaUNBQUE7SUFDQSx1QkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsd0NBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLDBCQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLG1DQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO1lBQ0EsR0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxHQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLEVBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxlQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxPQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxPQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsa0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsVUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdDQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxRQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9CQUFBO0FBQUEsQ0E3RUEsQUE2RUEsQ0E3RUEsU0FBQSxHQTZFQTtBQUVBO0lBQUE7UUFDQSxVQUFBLEdBQUEsU0FBQSxDQUFBLENBQUEsVUFBQTtRQUNBLFVBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxTQUFBLEdBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUFBLGlDQUFBO0FBQUEsQ0FKQSxBQUlBLElBQUE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQUEsYUFBQSxDQUFBLENBQUE7QUM3RUE7SUFBQSxpQ0FBQTtJQUVBLHVCQUNBLE1BQUEsRUFDQSxFQUFBO1FBRkEsWUFJQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLFNBVUE7UUFFQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBLGdCQUFBO1FBWEEsRUFBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7WUFDQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEVBQUEsVUFBQSxJQUFBO2dCQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQTtnQkFDQSxVQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7O0lBQ0EsQ0FBQTtJQU1BLHNCQUFBLG9DQUFBO2FBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtRQUNBLENBQUE7YUFFQSxVQUFBLEdBQUE7WUFDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQTtZQUNBLFlBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTs7O09BVEE7SUFXQTs7T0FFQTtJQUNBLHNDQUFBLEdBQUEsVUFBQSxHQUFBO1FBQUEsb0JBQUEsRUFBQSxNQUFBLElBQUEsQ0FBQSxNQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxJQUFBLEdBQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLGNBQUEsR0FBQSxTQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsY0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw0QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUE7YUFDQSxZQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHdDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSwwQkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxxQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLG9DQUFBLEdBQUE7UUFDQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsbUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHNDQUFBLEdBQUE7UUFDQSxJQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsMkJBQUEsR0FBQSxPQUFBLEdBQUEsUUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHFDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLFFBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsWUFBQSxLQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsNkJBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSw2QkFBQSxHQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsV0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSwrQkFBQSxHQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsV0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLFVBQUEsQ0FBQSxFQUFBLElBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxXQUFBLEdBQUEsSUFBQSxHQUFBLFdBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLGlCQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxXQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLElBQUEsUUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsUUFBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsVUFBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxPQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsT0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGtDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLFVBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsUUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQkFBQTtBQUFBLENBbk1BLEFBbU1BLENBbk1BLFVBQUEsR0FtTUE7QUFFQTtJQUFBO1FBQ0EsV0FBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFVBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxTQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsV0FBQSxHQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSxpQ0FBQTtBQUFBLENBTEEsQUFLQSxJQUFBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBO0FYbk5BO0lBQUEsNkJBQUE7SUFDQSxtQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLElBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBO2dCQUNBLElBQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQTtnQkFDQSxHQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7YUFDQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNkJBQUEsR0FBQTtRQUNBLFVBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLE1BQUEsR0FBQSxJQUFBLENBQUE7WUFDQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsR0FBQSxDQUFBLENBQUEsS0FBQSxHQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7Z0JBQ0EsR0FBQSxFQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQTtnQkFDQSxJQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBO1lBQ0EsTUFBQSxHQUFBLEtBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLGlCQUFBLFNBQUEsV0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsMEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0NBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLHNCQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsdURBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxrQkFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLFFBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxzREFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdCQUFBO0FBQUEsQ0E3RkEsQUE2RkEsQ0E3RkEsYUFBQSxHQTZGQTtBQUVBO0lBQUEsMENBQUE7SUFBQTtRQUFBLHFFQUdBO1FBRkEsV0FBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLGFBQUEsR0FBQSxJQUFBLENBQUE7O0lBQ0EsQ0FBQTtJQUFBLDZCQUFBO0FBQUEsQ0FIQSxBQUdBLENBSEEsMEJBQUEsR0FHQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBWTFHQTtJQUFBLDhCQUFBO0lBQ0Esb0JBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQU9BLHNCQUFBLDRCQUFBO1FBSEE7O1dBRUE7YUFDQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBOzs7T0FBQTtJQU1BLHNCQUFBLGdDQUFBO1FBSEE7O1dBRUE7YUFDQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUE7UUFDQSxDQUFBOzs7T0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsMkJBQUEsR0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsUUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdDQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUEsSUFBQTtZQUNBLElBQUEsSUFBQSxRQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQ0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBLElBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLEdBQUEsUUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsVUFBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsc0JBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxnQkFBQSxHQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxVQUFBO2dCQUNBLElBQUEsSUFBQSxrQkFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLEdBQUEsYUFBQSxDQUFBO2dCQUNBLEtBQUEsQ0FBQTtZQUNBLEtBQUEsUUFBQTtnQkFDQSxJQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBLEtBQUE7b0JBQ0EsRUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7d0JBQ0EsR0FBQSxJQUFBLHNCQUFBLENBQUE7b0JBQ0EsQ0FBQTtvQkFDQSxRQUFBLElBQUEsaUJBQUEsR0FBQSxHQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsR0FBQSxXQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxJQUFBLGdCQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsR0FBQSxHQUFBLFFBQUEsR0FBQSxVQUFBLENBQUE7Z0JBQ0EsS0FBQSxDQUFBO1lBQ0EsS0FBQSxPQUFBLENBQUE7WUFDQSxLQUFBLFVBQUE7Z0JBQ0EsSUFBQSxJQUFBLE1BQUEsR0FBQSxJQUFBLEdBQUEsR0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQSxLQUFBO29CQUNBLEVBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO3dCQUNBLEdBQUEsSUFBQSxvQkFBQSxDQUFBO29CQUNBLENBQUE7b0JBQ0EsSUFBQSxJQUFBLGVBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsR0FBQSxJQUFBLEdBQUEsV0FBQSxHQUFBLEdBQUEsR0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxPQUFBLENBQUE7Z0JBQ0EsS0FBQSxDQUFBO1lBQ0E7Z0JBQ0EsSUFBQSxJQUFBLGVBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxVQUFBLEdBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtnQkFDQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLDJCQUFBLEdBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLG9DQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLGlCQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsUUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLElBQUEsRUFBQSxPQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO29CQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtvQkFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTt3QkFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO29CQUNBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7Z0JBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO29CQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtvQkFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTt3QkFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO29CQUNBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtnQkFDQSxPQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUE7b0JBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO29CQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQkFBQTtBQUFBLENBNUtBLEFBNEtBLENBNUtBLFNBQUEsR0E0S0E7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7QUM5S0E7SUFBQSw4QkFBQTtJQUNBLG9CQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxrQ0FBQSxHQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsdUZBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxrQkFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLFFBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxzREFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsOEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSwrQkFBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlCQUFBO0FBQUEsQ0F0Q0EsQUFzQ0EsQ0F0Q0EsU0FBQSxHQXNDQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTtBQ25DQTtJQUFBLCtCQUFBO0lBRUEscUJBQ0EsTUFBQSxFQUNBLEVBQUE7UUFGQSxZQUlBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUEsU0FDQTtRQUVBLFlBQUEsR0FBQSxDQUFBLENBQUE7O0lBRkEsQ0FBQTtJQU1BLHNCQUFBLDRCQUFBO2FBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7YUFFQSxVQUFBLEdBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLEdBQUEsR0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBOzs7T0FSQTtJQVVBLG1DQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7WUFDQSxHQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7U0FDQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsK0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBRUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDRCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSx1RkFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLGlHQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0Esa0JBQUE7QUFBQSxDQWxHQSxBQWtHQSxDQWxHQSxhQUFBLEdBa0dBO0FBRUE7SUFBQTtRQUNBLFdBQUEsR0FBQSxVQUFBLEtBQUE7WUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTtRQUNBLGVBQUEsR0FBQSxVQUFBLEtBQUE7WUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSwrQkFBQTtBQUFBLENBUEEsQUFPQSxJQUFBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBO0FDekdBO0lBQUEsOEJBQUE7SUFDQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBUUEsOEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsSUFBQTtnQkFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7b0JBQ0EsUUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxJQUFBO2dCQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtvQkFDQSxRQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFlBQUEsRUFBQTtZQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxjQUFBLEVBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsWUFBQSxFQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLGlCQUFBLFNBQUEsV0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEscUdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsdUJBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQUEsaUJBUUE7UUFQQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLFFBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLFVBQUEsSUFBQTtZQUNBLEtBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHdCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxlQUFBLENBQUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxvQ0FBQSxHQUFBLFVBQUEsUUFBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtZQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7T0FJQTtJQUNBLHdCQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUEsU0FBQTtRQUFBLDBCQUFBLEVBQUEsaUJBQUE7UUFDQSxJQUFBLEdBQUEsR0FBQSxZQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsR0FBQSxHQUFBLGVBQUEsR0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLDZCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQUEsaUJBV0E7UUFWQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsRUFBQSxJQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsY0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxLQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLElBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxNQUFBLENBQUEsbUNBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSx1REFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLGNBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLE1BQUEsQ0FBQSxxQ0FBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLHlEQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsY0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGdDQUFBLEdBQUEsVUFBQSxJQUFBO1FBQUEsaUJBVUE7UUFUQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsRUFBQSxJQUFBO1lBQ0EsSUFBQSxJQUFBLEtBQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxtQkFBQSxHQUFBLElBQUEsR0FBQSxPQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQ0FBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLElBQUEsSUFBQSxHQUFBLGtDQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsNkJBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxPQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUNBQUEsR0FBQSxVQUFBLElBQUE7UUFBQSxpQkFNQTtRQUxBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxFQUFBLElBQUE7WUFDQSxJQUFBLElBQUEsS0FBQSxDQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLHlCQUFBLEdBQUEsSUFBQSxHQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxpQkFBQTtBQUFBLENBcExBLEFBb0xBLENBcExBLFNBQUEsR0FvTEE7QUFFQTtJQUFBLDJDQUFBO0lBQUE7UUFBQSxxRUFVQTtRQVRBLFVBQUEsR0FBQSxNQUFBLENBQUE7UUFDQSxXQUFBLEdBQUEsTUFBQSxDQUFBO1FBQ0EsY0FBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLFNBQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxjQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsZUFBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTs7SUFDQSxDQUFBO0lBQUEsOEJBQUE7QUFBQSxDQVZBLEFBVUEsQ0FWQSxzQkFBQSxHQVVBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBIiwiZmlsZSI6ImpxdWVyeS5kaWFsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICog57yT5a2Y5pWw5o2uXHJcbiAqL1xyXG5jbGFzcyBDYWNoZVVybCB7XHJcbiAgICAvKipcclxuICAgICAqIOe8k+WtmOeahOaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfY2FjaGVEYXRhOiB7W3VybDogc3RyaW5nXTogYW55fSA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog57yT5a2Y55qE5LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIF9ldmVudDoge1t1cmw6IHN0cmluZ106IEFycmF5PChkYXRhOiBhbnkpID0+IHZvaWQ+fSA9IHt9O1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzRGF0YSh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZURhdGEuaGFzT3duUHJvcGVydHkodXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGhhc0V2ZW50KHVybDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50Lmhhc093blByb3BlcnR5KHVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmlbDmja7pgJrov4flm57osIPov5Tlm55cclxuICAgICAqIEBwYXJhbSB1cmwgXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0RGF0YSh1cmw6IHN0cmluZywgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IHZvaWQpIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNEYXRhKHVybCkpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sodGhpcy5fY2FjaGVEYXRhW3VybF0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmhhc0V2ZW50KHVybCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRbdXJsXS5wdXNoKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9ldmVudFt1cmxdID0gW2NhbGxiYWNrXTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICQuZ2V0SlNPTih1cmwsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuY29kZSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5zZXREYXRhKHVybCwgZGF0YS5kYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVVJMIEVSUk9SISAnICsgdXJsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruaVsOaNruW5tuWbnuiwg1xyXG4gICAgICogQHBhcmFtIHVybCBcclxuICAgICAqIEBwYXJhbSBkYXRhIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHNldERhdGEodXJsOiBzdHJpbmcsIGRhdGE6IGFueSkge1xyXG4gICAgICAgIHRoaXMuX2NhY2hlRGF0YVt1cmxdID0gZGF0YTtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzRXZlbnQodXJsKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2V2ZW50W3VybF0uZm9yRWFjaChjYWxsYmFjaz0+e1xyXG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRbdXJsXTtcclxuICAgIH1cclxufSIsImFic3RyYWN0IGNsYXNzIEV2ZSB7XHJcbiAgICBwdWJsaWMgb3B0aW9uczogYW55O1xyXG5cclxuICAgIHB1YmxpYyBvbihldmVudDogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiB0aGlzIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnNbJ29uJyArIGV2ZW50XSA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNFdmVudChldmVudDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnb24nICsgZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cmlnZ2VyKGV2ZW50OiBzdHJpbmcsIC4uLiBhcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIGxldCByZWFsRXZlbnQgPSAnb24nICsgZXZlbnQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0V2ZW50KGV2ZW50KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbcmVhbEV2ZW50XS5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG59IiwiaW50ZXJmYWNlIERpYWxvZ0JveE9wdGlvbiBleHRlbmRzIERpYWxvZ0NvbnRlbnRPcHRpb24ge1xyXG4gICAgaWNvPzogc3RyaW5nLCAgICAgICAvLyDmoIfpopjmoI/nmoTlm77moIdcclxuICAgIHRpdGxlPzogc3RyaW5nLCAgICAgLy8g5qCH6aKYXHJcbiAgICBjYW5Nb3ZlPzogYm9vbGVhbiwgICAgICAgIC8v5piv5ZCm5YWB6K6456e75YqoXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ0JveCBleHRlbmRzIERpYWxvZ0NvbnRlbnQge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dCb3hPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5YaF5a65XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94Lmh0bWwodGhpcy5nZXRIZWFkZXJIdG1sKCkgKyB0aGlzLmdldENvbnRlbnRIdG1sKCkrIHRoaXMuZ2V0Rm9vdGVySHRtbCgpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMub3B0aW9ucy50YXJnZXQgfHwgRGlhbG9nLiR3aW5kb3c7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gdGFyZ2V0LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5ib3gud2lkdGgoKTtcclxuICAgICAgICBsZXQgbWF4SGVpZ2h0ID0gdGFyZ2V0LmhlaWdodCgpO1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmJveC5oZWlnaHQoKTtcclxuICAgICAgICBpZiAobWF4V2lkdGggPiB3aWR0aCAmJiBtYXhIZWlnaHQgPiBoZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5jc3Moe1xyXG4gICAgICAgICAgICAgICAgbGVmdDogKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcsXHJcbiAgICAgICAgICAgICAgICB0b3A6IChtYXhIZWlnaHQgLSBoZWlnaHQpIC8gMiArICdweCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMudHlwZSA9IERpYWxvZ1R5cGUucGFnZTtcclxuICAgICAgICB0aGlzLmJveC5hZGRDbGFzcyhcImRpYWxvZy1wYWdlXCIpO1xyXG4gICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICAvLyDngrnlh7vmoIfpopjmoI/np7vliqhcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIGxldCBpc01vdmUgPSBmYWxzZTtcclxuICAgICAgICBsZXQgeCwgeTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLmRpYWxvZy1oZWFkZXIgLmRpYWxvZy10aXRsZVwiKS5tb3VzZWRvd24oZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBpc01vdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB4ID0gZS5wYWdlWCAtIHBhcnNlSW50KGluc3RhbmNlLmJveC5jc3MoJ2xlZnQnKSk7XHJcbiAgICAgICAgICAgIHkgPSBlLnBhZ2VZIC0gcGFyc2VJbnQoaW5zdGFuY2UuYm94LmNzcygndG9wJykpO1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5ib3guZmFkZVRvKDIwLCAuNSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJChkb2N1bWVudCkubW91c2Vtb3ZlKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgaWYgKCFpc01vdmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnN0YW5jZS5ib3guY3NzKHtcclxuICAgICAgICAgICAgICAgIHRvcDogZS5wYWdlWSAtIHksXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBlLnBhZ2VYIC0geFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pLm1vdXNldXAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlzTW92ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuYm94KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5ib3guZmFkZVRvKCdmYXN0JywgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuYm94KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5yZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzdXBlci5iaW5kRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeiuvuWwuuWvuFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVzaXplKCkge1xyXG4gICAgICAgIHRoaXMuc2V0UHJvcGVydHkoKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ0JveE9wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEhlYWRlckh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWhlYWRlclwiPjxkaXYgY2xhc3M9XCJkaWFsb2ctdGl0bGVcIj4nO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaWNvKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxpIGNsYXNzPVwiZmEgZmEtJyArIHRoaXMub3B0aW9ucy5pY28gKyAnXCI+PC9pPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudGl0bGUpIHtcclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLm9wdGlvbnMudGl0bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBodG1sICsgJzwvZGl2PjxpIGNsYXNzPVwiZmEgZmEtY2xvc2UgZGlhbG9nLWNsb3NlXCI+PC9pPjwvZGl2Pic7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ0JveE9wdGlvbiBleHRlbmRzIERlZmF1bHREaWFsb2dDb250ZW50T3B0aW9uIGltcGxlbWVudHMgRGlhbG9nQm94T3B0aW9uIHtcclxuICAgIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JztcclxuICAgIGNhbk1vdmU6IGJvb2xlYW4gPSB0cnVlO1xyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUuYm94LCBEaWFsb2dCb3gpOyIsImFic3RyYWN0IGNsYXNzIERpYWxvZ0NvcmUgZXh0ZW5kcyBCb3gge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgcHVibGljIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLmdldERlZmF1bHRPcHRpb24oKSwgb3B0aW9uKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudHlwZSA9ICBEaWFsb2cucGFyc2VFbnVtPERpYWxvZ1R5cGU+KHRoaXMub3B0aW9ucy50eXBlLCBEaWFsb2dUeXBlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3B0aW9uczogRGlhbG9nT3B0aW9uO1xyXG5cclxuICAgIHByaXZhdGUgX3N0YXR1czogRGlhbG9nU3RhdHVzID0gRGlhbG9nU3RhdHVzLmNsb3NlZDtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHN0YXR1cygpOiBEaWFsb2dTdGF0dXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zdGF0dXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBzdGF0dXMoYXJnOiBEaWFsb2dTdGF0dXMpIHtcclxuICAgICAgICBhcmcgPSBEaWFsb2cucGFyc2VFbnVtPERpYWxvZ1N0YXR1cz4oYXJnLCBEaWFsb2dTdGF0dXMpO1xyXG4gICAgICAgIC8vIOebuOWQjOeKtuaAgeS4jeWBmuaTjeS9nFxyXG4gICAgICAgIGlmICh0aGlzLl9zdGF0dXMgPT0gYXJnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoIChhcmcpIHtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dTdGF0dXMuc2hvdzpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0JveCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nU3RhdHVzLmhpZGU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVCb3goKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ1N0YXR1cy5jbG9zaW5nOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zaW5nQm94KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dTdGF0dXMuY2xvc2VkOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZUJveCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBcInN0YXR1cyBlcnJvcjpcIisgYXJnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBfZGlhbG9nQmc6IEpRdWVyeTsgIC8vIOiHquW3seeahOiDjOaZr+mBrue9qVxyXG5cclxuICAgIHByaXZhdGUgX3k6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3kpIHtcclxuICAgICAgICAgICAgdGhpcy5feSA9IHRoaXMuYm94Lm9mZnNldCgpLnRvcCAtICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3k7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCB5KHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2hlaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWlnaHQgPSB0aGlzLmJveC5oZWlnaHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGhlaWdodChoZWlnaHQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX2hlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLmJveC5oZWlnaHQoaGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaUueWPmOeKtuaAgVxyXG4gICAgICogQHBhcmFtIHN0YXR1cyBcclxuICAgICAqIEBwYXJhbSBoYXNFdmVudCBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNoYW5nZVN0YXR1cyhzdGF0dXM6IERpYWxvZ1N0YXR1cywgaGFzRXZlbnQ6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmIChoYXNFdmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9zdGF0dXMgPSBzdGF0dXM7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bpu5jorqTorr7nva5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKTogRGlhbG9nT3B0aW9uIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dPcHRpb24oKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvlu7rlubbmmL7npLrmjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNob3dCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJveCkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZhbHNlID09IHRoaXMudHJpZ2dlcignc2hvdycpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaG93IHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ib3guc2hvdygpO1xyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IERpYWxvZ1N0YXR1cy5zaG93O1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65bm26ZqQ6JeP5o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBoaWRlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLnRyaWdnZXIoJ2hpZGUnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaGlkZSBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94LmhpZGUoKTtcclxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBEaWFsb2dTdGF0dXMuaGlkZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWKqOeUu+WFs+mXre+8jOacieWFs+mXreWKqOeUu1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2luZ0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5jbG9zaW5nIFxyXG4gICAgICAgIHx8IHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5jbG9zZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdjbG9zaW5nJykpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Nsb3Npbmcgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBEaWFsb2dTdGF0dXMuY2xvc2luZztcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYm94LmFkZENsYXNzKCdkaWFsb2ctY2xvc2luZycpLm9uZSgnd2Via2l0QW5pbWF0aW9uRW5kIG1vekFuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBvYW5pbWF0aW9uZW5kIGFuaW1hdGlvbmVuZCcsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmNsb3NpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIOmYsuatouS4remAlOaUueWPmOW9k+WJjeeKtuaAgVxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuY2xvc2VCb3goKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yig6Zmk5o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjbG9zZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudHJpZ2dlcignY2xvc2VkJykgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Nsb3NlZCBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IERpYWxvZ1N0YXR1cy5jbG9zZWQ7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RpYWxvZ0JnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9kaWFsb2dCZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLnJlbW92ZUl0ZW0odGhpcy5pZCk7IFxyXG4gICAgICAgIHRoaXMuYm94LnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMuYm94ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhYnN0cmFjdCBpbml0KCk7XHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvcmUoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3ggPSAkKCc8ZGl2IGNsYXNzPVwiZGlhbG9nIGRpYWxvZy0nKyBEaWFsb2dUeXBlW3RoaXMub3B0aW9ucy50eXBlXSArJ1wiIGRhdGEtdHlwZT1cImRpYWxvZ1wiIGRpYWxvZy1pZD0nKyB0aGlzLmlkICsnPjwvZGl2PicpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVDb250ZW50KCk6IHRoaXM7XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IHNldFByb3BlcnR5KCk6IHRoaXM7XHJcblxyXG5cclxuICAgIHB1YmxpYyBjc3Moa2V5OiBhbnksIHZhbHVlPzogc3RyaW5nfCBudW1iZXIpOiBKUXVlcnkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJveC5jc3Moa2V5LCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNob3coKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBEaWFsb2dTdGF0dXMuc2hvdztcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaGlkZSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IERpYWxvZ1N0YXR1cy5oaWRlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjbG9zZSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IERpYWxvZ1N0YXR1cy5jbG9zaW5nO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0b2dnbGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5oaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W55u45ZCM57G75Z6L5by55Ye65qGG55qE5pyA5LiK6Z2iXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBnZXREaWFsb2dUb3AoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBsZXQgeTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIERpYWxvZy5tYXAoaXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLm9wdGlvbnMudHlwZSAhPSB0aGlzLm9wdGlvbnMudHlwZSB8fCBpdGVtLmlkID09IGluc3RhbmNlLmlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF5IHx8IGl0ZW0ueSA8IHkpIHtcclxuICAgICAgICAgICAgICAgIHkgPSBpdGVtLnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXREaWFsb2dCb3R0b20oKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBsZXQgeTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIERpYWxvZy5tYXAoaXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLm9wdGlvbnMudHlwZSAhPSB0aGlzLm9wdGlvbnMudHlwZSB8fCBpdGVtLmlkID09IGluc3RhbmNlLmlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGJvdHRvbSA9IGl0ZW0ueSArIGl0ZW0uaGVpZ2h0O1xyXG4gICAgICAgICAgICBpZiAoIXkgfHwgYm90dG9tID4geSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IGJvdHRvbTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgcHJpdmF0ZSBfZ2V0Qm90dG9tKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KCQod2luZG93KS5oZWlnaHQoKSAqIC4zMyAtIHRoaXMuaGVpZ2h0IC8gMiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0VG9wKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KCQod2luZG93KS5oZWlnaHQoKSAvIDIgLSB0aGlzLmhlaWdodCAvIDIsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldExlZnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLndpZHRoKCkgLyAyIC0gdGhpcy5ib3gud2lkdGgoKSAvIDIsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFJpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KCQod2luZG93KS53aWR0aCgpIC8gMiAtIHRoaXMuYm94LndpZHRoKCkgLyAyLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRXaWR0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB3aWR0aCA9IERpYWxvZy4kd2luZG93LndpZHRoKCk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy53aWR0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHdpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gd2lkdGggKiB0aGlzLm9wdGlvbnMud2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0SGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IERpYWxvZy4kd2luZG93LmhlaWdodCgpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGVpZ2h0ID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGVpZ2h0ICogdGhpcy5vcHRpb25zLmhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRMZWZ0VG9wKGRpcmVjdGlvbjogRGlhbG9nRGlyZWN0aW9uLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgYm94V2lkdGg6IG51bWJlciwgYm94SGVpZ2h0OiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0VG9wOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFswLCAwXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24udG9wOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsoYm94SGVpZ2h0IC0gd2lkdGgpIC8gMiwgMF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0VG9wOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtib3hIZWlnaHQgLSB3aWR0aCwgMF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtib3hIZWlnaHQgLSB3aWR0aCwgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHRCb3R0b206XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2JveEhlaWdodCAtIHdpZHRoLCBib3hIZWlnaHQgLSBoZWlnaHRdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5ib3R0b206XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyhib3hIZWlnaHQgLSB3aWR0aCkgLyAyLCBib3hIZWlnaHQgLSBoZWlnaHRdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0Qm90dG9tOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFswLCBib3hIZWlnaHQgLSBoZWlnaHRdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFswLCAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5jZW50ZXI6XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyhib3hIZWlnaHQgLSB3aWR0aCkgLyAyLCAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImNsYXNzIERlZmF1bHREaWFsb2dPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dPcHRpb24ge1xyXG4gICAgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonO1xyXG4gICAgdHlwZT86IERpYWxvZ1R5cGUgPSBEaWFsb2dUeXBlLnRpcDtcclxuICAgIGNhbk1vdmU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgb25kb25lOiBGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgIH1cclxufSIsImNsYXNzIERpYWxvZyB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBtZXRob2RzOiB7W3R5cGU6IG51bWJlcl06IEZ1bmN0aW9ufSA9IHt9O1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9kYXRhOiB7W2lkOiBudW1iZXJdOiBEaWFsb2dDb3JlfSA9IHt9O1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9ndWlkOiBudW1iZXIgPSAwOyAvLyBpZOagh+iusFxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF90aXBEYXRhOiBBcnJheTxudW1iZXI+ID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2RpYWxvZ0JnOiBKUXVlcnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2JnTG9jazogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljICR3aW5kb3cgPSAkKHdpbmRvdyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvpgKDlvLnlh7rmoYZcclxuICAgICAqIEBwYXJhbSBvcHRpb24gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9wdGlvbj86IERpYWxvZ09wdGlvbik6IERpYWxvZ0NvcmUge1xyXG4gICAgICAgIGlmICghb3B0aW9uLnR5cGUpIHtcclxuICAgICAgICAgICAgb3B0aW9uLnR5cGUgPSBEaWFsb2dUeXBlLnRpcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0aW9uLnR5cGUgPSB0aGlzLnBhcnNlRW51bTxEaWFsb2dUeXBlPihvcHRpb24udHlwZSwgRGlhbG9nVHlwZSk7XHJcbiAgICAgICAgbGV0IG1ldGhvZCA9IHRoaXMuZ2V0TWV0aG9kKG9wdGlvbi50eXBlKTtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IG5ldyBtZXRob2Qob3B0aW9uKTtcclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHBhcnNlRW51bTxUPih2YWw6IGFueSwgdHlwZTogYW55KTogVCB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVbdmFsXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaPkOekulxyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGltZSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyB0aXAoY29udGVudDogc3RyaW5nIHwgRGlhbG9nVGlwT3B0aW9uLCB0aW1lOiBudW1iZXIgPSAyMDAwKTogRGlhbG9nQ29yZSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7Y29udGVudDogY29udGVudCwgdGltZTogdGltZX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUudGlwO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZShjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmtojmga9cclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpbWUgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbWVzc2FnZShjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dNZXNzYWdlT3B0aW9uLCB0aW1lOiBudW1iZXIgPSAyMDAwKTogRGlhbG9nQ29yZSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7Y29udGVudDogY29udGVudCwgdGltZTogdGltZX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUubWVzc2FnZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUoY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0gdGltZSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBsb2FkaW5nKHRpbWU6IG51bWJlciB8IERpYWxvZ09wdGlvbiA9IDApOiBEaWFsb2dDb3JlIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRpbWUgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgdGltZSA9IHt0aW1lOiB0aW1lfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGltZS50eXBlID0gRGlhbG9nVHlwZS5sb2FkaW5nO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZSh0aW1lKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlhoXlrrnlvLnnqpdcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjb250ZW50KGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ09wdGlvbiwgaGFzWWVzPzogYm9vbGVhbiwgaGFzTm8/OiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgaGFzWWVzOiBoYXNZZXMsXHJcbiAgICAgICAgICAgICAgICBoYXNObzogaGFzTm9cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS5jb250ZW50O1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZShjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmma7pgJrlvLnnqpdcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBib3goY29udGVudDogc3RyaW5nIHwgRGlhbG9nT3B0aW9uLCB0aXRsZTogc3RyaW5nID0gJ+aPkOekuicsIGhhc1llcz86IGJvb2xlYW4sIGhhc05vPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICAgICAgICAgIGhhc1llczogaGFzWWVzLFxyXG4gICAgICAgICAgICAgICAgaGFzTm86IGhhc05vXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUuYm94O1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZShjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDooajmoLzlvLnnqpdcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGRvbmUgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGZvcm0oY29udGVudDogYW55LCB0aXRsZTogc3RyaW5nID0gJ+aPkOekuicsIGRvbmU/OiBGdW5jdGlvbiwgaGFzWWVzPzogYm9vbGVhbiwgaGFzTm8/OiBib29sZWFuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgdHlwZTogRGlhbG9nVHlwZS5mb3JtLFxyXG4gICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIGhhc1llczogaGFzWWVzLFxyXG4gICAgICAgICAgICBoYXNObzogaGFzTm8sXHJcbiAgICAgICAgICAgIG9uZG9uZTogZG9uZVxyXG4gICAgICAgIH0pLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmhtemdouW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHBhZ2UoY29udGVudDogc3RyaW5nIHwgRGlhbG9nT3B0aW9uLCB0aXRsZTogc3RyaW5nID0gJ+aPkOekuicsIGhhc1llcz86IGJvb2xlYW4sIGhhc05vPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICAgICAgICAgIGhhc1llczogaGFzWWVzLFxyXG4gICAgICAgICAgICAgICAgaGFzTm86IGhhc05vXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUucGFnZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUoY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qGM6Z2i5o+Q6YaSXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSBpY29uIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG5vdGlmeSh0aXRsZTogc3RyaW5nICB8IERpYWxvZ09wdGlvbiA9ICfpgJrnn6UnLCBjb250ZW50OiBzdHJpbmcgPSAnJywgaWNvbjogc3RyaW5nID0gJycpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRpdGxlICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRpdGxlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgIGljbzogaWNvblxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aXRsZS50eXBlID0gRGlhbG9nVHlwZS5ub3RpZnk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKHRpdGxlKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDlvLnlh7rmoYZcclxuICAgICAqIEBwYXJhbSBlbGVtZW50IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFkZEl0ZW0oZWxlbWVudDogRGlhbG9nQ29yZSkge1xyXG4gICAgICAgIHRoaXMuX2RhdGFbKyt0aGlzLl9ndWlkXSA9IGVsZW1lbnQ7XHJcbiAgICAgICAgZWxlbWVudC5pZCA9IHRoaXMuX2d1aWQ7XHJcbiAgICAgICAgaWYgKHRoaXMuX25lZWRCZyhlbGVtZW50Lm9wdGlvbnMudHlwZSkgXHJcbiAgICAgICAgJiYgIWVsZW1lbnQub3B0aW9ucy50YXJnZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93QmcoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBoYXNJdGVtKGlkOiBudW1iZXIgfCBzdHJpbmcgPSB0aGlzLl9ndWlkKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGEuaGFzT3duUHJvcGVydHkoaWQgKyAnJylcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldChpZDogbnVtYmVyIHwgc3RyaW5nID0gdGhpcy5fZ3VpZCkge1xyXG4gICAgICAgIGlmICh0aGlzLmhhc0l0ZW0oaWQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kYXRhW2lkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgXCJlcnJvcjpcIiArIGlkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uaWTliKDpmaTlvLnlh7rmoYZcclxuICAgICAqIEBwYXJhbSBpZCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByZW1vdmVJdGVtKGlkOiBudW1iZXIgPSB0aGlzLl9ndWlkKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0l0ZW0oaWQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZGF0YVtpZF0uY2xvc2UoKTtcclxuICAgICAgICBpZiAodGhpcy5fbmVlZEJnKHRoaXMuX2RhdGFbaWRdLm9wdGlvbnMudHlwZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUJnKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhW2lkXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIoOmZpOaJgOacieW8ueWHuuahhlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlbW92ZSgpIHtcclxuICAgICAgICB0aGlzLm1hcChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uY2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIpOaWreaYr+WQpumcgOimgeS9v+eUqOmBrue9qVxyXG4gICAgICogQHBhcmFtIHR5cGUgXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIF9uZWVkQmcodHlwZTogRGlhbG9nVHlwZSB8IHN0cmluZyB8IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0eXBlICE9IERpYWxvZ1R5cGUudGlwIFxyXG4gICAgICAgICYmIHR5cGUgIT0gRGlhbG9nVHlwZS5tZXNzYWdlXHJcbiAgICAgICAgJiYgdHlwZSAhPSBEaWFsb2dUeXBlLnBhZ2UgXHJcbiAgICAgICAgJiYgdHlwZSAhPSBEaWFsb2dUeXBlLm5vdGlmeVxyXG4gICAgICAgICYmIHR5cGUgIT0gRGlhbG9nVHlwZS5wb3A7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlvqrnjq/miYDmnInlvLnlh7rmoYZcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBtYXAoY2FsbGJhY2s6IChpdGVtOiBEaWFsb2dDb3JlKSA9PiBhbnkpIHtcclxuICAgICAgICBmb3IobGV0IGlkIGluIHRoaXMuX2RhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0l0ZW0oaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gY2FsbGJhY2sodGhpcy5fZGF0YVtpZF0pO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrpga7nvalcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBzaG93QmcodGFyZ2V0OiBKUXVlcnkgPSAkKGRvY3VtZW50LmJvZHkpLCBpc1B1YmxpYzogYm9vbGVhbiA9IHRydWUpIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIGlmICghdGhpcy5fZGlhbG9nQmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGlhbG9nQmcgPSAkKCc8ZGl2IGNsYXNzPVwiZGlhbG9nLWJnXCI+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOabtOaUuemBrue9qeeahOS9jee9rlxyXG4gICAgICAgIHRhcmdldC5hcHBlbmQodGhpcy5fZGlhbG9nQmcpO1xyXG4gICAgICAgIHRoaXMuX2RpYWxvZ0JnLnRvZ2dsZUNsYXNzKCdkaWFsb2ctYmctcHJpdmF0ZScsICFpc1B1YmxpYyk7XHJcbiAgICAgICAgdGhpcy5fYmdMb2NrICsrO1xyXG4gICAgICAgIHRoaXMuX2RpYWxvZ0JnLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmakOiXj+mBrue9qVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGNsb3NlQmcoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9kaWFsb2dCZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2JnTG9jay0tO1xyXG4gICAgICAgIGlmICh0aGlzLl9iZ0xvY2sgPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZGlhbG9nQmcuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgYWRkTWV0aG9kKHR5cGU6IERpYWxvZ1R5cGUsIGRpYWxvZzogRnVuY3Rpb24pIHtcclxuICAgICAgICB0aGlzLm1ldGhvZHNbdHlwZV0gPSBkaWFsb2c7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBoYXNNZXRob2QodHlwZTogRGlhbG9nVHlwZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1ldGhvZHMuaGFzT3duUHJvcGVydHkodHlwZS50b1N0cmluZygpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldE1ldGhvZCh0eXBlOiBEaWFsb2dUeXBlKTogRnVuY3Rpb24ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1ldGhvZHNbdHlwZV07XHJcbiAgICB9XHJcbn0iLCIvKipcclxuICog5by55Ye65qGG57G75Z6LXHJcbiAqL1xyXG5lbnVtIERpYWxvZ1R5cGUge1xyXG4gICAgdGlwLFxyXG4gICAgbWVzc2FnZSxcclxuICAgIG5vdGlmeSxcclxuICAgIHBvcCxcclxuICAgIGxvYWRpbmcsXHJcbiAgICBzZWxlY3QsXHJcbiAgICBpbWFnZSxcclxuICAgIGRpc2ssXHJcbiAgICBmb3JtLFxyXG4gICAgY29udGVudCxcclxuICAgIGJveCxcclxuICAgIHBhZ2VcclxufVxyXG5cclxuLyoqXHJcbiAqIOW8ueWHuuahhuS9jee9rlxyXG4gKi9cclxuZW51bSBEaWFsb2dEaXJlY3Rpb24ge1xyXG4gICAgdG9wLFxyXG4gICAgcmlnaHQsXHJcbiAgICBib3R0b20sXHJcbiAgICBsZWZ0LFxyXG4gICAgY2VudGVyLFxyXG4gICAgbGVmdFRvcCxcclxuICAgIHJpZ2h0VG9wLFxyXG4gICAgcmlnaHRCb3R0b20sXHJcbiAgICBsZWZ0Qm90dG9tXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDlvLnlh7rmoYbnirbmgIFcclxuICovXHJcbmVudW0gRGlhbG9nU3RhdHVzIHtcclxuICAgIGhpZGUsXHJcbiAgICBzaG93LFxyXG4gICAgY2xvc2luZywgICAvL+WFs+mXreS4rVxyXG4gICAgY2xvc2VkICAgIC8v5bey5YWz6ZetXHJcbn1cclxuXHJcbmVudW0gRGlhbG9nRGlza1R5cGUge1xyXG4gICAgZmlsZSxcclxuICAgIGRpcmVjdG9yeVxyXG59IiwiY2xhc3MgRGlhbG9nUGx1Z2luIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyBlbGVtZW50OiBKUXVlcnksXHJcbiAgICAgICAgcHVibGljIG9wdGlvbj86IERpYWxvZ09wdGlvblxyXG4gICAgKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLmVsZW1lbnQuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2UuZGlhbG9nKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaWFsb2cgPSBEaWFsb2cuY3JlYXRlKGluc3RhbmNlLl9wYXJzZU9wdGlvbigkKHRoaXMpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5zdGFuY2UuZGlhbG9nLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZGlhbG9nOiBEaWFsb2dDb3JlO1xyXG5cclxuICAgIHByaXZhdGUgX3BhcnNlT3B0aW9uKGVsZW1lbnQ6IEpRdWVyeSkge1xyXG4gICAgICAgIGxldCBvcHRpb246IERpYWxvZ09wdGlvbiA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbik7XHJcbiAgICAgICAgb3B0aW9uLnR5cGUgPSBEaWFsb2cucGFyc2VFbnVtPERpYWxvZ1R5cGU+KGVsZW1lbnQuYXR0cignZGlhbG9nLXR5cGUnKSB8fCB0aGlzLm9wdGlvbi50eXBlLCBEaWFsb2dUeXBlKTtcclxuICAgICAgICBvcHRpb24uY29udGVudCA9IGVsZW1lbnQuYXR0cignZGlhbG9nLWNvbnRlbnQnKSB8fCB0aGlzLm9wdGlvbi5jb250ZW50O1xyXG4gICAgICAgIG9wdGlvbi51cmwgPSBlbGVtZW50LmF0dHIoJ2RpYWxvZy11cmwnKSB8fCB0aGlzLm9wdGlvbi51cmw7XHJcbiAgICAgICAgb3B0aW9uLnRpbWUgPSBwYXJzZUludChlbGVtZW50LmF0dHIoJ2RpYWxvZy10aW1lJykpIHx8IHRoaXMub3B0aW9uLnRpbWU7XHJcbiAgICAgICAgaWYgKG9wdGlvbi50eXBlID09IERpYWxvZ1R5cGUucG9wICYmICFvcHRpb24udGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIG9wdGlvbi50YXJnZXQgPSBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3B0aW9uO1xyXG4gICAgfVxyXG59XHJcblxyXG47KGZ1bmN0aW9uKCQ6IGFueSkge1xyXG4gICAgJC5mbi5kaWFsb2cgPSBmdW5jdGlvbihvcHRpb24gPzogRGlhbG9nT3B0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2dQbHVnaW4odGhpcywgb3B0aW9uKTtcclxuICAgIH07XHJcbn0pKGpRdWVyeSk7IiwiaW50ZXJmYWNlIERpYWxvZ1RpcE9wdGlvbiBleHRlbmRzIERpYWxvZ09wdGlvbiB7XHJcbiAgICB0aW1lPzogbnVtYmVyLCAgICAgICAgIC8v5pi+56S65pe26Ze0XHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ1RpcCBleHRlbmRzIERpYWxvZ0NvcmUge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcHRpb25zOiBEaWFsb2dUaXBPcHRpb247XHJcblxyXG4gICAgcHJpdmF0ZSBfdGltZUhhbmRsZTogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBpbml0KCkge1xyXG4gICAgICAgIERpYWxvZy5hZGRJdGVtKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQ29yZSgpLmNyZWF0ZUNvbnRlbnQoKVxyXG4gICAgICAgIC5hcHBlbmRQYXJlbnQoKS5zZXRQcm9wZXJ0eSgpLmJpbmRFdmVudCgpXHJcbiAgICAgICAgLmFkZFRpbWUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dUaXBPcHRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruWGheWuuVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC50ZXh0KHRoaXMub3B0aW9ucy5jb250ZW50KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOWIsOWuueWZqOS4ilxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYXBwZW5kUGFyZW50KCk6IHRoaXMge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnRhcmdldCkge1xyXG4gICAgICAgICAgICAkKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0aGlzLmJveCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMudGFyZ2V0LmFwcGVuZCh0aGlzLmJveCk7XHJcbiAgICAgICAgdGhpcy5ib3guYWRkQ2xhc3MoXCJkaWFsb2ctcHJpdmF0ZVwiKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruWxnuaAp1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gRGlhbG9nLiR3aW5kb3cud2lkdGgoKTtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmJveC53aWR0aCgpO1xyXG4gICAgICAgIHRoaXMueSA9ICh0aGlzLmdldERpYWxvZ1RvcCgpIHx8IChEaWFsb2cuJHdpbmRvdy5oZWlnaHQoKSAqIDAuNjggKyAzMCkpIC0gMzAgLSB0aGlzLmhlaWdodDsgXHJcbiAgICAgICAgdGhpcy5jc3MoJ2xlZnQnLCAobWF4V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4Jyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnu5Hlrprkuovku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuYm94KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5yZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YeN6K6+5bC65a+4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZXNpemUoKSB7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gRGlhbG9nLiR3aW5kb3cud2lkdGgoKTtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLmJveC53aWR0aCgpO1xyXG4gICAgICAgIHRoaXMuY3NzKCdsZWZ0JywgKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcpO1xyXG4gICAgICAgIHRoaXMudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFkZFRpbWUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50aW1lIDw9IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuX3RpbWVIYW5kbGUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5fdGltZUhhbmRsZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaW5zdGFuY2UuY2xvc2UoKTtcclxuICAgICAgICB9LCB0aGlzLm9wdGlvbnMudGltZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHN0b3BUaW1lKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fdGltZUhhbmRsZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lSGFuZGxlKTtcclxuICAgICAgICB0aGlzLl90aW1lSGFuZGxlID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zaW5nQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghc3VwZXIuY2xvc2luZ0JveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdG9wVGltZSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXN1cGVyLmNsb3NlQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNoYW5nZU90aGVyKCk7XHJcbiAgICAgICAgdGhpcy5zdG9wVGltZSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjaGFuZ2VPdGhlcigpIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIERpYWxvZy5tYXAoaXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLm9wdGlvbnMudHlwZSAhPSBEaWFsb2dUeXBlLnRpcCB8fCBpdGVtLnkgPj0gaW5zdGFuY2UueSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGl0ZW0ueSArPSBpbnN0YW5jZS5oZWlnaHQgKyAzMDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ1RpcE9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ1RpcE9wdGlvbiB7XHJcbiAgICB0aW1lOiBudW1iZXIgPSAyMDAwO1xyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUudGlwLCBEaWFsb2dUaXApOyIsImludGVyZmFjZSBEaWFsb2dNZXNzYWdlT3B0aW9uIGV4dGVuZHMgRGlhbG9nVGlwT3B0aW9uIHtcclxuXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ01lc3NhZ2UgZXh0ZW5kcyBEaWFsb2dUaXAge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmhlaWdodDtcclxuICAgICAgICB0aGlzLnkgPSAodGhpcy5nZXREaWFsb2dCb3R0b20oKSB8fCAoRGlhbG9nLiR3aW5kb3cuaGVpZ2h0KCkgKiAwLjEgLSAzMCkpICsgMzA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2hhbmdlT3RoZXIoKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBEaWFsb2cubWFwKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5vcHRpb25zLnR5cGUgIT0gRGlhbG9nVHlwZS5tZXNzYWdlIHx8IGl0ZW0ueSA8PSBpbnN0YW5jZS55KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaXRlbS55IC09IGluc3RhbmNlLmhlaWdodCArIDMwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUubWVzc2FnZSwgRGlhbG9nTWVzc2FnZSk7IiwiaW50ZXJmYWNlIERpYWxvZ05vdGlmeU9wdGlvbiBleHRlbmRzIERpYWxvZ1RpcE9wdGlvbiB7XHJcbiAgICB0aXRsZT86IHN0cmluZyxcclxuICAgIGljbz86IHN0cmluZ1xyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dOb3RpZnkgZXh0ZW5kcyBEaWFsb2dUaXAge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nTm90aWZ5T3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3B0aW9uczogRGlhbG9nTm90aWZ5T3B0aW9uO1xyXG5cclxuICAgIHB1YmxpYyBub3RpZnk6IE5vdGlmaWNhdGlvbjsgLy8g57O757uf6YCa55+lXHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bpu5jorqTorr7nva5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldERlZmF1bHRPcHRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0RGlhbG9nTm90aWZ5T3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNob3dCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMubm90aWZ5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLmFkZEl0ZW0odGhpcyk7XHJcbiAgICAgICAgdGhpcy5fY3JlYXRlTm90aWZ5KCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGhpZGVCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvc2VCb3goKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2luZ0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbG9zZUJveCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmNsb3NpbmcgXHJcbiAgICAgICAgfHwgdGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmNsb3NlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLnRyaWdnZXIoJ2Nsb3NlZCcpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbG9zZWQgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jbG9zZU5vdGlmeSgpO1xyXG4gICAgICAgIERpYWxvZy5yZW1vdmVJdGVtKHRoaXMuaWQpOyBcclxuICAgICAgICB0aGlzLmNoYW5nZVN0YXR1cyhEaWFsb2dTdGF0dXMuY2xvc2VkKTtcclxuICAgICAgICB0aGlzLnN0b3BUaW1lKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlTm90aWZ5KCkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgaWYgKFwiTm90aWZpY2F0aW9uXCIgaW4gd2luZG93KSB7XHJcbiAgICAgICAgICAgIGxldCBhc2sgPSBOb3RpZmljYXRpb24ucmVxdWVzdFBlcm1pc3Npb24oKTtcclxuICAgICAgICAgICAgYXNrLnRoZW4ocGVybWlzc2lvbiA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGVybWlzc2lvbiAhPT0gXCJncmFudGVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5oKo55qE5rWP6KeI5Zmo5pSv5oyB5L2G5pyq5byA5ZCv5qGM6Z2i5o+Q6YaS77yBJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLm5vdGlmeSA9IG5ldyBOb3RpZmljYXRpb24oaW5zdGFuY2Uub3B0aW9ucy50aXRsZSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IGluc3RhbmNlLm9wdGlvbnMuY29udGVudCxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiBpbnN0YW5jZS5vcHRpb25zLmljbyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2Uubm90aWZ5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBldmVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UudHJpZ2dlcignZG9uZScpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKCfmgqjnmoTmtY/op4jlmajkuI3mlK/mjIHmoYzpnaLmj5DphpLvvIEnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jbG9zZU5vdGlmeSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubm90aWZ5KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ub3RpZnkuY2xvc2UoKTtcclxuICAgICAgICB0aGlzLm5vdGlmeSA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dOb3RpZnlPcHRpb24gZXh0ZW5kcyBEZWZhdWx0RGlhbG9nVGlwT3B0aW9uIGltcGxlbWVudHMgRGlhbG9nTm90aWZ5T3B0aW9uIHtcclxuICAgIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JztcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLm5vdGlmeSwgRGlhbG9nTm90aWZ5KTsiLCJpbnRlcmZhY2UgRGlhbG9nUG9wT3B0aW9uIGV4dGVuZHMgRGlhbG9nVGlwT3B0aW9uIHtcclxuICAgIGRpcmVjdGlvbj86IERpYWxvZ0RpcmVjdGlvbiB8IHN0cmluZyB8IG51bWJlcixcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nUG9wIGV4dGVuZHMgRGlhbG9nVGlwIHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nUG9wT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID0gRGlhbG9nLnBhcnNlRW51bTxEaWFsb2dEaXJlY3Rpb24+KHRoaXMub3B0aW9ucy5kaXJlY3Rpb24sIERpYWxvZ0RpcmVjdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5fc2V0UG9wUHJvcGVydHkoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOWIsOWuueWZqOS4ilxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYXBwZW5kUGFyZW50KCk6IHRoaXMge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHRoaXMuYm94KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFJhbmRvbURpcmVjdGlvbigpOiBEaWFsb2dEaXJlY3Rpb24ge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChNYXRoLnJhbmRvbSgpICogOCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NldFBvcFByb3BlcnR5KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uID0gdGhpcy5fZ2V0UmFuZG9tRGlyZWN0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94LmFkZENsYXNzKCdkaWFsb2ctcG9wLScgKyBEaWFsb2dEaXJlY3Rpb25bdGhpcy5vcHRpb25zLmRpcmVjdGlvbl0pO1xyXG4gICAgICAgIGxldCBvZmZlc3QgPSB0aGlzLm9wdGlvbnMudGFyZ2V0Lm9mZnNldCgpO1xyXG4gICAgICAgIGxldCBbeCwgeV0gPSB0aGlzLl9nZXRQb3BMZWZ0VG9wKERpYWxvZy5wYXJzZUVudW08RGlhbG9nRGlyZWN0aW9uPih0aGlzLm9wdGlvbnMuZGlyZWN0aW9uLCBEaWFsb2dDb3JlKSwgdGhpcy5ib3gub3V0ZXJXaWR0aCgpLCB0aGlzLmJveC5vdXRlckhlaWdodCgpLCBvZmZlc3QubGVmdCwgb2ZmZXN0LnRvcCwgdGhpcy5vcHRpb25zLnRhcmdldC5vdXRlcldpZHRoKCksIHRoaXMub3B0aW9ucy50YXJnZXQub3V0ZXJIZWlnaHQoKSk7XHJcbiAgICAgICAgdGhpcy5ib3guY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogeCArICdweCcsXHJcbiAgICAgICAgICAgIHRvcDogeSArICdweCdcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRQb3BMZWZ0VG9wKGRpcmVjdGlvbjogRGlhbG9nRGlyZWN0aW9uLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIGJveFdpZHRoOiBudW1iZXIsIGJveEhlaWdodDogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgbGV0IHNwYWNlID0gMzA7IC8vIOepuumamVxyXG4gICAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0VG9wOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbeCArIGJveFdpZHRoICsgc3BhY2UsIHkgKyAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodEJvdHRvbTpcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24uYm90dG9tOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt4ICsgKGJveFdpZHRoIC0gd2lkdGgpIC8gMiwgIHkgKyBib3hIZWlnaHQgKyBzcGFjZV07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnRCb3R0b206XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ggLSB3aWR0aCAtIHNwYWNlLCB5ICsgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24uY2VudGVyOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0VG9wOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi50b3A6XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ggKyAoYm94V2lkdGggLSB3aWR0aCkgLyAyLCB5IC0gaGVpZ2h0IC0gc3BhY2VdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLnBvcCwgRGlhbG9nUG9wKTsiLCJpbnRlcmZhY2UgRGlhbG9nTG9hZGluZ09wdGlvbiBleHRlbmRzIERpYWxvZ1RpcE9wdGlvbiB7XHJcbiAgICBjb3VudD86IG51bWJlcjtcclxuICAgIGV4dHJhPzogc3RyaW5nXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ0xvYWRpbmcgZXh0ZW5kcyBEaWFsb2dUaXAge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dMb2FkaW5nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dMb2FkaW5nT3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guaHRtbCh0aGlzLl9nZXRMb2FkaW5nKCkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLm9wdGlvbnMudGFyZ2V0IHx8IERpYWxvZy4kd2luZG93O1xyXG4gICAgICAgIGxldCBtYXhXaWR0aCA9IHRhcmdldC53aWR0aCgpO1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuYm94LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IG1heEhlaWdodCA9IHRhcmdldC5oZWlnaHQoKTtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5ib3guaGVpZ2h0KCk7XHJcbiAgICAgICAgdGhpcy5jc3Moe1xyXG4gICAgICAgICAgICBsZWZ0OiAobWF4V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4JyxcclxuICAgICAgICAgICAgdG9wOiAobWF4SGVpZ2h0IC0gaGVpZ2h0KSAvIDIgKyAncHgnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0TG9hZGluZygpIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgIGxldCBudW0gPSB0aGlzLm9wdGlvbnMuY291bnQ7XHJcbiAgICAgICAgZm9yKDsgbnVtID4gMDsgbnVtIC0tKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxzcGFuPjwvc3Bhbj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCInKyB0aGlzLm9wdGlvbnMuZXh0cmEgKydcIj4nKyBodG1sICsnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2hvd0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXN1cGVyLnNob3dCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnRhcmdldCkge1xyXG4gICAgICAgICAgICBEaWFsb2cuc2hvd0JnKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuc2hvd0JnKHRoaXMub3B0aW9ucy50YXJnZXQsIGZhbHNlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaGlkZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXN1cGVyLmhpZGVCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NpbmdCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zaW5nQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zZUJveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0YXR1cyAhPSBEaWFsb2dTdGF0dXMuY2xvc2luZykge1xyXG4gICAgICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nTG9hZGluZ09wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ0xvYWRpbmdPcHRpb24ge1xyXG4gICAgZXh0cmE6IHN0cmluZyA9ICdsb2FkaW5nJzsgICAgICAvL+mineWklueahGNsYXNzXHJcbiAgICBjb3VudDogbnVtYmVyID0gNTtcclxuICAgIHRpbWU6IG51bWJlciA9IDA7XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5sb2FkaW5nLCBEaWFsb2dMb2FkaW5nKTtcclxuXHJcbiIsImludGVyZmFjZSBEaWFsb2dCdXR0b24ge1xyXG4gICAgY29udGVudDogc3RyaW5nLFxyXG4gICAgdGFnPzogc3RyaW5nXHJcbn1cclxuXHJcbmludGVyZmFjZSBEaWFsb2dDb250ZW50T3B0aW9uIGV4dGVuZHMgRGlhbG9nT3B0aW9uIHtcclxuICAgIHVybD86IHN0cmluZywgICAgICAgLy8gYWpheOivt+axglxyXG4gICAgYnV0dG9uPzogc3RyaW5nIHwgc3RyaW5nW118IERpYWxvZ0J1dHRvbltdLFxyXG4gICAgaGFzWWVzPzogYm9vbGVhbiB8IHN0cmluZzsgLy8g5piv5ZCm5pyJ56Gu5a6a5oyJ6ZKuXHJcbiAgICBoYXNObz86IGJvb2xlYW4gfCBzdHJpbmc7ICAvLyDmmK/lkKbmnInlj5bmtojmjInpkq5cclxuICAgIG9uZG9uZT86IEZ1bmN0aW9uICAgICAgICAvL+eCueehruWumuaXtuinpuWPkVxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dDb250ZW50IGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dDb250ZW50T3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5jb250ZW50ICYmIHRoaXMub3B0aW9ucy51cmwpIHtcclxuICAgICAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAkLmdldCh0aGlzLm9wdGlvbnMudXJsLCBmdW5jdGlvbihodG1sKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5vcHRpb25zLmNvbnRlbnQgPSBodG1sO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLmluaXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2lzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlOyAvL+WKoOi9veS4rSDmmL7npLrml7blgJnlh7rnjrDliqDovb3liqjnlLtcclxuXHJcbiAgICBwcml2YXRlIF9sb2FkaW5nRGlhbG9nOiBEaWFsb2dDb3JlO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNMb2FkaW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0xvYWRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBpc0xvYWRpbmcoYXJnOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gYXJnO1xyXG4gICAgICAgIHRoaXMuX3RvZ2dsZUxvYWRpbmcoKTtcclxuICAgICAgICAvLyDliqDovb3lrozmiJDml7bmmL7npLrlhYPntKBcclxuICAgICAgICBpZiAoIXRoaXMuX2lzTG9hZGluZyAmJiB0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuc2hvdykge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dCb3goKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmmL7npLrliqDovb3liqjnlLtcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfdG9nZ2xlTG9hZGluZyhhcmc6IERpYWxvZ1N0YXR1cyA9IHRoaXMuc3RhdHVzKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzTG9hZGluZyB8fCBhcmcgIT0gRGlhbG9nU3RhdHVzLnNob3cpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdEaWFsb2cpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdEaWFsb2cuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdEaWFsb2cgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fbG9hZGluZ0RpYWxvZykge1xyXG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nRGlhbG9nLnNob3coKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sb2FkaW5nRGlhbG9nID0gRGlhbG9nLmxvYWRpbmcoKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoKSB7XHJcbiAgICAgICAgRGlhbG9nLmFkZEl0ZW0odGhpcyk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVDb3JlKCkuY3JlYXRlQ29udGVudCgpXHJcbiAgICAgICAgLmFwcGVuZFBhcmVudCgpLnNldFByb3BlcnR5KCkuYmluZEV2ZW50KCk7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5zaG93KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0JveCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dDb250ZW50T3B0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7lhoXlrrlcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guaHRtbCh0aGlzLmdldENvbnRlbnRIdG1sKCkrIHRoaXMuZ2V0Rm9vdGVySHRtbCgpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOWIsOWuueWZqOS4ilxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYXBwZW5kUGFyZW50KCk6IHRoaXMge1xyXG4gICAgICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHRoaXMuYm94KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruWxnuaAp1xyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnu5Hlrprkuovku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy15ZXNcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignZG9uZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2ctY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0Q29udGVudEh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgY29udGVudCA9IHRoaXMub3B0aW9ucy5jb250ZW50O1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0gSlNPTi5zdHJpbmdpZnkoY29udGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImRpYWxvZy1ib2R5XCI+JysgY29udGVudCArJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldEZvb3Rlckh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5oYXNZZXMgJiYgIXRoaXMub3B0aW9ucy5oYXNObyAmJiAodHlwZW9mIHRoaXMub3B0aW9ucy5idXR0b24gPT0gJ29iamVjdCcgJiYgdGhpcy5vcHRpb25zLmJ1dHRvbiBpbnN0YW5jZW9mIEFycmF5ICYmIHRoaXMub3B0aW9ucy5idXR0b24ubGVuZ3RoID09IDApKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImRpYWxvZy1mb290ZXJcIj4nO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGFzWWVzKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCJkaWFsb2cteWVzXCI+JysgKHR5cGVvZiB0aGlzLm9wdGlvbnMuaGFzWWVzID09ICdzdHJpbmcnID8gdGhpcy5vcHRpb25zLmhhc1llcyA6ICfnoa7orqQnKSArJzwvYnV0dG9uPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGFzTm8pIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cImRpYWxvZy1jbG9zZVwiPicrICh0eXBlb2YgdGhpcy5vcHRpb25zLmhhc05vID09ICdzdHJpbmcnID8gdGhpcy5vcHRpb25zLmhhc05vIDogJ+WPlua2iCcpICsnPC9idXR0b24+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuYnV0dG9uID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5idXR0b24gPSBbdGhpcy5vcHRpb25zLmJ1dHRvbl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQuZWFjaCh0aGlzLm9wdGlvbnMuYnV0dG9uLCAoaSwgaXRlbSk9PiB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGJ1dHRvblwiPicraXRlbSsnPC9idXR0b24+JztcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiJytpdGVtLnRhZysnXCI+JytpdGVtLmNvbnRlbnQrJzwvYnV0dG9uPic7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGh0bWwgKz0gJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9uQ2xpY2sodGFnOiBzdHJpbmcsIGNhbGxiYWNrOiAoZWxlbWVudDogSlF1ZXJ5KSA9PiBhbnkpIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYm94Lm9uKCdjbGljaycsIHRhZywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKGluc3RhbmNlLCAkKHRoaXMpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2hvd0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGlhbG9nU3RhdHVzLnNob3cpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc3VwZXIuc2hvd0JveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLnNob3dCZyh0aGlzLm9wdGlvbnMudGFyZ2V0KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaGlkZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGlhbG9nU3RhdHVzLmhpZGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc3VwZXIuaGlkZUJveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2luZ0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGlhbG9nU3RhdHVzLmhpZGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc3VwZXIuY2xvc2luZ0JveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2VCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlU3RhdHVzKERpYWxvZ1N0YXR1cy5oaWRlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc3RhdHVzID0gdGhpcy5zdGF0dXM7XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zZUJveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0YXR1cyAhPSBEaWFsb2dTdGF0dXMuY2xvc2luZykge1xyXG4gICAgICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nQ29udGVudE9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ0NvbnRlbnRPcHRpb24ge1xyXG4gICAgaGFzWWVzOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIGhhc05vOiBib29sZWFuID0gdHJ1ZTtcclxuICAgIHRpbWU6IG51bWJlciA9IDA7XHJcbiAgICBidXR0b246IHN0cmluZ1tdID0gW107XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5jb250ZW50LCBEaWFsb2dDb250ZW50KTsiLCJjbGFzcyBEaWFsb2dGb3JtIGV4dGVuZHMgRGlhbG9nQm94IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9kYXRhOiB7W25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOihqOWNleaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGRhdGEoKToge1tuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0ge1xyXG4gICAgICAgIGlmICghdGhpcy5fZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZ2V0Rm9ybURhdGEoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZWxlbWVudHM6IHtbbmFtZTogc3RyaW5nXTogSlF1ZXJ5fTtcclxuICAgIC8qKlxyXG4gICAgICog6KGo5Y2V5o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZWxlbWVudHMoKToge1tuYW1lOiBzdHJpbmddOiBKUXVlcnl9IHtcclxuICAgICAgICBpZiAoIXRoaXMuX2VsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzID0gdGhpcy5fZ2V0Rm9ybUVsZW1lbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRDb250ZW50SHRtbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImRpYWxvZy1ib2R5XCI+JysgdGhpcy5fY3JlYXRlRm9ybSh0aGlzLm9wdGlvbnMuY29udGVudCkgKyc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZUZvcm0oZGF0YTogYW55KTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodHlwZW9mIGRhdGEgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBodG1sID0gJyc7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICAkLmVhY2goZGF0YSwgZnVuY3Rpb24obmFtZTogc3RyaW5nLCBpdGVtOiBhbnkpIHtcclxuICAgICAgICAgICAgaHRtbCArPSBpbnN0YW5jZS5fY3JlYXRlSW5wdXQobmFtZSwgaXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGh0bWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlSW5wdXQobmFtZTogc3RyaW5nLCBkYXRhOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBkYXRhID0ge2xhYmVsOiBkYXRhfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkYXRhLnR5cGUpIHtcclxuICAgICAgICAgICAgZGF0YS50eXBlID0gIWRhdGEuaXRlbSA/ICd0ZXh0JyA6ICdzZWxlY3QnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYXR0ciA9ICcnO1xyXG4gICAgICAgIGxldCBodG1sID0gJyc7XHJcbiAgICAgICAgbGV0IGRlZmF1bHRWYWwgPSAnJztcclxuICAgICAgICBpZiAoZGF0YS5kZWZhdWx0KSB7XHJcbiAgICAgICAgICAgIGRlZmF1bHRWYWwgPSBkYXRhLmRlZmF1bHRWYWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLmxhYmVsKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxsYWJlbD4nK2RhdGEubGFiZWwrJzwvbGFiZWw+JzsgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLmlkKSB7XHJcbiAgICAgICAgICAgIGF0dHIgKz0gJyBpZD1cIicrZGF0YS5pZCsnXCInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5jbGFzcykge1xyXG4gICAgICAgICAgICBhdHRyICs9ICcgY2xhc3M9XCInK2RhdGEuY2xhc3MrJ1wiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEucmVxdWlyZWQpIHtcclxuICAgICAgICAgICAgYXR0ciArPSAnIHJlcXVpcmVkPVwicmVxdWlyZWRcIic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLnBsYWNlaG9sZGVyKSB7XHJcbiAgICAgICAgICAgIGF0dHIgKz0gJyBwbGFjZWhvbGRlcj1cIicrZGF0YS5wbGFjZWhvbGRlcisnXCInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKGRhdGEudHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlICd0ZXh0YXJlYSc6XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8dGV4dGFyZWEgbmFtZT1cIicrbmFtZSsnXCIgJythdHRyKyc+JytkZWZhdWx0VmFsKyc8L3RleHRhcmVhPic7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzpcclxuICAgICAgICAgICAgICAgIGxldCBvcHRpb24gPSAnJztcclxuICAgICAgICAgICAgICAgICQuZWFjaChkYXRhLml0ZW0sIGZ1bmN0aW9uKHZhbCwgbGFiZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsID09IGRlZmF1bHRWYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsICs9ICdcIiBzZWxlY3RlZD1cInNlbGVjdGVkJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uICs9ICc8b3B0aW9uIHZhbHVlPVwiJyt2YWwrJ1wiPicrbGFiZWwrJzwvb3B0aW9uPic7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxzZWxlY3QgbmFtZT1cIicrbmFtZSsnXCIgJythdHRyKyc+JytvcHRpb24rJzxzZWxlY3Q+JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdyYWRpbyc6XHJcbiAgICAgICAgICAgIGNhc2UgJ2NoZWNrYm94JzpcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYnK2F0dHIrJz4nXHJcbiAgICAgICAgICAgICAgICAkLmVhY2goZGF0YS5pdGVtLCBmdW5jdGlvbih2YWwsIGxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbCA9PSBkZWZhdWx0VmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCArPSAnXCIgY2hlY2tlZD1cImNoZWNrZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8aW5wdXQgdHlwZT1cIicrZGF0YS50eXBlKydcIiBuYW1lPVwiJytuYW1lKydcIiB2YWx1ZT1cIicrdmFsKydcIj4nICsgbGFiZWw7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXY+JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCInK2RhdGEudHlwZSsnXCIgbmFtZT1cIicrbmFtZSsnXCIgJythdHRyKycgdmFsdWU9XCInK2RlZmF1bHRWYWwrJ1wiPic7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXBcIj4nK2h0bWwrJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5booajljZXmjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0Rm9ybUVsZW1lbnQoKTp7W25hbWU6c3RyaW5nXTogSlF1ZXJ5fSB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRzID0ge307XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICB0aGlzLmJveC5maW5kKCdpbnB1dCxzZWxlY3QsdGV4dGFyZWEsYnV0dG9uJykuZWFjaChmdW5jdGlvbihpLCBlbGUpIHtcclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gaXRlbS5hdHRyKCduYW1lJyk7XHJcbiAgICAgICAgICAgIGlmICghbmFtZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghaXRlbS5pcygnW3R5cGU9cmlkaW9dJykgJiYgIWl0ZW0uaXMoJ1t0eXBlPWNoZWNrYm94XScpICYmIG5hbWUuaW5kZXhPZignW10nKSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnRzW25hbWVdID0gaXRlbTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWVsZW1lbnRzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50c1tuYW1lXSA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudHNbbmFtZV0ucHVzaChlbGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluihqOWNleaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9nZXRGb3JtRGF0YSgpOiB7W25hbWU6IHN0cmluZ106IGFueX0ge1xyXG4gICAgICAgIGxldCBmb3JtRGF0YSA9IHt9O1xyXG4gICAgICAgICQuZWFjaCh0aGlzLmVsZW1lbnRzLCBmdW5jdGlvbihuYW1lOiBzdHJpbmcsIGVsZW1lbnQ6IEpRdWVyeSkge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pcygnW3R5cGU9cmlkaW9dJykpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuZWFjaChmdW5jdGlvbihpLCBlbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9ICQoZWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5hdHRyKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybURhdGFbbmFtZV0gPSBpdGVtLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzKCdbdHlwZT1jaGVja2JveF0nKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuZWFjaChmdW5jdGlvbihpLCBlbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9ICQoZWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5hdHRyKCdjaGVja2VkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goaXRlbS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YVtuYW1lXSA9IGRhdGE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG5hbWUuaW5kZXhPZignW10nKSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGl0ZW0udmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBmb3JtRGF0YVtuYW1lXSA9IGRhdGE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9ybURhdGFbbmFtZV0gPSBlbGVtZW50LnZhbCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmb3JtRGF0YTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUuZm9ybSwgRGlhbG9nRm9ybSk7IiwiY2xhc3MgRGlhbG9nUGFnZSBleHRlbmRzIERpYWxvZ0JveCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldEhlYWRlckh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWhlYWRlclwiPjxpIGNsYXNzPVwiZmEgZmEtYXJyb3ctbGVmdFwiPjwvaT48ZGl2IGNsYXNzPVwiZGlhbG9nLXRpdGxlXCI+JztcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmljbykge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8aSBjbGFzcz1cImZhIGZhLScgKyB0aGlzLm9wdGlvbnMuaWNvICsgJ1wiPjwvaT4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRpdGxlKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5vcHRpb25zLnRpdGxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaHRtbCArICc8L2Rpdj48aSBjbGFzcz1cImZhIGZhLWNsb3NlIGRpYWxvZy1jbG9zZVwiPjwvaT48L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog57uR5a6a5LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2ctaGVhZGVyIC5mYS1hcnJvdy1sZWZ0XCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy15ZXNcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJpZ2dlcignZG9uZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2ctY2xvc2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUucGFnZSwgRGlhbG9nUGFnZSk7IiwiaW50ZXJmYWNlIERpYWxvZ0ltYWdlT3B0aW9uIGV4dGVuZHMgRGlhbG9nT3B0aW9uIHtcclxuICAgIG9ubmV4dD86IChpbmRleDogbnVtYmVyKSA9PiBzdHJpbmcsXHJcbiAgICBvbnByZXZpb3VzPzogKGluZGV4OiBudW1iZXIpID0+IHN0cmluZ1xyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dJbWFnZSBleHRlbmRzIERpYWxvZ0NvbnRlbnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pbmRleDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwcml2YXRlIF9zcmM6IHN0cmluZztcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHNyYygpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zcmM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBzcmMoaW1nOiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIWltZykge1xyXG4gICAgICAgICAgICBpbWcgPSB0aGlzLm9wdGlvbnMuY29udGVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc3JjID0gaW1nO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoJy5kaWFsb2ctYm9keSBpbWcnKS5hdHRyKCdzcmMnLCBpbWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94Lmh0bWwodGhpcy5nZXRDb250ZW50SHRtbCgpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMub3B0aW9ucy50YXJnZXQgfHwgRGlhbG9nLiR3aW5kb3c7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gdGFyZ2V0LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5ib3gud2lkdGgoKTtcclxuICAgICAgICBsZXQgbWF4SGVpZ2h0ID0gdGFyZ2V0LmhlaWdodCgpO1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmJveC5oZWlnaHQoKTtcclxuICAgICAgICB0aGlzLmNzcyh7XHJcbiAgICAgICAgICAgIGxlZnQ6IChtYXhXaWR0aCAtIHdpZHRoKSAvIDIgKyAncHgnLFxyXG4gICAgICAgICAgICB0b3A6IChtYXhIZWlnaHQgLSBoZWlnaHQpIC8gMiArICdweCdcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOe7keWumuS6i+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94LmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy1jbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2ctcHJldmlvdXNcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLW5leHRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLmJveCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKCcuZGlhbG9nLWJvZHkgaW1nJykuYmluZChcImxvYWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5ib3gpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLnJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43orr7lsLrlr7hcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlc2l6ZSgpIHtcclxuICAgICAgICB0aGlzLnNldFByb3BlcnR5KCk7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHJldmlvdXMoKSB7XHJcbiAgICAgICAgdGhpcy5zcmMgPSB0aGlzLnRyaWdnZXIoJ3ByZXZpb3VzJywgLS0gdGhpcy5faW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBuZXh0KCkge1xyXG4gICAgICAgIHRoaXMuc3JjID0gdGhpcy50cmlnZ2VyKCduZXh0JywgKysgdGhpcy5faW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRDb250ZW50SHRtbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmNvbnRlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNvbnRlbnQgPSB0aGlzLnRyaWdnZXIoJ25leHQnLCArKyB0aGlzLl9pbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLWxlZnQgZGlhbG9nLXByZXZpb3VzXCI+PC9pPjxkaXYgY2xhc3M9XCJkaWFsb2ctYm9keVwiPjxpbWcgc3JjPVwiJysgdGhpcy5vcHRpb25zLmNvbnRlbnQgKydcIj48L2Rpdj48aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tcmlnaHQgZGlhbG9nLW5leHRcIj48L2k+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZSBkaWFsb2ctY2xvc2VcIj48L2k+JztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ0ltYWdlT3B0aW9uIGltcGxlbWVudHMgRGlhbG9nSW1hZ2VPcHRpb24ge1xyXG4gICAgb25uZXh0OiAoaW5kZXg6IG51bWJlcikgPT4gc3RyaW5nID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gJChkb2N1bWVudC5ib2R5KS5maW5kKCdpbWcnKS5lcShpbmRleCkuYXR0cignc3JjJyk7XHJcbiAgICB9O1xyXG4gICAgb25wcmV2aW91czogKGluZGV4OiBudW1iZXIpID0+IHN0cmluZyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuICQoZG9jdW1lbnQuYm9keSkuZmluZCgnaW1nJykuZXEoaW5kZXgpLmF0dHIoJ3NyYycpO1xyXG4gICAgfTtcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLmltYWdlLCBEaWFsb2dJbWFnZSk7IiwiaW50ZXJmYWNlIERpYWxvZ0Rpc2tPcHRpb24gZXh0ZW5kcyBEaWFsb2dCb3hPcHRpb24ge1xyXG4gICAgY2F0YWxvZz86IGFueSwgICAgICAgIC8v55uu5b2VXHJcbiAgICBuYW1lPzogc3RyaW5nLFxyXG4gICAgY2hpbGRyZW4/OiBzdHJpbmcsXHJcbiAgICB1cmw/OiBzdHJpbmcsICAgICAgICAgLy91cmzmoIforrBcclxuICAgIG11bHRpcGxlPzogYm9vbGVhbiwgICAgLy/mmK/lkKblhYHorrjlpJrpgIlcclxuICAgIG9ub3BlbkZpbGU/OiAodXJsOiBzdHJpbmcsIGVsZW1lbnQ6IEpRdWVyeSkgPT4gYW55ICAvL+aJk+W8gOaWh+S7tuinpuWPkeaXtumXtFxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dEaXNrIGV4dGVuZHMgRGlhbG9nQm94IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nRGlza09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9wdGlvbnM6IERpYWxvZ0Rpc2tPcHRpb247XHJcblxyXG4gICAgcHVibGljIGNhdGFsb2dCb3g6IEpRdWVyeTtcclxuXHJcbiAgICBwdWJsaWMgZmlsZUJveDogSlF1ZXJ5O1xyXG5cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5jYXRhbG9nQm94ID0gdGhpcy5ib3guZmluZCgnLmRpYWxvZy1ib2R5IC5kaWFsb2ctY2F0YWxvZycpO1xyXG4gICAgICAgIHRoaXMuZmlsZUJveCA9IHRoaXMuYm94LmZpbmQoJy5kaWFsb2ctYm9keSAuZGlhbG9nLWNvbnRlbnQnKTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNhdGFsb2cgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93Q2F0YWxvZyh0aGlzLm9wdGlvbnMuY2F0YWxvZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJC5nZXRKU09OKHRoaXMub3B0aW9ucy5jYXRhbG9nLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb2RlID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5zaG93Q2F0YWxvZyhkYXRhLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuY29udGVudCA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dGaWxlKHRoaXMub3B0aW9ucy5jb250ZW50KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkLmdldEpTT04odGhpcy5vcHRpb25zLmNvbnRlbnQsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvZGUgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnNob3dGaWxlKGRhdGEuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhdGFsb2dCb3gub24oJ2NsaWNrJywgJy50cmVlLWl0ZW0nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGZpbGUgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICBmaWxlLmFkZENsYXNzKCdhY3RpdmUnKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgaW5zdGFuY2Uub3BlbihmaWxlLmF0dHIoJ2RhdGEtdXJsJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZmlsZUJveC5vbignY2xpY2snLCAnLmZvbGRlci1pdGVtJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBmaWxlID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgZmlsZS5hZGRDbGFzcygnYWN0aXZlJykuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLm9wZW4oZmlsZS5hdHRyKCdkYXRhLXVybCcpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmZpbGVCb3gub24oJ2NsaWNrJywgJy5maWxlLWl0ZW0nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGZpbGUgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICBmaWxlLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYgKCFpbnN0YW5jZS5vcHRpb25zLm11bHRpcGxlKSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluc3RhbmNlLnRyaWdnZXIoJ29wZW5GaWxlJywgZmlsZS5hdHRyKCdkYXRhLXVybCcpLCBmaWxlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gc3VwZXIuYmluZEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldENvbnRlbnRIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWJvZHlcIj48ZGl2IGNsYXNzPVwiZGlhbG9nLWNhdGFsb2dcIj48L2Rpdj48ZGl2IGNsYXNzPVwiZGlhbG9nLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ0Rpc2tPcHRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3Blbih1cmw6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghdXJsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cmwgaXMgZW1wdHknKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBDYWNoZVVybC5nZXREYXRhKHVybCwgZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0ZpbGUoZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bpgInkuK3nmoTmlofku7bot6/lvoRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHZhbCgpOiBzdHJpbmd8IEFycmF5PHN0cmluZz4ge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLm11bHRpcGxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGVCb3guZmluZCgnLmZpbGUtaXRlbS5hY3RpdmUnKS5hdHRyKCdkYXRhLXVybCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGF0YSA9IFtdO1xyXG4gICAgICAgIHRoaXMubWFwU2VsZWN0ZWRGaWxlKHVybCA9PiB7XHJcbiAgICAgICAgICAgIGRhdGEucHVzaCh1cmwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5b6q546v6YCJ5Lit55qE5paH5Lu2XHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBtYXBTZWxlY3RlZEZpbGUoY2FsbGJhY2s6ICh1cmw6IHN0cmluZywgZWxlbWVudDogSlF1ZXJ5LCBpbmRleDogbnVtYmVyKSA9PiBhbnkpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmZpbGVCb3guZmluZCgnLmZpbGUtaXRlbS5hY3RpdmUnKS5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICBsZXQgaXRlbSA9ICQoZWxlKTtcclxuICAgICAgICAgICAgbGV0IHVybCA9IGl0ZW0uYXR0cignZGF0YS11cmwnKTtcclxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoaXRlbSwgdXJsLCBpdGVtLCBpKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlvqrnjq/miYDmnIlcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBcclxuICAgICAqIEBwYXJhbSBoYXNGb2xkZXIg5piv5ZCm5YyF5ZCr5paH5Lu25aS5IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbWFwKGNhbGxiYWNrOiAodXJsOiBzdHJpbmcsIGVsZW1lbnQ6IEpRdWVyeSwgaW5kZXg6IG51bWJlcikgPT4gYW55LCBoYXNGb2xkZXI6IGJvb2xlYW4gPSBmYWxzZSk6IHRoaXMge1xyXG4gICAgICAgIGxldCB0YWcgPSAnLmZpbGUtaXRlbSc7XHJcbiAgICAgICAgaWYgKGhhc0ZvbGRlcikge1xyXG4gICAgICAgICAgICB0YWcgPSAnLmZvbGRlci1pdGVtLCcgKyB0YWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZmlsZUJveC5maW5kKHRhZykuZWFjaChmdW5jdGlvbihpLCBlbGUpIHtcclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBpdGVtLmF0dHIoJ2RhdGEtdXJsJyk7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjay5jYWxsKGl0ZW0sIHVybCwgaXRlbSwgaSkgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65paH5Lu2XHJcbiAgICAgKiBAcGFyYW0gZGF0YSBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNob3dGaWxlKGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBodG1sID0gJyc7XHJcbiAgICAgICAgJC5lYWNoKGRhdGEsIChpLCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGl0ZW0udHlwZSA9IERpYWxvZy5wYXJzZUVudW08RGlhbG9nRGlza1R5cGU+KGl0ZW0udHlwZSwgRGlhbG9nRGlza1R5cGUpO1xyXG4gICAgICAgICAgICBpZiAoaXRlbS50eXBlID09IERpYWxvZ0Rpc2tUeXBlLmZpbGUpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0RmlsZUl0ZW0oaXRlbSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRGb2xkZXJJdGVtKGl0ZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZmlsZUJveC5odG1sKGh0bWwpXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0RmlsZUl0ZW0oZGF0YSkge1xyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImZpbGUtaXRlbVwiIGRhdGEtdXJsPVwiJyArIGRhdGFbdGhpcy5vcHRpb25zLnVybF0gKydcIj48aSBjbGFzcz1cImZhIGZhLWZpbGUtb1wiPjwvaT48ZGl2IGNsYXNzPVwiZmlsZS1uYW1lXCI+JytkYXRhW3RoaXMub3B0aW9ucy5uYW1lXSsnPC9kaXY+PC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRGb2xkZXJJdGVtKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJmb2xkZXItaXRlbVwiIGRhdGEtdXJsPVwiJyArIGRhdGFbdGhpcy5vcHRpb25zLnVybF0gKydcIj48aSBjbGFzcz1cImZhIGZhLWZvbGRlci1vXCI+PC9pPjxkaXYgY2xhc3M9XCJmaWxlLW5hbWVcIj4nK2RhdGFbdGhpcy5vcHRpb25zLm5hbWVdKyc8L2Rpdj48L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S655uu5b2VXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNob3dDYXRhbG9nKGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBodG1sID0gJyc7XHJcbiAgICAgICAgJC5lYWNoKGRhdGEsIChpLCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0Q2F0YWxvZ0l0ZW0oaXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGh0bWwgPT0gJycpIHtcclxuICAgICAgICAgICAgdGhpcy5jYXRhbG9nQm94LmhpZGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhdGFsb2dCb3guaHRtbCgnPHVsIGNsYXNzPVwidHJlZVwiPicgKyBodG1sICsnPC91bD4nKVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldENhdGFsb2dJdGVtKGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBodG1sID0gJzxsaSBjbGFzcz1cInRyZWUtaXRlbVwiIGRhdGEtdXJsPVwiJyArIGRhdGFbdGhpcy5vcHRpb25zLnVybF0gKydcIj48ZGl2IGNsYXNzPVwidHJlZS1oZWFkZXJcIj4nICsgZGF0YVt0aGlzLm9wdGlvbnMubmFtZV0gKyAnPC9kaXY+JztcclxuICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eSh0aGlzLm9wdGlvbnMuY2hpbGRyZW4pKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0Q2F0YWxvZ0NoaWxkKGRhdGFbdGhpcy5vcHRpb25zLmNoaWxkcmVuXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBodG1sICsgJzwvbGk+JztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRDYXRhbG9nQ2hpbGQoZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICAkLmVhY2goZGF0YSwgKGksIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRDYXRhbG9nSXRlbShpdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gJzx1bCBjbGFzcz1cInRyZWUtY2hpbGRcIj4nICsgaHRtbCArICc8L3VsPic7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dEaXNrT3B0aW9uIGV4dGVuZHMgRGVmYXVsdERpYWxvZ0JveE9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ0Rpc2tPcHRpb24ge1xyXG4gICAgbmFtZTogc3RyaW5nID0gJ25hbWUnO1xyXG4gICAgdGl0bGU6IHN0cmluZyA9ICfmlofku7bnrqHnkIYnO1xyXG4gICAgY2hpbGRyZW46IHN0cmluZyA9ICdjaGlsZHJlbic7XHJcbiAgICB1cmw6IHN0cmluZyA9ICd1cmwnO1xyXG4gICAgbXVsdGlwbGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIG9uY2xvc2luZzogKCkgPT4gYW55ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUuZGlzaywgRGlhbG9nRGlzayk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
