

class EditorFileComponent implements IEditorModal {

    public visible = false;
    public fileName = '';
    public isLoading = false;
    private confirmFn: EditorModalCallback;
    constructor(
        // private uploadService: FileUploadService,
    ) { }

    public render() {
        return `<div class="editor-modal-box" [ngClass]="{'modal-visible': visible, 'modal-loading': isLoading}" appFileDrop (fileDrop)="uploadFiles($event)">
        <label class="drag-input" [for]="fileName">
            拖放文件
            <p>(或点击)</p>
            <input type="file" [id]="fileName" (change)="uploadFile($event)">
        </label>
        <app-loading-ring></app-loading-ring>
    </div>`;
    }

    public open(data: any, cb: EditorModalCallback) {
        this.visible = true;
        this.confirmFn = cb;
    }

    public uploadFile(e: any) {
        if (this.isLoading) {
            return;
        }
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
        // this.uploadService.uploadFile(files[0]).subscribe({
        //     next: res => {
        //         this.isLoading = false;
        //         this.tapConfirm(res.url, res.original, res.size);
        //     },
        //     error: () => {
        //         this.isLoading = false;
        //     }
        // })
    }
    public tapConfirm(value: string, title: string, size: number) {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn({
                value,
                title,
                size
            });
        }
    }
}