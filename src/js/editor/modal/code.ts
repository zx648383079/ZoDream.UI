class EditorCodeComponent implements IEditorSharedModal {

    public visible = false;
    public language = '';
    public code = '';
    private confirmFn: EditorModalCallback;

    constructor() { }

    public render() {
        return `<div class="editor-modal-box" [ngClass]="{'modal-visible': visible}">
        <div class="input-header-block" [ngClass]="{'input-not-empty': !!language}">
            <input type="text" [(ngModel)]="language">
            <label for="">代码语言</label>
        </div>
        <div class="input-header-block" [ngClass]="{'input-not-empty': !!code}">
            <textarea [(ngModel)]="code" rows="10"></textarea>
            <label for="">标题</label>
        </div>
        <div class="modal-action">
            <div class="btn btn-outline-primary" (click)="tapConfirm()">插入</div>
        </div>
    </div>`;
    }

    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>): void {
        
    }

    public open(data: any, cb: EditorModalCallback) {
        this.visible = true;
        this.confirmFn = cb;
    }

    public tapConfirm() {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn({
                value: this.code,
                language: this.language
            });
        }
    }
}