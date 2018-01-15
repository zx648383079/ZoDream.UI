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
var CacheUrl = /** @class */ (function () {
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
    /**
     * 缓存的数据
     */
    CacheUrl._cacheData = {};
    /**
     * 缓存的事件
     */
    CacheUrl._event = {};
    return CacheUrl;
}());
var Eve = /** @class */ (function () {
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
var Box = /** @class */ (function (_super) {
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
var DialogCore = /** @class */ (function (_super) {
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
                    this.options.closeAnimate ? this.closingBox() : this.closeBox();
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
    DialogCore.prototype.changeStatus = function (status) {
        this._status = status;
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
        this.doShowStatus();
        return true;
    };
    DialogCore.prototype.doShowStatus = function () {
        this.box.show();
        this._status = DialogStatus.show;
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
        this.doHideStatus();
        return true;
    };
    DialogCore.prototype.doHideStatus = function () {
        this.box.hide();
        this._status = DialogStatus.hide;
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
        this.doClosingStatus();
        return true;
    };
    DialogCore.prototype.doClosingStatus = function () {
        this._status = DialogStatus.closing;
        var instance = this;
        this.box.addClass('dialog-closing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            if (instance.status == DialogStatus.closing) {
                // 防止中途改变当前状态
                instance.closeBox();
            }
        });
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
        this.doCloseStatus();
        return true;
    };
    DialogCore.prototype.doCloseStatus = function () {
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
        this.box.css(key, value);
        return this;
    };
    DialogCore.prototype.show = function () {
        this.status = DialogStatus.show;
        return this;
    };
    DialogCore.prototype.hide = function () {
        this.status = DialogStatus.hide;
        return this;
    };
    DialogCore.prototype.close = function (hasAnimation) {
        if (hasAnimation === void 0) { hasAnimation = true; }
        this.status = hasAnimation ? DialogStatus.closing : DialogStatus.closed;
        return this;
    };
    DialogCore.prototype.toggle = function () {
        if (this.status == DialogStatus.hide) {
            return this.show();
        }
        return this.hide();
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
    DialogCore.prototype.top = function (top) {
        if (!top) {
            return this.box.offset().top;
        }
        return this.css('top', top + 'px');
    };
    DialogCore.prototype.left = function (left) {
        if (!left) {
            return this.box.offset().left;
        }
        return this.css('left', left + 'px');
    };
    DialogCore.prototype.width = function (width) {
        if (!width) {
            return this.box.width();
        }
        return this.css('width', width + 'px');
    };
    DialogCore.prototype.addClass = function (name) {
        this.box.addClass(name);
        return this;
    };
    DialogCore.prototype.hasClass = function (name) {
        return this.box.hasClass(name);
    };
    DialogCore.prototype.removeClass = function (name) {
        this.box.removeClass(name);
        return this;
    };
    return DialogCore;
}(Box));
var DefaultDialogOption = /** @class */ (function () {
    function DefaultDialogOption() {
        this.title = '提示';
        this.type = DialogType.tip;
        this.canMove = true;
        this.closeAnimate = true;
        this.ondone = function () {
            this.close();
        };
    }
    return DefaultDialogOption;
}());
var Dialog = /** @class */ (function () {
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
    Dialog.methods = {};
    Dialog._data = {};
    Dialog._guid = 0; // id标记
    Dialog._tipData = [];
    Dialog._bgLock = 0;
    Dialog.$window = $(window);
    return Dialog;
}());
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
var DialogPlugin = /** @class */ (function () {
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
var DialogTip = /** @class */ (function (_super) {
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
var DefaultDialogTipOption = /** @class */ (function () {
    function DefaultDialogTipOption() {
        this.time = 2000;
    }
    return DefaultDialogTipOption;
}());
Dialog.addMethod(DialogType.tip, DialogTip);
var DialogMessage = /** @class */ (function (_super) {
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
var DialogNotify = /** @class */ (function (_super) {
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
var DefaultDialogNotifyOption = /** @class */ (function (_super) {
    __extends(DefaultDialogNotifyOption, _super);
    function DefaultDialogNotifyOption() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.title = '提示';
        return _this;
    }
    return DefaultDialogNotifyOption;
}(DefaultDialogTipOption));
Dialog.addMethod(DialogType.notify, DialogNotify);
var DialogPop = /** @class */ (function (_super) {
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
var DialogLoading = /** @class */ (function (_super) {
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
var DefaultDialogLoadingOption = /** @class */ (function () {
    function DefaultDialogLoadingOption() {
        this.extra = 'loading'; //额外的class
        this.count = 5;
        this.time = 0;
    }
    return DefaultDialogLoadingOption;
}());
Dialog.addMethod(DialogType.loading, DialogLoading);
var DialogContent = /** @class */ (function (_super) {
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
var DefaultDialogContentOption = /** @class */ (function () {
    function DefaultDialogContentOption() {
        this.hasYes = true;
        this.hasNo = true;
        this.time = 0;
        this.button = [];
    }
    return DefaultDialogContentOption;
}());
Dialog.addMethod(DialogType.content, DialogContent);
var DialogBox = /** @class */ (function (_super) {
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
var DefaultDialogBoxOption = /** @class */ (function (_super) {
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
var DialogForm = /** @class */ (function (_super) {
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
var DialogPage = /** @class */ (function (_super) {
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
var DialogImage = /** @class */ (function (_super) {
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
            this._img.attr('style', '').attr('src', img);
        },
        enumerable: true,
        configurable: true
    });
    DialogImage.prototype.createContent = function () {
        this.box.html(this.getContentHtml());
        this._img = this.box.find('.dialog-body img');
        return this;
    };
    DialogImage.prototype.setProperty = function () {
        var target = this.options.target || Dialog.$window;
        var maxWidth = target.width();
        var width = this._img.width();
        var maxHeight = target.height();
        var height = this._img.height();
        if (width <= maxWidth && height <= maxHeight) {
            this.css({
                left: (maxWidth - width) / 2 + 'px',
                top: (maxHeight - height) / 2 + 'px',
                height: height,
                width: width
            });
            return this;
        }
        var wScale = width / maxWidth;
        var hScale = height / maxHeight;
        if (wScale >= hScale) {
            height /= wScale;
            this.css({
                left: 0,
                top: (maxHeight - height) / 2 + 'px',
                height: height,
                width: maxWidth
            });
            this._img.css({
                height: height,
                width: maxWidth
            });
            return this;
        }
        width /= hScale;
        this.css({
            left: (maxWidth - width) / 2 + 'px',
            top: 0,
            height: maxHeight,
            width: width
        });
        this._img.css({
            height: height,
            width: maxWidth
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
var DefaultDialogImageOption = /** @class */ (function () {
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
var DialogDisk = /** @class */ (function (_super) {
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
var DefaultDialogDiskOption = /** @class */ (function (_super) {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhY2hlLnRzIiwiZXZlbnQudHMiLCJib3gudHMiLCJjb3JlLnRzIiwiZGVmYXVsdC50cyIsImRpYWxvZy50cyIsImVudW0udHMiLCJqcXVlcnkuZGlhbG9nLnRzIiwidGlwLnRzIiwibWVzc2FnZS50cyIsIm5vdGlmeS50cyIsInBvcC50cyIsImxvYWRpbmcudHMiLCJjb250ZW50LnRzIiwiZm9ybS50cyIsInBhZ2UudHMiLCJpbWFnZS50cyIsImRpc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztHQUVBO0FBQ0E7SUFBQTtJQTJEQSxDQUFBO0lBaERBLGdCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLFFBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsRUFBQSxVQUFBLElBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxRQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBekRBOztPQUVBO0lBQ0EsbUJBQUEsR0FBQSxFQUFBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGVBQUEsR0FBQSxFQUFBLENBQUE7SUFrREEsZUFBQTtDQTNEQSxBQTJEQSxJQUFBO0FDOURBO0lBQUE7SUFtQkEsQ0FBQTtJQWhCQSxnQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLFFBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHNCQUFBLEdBQUEsVUFBQSxLQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQkFBQSxHQUFBLFVBQUEsS0FBQTtRQUFBLGNBQUE7YUFBQSxVQUFBLEVBQUEscUJBQUEsRUFBQSxJQUFBO1lBQUEsNkJBQUE7O1FBQ0EsSUFBQSxTQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxZQUFBLElBQUEsU0FBQSxJQUFBLEdBQUE7O0lBQ0EsQ0FBQTtJQUNBLFVBQUE7QUFBQSxDQW5CQSxBQW1CQSxJQUFBO0FDbkJBO0lBQUEsdUJBQUE7SUFBQTs7SUFnQ0EsQ0FBQTtJQTFCQSwwQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEseUJBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsU0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBR0E7Ozs7T0FJQTtJQUNBLFdBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQSxPQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsT0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLFVBQUE7QUFBQSxDQWhDQSxBQWdDQSxDQWhDQSxHQUFBLEdBZ0NBO0FDaENBOzs7R0FHQTtBQUNBO0lBQUEsOEJBQUE7SUFDQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtRQUZBLFlBSUEsaUJBQUEsU0FHQTtRQUxBLFFBQUEsR0FBQSxFQUFBLENBQUE7UUFTQSxhQUFBLEdBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQTtRQU5BLEtBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsS0FBQSxDQUFBLGdCQUFBLEVBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7O0lBQ0EsQ0FBQTtJQU1BLHNCQUFBLDhCQUFBO2FBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLENBQUE7YUFFQSxVQUFBLEdBQUE7WUFDQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7WUFDQSxXQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxNQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLEtBQUEsWUFBQSxDQUFBLElBQUE7b0JBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxJQUFBO29CQUNBLElBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0EsS0FBQSxZQUFBLENBQUEsT0FBQTtvQkFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7b0JBQ0EsS0FBQSxDQUFBO2dCQUNBLEtBQUEsWUFBQSxDQUFBLE1BQUE7b0JBQ0EsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsQ0FBQTtnQkFDQTtvQkFDQSxNQUFBLGVBQUEsR0FBQSxHQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTs7O09BeEJBO0lBK0JBLHNCQUFBLHlCQUFBO2FBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTthQUVBLFVBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTs7O09BTEE7SUFTQSxzQkFBQSw4QkFBQTthQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxNQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxNQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7OztPQUxBO0lBT0E7Ozs7T0FJQTtJQUNBLGlDQUFBLEdBQUEsVUFBQSxNQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxNQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxxQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsbUJBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBOztPQUVBO0lBQ0EsNEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDRCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxHQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQTtlQUNBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsb0NBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsOEVBQUEsRUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxRQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSw2QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxrQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsR0FBQSxTQUFBLENBQUE7SUFDQSxDQUFBO0lBSUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLDRCQUFBLEdBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsaUNBQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxHQUFBLFNBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFPQSx3QkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLEtBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxHQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxHQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDBCQUFBLEdBQUEsVUFBQSxZQUFBO1FBQUEsNkJBQUEsRUFBQSxtQkFBQTtRQUNBLElBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLENBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwyQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGlDQUFBLEdBQUE7UUFBQSxpQkFZQTtRQVhBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLFFBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFBQSxpQkFhQTtRQVpBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLFFBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBLEdBQUEsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFHQSwrQkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw0QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw2QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdDQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUEsU0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxPQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLEdBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsUUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsS0FBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsV0FBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxFQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE1BQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFVBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLElBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0E7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFHQSx3QkFBQSxHQUFBLFVBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsMEJBQUEsR0FBQSxVQUFBLEtBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDZCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLDZCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGdDQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGlCQUFBO0FBQUEsQ0EzVkEsQUEyVkEsQ0EzVkEsR0FBQSxHQTJWQTtBQy9WQTtJQUFBO1FBQ0EsVUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFNBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsWUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLGlCQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsV0FBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUFBLDBCQUFBO0FBQUEsQ0FSQSxBQVFBLElBQUE7QUNSQTtJQUFBO0lBdVJBLENBQUE7SUF2UUE7OztPQUdBO0lBQ0EsYUFBQSxHQUFBLFVBQUEsTUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsT0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsSUFBQTtRQUFBLHFCQUFBLEVBQUEsV0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7OztPQUlBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLElBQUE7UUFBQSxxQkFBQSxFQUFBLFdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsVUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBO1FBQUEscUJBQUEsRUFBQSxXQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsSUFBQTtRQUFBLHFCQUFBLEVBQUEsUUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7O09BS0E7SUFDQSxjQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLE1BQUEsRUFBQSxNQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7O09BTUE7SUFDQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQTtnQkFDQSxPQUFBLEVBQUEsT0FBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7Ozs7T0FPQTtJQUNBLFdBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsVUFBQSxDQUFBLElBQUE7WUFDQSxPQUFBLEVBQUEsT0FBQTtZQUNBLEtBQUEsRUFBQSxLQUFBO1lBQ0EsTUFBQSxFQUFBLE1BQUE7WUFDQSxLQUFBLEVBQUEsS0FBQTtZQUNBLE1BQUEsRUFBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7Ozs7T0FNQTtJQUNBLFdBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUE7UUFBQSxzQkFBQSxFQUFBLFlBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2dCQUNBLE1BQUEsRUFBQSxNQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7T0FLQTtJQUNBLGFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQTtRQUFBLHNCQUFBLEVBQUEsWUFBQTtRQUFBLHdCQUFBLEVBQUEsWUFBQTtRQUFBLHFCQUFBLEVBQUEsU0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsS0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLEdBQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7Z0JBQ0EsT0FBQSxFQUFBLE9BQUE7Z0JBQ0EsR0FBQSxFQUFBLElBQUE7YUFDQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGNBQUEsR0FBQSxVQUFBLE9BQUE7UUFDQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxjQUFBLEdBQUEsVUFBQSxFQUFBO1FBQUEsbUJBQUEsRUFBQSxLQUFBLElBQUEsQ0FBQSxLQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxVQUFBLEdBQUEsVUFBQSxFQUFBO1FBQUEsbUJBQUEsRUFBQSxLQUFBLElBQUEsQ0FBQSxLQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsaUJBQUEsR0FBQSxVQUFBLEVBQUE7UUFBQSxtQkFBQSxFQUFBLEtBQUEsSUFBQSxDQUFBLEtBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxPQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxhQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLFVBQUEsR0FBQSxVQUFBLFFBQUE7UUFDQSxHQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGFBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQSxRQUFBO1FBQUEsdUJBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBO1FBQUEseUJBQUEsRUFBQSxlQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUFBLCtCQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsVUFBQTtRQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsbUJBQUEsRUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGNBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0JBQUEsR0FBQSxVQUFBLElBQUEsRUFBQSxNQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0JBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0JBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFwUkEsY0FBQSxHQUFBLEVBQUEsQ0FBQTtJQUVBLFlBQUEsR0FBQSxFQUFBLENBQUE7SUFFQSxZQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQTtJQUVBLGVBQUEsR0FBQSxFQUFBLENBQUE7SUFJQSxjQUFBLEdBQUEsQ0FBQSxDQUFBO0lBRUEsY0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtJQXlRQSxhQUFBO0NBdlJBLEFBdVJBLElBQUE7QUN2UkE7O0dBRUE7QUFDQSxJQUFBLFVBYUE7QUFiQSxXQUFBLFVBQUE7SUFDQSx5Q0FBQSxDQUFBO0lBQ0EsaURBQUEsQ0FBQTtJQUNBLCtDQUFBLENBQUE7SUFDQSx5Q0FBQSxDQUFBO0lBQ0EsaURBQUEsQ0FBQTtJQUNBLCtDQUFBLENBQUE7SUFDQSw2Q0FBQSxDQUFBO0lBQ0EsMkNBQUEsQ0FBQTtJQUNBLDJDQUFBLENBQUE7SUFDQSxpREFBQSxDQUFBO0lBQ0EsMENBQUEsQ0FBQTtJQUNBLDRDQUFBLENBQUE7QUFDQSxDQUFBLEVBYkEsVUFBQSxLQUFBLFVBQUEsUUFhQTtBQUVBOztHQUVBO0FBQ0EsSUFBQSxlQVVBO0FBVkEsV0FBQSxlQUFBO0lBQ0EsbURBQUEsQ0FBQTtJQUNBLHVEQUFBLENBQUE7SUFDQSx5REFBQSxDQUFBO0lBQ0EscURBQUEsQ0FBQTtJQUNBLHlEQUFBLENBQUE7SUFDQSwyREFBQSxDQUFBO0lBQ0EsNkRBQUEsQ0FBQTtJQUNBLG1FQUFBLENBQUE7SUFDQSxpRUFBQSxDQUFBO0FBQ0EsQ0FBQSxFQVZBLGVBQUEsS0FBQSxlQUFBLFFBVUE7QUFFQTs7R0FFQTtBQUNBLElBQUEsWUFLQTtBQUxBLFdBQUEsWUFBQTtJQUNBLCtDQUFBLENBQUE7SUFDQSwrQ0FBQSxDQUFBO0lBQ0EscURBQUEsQ0FBQTtJQUNBLG1EQUFBLENBQUEsQ0FBQSxLQUFBO0FBQ0EsQ0FBQSxFQUxBLFlBQUEsS0FBQSxZQUFBLFFBS0E7QUFFQSxJQUFBLGNBR0E7QUFIQSxXQUFBLGNBQUE7SUFDQSxtREFBQSxDQUFBO0lBQ0EsNkRBQUEsQ0FBQTtBQUNBLENBQUEsRUFIQSxjQUFBLEtBQUEsY0FBQSxRQUdBO0FDOUNBO0lBQ0Esc0JBQ0EsT0FBQSxFQUNBLE1BQUE7UUFEQSxZQUFBLEdBQUEsT0FBQSxDQUFBO1FBQ0EsV0FBQSxHQUFBLE1BQUEsQ0FBQTtRQUVBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFJQSxtQ0FBQSxHQUFBLFVBQUEsT0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGdCQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxPQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxtQkFBQTtBQUFBLENBM0JBLEFBMkJBLElBQUE7QUFFQSxDQUFBO0FBQUEsQ0FBQSxVQUFBLENBQUE7SUFDQSxDQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLE1BQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQSxDQUFBO0FBQ0EsQ0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUM3QkE7SUFBQSw2QkFBQTtJQUNBLG1CQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFNQSx3QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUE7YUFDQSxZQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUE7YUFDQSxPQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsc0JBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsZ0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLElBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDZCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsMkJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsRUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDRCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLFlBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxVQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsUUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLFVBQUEsQ0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLENBQUEsSUFBQSxRQUFBLENBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGdCQUFBO0FBQUEsQ0FsSUEsQUFrSUEsQ0FsSUEsVUFBQSxHQWtJQTtBQUVBO0lBQUE7UUFDQSxTQUFBLEdBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUFBLDZCQUFBO0FBQUEsQ0FGQSxBQUVBLElBQUE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUN4SUE7SUFBQSxpQ0FBQTtJQUNBLHVCQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUNBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0Esb0JBQUE7QUFBQSxDQTNCQSxBQTJCQSxDQTNCQSxTQUFBLEdBMkJBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBO0FDNUJBO0lBQUEsZ0NBQUE7SUFFQSxzQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBTUEsb0NBQUEsR0FBQTtRQUNBLE1BQUEsSUFBQSxLQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGtDQUFBLEdBQUE7UUFDQSxNQUFBLElBQUEsS0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHVDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSx5QkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsOEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw4QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQTtlQUNBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxjQUFBLElBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsR0FBQSxHQUFBLFlBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUE7WUFDQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsVUFBQTtnQkFDQSxFQUFBLENBQUEsQ0FBQSxVQUFBLEtBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtvQkFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxZQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUE7b0JBQ0EsSUFBQSxFQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQTtvQkFDQSxJQUFBLEVBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBO2lCQUNBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsS0FBQTtvQkFDQSxRQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxTQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUJBQUE7QUFBQSxDQXpGQSxBQXlGQSxDQXpGQSxTQUFBLEdBeUZBO0FBRUE7SUFBQSw2Q0FBQTtJQUFBO1FBQUEscUVBRUE7UUFEQSxXQUFBLEdBQUEsSUFBQSxDQUFBOztJQUNBLENBQUE7SUFBQSxnQ0FBQTtBQUFBLENBRkEsQUFFQSxDQUZBLHNCQUFBLEdBRUE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7QUNoR0E7SUFBQSw2QkFBQTtJQUNBLG1CQUNBLE1BQUEsRUFDQSxFQUFBO1FBRkEsWUFJQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLFNBSUE7UUFIQSxFQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLGVBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTs7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxnQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw2QkFBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx1Q0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsbUJBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsR0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLDJOQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBO1lBQ0EsSUFBQSxFQUFBLENBQUEsR0FBQSxJQUFBO1lBQ0EsR0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGtDQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLFFBQUEsRUFBQSxTQUFBO1FBQ0EsSUFBQSxLQUFBLEdBQUEsRUFBQSxDQUFBLENBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxRQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxLQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxRQUFBLEdBQUEsS0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFdBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE1BQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsVUFBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsSUFBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsS0FBQSxHQUFBLEtBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxHQUFBLENBQUE7WUFDQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLEdBQUEsS0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGdCQUFBO0FBQUEsQ0FuRUEsQUFtRUEsQ0FuRUEsU0FBQSxHQW1FQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQ3BFQTtJQUFBLGlDQUFBO0lBQ0EsdUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHdDQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSwwQkFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQTtZQUNBLElBQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQTtZQUNBLEdBQUEsRUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUNBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsR0FBQSxDQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxFQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsZUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsT0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsT0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGtDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLFVBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQ0FBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsUUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQkFBQTtBQUFBLENBN0VBLEFBNkVBLENBN0VBLFNBQUEsR0E2RUE7QUFFQTtJQUFBO1FBQ0EsVUFBQSxHQUFBLFNBQUEsQ0FBQSxDQUFBLFVBQUE7UUFDQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsU0FBQSxHQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSxpQ0FBQTtBQUFBLENBSkEsQUFJQSxJQUFBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBO0FDN0VBO0lBQUEsaUNBQUE7SUFFQSx1QkFDQSxNQUFBLEVBQ0EsRUFBQTtRQUZBLFlBSUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQSxTQVVBO1FBRUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQSxnQkFBQTtRQVhBLEVBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO1lBQ0EsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLFVBQUEsSUFBQTtnQkFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUE7Z0JBQ0EsVUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBOztJQUNBLENBQUE7SUFNQSxzQkFBQSxvQ0FBQTthQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7WUFDQSxZQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7OztPQVRBO0lBV0E7O09BRUE7SUFDQSxzQ0FBQSxHQUFBLFVBQUEsR0FBQTtRQUFBLG9CQUFBLEVBQUEsTUFBQSxJQUFBLENBQUEsTUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsSUFBQSxHQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLGNBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNEJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsYUFBQSxFQUFBO2FBQ0EsWUFBQSxFQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsU0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQSx3Q0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsMEJBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EscUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxvQ0FBQSxHQUFBO1FBQ0EsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLG1DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsaUNBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxzQ0FBQSxHQUFBO1FBQ0EsSUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLDJCQUFBLEdBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQ0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxRQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLFlBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLDZCQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsNkJBQUEsR0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsV0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSwrQkFBQSxHQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxXQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsVUFBQSxDQUFBLEVBQUEsSUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxJQUFBLFdBQUEsR0FBQSxJQUFBLEdBQUEsV0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLElBQUEsaUJBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLFdBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsSUFBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsK0JBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxRQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxVQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLGlCQUFBLE9BQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxPQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsa0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsaUJBQUEsVUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGdDQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxpQkFBQSxRQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9CQUFBO0FBQUEsQ0FuTUEsQUFtTUEsQ0FuTUEsVUFBQSxHQW1NQTtBQUVBO0lBQUE7UUFDQSxXQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsVUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFNBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUFBLGlDQUFBO0FBQUEsQ0FMQSxBQUtBLElBQUE7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQUEsYUFBQSxDQUFBLENBQUE7QVhuTkE7SUFBQSw2QkFBQTtJQUNBLG1CQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGlDQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsSUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxHQUFBLENBQUE7Z0JBQ0EsSUFBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBO2dCQUNBLEdBQUEsRUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQTthQUNBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSw2QkFBQSxHQUFBO1FBQ0EsVUFBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLEtBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBO1lBQ0EsTUFBQSxHQUFBLElBQUEsQ0FBQTtZQUNBLENBQUEsR0FBQSxDQUFBLENBQUEsS0FBQSxHQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxHQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxRQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUVBLGVBQUE7UUFDQSxDQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsTUFBQSxJQUFBLFFBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBO2dCQUNBLEdBQUEsRUFBQSxDQUFBLENBQUEsS0FBQSxHQUFBLENBQUE7Z0JBQ0EsSUFBQSxFQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQTtZQUNBLE1BQUEsR0FBQSxLQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxJQUFBLFFBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsaUJBQUEsU0FBQSxXQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSwwQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsc0JBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBLGlDQUFBLEdBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSx1REFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLGtCQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEdBQUEsUUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLHNEQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0JBQUE7QUFBQSxDQS9GQSxBQStGQSxDQS9GQSxhQUFBLEdBK0ZBO0FBRUE7SUFBQSwwQ0FBQTtJQUFBO1FBQUEscUVBR0E7UUFGQSxXQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsYUFBQSxHQUFBLElBQUEsQ0FBQTs7SUFDQSxDQUFBO0lBQUEsNkJBQUE7QUFBQSxDQUhBLEFBR0EsQ0FIQSwwQkFBQSxHQUdBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FZNUdBO0lBQUEsOEJBQUE7SUFDQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBT0Esc0JBQUEsNEJBQUE7UUFIQTs7V0FFQTthQUNBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7OztPQUFBO0lBTUEsc0JBQUEsZ0NBQUE7UUFIQTs7V0FFQTthQUNBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQTtRQUNBLENBQUE7OztPQUFBO0lBRUEsbUNBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSwyQkFBQSxHQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsZ0NBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLElBQUEsRUFBQSxJQUFBO1lBQ0EsSUFBQSxJQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlDQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsSUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFVBQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLHNCQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsVUFBQTtnQkFDQSxJQUFBLElBQUEsa0JBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxHQUFBLGFBQUEsQ0FBQTtnQkFDQSxLQUFBLENBQUE7WUFDQSxLQUFBLFFBQUE7Z0JBQ0EsSUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQSxLQUFBO29CQUNBLEVBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO3dCQUNBLEdBQUEsSUFBQSxzQkFBQSxDQUFBO29CQUNBLENBQUE7b0JBQ0EsUUFBQSxJQUFBLGlCQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsR0FBQSxLQUFBLEdBQUEsV0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxnQkFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLEdBQUEsR0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBO2dCQUNBLEtBQUEsQ0FBQTtZQUNBLEtBQUEsT0FBQSxDQUFBO1lBQ0EsS0FBQSxVQUFBO2dCQUNBLElBQUEsSUFBQSxNQUFBLEdBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUEsS0FBQTtvQkFDQSxFQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTt3QkFDQSxHQUFBLElBQUEsb0JBQUEsQ0FBQTtvQkFDQSxDQUFBO29CQUNBLElBQUEsSUFBQSxlQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLEdBQUEsSUFBQSxHQUFBLFdBQUEsR0FBQSxHQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLElBQUEsT0FBQSxDQUFBO2dCQUNBLEtBQUEsQ0FBQTtZQUNBO2dCQUNBLElBQUEsSUFBQSxlQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsVUFBQSxHQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7Z0JBQ0EsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSwyQkFBQSxHQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxvQ0FBQSxHQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxpQkFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGlDQUFBLEdBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUEsT0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtvQkFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7b0JBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7d0JBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtvQkFDQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO2dCQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtvQkFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7b0JBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7d0JBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtvQkFDQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7Z0JBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBO29CQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtvQkFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUJBQUE7QUFBQSxDQTVLQSxBQTRLQSxDQTVLQSxTQUFBLEdBNEtBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO0FDOUtBO0lBQUEsOEJBQUE7SUFDQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsa0NBQUEsR0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLHVGQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsa0JBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsc0RBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsK0JBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxpQkFBQTtBQUFBLENBdENBLEFBc0NBLENBdENBLFNBQUEsR0FzQ0E7QUFFQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7QUNuQ0E7SUFBQSwrQkFBQTtJQUVBLHFCQUNBLE1BQUEsRUFDQSxFQUFBO1FBRkEsWUFJQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLFNBQ0E7UUFFQSxZQUFBLEdBQUEsQ0FBQSxDQUFBOztJQUZBLENBQUE7SUFRQSxzQkFBQSw0QkFBQTthQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxHQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLEdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTs7O09BUkE7SUFVQSxtQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxRQUFBLElBQUEsTUFBQSxJQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBO2dCQUNBLElBQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQTtnQkFDQSxHQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7Z0JBQ0EsTUFBQSxFQUFBLE1BQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7YUFDQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLEtBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxNQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsTUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLElBQUEsTUFBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQTtnQkFDQSxJQUFBLEVBQUEsQ0FBQTtnQkFDQSxHQUFBLEVBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7Z0JBQ0EsTUFBQSxFQUFBLE1BQUE7Z0JBQ0EsS0FBQSxFQUFBLFFBQUE7YUFDQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsUUFBQTthQUNBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsS0FBQSxJQUFBLE1BQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUE7WUFDQSxHQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsRUFBQSxTQUFBO1lBQ0EsS0FBQSxFQUFBLEtBQUE7U0FDQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQTtZQUNBLE1BQUEsRUFBQSxNQUFBO1lBQ0EsS0FBQSxFQUFBLFFBQUE7U0FDQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsK0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBRUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUEsRUFBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLEVBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLDRCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDhCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLDBCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG9DQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSx1RkFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLGlHQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0Esa0JBQUE7QUFBQSxDQXJJQSxBQXFJQSxDQXJJQSxhQUFBLEdBcUlBO0FBRUE7SUFBQTtRQUNBLFdBQUEsR0FBQSxVQUFBLEtBQUE7WUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTtRQUNBLGVBQUEsR0FBQSxVQUFBLEtBQUE7WUFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSwrQkFBQTtBQUFBLENBUEEsQUFPQSxJQUFBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBO0FDNUlBO0lBQUEsOEJBQUE7SUFDQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBUUEsOEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsSUFBQTtnQkFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7b0JBQ0EsUUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxJQUFBO2dCQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtvQkFDQSxRQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBO1lBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFlBQUEsRUFBQTtZQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxjQUFBLEVBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsWUFBQSxFQUFBO1lBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsUUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLGlCQUFBLFNBQUEsV0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLG1DQUFBLEdBQUE7UUFDQSxNQUFBLENBQUEscUdBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxxQ0FBQSxHQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsdUJBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUEsVUFBQSxHQUFBO1FBQUEsaUJBUUE7UUFQQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLFFBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxFQUFBLFVBQUEsSUFBQTtZQUNBLEtBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLHdCQUFBLEdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxlQUFBLENBQUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxvQ0FBQSxHQUFBLFVBQUEsUUFBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtZQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7T0FJQTtJQUNBLHdCQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUEsU0FBQTtRQUFBLDBCQUFBLEVBQUEsaUJBQUE7UUFDQSxJQUFBLEdBQUEsR0FBQSxZQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsR0FBQSxHQUFBLGVBQUEsR0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUE7WUFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLDZCQUFBLEdBQUEsVUFBQSxJQUFBO1FBQUEsaUJBV0E7UUFWQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsRUFBQSxJQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsY0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsSUFBQSxLQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLElBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsaUNBQUEsR0FBQSxVQUFBLElBQUE7UUFDQSxNQUFBLENBQUEsbUNBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSx1REFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLGNBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxtQ0FBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLE1BQUEsQ0FBQSxxQ0FBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLHlEQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsY0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGdDQUFBLEdBQUEsVUFBQSxJQUFBO1FBQUEsaUJBVUE7UUFUQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsRUFBQSxJQUFBO1lBQ0EsSUFBQSxJQUFBLEtBQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxtQkFBQSxHQUFBLElBQUEsR0FBQSxPQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQ0FBQSxHQUFBLFVBQUEsSUFBQTtRQUNBLElBQUEsSUFBQSxHQUFBLGtDQUFBLEdBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsNkJBQUEsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLElBQUEsQ0FBQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxPQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUNBQUEsR0FBQSxVQUFBLElBQUE7UUFBQSxpQkFNQTtRQUxBLElBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxFQUFBLElBQUE7WUFDQSxJQUFBLElBQUEsS0FBQSxDQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLHlCQUFBLEdBQUEsSUFBQSxHQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxpQkFBQTtBQUFBLENBcExBLEFBb0xBLENBcExBLFNBQUEsR0FvTEE7QUFFQTtJQUFBLDJDQUFBO0lBQUE7UUFBQSxxRUFVQTtRQVRBLFVBQUEsR0FBQSxNQUFBLENBQUE7UUFDQSxXQUFBLEdBQUEsTUFBQSxDQUFBO1FBQ0EsY0FBQSxHQUFBLFVBQUEsQ0FBQTtRQUNBLFNBQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxjQUFBLEdBQUEsS0FBQSxDQUFBO1FBQ0EsZUFBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTs7SUFDQSxDQUFBO0lBQUEsOEJBQUE7QUFBQSxDQVZBLEFBVUEsQ0FWQSxzQkFBQSxHQVVBO0FBRUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBIiwiZmlsZSI6ImpxdWVyeS5kaWFsb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICog57yT5a2Y5pWw5o2uXHJcbiAqL1xyXG5jbGFzcyBDYWNoZVVybCB7XHJcbiAgICAvKipcclxuICAgICAqIOe8k+WtmOeahOaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfY2FjaGVEYXRhOiB7W3VybDogc3RyaW5nXTogYW55fSA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog57yT5a2Y55qE5LqL5Lu2XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIF9ldmVudDoge1t1cmw6IHN0cmluZ106IEFycmF5PChkYXRhOiBhbnkpID0+IHZvaWQ+fSA9IHt9O1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzRGF0YSh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZURhdGEuaGFzT3duUHJvcGVydHkodXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGhhc0V2ZW50KHVybDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50Lmhhc093blByb3BlcnR5KHVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmlbDmja7pgJrov4flm57osIPov5Tlm55cclxuICAgICAqIEBwYXJhbSB1cmwgXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0RGF0YSh1cmw6IHN0cmluZywgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IHZvaWQpIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNEYXRhKHVybCkpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sodGhpcy5fY2FjaGVEYXRhW3VybF0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmhhc0V2ZW50KHVybCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRbdXJsXS5wdXNoKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9ldmVudFt1cmxdID0gW2NhbGxiYWNrXTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICQuZ2V0SlNPTih1cmwsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuY29kZSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5zZXREYXRhKHVybCwgZGF0YS5kYXRhKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVVJMIEVSUk9SISAnICsgdXJsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruaVsOaNruW5tuWbnuiwg1xyXG4gICAgICogQHBhcmFtIHVybCBcclxuICAgICAqIEBwYXJhbSBkYXRhIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHNldERhdGEodXJsOiBzdHJpbmcsIGRhdGE6IGFueSkge1xyXG4gICAgICAgIHRoaXMuX2NhY2hlRGF0YVt1cmxdID0gZGF0YTtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzRXZlbnQodXJsKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2V2ZW50W3VybF0uZm9yRWFjaChjYWxsYmFjaz0+e1xyXG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRbdXJsXTtcclxuICAgIH1cclxufSIsImFic3RyYWN0IGNsYXNzIEV2ZSB7XHJcbiAgICBwdWJsaWMgb3B0aW9uczogYW55O1xyXG5cclxuICAgIHB1YmxpYyBvbihldmVudDogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiB0aGlzIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnNbJ29uJyArIGV2ZW50XSA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNFdmVudChldmVudDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnb24nICsgZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cmlnZ2VyKGV2ZW50OiBzdHJpbmcsIC4uLiBhcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIGxldCByZWFsRXZlbnQgPSAnb24nICsgZXZlbnQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0V2ZW50KGV2ZW50KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbcmVhbEV2ZW50XS5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG59IiwiaW50ZXJmYWNlIERpYWxvZ0JveE9wdGlvbiBleHRlbmRzIERpYWxvZ0NvbnRlbnRPcHRpb24ge1xyXG4gICAgaWNvPzogc3RyaW5nLCAgICAgICAvLyDmoIfpopjmoI/nmoTlm77moIdcclxuICAgIHRpdGxlPzogc3RyaW5nLCAgICAgLy8g5qCH6aKYXHJcbiAgICBjYW5Nb3ZlPzogYm9vbGVhbiwgICAgICAgIC8v5piv5ZCm5YWB6K6456e75YqoXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ0JveCBleHRlbmRzIERpYWxvZ0NvbnRlbnQge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dCb3hPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5YaF5a65XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94Lmh0bWwodGhpcy5nZXRIZWFkZXJIdG1sKCkgKyB0aGlzLmdldENvbnRlbnRIdG1sKCkrIHRoaXMuZ2V0Rm9vdGVySHRtbCgpKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMub3B0aW9ucy50YXJnZXQgfHwgRGlhbG9nLiR3aW5kb3c7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gdGFyZ2V0LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5ib3gud2lkdGgoKTtcclxuICAgICAgICBsZXQgbWF4SGVpZ2h0ID0gdGFyZ2V0LmhlaWdodCgpO1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmJveC5oZWlnaHQoKTtcclxuICAgICAgICBpZiAobWF4V2lkdGggPiB3aWR0aCAmJiBtYXhIZWlnaHQgPiBoZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5jc3Moe1xyXG4gICAgICAgICAgICAgICAgbGVmdDogKG1heFdpZHRoIC0gd2lkdGgpIC8gMiArICdweCcsXHJcbiAgICAgICAgICAgICAgICB0b3A6IChtYXhIZWlnaHQgLSBoZWlnaHQpIC8gMiArICdweCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9wdGlvbnMudHlwZSA9IERpYWxvZ1R5cGUucGFnZTtcclxuICAgICAgICB0aGlzLmJveC5hZGRDbGFzcyhcImRpYWxvZy1wYWdlXCIpO1xyXG4gICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICAvLyDngrnlh7vmoIfpopjmoI/np7vliqhcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIGxldCBpc01vdmUgPSBmYWxzZTtcclxuICAgICAgICBsZXQgeCwgeTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKFwiLmRpYWxvZy1oZWFkZXIgLmRpYWxvZy10aXRsZVwiKS5tb3VzZWRvd24oZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBpc01vdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB4ID0gZS5wYWdlWCAtIHBhcnNlSW50KGluc3RhbmNlLmJveC5jc3MoJ2xlZnQnKSk7XHJcbiAgICAgICAgICAgIHkgPSBlLnBhZ2VZIC0gcGFyc2VJbnQoaW5zdGFuY2UuYm94LmNzcygndG9wJykpO1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5ib3guZmFkZVRvKDIwLCAuNSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8v6L+Z6YeM5Y+v6IO95a+86Ie0IOeqgeeEtuaYvuekuuWHuuadpVxyXG4gICAgICAgICQoZG9jdW1lbnQpLm1vdXNlbW92ZShmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNNb3ZlIHx8IGluc3RhbmNlLnN0YXR1cyAhPSBEaWFsb2dTdGF0dXMuc2hvdykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmJveC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgdG9wOiBlLnBhZ2VZIC0geSxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGUucGFnZVggLSB4XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkubW91c2V1cChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaXNNb3ZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5ib3ggJiYgaW5zdGFuY2Uuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5zaG93KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5ib3guZmFkZVRvKCdmYXN0JywgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UuYm94KSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5yZXNpemUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzdXBlci5iaW5kRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmHjeiuvuWwuuWvuFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVzaXplKCkge1xyXG4gICAgICAgIHRoaXMuc2V0UHJvcGVydHkoKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ0JveE9wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgcHJvdGVjdGVkIGdldEhlYWRlckh0bWwoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWhlYWRlclwiPjxkaXYgY2xhc3M9XCJkaWFsb2ctdGl0bGVcIj4nO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaWNvKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxpIGNsYXNzPVwiZmEgZmEtJyArIHRoaXMub3B0aW9ucy5pY28gKyAnXCI+PC9pPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudGl0bGUpIHtcclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLm9wdGlvbnMudGl0bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBodG1sICsgJzwvZGl2PjxpIGNsYXNzPVwiZmEgZmEtY2xvc2UgZGlhbG9nLWNsb3NlXCI+PC9pPjwvZGl2Pic7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ0JveE9wdGlvbiBleHRlbmRzIERlZmF1bHREaWFsb2dDb250ZW50T3B0aW9uIGltcGxlbWVudHMgRGlhbG9nQm94T3B0aW9uIHtcclxuICAgIHRpdGxlOiBzdHJpbmcgPSAn5o+Q56S6JztcclxuICAgIGNhbk1vdmU6IGJvb2xlYW4gPSB0cnVlO1xyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUuYm94LCBEaWFsb2dCb3gpOyIsIi8qKlxyXG4gKiDlt7Lnn6Xpl67pophcclxuICog5aaC5p6c5LiA5Liq5LiN6IO95YWz6Zet77yMIOWkmuS4quWwhuWHuueOsOmUmeS5sVxyXG4gKi9cclxuYWJzdHJhY3QgY2xhc3MgRGlhbG9nQ29yZSBleHRlbmRzIEJveCBpbXBsZW1lbnRzIERpYWxvZ0ludGVyZmFlICB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBwdWJsaWMgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdE9wdGlvbigpLCBvcHRpb24pO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy50eXBlID0gIERpYWxvZy5wYXJzZUVudW08RGlhbG9nVHlwZT4odGhpcy5vcHRpb25zLnR5cGUsIERpYWxvZ1R5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcHRpb25zOiBEaWFsb2dPcHRpb247XHJcblxyXG4gICAgcHJpdmF0ZSBfc3RhdHVzOiBEaWFsb2dTdGF0dXMgPSBEaWFsb2dTdGF0dXMuY2xvc2VkO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgc3RhdHVzKCk6IERpYWxvZ1N0YXR1cyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXR1cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHN0YXR1cyhhcmc6IERpYWxvZ1N0YXR1cykge1xyXG4gICAgICAgIGFyZyA9IERpYWxvZy5wYXJzZUVudW08RGlhbG9nU3RhdHVzPihhcmcsIERpYWxvZ1N0YXR1cyk7XHJcbiAgICAgICAgLy8g55u45ZCM54q25oCB5LiN5YGa5pON5L2cXHJcbiAgICAgICAgaWYgKHRoaXMuX3N0YXR1cyA9PSBhcmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKGFyZykge1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ1N0YXR1cy5zaG93OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Qm94KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dTdGF0dXMuaGlkZTpcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZUJveCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nU3RhdHVzLmNsb3Npbmc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuY2xvc2VBbmltYXRlID8gdGhpcy5jbG9zaW5nQm94KCkgOiB0aGlzLmNsb3NlQm94KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dTdGF0dXMuY2xvc2VkOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZUJveCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBcInN0YXR1cyBlcnJvcjpcIisgYXJnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgcHJpdmF0ZSBfZGlhbG9nQmc6IEpRdWVyeTsgIC8vIOiHquW3seeahOiDjOaZr+mBrue9qVxyXG5cclxuICAgIHByaXZhdGUgX3k6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3kpIHtcclxuICAgICAgICAgICAgdGhpcy5feSA9IHRoaXMuYm94Lm9mZnNldCgpLnRvcCAtICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3k7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCB5KHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX3kgPSB5O1xyXG4gICAgICAgIHRoaXMuY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2hlaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLl9oZWlnaHQgPSB0aGlzLmJveC5oZWlnaHQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGhlaWdodChoZWlnaHQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX2hlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLmJveC5oZWlnaHQoaGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaUueWPmOeKtuaAgVxyXG4gICAgICogQHBhcmFtIHN0YXR1cyBcclxuICAgICAqIEBwYXJhbSBoYXNFdmVudCBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNoYW5nZVN0YXR1cyhzdGF0dXM6IERpYWxvZ1N0YXR1cykge1xyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlum7mOiupOiuvue9rlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpOiBEaWFsb2dPcHRpb24ge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ09wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuW5tuaYvuekuuaOp+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgc2hvd0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZmFsc2UgPT0gdGhpcy50cmlnZ2VyKCdzaG93JykpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3Nob3cgc3RvcCEnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRvU2hvd1N0YXR1cygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBkb1Nob3dTdGF0dXMoKSB7XHJcbiAgICAgICAgdGhpcy5ib3guc2hvdygpO1xyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IERpYWxvZ1N0YXR1cy5zaG93O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65bm26ZqQ6JeP5o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBoaWRlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLnRyaWdnZXIoJ2hpZGUnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaGlkZSBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZG9IaWRlU3RhdHVzKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGRvSGlkZVN0YXR1cygpIHtcclxuICAgICAgICB0aGlzLmJveC5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLmhpZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliqjnlLvlhbPpl63vvIzmnInlhbPpl63liqjnlLtcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNsb3NpbmdCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJveCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2luZyBcclxuICAgICAgICB8fCB0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2VkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZhbHNlID09IHRoaXMudHJpZ2dlcignY2xvc2luZycpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbG9zaW5nIHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kb0Nsb3NpbmdTdGF0dXMoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZG9DbG9zaW5nU3RhdHVzKCkge1xyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IERpYWxvZ1N0YXR1cy5jbG9zaW5nO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ib3guYWRkQ2xhc3MoJ2RpYWxvZy1jbG9zaW5nJykub25lKCd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2luZykge1xyXG4gICAgICAgICAgICAgICAgLy8g6Ziy5q2i5Lit6YCU5pS55Y+Y5b2T5YmN54q25oCBXHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5jbG9zZUJveCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKDpmaTmjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNsb3NlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy50cmlnZ2VyKCdjbG9zZWQnKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2VkIHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kb0Nsb3NlU3RhdHVzKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGRvQ2xvc2VTdGF0dXMoKSB7XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLmNsb3NlZDtcclxuICAgICAgICBpZiAodGhpcy5fZGlhbG9nQmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGlhbG9nQmcucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cucmVtb3ZlSXRlbSh0aGlzLmlkKTsgXHJcbiAgICAgICAgdGhpcy5ib3gucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5ib3ggPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IGluaXQoKTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29yZSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveCA9ICQoJzxkaXYgY2xhc3M9XCJkaWFsb2cgZGlhbG9nLScrIERpYWxvZ1R5cGVbdGhpcy5vcHRpb25zLnR5cGVdICsnXCIgZGF0YS10eXBlPVwiZGlhbG9nXCIgZGlhbG9nLWlkPScrIHRoaXMuaWQgKyc+PC9kaXY+Jyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZUNvbnRlbnQoKTogdGhpcztcclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc2V0UHJvcGVydHkoKTogdGhpcztcclxuXHJcblxyXG4gICAgcHVibGljIGNzcyhrZXk6IGFueSwgdmFsdWU/OiBzdHJpbmd8IG51bWJlcik6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94LmNzcyhrZXksIHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvdygpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IERpYWxvZ1N0YXR1cy5zaG93O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWRlKCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gRGlhbG9nU3RhdHVzLmhpZGU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsb3NlKGhhc0FuaW1hdGlvbjogYm9vbGVhbiA9IHRydWUpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IGhhc0FuaW1hdGlvbiA/IERpYWxvZ1N0YXR1cy5jbG9zaW5nIDogRGlhbG9nU3RhdHVzLmNsb3NlZDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9nZ2xlKCk6IHRoaXMge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuaGlkZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluebuOWQjOexu+Wei+W8ueWHuuahhueahOacgOS4iumdolxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGlhbG9nVG9wKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgbGV0IHk7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBEaWFsb2cubWFwKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5vcHRpb25zLnR5cGUgIT0gdGhpcy5vcHRpb25zLnR5cGUgfHwgaXRlbS5pZCA9PSBpbnN0YW5jZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgheSB8fCBpdGVtLnkgPCB5KSB7XHJcbiAgICAgICAgICAgICAgICB5ID0gaXRlbS55O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGlhbG9nQm90dG9tKCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgbGV0IHk7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBEaWFsb2cubWFwKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5vcHRpb25zLnR5cGUgIT0gdGhpcy5vcHRpb25zLnR5cGUgfHwgaXRlbS5pZCA9PSBpbnN0YW5jZS5pZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBib3R0b20gPSBpdGVtLnkgKyBpdGVtLmhlaWdodDtcclxuICAgICAgICAgICAgaWYgKCF5IHx8IGJvdHRvbSA+IHkpIHtcclxuICAgICAgICAgICAgICAgIHkgPSBib3R0b207XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIHByaXZhdGUgX2dldEJvdHRvbSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgkKHdpbmRvdykuaGVpZ2h0KCkgKiAuMzMgLSB0aGlzLmhlaWdodCAvIDIsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFRvcCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgkKHdpbmRvdykuaGVpZ2h0KCkgLyAyIC0gdGhpcy5oZWlnaHQgLyAyLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRMZWZ0KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KCQod2luZG93KS53aWR0aCgpIC8gMiAtIHRoaXMuYm94LndpZHRoKCkgLyAyLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRSaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgkKHdpbmRvdykud2lkdGgoKSAvIDIgLSB0aGlzLmJveC53aWR0aCgpIC8gMiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0V2lkdGgoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgd2lkdGggPSBEaWFsb2cuJHdpbmRvdy53aWR0aCgpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMud2lkdGggPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB3aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHdpZHRoICogdGhpcy5vcHRpb25zLndpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldEhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSBEaWFsb2cuJHdpbmRvdy5oZWlnaHQoKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmhlaWdodCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhlaWdodCAqIHRoaXMub3B0aW9ucy5oZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0TGVmdFRvcChkaXJlY3Rpb246IERpYWxvZ0RpcmVjdGlvbiwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGJveFdpZHRoOiBudW1iZXIsIGJveEhlaWdodDogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ubGVmdFRvcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbMCwgMF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnRvcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbKGJveEhlaWdodCAtIHdpZHRoKSAvIDIsIDBdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodFRvcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbYm94SGVpZ2h0IC0gd2lkdGgsIDBdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbYm94SGVpZ2h0IC0gd2lkdGgsIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0Qm90dG9tOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtib3hIZWlnaHQgLSB3aWR0aCwgYm94SGVpZ2h0IC0gaGVpZ2h0XTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24uYm90dG9tOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsoYm94SGVpZ2h0IC0gd2lkdGgpIC8gMiwgYm94SGVpZ2h0IC0gaGVpZ2h0XTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ubGVmdEJvdHRvbTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbMCwgYm94SGVpZ2h0IC0gaGVpZ2h0XTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ubGVmdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbMCwgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24uY2VudGVyOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFsoYm94SGVpZ2h0IC0gd2lkdGgpIC8gMiwgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgcHVibGljIHRvcCh0b3A/OiBudW1iZXIpOiBudW1iZXIgfCB0aGlzIHtcclxuICAgICAgICBpZiAoIXRvcCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ib3gub2Zmc2V0KCkudG9wO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5jc3MoJ3RvcCcsIHRvcCArICdweCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBsZWZ0KGxlZnQ/OiBudW1iZXIpOiBudW1iZXIgfCB0aGlzIHtcclxuICAgICAgICBpZiAoIWxlZnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYm94Lm9mZnNldCgpLmxlZnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmNzcygnbGVmdCcsIGxlZnQgKyAncHgnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgd2lkdGgod2lkdGg/OiBudW1iZXIpOiBudW1iZXIgfCB0aGlzIHtcclxuICAgICAgICBpZiAoIXdpZHRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJveC53aWR0aCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5jc3MoJ3dpZHRoJywgd2lkdGggKyAncHgnKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRDbGFzcyhuYW1lOiBzdHJpbmcpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5hZGRDbGFzcyhuYW1lKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGhhc0NsYXNzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJveC5oYXNDbGFzcyhuYW1lKTtcclxuICAgIH1cclxuICAgIHJlbW92ZUNsYXNzKG5hbWU6IHN0cmluZyk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94LnJlbW92ZUNsYXNzKG5hbWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgRGVmYXVsdERpYWxvZ09wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ09wdGlvbiB7XHJcbiAgICB0aXRsZTogc3RyaW5nID0gJ+aPkOekuic7XHJcbiAgICB0eXBlPzogRGlhbG9nVHlwZSA9IERpYWxvZ1R5cGUudGlwO1xyXG4gICAgY2FuTW92ZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBjbG9zZUFuaW1hdGU6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgb25kb25lOiBGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgIH1cclxufSIsImNsYXNzIERpYWxvZyB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBtZXRob2RzOiB7W3R5cGU6IG51bWJlcl06IEZ1bmN0aW9ufSA9IHt9O1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9kYXRhOiB7W2lkOiBudW1iZXJdOiBEaWFsb2dDb3JlfSA9IHt9O1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9ndWlkOiBudW1iZXIgPSAwOyAvLyBpZOagh+iusFxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF90aXBEYXRhOiBBcnJheTxudW1iZXI+ID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2RpYWxvZ0JnOiBKUXVlcnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2JnTG9jazogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljICR3aW5kb3cgPSAkKHdpbmRvdyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvpgKDlvLnlh7rmoYZcclxuICAgICAqIEBwYXJhbSBvcHRpb24gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlPFQ+KG9wdGlvbj86IERpYWxvZ09wdGlvbik6IFQge1xyXG4gICAgICAgIGlmICghb3B0aW9uLnR5cGUpIHtcclxuICAgICAgICAgICAgb3B0aW9uLnR5cGUgPSBEaWFsb2dUeXBlLnRpcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgb3B0aW9uLnR5cGUgPSB0aGlzLnBhcnNlRW51bTxEaWFsb2dUeXBlPihvcHRpb24udHlwZSwgRGlhbG9nVHlwZSk7XHJcbiAgICAgICAgbGV0IG1ldGhvZDogYW55ID0gdGhpcy5nZXRNZXRob2Qob3B0aW9uLnR5cGUpO1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gbmV3IG1ldGhvZChvcHRpb24pO1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2VFbnVtPFQ+KHZhbDogYW55LCB0eXBlOiBhbnkpOiBUIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZVt2YWxdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5o+Q56S6XHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSB0aW1lIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHRpcChjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dUaXBPcHRpb24sIHRpbWU6IG51bWJlciA9IDIwMDApOiBEaWFsb2dUaXAge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge2NvbnRlbnQ6IGNvbnRlbnQsIHRpbWU6IHRpbWV9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLnRpcDtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGU8RGlhbG9nVGlwPihjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmtojmga9cclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpbWUgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbWVzc2FnZShjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dNZXNzYWdlT3B0aW9uLCB0aW1lOiBudW1iZXIgPSAyMDAwKTogRGlhbG9nTWVzc2FnZSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7Y29udGVudDogY29udGVudCwgdGltZTogdGltZX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUubWVzc2FnZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGU8RGlhbG9nTWVzc2FnZT4oY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcG9wKGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ1BvcE9wdGlvbiwgdGFyZ2V0OiBKUXVlcnksIHRpbWU6IG51bWJlciA9IDIwMDApOiBEaWFsb2dQb3Age1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge2NvbnRlbnQ6IGNvbnRlbnQsIHRpbWU6IHRpbWUsIHRhcmdldDogdGFyZ2V0fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS5wb3A7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlPERpYWxvZ1BvcD4oY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yqg6L29XHJcbiAgICAgKiBAcGFyYW0gdGltZSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBsb2FkaW5nKHRpbWU6IG51bWJlciB8IERpYWxvZ09wdGlvbiA9IDApOiBEaWFsb2dMb2FkaW5nIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRpbWUgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgdGltZSA9IHt0aW1lOiB0aW1lfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGltZS50eXBlID0gRGlhbG9nVHlwZS5sb2FkaW5nO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZTxEaWFsb2dMb2FkaW5nPih0aW1lKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlhoXlrrnlvLnnqpdcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBjb250ZW50KGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ09wdGlvbiwgaGFzWWVzPzogYm9vbGVhbiwgaGFzTm8/OiBib29sZWFuKTogRGlhbG9nQ29udGVudCB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgaGFzWWVzOiBoYXNZZXMsXHJcbiAgICAgICAgICAgICAgICBoYXNObzogaGFzTm9cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS5jb250ZW50O1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZTxEaWFsb2dDb250ZW50Pihjb250ZW50KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmma7pgJrlvLnnqpdcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBib3goY29udGVudDogc3RyaW5nIHwgRGlhbG9nT3B0aW9uLCB0aXRsZTogc3RyaW5nID0gJ+aPkOekuicsIGhhc1llcz86IGJvb2xlYW4sIGhhc05vPzogYm9vbGVhbik6IERpYWxvZ0JveCB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICAgICAgaGFzWWVzOiBoYXNZZXMsXHJcbiAgICAgICAgICAgICAgICBoYXNObzogaGFzTm9cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS5ib3g7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlPERpYWxvZ0JveD4oY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6KGo5qC85by556qXXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSB0aXRsZSBcclxuICAgICAqIEBwYXJhbSBkb25lIFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBmb3JtKGNvbnRlbnQ6IGFueSwgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonLCBkb25lPzogRnVuY3Rpb24sIGhhc1llcz86IGJvb2xlYW4sIGhhc05vPzogYm9vbGVhbik6IERpYWxvZ0Zvcm0ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZTxEaWFsb2dGb3JtPih7XHJcbiAgICAgICAgICAgIHR5cGU6IERpYWxvZ1R5cGUuZm9ybSxcclxuICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgaGFzTm86IGhhc05vLFxyXG4gICAgICAgICAgICBvbmRvbmU6IGRvbmVcclxuICAgICAgICB9KS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpobXpnaLlvLnnqpdcclxuICAgICAqIEBwYXJhbSBjb250ZW50IFxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBwYWdlKGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ09wdGlvbiwgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pOiBEaWFsb2dQYWdlIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgICAgIGhhc05vOiBoYXNOb1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLnBhZ2U7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlPERpYWxvZ1BhZ2U+KGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOahjOmdouaPkOmGklxyXG4gICAgICogQHBhcmFtIHRpdGxlIFxyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gaWNvbiBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBub3RpZnkodGl0bGU6IHN0cmluZyAgfCBEaWFsb2dPcHRpb24gPSAn6YCa55+lJywgY29udGVudDogc3RyaW5nID0gJycsIGljb246IHN0cmluZyA9ICcnKTogRGlhbG9nTm90aWZ5IHtcclxuICAgICAgICBpZiAodHlwZW9mIHRpdGxlICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRpdGxlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgIGljbzogaWNvblxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aXRsZS50eXBlID0gRGlhbG9nVHlwZS5ub3RpZnk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlPERpYWxvZ05vdGlmeT4odGl0bGUpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOW8ueWHuuahhlxyXG4gICAgICogQHBhcmFtIGVsZW1lbnQgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYWRkSXRlbShlbGVtZW50OiBEaWFsb2dDb3JlKSB7XHJcbiAgICAgICAgdGhpcy5fZGF0YVsrK3RoaXMuX2d1aWRdID0gZWxlbWVudDtcclxuICAgICAgICBlbGVtZW50LmlkID0gdGhpcy5fZ3VpZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGhhc0l0ZW0oaWQ6IG51bWJlciB8IHN0cmluZyA9IHRoaXMuX2d1aWQpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YS5oYXNPd25Qcm9wZXJ0eShpZCArICcnKVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0KGlkOiBudW1iZXIgfCBzdHJpbmcgPSB0aGlzLl9ndWlkKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzSXRlbShpZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFbaWRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBcImVycm9yOlwiICsgaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja5pZOWIoOmZpOW8ueWHuuahhlxyXG4gICAgICogQHBhcmFtIGlkIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUl0ZW0oaWQ6IG51bWJlciA9IHRoaXMuX2d1aWQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzSXRlbShpZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kYXRhW2lkXS5jbG9zZSgpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9kYXRhW2lkXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIoOmZpOaJgOacieW8ueWHuuahhlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlbW92ZSgpIHtcclxuICAgICAgICB0aGlzLm1hcChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uY2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOW+queOr+aJgOacieW8ueWHuuahhlxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG1hcChjYWxsYmFjazogKGl0ZW06IERpYWxvZ0NvcmUpID0+IGFueSkge1xyXG4gICAgICAgIGZvcihsZXQgaWQgaW4gdGhpcy5fZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzSXRlbShpZCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBjYWxsYmFjayh0aGlzLl9kYXRhW2lkXSk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuumBrue9qVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHNob3dCZyh0YXJnZXQ6IEpRdWVyeSA9ICQoZG9jdW1lbnQuYm9keSksIGlzUHVibGljOiBib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9kaWFsb2dCZykge1xyXG4gICAgICAgICAgICB0aGlzLl9kaWFsb2dCZyA9ICQoJzxkaXYgY2xhc3M9XCJkaWFsb2ctYmdcIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgdGhpcy5fZGlhbG9nQmcuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5pu05pS56YGu572p55qE5L2N572uXHJcbiAgICAgICAgdGFyZ2V0LmFwcGVuZCh0aGlzLl9kaWFsb2dCZyk7XHJcbiAgICAgICAgdGhpcy5fZGlhbG9nQmcudG9nZ2xlQ2xhc3MoJ2RpYWxvZy1iZy1wcml2YXRlJywgIWlzUHVibGljKTtcclxuICAgICAgICB0aGlzLl9iZ0xvY2sgKys7XHJcbiAgICAgICAgdGhpcy5fZGlhbG9nQmcuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6ZqQ6JeP6YGu572pXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2xvc2VCZygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2RpYWxvZ0JnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYmdMb2NrLS07XHJcbiAgICAgICAgaWYgKHRoaXMuX2JnTG9jayA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kaWFsb2dCZy5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBhZGRNZXRob2QodHlwZTogRGlhbG9nVHlwZSwgZGlhbG9nOiBGdW5jdGlvbikge1xyXG4gICAgICAgIHRoaXMubWV0aG9kc1t0eXBlXSA9IGRpYWxvZztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGhhc01ldGhvZCh0eXBlOiBEaWFsb2dUeXBlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWV0aG9kcy5oYXNPd25Qcm9wZXJ0eSh0eXBlLnRvU3RyaW5nKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0TWV0aG9kKHR5cGU6IERpYWxvZ1R5cGUpOiBGdW5jdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWV0aG9kc1t0eXBlXTtcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiDlvLnlh7rmoYbnsbvlnotcclxuICovXHJcbmVudW0gRGlhbG9nVHlwZSB7XHJcbiAgICB0aXAsXHJcbiAgICBtZXNzYWdlLFxyXG4gICAgbm90aWZ5LFxyXG4gICAgcG9wLFxyXG4gICAgbG9hZGluZyxcclxuICAgIHNlbGVjdCxcclxuICAgIGltYWdlLFxyXG4gICAgZGlzayxcclxuICAgIGZvcm0sXHJcbiAgICBjb250ZW50LFxyXG4gICAgYm94LFxyXG4gICAgcGFnZVxyXG59XHJcblxyXG4vKipcclxuICog5by55Ye65qGG5L2N572uXHJcbiAqL1xyXG5lbnVtIERpYWxvZ0RpcmVjdGlvbiB7XHJcbiAgICB0b3AsXHJcbiAgICByaWdodCxcclxuICAgIGJvdHRvbSxcclxuICAgIGxlZnQsXHJcbiAgICBjZW50ZXIsXHJcbiAgICBsZWZ0VG9wLFxyXG4gICAgcmlnaHRUb3AsXHJcbiAgICByaWdodEJvdHRvbSxcclxuICAgIGxlZnRCb3R0b21cclxufVxyXG5cclxuLyoqXHJcbiAqIOW8ueWHuuahhueKtuaAgVxyXG4gKi9cclxuZW51bSBEaWFsb2dTdGF0dXMge1xyXG4gICAgaGlkZSxcclxuICAgIHNob3csXHJcbiAgICBjbG9zaW5nLCAgIC8v5YWz6Zet5LitXHJcbiAgICBjbG9zZWQgICAgLy/lt7LlhbPpl61cclxufVxyXG5cclxuZW51bSBEaWFsb2dEaXNrVHlwZSB7XHJcbiAgICBmaWxlLFxyXG4gICAgZGlyZWN0b3J5XHJcbn0iLCJjbGFzcyBEaWFsb2dQbHVnaW4ge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIGVsZW1lbnQ6IEpRdWVyeSxcclxuICAgICAgICBwdWJsaWMgb3B0aW9uPzogRGlhbG9nT3B0aW9uXHJcbiAgICApIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCFpbnN0YW5jZS5kaWFsb2cpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLmRpYWxvZyA9IERpYWxvZy5jcmVhdGUoaW5zdGFuY2UuX3BhcnNlT3B0aW9uKCQodGhpcykpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbnN0YW5jZS5kaWFsb2cuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkaWFsb2c6IERpYWxvZ0NvcmU7XHJcblxyXG4gICAgcHJpdmF0ZSBfcGFyc2VPcHRpb24oZWxlbWVudDogSlF1ZXJ5KSB7XHJcbiAgICAgICAgbGV0IG9wdGlvbjogRGlhbG9nT3B0aW9uID0gJC5leHRlbmQoe30sIHRoaXMub3B0aW9uKTtcclxuICAgICAgICBvcHRpb24udHlwZSA9IERpYWxvZy5wYXJzZUVudW08RGlhbG9nVHlwZT4oZWxlbWVudC5hdHRyKCdkaWFsb2ctdHlwZScpIHx8IHRoaXMub3B0aW9uLnR5cGUsIERpYWxvZ1R5cGUpO1xyXG4gICAgICAgIG9wdGlvbi5jb250ZW50ID0gZWxlbWVudC5hdHRyKCdkaWFsb2ctY29udGVudCcpIHx8IHRoaXMub3B0aW9uLmNvbnRlbnQ7XHJcbiAgICAgICAgb3B0aW9uLnVybCA9IGVsZW1lbnQuYXR0cignZGlhbG9nLXVybCcpIHx8IHRoaXMub3B0aW9uLnVybDtcclxuICAgICAgICBvcHRpb24udGltZSA9IHBhcnNlSW50KGVsZW1lbnQuYXR0cignZGlhbG9nLXRpbWUnKSkgfHwgdGhpcy5vcHRpb24udGltZTtcclxuICAgICAgICBpZiAob3B0aW9uLnR5cGUgPT0gRGlhbG9nVHlwZS5wb3AgJiYgIW9wdGlvbi50YXJnZXQpIHtcclxuICAgICAgICAgICAgb3B0aW9uLnRhcmdldCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvcHRpb247XHJcbiAgICB9XHJcbn1cclxuXHJcbjsoZnVuY3Rpb24oJDogYW55KSB7XHJcbiAgICAkLmZuLmRpYWxvZyA9IGZ1bmN0aW9uKG9wdGlvbiA/OiBEaWFsb2dPcHRpb24pIHtcclxuICAgICAgICByZXR1cm4gbmV3IERpYWxvZ1BsdWdpbih0aGlzLCBvcHRpb24pO1xyXG4gICAgfTtcclxufSkoalF1ZXJ5KTsiLCJpbnRlcmZhY2UgRGlhbG9nVGlwT3B0aW9uIGV4dGVuZHMgRGlhbG9nT3B0aW9uIHtcclxuICAgIHRpbWU/OiBudW1iZXIsICAgICAgICAgLy/mmL7npLrml7bpl7RcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nVGlwIGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9wdGlvbnM6IERpYWxvZ1RpcE9wdGlvbjtcclxuXHJcbiAgICBwcml2YXRlIF90aW1lSGFuZGxlOiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIGluaXQoKSB7XHJcbiAgICAgICAgRGlhbG9nLmFkZEl0ZW0odGhpcyk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVDb3JlKCkuY3JlYXRlQ29udGVudCgpXHJcbiAgICAgICAgLmFwcGVuZFBhcmVudCgpLnNldFByb3BlcnR5KCkuYmluZEV2ZW50KClcclxuICAgICAgICAuYWRkVGltZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ1RpcE9wdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5YaF5a65XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94LnRleHQodGhpcy5vcHRpb25zLmNvbnRlbnQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5Yiw5a655Zmo5LiKXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBhcHBlbmRQYXJlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJveCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQuYm9keSkuYXBwZW5kKHRoaXMuYm94KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub3B0aW9ucy50YXJnZXQuYXBwZW5kKHRoaXMuYm94KTtcclxuICAgICAgICB0aGlzLmJveC5hZGRDbGFzcyhcImRpYWxvZy1wcml2YXRlXCIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5bGe5oCnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICBsZXQgbWF4V2lkdGggPSBEaWFsb2cuJHdpbmRvdy53aWR0aCgpO1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuYm94LndpZHRoKCk7XHJcbiAgICAgICAgdGhpcy55ID0gKHRoaXMuZ2V0RGlhbG9nVG9wKCkgfHwgKERpYWxvZy4kd2luZG93LmhlaWdodCgpICogMC42OCArIDMwKSkgLSAzMCAtIHRoaXMuaGVpZ2h0OyBcclxuICAgICAgICB0aGlzLmNzcygnbGVmdCcsIChtYXhXaWR0aCAtIHdpZHRoKSAvIDIgKyAncHgnKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOe7keWumuS6i+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94LmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5ib3gpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLnJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43orr7lsLrlr7hcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlc2l6ZSgpIHtcclxuICAgICAgICBsZXQgbWF4V2lkdGggPSBEaWFsb2cuJHdpbmRvdy53aWR0aCgpO1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuYm94LndpZHRoKCk7XHJcbiAgICAgICAgdGhpcy5jc3MoJ2xlZnQnLCAobWF4V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4Jyk7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYWRkVGltZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRpbWUgPD0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5fdGltZUhhbmRsZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLl90aW1lSGFuZGxlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgICAgIH0sIHRoaXMub3B0aW9ucy50aW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc3RvcFRpbWUoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl90aW1lSGFuZGxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVIYW5kbGUpO1xyXG4gICAgICAgIHRoaXMuX3RpbWVIYW5kbGUgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NpbmdCb3goKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zaW5nQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnN0b3BUaW1lKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghc3VwZXIuY2xvc2VCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2hhbmdlT3RoZXIoKTtcclxuICAgICAgICB0aGlzLnN0b3BUaW1lKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNoYW5nZU90aGVyKCkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgRGlhbG9nLm1hcChpdGVtID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0ub3B0aW9ucy50eXBlICE9IERpYWxvZ1R5cGUudGlwIHx8IGl0ZW0ueSA+PSBpbnN0YW5jZS55KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaXRlbS55ICs9IGluc3RhbmNlLmhlaWdodCArIDMwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBEZWZhdWx0RGlhbG9nVGlwT3B0aW9uIGltcGxlbWVudHMgRGlhbG9nVGlwT3B0aW9uIHtcclxuICAgIHRpbWU6IG51bWJlciA9IDIwMDA7XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS50aXAsIERpYWxvZ1RpcCk7IiwiaW50ZXJmYWNlIERpYWxvZ01lc3NhZ2VPcHRpb24gZXh0ZW5kcyBEaWFsb2dUaXBPcHRpb24ge1xyXG5cclxufVxyXG5cclxuY2xhc3MgRGlhbG9nTWVzc2FnZSBleHRlbmRzIERpYWxvZ1RpcCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMueSA9ICh0aGlzLmdldERpYWxvZ0JvdHRvbSgpIHx8IChEaWFsb2cuJHdpbmRvdy5oZWlnaHQoKSAqIDAuMSAtIDMwKSkgKyAzMDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjaGFuZ2VPdGhlcigpIHtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIERpYWxvZy5tYXAoaXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpdGVtLm9wdGlvbnMudHlwZSAhPSBEaWFsb2dUeXBlLm1lc3NhZ2UgfHwgaXRlbS55IDw9IGluc3RhbmNlLnkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpdGVtLnkgLT0gaW5zdGFuY2UuaGVpZ2h0ICsgMzA7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5tZXNzYWdlLCBEaWFsb2dNZXNzYWdlKTsiLCJpbnRlcmZhY2UgRGlhbG9nTm90aWZ5T3B0aW9uIGV4dGVuZHMgRGlhbG9nVGlwT3B0aW9uIHtcclxuICAgIHRpdGxlPzogc3RyaW5nLFxyXG4gICAgaWNvPzogc3RyaW5nXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ05vdGlmeSBleHRlbmRzIERpYWxvZ1RpcCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dOb3RpZnlPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvcHRpb25zOiBEaWFsb2dOb3RpZnlPcHRpb247XHJcblxyXG4gICAgcHVibGljIG5vdGlmeTogTm90aWZpY2F0aW9uOyAvLyDns7vnu5/pgJrnn6VcclxuXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPlum7mOiupOiuvue9rlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE9wdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmF1bHREaWFsb2dOb3RpZnlPcHRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2hvd0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5ub3RpZnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuYWRkSXRlbSh0aGlzKTtcclxuICAgICAgICB0aGlzLl9jcmVhdGVOb3RpZnkoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgaGlkZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbG9zZUJveCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zaW5nQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNsb3NlQm94KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2luZyBcclxuICAgICAgICB8fCB0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2VkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZhbHNlID09IHRoaXMudHJpZ2dlcignY2xvc2VkJykpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Nsb3NlZCBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2Nsb3NlTm90aWZ5KCk7XHJcbiAgICAgICAgRGlhbG9nLnJlbW92ZUl0ZW0odGhpcy5pZCk7IFxyXG4gICAgICAgIHRoaXMuY2hhbmdlU3RhdHVzKERpYWxvZ1N0YXR1cy5jbG9zZWQpO1xyXG4gICAgICAgIHRoaXMuc3RvcFRpbWUoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVOb3RpZnkoKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBpZiAoXCJOb3RpZmljYXRpb25cIiBpbiB3aW5kb3cpIHtcclxuICAgICAgICAgICAgbGV0IGFzayA9IE5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpO1xyXG4gICAgICAgICAgICBhc2sudGhlbihwZXJtaXNzaW9uID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChwZXJtaXNzaW9uICE9PSBcImdyYW50ZWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmgqjnmoTmtY/op4jlmajmlK/mjIHkvYbmnKrlvIDlkK/moYzpnaLmj5DphpLvvIEnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2Uubm90aWZ5ID0gbmV3IE5vdGlmaWNhdGlvbihpbnN0YW5jZS5vcHRpb25zLnRpdGxlLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9keTogaW5zdGFuY2Uub3B0aW9ucy5jb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246IGluc3RhbmNlLm9wdGlvbnMuaWNvLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5ub3RpZnkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS50cmlnZ2VyKCdkb25lJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coJ+aCqOeahOa1j+iniOWZqOS4jeaUr+aMgeahjOmdouaPkOmGku+8gScpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2Nsb3NlTm90aWZ5KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5ub3RpZnkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm5vdGlmeS5jbG9zZSgpO1xyXG4gICAgICAgIHRoaXMubm90aWZ5ID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ05vdGlmeU9wdGlvbiBleHRlbmRzIERlZmF1bHREaWFsb2dUaXBPcHRpb24gaW1wbGVtZW50cyBEaWFsb2dOb3RpZnlPcHRpb24ge1xyXG4gICAgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonO1xyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUubm90aWZ5LCBEaWFsb2dOb3RpZnkpOyIsImludGVyZmFjZSBEaWFsb2dQb3BPcHRpb24gZXh0ZW5kcyBEaWFsb2dUaXBPcHRpb24ge1xyXG4gICAgZGlyZWN0aW9uPzogRGlhbG9nRGlyZWN0aW9uIHwgc3RyaW5nIHwgbnVtYmVyLFxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dQb3AgZXh0ZW5kcyBEaWFsb2dUaXAge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dQb3BPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPSBEaWFsb2cucGFyc2VFbnVtPERpYWxvZ0RpcmVjdGlvbj4odGhpcy5vcHRpb25zLmRpcmVjdGlvbiwgRGlhbG9nRGlyZWN0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLl9zZXRQb3BQcm9wZXJ0eSgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5Yiw5a655Zmo5LiKXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBhcHBlbmRQYXJlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJveCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgJChkb2N1bWVudC5ib2R5KS5hcHBlbmQodGhpcy5ib3gpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UmFuZG9tRGlyZWN0aW9uKCk6IERpYWxvZ0RpcmVjdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKE1hdGgucmFuZG9tKCkgKiA4KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2V0UG9wUHJvcGVydHkoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5kaXJlY3Rpb24gPSB0aGlzLl9nZXRSYW5kb21EaXJlY3Rpb24oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ib3guYWRkQ2xhc3MoJ2RpYWxvZy1wb3AtJyArIERpYWxvZ0RpcmVjdGlvblt0aGlzLm9wdGlvbnMuZGlyZWN0aW9uXSk7XHJcbiAgICAgICAgbGV0IG9mZmVzdCA9IHRoaXMub3B0aW9ucy50YXJnZXQub2Zmc2V0KCk7XHJcbiAgICAgICAgbGV0IFt4LCB5XSA9IHRoaXMuX2dldFBvcExlZnRUb3AoRGlhbG9nLnBhcnNlRW51bTxEaWFsb2dEaXJlY3Rpb24+KHRoaXMub3B0aW9ucy5kaXJlY3Rpb24sIERpYWxvZ0NvcmUpLCB0aGlzLmJveC5vdXRlcldpZHRoKCksIHRoaXMuYm94Lm91dGVySGVpZ2h0KCksIG9mZmVzdC5sZWZ0LCBvZmZlc3QudG9wLCB0aGlzLm9wdGlvbnMudGFyZ2V0Lm91dGVyV2lkdGgoKSwgdGhpcy5vcHRpb25zLnRhcmdldC5vdXRlckhlaWdodCgpKTtcclxuICAgICAgICB0aGlzLmJveC5jc3Moe1xyXG4gICAgICAgICAgICBsZWZ0OiB4ICsgJ3B4JyxcclxuICAgICAgICAgICAgdG9wOiB5ICsgJ3B4J1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFBvcExlZnRUb3AoZGlyZWN0aW9uOiBEaWFsb2dEaXJlY3Rpb24sIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlciwgYm94V2lkdGg6IG51bWJlciwgYm94SGVpZ2h0OiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdIHtcclxuICAgICAgICBsZXQgc3BhY2UgPSAzMDsgLy8g56m66ZqZXHJcbiAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHRUb3A6XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt4ICsgYm94V2lkdGggKyBzcGFjZSwgeSArIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0Qm90dG9tOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5ib3R0b206XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ggKyAoYm94V2lkdGggLSB3aWR0aCkgLyAyLCAgeSArIGJveEhlaWdodCArIHNwYWNlXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ubGVmdEJvdHRvbTpcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ubGVmdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbeCAtIHdpZHRoIC0gc3BhY2UsIHkgKyAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5jZW50ZXI6XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnRUb3A6XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnRvcDpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbeCArIChib3hXaWR0aCAtIHdpZHRoKSAvIDIsIHkgLSBoZWlnaHQgLSBzcGFjZV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUucG9wLCBEaWFsb2dQb3ApOyIsImludGVyZmFjZSBEaWFsb2dMb2FkaW5nT3B0aW9uIGV4dGVuZHMgRGlhbG9nVGlwT3B0aW9uIHtcclxuICAgIGNvdW50PzogbnVtYmVyO1xyXG4gICAgZXh0cmE/OiBzdHJpbmdcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nTG9hZGluZyBleHRlbmRzIERpYWxvZ1RpcCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ0xvYWRpbmdPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ0xvYWRpbmdPcHRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5odG1sKHRoaXMuX2dldExvYWRpbmcoKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMub3B0aW9ucy50YXJnZXQgfHwgRGlhbG9nLiR3aW5kb3c7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gdGFyZ2V0LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5ib3gud2lkdGgoKTtcclxuICAgICAgICBsZXQgbWF4SGVpZ2h0ID0gdGFyZ2V0LmhlaWdodCgpO1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmJveC5oZWlnaHQoKTtcclxuICAgICAgICB0aGlzLmNzcyh7XHJcbiAgICAgICAgICAgIGxlZnQ6IChtYXhXaWR0aCAtIHdpZHRoKSAvIDIgKyAncHgnLFxyXG4gICAgICAgICAgICB0b3A6IChtYXhIZWlnaHQgLSBoZWlnaHQpIC8gMiArICdweCdcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRMb2FkaW5nKCkge1xyXG4gICAgICAgIGxldCBodG1sID0gJyc7XHJcbiAgICAgICAgbGV0IG51bSA9IHRoaXMub3B0aW9ucy5jb3VudDtcclxuICAgICAgICBmb3IoOyBudW0gPiAwOyBudW0gLS0pIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPHNwYW4+PC9zcGFuPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicrIHRoaXMub3B0aW9ucy5leHRyYSArJ1wiPicrIGh0bWwgKyc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzaG93Qm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghc3VwZXIuc2hvd0JveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIERpYWxvZy5zaG93QmcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5zaG93QmcodGhpcy5vcHRpb25zLnRhcmdldCwgZmFsc2UpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBoaWRlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghc3VwZXIuaGlkZUJveCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRGlhbG9nLmNsb3NlQmcoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgY2xvc2luZ0JveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXN1cGVyLmNsb3NpbmdCb3goKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNsb3NlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcclxuICAgICAgICBpZiAoIXN1cGVyLmNsb3NlQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3RhdHVzICE9IERpYWxvZ1N0YXR1cy5jbG9zaW5nKSB7XHJcbiAgICAgICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dMb2FkaW5nT3B0aW9uIGltcGxlbWVudHMgRGlhbG9nTG9hZGluZ09wdGlvbiB7XHJcbiAgICBleHRyYTogc3RyaW5nID0gJ2xvYWRpbmcnOyAgICAgIC8v6aKd5aSW55qEY2xhc3NcclxuICAgIGNvdW50OiBudW1iZXIgPSA1O1xyXG4gICAgdGltZTogbnVtYmVyID0gMDtcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLmxvYWRpbmcsIERpYWxvZ0xvYWRpbmcpO1xyXG5cclxuIiwiaW50ZXJmYWNlIERpYWxvZ0J1dHRvbiB7XHJcbiAgICBjb250ZW50OiBzdHJpbmcsXHJcbiAgICB0YWc/OiBzdHJpbmdcclxufVxyXG5cclxuaW50ZXJmYWNlIERpYWxvZ0NvbnRlbnRPcHRpb24gZXh0ZW5kcyBEaWFsb2dPcHRpb24ge1xyXG4gICAgdXJsPzogc3RyaW5nLCAgICAgICAvLyBhamF46K+35rGCXHJcbiAgICBidXR0b24/OiBzdHJpbmcgfCBzdHJpbmdbXXwgRGlhbG9nQnV0dG9uW10sXHJcbiAgICBoYXNZZXM/OiBib29sZWFuIHwgc3RyaW5nOyAvLyDmmK/lkKbmnInnoa7lrprmjInpkq5cclxuICAgIGhhc05vPzogYm9vbGVhbiB8IHN0cmluZzsgIC8vIOaYr+WQpuacieWPlua2iOaMiemSrlxyXG4gICAgb25kb25lPzogRnVuY3Rpb24gICAgICAgIC8v54K556Gu5a6a5pe26Kem5Y+RXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ0NvbnRlbnQgZXh0ZW5kcyBEaWFsb2dDb3JlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ0NvbnRlbnRPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmNvbnRlbnQgJiYgdGhpcy5vcHRpb25zLnVybCkge1xyXG4gICAgICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICQuZ2V0KHRoaXMub3B0aW9ucy51cmwsIGZ1bmN0aW9uKGh0bWwpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLm9wdGlvbnMuY29udGVudCA9IGh0bWw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuaW5pdCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfaXNMb2FkaW5nOiBib29sZWFuID0gZmFsc2U7IC8v5Yqg6L295LitIOaYvuekuuaXtuWAmeWHuueOsOWKoOi9veWKqOeUu1xyXG5cclxuICAgIHByaXZhdGUgX2xvYWRpbmdEaWFsb2c6IERpYWxvZ0NvcmU7XHJcblxyXG4gICAgcHVibGljIGdldCBpc0xvYWRpbmcoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzTG9hZGluZztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGlzTG9hZGluZyhhcmc6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9pc0xvYWRpbmcgPSBhcmc7XHJcbiAgICAgICAgdGhpcy5fdG9nZ2xlTG9hZGluZygpO1xyXG4gICAgICAgIC8vIOWKoOi9veWujOaIkOaXtuaYvuekuuWFg+e0oFxyXG4gICAgICAgIGlmICghdGhpcy5faXNMb2FkaW5nICYmIHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5zaG93KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0JveCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOaYvuekuuWKoOi9veWKqOeUu1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF90b2dnbGVMb2FkaW5nKGFyZzogRGlhbG9nU3RhdHVzID0gdGhpcy5zdGF0dXMpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNMb2FkaW5nIHx8IGFyZyAhPSBEaWFsb2dTdGF0dXMuc2hvdykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbG9hZGluZ0RpYWxvZykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZGluZ0RpYWxvZy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZGluZ0RpYWxvZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9sb2FkaW5nRGlhbG9nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdEaWFsb2cuc2hvdygpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xvYWRpbmdEaWFsb2cgPSBEaWFsb2cubG9hZGluZygpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuICAgICAgICBEaWFsb2cuYWRkSXRlbSh0aGlzKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUNvcmUoKS5jcmVhdGVDb250ZW50KClcclxuICAgICAgICAuYXBwZW5kUGFyZW50KCkuc2V0UHJvcGVydHkoKS5iaW5kRXZlbnQoKTtcclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLnNob3cpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93Qm94KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ0NvbnRlbnRPcHRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiuvue9ruWGheWuuVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5odG1sKHRoaXMuZ2V0Q29udGVudEh0bWwoKSsgdGhpcy5nZXRGb290ZXJIdG1sKCkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5re75Yqg5Yiw5a655Zmo5LiKXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBhcHBlbmRQYXJlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgJChkb2N1bWVudC5ib2R5KS5hcHBlbmQodGhpcy5ib3gpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6K6+572u5bGe5oCnXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOe7keWumuS6i+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94LmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLXllc1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdkb25lJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy1jbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRDb250ZW50SHRtbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBjb250ZW50ID0gdGhpcy5vcHRpb25zLmNvbnRlbnQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZW50ID09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShjb250ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWJvZHlcIj4nKyBjb250ZW50ICsnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0Rm9vdGVySHRtbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmhhc1llcyAmJiAhdGhpcy5vcHRpb25zLmhhc05vICYmICh0eXBlb2YgdGhpcy5vcHRpb25zLmJ1dHRvbiA9PSAnb2JqZWN0JyAmJiB0aGlzLm9wdGlvbnMuYnV0dG9uIGluc3RhbmNlb2YgQXJyYXkgJiYgdGhpcy5vcHRpb25zLmJ1dHRvbi5sZW5ndGggPT0gMCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWZvb3RlclwiPic7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oYXNZZXMpIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPGJ1dHRvbiBjbGFzcz1cImRpYWxvZy15ZXNcIj4nKyAodHlwZW9mIHRoaXMub3B0aW9ucy5oYXNZZXMgPT0gJ3N0cmluZycgPyB0aGlzLm9wdGlvbnMuaGFzWWVzIDogJ+ehruiupCcpICsnPC9idXR0b24+JztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oYXNObykge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8YnV0dG9uIGNsYXNzPVwiZGlhbG9nLWNsb3NlXCI+JysgKHR5cGVvZiB0aGlzLm9wdGlvbnMuaGFzTm8gPT0gJ3N0cmluZycgPyB0aGlzLm9wdGlvbnMuaGFzTm8gOiAn5Y+W5raIJykgKyc8L2J1dHRvbj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5idXR0b24gPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmJ1dHRvbiA9IFt0aGlzLm9wdGlvbnMuYnV0dG9uXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJC5lYWNoKHRoaXMub3B0aW9ucy5idXR0b24sIChpLCBpdGVtKT0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8YnV0dG9uXCI+JytpdGVtKyc8L2J1dHRvbj4nO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxidXR0b24gY2xhc3M9XCInK2l0ZW0udGFnKydcIj4nK2l0ZW0uY29udGVudCsnPC9idXR0b24+JztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gaHRtbCArPSAnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb25DbGljayh0YWc6IHN0cmluZywgY2FsbGJhY2s6IChlbGVtZW50OiBKUXVlcnkpID0+IGFueSkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ib3gub24oJ2NsaWNrJywgdGFnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoaW5zdGFuY2UsICQodGhpcykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBzaG93Qm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZVN0YXR1cyhEaWFsb2dTdGF0dXMuc2hvdyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzdXBlci5zaG93Qm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuc2hvd0JnKHRoaXMub3B0aW9ucy50YXJnZXQpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBoaWRlQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZVN0YXR1cyhEaWFsb2dTdGF0dXMuaGlkZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzdXBlci5oaWRlQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zaW5nQm94KCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZVN0YXR1cyhEaWFsb2dTdGF0dXMuaGlkZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzdXBlci5jbG9zaW5nQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cuY2xvc2VCZygpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjbG9zZUJveCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGlhbG9nU3RhdHVzLmhpZGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzdGF0dXMgPSB0aGlzLnN0YXR1cztcclxuICAgICAgICBpZiAoIXN1cGVyLmNsb3NlQm94KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3RhdHVzICE9IERpYWxvZ1N0YXR1cy5jbG9zaW5nKSB7XHJcbiAgICAgICAgICAgIERpYWxvZy5jbG9zZUJnKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dDb250ZW50T3B0aW9uIGltcGxlbWVudHMgRGlhbG9nQ29udGVudE9wdGlvbiB7XHJcbiAgICBoYXNZZXM6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgaGFzTm86IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgdGltZTogbnVtYmVyID0gMDtcclxuICAgIGJ1dHRvbjogc3RyaW5nW10gPSBbXTtcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLmNvbnRlbnQsIERpYWxvZ0NvbnRlbnQpOyIsImNsYXNzIERpYWxvZ0Zvcm0gZXh0ZW5kcyBEaWFsb2dCb3gge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RhdGE6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW119O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6KGo5Y2V5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZGF0YSgpOiB7W25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9kYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9nZXRGb3JtRGF0YSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9lbGVtZW50czoge1tuYW1lOiBzdHJpbmddOiBKUXVlcnl9O1xyXG4gICAgLyoqXHJcbiAgICAgKiDooajljZXmjqfku7ZcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBlbGVtZW50cygpOiB7W25hbWU6IHN0cmluZ106IEpRdWVyeX0ge1xyXG4gICAgICAgIGlmICghdGhpcy5fZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHMgPSB0aGlzLl9nZXRGb3JtRWxlbWVudCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldENvbnRlbnRIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWJvZHlcIj4nKyB0aGlzLl9jcmVhdGVGb3JtKHRoaXMub3B0aW9ucy5jb250ZW50KSArJzwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlRm9ybShkYXRhOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICQuZWFjaChkYXRhLCBmdW5jdGlvbihuYW1lOiBzdHJpbmcsIGl0ZW06IGFueSkge1xyXG4gICAgICAgICAgICBodG1sICs9IGluc3RhbmNlLl9jcmVhdGVJbnB1dChuYW1lLCBpdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gaHRtbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVJbnB1dChuYW1lOiBzdHJpbmcsIGRhdGE6IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGRhdGEgPSB7bGFiZWw6IGRhdGF9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRhdGEudHlwZSkge1xyXG4gICAgICAgICAgICBkYXRhLnR5cGUgPSAhZGF0YS5pdGVtID8gJ3RleHQnIDogJ3NlbGVjdCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBhdHRyID0gJyc7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICBsZXQgZGVmYXVsdFZhbCA9ICcnO1xyXG4gICAgICAgIGlmIChkYXRhLmRlZmF1bHQpIHtcclxuICAgICAgICAgICAgZGVmYXVsdFZhbCA9IGRhdGEuZGVmYXVsdFZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEubGFiZWwpIHtcclxuICAgICAgICAgICAgaHRtbCArPSAnPGxhYmVsPicrZGF0YS5sYWJlbCsnPC9sYWJlbD4nOyBcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEuaWQpIHtcclxuICAgICAgICAgICAgYXR0ciArPSAnIGlkPVwiJytkYXRhLmlkKydcIic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLmNsYXNzKSB7XHJcbiAgICAgICAgICAgIGF0dHIgKz0gJyBjbGFzcz1cIicrZGF0YS5jbGFzcysnXCInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5yZXF1aXJlZCkge1xyXG4gICAgICAgICAgICBhdHRyICs9ICcgcmVxdWlyZWQ9XCJyZXF1aXJlZFwiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEucGxhY2Vob2xkZXIpIHtcclxuICAgICAgICAgICAgYXR0ciArPSAnIHBsYWNlaG9sZGVyPVwiJytkYXRhLnBsYWNlaG9sZGVyKydcIic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN3aXRjaCAoZGF0YS50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RleHRhcmVhJzpcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzx0ZXh0YXJlYSBuYW1lPVwiJytuYW1lKydcIiAnK2F0dHIrJz4nK2RlZmF1bHRWYWwrJzwvdGV4dGFyZWE+JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzZWxlY3QnOlxyXG4gICAgICAgICAgICAgICAgbGV0IG9wdGlvbiA9ICcnO1xyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGRhdGEuaXRlbSwgZnVuY3Rpb24odmFsLCBsYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwgPT0gZGVmYXVsdFZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgKz0gJ1wiIHNlbGVjdGVkPVwic2VsZWN0ZWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBvcHRpb24gKz0gJzxvcHRpb24gdmFsdWU9XCInK3ZhbCsnXCI+JytsYWJlbCsnPC9vcHRpb24+JztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPHNlbGVjdCBuYW1lPVwiJytuYW1lKydcIiAnK2F0dHIrJz4nK29wdGlvbisnPHNlbGVjdD4nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3JhZGlvJzpcclxuICAgICAgICAgICAgY2FzZSAnY2hlY2tib3gnOlxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdicrYXR0cisnPidcclxuICAgICAgICAgICAgICAgICQuZWFjaChkYXRhLml0ZW0sIGZ1bmN0aW9uKHZhbCwgbGFiZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsID09IGRlZmF1bHRWYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsICs9ICdcIiBjaGVja2VkPVwiY2hlY2tlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwiJytkYXRhLnR5cGUrJ1wiIG5hbWU9XCInK25hbWUrJ1wiIHZhbHVlPVwiJyt2YWwrJ1wiPicgKyBsYWJlbDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdj4nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8aW5wdXQgdHlwZT1cIicrZGF0YS50eXBlKydcIiBuYW1lPVwiJytuYW1lKydcIiAnK2F0dHIrJyB2YWx1ZT1cIicrZGVmYXVsdFZhbCsnXCI+JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJpbnB1dC1ncm91cFwiPicraHRtbCsnPC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluihqOWNleaOp+S7tlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9nZXRGb3JtRWxlbWVudCgpOntbbmFtZTpzdHJpbmddOiBKUXVlcnl9IHtcclxuICAgICAgICBsZXQgZWxlbWVudHMgPSB7fTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYm94LmZpbmQoJ2lucHV0LHNlbGVjdCx0ZXh0YXJlYSxidXR0b24nKS5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICBsZXQgaXRlbSA9ICQoZWxlKTtcclxuICAgICAgICAgICAgbGV0IG5hbWUgPSBpdGVtLmF0dHIoJ25hbWUnKTtcclxuICAgICAgICAgICAgaWYgKCFuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFpdGVtLmlzKCdbdHlwZT1yaWRpb10nKSAmJiAhaXRlbS5pcygnW3R5cGU9Y2hlY2tib3hdJykgJiYgbmFtZS5pbmRleE9mKCdbXScpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudHNbbmFtZV0gPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZWxlbWVudHMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnRzW25hbWVdID0gaXRlbTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50c1tuYW1lXS5wdXNoKGVsZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6KGo5Y2V5pWw5o2uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2dldEZvcm1EYXRhKCk6IHtbbmFtZTogc3RyaW5nXTogYW55fSB7XHJcbiAgICAgICAgbGV0IGZvcm1EYXRhID0ge307XHJcbiAgICAgICAgJC5lYWNoKHRoaXMuZWxlbWVudHMsIGZ1bmN0aW9uKG5hbWU6IHN0cmluZywgZWxlbWVudDogSlF1ZXJ5KSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzKCdbdHlwZT1yaWRpb10nKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmF0dHIoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YVtuYW1lXSA9IGl0ZW0udmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXMoJ1t0eXBlPWNoZWNrYm94XScpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmF0dHIoJ2NoZWNrZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChpdGVtLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhW25hbWVdID0gZGF0YTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobmFtZS5pbmRleE9mKCdbXScpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuZWFjaChmdW5jdGlvbihpLCBlbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbSA9ICQoZWxlKTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goaXRlbS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGZvcm1EYXRhW25hbWVdID0gZGF0YTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JtRGF0YVtuYW1lXSA9IGVsZW1lbnQudmFsKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZvcm1EYXRhO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5mb3JtLCBEaWFsb2dGb3JtKTsiLCJjbGFzcyBEaWFsb2dQYWdlIGV4dGVuZHMgRGlhbG9nQm94IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgZ2V0SGVhZGVySHRtbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJkaWFsb2ctaGVhZGVyXCI+PGkgY2xhc3M9XCJmYSBmYS1hcnJvdy1sZWZ0XCI+PC9pPjxkaXYgY2xhc3M9XCJkaWFsb2ctdGl0bGVcIj4nO1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaWNvKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gJzxpIGNsYXNzPVwiZmEgZmEtJyArIHRoaXMub3B0aW9ucy5pY28gKyAnXCI+PC9pPic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudGl0bGUpIHtcclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLm9wdGlvbnMudGl0bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBodG1sICsgJzwvZGl2PjxpIGNsYXNzPVwiZmEgZmEtY2xvc2UgZGlhbG9nLWNsb3NlXCI+PC9pPjwvZGl2Pic7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnu5Hlrprkuovku7ZcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGJpbmRFdmVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveC5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy1oZWFkZXIgLmZhLWFycm93LWxlZnRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLXllc1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKCdkb25lJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy1jbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbkRpYWxvZy5hZGRNZXRob2QoRGlhbG9nVHlwZS5wYWdlLCBEaWFsb2dQYWdlKTsiLCJpbnRlcmZhY2UgRGlhbG9nSW1hZ2VPcHRpb24gZXh0ZW5kcyBEaWFsb2dPcHRpb24ge1xyXG4gICAgb25uZXh0PzogKGluZGV4OiBudW1iZXIpID0+IHN0cmluZyxcclxuICAgIG9ucHJldmlvdXM/OiAoaW5kZXg6IG51bWJlcikgPT4gc3RyaW5nXHJcbn1cclxuXHJcbmNsYXNzIERpYWxvZ0ltYWdlIGV4dGVuZHMgRGlhbG9nQ29udGVudCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2luZGV4OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHByaXZhdGUgX2ltZzogSlF1ZXJ5O1xyXG5cclxuICAgIHByaXZhdGUgX3NyYzogc3RyaW5nO1xyXG5cclxuICAgIHB1YmxpYyBnZXQgc3JjKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NyYztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHNyYyhpbWc6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghaW1nKSB7XHJcbiAgICAgICAgICAgIGltZyA9IHRoaXMub3B0aW9ucy5jb250ZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zcmMgPSBpbWc7XHJcbiAgICAgICAgdGhpcy5faW1nLmF0dHIoJ3N0eWxlJywgJycpLmF0dHIoJ3NyYycsIGltZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5ib3guaHRtbCh0aGlzLmdldENvbnRlbnRIdG1sKCkpO1xyXG4gICAgICAgIHRoaXMuX2ltZyA9IHRoaXMuYm94LmZpbmQoJy5kaWFsb2ctYm9keSBpbWcnKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IHRoaXMub3B0aW9ucy50YXJnZXQgfHwgRGlhbG9nLiR3aW5kb3c7XHJcbiAgICAgICAgbGV0IG1heFdpZHRoID0gdGFyZ2V0LndpZHRoKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5faW1nLndpZHRoKCk7XHJcbiAgICAgICAgbGV0IG1heEhlaWdodCA9IHRhcmdldC5oZWlnaHQoKTtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5faW1nLmhlaWdodCgpO1xyXG4gICAgICAgIGlmICh3aWR0aCA8PSBtYXhXaWR0aCAmJiBoZWlnaHQgPD0gbWF4SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3NzKHtcclxuICAgICAgICAgICAgICAgIGxlZnQ6IChtYXhXaWR0aCAtIHdpZHRoKSAvIDIgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAobWF4SGVpZ2h0IC0gaGVpZ2h0KSAvIDIgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgd1NjYWxlID0gd2lkdGggLyBtYXhXaWR0aDtcclxuICAgICAgICBsZXQgaFNjYWxlID0gaGVpZ2h0IC8gbWF4SGVpZ2h0O1xyXG4gICAgICAgIGlmICh3U2NhbGUgPj0gaFNjYWxlKSB7XHJcbiAgICAgICAgICAgIGhlaWdodCAvPSB3U2NhbGU7IFxyXG4gICAgICAgICAgICB0aGlzLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAwLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAobWF4SGVpZ2h0IC0gaGVpZ2h0KSAvIDIgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogbWF4V2lkdGhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ltZy5jc3Moe1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogbWF4V2lkdGhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aWR0aCAvPSBoU2NhbGU7XHJcbiAgICAgICAgdGhpcy5jc3Moe1xyXG4gICAgICAgICAgICBsZWZ0OiAobWF4V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4JyxcclxuICAgICAgICAgICAgdG9wOiAwLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IG1heEhlaWdodCxcclxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5faW1nLmNzcyh7XHJcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxyXG4gICAgICAgICAgICB3aWR0aDogbWF4V2lkdGhcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOe7keWumuS6i+S7tlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgYmluZEV2ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94LmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkNsaWNrKFwiLmRpYWxvZy1jbG9zZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25DbGljayhcIi5kaWFsb2ctcHJldmlvdXNcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2soXCIuZGlhbG9nLW5leHRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLmJveCkge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UucmVzaXplKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmJveC5maW5kKCcuZGlhbG9nLWJvZHkgaW1nJykuYmluZChcImxvYWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5ib3gpIHtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLnJlc2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDph43orr7lsLrlr7hcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlc2l6ZSgpIHtcclxuICAgICAgICB0aGlzLnNldFByb3BlcnR5KCk7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcHJldmlvdXMoKSB7XHJcbiAgICAgICAgdGhpcy5zcmMgPSB0aGlzLnRyaWdnZXIoJ3ByZXZpb3VzJywgLS0gdGhpcy5faW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBuZXh0KCkge1xyXG4gICAgICAgIHRoaXMuc3JjID0gdGhpcy50cmlnZ2VyKCduZXh0JywgKysgdGhpcy5faW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXRDb250ZW50SHRtbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmNvbnRlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmNvbnRlbnQgPSB0aGlzLnRyaWdnZXIoJ25leHQnLCArKyB0aGlzLl9pbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnPGkgY2xhc3M9XCJmYSBmYS1jaGV2cm9uLWxlZnQgZGlhbG9nLXByZXZpb3VzXCI+PC9pPjxkaXYgY2xhc3M9XCJkaWFsb2ctYm9keVwiPjxpbWcgc3JjPVwiJysgdGhpcy5vcHRpb25zLmNvbnRlbnQgKydcIj48L2Rpdj48aSBjbGFzcz1cImZhIGZhLWNoZXZyb24tcmlnaHQgZGlhbG9nLW5leHRcIj48L2k+PGkgY2xhc3M9XCJmYSBmYS1jbG9zZSBkaWFsb2ctY2xvc2VcIj48L2k+JztcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdERpYWxvZ0ltYWdlT3B0aW9uIGltcGxlbWVudHMgRGlhbG9nSW1hZ2VPcHRpb24ge1xyXG4gICAgb25uZXh0OiAoaW5kZXg6IG51bWJlcikgPT4gc3RyaW5nID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gJChkb2N1bWVudC5ib2R5KS5maW5kKCdpbWcnKS5lcShpbmRleCkuYXR0cignc3JjJyk7XHJcbiAgICB9O1xyXG4gICAgb25wcmV2aW91czogKGluZGV4OiBudW1iZXIpID0+IHN0cmluZyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuICQoZG9jdW1lbnQuYm9keSkuZmluZCgnaW1nJykuZXEoaW5kZXgpLmF0dHIoJ3NyYycpO1xyXG4gICAgfTtcclxufVxyXG5cclxuRGlhbG9nLmFkZE1ldGhvZChEaWFsb2dUeXBlLmltYWdlLCBEaWFsb2dJbWFnZSk7IiwiaW50ZXJmYWNlIERpYWxvZ0Rpc2tPcHRpb24gZXh0ZW5kcyBEaWFsb2dCb3hPcHRpb24ge1xyXG4gICAgY2F0YWxvZz86IGFueSwgICAgICAgIC8v55uu5b2VXHJcbiAgICBuYW1lPzogc3RyaW5nLFxyXG4gICAgY2hpbGRyZW4/OiBzdHJpbmcsXHJcbiAgICB1cmw/OiBzdHJpbmcsICAgICAgICAgLy91cmzmoIforrBcclxuICAgIG11bHRpcGxlPzogYm9vbGVhbiwgICAgLy/mmK/lkKblhYHorrjlpJrpgIlcclxuICAgIG9ub3BlbkZpbGU/OiAodXJsOiBzdHJpbmcsIGVsZW1lbnQ6IEpRdWVyeSkgPT4gYW55ICAvL+aJk+W8gOaWh+S7tuinpuWPkeaXtumXtFxyXG59XHJcblxyXG5jbGFzcyBEaWFsb2dEaXNrIGV4dGVuZHMgRGlhbG9nQm94IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nRGlza09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG9wdGlvbnM6IERpYWxvZ0Rpc2tPcHRpb247XHJcblxyXG4gICAgcHVibGljIGNhdGFsb2dCb3g6IEpRdWVyeTtcclxuXHJcbiAgICBwdWJsaWMgZmlsZUJveDogSlF1ZXJ5O1xyXG5cclxuICAgIHByb3RlY3RlZCBiaW5kRXZlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5jYXRhbG9nQm94ID0gdGhpcy5ib3guZmluZCgnLmRpYWxvZy1ib2R5IC5kaWFsb2ctY2F0YWxvZycpO1xyXG4gICAgICAgIHRoaXMuZmlsZUJveCA9IHRoaXMuYm94LmZpbmQoJy5kaWFsb2ctYm9keSAuZGlhbG9nLWNvbnRlbnQnKTtcclxuICAgICAgICBsZXQgaW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLmNhdGFsb2cgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93Q2F0YWxvZyh0aGlzLm9wdGlvbnMuY2F0YWxvZyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJC5nZXRKU09OKHRoaXMub3B0aW9ucy5jYXRhbG9nLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb2RlID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5zaG93Q2F0YWxvZyhkYXRhLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMuY29udGVudCA9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dGaWxlKHRoaXMub3B0aW9ucy5jb250ZW50KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkLmdldEpTT04odGhpcy5vcHRpb25zLmNvbnRlbnQsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmNvZGUgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnNob3dGaWxlKGRhdGEuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhdGFsb2dCb3gub24oJ2NsaWNrJywgJy50cmVlLWl0ZW0nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGZpbGUgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICBmaWxlLmFkZENsYXNzKCdhY3RpdmUnKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgaW5zdGFuY2Uub3BlbihmaWxlLmF0dHIoJ2RhdGEtdXJsJykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZmlsZUJveC5vbignY2xpY2snLCAnLmZvbGRlci1pdGVtJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCBmaWxlID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgZmlsZS5hZGRDbGFzcygnYWN0aXZlJykuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGluc3RhbmNlLm9wZW4oZmlsZS5hdHRyKCdkYXRhLXVybCcpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmZpbGVCb3gub24oJ2NsaWNrJywgJy5maWxlLWl0ZW0nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IGZpbGUgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICBmaWxlLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAgICAgaWYgKCFpbnN0YW5jZS5vcHRpb25zLm11bHRpcGxlKSB7XHJcbiAgICAgICAgICAgICAgICBmaWxlLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluc3RhbmNlLnRyaWdnZXIoJ29wZW5GaWxlJywgZmlsZS5hdHRyKCdkYXRhLXVybCcpLCBmaWxlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gc3VwZXIuYmluZEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGdldENvbnRlbnRIdG1sKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiZGlhbG9nLWJvZHlcIj48ZGl2IGNsYXNzPVwiZGlhbG9nLWNhdGFsb2dcIj48L2Rpdj48ZGl2IGNsYXNzPVwiZGlhbG9nLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBnZXREZWZhdWx0T3B0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGVmYXVsdERpYWxvZ0Rpc2tPcHRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3Blbih1cmw6IHN0cmluZykge1xyXG4gICAgICAgIGlmICghdXJsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cmwgaXMgZW1wdHknKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBDYWNoZVVybC5nZXREYXRhKHVybCwgZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0ZpbGUoZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bpgInkuK3nmoTmlofku7bot6/lvoRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHZhbCgpOiBzdHJpbmd8IEFycmF5PHN0cmluZz4ge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLm11bHRpcGxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGVCb3guZmluZCgnLmZpbGUtaXRlbS5hY3RpdmUnKS5hdHRyKCdkYXRhLXVybCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGF0YSA9IFtdO1xyXG4gICAgICAgIHRoaXMubWFwU2VsZWN0ZWRGaWxlKHVybCA9PiB7XHJcbiAgICAgICAgICAgIGRhdGEucHVzaCh1cmwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5b6q546v6YCJ5Lit55qE5paH5Lu2XHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBtYXBTZWxlY3RlZEZpbGUoY2FsbGJhY2s6ICh1cmw6IHN0cmluZywgZWxlbWVudDogSlF1ZXJ5LCBpbmRleDogbnVtYmVyKSA9PiBhbnkpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmZpbGVCb3guZmluZCgnLmZpbGUtaXRlbS5hY3RpdmUnKS5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICBsZXQgaXRlbSA9ICQoZWxlKTtcclxuICAgICAgICAgICAgbGV0IHVybCA9IGl0ZW0uYXR0cignZGF0YS11cmwnKTtcclxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoaXRlbSwgdXJsLCBpdGVtLCBpKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlvqrnjq/miYDmnIlcclxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBcclxuICAgICAqIEBwYXJhbSBoYXNGb2xkZXIg5piv5ZCm5YyF5ZCr5paH5Lu25aS5IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbWFwKGNhbGxiYWNrOiAodXJsOiBzdHJpbmcsIGVsZW1lbnQ6IEpRdWVyeSwgaW5kZXg6IG51bWJlcikgPT4gYW55LCBoYXNGb2xkZXI6IGJvb2xlYW4gPSBmYWxzZSk6IHRoaXMge1xyXG4gICAgICAgIGxldCB0YWcgPSAnLmZpbGUtaXRlbSc7XHJcbiAgICAgICAgaWYgKGhhc0ZvbGRlcikge1xyXG4gICAgICAgICAgICB0YWcgPSAnLmZvbGRlci1pdGVtLCcgKyB0YWc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZmlsZUJveC5maW5kKHRhZykuZWFjaChmdW5jdGlvbihpLCBlbGUpIHtcclxuICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgIGxldCB1cmwgPSBpdGVtLmF0dHIoJ2RhdGEtdXJsJyk7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjay5jYWxsKGl0ZW0sIHVybCwgaXRlbSwgaSkgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S65paH5Lu2XHJcbiAgICAgKiBAcGFyYW0gZGF0YSBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNob3dGaWxlKGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBodG1sID0gJyc7XHJcbiAgICAgICAgJC5lYWNoKGRhdGEsIChpLCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGl0ZW0udHlwZSA9IERpYWxvZy5wYXJzZUVudW08RGlhbG9nRGlza1R5cGU+KGl0ZW0udHlwZSwgRGlhbG9nRGlza1R5cGUpO1xyXG4gICAgICAgICAgICBpZiAoaXRlbS50eXBlID09IERpYWxvZ0Rpc2tUeXBlLmZpbGUpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0RmlsZUl0ZW0oaXRlbSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRGb2xkZXJJdGVtKGl0ZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZmlsZUJveC5odG1sKGh0bWwpXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0RmlsZUl0ZW0oZGF0YSkge1xyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImZpbGUtaXRlbVwiIGRhdGEtdXJsPVwiJyArIGRhdGFbdGhpcy5vcHRpb25zLnVybF0gKydcIj48aSBjbGFzcz1cImZhIGZhLWZpbGUtb1wiPjwvaT48ZGl2IGNsYXNzPVwiZmlsZS1uYW1lXCI+JytkYXRhW3RoaXMub3B0aW9ucy5uYW1lXSsnPC9kaXY+PC9kaXY+JztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRGb2xkZXJJdGVtKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJmb2xkZXItaXRlbVwiIGRhdGEtdXJsPVwiJyArIGRhdGFbdGhpcy5vcHRpb25zLnVybF0gKydcIj48aSBjbGFzcz1cImZhIGZhLWZvbGRlci1vXCI+PC9pPjxkaXYgY2xhc3M9XCJmaWxlLW5hbWVcIj4nK2RhdGFbdGhpcy5vcHRpb25zLm5hbWVdKyc8L2Rpdj48L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S655uu5b2VXHJcbiAgICAgKiBAcGFyYW0gZGF0YSBcclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNob3dDYXRhbG9nKGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBodG1sID0gJyc7XHJcbiAgICAgICAgJC5lYWNoKGRhdGEsIChpLCBpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0Q2F0YWxvZ0l0ZW0oaXRlbSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGh0bWwgPT0gJycpIHtcclxuICAgICAgICAgICAgdGhpcy5jYXRhbG9nQm94LmhpZGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhdGFsb2dCb3guaHRtbCgnPHVsIGNsYXNzPVwidHJlZVwiPicgKyBodG1sICsnPC91bD4nKVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldENhdGFsb2dJdGVtKGRhdGE6IGFueSkge1xyXG4gICAgICAgIGxldCBodG1sID0gJzxsaSBjbGFzcz1cInRyZWUtaXRlbVwiIGRhdGEtdXJsPVwiJyArIGRhdGFbdGhpcy5vcHRpb25zLnVybF0gKydcIj48ZGl2IGNsYXNzPVwidHJlZS1oZWFkZXJcIj4nICsgZGF0YVt0aGlzLm9wdGlvbnMubmFtZV0gKyAnPC9kaXY+JztcclxuICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eSh0aGlzLm9wdGlvbnMuY2hpbGRyZW4pKSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5fZ2V0Q2F0YWxvZ0NoaWxkKGRhdGFbdGhpcy5vcHRpb25zLmNoaWxkcmVuXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBodG1sICsgJzwvbGk+JztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRDYXRhbG9nQ2hpbGQoZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcclxuICAgICAgICAkLmVhY2goZGF0YSwgKGksIGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaHRtbCArPSB0aGlzLl9nZXRDYXRhbG9nSXRlbShpdGVtKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gJzx1bCBjbGFzcz1cInRyZWUtY2hpbGRcIj4nICsgaHRtbCArICc8L3VsPic7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIERlZmF1bHREaWFsb2dEaXNrT3B0aW9uIGV4dGVuZHMgRGVmYXVsdERpYWxvZ0JveE9wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ0Rpc2tPcHRpb24ge1xyXG4gICAgbmFtZTogc3RyaW5nID0gJ25hbWUnO1xyXG4gICAgdGl0bGU6IHN0cmluZyA9ICfmlofku7bnrqHnkIYnO1xyXG4gICAgY2hpbGRyZW46IHN0cmluZyA9ICdjaGlsZHJlbic7XHJcbiAgICB1cmw6IHN0cmluZyA9ICd1cmwnO1xyXG4gICAgbXVsdGlwbGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIG9uY2xvc2luZzogKCkgPT4gYW55ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcblxyXG5EaWFsb2cuYWRkTWV0aG9kKERpYWxvZ1R5cGUuZGlzaywgRGlhbG9nRGlzayk7Il19
