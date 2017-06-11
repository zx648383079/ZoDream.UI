interface DialogPopOption extends DialogTipOption {
    direction?: DialogDirection | string | number,
}

class DialogPop extends DialogTip {
    constructor(
        option: DialogPopOption,
        id?: number
    ) {
        super(option, id);
        if (this.options.direction) {
            this.options.direction = Dialog.parseEnum<DialogDirection>(this.options.direction, DialogDirection);
        }
    }
    
    protected setProperty(): this {
        this._setPopProperty();
        return this;
    }

    /**
     * 添加到容器上
     */
    protected appendParent(): this {
        if (!this.box) {
            return this;
        }
        $(document.body).append(this.box);
        return this;
    }

    protected bindEvent(): this {
        return this;
    }

    private _getRandomDirection(): DialogDirection {
        return Math.floor((Math.random() * 8));
    }

    private _setPopProperty() {
        if (!this.options.direction) {
            this.options.direction = this._getRandomDirection();
        }
        this.box.addClass('dialog-pop-' + DialogDirection[this.options.direction]);
        let offest = this.options.target.offset();
        let [x, y] = this._getPopLeftTop(Dialog.parseEnum<DialogDirection>(this.options.direction, DialogCore), this.box.outerWidth(), this.box.outerHeight(), offest.left, offest.top, this.options.target.outerWidth(), this.options.target.outerHeight());
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

Dialog.addMethod(DialogType.pop, DialogPop);