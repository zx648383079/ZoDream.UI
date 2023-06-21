class EditorSizeComponent implements IEditorSharedModal {

    private confirmFn: EditorModalCallback;
    private element: JQuery<HTMLDivElement>;

    constructor() { }

    public render() {
        return `<div class="editor-modal-box">
        <div class="tab-bar">
            <a class="item">
                <i class="fa fa-arrow-left"></i>
            </a>
        </div>
        <div class="input-flex-group">
            <div class="input-header-block">
                <input type="text" name="width">
                <label for="">宽</label>
            </div>
            <div class="input-header-block">
                <input type="text" name="height">
                <label for="">高</label>
            </div>
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
                    height: data.height,
                    width: data.width
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