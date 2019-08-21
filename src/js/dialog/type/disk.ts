interface DialogDiskOption extends DialogBoxOption {
    catalog?: any,        //目录
    name?: string,
    children?: string,
    url?: string,         //url标记
    multiple?: boolean,    //是否允许多选
    onopenFile?: (url: string, element: JQuery) => any  //打开文件触发时间
}

class DialogDisk extends DialogBox {
    constructor(
        option: DialogDiskOption,
        id?: number
    ) {
        super(option, id);
    }

    public options: DialogDiskOption;

    public catalogBox: JQuery;

    public fileBox: JQuery;

    protected bindEvent(): this {
        this.catalogBox = this.box.find('.dialog-body .dialog-catalog');
        this.fileBox = this.box.find('.dialog-body .dialog-content');
        let instance = this;
        if (typeof this.options.catalog != 'string') {
            this.showCatalog(this.options.catalog);
        } else {
            $.getJSON(this.options.catalog, function(data) {
                if (data.code == 0) {
                    instance.showCatalog(data.data);
                }
            });
        }
        if (typeof this.options.content != 'string') {
            this.showFile(this.options.content);
        } else {
            $.getJSON(this.options.content, function(data) {
                if (data.code == 0) {
                    instance.showFile(data.data);
                }
            });
        }
        this.catalogBox.on('click', '.tree-item', function() {
            let file = $(this);
            file.addClass('active').siblings().removeClass('active');
            instance.open(file.attr('data-url'));
        });
        this.fileBox.on('click', '.folder-item', function() {
            let file = $(this);
            file.addClass('active').siblings().removeClass('active');
            instance.open(file.attr('data-url'));
        });
        this.fileBox.on('click', '.file-item', function() {
            let file = $(this);
            file.addClass('active');
            if (!instance.options.multiple) {
                file.siblings().removeClass('active');
            }
            instance.trigger('openFile', file.attr('data-url'), file);
        });
        return super.bindEvent();
    }

    protected getContentHtml(): string {
        return '<div class="dialog-body"><div class="dialog-catalog"></div><div class="dialog-content"></div></div>';
    }

    protected getDefaultOption() {
        return new DefaultDialogDiskOption();
    }

    public open(url: string) {
        if (!url) {
            console.log('url is empty');
            return;
        }
        CacheUrl.getData(url, data => {
            this.showFile(data);
        });
    }

    /**
     * 获取选中的文件路径
     */
    public val(): string| Array<string> {
        if (!this.options.multiple) {
            return this.fileBox.find('.file-item.active').attr('data-url');
        }
        let data = [];
        this.mapSelectedFile(url => {
            data.push(url);
        });
        return data;
    }

    /**
     * 循环选中的文件
     * @param callback 
     */
    public mapSelectedFile(callback: (url: string, element: JQuery, index: number) => any): this {
        this.fileBox.find('.file-item.active').each(function(i, ele) {
            let item = $(ele);
            let url = item.attr('data-url');
            if (callback.call(item, url, item, i) == false) {
                return false;
            }
        });
        return this;
    }

    /**
     * 循环所有
     * @param callback 
     * @param hasFolder 是否包含文件夹 
     */
    public map(callback: (url: string, element: JQuery, index: number) => any, hasFolder: boolean = false): this {
        let tag = '.file-item';
        if (hasFolder) {
            tag = '.folder-item,' + tag;
        }
        this.fileBox.find(tag).each(function(i, ele) {
            let item = $(ele);
            let url = item.attr('data-url');
            if (callback.call(item, url, item, i) == false) {
                return false;
            }
        });
        return this;
    }

    /**
     * 显示文件
     * @param data 
     */
    protected showFile(data: any) {
        let html = '';
        if (data) {
            $.each(data, (i, item) => {
                item.type = Dialog.parseEnum<DialogDiskType>(item.type, DialogDiskType);
                if (item.type == DialogDiskType.file) {
                    html += this._getFileItem(item);
                    return;
                }
                html += this._getFolderItem(item);
            });
        }
        this.fileBox.html(html)
    }

    private _getFileItem(data: any) {
        let icon = '<i class="fa fa-file"></i>';
        if (data.thumb) {
            icon = '<img class="file-thumb" src="' + data.thumb +'">';
        }
        return '<div class="file-item" data-url="' + data[this.options.url] +'">'+ icon +'<div class="file-name">'+data[this.options.name]+'</div></div>';
    }

    private _getFolderItem(data) {
        return '<div class="folder-item" data-url="' + data[this.options.url] +'"><i class="fa fa-folder"></i><div class="file-name">'+data[this.options.name]+'</div></div>';
    }

    /**
     * 显示目录
     * @param data 
     */
    protected showCatalog(data: any) {
        let html = '';
        if (data) {
            $.each(data, (i, item) => {
                html += this._getCatalogItem(item);
            });
        }
        this.box.toggleClass('no-catalog', html == '');
        if (html == '') {
            return;
        }
        this.catalogBox.html('<ul class="tree">' + html +'</ul>')
    }

    private _getCatalogItem(data: any) {
        let html = '<li class="tree-item" data-url="' + data[this.options.url] +'"><div class="tree-header">' + data[this.options.name] + '</div>';
        if (data.hasOwnProperty(this.options.children)) {
            html += this._getCatalogChild(data[this.options.children]);
        }
        return html + '</li>';
    }

    private _getCatalogChild(data: any) {
        let html = '';
        $.each(data, (i, item) => {
            html += this._getCatalogItem(item);
        });
        return '<ul class="tree-child">' + html + '</ul>';
    }
}

class DefaultDialogDiskOption extends DefaultDialogBoxOption implements DialogDiskOption {
    name: string = 'name';
    title: string = '文件管理';
    children: string = 'children';
    url: string = 'url';
    multiple: boolean = false;
    onclosing: () => any = function() {
        this.hide();
        return false;
    }
}

Dialog.addMethod(DialogType.disk, DialogDisk);