interface DialogButton {
    content: string,
    tag?: string
}

interface DialogBoxOption extends DialogOption {
    url?: string,       // ajax请求
    ico?: string,       // 标题栏的图标
    title?: string,     // 标题
    button?: string | string[]| DialogButton[],
    hasYes?: boolean | string; // 是否有确定按钮
    hasNo?: boolean | string;  // 是否有取消按钮
    extra?: string,       //额外的class
    count?: number, // 动画按钮的个数
    type?: string | number | DialogType,
    canMove?: boolean,        //是否允许移动
    width?: number,
    height?: number,
    x?: number,
    y?: number,
    direction?: DialogDirection | string | number,
    ondone?: Function        //点确定时触发
}

class DialogBox extends DialogCore {
    constructor(
        option: DialogOption,
        id?: number
    ) {
        super(option, id);
    }

    public init() {

    }

    protected createContent(): this {
        throw new Error("Method not implemented.");
    }
    protected setProperty(): this {
        throw new Error("Method not implemented.");
    }

    
    private _isLoading: boolean = false; //加载中 显示时候出现加载动画

    private _loadingDialog: DialogCore;

    public get isLoading(): boolean {
        return this._isLoading;
    }

    public set isLoading(arg: boolean) {
        this._isLoading = arg;
        this._toggleLoading();
        // 加载完成时显示元素
        if (!this._isLoading && this.status == DialogStatus.show) {
            this._show();
        }
    }

        /**
     * 显示加载动画
     */
    private _toggleLoading(arg: DialogStatus = this.status) {
        if (!this.isLoading || arg != DialogStatus.show) {
            if (this._loadingDialog) {
                this._loadingDialog.close();
                this._loadingDialog = undefined;
            }
            return;
        }
        if (this._loadingDialog) {
            this._loadingDialog.show();
            return;
        }
        this._loadingDialog = Dialog.loading().show();
    }

    
}