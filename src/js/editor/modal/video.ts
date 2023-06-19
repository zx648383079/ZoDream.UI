class EditorVideoComponent implements IEditorModal {

    public visible = false;
    public fileName = '';
    public tabIndex = 0;
    public url = '';
    public code = '';
    public isAutoplay = false;
    public isLoading = false;
    private confirmFn: EditorModalCallback;
    constructor(
        //private uploadService: FileUploadService,
    ) { }

    public render() {
        return `<div class="editor-modal-box" [ngClass]="{'modal-visible': visible,'modal-loading': isLoading}" appFileDrop (fileDrop)="uploadFiles($event)">
        <div class="tab-bar">
            <a class="item" [ngClass]="{active: tabIndex == 1}" (click)="tabIndex = 1" title="链接">
                <i class="iconfont icon-chain"></i>
            </a>
            <a class="item" [ngClass]="{active: tabIndex == 2}" (click)="tabIndex = 2" title="代码">
                <i class="iconfont icon-code"></i>
            </a>
            <a class="item" [ngClass]="{active: tabIndex < 1}" (click)="tabIndex = 0" title="上传">
                <i class="iconfont icon-upload"></i>
            </a>
        </div>
        <label class="drag-input" [for]="fileName" *ngIf="tabIndex < 1">
            拖放文件
            <p>(或点击)</p>
            <input type="file" [id]="fileName" (change)="uploadFile($event)">
        </label>
        <div *ngIf="tabIndex == 1">
            <div class="input-header-block" [ngClass]="{'input-not-empty': !!url}">
                <input type="text" [(ngModel)]="url">
                <label for="">链接</label>
            </div>
            <div class="input-flex-line">
                <i class="iconfont" [ngClass]="{'icon-check-square-o': isAutoplay, 'icon-square-o': !isAutoplay}" (click)="isAutoplay = !isAutoplay"></i>
                自动播放
            </div>
            <div class="modal-action">
                <div class="btn btn-outline-primary" (click)="tapConfirm()">插入</div>
            </div>
        </div>
        <div *ngIf="tabIndex == 2">
            <div class="input-header-block" [ngClass]="{'input-not-empty': !!code}">
                <textarea [(ngModel)]="code" rows="4"></textarea>
                <label for="">代码</label>
            </div>
            <div class="modal-action">
                <div class="btn btn-outline-primary" (click)="tapConfirm()">插入</div>
            </div>
        </div>
        <app-loading-ring></app-loading-ring>
    </div>`;
    }

    public open(data: any, cb: EditorModalCallback) {
        this.visible = true;
        this.confirmFn = cb;
    }

    public uploadFile(e: any) {
        const files = e.target.files as FileList;
        this.uploadFiles(files);
    }

    public uploadFiles(files: FileList|File[]) {
        if (this.isLoading) {
            return;
        }
        if (files.length < 1) {
            return;
        }
        this.isLoading = true;
        // this.uploadService.uploadVideo(files[0]).subscribe({
        //     next: res => {
        //         this.isLoading = false;
        //         this.url = res.url;
        //         this.tapConfirm();
        //     },
        //     error: () => {
        //         this.isLoading = false;
        //     }
        // })
    }

    public tapConfirm() {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn(this.tabIndex === 2 ? {code: this.code} : {value: this.url, autoplay: this.isAutoplay});
        }
    }

}
