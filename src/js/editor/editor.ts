interface IEditorContainer {

    get option(): EditorOptionManager;

    get value(): string;
    set value(v: string);
    get length(): number;
    get wordLength(): number;
    // get hasMoveListener(): boolean;
    /**
     * 保证监听鼠标移动事件的唯一性
     */
    // mouseMove(move?: (p: IPoint) => void, finish?: (p: IPoint) => void): void;
    execute(block: IEditorCommand|string, range?: IEditorRange): void;
    next(callback: EditorModuleCallbackHandler): IEditorModuleNextHandler;
    next(data: any, callback: EditorModuleCallbackHandler): IEditorModuleNextHandler;
    use(module: string|IEditorTool, range?: IEditorRange): IEditorModuleNextHandler|void;
    paste(data: DataTransfer): void;
    saveSelection(): void;
    undo(): void;
    redo(): void;
    selectAll(): void;
    destroy(): void;

    on<E extends keyof IEditorListeners>(event: E, listener: IEditorListeners[E]): IEditorContainer;
    on(event: string, cb: any): IEditorContainer;
    emit<E extends keyof IEditorListeners>(event: E, ...eventObject: Parameters<IEditorListeners[E]>): this;
    emit(event: string, ...items: any[]): IEditorContainer;
    off(...events: any[]): IEditorContainer;
}