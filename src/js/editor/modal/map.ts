class EditorMapComponent implements IEditorSharedModal {
    private confirmFn: EditorModalCallback;
    private element: JQuery<HTMLDivElement>;

    public render() {
        return `<div class="editor-modal-box">
        <div class="input-header-block">
            <input type="text" name="coordinate" placeholder="经度,纬度">
            <label for="">坐标</label>
        </div>
        <div class="input-header-block">
            <input type="text" name="mark">
            <label for="">标注</label>
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
                    value: data.coordinate,
                    mark: data.mark
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
        EditorHelper.modalInputData(this.element, {
            coordinate: data.value ?? '',
            mark: data.mark ?? ''
        });
        this.confirmFn = cb;
    }
}