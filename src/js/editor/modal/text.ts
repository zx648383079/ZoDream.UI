class EditorTextComponent implements IEditorSharedModal {

    private confirmFn: EditorModalCallback;
    private element: JQuery<HTMLDivElement>;

    constructor(
        private label = '文字'
    ) {
    }

    public render() {
        return `<div class="editor-modal-box">
        <div class="tab-bar">
            <a class="item">
                <i class="fa fa-arrow-left"></i>
            </a>
        </div>
        <div class="input-header-block">
            <input type="text" name="value">
            <label for="">${this.label}</label>
        </div>
        <div class="modal-action">
            <div class="btn btn-outline-primary">更新</div>
        </div>
    </div>`;
    }
    private bindEvent() {
        EditorHelper.modalInputBind(this.element, data => {
            if (this.confirmFn) {
                this.confirmFn({
                    value: data.value,
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