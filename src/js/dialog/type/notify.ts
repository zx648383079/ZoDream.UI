class DialogNotify extends DialogCore {
    protected createContent(): this {
        throw new Error("Method not implemented.");
    }
    protected setProperty(): this {
        throw new Error("Method not implemented.");
    }
    constructor(
        option: DialogOption,
        id?: number
    ) {
        super(option, id);
    }

    public init() {

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

    
}