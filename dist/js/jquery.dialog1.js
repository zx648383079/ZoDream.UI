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
        _this._isLoading = false; //加载中 显示时候出现加载动画
        _this.options = $.extend({}, new DefaultDialogOption(), option);
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
            if (this._isLoading) {
                return;
            }
            this._toggleLoading(arg);
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
    Object.defineProperty(DialogCore.prototype, "isLoading", {
        get: function () {
            return this._isLoading;
        },
        set: function (arg) {
            this._isLoading = arg;
            this._toggleLoading();
            // 加载完成时显示元素
            if (!this._isLoading && this.status == DialogStatus.show) {
                this._show();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 创建并显示控件
     */
    DialogCore.prototype._show = function () {
        if (this.isLoading) {
            return;
        }
        if (this.options.type == DialogType.notify) {
            this._createNotify();
            return;
        }
        if (!this.box) {
            this.init();
        }
        if (false == this.trigger('show')) {
            console.log('show stop!');
            return;
        }
        if (this.isLoading) {
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
        if (this.isLoading) {
            return;
        }
        this.box.hide();
        this._status = DialogStatus.hide;
    };
    /**
     * 动画关闭，有关闭动画
     */
    DialogCore.prototype._animationClose = function () {
        if (this.options.type == DialogType.notify) {
            if (this.notify) {
                this.notify.close();
                this.notify = undefined;
            }
            return;
        }
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
        var element = new DialogElement(option);
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
    Dialog.register = function (type, dialog, defaultOption) {
    };
    return Dialog;
}());
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
var DialogBox = (function (_super) {
    __extends(DialogBox, _super);
    function DialogBox(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogBox.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogBox.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
    DialogBox.prototype.init = function () {
    };
    return DialogBox;
}(DialogCore));
var DialogContent = (function (_super) {
    __extends(DialogContent, _super);
    function DialogContent(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogContent.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogContent.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
    DialogContent.prototype.init = function () {
    };
    return DialogContent;
}(DialogCore));
var DialogDisk = (function (_super) {
    __extends(DialogDisk, _super);
    function DialogDisk(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogDisk.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogDisk.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
    DialogDisk.prototype.init = function () {
    };
    return DialogDisk;
}(DialogCore));
var DialogForm = (function (_super) {
    __extends(DialogForm, _super);
    function DialogForm(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogForm.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogForm.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
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
    DialogForm.prototype.init = function () {
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
}(DialogCore));
var DialogImage = (function (_super) {
    __extends(DialogImage, _super);
    function DialogImage(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogImage.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogImage.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
    DialogImage.prototype.init = function () {
    };
    return DialogImage;
}(DialogCore));
var DialogLoading = (function (_super) {
    __extends(DialogLoading, _super);
    function DialogLoading(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogLoading.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogLoading.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
    DialogLoading.prototype.init = function () {
    };
    return DialogLoading;
}(DialogCore));
var DialogMessage = (function (_super) {
    __extends(DialogMessage, _super);
    function DialogMessage(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogMessage.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogMessage.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
    DialogMessage.prototype.init = function () {
    };
    return DialogMessage;
}(DialogCore));
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
    DialogNotify.prototype.init = function () {
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
    return DialogNotify;
}(DialogCore));
var DialogPage = (function (_super) {
    __extends(DialogPage, _super);
    function DialogPage(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogPage.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogPage.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
    DialogPage.prototype.init = function () {
    };
    return DialogPage;
}(DialogCore));
var DialogPop = (function (_super) {
    __extends(DialogPop, _super);
    function DialogPop(option, id) {
        var _this = _super.call(this, option, id) || this;
        if (_this.options.direction) {
            _this.options.direction = Dialog.parseEnum(_this.options.direction, DialogDirection);
        }
        return _this;
    }
    DialogPop.prototype.init = function () {
    };
    DialogPop.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogPop.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
    DialogPop.prototype._setPopProperty = function () {
        if (!this.options.direction) {
            this.options.direction = DialogDirection.top;
        }
        this.box.addClass('dialog-pop-' + DialogDirection[this.options.direction]);
        var offest = this.options.target.offset();
        var _a = this._getPopLeftTop(Dialog.parseEnum(this.options.direction, DialogElement), this.box.outerWidth(), this.box.outerHeight(), offest.left, offest.top, this.options.target.outerWidth(), this.options.target.outerHeight()), x = _a[0], y = _a[1];
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
}(DialogCore));
var DialogSelect = (function (_super) {
    __extends(DialogSelect, _super);
    function DialogSelect(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogSelect.prototype.createContent = function () {
        throw new Error("Method not implemented.");
    };
    DialogSelect.prototype.setProperty = function () {
        throw new Error("Method not implemented.");
    };
    DialogSelect.prototype.init = function () {
    };
    return DialogSelect;
}(DialogCore));
var DialogTip = (function (_super) {
    __extends(DialogTip, _super);
    function DialogTip(option, id) {
        return _super.call(this, option, id) || this;
    }
    DialogTip.prototype.init = function () {
        this.createCore().createContent().setProperty();
    };
    DialogTip.prototype.createContent = function () {
        this.box.text(this.options.content);
        return this;
    };
    DialogTip.prototype.setProperty = function () {
        var target = this.options.target || Dialog.$window;
        var maxWidth = target.width();
        var width = this.box.width();
        this.css('left', (maxWidth - width) / 2 + 'px');
        target.append(this.box);
        return this;
    };
    return DialogTip;
}(DialogCore));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LnRzIiwiYm94LnRzIiwiY29yZS50cyIsImRlZmF1bHQudHMiLCJkaWFsb2cudHMiLCJlbnVtLnRzIiwianF1ZXJ5LmRpYWxvZy50cyIsImNvbnRlbnQudHMiLCJkaXNrLnRzIiwiZm9ybS50cyIsImltYWdlLnRzIiwibG9hZGluZy50cyIsIm1lc3NhZ2UudHMiLCJub3RpZnkudHMiLCJwYWdlLnRzIiwicG9wLnRzIiwic2VsZWN0LnRzIiwidGlwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtJQUFBO0lBbUJBLENBQUE7SUFoQkEsZ0JBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsUUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxzQkFBQSxHQUFBLFVBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEscUJBQUEsR0FBQSxVQUFBLEtBQUE7UUFBQSxjQUFBO2FBQUEsVUFBQSxFQUFBLHFCQUFBLEVBQUEsSUFBQTtZQUFBLDZCQUFBOztRQUNBLElBQUEsU0FBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxDQUFBLEtBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsWUFBQSxJQUFBLFNBQUEsSUFBQSxHQUFBOztJQUNBLENBQUE7SUFDQSxVQUFBO0FBQUEsQ0FuQkEsQUFtQkEsSUFBQTtBQ25CQTtJQUFBLHVCQUFBO0lBQUE7O0lBZ0NBLENBQUE7SUExQkEsMEJBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLHlCQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsVUFBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBOzs7O09BSUE7SUFDQSxXQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUEsT0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxVQUFBO0FBQUEsQ0FoQ0EsQUFnQ0EsQ0FoQ0EsR0FBQSxHQWdDQTtBQ2hDQTtJQUFBLDhCQUFBO0lBQ0Esb0JBQ0EsTUFBQSxFQUNBLEVBQUE7UUFGQSxZQUlBLGlCQUFBLFNBR0E7UUFMQSxRQUFBLEdBQUEsRUFBQSxDQUFBO1FBU0EsYUFBQSxHQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUE7UUFrQ0EsZ0JBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQSxnQkFBQTtRQXhDQSxLQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsbUJBQUEsRUFBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7SUFDQSxDQUFBO0lBTUEsc0JBQUEsOEJBQUE7YUFBQTtZQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsQ0FBQTthQUVBLFVBQUEsR0FBQTtZQUNBLEdBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtZQUNBLFdBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxJQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxJQUFBO29CQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0EsS0FBQSxZQUFBLENBQUEsSUFBQTtvQkFDQSxJQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7b0JBQ0EsS0FBQSxDQUFBO2dCQUNBLEtBQUEsWUFBQSxDQUFBLE9BQUE7b0JBQ0EsSUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO29CQUNBLEtBQUEsQ0FBQTtnQkFDQSxLQUFBLFlBQUEsQ0FBQSxNQUFBO29CQUNBLElBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtvQkFDQSxLQUFBLENBQUE7Z0JBQ0E7b0JBQ0EsTUFBQSxlQUFBLEdBQUEsR0FBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7OztPQTVCQTtJQWtDQSxzQkFBQSxpQ0FBQTthQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUE7UUFDQSxDQUFBO2FBRUEsVUFBQSxHQUFBO1lBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7WUFDQSxZQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1lBQ0EsQ0FBQTtRQUNBLENBQUE7OztPQVRBO0lBZ0JBOztPQUVBO0lBQ0EsMEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsMEJBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0Esb0NBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtnQkFDQSxJQUFBLENBQUEsTUFBQSxHQUFBLFNBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLFlBQUEsQ0FBQSxPQUFBO2VBQ0EsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFlBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxLQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsOEVBQUEsRUFBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLElBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsYUFBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSwyQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLEdBQUEsU0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUlBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxHQUFBLENBQUEsQ0FBQSw0QkFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLGlDQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBT0Esd0JBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxLQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx5QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSx5QkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwwQkFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwyQkFBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBR0EsK0JBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNEJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsNkJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsOEJBQUEsR0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsOEJBQUEsR0FBQTtRQUNBLElBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLCtCQUFBLEdBQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQ0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsT0FBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxHQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFFBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLEtBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsRUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFdBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsRUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxNQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxVQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxJQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQTtZQUNBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBQ0EsaUJBQUE7QUFBQSxDQXZRQSxBQXVRQSxDQXZRQSxHQUFBLEdBdVFBO0FDdlFBO0lBQUE7UUFDQSxVQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsVUFBQSxHQUFBLFNBQUEsQ0FBQSxDQUFBLFVBQUE7UUFDQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO1FBQ0EsU0FBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUE7UUFDQSxXQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsVUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFNBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxXQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsWUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLFdBQUEsR0FBQTtZQUNBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFBQSwwQkFBQTtBQUFBLENBYkEsQUFhQSxJQUFBO0FDYkE7SUFBQTtJQXVUQSxDQUFBO0lBeFNBOzs7T0FHQTtJQUNBLGFBQUEsR0FBQSxVQUFBLE1BQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsT0FBQSxHQUFBLElBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxnQkFBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7O09BSUE7SUFDQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsSUFBQTtRQUFBLHFCQUFBLEVBQUEsV0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxPQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7OztPQUlBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsT0FBQSxFQUFBLElBQUE7UUFBQSxxQkFBQSxFQUFBLFdBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7OztPQUdBO0lBQ0EsY0FBQSxHQUFBLFVBQUEsSUFBQTtRQUFBLHFCQUFBLEVBQUEsUUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7O09BS0E7SUFDQSxjQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLE1BQUEsRUFBQSxNQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7O09BTUE7SUFDQSxVQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE9BQUEsR0FBQTtnQkFDQSxPQUFBLEVBQUEsT0FBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTtnQkFDQSxNQUFBLEVBQUEsTUFBQTtnQkFDQSxLQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7Ozs7Ozs7T0FPQTtJQUNBLFdBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBO1FBQUEsc0JBQUEsRUFBQSxZQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7WUFDQSxJQUFBLEVBQUEsVUFBQSxDQUFBLEdBQUE7WUFDQSxPQUFBLEVBQUEsT0FBQTtZQUNBLEtBQUEsRUFBQSxLQUFBO1lBQ0EsTUFBQSxFQUFBLE1BQUE7WUFDQSxLQUFBLEVBQUEsS0FBQTtZQUNBLE1BQUEsRUFBQSxJQUFBO1NBQ0EsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7Ozs7T0FNQTtJQUNBLFdBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUE7UUFBQSxzQkFBQSxFQUFBLFlBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxHQUFBO2dCQUNBLE9BQUEsRUFBQSxPQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2dCQUNBLE1BQUEsRUFBQSxNQUFBO2dCQUNBLEtBQUEsRUFBQSxLQUFBO2FBQ0EsQ0FBQTtRQUNBLENBQUE7UUFDQSxPQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7Ozs7T0FLQTtJQUNBLGFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQTtRQUFBLHNCQUFBLEVBQUEsWUFBQTtRQUFBLHdCQUFBLEVBQUEsWUFBQTtRQUFBLHFCQUFBLEVBQUEsU0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsS0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLEdBQUE7Z0JBQ0EsS0FBQSxFQUFBLEtBQUE7Z0JBQ0EsT0FBQSxFQUFBLE9BQUE7Z0JBQ0EsR0FBQSxFQUFBLElBQUE7YUFDQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGNBQUEsR0FBQSxVQUFBLE9BQUE7UUFDQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsT0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7ZUFDQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtRQUNBLENBQUE7SUFDQSxDQUFBO0lBRUEsY0FBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsVUFBQSxHQUFBLFVBQUEsRUFBQTtRQUFBLG1CQUFBLEVBQUEsS0FBQSxJQUFBLENBQUEsS0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLGlCQUFBLEdBQUEsVUFBQSxFQUFBO1FBQUEsbUJBQUEsRUFBQSxLQUFBLElBQUEsQ0FBQSxLQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLG9CQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsT0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsYUFBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUE7WUFDQSxJQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQTs7O09BR0E7SUFDQSxjQUFBLEdBQUEsVUFBQSxJQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsSUFBQSxVQUFBLENBQUEsR0FBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsT0FBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsSUFBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsTUFBQTtlQUNBLElBQUEsSUFBQSxVQUFBLENBQUEsR0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOzs7T0FHQTtJQUNBLFVBQUEsR0FBQSxVQUFBLFFBQUE7UUFDQSxHQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLElBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQTs7T0FFQTtJQUNBLGFBQUEsR0FBQSxVQUFBLE1BQUE7UUFBQSx1QkFBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQUEsK0JBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBO2dCQUNBLENBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7WUFDQSxDQUFBLENBQUEsQ0FBQTtZQUNBLFVBQUE7WUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0EsY0FBQSxHQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxNQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwyQkFBQSxHQUFBLFVBQUEsT0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsR0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO1lBQ0EsQ0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFFQSxvQkFBQSxHQUFBO1FBQ0EsSUFBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGVBQUEsR0FBQSxVQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsYUFBQTtJQUVBLENBQUE7SUFDQSxhQUFBO0FBQUEsQ0F2VEEsQUF1VEE7QUF0VEEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUVBLFlBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBO0FBRUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUVBLG1CQUFBLEdBQUEsRUFBQSxDQUFBO0FBSUEsY0FBQSxHQUFBLENBQUEsQ0FBQTtBQUVBLGNBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUNiQTs7R0FFQTtBQUNBLElBQUEsVUFhQTtBQWJBLFdBQUEsVUFBQTtJQUNBLHlDQUFBLENBQUE7SUFDQSxpREFBQSxDQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLHlDQUFBLENBQUE7SUFDQSxpREFBQSxDQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLDZDQUFBLENBQUE7SUFDQSwyQ0FBQSxDQUFBO0lBQ0EsMkNBQUEsQ0FBQTtJQUNBLGlEQUFBLENBQUE7SUFDQSwwQ0FBQSxDQUFBO0lBQ0EsNENBQUEsQ0FBQTtBQUNBLENBQUEsRUFiQSxVQUFBLEtBQUEsVUFBQSxRQWFBO0FBRUE7O0dBRUE7QUFDQSxJQUFBLGVBVUE7QUFWQSxXQUFBLGVBQUE7SUFDQSxtREFBQSxDQUFBO0lBQ0EsdURBQUEsQ0FBQTtJQUNBLHlEQUFBLENBQUE7SUFDQSxxREFBQSxDQUFBO0lBQ0EseURBQUEsQ0FBQTtJQUNBLDJEQUFBLENBQUE7SUFDQSw2REFBQSxDQUFBO0lBQ0EsbUVBQUEsQ0FBQTtJQUNBLGlFQUFBLENBQUE7QUFDQSxDQUFBLEVBVkEsZUFBQSxLQUFBLGVBQUEsUUFVQTtBQUVBOztHQUVBO0FBQ0EsSUFBQSxZQUtBO0FBTEEsV0FBQSxZQUFBO0lBQ0EsK0NBQUEsQ0FBQTtJQUNBLCtDQUFBLENBQUE7SUFDQSxxREFBQSxDQUFBO0lBQ0EsbURBQUEsQ0FBQSxDQUFBLEtBQUE7QUFDQSxDQUFBLEVBTEEsWUFBQSxLQUFBLFlBQUEsUUFLQTtBQ3pDQTtJQUNBLHNCQUNBLE9BQUEsRUFDQSxNQUFBO1FBREEsWUFBQSxHQUFBLE9BQUEsQ0FBQTtRQUNBLFdBQUEsR0FBQSxNQUFBLENBQUE7UUFFQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBSUEsbUNBQUEsR0FBQSxVQUFBLE9BQUE7UUFDQSxJQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsT0FBQSxHQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENB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UUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLElBQUEsRUFBQSxJQUFBO1lBQ0EsSUFBQSxJQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlDQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsSUFBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsQ0FBQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxHQUFBLE1BQUEsR0FBQSxRQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxVQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxTQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLElBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxzQkFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxJQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUE7UUFDQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLFVBQUE7Z0JBQ0EsSUFBQSxJQUFBLGtCQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsR0FBQSxHQUFBLFVBQUEsR0FBQSxhQUFBLENBQUE7Z0JBQ0EsS0FBQSxDQUFBO1lBQ0EsS0FBQSxRQUFBO2dCQUNBLElBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUEsS0FBQTtvQkFDQSxFQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTt3QkFDQSxHQUFBLElBQUEsc0JBQUEsQ0FBQTtvQkFDQSxDQUFBO29CQUNBLFFBQUEsSUFBQSxpQkFBQSxHQUFBLEdBQUEsR0FBQSxJQUFBLEdBQUEsS0FBQSxHQUFBLFdBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxJQUFBLElBQUEsZ0JBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsR0FBQSxHQUFBLEdBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQTtnQkFDQSxLQUFBLENBQUE7WUFDQSxLQUFBLE9BQUEsQ0FBQTtZQUNBLEtBQUEsVUFBQTtnQkFDQSxJQUFBLElBQUEsTUFBQSxHQUFBLElBQUEsR0FBQSxHQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBLEtBQUE7b0JBQ0EsRUFBQSxDQUFBLENBQUEsR0FBQSxJQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7d0JBQ0EsR0FBQSxJQUFBLG9CQUFBLENBQUE7b0JBQ0EsQ0FBQTtvQkFDQSxJQUFBLElBQUEsZUFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxHQUFBLElBQUEsR0FBQSxXQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7Z0JBQ0EsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxJQUFBLE9BQUEsQ0FBQTtnQkFDQSxLQUFBLENBQUE7WUFDQTtnQkFDQSxJQUFBLElBQUEsZUFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLFVBQUEsR0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO2dCQUNBLEtBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxNQUFBLENBQUEsMkJBQUEsR0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBOztPQUVBO0lBQ0Esb0NBQUEsR0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtRQUNBLElBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtRQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtZQUNBLElBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtZQUNBLElBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsaUJBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLENBQUE7Z0JBQ0EsTUFBQSxDQUFBO1lBQ0EsQ0FBQTtZQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxDQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUE7SUFDQSxDQUFBO0lBRUE7O09BRUE7SUFDQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsSUFBQSxFQUFBLE9BQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxPQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUE7b0JBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO29CQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO3dCQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7b0JBQ0EsQ0FBQTtnQkFDQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxNQUFBLENBQUE7WUFDQSxDQUFBO1lBQ0EsRUFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO2dCQUNBLElBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtnQkFDQSxPQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUE7b0JBQ0EsSUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO29CQUNBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO3dCQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7b0JBQ0EsQ0FBQTtnQkFDQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Z0JBQ0EsSUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO2dCQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQTtvQkFDQSxJQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7b0JBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsQ0FBQTtnQkFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBO2dCQUNBLE1BQUEsQ0FBQTtZQUNBLENBQUE7WUFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsT0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO1FBQ0EsQ0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsUUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUVBLGlCQUFBO0FBQUEsQ0FsTEEsQUFrTEEsQ0FsTEEsVUFBQSxHQWtMQTtBQ2xMQTtJQUFBLCtCQUFBO0lBT0EscUJBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQVhBLG1DQUFBLEdBQUE7UUFDQSxNQUFBLElBQUEsS0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxpQ0FBQSxHQUFBO1FBQ0EsTUFBQSxJQUFBLEtBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBUUEsMEJBQUEsR0FBQTtJQUVBLENBQUE7SUFHQSxrQkFBQTtBQUFBLENBbkJBLEFBbUJBLENBbkJBLFVBQUEsR0FtQkE7QUNuQkE7SUFBQSxpQ0FBQTtJQU9BLHVCQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFYQSxxQ0FBQSxHQUFBO1FBQ0EsTUFBQSxJQUFBLEtBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsbUNBQUEsR0FBQTtRQUNBLE1BQUEsSUFBQSxLQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQVFBLDRCQUFBLEdBQUE7SUFFQSxDQUFBO0lBR0Esb0JBQUE7QUFBQSxDQW5CQSxBQW1CQSxDQW5CQSxVQUFBLEdBbUJBO0FDbkJBO0lBQUEsaUNBQUE7SUFPQSx1QkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBWEEscUNBQUEsR0FBQTtRQUNBLE1BQUEsSUFBQSxLQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLG1DQUFBLEdBQUE7UUFDQSxNQUFBLElBQUEsS0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFRQSw0QkFBQSxHQUFBO0lBRUEsQ0FBQTtJQUdBLG9CQUFBO0FBQUEsQ0FuQkEsQUFtQkEsQ0FuQkEsVUFBQSxHQW1CQTtBQ25CQTtJQUFBLGdDQUFBO0lBT0Esc0JBQ0EsTUFBQSxFQUNBLEVBQUE7ZUFFQSxrQkFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQVhBLG9DQUFBLEdBQUE7UUFDQSxNQUFBLElBQUEsS0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFDQSxrQ0FBQSxHQUFBO1FBQ0EsTUFBQSxJQUFBLEtBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBUUEsMkJBQUEsR0FBQTtJQUVBLENBQUE7SUFFQSxvQ0FBQSxHQUFBO1FBQ0EsSUFBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1FBQ0EsRUFBQSxDQUFBLENBQUEsY0FBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxJQUFBLEdBQUEsR0FBQSxZQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBO1lBQ0EsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFVBQUE7Z0JBQ0EsRUFBQSxDQUFBLENBQUEsVUFBQSxLQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7b0JBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQUE7Z0JBQ0EsQ0FBQTtnQkFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsWUFBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBO29CQUNBLElBQUEsRUFBQSxRQUFBLENBQUEsT0FBQSxDQUFBLE9BQUE7b0JBQ0EsSUFBQSxFQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQTtpQkFDQSxDQUFBLENBQUE7Z0JBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUE7b0JBQ0EsUUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtnQkFDQSxDQUFBLENBQUEsQ0FBQTtZQUNBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsTUFBQSxDQUFBO1FBQ0EsQ0FBQTtRQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBR0EsbUJBQUE7QUFBQSxDQXhDQSxBQXdDQSxDQXhDQSxVQUFBLEdBd0NBO0FDeENBO0lBQUEsOEJBQUE7SUFPQSxvQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBWEEsa0NBQUEsR0FBQTtRQUNBLE1BQUEsSUFBQSxLQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQUNBLGdDQUFBLEdBQUE7UUFDQSxNQUFBLElBQUEsS0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFRQSx5QkFBQSxHQUFBO0lBRUEsQ0FBQTtJQUdBLGlCQUFBO0FBQUEsQ0FuQkEsQUFtQkEsQ0FuQkEsVUFBQSxHQW1CQTtBQ25CQTtJQUFBLDZCQUFBO0lBQ0EsbUJBQ0EsTUFBQSxFQUNBLEVBQUE7UUFGQSxZQUlBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUEsU0FJQTtRQUhBLEVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsZUFBQSxDQUFBLENBQUE7UUFDQSxDQUFBOztJQUNBLENBQUE7SUFFQSx3QkFBQSxHQUFBO0lBRUEsQ0FBQTtJQUVBLGlDQUFBLEdBQUE7UUFDQSxNQUFBLElBQUEsS0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSwrQkFBQSxHQUFBO1FBQ0EsTUFBQSxJQUFBLEtBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsbUNBQUEsR0FBQTtRQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEdBQUEsZUFBQSxDQUFBLEdBQUEsQ0FBQTtRQUNBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSw4TkFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLENBQUE7UUFDQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQTtZQUNBLElBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQTtZQUNBLEdBQUEsRUFBQSxDQUFBLEdBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQTtJQUNBLENBQUE7SUFFQSxrQ0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxRQUFBLEVBQUEsU0FBQTtRQUNBLElBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLEtBQUE7UUFDQSxNQUFBLENBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsUUFBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsS0FBQTtnQkFDQSxNQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsUUFBQSxHQUFBLEtBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxXQUFBLENBQUE7WUFDQSxLQUFBLGVBQUEsQ0FBQSxNQUFBO2dCQUNBLE1BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLFVBQUEsQ0FBQTtZQUNBLEtBQUEsZUFBQSxDQUFBLElBQUE7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEtBQUEsR0FBQSxLQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBO1lBQ0EsS0FBQSxlQUFBLENBQUEsR0FBQSxDQUFBO1lBQ0E7Z0JBQ0EsTUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUFBO1FBQ0EsQ0FBQTtJQUNBLENBQUE7SUFDQSxnQkFBQTtBQUFBLENBdkRBLEFBdURBLENBdkRBLFVBQUEsR0F1REE7QUN2REE7SUFBQSxnQ0FBQTtJQU9BLHNCQUNBLE1BQUEsRUFDQSxFQUFBO2VBRUEsa0JBQUEsTUFBQSxFQUFBLEVBQUEsQ0FBQTtJQUNBLENBQUE7SUFYQSxvQ0FBQSxHQUFBO1FBQ0EsTUFBQSxJQUFBLEtBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0Esa0NBQUEsR0FBQTtRQUNBLE1BQUEsSUFBQSxLQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0lBQ0EsQ0FBQTtJQVFBLDJCQUFBLEdBQUE7SUFFQSxDQUFBO0lBR0EsbUJBQUE7QUFBQSxDQW5CQSxBQW1CQSxDQW5CQSxVQUFBLEdBbUJBO0FDbkJBO0lBQUEsNkJBQUE7SUFDQSxtQkFDQSxNQUFBLEVBQ0EsRUFBQTtlQUVBLGtCQUFBLE1BQUEsRUFBQSxFQUFBLENBQUE7SUFDQSxDQUFBO0lBRUEsd0JBQUEsR0FBQTtRQUNBLElBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtJQUVBLENBQUE7SUFFQSxpQ0FBQSxHQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtRQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUE7SUFDQSxDQUFBO0lBQ0EsK0JBQUEsR0FBQTtRQUNBLElBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUE7UUFDQSxJQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7UUFDQSxJQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO1FBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO1FBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7UUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBO0lBQ0EsQ0FBQTtJQUdBLGdCQUFBO0FBQUEsQ0EzQkEsQUEyQkEsQ0EzQkEsVUFBQSxHQTJCQSIsImZpbGUiOiJqcXVlcnkuZGlhbG9nMS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFic3RyYWN0IGNsYXNzIEV2ZSB7XHJcbiAgICBwdWJsaWMgb3B0aW9uczogYW55O1xyXG5cclxuICAgIHB1YmxpYyBvbihldmVudDogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiB0aGlzIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnNbJ29uJyArIGV2ZW50XSA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoYXNFdmVudChldmVudDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnb24nICsgZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cmlnZ2VyKGV2ZW50OiBzdHJpbmcsIC4uLiBhcmdzOiBhbnlbXSkge1xyXG4gICAgICAgIGxldCByZWFsRXZlbnQgPSAnb24nICsgZXZlbnQ7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0V2ZW50KGV2ZW50KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbcmVhbEV2ZW50XS5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgRGlhbG9nQm94IGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgXHJcbn0iLCJhYnN0cmFjdCBjbGFzcyBEaWFsb2dDb3JlIGV4dGVuZHMgQm94IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIHB1YmxpYyBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgbmV3IERlZmF1bHREaWFsb2dPcHRpb24oKSwgb3B0aW9uKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMudHlwZSA9ICBEaWFsb2cucGFyc2VFbnVtPERpYWxvZ1R5cGU+KHRoaXMub3B0aW9ucy50eXBlLCBEaWFsb2dUeXBlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgb3B0aW9uczogRGlhbG9nT3B0aW9uO1xyXG5cclxuICAgICAgICBwcml2YXRlIF9zdGF0dXM6IERpYWxvZ1N0YXR1cyA9IERpYWxvZ1N0YXR1cy5jbG9zZWQ7XHJcblxyXG4gICAgcHVibGljIGdldCBzdGF0dXMoKTogRGlhbG9nU3RhdHVzIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc3RhdHVzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgc3RhdHVzKGFyZzogRGlhbG9nU3RhdHVzKSB7XHJcbiAgICAgICAgYXJnID0gRGlhbG9nLnBhcnNlRW51bTxEaWFsb2dTdGF0dXM+KGFyZywgRGlhbG9nU3RhdHVzKTtcclxuICAgICAgICAvLyDnm7jlkIznirbmgIHkuI3lgZrmk43kvZxcclxuICAgICAgICBpZiAodGhpcy5fc3RhdHVzID09IGFyZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9pc0xvYWRpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl90b2dnbGVMb2FkaW5nKGFyZyk7XHJcbiAgICAgICAgc3dpdGNoIChhcmcpIHtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dTdGF0dXMuc2hvdzpcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Nob3coKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ1N0YXR1cy5oaWRlOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5faGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nU3RhdHVzLmNsb3Npbmc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRpb25DbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nU3RhdHVzLmNsb3NlZDpcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IFwic3RhdHVzIGVycm9yOlwiKyBhcmc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2lzTG9hZGluZzogYm9vbGVhbiA9IGZhbHNlOyAvL+WKoOi9veS4rSDmmL7npLrml7blgJnlh7rnjrDliqDovb3liqjnlLtcclxuXHJcbiAgICBwcml2YXRlIF9sb2FkaW5nRGlhbG9nOiBEaWFsb2dFbGVtZW50O1xyXG5cclxuICAgIHB1YmxpYyBnZXQgaXNMb2FkaW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0xvYWRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBpc0xvYWRpbmcoYXJnOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5faXNMb2FkaW5nID0gYXJnO1xyXG4gICAgICAgIHRoaXMuX3RvZ2dsZUxvYWRpbmcoKTtcclxuICAgICAgICAvLyDliqDovb3lrozmiJDml7bmmL7npLrlhYPntKBcclxuICAgICAgICBpZiAoIXRoaXMuX2lzTG9hZGluZyAmJiB0aGlzLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuc2hvdykge1xyXG4gICAgICAgICAgICB0aGlzLl9zaG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RpYWxvZ0JnOiBKUXVlcnk7ICAvLyDoh6rlt7HnmoTog4zmma/pga7nvalcclxuXHJcbiAgICBwcml2YXRlIF90aW1lSGFuZGxlOiBudW1iZXI7XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yib5bu65bm25pi+56S65o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3Nob3coKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50eXBlID09IERpYWxvZ1R5cGUubm90aWZ5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZU5vdGlmeSgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLnRyaWdnZXIoJ3Nob3cnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc2hvdyBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94LnNob3coKTtcclxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBEaWFsb2dTdGF0dXMuc2hvdztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIm+W7uuW5tumakOiXj+aOp+S7tlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9oaWRlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLnRyaWdnZXIoJ2hpZGUnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaGlkZSBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94LmhpZGUoKTtcclxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBEaWFsb2dTdGF0dXMuaGlkZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWKqOeUu+WFs+mXre+8jOacieWFs+mXreWKqOeUu1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9hbmltYXRpb25DbG9zZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnR5cGUgPT0gRGlhbG9nVHlwZS5ub3RpZnkpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubm90aWZ5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeS5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuYm94KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5jbG9zaW5nIFxyXG4gICAgICAgIHx8IHRoaXMuc3RhdHVzID09IERpYWxvZ1N0YXR1cy5jbG9zZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fdGltZUhhbmRsZSkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZUhhbmRsZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3RpbWVIYW5kbGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmYWxzZSA9PSB0aGlzLnRyaWdnZXIoJ2Nsb3NpbmcnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2luZyBzdG9wIScpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IERpYWxvZ1N0YXR1cy5jbG9zaW5nO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ib3guYWRkQ2xhc3MoJ2RpYWxvZy1jbG9zaW5nJykub25lKCd3ZWJraXRBbmltYXRpb25FbmQgbW96QW5pbWF0aW9uRW5kIE1TQW5pbWF0aW9uRW5kIG9hbmltYXRpb25lbmQgYW5pbWF0aW9uZW5kJywgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLnN0YXR1cyA9PSBEaWFsb2dTdGF0dXMuY2xvc2luZykge1xyXG4gICAgICAgICAgICAgICAgLy8g6Ziy5q2i5Lit6YCU5pS55Y+Y5b2T5YmN54q25oCBXHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yig6Zmk5o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2Nsb3NlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5ib3gpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy50cmlnZ2VyKCdjbG9zZWQnKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvc2VkIHN0b3AhJyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gRGlhbG9nU3RhdHVzLmNsb3NlZDtcclxuICAgICAgICBpZiAodGhpcy5fZGlhbG9nQmcpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGlhbG9nQmcucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RpYWxvZ0JnID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBEaWFsb2cucmVtb3ZlSXRlbSh0aGlzLmlkKTsgXHJcbiAgICAgICAgdGhpcy5ib3gucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy5ib3ggPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFic3RyYWN0IGluaXQoKTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29yZSgpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLmJveCA9ICQoJzxkaXYgY2xhc3M9XCJkaWFsb2cgZGlhbG9nLScrIERpYWxvZ1R5cGVbdGhpcy5vcHRpb25zLnR5cGVdICsnXCIgZGF0YS10eXBlPVwiZGlhbG9nXCIgZGlhbG9nLWlkPScrIHRoaXMuaWQgKyc+PC9kaXY+Jyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZUNvbnRlbnQoKTogdGhpcztcclxuXHJcbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc2V0UHJvcGVydHkoKTogdGhpcztcclxuXHJcblxyXG4gICAgcHVibGljIGNzcyhrZXk6IGFueSwgdmFsdWU/OiBzdHJpbmd8IG51bWJlcik6IEpRdWVyeSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYm94LmNzcyhrZXksIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2hvdygpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IERpYWxvZ1N0YXR1cy5zaG93O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBoaWRlKCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gRGlhbG9nU3RhdHVzLmhpZGU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsb3NlKCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gRGlhbG9nU3RhdHVzLmNsb3Npbmc7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRvZ2dsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gRGlhbG9nU3RhdHVzLmhpZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICBwcml2YXRlIF9nZXRCb3R0b20oKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLmhlaWdodCgpICogLjMzIC0gdGhpcy5ib3guaGVpZ2h0KCkgLyAyLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRUb3AoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLmhlaWdodCgpIC8gMiAtIHRoaXMuYm94LmhlaWdodCgpIC8gMiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0TGVmdCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLm1heCgkKHdpbmRvdykud2lkdGgoKSAvIDIgLSB0aGlzLmJveC53aWR0aCgpIC8gMiwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UmlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoJCh3aW5kb3cpLndpZHRoKCkgLyAyIC0gdGhpcy5ib3gud2lkdGgoKSAvIDIsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFdpZHRoKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gRGlhbG9nLiR3aW5kb3cud2lkdGgoKTtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLndpZHRoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB3aWR0aCAqIHRoaXMub3B0aW9ucy53aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gRGlhbG9nLiR3aW5kb3cuaGVpZ2h0KCk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oZWlnaHQgPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoZWlnaHQgKiB0aGlzLm9wdGlvbnMuaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldExlZnRUb3AoZGlyZWN0aW9uOiBEaWFsb2dEaXJlY3Rpb24sIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBib3hXaWR0aDogbnVtYmVyLCBib3hIZWlnaHQ6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0ge1xyXG4gICAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnRUb3A6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIDBdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi50b3A6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWyhib3hIZWlnaHQgLSB3aWR0aCkgLyAyLCAwXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHRUb3A6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2JveEhlaWdodCAtIHdpZHRoLCAwXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24ucmlnaHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW2JveEhlaWdodCAtIHdpZHRoLCAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodEJvdHRvbTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbYm94SGVpZ2h0IC0gd2lkdGgsIGJveEhlaWdodCAtIGhlaWdodF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmJvdHRvbTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbKGJveEhlaWdodCAtIHdpZHRoKSAvIDIsIGJveEhlaWdodCAtIGhlaWdodF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnRCb3R0b206XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIGJveEhlaWdodCAtIGhlaWdodF07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmNlbnRlcjpcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbKGJveEhlaWdodCAtIHdpZHRoKSAvIDIsIChib3hIZWlnaHQgLSBoZWlnaHQpIC8gMl07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiY2xhc3MgRGVmYXVsdERpYWxvZ09wdGlvbiBpbXBsZW1lbnRzIERpYWxvZ09wdGlvbiB7XHJcbiAgICB0aXRsZTogc3RyaW5nID0gJ+aPkOekuic7XHJcbiAgICBleHRyYTogc3RyaW5nID0gJ2xvYWRpbmcnOyAgICAgIC8v6aKd5aSW55qEY2xhc3NcclxuICAgIGNvdW50OiBudW1iZXIgPSA1O1xyXG4gICAgdHlwZT86IERpYWxvZ1R5cGUgPSBEaWFsb2dUeXBlLnRpcDtcclxuICAgIGhhc1llczogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBoYXNObzogYm9vbGVhbiA9IHRydWU7XHJcbiAgICB0aW1lOiBudW1iZXIgPSAwO1xyXG4gICAgYnV0dG9uOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgY2FuTW92ZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICBvbmRvbmU6IEZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgfVxyXG59IiwiY2xhc3MgRGlhbG9nIHtcclxuICAgIHByaXZhdGUgc3RhdGljIF9kYXRhOiB7W2lkOiBudW1iZXJdOiBEaWFsb2dFbGVtZW50fSA9IHt9O1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9ndWlkOiBudW1iZXIgPSAwOyAvLyBpZOagh+iusFxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF90aXBEYXRhOiBBcnJheTxudW1iZXI+ID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX21lc3NhZ2VEYXRhOiBBcnJheTxudW1iZXI+ID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2RpYWxvZ0JnOiBKUXVlcnk7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX2JnTG9jazogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwdWJsaWMgc3RhdGljICR3aW5kb3cgPSAkKHdpbmRvdyk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliJvpgKDlvLnlh7rmoYZcclxuICAgICAqIEBwYXJhbSBvcHRpb24gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9wdGlvbj86IERpYWxvZ09wdGlvbik6IERpYWxvZ0VsZW1lbnQge1xyXG4gICAgICAgIGlmICghb3B0aW9uLnR5cGUpIHtcclxuICAgICAgICAgICAgb3B0aW9uLnR5cGUgPSBEaWFsb2dUeXBlLnRpcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBuZXcgRGlhbG9nRWxlbWVudChvcHRpb24pO1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcGFyc2VFbnVtPFQ+KHZhbDogYW55LCB0eXBlOiBhbnkpOiBUIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZVt2YWxdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5o+Q56S6XHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSB0aW1lIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHRpcChjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dPcHRpb24sIHRpbWU6IG51bWJlciA9IDIwMDApOiBEaWFsb2dFbGVtZW50IHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtjb250ZW50OiBjb250ZW50LCB0aW1lOiB0aW1lfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29udGVudC50eXBlID0gRGlhbG9nVHlwZS50aXA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa2iOaBr1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGltZSBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBtZXNzYWdlKGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ09wdGlvbiwgdGltZTogbnVtYmVyID0gMjAwMCk6IERpYWxvZ0VsZW1lbnQge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge2NvbnRlbnQ6IGNvbnRlbnQsIHRpbWU6IHRpbWV9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLm1lc3NhZ2U7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNvbnRlbnQpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOWKoOi9vVxyXG4gICAgICogQHBhcmFtIHRpbWUgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbG9hZGluZyh0aW1lOiBudW1iZXIgfCBEaWFsb2dPcHRpb24gPSAwKTogRGlhbG9nRWxlbWVudCB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aW1lICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRpbWUgPSB7dGltZTogdGltZX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRpbWUudHlwZSA9IERpYWxvZ1R5cGUubG9hZGluZztcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUodGltZSkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YaF5a655by556qXXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSBoYXNZZXMgXHJcbiAgICAgKiBAcGFyYW0gaGFzTm8gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY29udGVudChjb250ZW50OiBzdHJpbmcgfCBEaWFsb2dPcHRpb24sIGhhc1llcz86IGJvb2xlYW4sIGhhc05vPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgIGhhc1llczogaGFzWWVzLFxyXG4gICAgICAgICAgICAgICAgaGFzTm86IGhhc05vXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUuY29udGVudDtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUoY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pmu6YCa5by556qXXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSB0aXRsZSBcclxuICAgICAqIEBwYXJhbSBoYXNZZXMgXHJcbiAgICAgKiBAcGFyYW0gaGFzTm8gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgYm94KGNvbnRlbnQ6IHN0cmluZyB8IERpYWxvZ09wdGlvbiwgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonLCBoYXNZZXM/OiBib29sZWFuLCBoYXNObz86IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgY29udGVudCA9IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgICAgICBoYXNZZXM6IGhhc1llcyxcclxuICAgICAgICAgICAgICAgIGhhc05vOiBoYXNOb1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb250ZW50LnR5cGUgPSBEaWFsb2dUeXBlLmJveDtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUoY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6KGo5qC85by556qXXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSB0aXRsZSBcclxuICAgICAqIEBwYXJhbSBkb25lIFxyXG4gICAgICogQHBhcmFtIGhhc1llcyBcclxuICAgICAqIEBwYXJhbSBoYXNObyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBmcm9tKGNvbnRlbnQ6IGFueSwgdGl0bGU6IHN0cmluZyA9ICfmj5DnpLonLCBkb25lPzogRnVuY3Rpb24sIGhhc1llcz86IGJvb2xlYW4sIGhhc05vPzogYm9vbGVhbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIHR5cGU6IERpYWxvZ1R5cGUuYm94LFxyXG4gICAgICAgICAgICBjb250ZW50OiBjb250ZW50LFxyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIGhhc1llczogaGFzWWVzLFxyXG4gICAgICAgICAgICBoYXNObzogaGFzTm8sXHJcbiAgICAgICAgICAgIG9uZG9uZTogZG9uZVxyXG4gICAgICAgIH0pLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOmhtemdouW8ueeql1xyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gaGFzWWVzIFxyXG4gICAgICogQHBhcmFtIGhhc05vIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIHBhZ2UoY29udGVudDogc3RyaW5nIHwgRGlhbG9nT3B0aW9uLCB0aXRsZTogc3RyaW5nID0gJ+aPkOekuicsIGhhc1llcz86IGJvb2xlYW4sIGhhc05vPzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBjb250ZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcclxuICAgICAgICAgICAgICAgIGhhc1llczogaGFzWWVzLFxyXG4gICAgICAgICAgICAgICAgaGFzTm86IGhhc05vXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnRlbnQudHlwZSA9IERpYWxvZ1R5cGUucGFnZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGUoY29udGVudCkuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qGM6Z2i5o+Q6YaSXHJcbiAgICAgKiBAcGFyYW0gdGl0bGUgXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBcclxuICAgICAqIEBwYXJhbSBpY29uIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIG5vdGlmeSh0aXRsZTogc3RyaW5nICB8IERpYWxvZ09wdGlvbiA9ICfpgJrnn6UnLCBjb250ZW50OiBzdHJpbmcgPSAnJywgaWNvbjogc3RyaW5nID0gJycpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRpdGxlICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHRpdGxlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcclxuICAgICAgICAgICAgICAgIGljbzogaWNvblxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aXRsZS50eXBlID0gRGlhbG9nVHlwZS5ub3RpZnk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKHRpdGxlKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDlvLnlh7rmoYZcclxuICAgICAqIEBwYXJhbSBlbGVtZW50IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGFkZEl0ZW0oZWxlbWVudDogRGlhbG9nRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuX2RhdGFbKyt0aGlzLl9ndWlkXSA9IGVsZW1lbnQ7XHJcbiAgICAgICAgZWxlbWVudC5pZCA9IHRoaXMuX2d1aWQ7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQub3B0aW9ucy50eXBlID09IERpYWxvZ1R5cGUubWVzc2FnZSkge1xyXG4gICAgICAgICAgICBlbGVtZW50Lm9wdGlvbnMueSA9IHRoaXMuZ2V0TWVzc2FnZVRvcCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlRGF0YS5wdXNoKGVsZW1lbnQuaWQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9uZWVkQmcoZWxlbWVudC5vcHRpb25zLnR5cGUpIFxyXG4gICAgICAgICYmICFlbGVtZW50Lm9wdGlvbnMudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0JnKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaGFzSXRlbShpZDogbnVtYmVyIHwgc3RyaW5nID0gdGhpcy5fZ3VpZCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhLmhhc093blByb3BlcnR5KGlkICsgJycpXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXQoaWQ6IG51bWJlciB8IHN0cmluZyA9IHRoaXMuX2d1aWQpIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IFwiZXJyb3I6XCIgKyBpZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagueaNrmlk5Yig6Zmk5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gaWQgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlSXRlbShpZDogbnVtYmVyID0gdGhpcy5fZ3VpZCkge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RhdGFbaWRdLmNsb3NlKCk7XHJcbiAgICAgICAgdGhpcy5zb3J0TWVzc2FnZUFuZERlbGV0ZSh0aGlzLl9kYXRhW2lkXSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX25lZWRCZyh0aGlzLl9kYXRhW2lkXS5vcHRpb25zLnR5cGUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VCZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgdGhpcy5fZGF0YVtpZF07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKDpmaTmiYDmnInlvLnlh7rmoYZcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyByZW1vdmUoKSB7XHJcbiAgICAgICAgdGhpcy5tYXAoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICBpdGVtLmNsb3NlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDliKTmlq3mmK/lkKbpnIDopoHkvb/nlKjpga7nvalcclxuICAgICAqIEBwYXJhbSB0eXBlIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfbmVlZEJnKHR5cGU6IERpYWxvZ1R5cGUgfCBzdHJpbmcgfCBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdHlwZSAhPSBEaWFsb2dUeXBlLnRpcCBcclxuICAgICAgICAmJiB0eXBlICE9IERpYWxvZ1R5cGUubWVzc2FnZVxyXG4gICAgICAgICYmIHR5cGUgIT0gRGlhbG9nVHlwZS5wYWdlIFxyXG4gICAgICAgICYmIHR5cGUgIT0gRGlhbG9nVHlwZS5ub3RpZnlcclxuICAgICAgICAmJiB0eXBlICE9IERpYWxvZ1R5cGUucG9wO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5b6q546v5omA5pyJ5by55Ye65qGGXHJcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgbWFwKGNhbGxiYWNrOiAoaXRlbTogRGlhbG9nRWxlbWVudCkgPT4gYW55KSB7XHJcbiAgICAgICAgZm9yKGxldCBpZCBpbiB0aGlzLl9kYXRhKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNJdGVtKGlkKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGNhbGxiYWNrKHRoaXMuX2RhdGFbaWRdKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pi+56S66YGu572pXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgc2hvd0JnKHRhcmdldDogSlF1ZXJ5ID0gJChkb2N1bWVudC5ib2R5KSkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9kaWFsb2dCZykge1xyXG4gICAgICAgICAgICB0aGlzLl9kaWFsb2dCZyA9ICQoJzxkaXYgY2xhc3M9XCJkaWFsb2ctYmdcIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgdGhpcy5fZGlhbG9nQmcuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGluc3RhbmNlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8g5pu05pS56YGu572p55qE5L2N572uXHJcbiAgICAgICAgICAgIHRhcmdldC5hcHBlbmQodGhpcy5fZGlhbG9nQmcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9iZ0xvY2sgKys7XHJcbiAgICAgICAgdGhpcy5fZGlhbG9nQmcuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6ZqQ6JeP6YGu572pXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgY2xvc2VCZygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2RpYWxvZ0JnKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYmdMb2NrLS07XHJcbiAgICAgICAgaWYgKHRoaXMuX2JnTG9jayA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kaWFsb2dCZy5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBzb3J0TWVzc2FnZUFuZERlbGV0ZShlbGVtZW50OiBEaWFsb2dFbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQub3B0aW9ucy50eXBlICE9IERpYWxvZ1R5cGUubWVzc2FnZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpID0gdGhpcy5fbWVzc2FnZURhdGEuaW5kZXhPZihlbGVtZW50LmlkKTtcclxuICAgICAgICBpZiAoaSA8IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tZXNzYWdlRGF0YS5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgbGV0IHkgPSBlbGVtZW50Lm9wdGlvbnMueTtcclxuICAgICAgICBmb3IoOyBpIDwgdGhpcy5fbWVzc2FnZURhdGEubGVuZ3RoOyBpICsrKSB7XHJcbiAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5fZGF0YVt0aGlzLl9tZXNzYWdlRGF0YVtpXV07XHJcbiAgICAgICAgICAgIGl0ZW0uY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XHJcbiAgICAgICAgICAgIGl0ZW0ub3B0aW9ucy55ID0geTtcclxuICAgICAgICAgICAgeSArPSBpdGVtLmVsZW1lbnQuaGVpZ2h0KCkgKyAyMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRNZXNzYWdlVG9wKCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMuX21lc3NhZ2VEYXRhLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpdGVtID0gdGhpcy5fZGF0YVt0aGlzLl9tZXNzYWdlRGF0YVtsZW5ndGggLSAxXV07XHJcbiAgICAgICAgcmV0dXJuIGl0ZW0ub3B0aW9ucy55ICsgaXRlbS5lbGVtZW50LmhlaWdodCgpICArIDIwO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgcmVnaXN0ZXIodHlwZTogRGlhbG9nVHlwZSwgZGlhbG9nOiBEaWFsb2dDb3JlLCBkZWZhdWx0T3B0aW9uOiBEaWFsb2dPcHRpb24pIHtcclxuICAgICAgICBcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiDlvLnlh7rmoYbnsbvlnotcclxuICovXHJcbmVudW0gRGlhbG9nVHlwZSB7XHJcbiAgICB0aXAsXHJcbiAgICBtZXNzYWdlLFxyXG4gICAgbm90aWZ5LFxyXG4gICAgcG9wLFxyXG4gICAgbG9hZGluZyxcclxuICAgIHNlbGVjdCxcclxuICAgIGltYWdlLFxyXG4gICAgZGlzayxcclxuICAgIGZvcm0sXHJcbiAgICBjb250ZW50LFxyXG4gICAgYm94LFxyXG4gICAgcGFnZVxyXG59XHJcblxyXG4vKipcclxuICog5by55Ye65qGG5L2N572uXHJcbiAqL1xyXG5lbnVtIERpYWxvZ0RpcmVjdGlvbiB7XHJcbiAgICB0b3AsXHJcbiAgICByaWdodCxcclxuICAgIGJvdHRvbSxcclxuICAgIGxlZnQsXHJcbiAgICBjZW50ZXIsXHJcbiAgICBsZWZ0VG9wLFxyXG4gICAgcmlnaHRUb3AsXHJcbiAgICByaWdodEJvdHRvbSxcclxuICAgIGxlZnRCb3R0b21cclxufVxyXG5cclxuLyoqXHJcbiAqIOW8ueWHuuahhueKtuaAgVxyXG4gKi9cclxuZW51bSBEaWFsb2dTdGF0dXMge1xyXG4gICAgaGlkZSxcclxuICAgIHNob3csXHJcbiAgICBjbG9zaW5nLCAgIC8v5YWz6Zet5LitXHJcbiAgICBjbG9zZWQgICAgLy/lt7LlhbPpl61cclxufSIsImNsYXNzIERpYWxvZ1BsdWdpbiB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgZWxlbWVudDogSlF1ZXJ5LFxyXG4gICAgICAgIHB1YmxpYyBvcHRpb24/OiBEaWFsb2dPcHRpb25cclxuICAgICkge1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIWluc3RhbmNlLmRpYWxvZykge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuZGlhbG9nID0gRGlhbG9nLmNyZWF0ZShpbnN0YW5jZS5fcGFyc2VPcHRpb24oJCh0aGlzKSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluc3RhbmNlLmRpYWxvZy5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRpYWxvZzogRGlhbG9nRWxlbWVudDtcclxuXHJcbiAgICBwcml2YXRlIF9wYXJzZU9wdGlvbihlbGVtZW50OiBKUXVlcnkpIHtcclxuICAgICAgICBsZXQgb3B0aW9uOiBEaWFsb2dPcHRpb24gPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb24pO1xyXG4gICAgICAgIG9wdGlvbi50eXBlID0gZWxlbWVudC5hdHRyKCdkaWFsb2ctdHlwZScpIHx8IHRoaXMub3B0aW9uLnR5cGU7XHJcbiAgICAgICAgb3B0aW9uLmNvbnRlbnQgPSBlbGVtZW50LmF0dHIoJ2RpYWxvZy1jb250ZW50JykgfHwgdGhpcy5vcHRpb24uY29udGVudDtcclxuICAgICAgICBvcHRpb24udXJsID0gZWxlbWVudC5hdHRyKCdkaWFsb2ctdXJsJykgfHwgdGhpcy5vcHRpb24udXJsO1xyXG4gICAgICAgIG9wdGlvbi50aW1lID0gcGFyc2VJbnQoZWxlbWVudC5hdHRyKCdkaWFsb2ctdGltZScpKSB8fCB0aGlzLm9wdGlvbi50aW1lO1xyXG4gICAgICAgIHJldHVybiBvcHRpb247XHJcbiAgICB9XHJcbn1cclxuXHJcbjsoZnVuY3Rpb24oJDogYW55KSB7XHJcbiAgICAkLmZuLmRpYWxvZyA9IGZ1bmN0aW9uKG9wdGlvbiA/OiBEaWFsb2dPcHRpb24pIHtcclxuICAgICAgICByZXR1cm4gbmV3IERpYWxvZ1BsdWdpbih0aGlzLCBvcHRpb24pO1xyXG4gICAgfTtcclxufSkoalF1ZXJ5KTsiLCJjbGFzcyBEaWFsb2dDb250ZW50IGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgXHJcbn0iLCJjbGFzcyBEaWFsb2dEaXNrIGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgXHJcbn0iLCJjbGFzcyBEaWFsb2dGb3JtIGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9kYXRhOiB7W25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOihqOWNleaVsOaNrlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGRhdGEoKToge1tuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXX0ge1xyXG4gICAgICAgIGlmICghdGhpcy5fZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZ2V0Rm9ybURhdGEoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZWxlbWVudHM6IHtbbmFtZTogc3RyaW5nXTogSlF1ZXJ5fTtcclxuICAgIC8qKlxyXG4gICAgICog6KGo5Y2V5o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgZWxlbWVudHMoKToge1tuYW1lOiBzdHJpbmddOiBKUXVlcnl9IHtcclxuICAgICAgICBpZiAoIXRoaXMuX2VsZW1lbnRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzID0gdGhpcy5fZ2V0Rm9ybUVsZW1lbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0KCkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVGb3JtKGRhdGE6IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhICE9ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKG5hbWU6IHN0cmluZywgaXRlbTogYW55KSB7XHJcbiAgICAgICAgICAgIGh0bWwgKz0gaW5zdGFuY2UuX2NyZWF0ZUlucHV0KG5hbWUsIGl0ZW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBodG1sO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZUlucHV0KG5hbWU6IHN0cmluZywgZGF0YTogYW55KTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodHlwZW9mIGRhdGEgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgZGF0YSA9IHtsYWJlbDogZGF0YX07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGF0YS50eXBlKSB7XHJcbiAgICAgICAgICAgIGRhdGEudHlwZSA9ICFkYXRhLml0ZW0gPyAndGV4dCcgOiAnc2VsZWN0JztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGF0dHIgPSAnJztcclxuICAgICAgICBsZXQgaHRtbCA9ICcnO1xyXG4gICAgICAgIGxldCBkZWZhdWx0VmFsID0gJyc7XHJcbiAgICAgICAgaWYgKGRhdGEuZGVmYXVsdCkge1xyXG4gICAgICAgICAgICBkZWZhdWx0VmFsID0gZGF0YS5kZWZhdWx0VmFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5sYWJlbCkge1xyXG4gICAgICAgICAgICBodG1sICs9ICc8bGFiZWw+JytkYXRhLmxhYmVsKyc8L2xhYmVsPic7IFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5pZCkge1xyXG4gICAgICAgICAgICBhdHRyICs9ICcgaWQ9XCInK2RhdGEuaWQrJ1wiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRhdGEuY2xhc3MpIHtcclxuICAgICAgICAgICAgYXR0ciArPSAnIGNsYXNzPVwiJytkYXRhLmNsYXNzKydcIic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkYXRhLnJlcXVpcmVkKSB7XHJcbiAgICAgICAgICAgIGF0dHIgKz0gJyByZXF1aXJlZD1cInJlcXVpcmVkXCInO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGF0YS5wbGFjZWhvbGRlcikge1xyXG4gICAgICAgICAgICBhdHRyICs9ICcgcGxhY2Vob2xkZXI9XCInK2RhdGEucGxhY2Vob2xkZXIrJ1wiJztcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoIChkYXRhLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSAndGV4dGFyZWEnOlxyXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPHRleHRhcmVhIG5hbWU9XCInK25hbWUrJ1wiICcrYXR0cisnPicrZGVmYXVsdFZhbCsnPC90ZXh0YXJlYT4nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XHJcbiAgICAgICAgICAgICAgICBsZXQgb3B0aW9uID0gJyc7XHJcbiAgICAgICAgICAgICAgICAkLmVhY2goZGF0YS5pdGVtLCBmdW5jdGlvbih2YWwsIGxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbCA9PSBkZWZhdWx0VmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCArPSAnXCIgc2VsZWN0ZWQ9XCJzZWxlY3RlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbiArPSAnPG9wdGlvbiB2YWx1ZT1cIicrdmFsKydcIj4nK2xhYmVsKyc8L29wdGlvbj4nO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8c2VsZWN0IG5hbWU9XCInK25hbWUrJ1wiICcrYXR0cisnPicrb3B0aW9uKyc8c2VsZWN0Pic7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAncmFkaW8nOlxyXG4gICAgICAgICAgICBjYXNlICdjaGVja2JveCc6XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2JythdHRyKyc+J1xyXG4gICAgICAgICAgICAgICAgJC5lYWNoKGRhdGEuaXRlbSwgZnVuY3Rpb24odmFsLCBsYWJlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWwgPT0gZGVmYXVsdFZhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWwgKz0gJ1wiIGNoZWNrZWQ9XCJjaGVja2VkJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPGlucHV0IHR5cGU9XCInK2RhdGEudHlwZSsnXCIgbmFtZT1cIicrbmFtZSsnXCIgdmFsdWU9XCInK3ZhbCsnXCI+JyArIGxhYmVsO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2Pic7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxpbnB1dCB0eXBlPVwiJytkYXRhLnR5cGUrJ1wiIG5hbWU9XCInK25hbWUrJ1wiICcrYXR0cisnIHZhbHVlPVwiJytkZWZhdWx0VmFsKydcIj4nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwXCI+JytodG1sKyc8L2Rpdj4nO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6KGo5Y2V5o6n5Lu2XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2dldEZvcm1FbGVtZW50KCk6e1tuYW1lOnN0cmluZ106IEpRdWVyeX0ge1xyXG4gICAgICAgIGxldCBlbGVtZW50cyA9IHt9O1xyXG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ib3guZmluZCgnaW5wdXQsc2VsZWN0LHRleHRhcmVhLGJ1dHRvbicpLmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICBsZXQgbmFtZSA9IGl0ZW0uYXR0cignbmFtZScpO1xyXG4gICAgICAgICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWl0ZW0uaXMoJ1t0eXBlPXJpZGlvXScpICYmICFpdGVtLmlzKCdbdHlwZT1jaGVja2JveF0nKSAmJiBuYW1lLmluZGV4T2YoJ1tdJykgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50c1tuYW1lXSA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFlbGVtZW50cy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudHNbbmFtZV0gPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnRzW25hbWVdLnB1c2goZWxlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZWxlbWVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5booajljZXmlbDmja5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfZ2V0Rm9ybURhdGEoKToge1tuYW1lOiBzdHJpbmddOiBhbnl9IHtcclxuICAgICAgICBsZXQgZm9ybURhdGEgPSB7fTtcclxuICAgICAgICAkLmVhY2godGhpcy5lbGVtZW50cywgZnVuY3Rpb24obmFtZTogc3RyaW5nLCBlbGVtZW50OiBKUXVlcnkpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXMoJ1t0eXBlPXJpZGlvXScpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uYXR0cignY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhW25hbWVdID0gaXRlbS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pcygnW3R5cGU9Y2hlY2tib3hdJykpIHtcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmVhY2goZnVuY3Rpb24oaSwgZWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSAkKGVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uYXR0cignY2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKGl0ZW0udmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGFbbmFtZV0gPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuYW1lLmluZGV4T2YoJ1tdJykgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5lYWNoKGZ1bmN0aW9uKGksIGVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtID0gJChlbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChpdGVtLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZm9ybURhdGFbbmFtZV0gPSBkYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvcm1EYXRhW25hbWVdID0gZWxlbWVudC52YWwoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZm9ybURhdGE7XHJcbiAgICB9XHJcbiAgICBcclxufSIsImNsYXNzIERpYWxvZ0ltYWdlIGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgXHJcbn0iLCJjbGFzcyBEaWFsb2dMb2FkaW5nIGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgXHJcbn0iLCJjbGFzcyBEaWFsb2dNZXNzYWdlIGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcbiAgICBwcm90ZWN0ZWQgY3JlYXRlQ29udGVudCgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG9wdGlvbjogRGlhbG9nT3B0aW9uLFxyXG4gICAgICAgIGlkPzogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcihvcHRpb24sIGlkKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgXHJcbn0iLCJjbGFzcyBEaWFsb2dOb3RpZnkgZXh0ZW5kcyBEaWFsb2dDb3JlIHtcclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xyXG4gICAgfVxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgb3B0aW9uOiBEaWFsb2dPcHRpb24sXHJcbiAgICAgICAgaWQ/OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbiwgaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0KCkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVOb3RpZnkoKSB7XHJcbiAgICAgICAgbGV0IGluc3RhbmNlID0gdGhpcztcclxuICAgICAgICBpZiAoXCJOb3RpZmljYXRpb25cIiBpbiB3aW5kb3cpIHtcclxuICAgICAgICAgICAgbGV0IGFzayA9IE5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpO1xyXG4gICAgICAgICAgICBhc2sudGhlbihwZXJtaXNzaW9uID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChwZXJtaXNzaW9uICE9PSBcImdyYW50ZWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmgqjnmoTmtY/op4jlmajmlK/mjIHkvYbmnKrlvIDlkK/moYzpnaLmj5DphpLvvIEnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW5zdGFuY2Uubm90aWZ5ID0gbmV3IE5vdGlmaWNhdGlvbihpbnN0YW5jZS5vcHRpb25zLnRpdGxlLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9keTogaW5zdGFuY2Uub3B0aW9ucy5jb250ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGljb246IGluc3RhbmNlLm9wdGlvbnMuaWNvLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5ub3RpZnkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS50cmlnZ2VyKCdkb25lJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coJ+aCqOeahOa1j+iniOWZqOS4jeaUr+aMgeahjOmdouaPkOmGku+8gScpO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG59IiwiY2xhc3MgRGlhbG9nUGFnZSBleHRlbmRzIERpYWxvZ0NvcmUge1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIFxyXG59IiwiY2xhc3MgRGlhbG9nUG9wIGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9IERpYWxvZy5wYXJzZUVudW08RGlhbG9nRGlyZWN0aW9uPih0aGlzLm9wdGlvbnMuZGlyZWN0aW9uLCBEaWFsb2dEaXJlY3Rpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaW5pdCgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByb3RlY3RlZCBzZXRQcm9wZXJ0eSgpOiB0aGlzIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9zZXRQb3BQcm9wZXJ0eSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmRpcmVjdGlvbiA9IERpYWxvZ0RpcmVjdGlvbi50b3A7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYm94LmFkZENsYXNzKCdkaWFsb2ctcG9wLScgKyBEaWFsb2dEaXJlY3Rpb25bdGhpcy5vcHRpb25zLmRpcmVjdGlvbl0pO1xyXG4gICAgICAgIGxldCBvZmZlc3QgPSB0aGlzLm9wdGlvbnMudGFyZ2V0Lm9mZnNldCgpO1xyXG4gICAgICAgIGxldCBbeCwgeV0gPSB0aGlzLl9nZXRQb3BMZWZ0VG9wKERpYWxvZy5wYXJzZUVudW08RGlhbG9nRGlyZWN0aW9uPih0aGlzLm9wdGlvbnMuZGlyZWN0aW9uLCBEaWFsb2dFbGVtZW50KSwgdGhpcy5ib3gub3V0ZXJXaWR0aCgpLCB0aGlzLmJveC5vdXRlckhlaWdodCgpLCBvZmZlc3QubGVmdCwgb2ZmZXN0LnRvcCwgdGhpcy5vcHRpb25zLnRhcmdldC5vdXRlcldpZHRoKCksIHRoaXMub3B0aW9ucy50YXJnZXQub3V0ZXJIZWlnaHQoKSk7XHJcbiAgICAgICAgdGhpcy5ib3guY3NzKHtcclxuICAgICAgICAgICAgbGVmdDogeCArICdweCcsXHJcbiAgICAgICAgICAgIHRvcDogeSArICdweCdcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRQb3BMZWZ0VG9wKGRpcmVjdGlvbjogRGlhbG9nRGlyZWN0aW9uLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIGJveFdpZHRoOiBudW1iZXIsIGJveEhlaWdodDogbnVtYmVyKTogW251bWJlciwgbnVtYmVyXSB7XHJcbiAgICAgICAgbGV0IHNwYWNlID0gMzA7IC8vIOepuumamVxyXG4gICAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLnJpZ2h0VG9wOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBbeCArIGJveFdpZHRoICsgc3BhY2UsIHkgKyAoYm94SGVpZ2h0IC0gaGVpZ2h0KSAvIDJdO1xyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5yaWdodEJvdHRvbTpcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24uYm90dG9tOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFt4ICsgKGJveFdpZHRoIC0gd2lkdGgpIC8gMiwgIHkgKyBib3hIZWlnaHQgKyBzcGFjZV07XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnRCb3R0b206XHJcbiAgICAgICAgICAgIGNhc2UgRGlhbG9nRGlyZWN0aW9uLmxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ggLSB3aWR0aCAtIHNwYWNlLCB5ICsgKGJveEhlaWdodCAtIGhlaWdodCkgLyAyXTtcclxuICAgICAgICAgICAgY2FzZSBEaWFsb2dEaXJlY3Rpb24uY2VudGVyOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi5sZWZ0VG9wOlxyXG4gICAgICAgICAgICBjYXNlIERpYWxvZ0RpcmVjdGlvbi50b3A6XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gW3ggKyAoYm94V2lkdGggLSB3aWR0aCkgLyAyLCB5IC0gaGVpZ2h0IC0gc3BhY2VdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImNsYXNzIERpYWxvZ1NlbGVjdCBleHRlbmRzIERpYWxvZ0NvcmUge1xyXG4gICAgcHJvdGVjdGVkIGNyZWF0ZUNvbnRlbnQoKTogdGhpcyB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgc2V0UHJvcGVydHkoKTogdGhpcyB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIFxyXG59IiwiY2xhc3MgRGlhbG9nVGlwIGV4dGVuZHMgRGlhbG9nQ29yZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBvcHRpb246IERpYWxvZ09wdGlvbixcclxuICAgICAgICBpZD86IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIob3B0aW9uLCBpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVDb3JlKCkuY3JlYXRlQ29udGVudCgpLnNldFByb3BlcnR5KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBjcmVhdGVDb250ZW50KCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMuYm94LnRleHQodGhpcy5vcHRpb25zLmNvbnRlbnQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIHNldFByb3BlcnR5KCk6IHRoaXMge1xyXG4gICAgICAgIGxldCB0YXJnZXQgPSB0aGlzLm9wdGlvbnMudGFyZ2V0IHx8IERpYWxvZy4kd2luZG93O1xyXG4gICAgICAgIGxldCBtYXhXaWR0aCA9IHRhcmdldC53aWR0aCgpO1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuYm94LndpZHRoKCk7XHJcbiAgICAgICAgdGhpcy5jc3MoJ2xlZnQnLCAobWF4V2lkdGggLSB3aWR0aCkgLyAyICsgJ3B4Jyk7XHJcbiAgICAgICAgdGFyZ2V0LmFwcGVuZCh0aGlzLmJveCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
