interface DialogOption {
    [setting: string]: any,
    content?: string,   //内容
    type?: string | number | DialogType,
    closeAnimate?: boolean,
    target?: JQuery,           // 载体 显示在那个内容上，默认全局, position 需要自己设置 relative、absolute、fixed
    onclosing?: () => any, // 关闭请求， 是否关闭， 返回false 为不关闭
}