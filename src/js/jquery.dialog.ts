enum DialogType {
    tip,
    message,
    loading,
    form,
    content,
    box,
    page
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
    loading?: string,       //加载动画的class
    loadingCount?: number, // 动画按钮的个数
    type?: string | number | DialogType,
    canMove?: boolean,        //是否允许移动
    target?: JQuery,           // 载体 显示在那个内容上，默认全局, position 需要自己设置 relative、absolute、fixed
    closing?: (element: DialogElement) => any, // 关闭请求， 是否关闭， 返回false 为不关闭
    time?: number,         //显示时间
    isFull?: boolean,
    done?: Function        //点确定时触发
}

class DefaultDialogOption implements DialogOption {
    title: string = '提示';
    loading: string = 'loading';      //加载动画的class
    loadingCount: number = 5;
    type?: DialogType = DialogType.tip;
    hasYes: boolean = true;
    hasNo: boolean = true;
    time: number = 0;
    button: string[] = [];
    canMove: boolean = true;
}

class DialogElement {
    constructor(
        option: DialogOption,
        public id?: number
    ) {
        this.option = $.extend({}, new DefaultDialogOption(), option);
        if (typeof this.option.type == 'string') {
            this.option.type = DialogType[this.option.type];
        }
        Dialog.addItem(this);
        this._createBg();
        this.init();
    }

    public option: DialogOption

    public element: JQuery;

    public data: {[name: string]: string | string[]} = {};

    public elements: {[name: string]: JQuery} = {};

    private _isClosing: boolean = false;

    private _dialogBg: JQuery;  // 自己的背景遮罩

    private _timeHandle: number;

    public init() {
        if (!this.option.content && this.option.url) {
            let dialog = Dialog.loading();
            let instance = this;
            $.get(this.option.url, function(html) {
                dialog.close();
                instance.option.content = html;
                instance.init();
            });
            return;
        }
        this._createElement();
    }

    private _createElement(type: DialogType | number | string = this.option.type): JQuery {
        let typeStr = DialogType[type];
        this.element = $('<div class="dialog dialog-'+ typeStr +'" data-type="dialog"></div>');
        this._addHtml();
        this._bindEvent();
        if (this.option.target) {
            this.option.target.append(this.element);
            this.element.addClass("dialog-private");
        } else {
            $(document.body).append(this.element);
        }
        this._setProperty();
        return this.element;
    }

    private _addHtml() {
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
            default:
                this.element.text(this.option.content);
                break;
        }
    }

    private _setProperty() {
        if (this.option.type == DialogType.message 
        || this.option.type == DialogType.page
        || this.option.type == DialogType.content) {
            return;
        }
        
        let target = this.option.target || Dialog.$window;
        let maxWidth = target.width();
        let width = this.element.width();
        if (this.option.type == DialogType.tip) {
            this.element.css('left', (maxWidth - width) / 2 + 'px');
            return;
        }
        let maxHeight = target.height();
        let height = this.element.height();
        if (maxWidth > width && maxHeight > height) {
            this.element.css({
                left: (maxWidth - width) / 2 + 'px',
                top: (maxHeight - height) / 2 + 'px'
            });
            return;
        }
        this.option.isFull = true; 
        this.element.addClass("dialog-page");
    }

    private _bindEvent() {
        this.element.click(function(e) {
            e.stopPropagation();
        });
        if (this.option.type == DialogType.message 
        || this.option.type == DialogType.tip
        || this.option.type == DialogType.loading) {
            this._addTime();
            return;
        }
        if (this.option.hasYes) {
            this.onClick(".dialog-yes", function() {
                if (this.option.done) {
                    this._getFormElement();
                    this._getFormData();
                    this.option.done.call(this);
                }
            });
        }
        if (this.option.hasNo) {
            this.onClick(".dialog-close", function() {
                this.close();
            });
        }
        if (this.option.type == DialogType.page) {
            this.onClick(".dialog-header .fa-arrow-left", function() {
                this.close();
            });
        }
        let instance = this;
        if (this.option.canMove 
        && (this.option.type == DialogType.box 
        || this.option.type == DialogType.form)) {
            // 点击标题栏移动
            let isMove = false;
            let x, y;
            this.element.find(".dialog-header").mousedown(function(e) {
                isMove = true;
                x = e.pageX - parseInt(instance.element.css('left'));
                y = e.pageY - parseInt(instance.element.css('top'));
                instance.element.fadeTo(20, .5);
            });
            $(document).mousemove(function(e) {
                if (!isMove) {
                    return;
                }
                instance.element.css({
                    top: e.pageY - y,
                    left: e.pageX - x
                })
            }).mouseup(function() {
                isMove = false;
                instance.element.fadeTo('fast', 1);
            });
        }
    }

    private _addTime() {
        if (this.option.time <= 0) {
            return;
        }
        let instance = this;
        this._timeHandle = setTimeout(function() {
            instance._timeHandle = undefined;
            instance.close();
        }, this.option.time);
    }

    public onClick(tag: string, callback: (element: JQuery) => any) {
        let instance = this;
        this.element.on('click', tag, function() {
            callback.call(instance, $(this));
        });
    }

    private _getLoading() {
        let html = '';
        let num = this.option.loadingCount;
        for(; num > 0; num --) {
            html += '<span></span>';
        }
        return '<div class="'+ this.option.loading +'">'+ html +'</div>';
    }

    /**
     * 创建私有的遮罩
     */
    private _createBg() {
        if (!this.option.target) {
            return;
        }
        let instance = this;
        this._dialogBg = $('<div class="dialog-bg dialog-bg-private"></div>');
        this._dialogBg.click(function(e) {
            e.stopPropagation();
            instance.close();
        });
        this.option.target.append(this._dialogBg);
    }

    private _getHeader(title: string = this.option.title, hasClose: boolean = true, hasBack?: boolean, ico?: string): string {
        let html = '<div class="dialog-header">';
        if (hasBack || this.option.type == DialogType.page) {
            html += '<i class="fa fa-arrow-left"></i>';
        }
        html += '<span>';
        if (ico) {
            html += '<i class="fa fa-' + ico + '"></i>';
        }
        html += this.option.title +'</span>';
        if (hasClose) {
            html += '<i class="fa fa-close dialog-close"></i>';
        }
        return html + '</div>';
    }

    private _getContent(content: string = this.option.content): string {
        if (this.option.type == DialogType.form) {
            content = this._createForm(content);
        } else if (typeof content == 'object') {
            content = JSON.stringify(content);
        }
        return '<div class="dialog-body">'+ content +'</div>';
    }

    private _getFooter(): string {
        let html = '<div class="dialog-footer">';
        if (this.option.hasYes) {
            html += '<button class="dialog-yes">'+ (typeof this.option.hasYes == 'string' ? this.option.hasYes : '确认') +'</button>';
        }
        if (this.option.hasNo) {
            html += '<button class="dialog-close">'+ (typeof this.option.hasNo == 'string' ? this.option.hasNo : '取消') +'</button>';
        }
        if (typeof this.option.button == 'string') {
            this.option.button = [this.option.button];
        }
        $.each(this.option.button, (i, item)=> {
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

    private _getFormElement() {
        this.elements = {};
        let instance = this;
        this.element.find('input,select,textarea').each(function(i, ele) {
            let item = $(ele);
            if (!item.is('[type=ridio]') || !item.is('[type=checkbox]')) {
                instance.elements[item.attr('name')] = item;
                return;
            }
            let name = item.attr('name');
            if (!instance.elements.hasOwnProperty(name)) {
                instance.elements[name] = item;
                return;
            }
            instance.elements[name].add(item);
        });
    }

    private _getFormData() {
        this.data = {};
        let instance = this;
        $.each(this.elements, function(name: string, element: JQuery) {
            if (element.is('[type=ridio]')) {
                element.each(function(i, ele) {
                    let item = $(ele);
                    if (item.attr('checked')) {
                        instance.data[name] = item.val();
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
                instance.data[name] = data;
                return;
            }
            instance.data[name] = element.val();
        });
        return this.data;
    }
    

    public show() {
        this.element.show();
    }

    public hide() {
        this.element.hide();
    }

    public close() {
        if (this._isClosing) {
            return;
        }
        if (this._timeHandle) {
            clearTimeout(this._timeHandle);
            this._timeHandle = undefined;
        }
        if (this.option.closing && false == this.option.closing(this)) {
            return;
        }
        this._isClosing = true;
        if (this._dialogBg) {
            this._dialogBg.remove();
        }
        Dialog.removeItem(this.id);
        this.element.addClass('dialog-closing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(this).remove();
        });
    }

    public toggle() {
        this.element.toggle();
    }

    /**
     * 
     * @param callback 
     */
    public done(callback: Function) {
        this.option.done = callback;
    }

    
    private _getBottom(): number {
        return Math.max($(window).height() * .33 - this.element.height() / 2, 0);
    }

    private _getTop(): number {
        return Math.max($(window).height() / 2 - this.element.height() / 2, 0);
    }

    private _getLeft(): number {
        return Math.max($(window).width() / 2 - this.element.width() / 2, 0);
    }

    private _getRight(): number {
        return Math.max($(window).width() / 2 - this.element.width() / 2, 0);
    }

    private _getWidth(): number {
        let width = $(window).width();
        if (this.option.isFull) {
            return width;
        }
        return width * .66;
    }

    private _getHeight(): number {
        let height = $(window).height();
        if (this.option.isFull) {
            return height;
        }
        return height * .33;
    }
}

class Dialog {
    private static _data: {[id: number]: DialogElement} = {};

    private static _guid: number = 0; // id标记

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
        if (typeof option.type == 'string') {
            option.type = DialogType[option.type];
        }
        let element = new DialogElement(option);
        return element;
    }

    public static tip(content: string, time: number = 2000): DialogElement {
        return this.create({content: content, time: time});
    }

    public static message(content: string, time: number = 2000): DialogElement {
        return this.create({type: DialogType.message, content: content, time: time});
    }

    public static loading(time: number = 0): DialogElement {
        return this.create({type: DialogType.loading, time: time});
    }

    /**
     * 添加弹出框
     * @param element 
     */
    public static addItem(element: DialogElement) {
        this._data[++this._guid] = element;
        element.id = this._guid;
        if (this._needBg(element.option.type) 
        && !element.option.target) {
            this.showBg();
        }
    }

    /**
     * 根据id删除弹出框
     * @param id 
     */
    public static removeItem(id: number = this._guid) {
        if (!this._data.hasOwnProperty(id + '')) {
            return;
        }
        this._data[id].close();
        if (this._needBg(this._data[id].option.type)) {
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
        && type != DialogType.page;
    }

    /**
     * 循环所有弹出框
     * @param callback 
     */
    public static map(callback: (item: DialogElement) => any) {
        for(let id in this._data) {
            if (!this._data.hasOwnProperty(id)) {
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
}

class DialogPlugin {
    constructor(
        public element: JQuery,
        public option?: DialogOption
    ) {
        let instance = this;
        this.element.click(function() {
            instance.dialog = Dialog.create(instance._parseOption($(this)));
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