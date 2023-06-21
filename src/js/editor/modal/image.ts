class EditorImageComponent implements IEditorSharedModal {

    private confirmFn: EditorModalCallback;
    private element: JQuery<HTMLDivElement>;

    public render() {
        return `<div class="editor-modal-box">
        <div class="tab-bar">
            <a class="item" title="上传">
                <i class="fa fa-upload"></i>
            </a>
            <a class="item active" title="链接">
                <i class="fa fa-link"></i>
            </a>
            <a class="item" title="在线图库">
                <i class="fa fa-folder-open"></i>
            </a>
        </div>
        <div class="tab-body-item">
            <label class="drag-input" for="editor-modal-image">
                拖放文件
                <p>(或点击)</p>
                <input type="file" id="editor-modal-image">
            </label>
        </div>
        <div class="tab-body-item active">
            <div class="input-header-block">
                <input type="text" name="url">
                <label for="">链接</label>
            </div>
            <div class="modal-action">
                <div class="btn btn-outline-primary">插入</div>
            </div>
        </div>
        <div class="loading-ring">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>`;
    }

    private bindEvent() {
        const that = this;
        this.element.on('click', '.tab-bar .item', function() {
            const $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            that.element.find('.tab-body-item').each(function(i) {
                $(this).toggleClass('active', $this.index() === i);
            });
        });
        EditorHelper.modalFileUpload(this.element, this.uploadFiles.bind(this));
        EditorHelper.modalInputBind(this.element, data => {
            this.output({
                value: data.url
            });
        });
    }

    public modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
    }

    public open(data: any, cb: EditorModalCallback) {
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    }

    public uploadFiles(files: FileList|File[]) {
        if (this.element.hasClass('editor-modal-loading')) {
            return;
        }
        if (files.length < 1) {
            return;
        }
        this.element.addClass('editor-modal-loading');
        // this.uploadService.uploadImage(files[0]).subscribe({
        //     next: res => {
        //         this.isLoading = false;
        //         this.url = res.url;
        //         this.output({
        //             value: res.url,
        //             title: res.original
        //         });
        //     },
        //     error: () => {
        //         this.isLoading = false;
        //     }
        // })
    }

    private output(data: any) {
        if (this.confirmFn) {
            this.confirmFn(data);
        }
    }
}