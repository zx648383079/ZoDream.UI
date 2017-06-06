abstract class Box extends Eve {

    public element: JQuery;

    public box: JQuery;

    protected showPosition(): this {
        this.setPosition();
        this.box.show();
        return this;
    }

    protected setPosition(): this {
        let offset = this.element.offset();
        let x = offset.left - $(window).scrollLeft();
        let y = offset.top + this.element.outerHeight() - $(window).scrollTop();
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