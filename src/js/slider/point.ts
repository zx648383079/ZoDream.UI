class Point {
    constructor(
        public index: number,
        x: number | JQuery,
        public width?: number,
        public height?: number
    ) {
        if (typeof x == 'number') {
            this.x = x;
            return;
        }
        this.elements.push(x);
        [this.width, this.height] = this.getElementWidthAndHeight();
        this.x = -this.width;
    }

    public x: number;

    public elements: Array<JQuery> = [];

    /**
     * 取元素的x
     * @param width 
     */
    public getLeft(width: number, align: string): number {
        if (align === 'left') {
            return this.x;
        }
        if (align === 'right') {
            return this.x - this.width + width;
        }
        return this.x - (width - 3 * this.width) / 2;
    }

    /**
     * 获取元素的宽和高
     */
    public getElementWidthAndHeight(): [number, number] {
        return [this.elements[0].width(), this.elements[0].height()];
    }

    /**
     * 应用当前的宽和高
     */
    public applyWidthAndHeight(keepScale = true) {
        let instance = this;
        let [width, height] = this.getElementWidthAndHeight();
        if (keepScale && height === this.height && this.width !== width) {
            // 等比例缩放
            this.height = this.width * height / width;
        }
        $.each(this.elements, function(i, ele) {
            ele.width(instance.width);
            ele.height(instance.height);
        });
    }
}