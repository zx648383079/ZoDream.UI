abstract class DialogCore extends Box {
    constructor(
        option: DialogOption,
        public id?: number
    ) {
        super();
        this.options = $.extend({}, this.getDefaultOption(), option);
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
                throw "status error:"+ arg;
        }
    }


    private _dialogBg: JQuery;  // 自己的背景遮罩

    private _y: number;

    public get y(): number {
        if (!this._y) {
            this._y = this.box.offset().top - $(window).scrollTop();
        }
        return this._y;
    }

    public set y(y: number) {
        this._y = y;
        this.css('top', y + 'px');
    }

    private _height: number;

    public get height(): number {
        if (!this._height) {
            this._height = this.box.height();
        }
        return this._height;
    }

    public set height(height: number) {
        this._height = height;
        this.box.height(height);
    }

    /**
     * 获取默认设置
     */
    protected getDefaultOption(): DialogOption {
        return new DefaultDialogOption();
    }


    /**
     * 创建并显示控件
     */
    protected showBox() {
        if (!this.box) {
            this.init();
        }
        if (false == this.trigger('show')) {
            console.log('show stop!');
            return;
        }
        this.box.show();
        this._status = DialogStatus.show;
        
    }

    /**
     * 创建并隐藏控件
     */
    protected hideBox() {
        if (!this.box) {
            this.init();
        }
        if (false == this.trigger('hide')) {
            console.log('hide stop!');
            return;
        }
        this.box.hide();
        this._status = DialogStatus.hide;
    }

    /**
     * 动画关闭，有关闭动画
     */
    protected closingBox() {
        if (!this.box) {
            return;
        }
        if (this.status == DialogStatus.closing 
        || this.status == DialogStatus.closed) {
            return;
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
                instance.closeBox();
            }
        });
    }

    /**
     * 删除控件
     */
    protected closeBox() {
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

    /**
     * 获取相同类型弹出框的最上面
     */
    protected getDialogTop(): number | undefined {
        let y;
        let instance = this;
        Dialog.map(item => {
            if (item.options.type != this.options.type || item.id == instance.id) {
                return;
            }
            if (!y || item.y < y) {
                y = item.y;
            }
        })
        return y;
    }

    protected getDialogBottom(): number | undefined {
        let y;
        let instance = this;
        Dialog.map(item => {
            if (item.options.type != this.options.type || item.id == instance.id) {
                return;
            }
            let bottom = item.y + item.height;
            if (!y || bottom > y) {
                y = bottom;
            }
        });
        return y;
    }

    
    private _getBottom(): number {
        return Math.max($(window).height() * .33 - this.height / 2, 0);
    }

    private _getTop(): number {
        return Math.max($(window).height() / 2 - this.height / 2, 0);
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