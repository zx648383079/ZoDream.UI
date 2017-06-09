abstract class DialogCore extends Box {
    constructor(
        option: DialogOption,
        public id?: number
    ) {
        super();
        this.options = $.extend({}, new DefaultDialogOption(), option);
        this.options.type =  Dialog.parseEnum<DialogType>(this.options.type, DialogType);
    }

    public options: DialogOption;

        private _status: DialogStatus = DialogStatus.closed;

    public get status(): DialogStatus {
        return this._status;
    }

    public set status(arg: DialogStatus) {
        arg = Dialog.parseEnum<DialogStatus>(arg, DialogStatus);
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
                throw "status error:"+ arg;
        }
    }

    private _isLoading: boolean = false; //加载中 显示时候出现加载动画

    private _loadingDialog: DialogElement;

    public get isLoading(): boolean {
        return this._isLoading;
    }

    public set isLoading(arg: boolean) {
        this._isLoading = arg;
        this._toggleLoading();
        // 加载完成时显示元素
        if (!this._isLoading && this.status == DialogStatus.show) {
            this._show();
        }
    }

    private _dialogBg: JQuery;  // 自己的背景遮罩

    private _timeHandle: number;


    /**
     * 创建并显示控件
     */
    private _show() {
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
    }

    /**
     * 创建并隐藏控件
     */
    private _hide() {
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
    }

    /**
     * 动画关闭，有关闭动画
     */
    private _animationClose() {
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
        let instance = this;
        this.box.addClass('dialog-closing').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            if (instance.status == DialogStatus.closing) {
                // 防止中途改变当前状态
                instance._close();
            }
        });
    }

    /**
     * 删除控件
     */
    private _close() {
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
    }

    public abstract init();

    protected createCore(): this {
        this.box = $('<div class="dialog dialog-'+ DialogType[this.options.type] +'" data-type="dialog" dialog-id='+ this.id +'></div>');
        return this;
    }

    protected abstract createContent(): this;

    protected abstract setProperty(): this;


    public css(key: any, value?: string| number): JQuery {
        return this.box.css(key, value);
    }

    public show(): this {
        this.status = DialogStatus.show;
        return this;
    }

    public hide(): this {
        this.status = DialogStatus.hide;
        return this;
    }

    public close(): this {
        this.status = DialogStatus.closing;
        return this;
    }

    public toggle() {
        if (this.status == DialogStatus.hide) {
            this.show();
            return;
        }
        this.hide();
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