class EditorCodeComponent implements IEditorSharedModal {
    private confirmFn: EditorModalCallback;
    private element: JQuery<HTMLDivElement>;

    constructor() { }

    public render() {
        return `<div class="editor-modal-box">
        <div class="input-header-block">
            <input type="text" name="language">
            <label for="">代码语言</label>
        </div>
        <div class="input-header-block">
            <textarea name="code" rows="10"></textarea>
            <label for="">标题</label>
        </div>
        <div class="modal-action">
            <div class="btn btn-outline-primary">插入</div>
        </div>
    </div>`;
    }

    private bindEvent() {
        EditorHelper.modalInputBind(this.element, data => {
            if (this.confirmFn) {
                this.confirmFn({
                    value: data.code,
                    language: data.language
                });
            }
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
}