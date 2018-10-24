interface DialogBoxOption extends DialogContentOption {
    ico?: string,       // 标题栏的图标
    title?: string,     // 标题
    canMove?: boolean,        //是否允许移动
}

class DialogBox extends DialogContent {
    constructor(
        option: DialogBoxOption,
        id?: number
    ) {
        super(option, id);
    }

    /**
     * 设置内容
     */
    protected createContent(): this {
        this.box.html(this.getHeaderHtml() + this.getContentHtml()+ this.getFooterHtml());
        return this;
    }

    protected setProperty(): this {
        let target = this.options.target || Dialog.$window;
        let maxWidth = target.width();
        let width = this.box.width();
        let maxHeight = target.height();
        let height = this.box.height();
        if (maxWidth > width && maxHeight > height) {
            this.css({
                left: (maxWidth - width) / 2 + 'px',
                top: (maxHeight - height) / 2 + 'px'
            }).removeClass('dialog-page');
            return this;
        }
        this.options.type = DialogType.page;
        this.box.addClass("dialog-page").css({
            left: 0,
            top: 0
        });
        Dialog.closeBg();
        return this;
    }

    protected bindEvent(): this {
        // 点击标题栏移动
        let instance = this;
        let isMove = false;
        let x, y;
        this.box.find(".dialog-header .dialog-title").mousedown(function(e) {
            isMove = true;
            x = e.pageX - parseInt(instance.box.css('left'));
            y = e.pageY - parseInt(instance.box.css('top'));
            instance.box.fadeTo(20, .5);
        });

        //这里可能导致 突然显示出来
        $(document).mousemove(function(e) {
            if (!isMove || instance.status != DialogStatus.show) {
                return;
            }
            instance.box.css({
                top: e.pageY - y,
                left: e.pageX - x
            })
        }).mouseup(function() {
            isMove = false;
            if (instance.box && instance.status == DialogStatus.show) {
                instance.box.fadeTo('fast', 1);
            }
        });
        $(window).resize(function() {
            if (instance.box) {
                instance.resize();
                return;
            }
        });
        return super.bindEvent();
    }

    /**
     * 重设尺寸
     */
    public resize() {
        this.setProperty();
        this.trigger('resize');
    }

    protected getDefaultOption() {
        return new DefaultDialogBoxOption();
    }

    
    protected getHeaderHtml(): string {
        let html = '<div class="dialog-header"><div class="dialog-title">';
        if (this.options.ico) {
            html += '<i class="fa fa-' + this.options.ico + '"></i>';
        }
        if (this.options.title) {
            html += this.options.title;
        }
        return html + '</div><i class="fa fa-close dialog-close"></i></div>';
    }
    
}

class DefaultDialogBoxOption extends DefaultDialogContentOption implements DialogBoxOption {
    title: string = '提示';
    canMove: boolean = true;
}

Dialog.addMethod(DialogType.box, DialogBox);