


class EditorLinkComponent implements IEditorSharedModal {

    private confirmFn: EditorModalCallback;
    private element: JQuery<HTMLDivElement>;

    constructor() { }

    public render() {
        return `<div class="editor-modal-box">
        <div class="input-header-block">
            <input type="url" name="url">
            <label for="">网址</label>
        </div>
        <div class="input-header-block">
            <input type="text" name="title">
            <label for="">标题</label>
        </div>
        <div class="input-flex-line">
            <i class="fa check-input fa-square" name="is_blank"></i>
            在新标签页打开
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
                    value: data.url,
                    title: data.title,
                    target: data.is_blank
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