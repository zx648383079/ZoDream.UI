class CodeElement implements IEditorElement {

    private linePanel: HTMLDivElement;
    private bodyPanel: HTMLDivElement;
    private isComposition = false;

    constructor(
        private element: HTMLDivElement,
        private container: IEditorContainer) {
        this.init();
        this.bindEvent();
    }

    public get selection(): IEditorRange {
        const sel = window.getSelection();
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
            range.setStart(this.bodyPanel, v.start);
            range.setEnd(this.bodyPanel, v.end);
        }
        sel.removeAllRanges();
        sel.addRange(range);
    }
    public get selectedValue(): string {
        return '';
    }
    public set selectedValue(v: string) {
        const range = this.selection.range;
        this.addTextExecute(range, {value: v} as any);
    }
    public get value(): string {
        const items = [];
        this.eachLine(dt => {
            items.push(dt.textContent.replace('\n', ''));
        });
        return items.join('\n');
    }
    public set value(v: string) {
        this.bodyPanel.innerHTML = '';
        v.split('\n').forEach(line => {
            this.addLine(line);
        });
    }
    public get length(): number {
        return this.value.length;
    }
    public get wordLength(): number {
        return EditorHelper.wordLength(this.value);
    }
    public selectAll(): void {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(this.bodyPanel);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    public insert(block: IEditorBlock, range?: IEditorRange): void {
        if (!range) {
            range = this.selection;
        }
        const type = block.type === EditorBlockType.AddRaw ? EditorBlockType.AddText : block.type;
        const func = this[type + 'Execute'];
        if (typeof func === 'function') {
            func.call(this, range.range, block);
            return;
        }
        throw new Error(`insert type error:[${block.type}]`);
    }


    public focus(): void {
        this.bodyPanel.focus({preventScroll: true});
    }
    public blur(): void {
        return this.bodyPanel.blur();
    }

    public destroy(): void {

    }

    private init() {
        this.linePanel = document.createElement('div');
        this.linePanel.className = 'editor-line-numbers';
        this.bodyPanel = document.createElement('div');
        this.bodyPanel.className = 'editor-content';
        this.bodyPanel.contentEditable = 'true';
        this.bodyPanel.spellcheck = false;
        this.element.appendChild(this.linePanel);
        this.element.appendChild(this.bodyPanel);
        this.addLine();
    }

    private bindResize() {
        // let lastWidth = '';
        let lastHeight = 0;
        const resizeObserver = new ResizeObserver(entries => {
            for (const item of entries) {
                if (item.contentRect.height === lastHeight) {
                    continue;
                }
                if (lastHeight === 0) {
                    this.updateLineNoStyle();
                }
                lastHeight = item.contentRect.height;
            }
        });
        resizeObserver.observe(this.element);
        this.container.on(EDITOR_EVENT_EDITOR_DESTORY, () => {
            resizeObserver.disconnect();
        });
    }

    private bindEvent() {
        this.bindResize();
        this.bodyPanel.addEventListener('keydown', e => {
            this.container.saveSelection();
            this.container.emit(EDITOR_EVENT_INPUT_KEYDOWN, e);
        });
        this.bodyPanel.addEventListener('keyup', e => {
            if (this.isComposition) {
                return;
            }
            this.selectRangeLine(this.selection.range);
            this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
            if (e.key === 'Backspace') {
                this.updateLineCount();
            }
        });
        this.element.addEventListener('mouseup', () => {
            this.container.saveSelection();
            this.selectRangeLine(this.selection.range);
        });
        this.element.addEventListener('paste', e => {
            e.preventDefault();
            this.paste((e.clipboardData || (window as any).clipboardData));
        });
        this.bodyPanel.addEventListener('compositionstart', () => {
            this.isComposition = true;
            // this.container.saveSelection();
        });
        this.bodyPanel.addEventListener('compositionend', () => {
            this.isComposition = false;
            this.container.saveSelection();
            this.container.emit(EDITOR_EVENT_SELECTION_CHANGE);
            this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
    }

    public paste(data: DataTransfer): void {
        const value = data.getData('text');
        if (!value) {
            return;
        }
        this.insert({type: EditorBlockType.AddText, value});
    }
//#region 外部调用的方法

    private addTextExecute(range: Range, block: IEditorTextBlock) {
        const [begin, end] = this.getRangeLineNo(range);
        const items = block.value.split('\n');
        items[0] = this.getLinePrevious(range) + items[0];
        items[items.length - 1] += this.getLineNext(range);
        this.insertLines(begin, end, ...items);
    }

    private addLineBreakExecute(range: Range) {
        const [begin, end] = this.getRangeLineNo(range);
        this.insertLines(begin, end, this.getLinePrevious(range), this.getLineNext(range));
    }

    private indentExecute(range: Range) {
        this.replaceSelectLine(s => {
            return '    ' + s;
        }, range);
    }

    private outdentExecute(range: Range) {
        this.replaceSelectLine(s => {
            if (s.length < 1) {
                return s;
            }
            switch(s.charCodeAt(0)) {
                case 9:// \t
                    return s.substring(1);
                case 32:// 空格
                    return s.replace(/^\s{1,4}/, '');
                default:
                    return s;
            }
        }, range);
    }

//#endregion

    private replaceSelectLine(cb: (line: string) => string, range: Range) {
        const [begin, end] = this.getRangeLineNo(range);
        for (let i = begin; i <= end; i++) {
            const ele = this.bodyPanel.children[i - 1] as HTMLDivElement;
            this.renderLine(ele, cb(ele.textContent));
        }
    }

    private getLinePrevious(range: Range): string {
        const items = [];
        this.eachLinePrevious(range, line => {
            items.push(line);
        });
        return items.reverse().join('');
    }
    private getLineNext(range: Range): string {
        const items = [];
        this.eachLineNext(range, line => {
            items.push(line);
        });
        return items.join('');
    }

    private eachLinePrevious(range: Range, cb: (text: string) => void) {
        if (range.startContainer === this.bodyPanel) {
            return;
        }
        if (range.startContainer instanceof HTMLDivElement) {
            return;
        }
        if (range.startOffset > 0) {
            const text = range.startContainer as Text;
            cb(text.textContent.substring(0, range.startOffset));
        }
        let current = range.startContainer;
        while (true) {
            if (current.previousSibling) {
                current = current.previousSibling;
                cb(current.textContent);
                continue;
            }
            if (current.parentNode instanceof HTMLDivElement) {
                break;
            }
            current = current.parentNode;
        }
    }

    private eachLineNext(range: Range, cb: (text: string) => void) {
        if (range.endContainer === this.bodyPanel) {
            return;
        }
        if (range.endContainer instanceof HTMLDivElement) {
            return;
        }
        const text = range.endContainer as Text;
        cb(range.endOffset > 0 ? text.textContent.substring(range.endOffset) : text.textContent);
        let current = range.endContainer;
        while (true) {
            if (current.nextSibling) {
                if (current.nextSibling instanceof HTMLBRElement) {
                    break;
                }
                current = current.nextSibling;
                cb(current.textContent);
                continue;
            }
            if (current.parentNode instanceof HTMLDivElement) {
                break;
            }
            current = current.parentNode;
        }
    }

    private getRangeLineNo(range: Range): [number, number] {
        const begin = this.findLine(range.startContainer);
        const beginNo = this.getLineNo(begin);
        let endNo = beginNo;
        if (range.startContainer !== range.endContainer) {
            const end = this.findLine(range.endContainer);
            if (begin !== end) {
                endNo = this.getLineNo(end);
            }
        }
        return [Math.max(beginNo, 1), Math.max(endNo, 1)];
    }

    /**
     * 
     * @param node 
     * @returns 
     */
    private getLineNo(node: HTMLDivElement): number {
        if (!node || node === this.element) {
            return 1;
        }
        for (let i = 0; i < this.bodyPanel.children.length; i++) {
            const element = this.bodyPanel.children[i];
            if (element === node) {
                return i + 1;
            }
        }
        return -1;
    }

    private findLine(node: Node): HTMLDivElement|undefined {
        while (!(node instanceof HTMLDivElement)) {
            if (node === this.bodyPanel) {
                return undefined;
            }
            node = node.parentNode;
        }
        return node;
    }

    /**
     * 
     * @param index 
     */
    private removeLine(index: number) {
        const i = index - 1;
        if (this.bodyPanel.children.length > i) {
            this.bodyPanel.removeChild(this.bodyPanel.children[i]);
        }
        if (this.linePanel.children.length > i) {
            this.linePanel.removeChild(this.linePanel.children[i]);
        }
    }

    private insertLines(begin: number, end: number, ...items: string[]) {
        const max = this.bodyPanel.children.length;
        let lineNo = 0;
        for (let i = 0; i < items.length; i++) {
            lineNo = begin + i;
            if (max >= lineNo && lineNo <= end) {
                this.updateLine(lineNo, items[i]);
                continue;
            }
            if (lineNo > max) {
                this.addLine(items[i]);
                continue;
            }
            this.beforeLine(lineNo, items[i]);
        }
        for (let i = end; i > lineNo; i -- ) {
            this.removeLine(i);
        }
        this.updateLineNo();
        const selectIndex = begin + items.length - 1;
        if (selectIndex > this.bodyPanel.children.length) {
            return;
        }
        this.selectNode(this.bodyPanel.children[selectIndex - 1].firstChild, 0);
        this.selectLine(selectIndex);
    }

    private selectLine(...lines: number[]) {
        this.eachLine((dt, dd, index) => {
            const has = lines.indexOf(index) >= 0;
            this.toggleClass(dt, 'editor-line-active', has);
            this.toggleClass(dd, 'editor-line-active', has);
        });
    }

    private selectRangeLine(range: Range) {
        const [begin, end] = this.getRangeLineNo(range);
        this.eachLine((dt, dd, index) => {
            const has = index >= begin && index <= end;
            dd.style.height = EditorHelper.height(dt) + 'px';
            this.toggleClass(dt, 'editor-line-active', has);
            this.toggleClass(dd, 'editor-line-active', has);
        });
    }

    private updateLineCount() {
        const begin = Math.max(5, this.bodyPanel.children.length);
        for (let i = this.linePanel.children.length - 1; i >= begin; i--) {
            this.linePanel.removeChild(this.linePanel.children[i]);
        }
    }

    private updateLineNoStyle() {
        let minHeight = 0;
        for (let i = 0; i < this.bodyPanel.children.length; i++) {
            const element: HTMLDivElement = this.bodyPanel.children[i] as any;
            const h = EditorHelper.height(element);
            if (h > 0 && (minHeight === 0 
                || h < minHeight)) {
                minHeight = h
            }
        }
        if (minHeight <= 0) {
            return;
        }
        const max = Math.max(this.bodyPanel.children.length, this.linePanel.children.length);
        let dt: HTMLDivElement|undefined;
        let dd: HTMLDivElement|undefined;
        for (let i = 0; i < max; i++) {
            dt = this.bodyPanel.children.length > i ? this.bodyPanel.children[i] as any: undefined;
            dd = this.linePanel.children.length > i ? this.linePanel.children[i] as any: undefined;
            if (!dd) {
                dd = this.createLineNo(i + 1);
            }
            const h = dt ? EditorHelper.height(dt) : 0;
            dd.style.height = (h > minHeight ? h : minHeight) + 'px';
        }
    }

    public toggleClass(ele: HTMLDivElement, tag: string, force?: boolean) {
        if (force === void 0) {
            force = !ele.classList.contains(tag);
        }
        if (force) {
            ele.classList.add(tag);
            return;
        }
        ele.classList.remove(tag);
    }

    private selectNode(node: Node, offset = 0) {
        const sel = window.getSelection();
        let range = sel.getRangeAt(0);
        range.deleteContents();
        range = range.cloneRange();
        range.setStart(node, offset);
        range.setEnd(node, offset);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    private addLines(...items: string[]) {
        for (const line of items) {
            this.addLine(line);
        }
    }

    private beforeLine(index: number, text: string) {
        const dt = this.createLine(text);
        this.bodyPanel.insertBefore(dt, this.bodyPanel.children[index - 1]);
        if (this.linePanel.children.length >= this.bodyPanel.children.length) {
            return;
        }
        this.linePanel.insertBefore(this.createLineNo(index, dt), this.linePanel.children[index - 1]);
    }

    private addLine(v?: string) {
        const line = this.bodyPanel.children.length + 1;
        const dt = this.createLine(v);
        this.bodyPanel.appendChild(dt);
        if (this.linePanel.children.length >= this.bodyPanel.children.length) {
            this.updateLine(line);
            return;
        }
        this.linePanel.appendChild(this.createLineNo(line, dt));
    }

    private createLineNo(line: number, lineBody?: HTMLDivElement): HTMLDivElement {
        // if (this.linePanel.children.length >= line) {
        //     return this.linePanel.children[line - 1] as HTMLDivElement;
        // }
        const dd = document.createElement('div');
        dd.className = 'editor-line-no';
        dd.textContent = line.toString();
        if (lineBody) {
            dd.style.height = EditorHelper.height(lineBody) + 'px';
        }
        return dd;
    }

    private createLine(v?: string): HTMLDivElement {
        const dt = document.createElement('div');
        dt.className = 'editor-line';
        this.renderLine(dt, v);
        this.appendBr(dt);
        return dt;
    }

    private updateLine(index: number, text?: string) {
        const i = index - 1;
        const lineBody = this.bodyPanel.children[i] as HTMLDivElement;
        if (typeof text !== 'undefined') {
            this.renderLine(lineBody, text);
        }
        const lineNo = this.linePanel.children[i] as HTMLDivElement;
        lineNo.style.height = EditorHelper.height(lineBody) + 'px'
    }

    private updateLineNo(index = 1) {
        for (; index <= this.linePanel.children.length; index++) {
            this.linePanel.children[index - 1].textContent = index.toString();
        }
    }

    private renderLine(parent: HTMLDivElement, line?: string) {
        if (typeof line === 'undefined') {
            return;
        }
        parent.innerText = line;
        this.appendBr(parent);
    }

    private appendBr(node: Node) {
        if (node.childNodes.length > 0 && node.childNodes[node.childNodes.length - 1].nodeName === 'BR') {
            return;
        }
        node.appendChild(document.createElement('br'));
    }

    private eachLine(cb: (dt: HTMLDivElement, dd: HTMLDivElement, index: number) => void|false) {
        for (let i = 0; i < this.bodyPanel.children.length; i++) {
            const dt = this.bodyPanel.children[i];
            if (cb(dt as any, this.linePanel.children[i] as any, i + 1) === false) {
                break;
            }
        }
    }
}