interface DialogDiskOption extends DialogBoxOption {
    catalog?: any,
    name?: string,
    children?: string,
    url?: string,
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
        if (typeof this.options.catalog == 'object') {
            this.showCatalog(this.options.catalog);
        } else {
            $.getJSON(this.options.catalog, function(data) {
                if (data.code == 0) {
                    instance.showCatalog(data.data);
                }
            });
        }
        if (typeof this.options.content == 'object') {
            this.showFile(this.options.content);
        } else {
            $.getJSON(this.options.content, function(data) {
                if (data.code == 0) {
                    instance.showFile(data.data);
                }
            });
        }
        return super.bindEvent();
    }

    protected getContentHtml(): string {
        return '<div class="dialog-body"><div class="dialog-catalog"></div><div class="dialog-content"></div></div>';
    }

    protected getDefaultOption() {
        return new DefaultDialogDiskOption();
    }

    /**
     * 显示文件
     * @param data 
     */
    protected showFile(data: any) {
        let html = '';
        $.each(data, (i, item) => {
            if (item.type == 'file') {
                html += this._getFileItem(item);
                return;
            }
            html += this._getFolderItem(item);
        });
        this.fileBox.html(html)
    }

    private _getFileItem(data) {
        return '<div class="file-item"><i class="fa fa-file-o"></i><div class="file-name">'+data[this.options.name]+'</div></div>';
    }

    private _getFolderItem(data) {
        return '<div class="folder-item"><i class="fa fa-folder-o"></i><div class="file-name">'+data[this.options.name]+'</div></div>';
    }

    /**
     * 显示目录
     * @param data 
     */
    protected showCatalog(data: any) {
        let html = '';
        $.each(data, (i, item) => {
            html += this._getCatalogItem(item);
        });
        if (html == '') {
            this.catalogBox.hide();
            return;
        }
        this.catalogBox.html('<ul class="tree">' + html +'</ul>')
    }

    private _getCatalogItem(data: any) {
        let html = '<li class="tree-item"><div class="tree-header">' + data[this.options.name] + '</div>';
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

class DefaultDialogDiskOption implements DialogDiskOption {
    name: string = 'name';
    children: string = 'children';
    url: string = 'url';
    onclosing: () => any = function() {
        this.hide();
        return false;
    }
}

Dialog.addMethod(DialogType.disk, DialogDisk);