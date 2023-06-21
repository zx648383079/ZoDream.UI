const EDITOR_EVENT_INPUT_KEYDOWN = 'input.keydown';
const EDITOR_EVENT_INPUT_BLUR = 'input.blur';
const EDITOR_EVENT_INPUT_CLICK = 'input.click';
const EDITOR_EVENT_MOUSE_UP = 'mouse.up';
const EDITOR_EVENT_MOUSE_MOVE = 'mouse.move';

const EDITOR_EVENT_EDITOR_CHANGE = 'change';
const EDITOR_EVENT_EDITOR_READY = 'ready';
const EDITOR_EVENT_EDITOR_DESTORY = 'destroy';
const EDITOR_EVENT_EDITOR_AUTO_SAVE = 'auto_save'; // 自动保存跟内容变化不一样，自动保存步骤少于内容变化
const EDITOR_EVENT_SELECTION_CHANGE = 'selection_change';
const EDITOR_EVENT_UNDO_CHANGE = 'undo';

const EDITOR_EVENT_SHOW_ADD_TOOL = 'tool.add';
const EDITOR_EVENT_SHOW_LINE_BREAK_TOOL = 'tool.line.break';
const EDITOR_EVENT_SHOW_IMAGE_TOOL = 'tool.image';
const EDITOR_EVENT_SHOW_COLUMN_TOOL = 'tool.column';
const EDITOR_EVENT_SHOW_LINK_TOOL = 'tool.link';
const EDITOR_EVENT_SHOW_TABLE_TOOL = 'tool.table';
const EDITOR_EVENT_CLOSE_TOOL = 'tool.flow.close';

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
