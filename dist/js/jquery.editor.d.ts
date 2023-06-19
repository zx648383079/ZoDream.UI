/// <reference types="jquery" />
/// <reference types="jquery" />
declare abstract class Eve {
    options: any;
    on(event: string, callback: Function): this;
    hasEvent(event: string): boolean;
    trigger(event: string, ...args: any[]): any;
}
declare class EditorCodeComponent implements IEditorSharedModal {
    visible: boolean;
    language: string;
    code: string;
    private confirmFn;
    constructor();
    render(): string;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>): void;
    open(data: any, cb: EditorModalCallback): void;
    tapConfirm(): void;
}
declare class EditorColorComponent implements IEditorModal {
    visible: boolean;
    color: string;
    private confirmFn;
    constructor();
    render(): string;
    open(data: any, cb: EditorModalCallback): void;
    tapConfirm(): void;
}
declare const FontItems: IEditorOptionItem[];
declare class EditorDropdownComponent implements IEditorSharedModal {
    visible: boolean;
    items: IEditorOptionItem[];
    selected: string;
    modalStyle: any;
    private confirmFn;
    constructor();
    render(): string;
    modalReady(module: IEditorModule): void;
    open(data: any, cb: EditorModalCallback, position?: IPoint): void;
    tapConfirm(item: IEditorOptionItem): void;
}
declare class EditorFileComponent implements IEditorModal {
    visible: boolean;
    fileName: string;
    isLoading: boolean;
    private confirmFn;
    constructor();
    render(): string;
    open(data: any, cb: EditorModalCallback): void;
    uploadFile(e: any): void;
    uploadFiles(files: FileList | File[]): void;
    tapConfirm(value: string, title: string, size: number): void;
}
declare class EditorImageComponent implements IEditorModal {
    visible: boolean;
    fileName: string;
    tabIndex: number;
    url: string;
    isLoading: boolean;
    private confirmFn;
    constructor();
    render(): string;
    open(data: any, cb: EditorModalCallback): void;
    uploadFile(e: any): void;
    uploadFiles(files: FileList | File[]): void;
    tapConfirm(): void;
    private output;
}
declare class EditorLinkComponent implements IEditorModal {
    visible: boolean;
    url: string;
    title: string;
    isBlank: boolean;
    private confirmFn;
    constructor();
    render(): string;
    open(data: any, cb: EditorModalCallback): void;
    tapConfirm(): void;
}
declare class EditorResizerComponent {
    toolType: number;
    private rectBound?;
    private mouseMoveListeners;
    private updatedHandler;
    constructor();
    render(): string;
    get boxStyle(): {
        display: string;
        left?: undefined;
        top?: undefined;
        width?: undefined;
        height?: undefined;
    } | {
        display: string;
        left: string;
        top: string;
        width: string;
        height: string;
    };
    get horizontalStyle(): {
        display: string;
        left?: undefined;
        top?: undefined;
        height?: undefined;
    } | {
        display: string;
        left: string;
        top: string;
        height: string;
    };
    get verticalStyle(): {
        display: string;
        left?: undefined;
        top?: undefined;
        width?: undefined;
    } | {
        display: string;
        left: string;
        top: string;
        width: string;
    };
    private docMouseMove;
    private docMouseUp;
    openResize(bound: IBound, cb: EditorUpdatedCallback): void;
    openHorizontalResize(bound: IBound, cb: EditorUpdatedCallback): void;
    openVerticalResize(bound: IBound, cb: EditorUpdatedCallback): void;
    close(): void;
    onMoveLt(e: MouseEvent): void;
    onMoveT(e: MouseEvent): void;
    onMoveRt(e: MouseEvent): void;
    onMoveR(e: MouseEvent): void;
    onMoveRb(e: MouseEvent): void;
    onMoveB(e: MouseEvent): void;
    onMoveLb(e: MouseEvent): void;
    onMoveL(e: MouseEvent): void;
    private mouseMove;
    private onMouseMove;
}
declare class EditorSizeComponent implements IEditorModal {
    visible: boolean;
    width: string;
    height: string;
    private confirmFn;
    constructor();
    render(): string;
    tapBack(): void;
    open(data: any, cb: EditorModalCallback): void;
    tapConfirm(): void;
}
declare class EditorTableComponent implements IEditorModal {
    visible: boolean;
    columnItems: number[];
    rowItems: number[];
    column: number;
    row: number;
    private confirmFn;
    constructor();
    render(): string;
    tapCell(row: number, col: number): void;
    tapConfirm(row: number, column: number): void;
    open(data: any, cb: EditorModalCallback): void;
    private generateRange;
}
declare class EditorTextComponent implements IEditorModal {
    visible: boolean;
    value: string;
    label: string;
    private confirmFn;
    constructor();
    render(): string;
    tapBack(): void;
    open(data: any, cb: EditorModalCallback): void;
    tapConfirm(): void;
}
declare class EditorVideoComponent implements IEditorModal {
    visible: boolean;
    fileName: string;
    tabIndex: number;
    url: string;
    code: string;
    isAutoplay: boolean;
    isLoading: boolean;
    private confirmFn;
    constructor();
    render(): string;
    open(data: any, cb: EditorModalCallback): void;
    uploadFile(e: any): void;
    uploadFiles(files: FileList | File[]): void;
    tapConfirm(): void;
}
declare class CodeElement implements IEditorElement {
    private element;
    private container;
    private linePanel;
    private bodyPanel;
    private isComposition;
    constructor(element: HTMLDivElement, container: IEditorContainer);
    get selection(): IEditorRange;
    set selection(v: IEditorRange);
    get selectedValue(): string;
    set selectedValue(v: string);
    get value(): string;
    set value(v: string);
    get length(): number;
    get wordLength(): number;
    selectAll(): void;
    insert(block: IEditorBlock, range?: IEditorRange): void;
    focus(): void;
    blur(): void;
    private init;
    private bindResize;
    private bindEvent;
    private insertText;
    private insertLineBreak;
    private insertIndent;
    private insertOutdent;
    private replaceSelectLine;
    private getLinePrevious;
    private getLineNext;
    private eachLinePrevious;
    private eachLineNext;
    private getRangeLineNo;
    /**
     *
     * @param node
     * @returns
     */
    private getLineNo;
    private findLine;
    /**
     *
     * @param index
     */
    private removeLine;
    private insertLines;
    private selectLine;
    private selectRangeLine;
    private updateLineCount;
    private updateLineNoStyle;
    toggleClass(ele: HTMLDivElement, tag: string, force?: boolean): void;
    private selectNode;
    private addLines;
    private beforeLine;
    private addLine;
    private createLineNo;
    private createLine;
    private updateLine;
    private updateLineNo;
    private renderLine;
    private eachLine;
}
declare class EditorContainer implements IEditorContainer {
    option: EditorOptionManager;
    private selection;
    private element;
    private undoStack;
    private undoIndex;
    private asyncTimer;
    private listeners;
    constructor(option?: EditorOptionManager);
    ready(element: HTMLTextAreaElement | HTMLDivElement | IEditorElement): void;
    get canUndo(): boolean;
    get canRedo(): boolean;
    /**
        是否有选择字符串
     */
    get hasSelection(): boolean;
    get value(): string;
    set value(content: string);
    get length(): number;
    get wordLength(): number;
    private checkSelection;
    selectAll(): void;
    saveSelection(): void;
    insert(block: IEditorBlock | string, range?: IEditorRange): void;
    execute(module: string | IEditorTool, range?: IEditorRange, data?: any): void;
    clear(focus?: boolean): void;
    /**
     * focus
     */
    focus(): void;
    asynSave(): void;
    blur(): void;
    destroy(): void;
    undo(): void;
    redo(): void;
    on<E extends keyof IEditorListeners>(event: E, listener: IEditorListeners[E]): IEditorContainer;
    emit(event: string, ...items: any[]): this;
    off(...events: string[]): this;
    off(event: string, cb: Function): this;
    once<E extends keyof IEditorListeners>(event: E, listener: IEditorListeners[E]): IEditorContainer;
    private offListener;
}
/**
 * 富文本模式
 */
declare class DivElement implements IEditorElement {
    private element;
    private container;
    constructor(element: HTMLDivElement, container: IEditorContainer);
    private isComposition;
    get selection(): IEditorRange;
    set selection(v: IEditorRange);
    get selectedValue(): string;
    set selectedValue(val: string);
    get value(): string;
    set value(v: string);
    get length(): number;
    get wordLength(): number;
    selectAll(): void;
    insert(block: IEditorBlock, range?: IEditorRange): void;
    focus(): void;
    blur(): void;
    private insertHr;
    private insertIndent;
    private insertOutdent;
    private insertTable;
    private insertImage;
    private insertText;
    private insertRaw;
    private insertVideo;
    private insertFile;
    private insertLink;
    private insertLineBreak;
    /**
     * 删除选中并替换为新的
     */
    private replaceSelected;
    /**
     * 把选中的作为子项包含进去
     */
    private includeSelected;
    /**
     * 切换父级的标签，例如 b strong
     */
    private toggleParentNode;
    /**
     * 切换父级的样式
     */
    private toggleParentStyle;
    private isNotSelected;
    private selectNode;
    private bindEvent;
    private moveTableCol;
    private updateNode;
    /**
     * 遍历选中的所有元素，最末端的元素，无子元素
     * @param range
     * @param cb
     */
    private eachRange;
    insertElement(node: Node, range: Range): void;
    private insertToElement;
    /**
     * 在内部前面添加子节点
     * @param current
     * @param items
     */
    private insertFirst;
    /**
     * 在子节点最后添加元素
     * @param current
     * @param items
     */
    private insertLast;
    /**
     * 在元素之前添加兄弟节点
     * @param current
     * @param items
     */
    private insertBefore;
    /**
     * 在元素之后添加兄弟节点
     * @param current
     * @param items
     * @returns
     */
    private insertAfter;
    private insertToChildIndex;
    private removeRange;
    private copySelectedNode;
    private copyRangeNode;
    private indexOfNode;
    /**
     * 遍历兄弟节点，包含自身
     * @param node
     * @param cb
     * @param isNext
     * @returns
     */
    private eachBrother;
    private eachNextBrother;
    private eachBlockNext;
    private isBlockNode;
    /**
     * 判断当前是否是在某一个特殊的范围内
     * @param range
     * @returns
     */
    private isInBlock;
    /**
     * 获取当前作用的样式
     * @param node
     * @returns
     */
    private getNodeStyle;
    /**
     * 向上遍历父级
     * @param node
     * @param cb 包含自身
     */
    private eachParentNode;
    /**
     * 循环遍历选中项的父元素
     * @param range
     * @param cb 返回 true中断某一个子元素的父级查找， 返回false 中断整个查找
     */
    private eachRangeParentNode;
    /**
     * 获取下一个相邻的元素，不判断最小子元素
     * @param node
     * @returns
     */
    private nextNode;
    /**
     * 拆分元素
     * @param node
     * @param offset
     * @returns
     */
    private splitNode;
    private getNodeOffset;
    private getNodeBound;
    private isEndNode;
    private isEmptyLine;
    private isEmptyLineNode;
}
interface IEditorContainer {
    get option(): EditorOptionManager;
    get value(): string;
    set value(v: string);
    get length(): number;
    get wordLength(): number;
    /**
     * 保证监听鼠标移动事件的唯一性
     */
    insert(block: IEditorBlock | string, range?: IEditorRange): void;
    execute(module: string | IEditorTool, range?: IEditorRange, data?: any): void;
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
    insert(block: IEditorBlock, range?: IEditorRange): void;
    focus(): void;
    blur(): void;
}
declare const EVENT_INPUT_KEYDOWN = "input.keydown";
declare const EVENT_INPUT_BLUR = "input.blur";
declare const EVENT_INPUT_CLICK = "input.click";
declare const EVENT_MOUSE_UP = "mouse.up";
declare const EVENT_MOUSE_MOVE = "mouse.move";
declare const EVENT_EDITOR_CHANGE = "change";
declare const EVENT_EDITOR_READY = "ready";
declare const EVENT_EDITOR_DESTORY = "destroy";
declare const EVENT_EDITOR_AUTO_SAVE = "auto_save";
declare const EVENT_SELECTION_CHANGE = "selection_change";
declare const EVENT_UNDO_CHANGE = "undo";
declare const EVENT_SHOW_ADD_TOOL = "tool.add";
declare const EVENT_SHOW_LINE_BREAK_TOOL = "tool.line.break";
declare const EVENT_SHOW_IMAGE_TOOL = "tool.image";
declare const EVENT_SHOW_COLUMN_TOOL = "tool.column";
declare const EVENT_SHOW_LINK_TOOL = "tool.link";
declare const EVENT_SHOW_TABLE_TOOL = "tool.table";
declare const EVENT_CLOSE_TOOL = "tool.flow.close";
interface IEditorListeners {
    [EVENT_INPUT_KEYDOWN]: (e: KeyboardEvent) => void;
    [EVENT_INPUT_BLUR]: () => void;
    [EVENT_EDITOR_CHANGE]: () => void;
    [EVENT_INPUT_CLICK]: () => void;
    [EVENT_SHOW_ADD_TOOL]: (y: number) => void;
    [EVENT_CLOSE_TOOL]: () => void;
    [EVENT_SHOW_LINE_BREAK_TOOL]: (p: IPoint) => void;
    [EVENT_SHOW_IMAGE_TOOL]: (b: IBound, cb: EditorUpdatedCallback) => void;
    [EVENT_SHOW_LINK_TOOL]: (p: IPoint, cb: EditorUpdatedCallback) => void;
    [EVENT_SHOW_TABLE_TOOL]: (p: IPoint, cb: EditorUpdatedCallback) => void;
    [EVENT_SHOW_COLUMN_TOOL]: (b: IBound, cb: EditorUpdatedCallback) => void;
    [EVENT_SELECTION_CHANGE]: () => void;
    [EVENT_UNDO_CHANGE]: () => void;
    [EVENT_EDITOR_AUTO_SAVE]: () => void;
    [EVENT_EDITOR_READY]: () => void;
    [EVENT_MOUSE_MOVE]: (p: IPoint) => void;
    [EVENT_MOUSE_UP]: (p: IPoint) => void;
    [EVENT_EDITOR_DESTORY]: () => void;
}
declare const EDITOR_CLOSE_TOOL = "close";
declare const EDITOR_ADD_TOOL = "add";
declare const EDITOR_ENTER_TOOL = "enter";
declare const EDITOR_UNDO_TOOL = "undo";
declare const EDITOR_REDO_TOOL = "redo";
declare const EDITOR_FULL_SCREEN_TOOL = "full-screen";
declare const EDITOR_CODE_TOOL = "code";
declare const EDITOR_IMAGE_TOOL = "image_edit";
declare const EDITOR_TABLE_TOOL = "table_edit";
declare const EDITOR_VIDEO_TOOL = "video_edit";
declare const EDITOR_LINK_TOOL = "link_edit";
type EditorUpdatedCallback<T = IEditorBlock> = (data: T) => void;
interface IPoint {
    x: number;
    y: number;
}
interface ISize {
    width: number;
    height: number;
}
interface IBound extends IPoint, ISize {
}
interface IEditor {
    insert(block: IEditorBlock | string): void;
}
interface IImageUploadEvent {
    files: FileList;
    target: IEditor;
}
interface IEditorRange {
    start: number;
    end: number;
    range?: Range;
}
type EditorModalCallback<T = any> = (data: T) => void;
interface IEditorModal<T = any> {
    open(data: T, cb: EditorModalCallback<T>, position?: IPoint): void;
}
/**
 * 共享型弹窗，需要提前进行预配置
 */
interface IEditorSharedModal<T = any> extends IEditorModal<T> {
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
}
declare enum EditorBlockType {
    AddLineBreak = 0,
    AddHr = 1,
    AddText = 2,
    AddRaw = 3,
    AddImage = 4,
    AddLink = 5,
    AddTable = 6,
    AddVideo = 7,
    AddFile = 8,
    AddCode = 9,
    Bold = 10,
    Indent = 11,
    Outdent = 12,
    NodeResize = 13,
    NodeMove = 14
}
interface IEditorBlock {
    [key: string]: any;
    type: EditorBlockType;
}
interface IEditorValueBlock extends IEditorBlock {
    value: string;
}
interface IEditorSizeBlock extends IEditorBlock {
    width: string | number;
    height: string | number;
}
interface IEditorResizeBlock extends IEditorSizeBlock {
    x: number;
    y: number;
}
interface IEditorTableBlock extends IEditorBlock {
    row: number;
    column: number;
}
interface IEditorVideoBlock extends IEditorBlock {
    code: string;
    value: string;
    autoplay: boolean;
}
interface IEditorFileBlock extends IEditorValueBlock {
    title: string;
    size: number;
}
interface IEditorLinkBlock extends IEditorValueBlock {
    title: string;
    target: boolean;
}
interface IEditorCodeBlock extends IEditorValueBlock {
    language: string;
}
interface IEditorTextBlock extends IEditorValueBlock {
    cursor?: number;
}
interface IEditorInclueBlock extends IEditorBlock {
    begin: string;
    end: string;
    cursor?: number;
}
declare const EditorModules: IEditorModule[];
interface IUploadResult {
    url: string;
    size: number;
    title: string;
    thumb?: string;
}
type UploadFileCallback = (files: File[] | File, success: (data: IUploadResult | IUploadResult[]) => void, failure: (error: string) => void) => void;
interface IEditorOption {
    undoCount?: number;
    blockTag?: string;
    icons?: {
        [module: string]: string;
    };
    hiddenModules?: string[] | string;
    visibleModules?: string[] | string;
    toolbar?: {
        left?: string[] | string;
        right?: string[] | string;
    };
    uploader?: {
        image?: UploadFileCallback;
        video?: UploadFileCallback;
        file?: UploadFileCallback;
    };
}
interface IEditorOptionItem {
    name: string | number;
    value: any;
    style?: any;
}
interface IEditorToolStatus {
    name: string;
    disabled?: boolean;
    actived?: boolean;
}
interface IEditorTool extends IEditorToolStatus {
    icon: string;
    label: string;
    hotKey?: string;
}
interface IEditorModule extends IEditorTool {
    parent?: string;
    modal?: IEditorModal;
    handler?: (editor: IEditorContainer, range?: IEditorRange, data?: any) => void;
}
declare class EditorOptionManager {
    private option;
    private moduleItems;
    constructor();
    get leftToolbar(): IEditorTool[];
    get rightToolbar(): IEditorTool[];
    get closeTool(): IEditorTool;
    get addTool(): IEditorTool;
    get enterTool(): IEditorTool;
    get blockTag(): string;
    get maxUndoCount(): any;
    merge(option: IEditorOption): void;
    get(optionKey: string): any;
    toolOnly(name: string): IEditorTool;
    tool(...names: string[]): IEditorTool[];
    toolChildren(name: string): IEditorTool[];
    push(...modules: IEditorModule[]): void;
    hotKeyModule(hotKey: string): IEditorTool | undefined;
    toModule(module: string | IEditorTool): IEditorModule | undefined;
    private filterTool;
    private toTool;
    private isVisible;
    private strToArr;
    private mergeObject;
}
/**
 * markdown 模式
 */
declare class TextareaElement implements IEditorElement {
    private element;
    private container;
    constructor(element: HTMLTextAreaElement, container: IEditorContainer);
    private isComposition;
    get selection(): IEditorRange;
    set selection(v: IEditorRange);
    get selectedValue(): string;
    set selectedValue(val: string);
    get value(): string;
    set value(v: string);
    get length(): number;
    get wordLength(): number;
    selectAll(): void;
    insert(block: IEditorBlock, range?: IEditorRange): void;
    focus(): void;
    blur(): void;
    private insertLineBreak;
    private insertIndent;
    private insertOutdent;
    private replaceSelectLine;
    private insertText;
    private insertCode;
    private insertLink;
    private insertImage;
    private includeBlock;
    private replaceSelect;
    /**
     * 移动光标到指定位置并focus
     * @param pos
     */
    private moveCursor;
    private bindEvent;
}
declare const OTHER_WORD_CODE: number[];
/**
 * 计算内容的长度，排除空格符号等特殊字符
 */
declare function wordLength(val: string): number;
declare class EditorApp {
    /**
    *
    */
    constructor(element: HTMLDivElement | HTMLTextAreaElement, option?: IEditorOption);
    private option;
    private container;
    private box;
    private target;
    private textbox;
    private subToolbar;
    private flowToolbar;
    private flowLastTool;
    private modalContianer;
    private footerBar;
    private subParentName;
    private isFullScreen;
    private ready;
    tapTool(item: IEditorTool, isRight: boolean, event: MouseEvent): void;
    tapFlowTool(item: IEditorTool, event: MouseEvent): void;
    insert(block: IEditorBlock | string): void;
    private executeModule;
    private getOffsetPosition;
    private toggleFullScreen;
    private bindEvent;
    private toggleFlowbar;
    private toggleSubToolbar;
    private toggleTool;
    private initByDiv;
    private initByInput;
    private renderBase;
    private renderToolIcon;
    private renderToolbar;
}
