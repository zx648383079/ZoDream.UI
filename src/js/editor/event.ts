const EVENT_INPUT_KEYDOWN = 'input.keydown';
const EVENT_INPUT_BLUR = 'input.blur';
const EVENT_INPUT_CLICK = 'input.click';
const EVENT_MOUSE_UP = 'mouse.up';
const EVENT_MOUSE_MOVE = 'mouse.move';

const EVENT_EDITOR_CHANGE = 'change';
const EVENT_EDITOR_READY = 'ready';
const EVENT_EDITOR_DESTORY = 'destroy';
const EVENT_EDITOR_AUTO_SAVE = 'auto_save'; // 自动保存跟内容变化不一样，自动保存步骤少于内容变化
const EVENT_SELECTION_CHANGE = 'selection_change';
const EVENT_UNDO_CHANGE = 'undo';

const EVENT_SHOW_ADD_TOOL = 'tool.add';
const EVENT_SHOW_LINE_BREAK_TOOL = 'tool.line.break';
const EVENT_SHOW_IMAGE_TOOL = 'tool.image';
const EVENT_SHOW_COLUMN_TOOL = 'tool.column';
const EVENT_SHOW_LINK_TOOL = 'tool.link';
const EVENT_SHOW_TABLE_TOOL = 'tool.table';
const EVENT_CLOSE_TOOL = 'tool.flow.close';

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

const EDITOR_CLOSE_TOOL = 'close';
const EDITOR_ADD_TOOL = 'add';
const EDITOR_ENTER_TOOL = 'enter';
const EDITOR_UNDO_TOOL = 'undo';
const EDITOR_REDO_TOOL = 'redo';
const EDITOR_FULL_SCREEN_TOOL = 'full-screen';
const EDITOR_CODE_TOOL = 'code';
const EDITOR_IMAGE_TOOL = 'image_edit';
const EDITOR_TABLE_TOOL = 'table_edit';
const EDITOR_VIDEO_TOOL = 'video_edit';
const EDITOR_LINK_TOOL = 'link_edit';

type EditorUpdatedCallback<T = IEditorBlock> = (data: T) => void;
