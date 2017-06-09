class DialogPop extends DialogCore {
    constructor(
        option: DialogOption,
        id?: number
    ) {
        super(option, id);
        if (this.options.direction) {
            this.options.direction = Dialog.parseEnum<DialogDirection>(this.options.direction, DialogDirection);
        }
    }

    public init() {

    }

    protected createContent(): this {
        throw new Error("Method not implemented.");
    }
    
    protected setProperty(): this {
        throw new Error("Method not implemented.");
    }

    private _setPopProperty() {
        if (!this.options.direction) {
            this.options.direction = DialogDirection.top;
        }
        this.box.addClass('dialog-pop-' + DialogDirection[this.options.direction]);
        let offest = this.options.target.offset();
        let [x, y] = this._getPopLeftTop(Dialog.parseEnum<DialogDirection>(this.options.direction, DialogElement), this.box.outerWidth(), this.box.outerHeight(), offest.left, offest.top, this.options.target.outerWidth(), this.options.target.outerHeight());
        this.box.css({
            left: x + 'px',
            top: y + 'px'
        });
    }

    private _getPopLeftTop(direction: DialogDirection, width: number, height: number, x: number, y: number, boxWidth: number, boxHeight: number): [number, number] {
        let space = 30; // 空隙
        switch (direction) {
            case DialogDirection.rightTop:
            case DialogDirection.right:
                return [x + boxWidth + space, y + (boxHeight - height) / 2];
            case DialogDirection.rightBottom:
            case DialogDirection.bottom:
                return [x + (boxWidth - width) / 2,  y + boxHeight + space];
            case DialogDirection.leftBottom:
            case DialogDirection.left:
                return [x - width - space, y + (boxHeight - height) / 2];
            case DialogDirection.center:
            case DialogDirection.leftTop:
            case DialogDirection.top:
            default:
                return [x + (boxWidth - width) / 2, y - height - space];
        }
    }
}