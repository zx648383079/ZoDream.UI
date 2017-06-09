class DialogElement extends Box {




    public notify: Notification; // 系统通知



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



    public clearFormData(): this {
        this._data = undefined;
        this._elements = undefined;
        return this;
    }



    public init() {
        Dialog.addItem(this);
        if (this.options.type == DialogType.notify) {
            return;
        }
        this._createBg();
        if (!this.options.content && this.options.url) {
            this.isLoading = true;
            let instance = this;
            $.get(this.options.url, function(html) {
                instance.isLoading = false;
                instance.options.content = html;
            });
            return;
        }
        this._createElement();
        this.trigger('init');
    }

    private _createElement(type: DialogType | number | string = this.options.type): JQuery {
        this._createNewElement(type);
        this._bindEvent();
        this._setProperty();
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
            case DialogType.image:
                this.box.html(this._getHeader() + this._getContent('<div></div>') + this._getFooter());
                break;
            case DialogType.disk:
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
                if (instance.box) {
                    instance.box.fadeTo('fast', 1);
                }
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
        if (this.options.title) {
            html += this.options.title;
        }
        html += '</div>';
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

    public css(key: any, value?: string| number): JQuery {
        return this.box.css(key, value);
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





}