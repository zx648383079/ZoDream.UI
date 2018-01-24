abstract class Box extends Eve {

    public element: JQuery;

    public box: JQuery;

    protected showPosition(): this {
        this.setPosition();
        this.box.show();
        return this;
    }

    /**
     * 自适应布局
     */
    protected setPosition(): this {
        let offset = this.element.offset();
        let x = offset.left;
        let boxWidth = this.box.outerWidth();
        let windowLeft = $(window).scrollLeft();
        let windowRight = windowLeft + $(window).width();
        if (windowRight - boxWidth < x && windowRight < x + boxWidth) {
            x = windowRight - boxWidth;
        }
        let boxHeight = this.box.outerHeight();
        let windowTop = $(window).scrollTop();
        let windowHeight = $(window).height();
        let inputHeight = this.element.outerHeight();
        let y = offset.top + inputHeight;
        if (y + boxHeight > windowTop + windowHeight && offset.top - boxHeight > windowTop) {
            y = offset.top - boxHeight;
        }
        this.box.css({left: x + "px", top: y + "px"});
        return this;
    }


    /**
     * 根据可能是相对值获取绝对值
     * @param abservable 
     * @param reltive 
     */
    public static getReal(abservable: number, reltive: number): number {
        if (reltive > 1) {
            return reltive;
        }
        return abservable * reltive;
    }
}