/**
 * 弹出框类型
 */
enum DialogType {
    tip,
    message,
    notify,
    pop,
    loading,
    select,
    image,
    disk,
    form,
    content,
    box,
    page
}

/**
 * 弹出框位置
 */
enum DialogDirection {
    top,
    right,
    bottom,
    left,
    center,
    leftTop,
    rightTop,
    rightBottom,
    leftBottom
}

/**
 * 弹出框状态
 */
enum DialogStatus {
    hide,
    show,
    closing,   //关闭中
    closed    //已关闭
}

enum DialogDiskType {
    file,
    directory
}

const DIALOG_SHOW = 'dialog_show';
const DIALOG_HIDE = 'dialog_hide';
const DIALOG_CLOSE = 'dialog_close';
const DIALOG_CLOSING = 'dialog_closing';
const DIALOG_LOADED = 'dialog_loaded';
const DIALOG_ASYNC = 'dialog_async';
const DIALOG_DONE = 'dialog_done';
const _DIALOG_DONE = 'done';
const _DIALOG_CANCEL = 'cancel';
const _DIALOG_SHOW = 'show';
const _DIALOG_HIDE = 'hide';
const _DIALOG_CLOSE = 'closed';
const _DIALOG_CLOSING = 'closing';