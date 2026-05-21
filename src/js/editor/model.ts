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
    execute(block: IEditorCommand|string): void;
}
interface IImageUploadEvent {
    files: FileList;
    target: IEditor;
}

interface IEditorRange {
    get start(): number;
    get end(): number;
    get text(): string;
    get range(): Range|undefined;
    get offset(): IBound;
    get properties(): any;

    property(name: string): any;
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

enum EditorCommandType {
    AddLineBreak = 'addLineBreak',
    AddHr = 'addHr',
    AddText = 'addText',
    AddRaw = 'addRaw',
    AddImage = 'addImage',
    AddLink = 'addLink',
    AddTable = 'addTable',
    AddVideo = 'addVideo',
    AddFile = 'addFile',
    AddCode = 'addCode',
    AddFrame = 'addFrame',
    H = 'h',
    Bold = 'bold',
    Italic = 'italic',
    Underline = 'underline',
    Strike = 'strike',
    Wavyline = 'wavyline',
    Dashed = 'dashed',
    Sub = 'sub',
    Sup = 'sup',
    FontSize = 'fontSize',
    FontFamily = 'fontFamily',
    Background = 'background',
    Foreground = 'foreground',
    ClearStyle = 'clearStyle',
    Align = 'align',
    List = 'list',
    Blockquote = 'blockquote',

    Thead = 'thead',
    TFoot = 'tfoot',
    DeleteTable = 'delTable',
    DeleteRow = 'delRow',
    DeleteCol = 'delCol',
    AddRow = 'addRow',
    AddCol = 'addCol',
    RowSpan = 'rowSpan',
    ColSpan = 'colSpan',

    OpenLink = 'openLink',
    Unlink = 'unlink',
    Indent = 'indent',
    Outdent = 'outdent',
    NodeResize = 'nodeResize',
    NodeMove = 'nodeMove',
    NodeTitle = 'nodeTitle',
    NodeRemove = 'nodeRemove',
}

interface IEditorCommand {
    [key: string]: any;
    type: EditorCommandType|string;
}

interface IEditorValueCommand extends IEditorCommand {
    value: string,
}

interface IEditorSizeCommand extends IEditorCommand {
    width: string|number;
    height: string|number;
}

interface IEditorResizeCommand extends IEditorSizeCommand {
    x: number;
    y: number;
}

interface IEditorTableCommand extends IEditorCommand {
    row: number;
    column: number;
}

interface IEditorVideoCommand extends IEditorValueCommand {
    code: string;
    autoplay: boolean;
}

interface IEditorImageCommand extends IEditorValueCommand {
    title: string,
    caption: string;
}

interface IEditorFileCommand extends IEditorValueCommand {
    title: string,
    size: number;
}

interface IEditorLinkCommand extends IEditorValueCommand {
    title: string,
    target: boolean;
}

interface IEditorCodeCommand extends IEditorValueCommand {
    language: string;
}

interface IEditorTextCommand extends IEditorValueCommand {
    cursor?: number; // 移动指针
}
interface IEditorInclueCommand extends IEditorCommand {
    begin: string,
    end: string;
    cursor?: number; // 移动指针
}
