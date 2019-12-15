interface DialogNotifyOption extends DialogTipOption {
    title?: string,
    ico?: string
}

class DialogNotify extends DialogTip {

    constructor(
        option: DialogNotifyOption,
        id?: number
    ) {
        super(option, id);
    }

    public options: DialogNotifyOption;

    public notify: Notification; // 系统通知

    protected createContent(): this {
        throw new Error("Method not implemented.");
    }
    protected setProperty(): this {
        throw new Error("Method not implemented.");
    }

    /**
     * 获取默认设置
     */
    protected getDefaultOption() {
        return new DefaultDialogNotifyOption();
    }

    protected showBox(): boolean {
        if (this.notify) {
            return false;
        }
        Dialog.addItem(this);
        this._createNotify();
        return true;
    }

    protected hideBox(): boolean {
        return this.closeBox();
    }

    protected closingBox(): boolean {
        return this.closeBox();
    }

    protected closeBox(): boolean {
        if (this.status == DialogStatus.closing 
        || this.status == DialogStatus.closed) {
            return false;
        }
        if (false == this.trigger(_DIALOG_CLOSE)) {
            console.log('closed stop!');
            return false;
        }
        this._closeNotify();
        Dialog.removeItem(this.id); 
        this.changeStatus(DialogStatus.closed);
        this.stopTime();
        return true;
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
                    instance.trigger(_DIALOG_DONE);
                });
            });
            return;
        }
        console.log('您的浏览器不支持桌面提醒！');
    }

    private _closeNotify() {
        if (!this.notify) {
            return;
        }
        this.notify.close();
        this.notify = undefined;
    }

}

class DefaultDialogNotifyOption extends DefaultDialogTipOption implements DialogNotifyOption {
    title: string = '提示';
}

Dialog.addMethod(DialogType.notify, DialogNotify);