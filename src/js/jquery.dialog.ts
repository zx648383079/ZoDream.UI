abstract class Box {

    public options: any;

    public element: JQuery;

    public box: JQuery;

    protected showPosition(): this {
        let offset = this.element.offset();
        let x = offset.left;
        let y = offset.top + this.element.outerHeight();
        this.box.css({left: x + "px", top: y + "px"}).show();
        return this;
    }

    public on(event: string, callback: Function): this {
        this.options['on' + event] = callback;
        return this;
    }

    public hasEvent(event: string): boolean {
        return this.options.hasOwnProperty('on' + event);
    }

    public trigger(event: string, ... args: any[]) {
        let realEvent = 'on' + event;
        if (!this.hasEvent(event)) {
            return;
        }
        return this.options[realEvent].call(this, ...args);
    }

    /**
     * 根据可能是相对值获取绝对值
     * @param abservable 
     * @param reltive 
     */
    public static getReal(abservable: number, reltive: number): number {
        if (reltive > 1) {
            return reltive;
        }
        return abservable * reltive;
    }
}

enum DialogType {
    tip,
    message,
    notify,
    pop,
    loading,
    form,
    content,
    box,
    page
}

enum DialogDirection {
    top,
    right,
    bottom,
    left,
    center,
    leftTop,
    rightTop,
    rightBottom,
    leftBottom
}

interface DialogButton {
    content: string,
    tag?: string
}

interface DialogOption {
    content?: string,   //内容
    url?: string,       // ajax请求
    ico?: string,       // 标题栏的图标
    title?: string,     // 标题
    button?: string | string[]| DialogButton[],
    hasYes?: boolean | string; // 是否有确定按钮
    hasNo?: boolean | string;  // 是否有取消按钮
    extra?: string,       //额外的class
    count?: number, // 动画按钮的个数
    type?: string | number | DialogType,
    canMove?: boolean,        //是否允许移动
    target?: JQuery,           // 载体 显示在那个内容上，默认全局, position 需要自己设置 relative、absolute、fixed
    onclosing?: (element: DialogElement) => any, // 关闭请求， 是否关闭， 返回false 为不关闭
    time?: number,         //显示时间
    width?: number,
    height?: number,
    x?: number,
    y?: number,
    direction?: DialogDirection | string | number,
    ondone?: Function        //点确定时触发
}

class DefaultDialogOption implements DialogOption {
    title: string = '提示';
    extra: string = 'loading';      //额外的class
    count: number = 5;
    type?: DialogType = DialogType.tip;
    hasYes: boolean = true;
    hasNo: boolean = true;
    time: number = 0;
    button: string[] = [];
    canMove: boolean = true;
    ondone: Function = function() {
        this.close();
    }
}

class DialogElement extends Box {
    constructor(
        option: DialogOption,
        public id?: number
    ) {
        super();
        this.options = $.extend({}, new DefaultDialogOption(), option);
        this.options.type =  Dialog.parseEnum<DialogType>(this.options.type, DialogType);
        
        if (this.options.direction) {
            this.options.direction = Dialog.parseEnum<DialogDirection>(this.options.direction, DialogDirection);
        }
        this.init();
    }

    public options: DialogOption;

    public notify: Notification; // 系统通知

    private _data: {[name: string]: string | string[]};

    /**
     * 表单数据
     */
    public get data(): {[name: string]: string | string[]} {
        if (!this._data) {
            this._data = this._getFormData();
        }
        return this._data;
    }

    private _elements: {[name: string]: JQuery};
    /**
     * 表单控件
     */
    public get elements(): {[name: string]: JQuery} {
        if (!this._elements) {
            this._elements = this._getFormElement();
        }
        return this._elements;
    }

    public clearFormData(): this {
        this._data = undefined;
        this._elements = undefined;
        return this;
    }

    private _isClosing: boolean = false;

    private _dialogBg: JQuery;  // 自己的背景遮罩

    private _timeHandle: number;

    private _isShow: boolean = false;

    public set isShow(arg: boolean) {
        if (this.isDeleted()) {
            this.init();
            return;
        }
        if (this._isShow == arg) {
            return;
        }
        this._isShow = arg;
        if (this.options.type == DialogType.notify) {
            //this._createNotify();
            return;
        }
        if (this.isShow) {
            this.box.show();
            return;
        }
        this.box.hide();
    }

    public get isShow(): boolean {
        return this._isShow;
    }

    public init() {
        Dialog.addItem(this);
        if (this.options.type == DialogType.notify) {
            this._createNotify();
            return;
        }
        this._createBg();
        if (!this.options.content && this.options.url) {
            this.toggleLoading(true);
            let instance = this;
            $.get(this.options.url, function(html) {
                instance. toggleLoading(false);
                instance.options.content = html;
                instance.init();
            });
            return;
        }
        this._createElement();
        this._isClosing = false;
    }

    private _createElement(type: DialogType | number | string = this.options.type): JQuery {
        this._createNewElement(type);
        this._bindEvent();
        this._setProperty();
        this._isShow = true;
        return this.box;
    }

    private _createNewElement(type: DialogType | number | string = this.options.type) {
        let typeStr = DialogType[type];
        this.box = $('<div class="dialog dialog-'+ typeStr +'" data-type="dialog" dialog-id='+ this.id +'></div>');
        this._addHtml();
        if (this.options.width) {
            this.box.width(this._getWidth());
        }
        if (this.options.height) {
            this.box.height(this._getHeight());
        }
        if (this.options.target 
        && this.options.type != DialogType.pop) {
            this.options.target.append(this.box);
            this.box.addClass("dialog-private");
        } else {
            $(document.body).append(this.box);
        }
    }

    private _addHtml() {
        switch (this.options.type) {
            case DialogType.box:
            case DialogType.form:
            case DialogType.page:
                this.box.html(this._getHeader() + this._getContent() + this._getFooter());
                break;
            case DialogType.content:
                this.box.html(this._getContent() + this._getFooter());
                break;
            case DialogType.loading:
                this.box.html(this._getLoading());
                break;
            case DialogType.tip:
            case DialogType.message:
            case DialogType.pop:
            default:
                this.box.text(this.options.content);
                break;
        }
    }

    private _setProperty() {
        if (this.options.type == DialogType.page
        || this.options.type == DialogType.content) {
            return;
        }

        if (this.options.type == DialogType.message) {
            this.css('top', this.options.y + 'px');
            return;
        }
        if (this.options.type == DialogType.pop) {
            this._setPopProperty();
            return;
        }
        
        let target = this.options.target || Dialog.$window;
        let maxWidth = target.width();
        let width = this.box.width();
        if (this.options.type == DialogType.tip) {
            this.css('left', (maxWidth - width) / 2 + 'px');
            return;
        }
        let maxHeight = target.height();
        let height = this.box.height();
        if (this.options.direction) {
            let [x, y] = this._getLeftTop(Dialog.parseEnum<DialogDirection>(this.options.direction, DialogDirection), width, height, maxWidth, maxHeight);
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
        this.options.type = DialogType.page;
        this.box.addClass("dialog-page");
        Dialog.closeBg();
    }

    /**
     * 重设尺寸
     */
    public resize() {
        this._setProperty();
        this.trigger('resize');
    }

    private _bindEvent() {
        this.box.click(function(e) {
            e.stopPropagation();
        });
        if (this.options.type == DialogType.message 
        || this.options.type == DialogType.tip
        || this.options.type == DialogType.loading) {
            this._addTime();
            return;
        }
        if (this.options.hasYes) {
            this.onClick(".dialog-yes", function() {
                this.clearFormData().trigger('done');
            });
        }
        if (this.options.type == DialogType.box
            || this.options.type == DialogType.form
            || this.options.type == DialogType.page
            || this.options.hasNo) {
            this.onClick(".dialog-close", function() {
                this.close();
            });
        }
        if (this.options.type == DialogType.page) {
            this.onClick(".dialog-header .fa-arrow-left", function() {
                this.close();
            });
        }
        let instance = this;
        if (this.options.canMove 
        && (this.options.type == DialogType.box 
        || this.options.type == DialogType.form)) {
            // 点击标题栏移动
            let isMove = false;
            let x, y;
            this.box.find(".dialog-header .dialog-title").mousedown(function(e) {
                isMove = true;
                x = e.pageX - parseInt(instance.box.css('left'));
                y = e.pageY - parseInt(instance.box.css('top'));
                instance.box.fadeTo(20, .5);
            });
            $(document).mousemove(function(e) {
                if (!isMove) {
                    return;
                }
                instance.box.css({
                    top: e.pageY - y,
                    left: e.pageX - x
                })
            }).mouseup(function() {
                isMove = false;
                instance.box.fadeTo('fast', 1);
            });
        }
        $(window).resize(function() {
            instance.resize();
        });
    }

    private _addTime() {
        if (this.options.time <= 0) {
            return;
        }
        let instance = this;
        this._timeHandle = setTimeout(function() {
            instance._timeHandle = undefined;
            instance.close();
        }, this.options.time);
    }

    public onClick(tag: string, callback: (element: JQuery) => any) {
        let instance = this;
        this.box.on('click', tag, function(e) {
            callback.call(instance, $(this));
        });
    }

    private _createNotify() {
        let instance = this;
        if ("Notification" in window) {
            let ask = Notification.requestPermission();
            ask.then(permission => {
                if (permission !== "granted") {
                    console.log('您的浏览器支持但未开启桌面提醒！')
                }
                instance.notify = new Notification(instance.options.title, {
                    body: instance.options.content,
                    icon: instance.options.ico,
                });
                instance.notify.addEventListener("click", event => {
                    instance.trigger('done');
                });
            });
            return;
        }
        console.log('您的浏览器不支持桌面提醒！');
    }

    private _getLoading() {
        let html = '';
        let num = this.options.count;
        for(; num > 0; num --) {
            html += '<span></span>';
        }
        return '<div class="'+ this.options.extra +'">'+ html +'</div>';
    }

    /**
     * 创建私有的遮罩
     */
    private _createBg() {
        if (!this.options.target 
        || this.options.type == DialogType.pop) {
            return;
        }
        let instance = this;
        this._dialogBg = $('<div class="dialog-bg dialog-bg-private"></div>');
        this._dialogBg.click(function(e) {
            e.stopPropagation();
            instance.close();
        });
        this.options.target.append(this._dialogBg);
    }

    private _getHeader(title: string = this.options.title, hasClose: boolean = true, hasBack?: boolean, ico?: string): string {
        let html = '<div class="dialog-header">';
        if (hasBack || this.options.type == DialogType.page) {
            html += '<i class="fa fa-arrow-left"></i>';
        }
        html += '<div class="dialog-title">';
        if (ico) {
            html += '<i class="fa fa-' + ico + '"></i>';
        }
        html += this.options.title +'</div>';
        if (hasClose) {
            html += '<i class="fa fa-close dialog-close"></i>';
        }
        return html + '</div>';
    }

    private _getContent(content: string = this.options.content): string {
        if (this.options.type == DialogType.form) {
            content = this._createForm(content);
        } else if (typeof content == 'object') {
            content = JSON.stringify(content);
        }
        return '<div class="dialog-body">'+ content +'</div>';
    }

    private _getFooter(): string {
        if (!this.options.hasYes && !this.options.hasNo && (typeof this.options.button == 'object' && this.options.button instanceof Array && this.options.button.length == 0)) {
            return '';
        }
        let html = '<div class="dialog-footer">';
        if (this.options.hasYes) {
            html += '<button class="dialog-yes">'+ (typeof this.options.hasYes == 'string' ? this.options.hasYes : '确认') +'</button>';
        }
        if (this.options.hasNo) {
            html += '<button class="dialog-close">'+ (typeof this.options.hasNo == 'string' ? this.options.hasNo : '取消') +'</button>';
        }
        if (typeof this.options.button == 'string') {
            this.options.button = [this.options.button];
        }
        $.each(this.options.button, (i, item)=> {
            if (typeof item == 'string') {
                html += '<button">'+item+'</button>';
                return;
            }
            html += '<button class="'+item.tag+'">'+item.content+'</button>';
        });
        return html += '</div>';
    }

    private _createForm(data: any): string {
        if (typeof data != 'object') {
            return data;
        }
        let html = '';
        let instance = this;
        $.each(data, function(name: string, item: any) {
            html += instance._createInput(name, item);
        });
        return html;
    }

    private _createInput(name: string, data: any): string {
        if (typeof data != 'object') {
            data = {label: data};
        }
        if (!data.type) {
            data.type = !data.item ? 'text' : 'select';
        }
        let attr = '';
        let html = '';
        let defaultVal = '';
        if (data.default) {
            defaultVal = data.defaultVal;
        }
        if (data.label) {
            html += '<label>'+data.label+'</label>'; 
        }
        if (data.id) {
            attr += ' id="'+data.id+'"';
        }
        if (data.class) {
            attr += ' class="'+data.class+'"';
        }
        if (data.required) {
            attr += ' required="required"';
        }
        if (data.placeholder) {
            attr += ' placeholder="'+data.placeholder+'"';
        }
        switch (data.type) {
            case 'textarea':
                html += '<textarea name="'+name+'" '+attr+'>'+defaultVal+'</textarea>';
                break;
            case 'select':
                let option = '';
                $.each(data.item, function(val, label) {
                    if (val == defaultVal) {
                        val += '" selected="selected';
                    }
                    option += '<option value="'+val+'">'+label+'</option>';
                });
                html += '<select name="'+name+'" '+attr+'>'+option+'<select>';
                break;
            case 'radio':
            case 'checkbox':
                html += '<div'+attr+'>'
                $.each(data.item, function(val, label) {
                    if (val == defaultVal) {
                        val += '" checked="checked';
                    }
                    html += '<input type="'+data.type+'" name="'+name+'" value="'+val+'">' + label;
                });
                html += '<div>';
                break;
            default:
                html += '<input type="'+data.type+'" name="'+name+'" '+attr+' value="'+defaultVal+'">';
                break;
        }
        return '<div class="input-group">'+html+'</div>';
    }

    /**
     * 获取表单控件
     */
    private _getFormElement():{[name:string]: JQuery} {
        let elements = {};
        let instance = this;
        this.box.find('input,select,textarea,button').each(function(i, ele) {
            let item = $(ele);
            let name = item.attr('name');
            if (!name) {
                return;
            }
            if (!item.is('[type=ridio]') && !item.is('[type=checkbox]') && name.indexOf('[]') < 0) {
                elements[name] = item;
                return;
            }
            if (!instance.elements.hasOwnProperty(name)) {
                elements[name] = item;
                return;
            }
            elements[name].add(item);
        });
        return elements;
    }

    /**
     * 获取表单数据
     */
    private _getFormData(): {[name: string]: any} {
        let formData = {};
        $.each(this.elements, function(name: string, element: JQuery) {
            if (element.is('[type=ridio]')) {
                element.each(function(i, ele) {
                    let item = $(ele);
                    if (item.attr('checked')) {
                        formData[name] = item.val();
                    }
                });
                return;
            }
            if (element.is('[type=checkbox]')) {
                let data = [];
                element.each(function(i, ele) {
                    let item = $(ele);
                    if (item.attr('checked')) {
                       data.push(item.val());
                    }
                });
                formData[name] = data;
                return;
            }
            if (name.indexOf('[]') > 0) {
                let data = [];
                element.each(function(i, ele) {
                    let item = $(ele);
                    data.push(item.val());
                });
                formData[name] = data;
                return;
            }
            formData[name] = element.val();
        });
        return formData;
    }
    

    public show() {
        this.isShow = true;
    }

    public hide() {
        this.isShow = false;
    }

    public isDeleted(): boolean {
        return !Dialog.hasItem(this.id);
    }

    private _loading: DialogElement;

    public toggleLoading(is_show?: boolean) {
        if (!this._loading) {
            is_show = true;
            this._loading = Dialog.loading();
        }
        if (typeof is_show == 'undefined') {
            is_show = !this._loading.isShow;
        }
        this._loading.isShow = is_show;
        this.isShow = !is_show;
        if (this.options.type == DialogType.page && !is_show) {
            Dialog.closeBg();
        }
    }

    public close() {
        if (this.options.type == DialogType.notify) {
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
        this.box.addClass('dialog-closing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(this).remove();
        });
        if (this._loading) {
            this._loading.close();
        }
    }

    public toggle() {
        this.isShow = !this.isShow;
    }

    public css(key: any, value?: string| number): JQuery {
        return this.box.css(key, value);
    }

    public done(callback: Function): this {
        return this.on('done', callback);
    }

    public setContent(data: any) {
        if (!this.box) {
            this.options.content = data;
            this._createElement();
            return;
        }
        this.box.find('.dialog-body').html(this._createForm(data));
        this.options.content = data;
    }

    
    private _getBottom(): number {
        return Math.max($(window).height() * .33 - this.box.height() / 2, 0);
    }

    private _getTop(): number {
        return Math.max($(window).height() / 2 - this.box.height() / 2, 0);
    }

    private _getLeft(): number {
        return Math.max($(window).width() / 2 - this.box.width() / 2, 0);
    }

    private _getRight(): number {
        return Math.max($(window).width() / 2 - this.box.width() / 2, 0);
    }

    private _getWidth(): number {
        let width = Dialog.$window.width();
        if (this.options.width > 1) {
            return width;
        }
        return width * this.options.width;
    }

    private _getHeight(): number {
        let height = Dialog.$window.height();
        if (this.options.height > 1) {
            return height;
        }
        return height * this.options.height;
    }

    private _setPopProperty() {
        if (!this.options.direction) {
            this.options.direction = DialogDirection.top;
        }
        this.box.addClass('dialog-pop-' + DialogDirection[this.options.direction]);
        let offest = this.options.target.offset();
        let [x, y] = this._getPopLeftTop(Dialog.parseEnum<DialogDirection>(this.options.direction, DialogElement), this.box.outerWidth(), this.box.outerHeight(), offest.left, offest.top, this.options.target.outerWidth(), this.options.target.outerHeight());
        this.box.css({
            left: x + 'px',
            top: y + 'px'
        });
    }

    private _getPopLeftTop(direction: DialogDirection, width: number, height: number, x: number, y: number, boxWidth: number, boxHeight: number): [number, number] {
        let space = 30; // 空隙
        switch (direction) {
            case DialogDirection.rightTop:
            case DialogDirection.right:
                return [x + boxWidth + space, y + (boxHeight - height) / 2];
            case DialogDirection.rightBottom:
            case DialogDirection.bottom:
                return [x + (boxWidth - width) / 2,  y + boxHeight + space];
            case DialogDirection.leftBottom:
            case DialogDirection.left:
                return [x - width - space, y + (boxHeight - height) / 2];
            case DialogDirection.center:
            case DialogDirection.leftTop:
            case DialogDirection.top:
            default:
                return [x + (boxWidth - width) / 2, y - height - space];
        }
    }

    private _getLeftTop(direction: DialogDirection, width: number, height: number, boxWidth: number, boxHeight: number): [number, number] {
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
    }
}

class Dialog {
    private static _data: {[id: number]: DialogElement} = {};

    private static _guid: number = 0; // id标记

    private static _tipData: Array<number> = [];

    private static _messageData: Array<number> = [];

    private static _dialogBg: JQuery;

    private static _bgLock: number = 0;

    public static $window = $(window);

    /**
     * 创造弹出框
     * @param option 
     */
    public static create(option?: DialogOption): DialogElement {
        if (!option.type) {
            option.type = DialogType.tip;
        }
        let element = new DialogElement(option);
        return element;
    }

    public static parseEnum<T>(val: any, type: any): T {
        if (typeof val == 'string') {
            return type[val];
        }
        return val;
    }

    /**
     * 提示
     * @param content 
     * @param time 
     */
    public static tip(content: string | DialogOption, time: number = 2000): DialogElement {
        if (typeof content != 'object') {
            content = {content: content, time: time};
        }
        content.type = DialogType.tip;
        return this.create(content);
    }

    /**
     * 消息
     * @param content 
     * @param time 
     */
    public static message(content: string | DialogOption, time: number = 2000): DialogElement {
        if (typeof content != 'object') {
            content = {content: content, time: time};
        }
        content.type = DialogType.message;
        return this.create(content);
    }

    /**
     * 加载
     * @param time 
     */
    public static loading(time: number | DialogOption = 0): DialogElement {
        if (typeof time != 'object') {
            time = {time: time};
        }
        time.type = DialogType.loading;
        return this.create(time);
    }

    /**
     * 内容弹窗
     * @param content 
     * @param hasYes 
     * @param hasNo 
     */
    public static content(content: string | DialogOption, hasYes?: boolean, hasNo?: boolean) {
        if (typeof content != 'object') {
            content = {
                content: content,
                hasYes: hasYes,
                hasNo: hasNo
            };
        }
        content.type = DialogType.content;
        return this.create(content);
    }

    /**
     * 普通弹窗
     * @param content 
     * @param title 
     * @param hasYes 
     * @param hasNo 
     */
    public static box(content: string | DialogOption, title: string = '提示', hasYes?: boolean, hasNo?: boolean) {
        if (typeof content != 'object') {
            content = {
                content: content,
                title: title,
                hasYes: hasYes,
                hasNo: hasNo
            };
        }
        content.type = DialogType.box;
        return this.create(content);
    }

    /**
     * 表格弹窗
     * @param content 
     * @param title 
     * @param done 
     * @param hasYes 
     * @param hasNo 
     */
    public static from(content: any, title: string = '提示', done?: Function, hasYes?: boolean, hasNo?: boolean) {
        return this.create({
            type: DialogType.box,
            content: content,
            title: title,
            hasYes: hasYes,
            hasNo: hasNo,
            ondone: done
        });
    }

    /**
     * 页面弹窗
     * @param content 
     * @param title 
     * @param hasYes 
     * @param hasNo 
     */
    public static page(content: string | DialogOption, title: string = '提示', hasYes?: boolean, hasNo?: boolean) {
        if (typeof content != 'object') {
            content = {
                content: content,
                title: title,
                hasYes: hasYes,
                hasNo: hasNo
            };
        }
        content.type = DialogType.page;
        return this.create(content);
    }

    /**
     * 桌面提醒
     * @param title 
     * @param content 
     * @param icon 
     */
    public static notify(title: string  | DialogOption = '通知', content: string = '', icon: string = '') {
        if (typeof title != 'object') {
            title = {
                title: title,
                content: content,
                ico: icon
            };
        }
        title.type = DialogType.notify;
        return this.create(title);
    }

    /**
     * 添加弹出框
     * @param element 
     */
    public static addItem(element: DialogElement) {
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
    }

    public static hasItem(id: number | string = this._guid): boolean {
        return this._data.hasOwnProperty(id + '')
    }

    public static get(id: number | string = this._guid) {
        if (this.hasItem(id)) {
            return this._data[id];
        }
        throw "error:" + id;
    }

    /**
     * 根据id删除弹出框
     * @param id 
     */
    public static removeItem(id: number = this._guid) {
        if (!this.hasItem(id)) {
            return;
        }
        this._data[id].close();
        this.sortMessageAndDelete(this._data[id]);
        if (this._needBg(this._data[id].options.type)) {
            this.closeBg();
        }
        delete this._data[id];
    }

    /**
     * 删除所有弹出框
     */
    public static remove() {
        this.map(function(item) {
            item.close();
        });
    }

    /**
     * 判断是否需要使用遮罩
     * @param type 
     */
    private static _needBg(type: DialogType | string | number): boolean {
        return type != DialogType.tip 
        && type != DialogType.message
        && type != DialogType.page 
        && type != DialogType.notify
        && type != DialogType.pop;
    }

    /**
     * 循环所有弹出框
     * @param callback 
     */
    public static map(callback: (item: DialogElement) => any) {
        for(let id in this._data) {
            if (!this.hasItem(id)) {
                continue;
            }
            let result = callback(this._data[id]);
            if (result == false) {
                return;
            }
        }
    }

    /**
     * 显示遮罩
     */
    public static showBg(target: JQuery = $(document.body)) {
        let instance = this;
        if (!this._dialogBg) {
            this._dialogBg = $('<div class="dialog-bg"></div>');
            this._dialogBg.click(function(e) {
                e.stopPropagation();
                instance.remove();
            });
            // 更改遮罩的位置
            target.append(this._dialogBg);
        }
        this._bgLock ++;
        this._dialogBg.show();
    }

    /**
     * 隐藏遮罩
     */
    public static closeBg() {
        if (!this._dialogBg) {
            return;
        }
        this._bgLock--;
        if (this._bgLock > 0) {
            return;
        }
        this._dialogBg.hide();
    }

    public static sortMessageAndDelete(element: DialogElement) {
        if (element.options.type != DialogType.message) {
            return;
        }
        let i = this._messageData.indexOf(element.id);
        if (i < 0) {
            return;
        }
        this._messageData.splice(i, 1);
        let y = element.options.y;
        for(; i < this._messageData.length; i ++) {
            let item = this._data[this._messageData[i]];
            item.css('top', y + 'px');
            item.options.y = y;
            y += item.element.height() + 20;
        }
    }

    public static getMessageTop() : number {
        let length = this._messageData.length;
        if (length < 1) {
            return 30;
        }
        let item = this._data[this._messageData[length - 1]];
        return item.options.y + item.element.height()  + 20;
    }
}

class DialogPlugin {
    constructor(
        public element: JQuery,
        public option?: DialogOption
    ) {
        let instance = this;
        this.element.click(function() {
            if (!instance.dialog) {
                instance.dialog = Dialog.create(instance._parseOption($(this)));
                //return;
            }
            instance.dialog.show();
        });
    }

    public dialog: DialogElement;

    private _parseOption(element: JQuery) {
        let option: DialogOption = $.extend({}, this.option);
        option.type = element.attr('dialog-type') || this.option.type;
        option.content = element.attr('dialog-content') || this.option.content;
        option.url = element.attr('dialog-url') || this.option.url;
        option.time = parseInt(element.attr('dialog-time')) || this.option.time;
        return option;
    }
}

;(function($: any) {
    $.fn.dialog = function(option ?: DialogOption) {
        return new DialogPlugin(this, option);
    };
})(jQuery);