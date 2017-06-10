class Dialog {

    public static methods: {[type: number]: Function} = {};

    private static _data: {[id: number]: DialogCore} = {};

    private static _guid: number = 0; // id标记

    private static _tipData: Array<number> = [];

    private static _dialogBg: JQuery;

    private static _bgLock: number = 0;

    public static $window = $(window);

    /**
     * 创造弹出框
     * @param option 
     */
    public static create(option?: DialogOption): DialogCore {
        if (!option.type) {
            option.type = DialogType.tip;
        }
        option.type = this.parseEnum<DialogType>(option.type, DialogType);
        let method = this.getMethod(option.type);
        let element = new method(option);
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
    public static tip(content: string | DialogTipOption, time: number = 2000): DialogCore {
        if (typeof content != 'object') {
            content = {content: content, time: time};
        }
        content.type = DialogType.tip;
        return this.create(content).show();
    }

    /**
     * 消息
     * @param content 
     * @param time 
     */
    public static message(content: string | DialogMessageOption, time: number = 2000): DialogCore {
        if (typeof content != 'object') {
            content = {content: content, time: time};
        }
        content.type = DialogType.message;
        return this.create(content).show();
    }

    /**
     * 加载
     * @param time 
     */
    public static loading(time: number | DialogOption = 0): DialogCore {
        if (typeof time != 'object') {
            time = {time: time};
        }
        time.type = DialogType.loading;
        return this.create(time).show();
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
        return this.create(content).show();
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
        return this.create(content).show();
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
        }).show();
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
        return this.create(content).show();
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
        return this.create(title).show();
    }

    /**
     * 添加弹出框
     * @param element 
     */
    public static addItem(element: DialogCore) {
        this._data[++this._guid] = element;
        element.id = this._guid;
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
    public static map(callback: (item: DialogCore) => any) {
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

    public static addMethod(type: DialogType, dialog: Function) {
        this.methods[type] = dialog;
    }

    public static hasMethod(type: DialogType): boolean {
        return this.methods.hasOwnProperty(type.toString());
    }

    public static getMethod(type: DialogType): Function {
        return this.methods[type];
    }
}