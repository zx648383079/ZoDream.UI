interface IEditorElement {

    get selection(): IEditorRange;

    set selection(v: IEditorRange);

    get selectedValue(): string;

    set selectedValue(v: string);

    get value(): string;

    set value(v: string);

    get length(): number;
    get wordLength(): number;

    get height(): number;
    set height(value: number);

    /**
     * 内容的实际高度
     */
    get documentHeight(): number;

    selectAll(): void;
    execute(block: IEditorCommand, range?: IEditorRange): void;
    focus(): void;
    blur(): void;

    /**
     * 切换显示和隐藏
     * @param force 
     */
    toggle(force?: boolean): void;
        /**
     * 点相对于编辑器的位置
     * @param point 
     */
    relativeTo(point: IPoint): IPoint;

    paste(data: DataTransfer): void;

    destroy(): void;
}