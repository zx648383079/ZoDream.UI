/// <reference types="jquery" />
/// <reference types="jquery" />
declare class EditorCodeComponent implements IEditorSharedModal {
    private confirmFn;
    private element;
    constructor();
    render(): string;
    private bindEvent;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
    open(data: any, cb: EditorModalCallback): void;
}
declare class EditorColorComponent implements IEditorSharedModal {
    private hY;
    private x;
    private y;
    private hsv;
    private disabled;
    private confirmFn;
    private element;
    render(): string;
    private bindEvent;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
    open(data: any, cb: EditorModalCallback): void;
    private triggerSvStyle;
    private triggerHStyle;
    tapNotTouch(e: MouseEvent): void;
    tapHNotTouch(e: MouseEvent): void;
    touchStart(e: TouchEvent): void;
    touchMove(e: TouchEvent): void;
    touchEnd(e: TouchEvent): void;
    touchHStart(e: TouchEvent): void;
    touchHMove(e: TouchEvent): void;
    private applyColor;
    private setBackground;
    private triggerChange;
    private doColor;
    private doH;
    /**
     * 限制最大最小值
     */
    private clamp;
    private parse;
    private HSV2RGB;
    private HSV2HEX;
    private RGB2HSV;
    private RGB2HEX;
    private HEX2HSV;
    private HEX2RGB;
    private _2HSV_pri;
    private _2HSV_pub;
    private _2RGB_pri;
    private num;
    private round;
}
declare const EditorFontItems: IEditorOptionItem[];
declare class EditorDropdownComponent implements IEditorSharedModal {
    private isNodeTag;
    private items;
    private confirmFn;
    private element;
    constructor(isNodeTag?: boolean);
    render(): string;
    private renderItems;
    private renderItem;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
    private bindEvent;
    open(data: any, cb: EditorModalCallback, position?: IPoint): void;
    tapConfirm(item: IEditorOptionItem): void;
}
declare class EditorFileComponent implements IEditorSharedModal {
    private confirmFn;
    private option;
    private element;
    render(): string;
    private bindEvent;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
    open(data: any, cb: EditorModalCallback): void;
    uploadFiles(files: FileList | File[]): void;
    tapConfirm(value: string, title: string, size: number): void;
}
declare class EditorImageComponent implements IEditorSharedModal {
    private confirmFn;
    private option;
    private element;
    render(): string;
    private bindEvent;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
    open(data: any, cb: EditorModalCallback): void;
    uploadFiles(files: FileList | File[]): void;
    private output;
}
declare class EditorLinkComponent implements IEditorSharedModal {
    private confirmFn;
    private element;
    constructor();
    render(): string;
    private bindEvent;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
    open(data: any, cb: EditorModalCallback): void;
}
declare class EditorResizerComponent {
    toolType: number;
    private rectBound?;
    private mouseMoveListeners;
    private updatedHandler;
    private element;
    render(): string;
    private triggerBoxStyle;
    private triggerHorizontalStyle;
    private triggerVerticalStyle;
    private bindEvent;
    private docMouseMove;
    private docMouseUp;
    ready(parent: JQuery<HTMLDivElement>): void;
    openResize(bound: IBound, cb: EditorUpdatedCallback): void;
    openHorizontalResize(bound: IBound, cb: EditorUpdatedCallback): void;
    openVerticalResize(bound: IBound, cb: EditorUpdatedCallback): void;
    close(): void;
    private toggleType;
    private updateStyle;
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
declare class EditorSizeComponent implements IEditorSharedModal {
    private confirmFn;
    private element;
    constructor();
    render(): string;
    private bindEvent;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
    open(data: any, cb: EditorModalCallback): void;
}
declare class EditorTableComponent implements IEditorSharedModal {
    private confirmFn;
    private element;
    render(): string;
    private renderTableRow;
    private renderTable;
    private bindEvent;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
    open(data: any, cb: EditorModalCallback): void;
}
declare class EditorTextComponent implements IEditorSharedModal {
    private label;
    private confirmFn;
    private element;
    constructor(label?: string);
    render(): string;
    private bindEvent;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
    open(data: any, cb: EditorModalCallback): void;
}
declare class EditorVideoComponent implements IEditorSharedModal {
    private confirmFn;
    private option;
    private element;
    render(): string;
    private bindEvent;
    modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager): void;
    open(data: any, cb: EditorModalCallback): void;
    uploadFile(e: any): void;
    uploadFiles(files: FileList | File[]): void;
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
    paste(data: DataTransfer): void;
    private addTextExecute;
    private addLineBreakExecute;
    private indentExecute;
    private outdentExecute;
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
    private appendBr;
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
    paste(data: DataTransfer): void;
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
    private get blockTagName();
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
    private addHrExecute;
    private indentExecute;
    private outdentExecute;
    private tabExecute;
    private addTableExecute;
    private addImageExecute;
    private addTextExecute;
    private addRawExecute;
    private addVideoExecute;
    private addFileExecute;
    private addLinkExecute;
    private addLineBreakExecute;
    private hExecute;
    private blockquoteExecute;
    private listExecute;
    private boldExecute;
    private subExecute;
    private supExecute;
    private italicExecute;
    private underlineExecute;
    private strikeExecute;
    private fontSizeExecute;
    private fontFamilyExecute;
    private backgroundExecute;
    private foregroundExecute;
    private clearStyleExecute;
    private alignExecute;
    private theadExecute;
    private tfootExecute;
    private rowSpanExecute;
    private colSpanExecute;
    private delTableExecute;
    private openLinkExecute;
    getModuleItems(range: IEditorRange): string[];
    private getTableCellSpan;
    private getTableCell;
    /**
     * 移动光标到下一格
     * @param node
     * @returns
     */
    private moveTableFocus;
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
    /**
     * 获取节点的父级
     * @param node
     * @returns
     */
    private getBlockParent;
    private nodeParent;
    /**
     * 判断节点是否处于范围内
     * @param node
     * @returns
     */
    private hasNode;
    private replaceNodeName;
    /**
     * 替换节点为
     * @param node
     * @param newNode
     * @param removeFn 删除旧节点还是移动
     * @returns
     */
    private replaceNode;
    private isNotSelected;
    private selectNode;
    private focusAfter;
    private bindEvent;
    paste(data: DataTransfer): void;
    private isPasteFile;
    private isPasteHtml;
    private pasteFile;
    private pasteHtml;
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
    /**
     * 删除节点
     * @param node
     * @returns
     */
    private removeNode;
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
    /**
     * 判断父级是否只有这一个子节点
     * @param node
     * @returns
     */
    private isOnlyNode;
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
    paste(data: DataTransfer): void;
}
declare const EDITOR_EVENT_INPUT_KEYDOWN = "input.keydown";
declare const EDITOR_EVENT_INPUT_BLUR = "input.blur";
declare const EDITOR_EVENT_INPUT_CLICK = "input.click";
declare const EDITOR_EVENT_MOUSE_UP = "mouse.up";
declare const EDITOR_EVENT_MOUSE_MOVE = "mouse.move";
declare const EDITOR_EVENT_EDITOR_CHANGE = "change";
declare const EDITOR_EVENT_EDITOR_READY = "ready";
declare const EDITOR_EVENT_EDITOR_DESTORY = "destroy";
declare const EDITOR_EVENT_EDITOR_AUTO_SAVE = "auto_save";
declare const EDITOR_EVENT_SELECTION_CHANGE = "selection_change";
declare const EDITOR_EVENT_UNDO_CHANGE = "undo";
declare const EDITOR_EVENT_SHOW_ADD_TOOL = "tool.add";
declare const EDITOR_EVENT_SHOW_LINE_BREAK_TOOL = "tool.line.break";
declare const EDITOR_EVENT_SHOW_IMAGE_TOOL = "tool.image";
declare const EDITOR_EVENT_SHOW_COLUMN_TOOL = "tool.column";
declare const EDITOR_EVENT_SHOW_LINK_TOOL = "tool.link";
declare const EDITOR_EVENT_SHOW_TABLE_TOOL = "tool.table";
declare const EDITOR_EVENT_CLOSE_TOOL = "tool.flow.close";
interface IEditorListeners {
    [EDITOR_EVENT_INPUT_KEYDOWN]: (e: KeyboardEvent) => void;
    [EDITOR_EVENT_INPUT_BLUR]: () => void;
    [EDITOR_EVENT_EDITOR_CHANGE]: () => void;
    [EDITOR_EVENT_INPUT_CLICK]: () => void;
    [EDITOR_EVENT_SHOW_ADD_TOOL]: (y: number) => void;
    [EDITOR_EVENT_CLOSE_TOOL]: () => void;
    [EDITOR_EVENT_SHOW_LINE_BREAK_TOOL]: (p: IPoint) => void;
    [EDITOR_EVENT_SHOW_IMAGE_TOOL]: (b: IBound, cb: EditorUpdatedCallback) => void;
    [EDITOR_EVENT_SHOW_LINK_TOOL]: (p: IPoint, cb: EditorUpdatedCallback) => void;
    [EDITOR_EVENT_SHOW_TABLE_TOOL]: (p: IPoint, cb: EditorUpdatedCallback) => void;
    [EDITOR_EVENT_SHOW_COLUMN_TOOL]: (b: IBound, cb: EditorUpdatedCallback) => void;
    [EDITOR_EVENT_SELECTION_CHANGE]: () => void;
    [EDITOR_EVENT_UNDO_CHANGE]: () => void;
    [EDITOR_EVENT_EDITOR_AUTO_SAVE]: () => void;
    [EDITOR_EVENT_EDITOR_READY]: () => void;
    [EDITOR_EVENT_MOUSE_MOVE]: (p: IPoint) => void;
    [EDITOR_EVENT_MOUSE_UP]: (p: IPoint) => void;
    [EDITOR_EVENT_EDITOR_DESTORY]: () => void;
}
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
    AddLineBreak = "addLineBreak",
    AddHr = "addHr",
    AddText = "addText",
    AddRaw = "addRaw",
    AddImage = "addImage",
    AddLink = "addLink",
    AddTable = "addTable",
    AddVideo = "addVideo",
    AddFile = "addFile",
    AddCode = "addCode",
    H = "h",
    Bold = "bold",
    Italic = "italic",
    Underline = "underline",
    Strike = "strike",
    Wavyline = "wavyline",
    Dashed = "dashed",
    Sub = "sub",
    Sup = "sup",
    FontSize = "fontSize",
    FontFamily = "fontFamily",
    Background = "background",
    Foreground = "foreground",
    ClearStyle = "clearStyle",
    Align = "align",
    List = "list",
    Blockquote = "blockquote",
    Thead = "thead",
    TFoot = "tfoot",
    DeleteTable = "delTable",
    RowSpan = "rowSpan",
    ColSpan = "colSpan",
    OpenLink = "openLink",
    Indent = "indent",
    Outdent = "outdent",
    NodeResize = "nodeResize",
    NodeMove = "nodeMove"
}
interface IEditorBlock {
    [key: string]: any;
    type: EditorBlockType | string;
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
declare const EDITOR_CLOSE_TOOL = "close";
declare const EDITOR_ADD_TOOL = "add";
declare const EDITOR_ENTER_TOOL = "enter";
declare const EDITOR_UNDO_TOOL = "undo";
declare const EDITOR_REDO_TOOL = "redo";
declare const EDITOR_MORE_TOOL = "more";
declare const EDITOR_FULL_SCREEN_TOOL = "full-screen";
declare const EDITOR_CODE_TOOL = "code";
declare const EDITOR_IMAGE_TOOL = "image_edit";
declare const EDITOR_TABLE_TOOL = "table_edit";
declare const EDITOR_VIDEO_TOOL = "video_edit";
declare const EDITOR_LINK_TOOL = "link_edit";
declare const EditorModules: IEditorModule[];
interface IUploadResult {
    url: string;
    size: number;
    title: string;
    thumb?: string;
}
type UploadFileCallback = (files: File[] | File | FileList, success: (data: IUploadResult | IUploadResult[]) => void, failure: (error: string) => void) => void;
interface IEditorOption {
    height?: number | string;
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
    } | UploadFileCallback;
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
    toolUpdatedFn: (items: IEditorToolStatus[]) => void;
    constructor();
    get leftToolbar(): IEditorTool[];
    get rightToolbar(): IEditorTool[];
    get closeTool(): IEditorTool;
    get addTool(): IEditorTool;
    get enterTool(): IEditorTool;
    get blockTag(): string;
    get maxUndoCount(): any;
    set(key: string, value: any): void;
    merge(option: IEditorOption): void;
    get(optionKey: string): any;
    toolOnly(name: string): IEditorTool;
    tool(...names: string[]): IEditorTool[];
    toolChildren(name: string): IEditorTool[];
    toolToggle(modules: string[], active: boolean): void;
    toolToggle(name: string, active: boolean): void;
    push(...modules: IEditorModule[]): void;
    hotKeyModule(hotKey: string): IEditorTool | undefined;
    moduleMap(cb: (item: IEditorModule) => void | false): void;
    toModule(module: string | IEditorTool): IEditorModule | undefined;
    upload(files: File[] | FileList, type: 'image' | 'video' | 'file', success: (data: IUploadResult[]) => void, failure: (error: string) => void): void;
    upload(files: File, type: 'image' | 'video' | 'file', success: (data: IUploadResult) => void, failure: (error: string) => void): void;
    private filterTool;
    private toTool;
    private isVisible;
    private strToArr;
    private mergeObject;
    private isBoolEqual;
    private isSystemTool;
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
    private addLineBreakExecute;
    private indentExecute;
    private outdentExecute;
    private addTextExecute;
    private addCodeExecute;
    private addLinkExecute;
    private addImageExecute;
    private insertText;
    private replaceSelectLine;
    private includeBlock;
    private replaceSelect;
    /**
     * 移动光标到指定位置并focus
     * @param pos
     */
    private moveCursor;
    private bindEvent;
    paste(data: DataTransfer): void;
    private isPasteFile;
    private pasteFile;
}
declare class EditorHelper {
    private static OTHER_WORD_CODE;
    /**
    * 计算内容的长度，排除空格符号等特殊字符
    */
    static wordLength(val: string): number;
    static css(node: HTMLElement, style: any): void;
    static nodeClass(obj: any): string;
    static nodeStyle(obj: any): string;
    static modalInputBind<T = any>(element: JQuery<HTMLDivElement>, confirmFn: (data: T) => void): void;
    private static toggleCheck;
    static modalInputData(element: JQuery<HTMLDivElement>): any;
    static modalInputData<T = any>(element: JQuery<HTMLDivElement>, data: T): T;
    static modalFileUpload(element: JQuery<HTMLDivElement>, uploadFn: (data: FileList) => void): void;
    static uploadFile(url: string, files: File[] | FileList | File, success: (res: any) => void, failure: (message: string) => void, name?: string): void;
    static fileType(file: File): 'image' | 'video' | 'file';
    private static getTransfer;
    private static preventAndStop;
    private static haveFiles;
}
declare class EditorApp {
    /**
    *
    */
    constructor(element: HTMLDivElement | HTMLTextAreaElement, option?: IEditorOption);
    private option;
    container: EditorContainer;
    private codeContainer;
    private box;
    private target;
    private textbox;
    private codebox;
    private subToolbar;
    private flowToolbar;
    private flowLastTool;
    private modalContianer;
    private footerBar;
    private subParentName;
    private isFullScreen;
    private resizer;
    private ready;
    tapTool(item: IEditorTool, isRight: boolean, event: MouseEvent): void;
    tapFlowTool(item: IEditorTool, event: MouseEvent): void;
    insert(block: IEditorBlock | string): void;
    private executeModule;
    private getOffsetPosition;
    private toggleFullScreen;
    private bindEvent;
    private hideModal;
    private toggleFlowbar;
    private toggleSubToolbar;
    private toggleTool;
    private initByDiv;
    private initByInput;
    private renderBase;
    private renderToolIcon;
    private renderToolbar;
}
