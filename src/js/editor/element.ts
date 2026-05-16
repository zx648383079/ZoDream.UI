interface IEditorElement {

    get selection(): IEditorRange;

    set selection(v: IEditorRange);

    get selectedValue(): string;

    set selectedValue(v: string);

    get value(): string;

    set value(v: string);

    get length(): number;
    get wordLength(): number;

    selectAll(): void;
    execute(block: IEditorCommand, range?: IEditorRange): void;
    focus(): void;
    blur(): void;

    paste(data: DataTransfer): void;

    destroy(): void;
}