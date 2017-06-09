interface DialogButton {
    content: string,
    tag?: string
}

interface DialogOption {
    [setting: string]: any,
    content?: string,   //内容
    url?: string,       // ajax请求
    ico?: string,       // 标题栏的图标
    title?: string,     // 标题
    button?: string | string[]| DialogButton[],
    hasYes?: boolean | string; // 是否有确定按钮
    hasNo?: boolean | string;  // 是否有取消按钮
    extra?: string,       //额外的class
    count?: number, // 动画按钮的个数
    type?: string | number | DialogType,
    canMove?: boolean,        //是否允许移动
    target?: JQuery,           // 载体 显示在那个内容上，默认全局, position 需要自己设置 relative、absolute、fixed
    onclosing?: (element: DialogElement) => any, // 关闭请求， 是否关闭， 返回false 为不关闭

    width?: number,
    height?: number,
    x?: number,
    y?: number,
    direction?: DialogDirection | string | number,
    ondone?: Function        //点确定时触发
}