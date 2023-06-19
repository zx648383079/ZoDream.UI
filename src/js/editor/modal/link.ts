


class EditorLinkComponent implements IEditorModal {

    public visible = false;
    public url = '';
    public title = '';
    public isBlank = false;
    private confirmFn: EditorModalCallback;

    constructor() { }

    public render() {
        return `<div class="editor-modal-box" [ngClass]="{'modal-visible': visible}">
        <div class="input-header-block" [ngClass]="{'input-not-empty': !!url}">
            <input type="url" [(ngModel)]="url">
            <label for="">网址</label>
        </div>
        <div class="input-header-block" [ngClass]="{'input-not-empty': !!title}">
            <input type="text" [(ngModel)]="title">
            <label for="">标题</label>
        </div>
        <div class="input-flex-line">
            <i class="iconfont" [ngClass]="{'icon-check-square-o': isBlank, 'icon-square-o': !isBlank}" (click)="isBlank = !isBlank"></i>
            在新标签页打开
        </div>
        <div class="modal-action">
            <div class="btn btn-outline-primary" (click)="tapConfirm()">插入</div>
        </div>
    </div>`;
    }

    public open(data: any, cb: EditorModalCallback) {
        this.visible = true;
        this.confirmFn = cb;
    }

    public tapConfirm() {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn({
                value: this.url,
                title: this.title,
                target: this.isBlank
            });
        }
    }
}