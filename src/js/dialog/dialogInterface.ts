interface DialogInterfae {

    status: DialogStatus;

    x: number;

    y: number;

    /**
     * 显示
     */
    show(): this;

    /**
     * 隐藏
     */
    hide(): this;

    /**
     * 关闭
     */
    close(): this;

    /**
     * 显示隐藏切换
     */
    toggle(): this;

    /**
     * 设置css
     */
    css(key: any, value?: string| number): this;

    top(top?: number): this | number;

    left(left?: number): this | number;

    width(width?: number): this | number;

    addClass(name: string): this;

    hasClass(name: string): boolean;

    removeClass(name: string): this;
}