

class EditorFileComponent implements IEditorSharedModal {

    private confirmFn: EditorModalCallback;
    private option: EditorOptionManager;
    private element: JQuery<HTMLDivElement>;

    public render() {
        return `<div class="editor-modal-box">
        <label class="drag-input" for="editor-modal-file">
            拖放文件
            <p>(或点击)</p>
            <input type="file" id="editor-modal-file">
        </label>
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
        EditorHelper.modalFileUpload(this.element, this.uploadFiles.bind(this));
    }

    public modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
        this.option = option;
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
        this.option.upload(files[0], 'file', res => {
            this.element.removeClass('editor-modal-loading');
            this.tapConfirm(res.url, res.title, res.size);
        }, () => {
            this.element.removeClass('editor-modal-loading');
        });
    }
    public tapConfirm(value: string, title: string, size: number) {
        if (this.confirmFn) {
            this.confirmFn({
                value,
                title,
                size
            });
        }
    }
}