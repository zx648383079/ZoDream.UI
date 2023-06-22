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
    insert(block: IEditorBlock|string): void;
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

enum EditorBlockType {
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
    H = 'h',
    Bold = 'bold',
    Italic = 'italic',
    Underline = 'underline',
    Strike = 'strike',
    FontSize = 'fontSize',
    FontFamily = 'fontFamily',
    Background = 'background',
    Foreground = 'foreground',
    ClearStyle = 'clearStyle',
    Align = 'align',
    Blockquote = 'blockquote',
    Indent = 'indent',
    Outdent = 'outdent',
    NodeResize = 'nodeResize',
    NodeMove = 'nodeMove',
}

interface IEditorBlock {
    [key: string]: any;
    type: EditorBlockType|string;
}

interface IEditorValueBlock extends IEditorBlock {
    value: string,
}

interface IEditorSizeBlock extends IEditorBlock {
    width: string|number;
    height: string|number;
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
    title: string,
    size: number;
}

interface IEditorLinkBlock extends IEditorValueBlock {
    title: string,
    target: boolean;
}

interface IEditorCodeBlock extends IEditorValueBlock {
    language: string;
}

interface IEditorTextBlock extends IEditorValueBlock {
    cursor?: number; // 移动指针
}
interface IEditorInclueBlock extends IEditorBlock {
    begin: string,
    end: string;
    cursor?: number; // 移动指针
}
