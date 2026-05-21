class EditorElementRange implements IEditorRange {

    constructor(
        private source: Range,
        private element: HTMLDivElement,
        private node?: Node
    ) {
        if (!this.node) {
            this.node = this.source.startContainer;
        }
    }



    public get start(): number {
        return this.source.startOffset;
    }
    public get end(): number {
        return this.source.endOffset;
    }
    public get text(): string {
        if (this.node) {
            return this.node.textContent ?? '';
        }
        return EditorElementRange.toText(this.source, this.element);
    }
    public get range(): Range | undefined {
        return this.source;
    }
    public get offset(): IBound {
        return this.getNodeBound(this.node ?? this.element);
    }
    public get properties(): any {
        return {};
    }

    public property(name: string): any {
        return undefined;
    }

    private getNodeBound(node: Node): IBound {
        if (node.nodeType !== 1) {
            node = node.parentNode!;
        }
        if (node === this.element) {
            const style = getComputedStyle(this.element);
            return {
                x: parseFloat(style.getPropertyValue('padding-left')),
                y: parseFloat(style.getPropertyValue('padding-top')),
                width: 0,
                height: 0,
            };
        }
        const ele = node as HTMLDivElement;
        const rect = ele.getBoundingClientRect();
        return {
            y: ele.offsetTop,
            x: ele.offsetLeft,
            width: rect.width,
            height: rect.height
        };
    }
    
    private getLinkBlock(ele: HTMLAnchorElement): any {
        return {
            value: ele.getAttribute('href'),
            title: ele.innerText,
            target: ele.getAttribute('target') === '_blank'
        };
    }

    private getImageBlock(ele: HTMLImageElement): any {
        return {
            value: ele.getAttribute('src'),
            title: ele.getAttribute('title'),
            caption: ele.getAttribute('alt'),
        };
    }

    private getVideoBlock(ele: HTMLVideoElement): any {
        return {
            value: ele.getAttribute('src'),
            title: ele.getAttribute('title')
        };
    }

    private getFrameBlock(ele: HTMLIFrameElement): any {
        return {
            value: ele.getAttribute('src'),
        };
    }


    /**
     * 将 range 转成字符
     * @param range 
     * @param exclude 
     * @returns 
     */
    public static toText(range: Range, exclude?: Node): string {
        const items: string[] = [];
        let lastLine: Node| undefined| null;
        this.each(range, node => {
            if (node === range.startContainer && range.startContainer === range.endContainer) {
                items.push(node.textContent!.substring(range.startOffset, range.endOffset));
                return;
            }
            if (node.nodeName === 'BR') {
                items.push('\n');
                lastLine = undefined;
                return;
            }
            if (lastLine !== node.parentNode && node.parentNode !== exclude && ['P', 'DIV', 'TR'].indexOf(node.parentNode!.nodeName) >= 0) {
                // 这里可以加一个判断 p div tr
                if (lastLine) {
                    items.push('\n');
                }
                lastLine = node.parentNode;
            }
            if (node === range.startContainer) {
                items.push(node.textContent!.substring(range.startOffset));
            } else if (node === range.endContainer) {
                items.push(node.textContent!.substring(0, range.endOffset));
            }
        }, exclude);
        return items.join('');
    }

    /**
     * 遍历选中的所有元素，最末端的元素，无子元素
     * @param range 
     * @param cb 
     */
    public static each(range: Range, cb: (node: Node) => void|false, exclude?: Node) {
        const begin = range.startContainer;
        const end = range.endContainer;
        if (cb(begin) === false || end === begin) {
            return;
        }
        let current = begin;
        while (current !== end) {
            let next = this.next(current, exclude);
            if (!next) {
                break;
            }
            if (next === end) {
                cb(next);
                break;
            }
            while (next && next.hasChildNodes()) {
                next = next.firstChild!;
                if (next === end) {
                    break;
                }
            }
            if (cb(next) === false) {
                break;
            }
            current = next;
        }
    }

    /**
     * 获取下一个相邻的元素，不判断最小子元素
     * @param node 
     * @returns 
     */
    public static next(node: Node, exclude?: Node): Node|undefined {
        if (node.nextSibling) {
            return node.nextSibling;
        }
        if (node.parentNode === exclude) {
            return undefined;
        }
        return this.next(node.parentNode!); 
    }
}