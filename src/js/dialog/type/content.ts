interface DialogButton {
    content: string,
    tag?: string
}

interface DialogContentOption extends DialogOption {
    url?: string,       // ajax请求
    button?: string | string[]| DialogButton[],
    hasYes?: boolean | string; // 是否有确定按钮
    hasNo?: boolean | string;  // 是否有取消按钮
    ondone?: Function        //点确定时触发
}

class DialogContent extends DialogCore {

    constructor(
        option: DialogContentOption,
        id?: number
    ) {
        super(option, id);
        if (!this.options.content && this.options.url) {
            let instance = this;
            this.isLoading = true;
            $.get(this.options.url, function(html) {
                instance.options.content = html;
                instance.isLoading = false;
                instance.init();
            });
        }
    }

    private _isLoading: boolean = false; //加载中 显示时候出现加载动画

    private _loadingDialog: DialogCore;

    public get isLoading(): boolean {
        return this._isLoading;
    }

    public set isLoading(arg: boolean) {
        this._isLoading = arg;
        this._toggleLoading();
        // 加载完成时显示元素
        if (!this._isLoading && this.status == DialogStatus.show) {
            this.showBox();
        }
    }

    /**
     * 显示加载动画
     */
    private _toggleLoading(arg: DialogStatus = this.status) {
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
    }

    public init() {
        Dialog.addItem(this);
        this.createCore().createContent()
        .appendParent().setProperty().bindEvent();
        if (this.status == DialogStatus.show) {
            this.showBox();
        }
    }

    protected getDefaultOption() {
        return new DefaultDialogContentOption();
    }

    /**
     * 设置内容
     */
    protected createContent(): this {
        this.box.html(this.getContentHtml()+ this.getFooterHtml());
        return this;
    }

    /**
     * 添加到容器上
     */
    protected appendParent(): this {
        $(document.body).append(this.box);
        return this;
    }

    /**
     * 设置属性
     */
    protected setProperty(): this {
        return this;
    }

    /**
     * 绑定事件
     */
    protected bindEvent(): this {
        this.box.click(function(e) {
            e.stopPropagation();
        });
        this.onClick(".dialog-yes", function() {
            this.trigger('done');
        });
        this.onClick(".dialog-close", function() {
            //this.isLoading = false;
            this.close();
        });
        return this;
    }

    protected getContentHtml(): string {
        let content = this.options.content;
        if (typeof content == 'object') {
            content = JSON.stringify(content);
        }
        return '<div class="dialog-body">'+ content +'</div>';
    }

    protected getFooterHtml(): string {
        if (!this.options.hasYes && !this.options.hasNo && (typeof this.options.button == 'object' && this.options.button instanceof Array && this.options.button.length == 0)) {
            return '';
        }
        let html = '<div class="dialog-footer">';
        if (this.options.hasYes) {
            html += '<button type="button" class="dialog-yes">'+ (typeof this.options.hasYes == 'string' ? this.options.hasYes : '确认') +'</button>';
        }
        if (this.options.hasNo) {
            html += '<button type="button" class="dialog-close">'+ (typeof this.options.hasNo == 'string' ? this.options.hasNo : '取消') +'</button>';
        }
        if (typeof this.options.button == 'string') {
            this.options.button = [this.options.button];
        }
        $.each(this.options.button, (i, item)=> {
            if (typeof item == 'string') {
                html += '<button type="button">'+item+'</button>';
                return;
            }
            html += '<button type="button" class="'+item.tag+'">'+item.content+'</button>';
        });
        return html += '</div>';
    }

    public onClick(tag: string, callback: (element: JQuery) => any) {
        let instance = this;
        this.box.on('click', tag, function(e) {
            callback.call(instance, $(this));
        });
    }

    protected showBox(): boolean {
        if (this.isLoading) {
            this.changeStatus(DialogStatus.show);
            return false;
        }
        if (!super.showBox()) {
            return false;
        }
        Dialog.showBg(this.options.target);
        return true;
    }

    protected hideBox(): boolean {
        if (this.isLoading) {
            this.changeStatus(DialogStatus.hide);
            return false;
        }
        if (!super.hideBox()) {
            return false;
        }
        Dialog.closeBg();
        return true;
    }

    protected closingBox(): boolean {
        if (this.isLoading) {
            this.changeStatus(DialogStatus.hide);
            return false;
        }
        if (!super.closingBox()) {
            return false;
        }
        Dialog.closeBg();
        return true;
    }

    protected closeBox(): boolean {
        if (this.isLoading) {
            this.changeStatus(DialogStatus.hide);
            return false;
        }
        let status = this.status;
        if (!super.closeBox()) {
            return false;
        }
        if (status != DialogStatus.closing) {
            Dialog.closeBg();
        }
        return true;
    }
    
}

class DefaultDialogContentOption implements DialogContentOption {
    hasYes: boolean = true;
    hasNo: boolean = true;
    time: number = 0;
    button: string[] = [];
}

Dialog.addMethod(DialogType.content, DialogContent);