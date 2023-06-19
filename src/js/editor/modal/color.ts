

class EditorColorComponent implements IEditorModal {

    public visible = false;
    public color = '';
    private confirmFn: EditorModalCallback;

    constructor() { }

    public render() {
        return `<div class="editor-modal-box" [ngClass]="{'modal-visible': visible}">
        <div class="color-layer">
            <div class="color-picker-sv" (touchstart)="touchStart($event)" (touchmove)="touchMove($event)" (touchend)="touchEnd($event)" (click)="tapNotTouch($event)" [ngStyle]="{'background-color': background}">
                <div class="color-picker-white"></div>
                <div class="color-picker-black"></div>
                <i [ngStyle]="svStyle"></i>
            </div>
            <div class="color-picker-h" (touchstart)="touchHStart($event)" (touchmove)="touchHMove($event)" (click)="tapHNotTouch($event)">
                <i [ngStyle]="hStyle"></i>
            </div>
        </div>
        <div class="input-header-block" [ngClass]="{'input-not-empty': !!color}">
            <input type="text" [(ngModel)]="color">
            <label for="">Hex</label>
        </div>
        <div class="modal-action">
            <div class="btn btn-outline-primary" (click)="tapConfirm()">确认</div>
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
                value: this.color
            });
        }
    }
}