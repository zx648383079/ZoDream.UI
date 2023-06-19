

class EditorSizeComponent implements IEditorModal {

    public visible = false;
    public width = '';
    public height = '';
    private confirmFn: EditorModalCallback;

    constructor() { }

    public render() {
        return `<div class="editor-modal-box" [ngClass]="{'modal-visible': visible}">
        <div class="tab-bar">
            <a class="item" (click)="tapBack()">
                <i class="iconfont icon-back"></i>
            </a>
        </div>
        <div class="input-flex-group">
            <div class="input-header-block" [ngClass]="{'input-not-empty': !!width}">
                <input type="text" [(ngModel)]="width">
                <label for="">宽</label>
            </div>
            <div class="input-header-block" [ngClass]="{'input-not-empty': !!height}">
                <input type="text" [(ngModel)]="height">
                <label for="">高</label>
            </div>
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
                height: this.height,
                width: this.width
            });
        }
    }
}