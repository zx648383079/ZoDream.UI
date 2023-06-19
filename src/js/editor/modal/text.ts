

class EditorTextComponent implements IEditorModal {

    public visible = false;
    public value = '';
    public label = '文字';
    private confirmFn: EditorModalCallback;

    constructor() { }

    public render() {
        return `<div class="editor-modal-box" [ngClass]="{'modal-visible': visible}">
        <div class="tab-bar">
            <a class="item" (click)="tapBack()">
                <i class="iconfont icon-back"></i>
            </a>
        </div>
        <div class="input-header-block" [ngClass]="{'input-not-empty': !!value}">
            <input type="text" [(ngModel)]="value">
            <label for="">{{ label }}</label>
        </div>
        <div class="modal-action">
            <div class="btn btn-outline-primary" (click)="tapConfirm()">更新</div>
        </div>
    </div>`;
    }

    public tapBack() {
        
    }

    public open(data: any, cb: EditorModalCallback) {
        this.visible = true;
        this.confirmFn = cb;
    }

    public tapConfirm() {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn({
                value: this.value
            });
        }
    }
}