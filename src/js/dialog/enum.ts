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