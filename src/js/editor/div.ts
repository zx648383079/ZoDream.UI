/**
 * 富文本模式
 */
class DivElement implements IEditorElement {
    constructor(
        private element: HTMLDivElement,
        private container: IEditorContainer) {
        this.bindEvent();
    }

    private isComposition = false;

    public get selection(): IEditorRange {
        const sel = window.getSelection();
        if (sel.rangeCount < 1) {
            const range = document.createRange();
            range.setStart(this.element, this.element.children.length);
            range.setEnd(this.element, this.element.children.length);
            return {
                start: this.element.children.length,
                end: this.element.children.length,
                range: range.cloneRange()
            };
        }
        const range = sel.getRangeAt(0);
        return {
            start: range.startOffset,
            end: range.endOffset,
            range: range.cloneRange()
        };
    }
    public set selection(v: IEditorRange) {
        const sel = window.getSelection();
        let range: Range;
        if (v.range) {
            range = v.range;
        } else {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range = range.cloneRange();
            range.setStart(this.element, v.start);
            range.setEnd(this.element, v.end);
        }
        sel.removeAllRanges();
        sel.addRange(range);
    }

    public get selectedValue(): string {
        const items: string[] = [];
        const range = this.selection.range;
        let lastLine: Node;
        this.eachRange(range, node => {
            if (node === range.startContainer && range.startContainer === range.endContainer) {
                items.push(node.textContent.substring(range.startOffset, range.endOffset));
                return;
            }
            if (node.nodeName === 'BR') {
                items.push('\n');
                lastLine = undefined;
                return;
            }
            if (lastLine !== node.parentNode && node.parentNode !== this.element && ['P', 'DIV', 'TR'].indexOf(node.parentNode.nodeName) >= 0) {
                // 这里可以加一个判断 p div tr
                if (lastLine) {
                    items.push('\n');
                }
                lastLine = node.parentNode;
            }
            if (node === range.startContainer) {
                items.push(node.textContent.substring(range.startOffset));
            } else if (node === range.endContainer) {
                items.push(node.textContent.substring(0, range.endOffset));
            }
        });
        return items.join('');
    }

    public set selectedValue(val: string) {
        this.insert({type: EditorBlockType.AddText, text: val});
    }

    public get value(): string {
        return this.element.innerHTML;
    }
    public set value(v: string) {
        this.element.innerHTML = v;
    }

    public get length(): number {
        return this.value.length;
    }
    public get wordLength(): number {
        return wordLength(this.element.innerText);
    }

    public selectAll(): void {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(this.element);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    public insert(block: IEditorBlock, range?: IEditorRange): void {
        if (!range) {
            range = this.selection;
        }
        switch(block.type) {
            case EditorBlockType.AddHr:
                this.insertHr(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddText:
                this.insertText(block as any, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddRaw:
                this.insertRaw(block as any, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.Indent:
                this.insertIndent(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.Outdent:
                this.insertOutdent(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.AddLineBreak:
                this.insertLineBreak(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddImage:
                this.insertImage(block as any, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddTable:
                this.insertTable(block as any, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddVideo:
                this.insertVideo(block as any, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddLink:
                this.insertLink(block as any, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
        }
    }
    public focus(): void {
        this.element.focus({preventScroll: true});
    }

    public blur(): void {
        return this.element.blur();
    }

    private insertHr(range: Range) {
        const hr = document.createElement('hr');
        this.replaceSelected(range, hr);
    }

    private insertIndent(range: Range) {
        const items: Node[] = [];
        this.eachRangeParentNode(range, node => {
            if (this.isBlockNode(node) || node.parentNode === this.element) {
                items.push(node);
                return true;
            }
        });
        for (const item of items) {
            let node: HTMLElement = item as any;
            if (!this.isBlockNode(node)) {
                const p = document.createElement(this.container.option.blockTag);
                p.appendChild(node.cloneNode(true));
                this.element.replaceChild(p, node);
                node = p;
            }
            const style = window.getComputedStyle(node);
            node.style.marginLeft = parseFloat(style.marginLeft.replace('px', '')) + 20 + 'px';
        }
    }

    private insertOutdent(range: Range) {
        this.eachRangeParentNode(range, node => {
            if (!this.isBlockNode(node)) {
                return;
            }
            const ele = node as HTMLDivElement;
            const style = window.getComputedStyle(ele);
            const padding = parseFloat(style.marginLeft.replace('px', '')) - 20;
            ele.style.marginLeft = Math.max(0, padding) + 'px';
            return true;
        });
    }

    private insertTable(block: IEditorTableBlock, range: Range) {
        const table = document.createElement('table');
        table.style.width = '100%';
        const tbody = table.createTBody();
        const tdWidth = 100 / block.column + '%';
        for (let i = 0; i < block.row; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < block.column; j++) {
                const td = document.createElement('td');
                td.appendChild(document.createElement('br'));
                td.style.width = tdWidth;
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        this.replaceSelected(range, table);
    }

    private insertImage(block: IEditorFileBlock, range: Range) {
        const image = document.createElement('img');
        image.src = block.value;
        image.title = block.title || '';
        this.replaceSelected(range, image);
    }

    private insertText(block: IEditorTextBlock, range: Range) {
        const span = document.createElement('span');
        span.innerText = block.value;
        this.replaceSelected(range, span);
    }

    private insertRaw(block: IEditorTextBlock, range: Range) {
        const p = document.createElement('div');
        p.innerHTML = block.value;
        const items = [];
        for (let i = 0; i < p.childNodes.length; i++) {
            items.push(p.childNodes[i]);
        }
        this.replaceSelected(range, ...items);
    }

    private insertVideo(block: IEditorVideoBlock, range: Range) {
        const ele = document.createElement('video');
        ele.src = block.value;
        ele.title = block.title || '';
        this.replaceSelected(range, ele);
    }

    private insertFile(block: IEditorFileBlock, range: Range) {
        const ele = document.createElement('a');
        ele.href = block.value;
        ele.title = block.title || '';
        this.replaceSelected(range, ele);
    }

    private insertLink(block: IEditorLinkBlock, range: Range) {
        const link = document.createElement('a');
        link.href = block.value;
        link.text = block.title;
        if (block.target) {
            link.target = '_blank';
        }
        this.insertElement(link, range);
        this.selectNode(link);
    }

    
    private insertLineBreak(range: Range) {
        let begin = range.startContainer;
        let beginOffset = range.startOffset;
        const p = document.createElement(this.container.option.blockTag);
        if (begin === this.element) {
            p.appendChild(document.createElement('br'));
            if (this.element.children.length === 0) {
                this.insertLast(this.element, p.cloneNode(true), p);
            } else {
                this.insertToChildIndex(p, begin, range.startOffset);
            }
            this.selectNode(p);
            return;
        }
        let addBlock = false;
        this.eachBlockNext(range.endContainer, range.endOffset, node => {
            // 会出现嵌套的情况
            if (node === begin) {
                begin = begin.parentNode;
                beginOffset = 0;
                addBlock = true;
            }
            p.appendChild(node);
        });
        p.appendChild(document.createElement('br'));
        this.removeRange(range);
        // this.insertElement(p, range);
        let next: Node;
        let done = false;
        this.eachParentNode(begin, node => {
            if (this.isBlockNode(node) && node) {
                this.insertAfter(node, p);
                next = undefined;
                done = true;
                return false;
            }
            next = node;
        });
        if (!done) {
            if (next) {
                this.insertAfter(next, p);
            } else {
                this.element.appendChild(p);
            }
        }
        if (addBlock) {
            const ele = document.createElement(this.container.option.blockTag);
            ele.appendChild(document.createElement('br'));
            this.insertBefore(p, ele);
        }
        this.selectNode(p);
    }

    /**
     * 删除选中并替换为新的
     */
    private replaceSelected(range: Range, ...items: Node[]) {
        if (this.isNotSelected(range)) {
            this.insertToElement(range.startContainer, range.startOffset, ...items);
            return;
        }
        this.removeRange(range);
        // this.insertElement(p, range);
        let next: Node;
        let done = false;
        this.eachParentNode(range.startContainer, node => {
            if (this.isBlockNode(node) && node) {
                this.insertAfter(node, ...items);
                next = undefined;
                done = true;
                return false;
            }
            next = node;
        });
        if (!done) {
            if (next) {
                this.insertAfter(next, ...items);
            } else {
                this.insertLast(this.element, ...items);
            }
        }
        this.selectNode(items[items.length - 1]);
    }

    /**
     * 把选中的作为子项包含进去
     */
    private includeSelected(range: Range, parent: Node) {
        this.insertLast(parent, ...this.copySelectedNode(range));
        this.replaceSelected(range, parent);
    }

    /**
     * 切换父级的标签，例如 b strong
     */
    private toggleParentNode(range: Range, tag: string) {

    }

    /**
     * 切换父级的样式 
     */
    private toggleParentStyle(range: Range, style: any) {
        
    }

    private isNotSelected(range: Range) {
        return range.startContainer === range.endContainer && range.startOffset === range.endOffset;
    }

    private selectNode(node: Node, offset = 0) {
        const sel = window.getSelection();
        const range = document.createRange();
        // range.deleteContents();
        // range = range.cloneRange();
        range.setStart(node, offset);
        range.setEnd(node, offset);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    private bindEvent() {
        this.element.addEventListener('keydown', e => {
            this.container.saveSelection();
            this.container.emit(EVENT_INPUT_KEYDOWN, e);
            this.container.emit(EVENT_CLOSE_TOOL);
        });
        this.element.addEventListener('keyup', () => {
            if (this.isComposition) {
                return;
            }
            const range = this.selection.range;
            if (this.isEmptyLine(range)) {
                this.container.emit(EVENT_SHOW_ADD_TOOL, this.getNodeOffset(range.startContainer).y);
                return;
            }
        });
        this.element.addEventListener('compositionstart', () => {
            this.isComposition = true;
            // this.container.saveSelection();
        });
        this.element.addEventListener('compositionend', () => {
            this.isComposition = false;
            this.container.saveSelection();
            this.container.emit(EVENT_SELECTION_CHANGE);
            this.container.emit(EVENT_EDITOR_CHANGE);
        });
        this.element.addEventListener('mouseup', () => {
            this.container.saveSelection();
            this.container.emit(EVENT_SELECTION_CHANGE);
            // console.log([this.selectedValue]);
        });
        this.element.addEventListener('mouseenter', e => {
            if (!e.target) {
                return;
            }
            if (e.target instanceof HTMLHRElement) {
                if (e.target.previousSibling instanceof HTMLHRElement) {
                    this.selectNode(e.target);
                    this.container.emit(EVENT_SHOW_LINE_BREAK_TOOL, this.getNodeOffset(e.target.previousSibling));
                }
            }
        });
        this.element.addEventListener('mousemove', e => {
            // this.container.saveSelection();
            if (!e.target) {
                return;
            }
            if (e.target instanceof HTMLTableCellElement) {
                const td = e.target;
                const x = e.offsetX;
                if (x > 0 && x < 4 && td.previousSibling) {
                    td.style.cursor = 'col-resize';
                    return;
                } else if (td.nextSibling && x > td.clientWidth - 4) {
                    td.style.cursor = 'col-resize';
                    return;
                } else {
                    td.style.cursor = 'auto';
                }
            }
        });
        this.element.addEventListener('mousedown', e => {
            if (!e.target) {
                return;
            }
            if (e.target instanceof HTMLTableCellElement) {
                const td = e.target;
                const x = e.offsetX;
                if (x > 0 && x < 4 && td.previousSibling) {
                    this.moveTableCol(td.previousSibling as any);
                    return;
                } else if (td.nextSibling && x > td.clientWidth - 4) {
                    this.moveTableCol(td);
                    return;
                }
            }
        });
        this.element.addEventListener('touchend', () => {
            this.container.saveSelection();
        });
        this.element.addEventListener('click', e => {
            this.container.saveSelection();
            if (e.target instanceof HTMLImageElement) {
                const img = e.target as HTMLImageElement;
                this.selectNode(img);
                this.container.emit(EVENT_SHOW_IMAGE_TOOL, this.getNodeBound(img), data => this.updateNode(img, data));
                return;
            }
            const range = this.selection.range;
            if (this.isInBlock(range)) {
                return;
            }
            if (this.isEmptyLine(range)) {
                this.container.emit(EVENT_SHOW_ADD_TOOL, this.getNodeOffset(range.startContainer).y);
                return;
            }
            this.container.emit(EVENT_INPUT_CLICK);
            this.container.emit(EVENT_CLOSE_TOOL);
        });
        this.element.addEventListener('blur', () => {
            this.container.saveSelection();
            this.container.emit(EVENT_INPUT_BLUR);
        });
    }

    private moveTableCol(node: HTMLTableCellElement) {
        const table: HTMLTableElement = node.closest('table');
        if (!table) {
            return;
        }
        const base = this.element.getBoundingClientRect();
        const rect = table.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        const x = nodeRect.x + nodeRect.width - base.x;
        this.container.emit(EVENT_SHOW_COLUMN_TOOL, <IBound>{
            x,
            y: table.offsetTop,
            width: 0,
            height: rect.height,
        }, (data: IBound) => {
            const cellIndex = node.cellIndex + node.colSpan;
            const pre = (data.x - x) * 100 / rect.width;
            for (let i = 0; i < table.rows.length; i++) {
                const tr = table.rows[i];
                for (let j = 0; j < tr.cells.length; j++) {
                    const cell = tr.cells[j];
                    if (cell.cellIndex + cell.colSpan === cellIndex) 
                    {
                        cell.style.width = parseFloat(cell.style.width.replace('%', '')) + pre + '%';
                        const next = tr.cells[j + 1];
                        next.style.width = parseFloat(next.style.width.replace('%', '')) - pre + '%';
                    }
                }
            }
        });
    }

    private updateNode(node: HTMLElement, data: IEditorBlock) {
        if (data.type === EditorBlockType.NodeResize) {
            const bound = data as IEditorResizeBlock;
            node.style.width = bound.width + 'px';
            node.style.height = bound.height + 'px';
        }
    }

    /**
     * 遍历选中的所有元素，最末端的元素，无子元素
     * @param range 
     * @param cb 
     */
    private eachRange(range: Range, cb: (node: Node) => void|false) {
        const begin = range.startContainer;
        const end = range.endContainer;
        if (cb(begin) === false) {
            return;
        }
        let current = begin;
        while (current !== end) {
            let next = this.nextNode(current);
            if (!next) {
                break;
            }
            if (next === end) {
                cb(next);
                break;
            }
            while (next.hasChildNodes()) {
                next = next.firstChild;
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

    public insertElement(node: Node, range: Range) {
        this.insertToElement(range.startContainer, range.startOffset, node);
    }

    private insertToElement(current: Node, offset: number, ...items: Node[]) {
        const isText = current instanceof Text;
        if (offset < 1) {
            if (isText) {
                this.insertBefore(current, ...items);
                return;
            }
            this.insertFirst(current, ...items);
            return;
        }
        const max = isText ? current.length : current.childNodes.length;
        if (offset >= max) {
            if (isText) {
                this.insertAfter(current, ...items);
                return;
            }
            this.insertLast(current, ...items);
            return;
        }
        if (isText) {
            this.insertBefore(current.splitText(offset), ...items);
            return;
        }
        this.insertBefore(current.childNodes[offset], ...items);
    }

    /**
     * 在内部前面添加子节点
     * @param current 
     * @param items 
     */
    private insertFirst(current: Node, ...items: Node[]) {
        if (current.childNodes.length < 1) {
            this.insertLast(current, ...items);
            return;
        }
        this.insertBefore(current.childNodes[0], ...items);
    }

    /**
     * 在子节点最后添加元素
     * @param current 
     * @param items 
     */
    private insertLast(current: Node, ...items: Node[]) {
        for (const item of items) {
            current.appendChild(item);
        }
    }

    /**
     * 在元素之前添加兄弟节点
     * @param current 
     * @param items 
     */
    private insertBefore(current: Node, ...items: Node[]) {
        const parent = current.parentNode;
        for (const item of items) {
            parent.insertBefore(item, current);
        }
    }

    /**
     * 在元素之后添加兄弟节点
     * @param current 
     * @param items 
     * @returns 
     */
    private insertAfter(current: Node, ...items: Node[]) {
        if (current.nextSibling) {
            this.insertBefore(current.nextSibling, ...items);
            return;
        }
        this.insertLast(current.parentNode, ...items);
    }

    private insertToChildIndex(newEle: HTMLElement, parent: Node, index: number) {
        if (parent.childNodes.length <= index) {
            parent.appendChild(newEle);
            return;
        }
        parent.insertBefore(newEle, parent.childNodes[index]);
    }

    private removeRange(range: Range) {
        if (range.startContainer === range.endContainer) {
            if (range.startOffset === range.endOffset) {
                return;
            }
            if (range.startContainer instanceof Text) {
                const text = range.startContainer.textContent;
                range.startContainer.textContent = text.substring(0, range.startOffset) + text.substring(range.endOffset);
                return;
            }
            for (let i = range.endOffset; i >= range.startOffset; i--) {
                range.startContainer.removeChild(range.startContainer.childNodes[i]);
            }
            return;
        }
        const beginParentItems: Node[] = [];
        this.eachParentNode(range.startContainer, node => {
            beginParentItems.push(node);
        });
        const endParentItems: Node[] = [];
        this.eachParentNode(range.endContainer, node => {
            const i = beginParentItems.indexOf(node);
            if (i < 0) {
                endParentItems.push(node);
                return;
            }
            beginParentItems.splice(i, beginParentItems.length - i);
            return false;
        });
        const max = Math.max(beginParentItems.length, endParentItems.length);
        for (let i = 1; i <= max; i++) {
            const begin = beginParentItems.length - i;
            const end = endParentItems.length - i;
            const beginNode = begin >= 0 ? beginParentItems[begin] : undefined;
            const endNode = end >= 0 ? endParentItems[end] : undefined;
            if (beginNode) {
                this.eachNextBrother(beginNode, n => {
                    if (!n || n === beginNode || n === endNode) {
                        return;
                    }
                    n.parentNode.removeChild(n);
                }, endNode);
            }
            if (endNode && (!beginNode || endNode.parentNode !== beginNode.parentNode)) {
                this.eachBrother(endNode, n => {
                    if (n === endNode) {
                        return false;
                    }
                    if (n === beginNode) {
                        return;
                    }
                    n.parentNode.removeChild(n);
                }, false);
            }
        }
        if (range.startContainer instanceof Text) {
            const text = range.startContainer.textContent;
            range.startContainer.textContent = text.substring(0, range.startOffset);
        } else {
            for (let i = range.startContainer.childNodes.length - 1; i >= range.startOffset; i--) {
                range.startContainer.removeChild(range.startContainer.childNodes[i]);
            }
        }
        if (range.endContainer instanceof Text) {
            const text = range.endContainer.textContent;
            range.endContainer.textContent = text.substring(range.endOffset);
        } else {
            for (let i = range.endOffset - 1; i >= 0; i--) {
                range.endContainer.removeChild(range.endContainer.childNodes[i]);
            }
        }
        return;
    }

    private copySelectedNode(range: Range): Node[] {
        if (range.startContainer === range.endContainer) {
            if (range.startOffset === range.endOffset) {
                return [];
            }
            return this.copyRangeNode(range.startContainer, range.startOffset, range.endOffset);
        }
        const beginParentItems: Node[] = [];
        this.eachParentNode(range.startContainer, node => {
            beginParentItems.push(node);
        });
        const endParentItems: Node[] = [];
        this.eachParentNode(range.endContainer, node => {
            const i = beginParentItems.indexOf(node);
            if (i < 0) {
                endParentItems.push(node);
                return;
            }
            beginParentItems.splice(i, beginParentItems.length - i);
            return false;
        });
        const max = Math.max(beginParentItems.length, endParentItems.length);
        let items = [];
        let lastBegin: Node;
        let lastEnd: Node;
        for (let i = 1; i <= max; i++) {
            const begin = beginParentItems.length - i;
            const end = endParentItems.length - i;
            const beginNode = begin >= 0 ? beginParentItems[begin] : undefined;
            const endNode = end >= 0 ? endParentItems[end] : undefined;
            if (beginNode) {
                this.eachNextBrother(beginNode, n => {
                    const cloneN = n.cloneNode(n === beginNode || n === endNode);
                    if (i < 1) {
                        items.push(cloneN);
                    } else {
                        lastBegin.appendChild(cloneN);
                    }
                    if (n === beginNode) {
                        lastBegin = cloneN;
                    }
                    if (n === endNode) {
                        lastEnd = cloneN;
                        return false;
                    }
                }, endNode);
            }
            if (endNode && (!beginNode || endNode.parentNode !== beginNode.parentNode)) {
                this.eachBrother(endNode, n => {
                    const cloneN = n.cloneNode(n === endNode);
                    if (i < 1) {
                        items.push(cloneN);
                    } else {
                        lastEnd.appendChild(cloneN);
                    }
                    if (n === endNode) {
                        lastEnd = cloneN;
                        return false;
                    }
                }, false);
            }
        }
        if (!lastBegin) {
            items = [].concat(this.copyRangeNode(range.startContainer, range.startOffset), items);
        } else {
            this.insertLast(lastBegin, ...this.copyRangeNode(range.startContainer, range.startOffset));
        }
        if (!lastEnd) {
            items.push(...this.copyRangeNode(range.endContainer, 0, range.endOffset));
        } else {
            this.insertLast(lastEnd, ...this.copyRangeNode(range.endContainer, 0, range.endOffset));
        }
    }

    private copyRangeNode(current: Node, start: number, end?: number): Node[] {
        if (current instanceof Text) {
            return [new Text(current.textContent.substring(start, end))];
        }
        const items = [];
        for (let i = start; i < current.childNodes.length; i++) {
            if (end && i > end) {
                return;
            }
            items.push(current.childNodes[i].cloneNode(true));
        }
        return items;
    }

    private indexOfNode(items: NodeListOf<Node>, find: Node): number {
        for (let i = 0; i < items.length; i++) {
            if (items[i] === find) {
                return i;
            }
        }
        return -1;
    }

    /**
     * 遍历兄弟节点，包含自身
     * @param node 
     * @param cb 
     * @param isNext 
     * @returns 
     */
    private eachBrother(node: Node, cb: (node: Node) => false|void, isNext = true) {
        if (!node.parentNode) {
            return;
        }
        let found = isNext;
        const parent = node.parentNode;
        for (let i = parent.children.length - 1; i >= 0; i--) {
            const item = parent.children[i];
            if (item === node) {
                if (cb(item) === false) {
                    break;
                }
                if (isNext) {
                    break;
                }
                found = true;
            }
            if (found && cb(item) === false) {
                break;
            }
        }
    }

    private eachNextBrother(node: Node, cb: (node: Node) => false|void, end?: Node) {
        if (!node.parentNode) {
            return;
        }
        const parent = node.parentNode;
        const j = end ? this.indexOfNode(parent.childNodes, end) : -1;
        let i = j < 0 ? parent.childNodes.length - 1 : j;
        for (; i >= 0; i--) {
            const item = parent.children[i];
            if (item === node) {
                cb(item);
                break;
            }
            if (cb(item) === false) {
                break;
            }
        }
    }

    private eachBlockNext(current: Node, offset: number, cb: (node: Node) => void) {
        if (current === this.element) {
            return;
        }
        if (offset < 1) {
            cb(current);
        } else if (current instanceof Text && current.length > offset) {
            cb(current.splitText(offset));
        }
        let node = current;
        while (true) {
            if (!node.nextSibling) {
                if (this.element === node.parentNode || this.isBlockNode(node.parentNode)) {
                    break;
                }
                node = node.parentNode;
                continue;
            }
            node = node.nextSibling;
            if (node.nodeName === 'BR' || this.isBlockNode(node)) {
                break;
            }
            cb(node);
        }
    }

    private isBlockNode(node: Node) {
        return node.nodeName === 'P' || node.nodeName === 'DIV';
    }

    /**
     * 判断当前是否是在某一个特殊的范围内
     * @param range 
     * @returns 
     */
    private isInBlock(range: Range): boolean {
        const linkTag = ['A'];
        const tableTag = ['TABLE', 'TD', 'TR', 'TH'];
        let event: keyof IEditorListeners|undefined;
        this.eachParentNode(range.startContainer, node => {
            if (linkTag.indexOf(node.nodeName) >= 0) {
                event = EVENT_SHOW_LINK_TOOL;
                return false;
            }
            if (tableTag.indexOf(node.nodeName) >= 0) {
                event = EVENT_SHOW_TABLE_TOOL;
                return false;
            }
        });
        if (event) {
            this.container.emit(event, this.getNodeOffset(range.startContainer));
        }
        return !!event;
    }

    /**
     * 获取当前作用的样式
     * @param node 
     * @returns 
     */
    private getNodeStyle(node: Node): string[] {
        const styleTag = ['B', 'EM', 'I', 'STRONG'];
        const items = [];
        this.eachParentNode(node, cur => {
            if (styleTag.indexOf(cur.nodeName) >= 0) {
                items.push(cur.nodeName);
            }
        });
        return items;
    }

    /**
     * 向上遍历父级
     * @param node 
     * @param cb 包含自身
     */
    private eachParentNode(node: Node, cb: (node: Node) => void|false) {
        let current = node;
        while (true) {
            if (current === this.element) {
                break;
            }
            if (cb(current) === false) {
                break;
            }
            current = current.parentNode;
        }
    }

    /**
     * 循环遍历选中项的父元素
     * @param range 
     * @param cb 返回 true中断某一个子元素的父级查找， 返回false 中断整个查找
     */
    private eachRangeParentNode(range: Range, cb: (node: Node) => void|boolean) {
        const exist: Node[] = [];
        this.eachRange(range, node => {
            let isEnd = false;
            this.eachParentNode(node, cur => {
                if (exist.indexOf(cur) >= 0) {
                    return false;
                }
                const res = cb(cur);
                if (typeof res !== 'boolean') {
                    return;
                }
                if (res === false) {
                    isEnd = true;
                }
                return false;
            });
            if (isEnd) {
                return false;
            }
        });
    }

    /**
     * 获取下一个相邻的元素，不判断最小子元素
     * @param node 
     * @returns 
     */
    private nextNode(node: Node): Node|undefined {
        if (node.nextSibling) {
            return node.nextSibling;
        }
        if (node.parentNode === this.element) {
            return undefined;
        }
        return this.nextNode(node.parentNode); 
    }

    /**
     * 拆分元素
     * @param node 
     * @param offset 
     * @returns 
     */
    private splitNode(node: Node, offset: number): Node {
        if (offset < 1) {
            return node;
        }
        if (!node.parentNode) {
            return node;
        }
        if (node instanceof Text && node.length > offset) {
            return node.splitText(offset)
        }
        return node;
    }

    private getNodeOffset(node: Node):IPoint {
        if (node.nodeType !== 1) {
            node = node.parentNode;
        }
        if (node === this.element) {
            const style = getComputedStyle(this.element);
            return {
                x: parseFloat(style.getPropertyValue('padding-left')),
                y: parseFloat(style.getPropertyValue('padding-top')),
            };
        }
        // rect = elem.getBoundingClientRect();
		// win = elem.ownerDocument.defaultView;
		// return {
		// 	    top: rect.top + win.pageYOffset,
		// 	    left: rect.left + win.pageXOffset
		// };
        return {
            y: (node as HTMLDivElement).offsetTop,
            x: (node as HTMLDivElement).offsetLeft
        };
    }

    private getNodeBound(node: Node): IBound {
        if (node.nodeType !== 1) {
            node = node.parentNode;
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

    private isEndNode(node: Node, offset: number): boolean {
        if (node instanceof Text) {
            return node.length <= offset;
        }
        if (node.childNodes.length < 1) {
            return true;
        }
        if (node.childNodes.length == 1 && node.childNodes[0].nodeName === 'BR') {
            return true;
        }
        return false;
    }

    private isEmptyLine(range: Range): boolean {
        if (range.startOffset !== range.endOffset ||range.startOffset > 0) {
            return false;
        }
        if (range.startContainer !== range.endContainer) {
            return false;
        }
        return this.isEmptyLineNode(range.startContainer);
    }

    private isEmptyLineNode(node: Node): boolean {
        if (node.nodeType !== 1) {
            return false;
        }
        for (let i = 0; i < node.childNodes.length; i++) {
            const element = node.childNodes[i];
            if (element.nodeName !== 'BR') {
                return false;
            }
            return true;
        }
        return true;
    }
}