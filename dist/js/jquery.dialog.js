var DialogType;
(function (DialogType) {
    DialogType[DialogType["tip"] = 0] = "tip";
    DialogType[DialogType["message"] = 1] = "message";
    DialogType[DialogType["notify"] = 2] = "notify";
    DialogType[DialogType["pop"] = 3] = "pop";
    DialogType[DialogType["loading"] = 4] = "loading";
    DialogType[DialogType["form"] = 5] = "form";
    DialogType[DialogType["content"] = 6] = "content";
    DialogType[DialogType["box"] = 7] = "box";
    DialogType[DialogType["page"] = 8] = "page";
})(DialogType || (DialogType = {}));
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
var DialogElement = (function () {
    function DialogElement(option, id) {
        this.id = id;
        this.data = {};
        this.elements = {};
        this._isClosing = false;
        this._isShow = false;
        this.option = $.extend({}, new DefaultDialogOption(), option);
        this.option.type = Dialog.parseEnum(this.option.type, DialogType);
        if (this.option.type == DialogType.notify) {
            this._createNotify();
            return;
        }
        if (this.option.direction) {
            this.option.direction = Dialog.parseEnum(this.option.direction, DialogDirection);
        }
        Dialog.addItem(this);
        this._createBg();
        this.init();
    }
    Object.defineProperty(DialogElement.prototype, "isShow", {
        get: function () {
            return this._isShow;
        },
        set: function (arg) {
            if (!this.element) {
                return;
            }
            this._isShow = arg;
            if (this.isShow) {
                this.element.show();
                return;
            }
            this.element.hide();
        },
        enumerable: true,
        configurable: true
    });
    DialogElement.prototype.init = function () {
        if (!this.option.content && this.option.url) {
            this.toggleLoading(true);
            var instance_1 = this;
            $.get(this.option.url, function (html) {
                instance_1.toggleLoading(false);
                instance_1.option.content = html;
                instance_1.init();
            });
            return;
        }
        this._createElement();
    };
    DialogElement.prototype._createElement = function (type) {
        if (type === void 0) { type = this.option.type; }
        this._createNewElement(type);
        this._bindEvent();
        this._setProperty();
        this._isShow = true;
        return this.element;
    };
    DialogElement.prototype._createNewElement = function (type) {
        if (type === void 0) { type = this.option.type; }
        var typeStr = DialogType[type];
        this.element = $('<div class="dialog dialog-' + typeStr + '" data-type="dialog"></div>');
        this._addHtml();
        if (this.option.width) {
            this.element.width(this._getWidth());
        }
        if (this.option.height) {
            this.element.height(this._getHeight());
        }
        if (this.option.target
            && this.option.type != DialogType.pop) {
            this.option.target.append(this.element);
            this.element.addClass("dialog-private");
        }
        else {
            $(document.body).append(this.element);
        }
    };
    DialogElement.prototype._addHtml = function () {
        switch (this.option.type) {
            case DialogType.box:
            case DialogType.form:
            case DialogType.page:
                this.element.html(this._getHeader() + this._getContent() + this._getFooter());
                break;
            case DialogType.content:
                this.element.html(this._getContent() + this._getFooter());
                break;
            case DialogType.loading:
                this.element.html(this._getLoading());
                break;
            case DialogType.tip:
            case DialogType.message:
            case DialogType.pop:
            default:
                this.element.text(this.option.content);
                break;
        }
    };
    DialogElement.prototype._setProperty = function () {
        if (this.option.type == DialogType.page
            || this.option.type == DialogType.content) {
            return;
        }
        if (this.option.type == DialogType.message) {
            this.css('top', this.option.y + 'px');
            return;
        }
        if (this.option.type == DialogType.pop) {
            this._setPopProperty();
            return;
        }
        var target = this.option.target || Dialog.$window;
        var maxWidth = target.width();
        var width = this.element.width();
        if (this.option.type == DialogType.tip) {
            this.css('left', (maxWidth - width) / 2 + 'px');
            return;
        }
        var maxHeight = target.height();
        var height = this.element.height();
        if (this.option.direction) {
            var _a = this._getLeftTop(Dialog.parseEnum(this.option.direction, DialogDirection), width, height, maxWidth, maxHeight), x = _a[0], y = _a[1];
            this.css({
                left: x + 'px',
                top: y + 'px'
            });
            return;
        }
        if (maxWidth > width && maxHeight > height) {
            this.css({
                left: (maxWidth - width) / 2 + 'px',
                top: (maxHeight - height) / 2 + 'px'
            });
            return;
        }
        this.option.type = DialogType.page;
        this.element.addClass("dialog-page");
    };
    DialogElement.prototype._bindEvent = function () {
        this.element.click(function (e) {
            e.stopPropagation();
        });
        if (this.option.type == DialogType.message
            || this.option.type == DialogType.tip
            || this.option.type == DialogType.loading) {
            this._addTime();
            return;
        }
        if (this.option.hasYes) {
            this.onClick(".dialog-yes", function () {
                this._getFormElement();
                this._getFormData();
                this.trigger('done');
            });
        }
        if (this.option.type == DialogType.box
            || this.option.type == DialogType.form
            || this.option.type == DialogType.page
            || this.option.hasNo) {
            this.onClick(".dialog-close", function () {
                this.close();
            });
        }
        if (this.option.type == DialogType.page) {
            this.onClick(".dialog-header .fa-arrow-left", function () {
                this.close();
            });
        }
        var instance = this;
        if (this.option.canMove
            && (this.option.type == DialogType.box
                || this.option.type == DialogType.form)) {
            // 点击标题栏移动
            var isMove_1 = false;
            var x_1, y_1;
            this.element.find(".dialog-header .dialog-title").mousedown(function (e) {
                isMove_1 = true;
                x_1 = e.pageX - parseInt(instance.element.css('left'));
                y_1 = e.pageY - parseInt(instance.element.css('top'));
                instance.element.fadeTo(20, .5);
            });
            $(document).mousemove(function (e) {
                if (!isMove_1) {
                    return;
                }
                instance.element.css({
                    top: e.pageY - y_1,
                    left: e.pageX - x_1
                });
            }).mouseup(function () {
                isMove_1 = false;
                instance.element.fadeTo('fast', 1);
            });
        }
    };
    DialogElement.prototype._addTime = function () {
        if (this.option.time <= 0) {
            return;
        }
        var instance = this;
        this._timeHandle = setTimeout(function () {
            instance._timeHandle = undefined;
            instance.close();
        }, this.option.time);
    };
    DialogElement.prototype.onClick = function (tag, callback) {
        var instance = this;
        this.element.on('click', tag, function (e) {
            callback.call(instance, $(this));
        });
    };
    DialogElement.prototype._createNotify = function () {
        var instance = this;
        if ("Notification" in window) {
            var ask = Notification.requestPermission();
            ask.then(function (permission) {
                if (permission !== "granted") {
                    console.log('您的浏览器支持但未开启桌面提醒！');
                }
                instance.notify = new Notification(instance.option.title, {
                    body: instance.option.content,
                    icon: instance.option.ico,
                });
                instance.notify.addEventListener("click", function (event) {
                    instance.trigger('done');
                });
            });
            return;
        }
        console.log('您的浏览器不支持桌面提醒！');
    };
    DialogElement.prototype._getLoading = function () {
        var html = '';
        var num = this.option.count;
        for (; num > 0; num--) {
            html += '<span></span>';
        }
        return '<div class="' + this.option.extra + '">' + html + '</div>';
    };
    /**
     * 创建私有的遮罩
     */
    DialogElement.prototype._createBg = function () {
        if (!this.option.target
            || this.option.type == DialogType.pop) {
            return;
        }
        var instance = this;
        this._dialogBg = $('<div class="dialog-bg dialog-bg-private"></div>');
        this._dialogBg.click(function (e) {
            e.stopPropagation();
            instance.close();
        });
        this.option.target.append(this._dialogBg);
    };
    DialogElement.prototype._getHeader = function (title, hasClose, hasBack, ico) {
        if (title === void 0) { title = this.option.title; }
        if (hasClose === void 0) { hasClose = true; }
        var html = '<div class="dialog-header">';
        if (hasBack || this.option.type == DialogType.page) {
            html += '<i class="fa fa-arrow-left"></i>';
        }
        html += '<div class="dialog-title">';
        if (ico) {
            html += '<i class="fa fa-' + ico + '"></i>';
        }
        html += this.option.title + '</div>';
        if (hasClose) {
            html += '<i class="fa fa-close dialog-close"></i>';
        }
        return html + '</div>';
    };
    DialogElement.prototype._getContent = function (content) {
        if (content === void 0) { content = this.option.content; }
        if (this.option.type == DialogType.form) {
            content = this._createForm(content);
        }
        else if (typeof content == 'object') {
            content = JSON.stringify(content);
        }
        return '<div class="dialog-body">' + content + '</div>';
    };
    DialogElement.prototype._getFooter = function () {
        if (!this.option.hasYes && !this.option.hasNo && (typeof this.option.button == 'object' && this.option.button instanceof Array && this.option.button.length == 0)) {
            return '';
        }
        var html = '<div class="dialog-footer">';
        if (this.option.hasYes) {
            html += '<button class="dialog-yes">' + (typeof this.option.hasYes == 'string' ? this.option.hasYes : '确认') + '</button>';
        }
        if (this.option.hasNo) {
            html += '<button class="dialog-close">' + (typeof this.option.hasNo == 'string' ? this.option.hasNo : '取消') + '</button>';
        }
        if (typeof this.option.button == 'string') {
            this.option.button = [this.option.button];
        }
        $.each(this.option.button, function (i, item) {
            if (typeof item == 'string') {
                html += '<button">' + item + '</button>';
                return;
            }
            html += '<button class="' + item.tag + '">' + item.content + '</button>';
        });
        return html += '</div>';
    };
    DialogElement.prototype._createForm = function (data) {
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
    DialogElement.prototype._createInput = function (name, data) {
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
    DialogElement.prototype._getFormElement = function () {
        this.elements = {};
        var instance = this;
        this.element.find('input,select,textarea').each(function (i, ele) {
            var item = $(ele);
            if (!item.is('[type=ridio]') || !item.is('[type=checkbox]')) {
                instance.elements[item.attr('name')] = item;
                return;
            }
            var name = item.attr('name');
            if (!instance.elements.hasOwnProperty(name)) {
                instance.elements[name] = item;
                return;
            }
            instance.elements[name].add(item);
        });
    };
    DialogElement.prototype._getFormData = function () {
        this.data = {};
        var instance = this;
        $.each(this.elements, function (name, element) {
            if (element.is('[type=ridio]')) {
                element.each(function (i, ele) {
                    var item = $(ele);
                    if (item.attr('checked')) {
                        instance.data[name] = item.val();
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
                instance.data[name] = data_1;
                return;
            }
            instance.data[name] = element.val();
        });
        return this.data;
    };
    DialogElement.prototype.show = function () {
        this.isShow = true;
    };
    DialogElement.prototype.hide = function () {
        this.isShow = false;
    };
    DialogElement.prototype.toggleLoading = function (is_show) {
        if (!this._loading) {
            is_show = true;
            this._loading = Dialog.loading();
        }
        if (typeof is_show == 'undefined') {
            is_show = !this._loading.isShow;
        }
        this._loading.isShow = is_show;
        this.isShow = !is_show;
        if (this.option.type == DialogType.page && !is_show) {
            Dialog.closeBg();
        }
    };
    DialogElement.prototype.close = function () {
        if (this.option.type == DialogType.notify) {
            this.notify && this.notify.close();
            return;
        }
        if (this._isClosing) {
            return;
        }
        if (this._timeHandle) {
            clearTimeout(this._timeHandle);
            this._timeHandle = undefined;
        }
        if (false == this.trigger('closing')) {
            return;
        }
        this._isClosing = true;
        if (this._dialogBg) {
            this._dialogBg.remove();
        }
        Dialog.removeItem(this.id);
        this.element.addClass('dialog-closing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $(this).remove();
        });
        if (this._loading) {
            this._loading.close();
        }
    };
    DialogElement.prototype.toggle = function () {
        this.isShow = !this.isShow;
    };
    DialogElement.prototype.css = function (key, value) {
        return this.element.css(key, value);
    };
    DialogElement.prototype.on = function (event, callback) {
        this.option['on' + event] = callback;
        return this;
    };
    DialogElement.prototype.done = function (callback) {
        return this.on('done', callback);
    };
    DialogElement.prototype.trigger = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var realEvent = 'on' + event;
        if (!this.option[realEvent]) {
            return;
        }
        return (_a = this.option[realEvent]).call.apply(_a, [this].concat(args));
        var _a;
    };
    DialogElement.prototype.setContent = function (data) {
        if (!this.element) {
            this.option.content = data;
            this._createElement();
            return;
        }
        this.element.find('.dialog-body').html(this._createForm(data));
        this.option.content = data;
    };
    DialogElement.prototype._getBottom = function () {
        return Math.max($(window).height() * .33 - this.element.height() / 2, 0);
    };
    DialogElement.prototype._getTop = function () {
        return Math.max($(window).height() / 2 - this.element.height() / 2, 0);
    };
    DialogElement.prototype._getLeft = function () {
        return Math.max($(window).width() / 2 - this.element.width() / 2, 0);
    };
    DialogElement.prototype._getRight = function () {
        return Math.max($(window).width() / 2 - this.element.width() / 2, 0);
    };
    DialogElement.prototype._getWidth = function () {
        var width = Dialog.$window.width();
        if (this.option.width > 1) {
            return width;
        }
        return width * this.option.width;
    };
    DialogElement.prototype._getHeight = function () {
        var height = Dialog.$window.height();
        if (this.option.height > 1) {
            return height;
        }
        return height * this.option.height;
    };
    DialogElement.prototype._setPopProperty = function () {
        if (!this.option.direction) {
            this.option.direction = DialogDirection.top;
        }
        this.element.addClass('dialog-pop-' + DialogDirection[this.option.direction]);
        var offest = this.option.target.offset();
        var _a = this._getPopLeftTop(Dialog.parseEnum(this.option.direction, DialogElement), this.element.outerWidth(), this.element.outerHeight(), offest.left, offest.top, this.option.target.outerWidth(), this.option.target.outerHeight()), x = _a[0], y = _a[1];
        this.element.css({
            left: x + 'px',
            top: y + 'px'
        });
    };
    DialogElement.prototype._getPopLeftTop = function (direction, width, height, x, y, boxWidth, boxHeight) {
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
    DialogElement.prototype._getLeftTop = function (direction, width, height, boxWidth, boxHeight) {
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
    return DialogElement;
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
        return this.create({ content: content, time: time });
    };
    /**
     * 消息
     * @param content
     * @param time
     */
    Dialog.message = function (content, time) {
        if (time === void 0) { time = 2000; }
        return this.create({ type: DialogType.message, content: content, time: time });
    };
    /**
     * 加载
     * @param time
     */
    Dialog.loading = function (time) {
        if (time === void 0) { time = 0; }
        return this.create({ type: DialogType.loading, time: time });
    };
    /**
     * 内容弹窗
     * @param content
     * @param hasYes
     * @param hasNo
     */
    Dialog.content = function (content, hasYes, hasNo) {
        return this.create({
            type: DialogType.content,
            content: content,
            hasYes: hasYes,
            hasNo: hasNo
        });
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
        return this.create({
            type: DialogType.box,
            content: content,
            title: title,
            hasYes: hasYes,
            hasNo: hasNo
        });
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
            done: done
        });
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
        return this.create({
            type: DialogType.page,
            content: content,
            title: title,
            hasYes: hasYes,
            hasNo: hasNo
        });
    };
    /**
     * 桌面提醒
     * @param title
     * @param content
     * @param icon
     */
    Dialog.notify = function (title, content, icon) {
        if (content === void 0) { content = ''; }
        if (icon === void 0) { icon = ''; }
        return this.create({
            title: title,
            content: content,
            ico: icon
        });
    };
    /**
     * 添加弹出框
     * @param element
     */
    Dialog.addItem = function (element) {
        this._data[++this._guid] = element;
        element.id = this._guid;
        if (element.option.type == DialogType.message) {
            element.option.y = this.getMessageTop();
            this._messageData.push(element.id);
            return;
        }
        if (this._needBg(element.option.type)
            && !element.option.target) {
            this.showBg();
        }
    };
    /**
     * 根据id删除弹出框
     * @param id
     */
    Dialog.removeItem = function (id) {
        if (id === void 0) { id = this._guid; }
        if (!this._data.hasOwnProperty(id + '')) {
            return;
        }
        this._data[id].close();
        this.sortMessageAndDelete(this._data[id]);
        if (this._needBg(this._data[id].option.type)) {
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
            && type != DialogType.pop;
    };
    /**
     * 循环所有弹出框
     * @param callback
     */
    Dialog.map = function (callback) {
        for (var id in this._data) {
            if (!this._data.hasOwnProperty(id)) {
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
        if (element.option.type != DialogType.message) {
            return;
        }
        var i = this._messageData.indexOf(element.id);
        if (i < 0) {
            return;
        }
        this._messageData.splice(i, 1);
        var y = element.option.y;
        for (; i < this._messageData.length; i++) {
            var item = this._data[this._messageData[i]];
            item.css('top', y + 'px');
            item.option.y = y;
            y += item.element.height() + 20;
        }
    };
    Dialog.getMessageTop = function () {
        var length = this._messageData.length;
        if (length < 1) {
            return 30;
        }
        var item = this._data[this._messageData[length - 1]];
        return item.option.y + item.element.height() + 20;
    };
    return Dialog;
}());
Dialog._data = {};
Dialog._guid = 0; // id标记
Dialog._tipData = [];
Dialog._messageData = [];
Dialog._bgLock = 0;
Dialog.$window = $(window);
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