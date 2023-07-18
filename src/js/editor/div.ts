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

    private get blockTagName() {
        return this.container.option.blockTag;
    }

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
        return EditorHelper.wordLength(this.element.innerText);
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
        const func = this[block.type + 'Execute'];
        if (typeof func === 'function') {
            func.call(this, range.range, block);
            this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
            return;
        }
        throw new Error(`insert type error:[${block.type}]`);
    }
    public focus(): void {
        this.element.focus({preventScroll: true});
    }

    public blur(): void {
        return this.element.blur();
    }

//#region 外部调用的方法

    private addHrExecute(range: Range) {
        const hr = document.createElement('hr');
        this.replaceSelected(range, hr);
    }

    private indentExecute(range: Range) {
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
                const p = document.createElement(this.blockTagName);
                p.appendChild(node.cloneNode(true));
                this.element.replaceChild(p, node);
                node = p;
            }
            const style = window.getComputedStyle(node);
            node.style.marginLeft = parseFloat(style.marginLeft.replace('px', '')) + 20 + 'px';
        }
    }

    private outdentExecute(range: Range) {
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

    private tabExecute(range: Range) {
        const cell = this.nodeParent(range.startContainer, 'td,' + this.blockTagName);
        if (!(cell instanceof HTMLTableCellElement)){
            this.indentExecute(range);
            return;
        }
        if (this.moveTableFocus(cell)) {
            return;
        }
        this.focusAfter(this.nodeParent(cell, 'table'));
    }

    private addTableExecute(range: Range, block: IEditorTableBlock) {
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

    private addImageExecute(range: Range, block: IEditorFileBlock) {
        const image = document.createElement('img');
        image.src = block.value;
        image.title = block.title || '';
        this.replaceSelected(range, image);
    }

    private addTextExecute(range: Range, block: IEditorTextBlock) {
        const span = document.createElement('span');
        span.innerText = block.value;
        this.replaceSelected(range, span);
    }

    private addRawExecute(range: Range, block: IEditorTextBlock) {
        const value = block.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');//.replace(/<([\/]?)(div)((:?\s*)(:?[^>]*)(:?\s*))>/g, '<$1p$3>');
        const p = document.createElement('div');
        p.innerHTML = value;
        const items = [];
        for (let i = 0; i < p.childNodes.length; i++) {
            items.push(p.childNodes[i]);
        }
        this.replaceSelected(range, ...items);
    }

    private addVideoExecute(range: Range, block: IEditorVideoBlock) {
        const ele = document.createElement('video');
        ele.src = block.value;
        ele.title = block.title || '';
        this.replaceSelected(range, ele);
    }

    private addFileExecute(range: Range, block: IEditorFileBlock) {
        const ele = document.createElement('a');
        ele.href = block.value;
        ele.title = block.title || '';
        this.replaceSelected(range, ele);
    }

    private addLinkExecute(range: Range, block: IEditorLinkBlock) {
        const link = document.createElement('a');
        link.href = block.value;
        link.text = block.title;
        if (block.target) {
            link.target = '_blank';
        }
        this.insertElement(link, range);
        this.selectNode(link);
    }


    private addLineBreakExecute(range: Range) {
        let begin = range.startContainer;
        let beginOffset = range.startOffset;
        const p = document.createElement(this.blockTagName);
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
        const li = this.nodeParent(begin, 'li,td,' + this.blockTagName);
        if (li) {
            if (li.nodeName === 'LI') {
                const next = document.createElement(li.nodeName);
                this.insertAfter(li, next);
                this.selectNode(next);
                return;
            }
            if (li instanceof HTMLTableCellElement)
            {
                if (this.moveTableFocus(li)) {
                    return;
                }
                this.focusAfter(this.nodeParent(li, 'table'));
                return;
            }
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
            const ele = document.createElement(this.blockTagName);
            ele.appendChild(document.createElement('br'));
            this.insertBefore(p, ele);
        }
        this.selectNode(p);
    }

    private hExecute(range: Range, block: IEditorValueBlock) {
        this.replaceNodeName(range.startContainer, block.value);
    }
    private blockquoteExecute(range: Range) {
        this.toggleParentNode(range, 'blockquote');
    }

    private listExecute(range: Range) {
        const node = range.startContainer;
        let box = this.nodeParent(node, 'ul,ol');
        if (box) {
            const items: Node[] = [];
            for (let j = 0; j < box.childNodes.length; j++) {
                const li = box.childNodes[j];
                if (li.nodeName !== 'li') {
                    items.push(li);
                    continue;
                }
                li.childNodes.forEach(v => {
                    items.push(v);
                });
            }
            this.replaceNode(box, items);
            return;
        }
        box = document.createElement('ul');
        const li = document.createElement('li');
        box.appendChild(li);
        this.replaceNode(node, box, () => {
            li.appendChild(node);
        });
    }

    private boldExecute(range: Range) {
        this.toggleParentNode(range, 'b');
    }

    private subExecute(range: Range) {
        this.toggleParentStyle(range, {
            'vertical-align': 'text-bottom',
            'font-size': '8px'
        });
    }

    private supExecute(range: Range) {
        this.toggleParentStyle(range, {
            'vertical-align': 'text-top',
            'font-size': '8px'
        });
    }

    private italicExecute(range: Range, block: IEditorValueBlock) {
        this.toggleParentNode(range, 'i');
    }
    private underlineExecute(range: Range) {
        this.toggleParentStyle(range, {
            'text-decoration': 'underline'
        });
    }

    private strikeExecute(range: Range) {
        this.toggleParentStyle(range, {
            'text-decoration': 'strike'
        });
    }

    private fontSizeExecute(range: Range, block: IEditorValueBlock) {
        this.toggleParentStyle(range, {
            'font-size': block.value
        });
    }
    private fontFamilyExecute(range: Range, block: IEditorValueBlock) {
        this.toggleParentStyle(range, {
            'font-family': block.value
        });
    }
    private backgroundExecute(range: Range, block: IEditorValueBlock) {
        this.toggleParentStyle(range, {
            'background-color': block.value
        });
    }
    private foregroundExecute(range: Range, block: IEditorValueBlock) {
        this.toggleParentStyle(range, {
            color: block.value
        });
    }

    private clearStyleExecute(range: Range) {
        this.eachRangeParentNode(range, node => {
            if (node instanceof HTMLElement) {
                node.removeAttribute('style');
            }
        });
    }


    private alignExecute(range: Range, block: IEditorValueBlock) {
        this.toggleParentStyle(range, {
            'text-align': block.value
        });
    }

    private theadExecute(range: Range) {
        const table = this.nodeParent<HTMLTableElement>(range.startContainer, 'table');
        if (!table) {
            return;
        }
        if (table.tHead) {
            table.tHead = null;
            return;
        }
        table.createTHead();
    }

    private tfootExecute(range: Range) {
        const table = this.nodeParent<HTMLTableElement>(range.startContainer, 'table');
        if (!table) {
            return;
        }
        if (table.tFoot) {
            table.tFoot = null;
            return;
        }
        table.createTFoot();
    }

    private rowSpanExecute(range: Range) {
        const start = this.getTableCell(range.startContainer);
        const end = this.getTableCell(range.endContainer);
        const body = start.parentNode.parentNode as HTMLTableSectionElement;
        const startSpan = this.getTableCellSpan(start);
        if (start === end) {
            if (start.rowSpan < 2) {
                return;
            }
            let count = start.rowSpan - 1;
            start.rowSpan = 1;
            let found = false;
            for (let i = 0; i < body.rows.length; i++) {
                if (count < 1) {
                    break;
                }
                const tr = body.rows[i];
                if (tr === start.parentNode) {
                    found = true;
                    continue;
                }
                if (!found) {
                    continue;
                }
                count --;
                let span = 0;
                for (let j = 0; j < tr.cells.length; j++) {
                    const item = tr.cells[i];
                    span += item.colSpan;
                    if (span === startSpan) {
                        this.insertAfter(item, document.createElement(start.nodeName));
                        break;
                    } else if (span > startSpan) {
                        item.colSpan ++;
                        break;
                    }
                }
            }
            return;
        }
        if (start.parentNode === end.parentNode) {
            return;
        }
        if (body !== end.parentNode.parentNode) {
            return;
        }
        // 获取 td|th table
        // 判断 两个 table 是否是同一个
        // 获取 tr.index 
        // 设置第一个 td rowspan ，删除其他行的td
        let endIndex = -1;
        let span = 0;
        for (let i = body.rows.length - 1; i >= 0; i--) {
            const tr = body.rows[i];
            if (tr === start.parentNode) {
                start.rowSpan += span;
                break;
            }
            if (tr === end.parentNode) {
                endIndex = i;
            }
            if (endIndex < 0) {
                return;
            }
            span ++;
            let s = 0;
            for (let j = 0; j < tr.cells.length; j++) {
                const item = tr.cells[j];
                s += item.colSpan;
                if (s < startSpan) {
                    continue;
                }
                if (s > startSpan || item.colSpan > 1) {
                    item.colSpan --;
                } else {
                    tr.removeChild(item);
                }
                break;
            }
        }
    }

    private colSpanExecute(range: Range) {
        const start = this.getTableCell(range.startContainer);
        const end = this.getTableCell(range.endContainer);
        if (start === end) {
            if (start.colSpan < 2) {
                return;
            }
            const count = start.colSpan - 1;
            start.colSpan = 1;
            for(let i = 0; i < count; i ++) {
                this.insertAfter(start, document.createElement(start.nodeName));
            }
            return;
        }
        const tr = start.parentNode as HTMLTableRowElement;
        // 获取 td|th tr
        // 判断 两个 tr 是否是同一个
        // 获取 td.index 
        // 设置第一个 td rowspan ，删除其他的td
        if (tr !== end.parentNode) {
            return;
        }
        let endIndex = -1;
        let span = 0;
        for (let i = tr.cells.length - 1; i >= 0; i--) {
            const item = tr.cells[i];
            if (item === start) {
                item.colSpan += span;
                break;
            }
            if (item === end) {
                endIndex = i;
            }
            if (endIndex > 0) {
                span += item.colSpan;
                tr.removeChild(item);
            }
        }
    }

    private delTableExecute(range: Range) {
        const table = this.nodeParent(range.startContainer, 'table');
        if (table) {
            this.removeNode(table);
        }
    }

    private openLinkExecute(range: Range) {
        const link = this.nodeParent(range.startContainer, 'a');
        if (!link) {
            return;
        }
        window.open(link.getAttribute('href'));
    }

//#endregion

    public getModuleItems(range: IEditorRange): string[] {
        const node = range.range?.startContainer;
        if (!node) {
            return [];
        }
        const blockName = this.blockTagName.toUpperCase();
        const data: string[] = [];
        this.eachParentNode(node, item => {
            if (node.nodeName === blockName || node.nodeName === 'IMG' 
            || node.nodeName === 'TABLE' || node.nodeName === 'VIDEO') {
                return false;
            }
            if (!(item instanceof HTMLElement)){
                return;
            }
            if (item.nodeName === 'B') {
                data.push('bold');
            } else if (item.nodeName === 'I') {
                data.push('italic');
            } else if (item.nodeName === 'BLOCKQUOTE') {
                data.push('blockquote');
            } else if (/^H[1-6]$/.test(item.nodeName)) {
                data.push('head');
            }
            if (item.style.verticalAlign === 'text-top') {
                data.push('sup');
            } else if (item.style.verticalAlign === 'text-bottom') {
                data.push('sub');
            }
            if (item.style.textDecoration === 'underline') {
                data.push('wavyline');
            } else if (item.style.textDecoration === 'wavyline') {
                data.push('dashed');
            } else if (item.style.textDecoration === 'strike') {
                data.push('strike');
            }
            if (item.style.backgroundColor) {
                data.push('background');
            }
            if (item.style.color) {
                data.push('foreground');
            }
        });
        return data;
    }

    private getTableCellSpan(node: HTMLTableCellElement): number {
        const parent = node.parentNode as HTMLTableRowElement;
        let span = 0;
        for (let i = 0; i < parent.cells.length; i++) {
            const item = parent.cells[i];
            if (item === node) {
                break;
            }
            span += item.colSpan;
        }
        return span;
    }

    private getTableCell(node: Node): HTMLTableCellElement|undefined {
        if (node instanceof HTMLTableCellElement) {
            return node;
        }
        while (node.parentNode) {
            if (node.parentNode instanceof HTMLTableCellElement) {
                return node.parentNode;
            }
        }
        return;
    }

    /**
     * 移动光标到下一格
     * @param node 
     * @returns 
     */
    private moveTableFocus(node: HTMLTableCellElement): boolean {
        if (node.nextSibling) {
            this.selectNode(node.nextSibling);
            return true;
        }
        const tr = node.parentNode;
        if (!tr || !(tr instanceof HTMLTableRowElement)) {
            return false;
        }
        if (tr.nextSibling && tr.nextSibling.childNodes.length >= 1) {
            this.selectNode(tr.nextSibling.childNodes[0]);
            return true;
        }
        const body = tr.parentNode;
        if (!body || !(body instanceof HTMLTableSectionElement)) {
            return false;
        }
        if (!body.nextSibling || body.nextSibling.childNodes.length === 0) {
            return false;
        }
        const nextTr = body.nextSibling.childNodes[0];
        if (nextTr.childNodes.length === 0) {
            return false;
        }
        this.selectNode(nextTr.childNodes[0]);
        return true;
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
        const n = document.createElement(tag);
        const node = range.startContainer;
        if (node === this.element) {
            this.insertToChildIndex(n, node, range.startOffset);
            this.selectNode(n);
            return;
        }
        const parent = this.nodeParent(node, tag);
        if (parent) {
            this.replaceNodeName(parent, tag === 'b' ? 'span' : this.blockTagName);
            return;
        }
        let target = node;
        if (node.parentNode && node.parentNode !== this.element && this.isOnlyNode(node)) {
            target = node.parentNode;
        }
        this.replaceNode(target, n, () => {
            n.appendChild(node);
            if (target !== node) {
                this.removeNode(target);
            }
        });
        this.selectNode(node);
    }

    /**
     * 切换父级的样式 
     */
    private toggleParentStyle(range: Range, style: any) {
        const box = this.getBlockParent(range.startContainer);
        EditorHelper.css(box, style);
    }

    /**
     * 获取节点的父级
     * @param node 
     * @returns 
     */
    private getBlockParent(node: Node): HTMLElement {
        const box = node.parentNode as HTMLElement;
        if (box !== this.element) {
            return box;
        }
        const p = document.createElement(this.blockTagName);
        this.replaceNode(node, p, () => {
            p.appendChild(node);
        });
        return p;
    }

    private nodeParent<T = HTMLElement>(node: Node, tag?: string): T|undefined {
        if (!tag) {
            return node.parentNode as any;
        }
        const items = tag.toUpperCase().split(',');
        let parent: HTMLElement;
        this.eachParentNode(node, item => {
            if (items.indexOf(item.nodeName) >= 0) {
                parent = item as any;
                return false;
            }
        });
        return parent as any;
    }

    /**
     * 判断节点是否处于范围内
     * @param node 
     * @returns 
     */
    private hasNode(node: Node): boolean {
        if (node === this.element) {
            return false;
        }
        while (node.parentNode) {
            if (node.parentNode.nodeName === 'BODY') {
                return false;
            }
            if (node.parentNode === this.element) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    private replaceNodeName(node: Node, tag: string) {
        const n = document.createElement(tag);
        if (node instanceof HTMLElement) {
            if (n.nodeName=== node.nodeName) {
                return;
            }
            n.innerHTML = node.innerHTML;
            this.replaceNode(node, n);
            this.selectNode(n);
            return;
        }
        this.replaceNode(node, n, () => {
            n.appendChild(node);
        });
        this.selectNode(n);
    }

    /**
     * 替换节点为
     * @param node 
     * @param newNode 
     * @param removeFn 删除旧节点还是移动
     * @returns 
     */
    private replaceNode(node: Node, newNode: Node[]|Node, removeFn?: Function) {
        const fn = () => {
            if (removeFn) {
                removeFn();
                return;
            }
            this.removeNode(node);
        };
        if (!(newNode instanceof Array)) {
            newNode = [newNode];
        }
        let borther = node.previousSibling;
        if (borther) {
            fn();
            this.insertAfter(borther, ...newNode);
            return;
        }
        borther = node.nextSibling;
        if (borther) {
            fn();
            this.insertBefore(borther, ...newNode);
            return;
        }
        const parent = node.parentNode;
        fn();
        this.insertLast(parent, ...newNode);
        return;
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

    private focusAfter(node: Node) {
        if (!node) {
            return;
        }
        if (node.nextSibling) {
            this.selectNode(node.nextSibling);
            return;
        }
        this.selectNode(node.parentNode, node.parentNode.childNodes.length);
    }

    private bindEvent() {
        this.element.addEventListener('keydown', e => {
            this.container.saveSelection();
            if (e.key === 'Tab') {
                e.preventDefault();
                this.tabExecute(this.selection.range);
            } else {
                this.container.emit(EDITOR_EVENT_INPUT_KEYDOWN, e);
            }
            this.container.emit(EDITOR_EVENT_CLOSE_TOOL);
        });
        this.element.addEventListener('keyup', () => {
            if (this.isComposition) {
                return;
            }
            const range = this.selection.range;
            if (this.isEmptyLine(range)) {
                this.container.emit(EDITOR_EVENT_SHOW_ADD_TOOL, this.getNodeOffset(range.startContainer).y);
                return;
            }
            this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
        this.element.addEventListener('compositionstart', () => {
            this.isComposition = true;
            // this.container.saveSelection();
        });
        this.element.addEventListener('compositionend', () => {
            this.isComposition = false;
            this.container.saveSelection();
            this.container.emit(EDITOR_EVENT_SELECTION_CHANGE);
            this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
        this.element.addEventListener('mouseup', () => {
            this.container.saveSelection();
            this.container.emit(EDITOR_EVENT_SELECTION_CHANGE);
            // console.log([this.selectedValue]);
        });
        this.element.addEventListener('mouseenter', e => {
            if (!e.target) {
                return;
            }
            if (e.target instanceof HTMLHRElement) {
                if (e.target.previousSibling instanceof HTMLHRElement) {
                    this.selectNode(e.target);
                    this.container.emit(EDITOR_EVENT_SHOW_LINE_BREAK_TOOL, this.getNodeOffset(e.target.previousSibling));
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
        this.element.addEventListener('paste', e => {
            e.preventDefault();
            this.paste((e.clipboardData || (window as any).clipboardData))
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
                this.container.emit(EDITOR_EVENT_SHOW_IMAGE_TOOL, this.getNodeBound(img), data => this.updateNode(img, data));
                return;
            }
            const range = this.selection.range;
            if (this.isInBlock(range)) {
                return;
            }
            if (this.isEmptyLine(range)) {
                this.container.emit(EDITOR_EVENT_SHOW_ADD_TOOL, this.getNodeOffset(range.startContainer).y);
                return;
            }
            this.container.emit(EDITOR_EVENT_INPUT_CLICK);
            this.container.emit(EDITOR_EVENT_CLOSE_TOOL);
        });
        this.element.addEventListener('blur', () => {
            this.container.saveSelection();
            this.container.emit(EDITOR_EVENT_INPUT_BLUR);
        });
    }

    public paste(data: DataTransfer) {
        if (this.isPasteFile(data)) {
            this.pasteFile(data);
            return;
        }
        if (this.isPasteHtml(data)) {
            this.pasteHtml(data);
            return;
        }
        const value = data.getData('text');
        if (!value) {
            return;
        }
        this.insert({type: EditorBlockType.AddText, value});
    }

    private isPasteFile(data: DataTransfer): boolean {
        return data.types.length > 0 && data.types[0] === 'Files';
    }

    private isPasteHtml(data: DataTransfer): boolean {
        return data.types.length > 1 && data.types[1] === 'text/html';
    }

    private pasteFile(data: DataTransfer) {
        for (let i = 0; i < data.files.length; i++) {
            const item = data.files[i];
            const fileType = EditorHelper.fileType(item);
            this.container.option.upload(item, fileType, res => {
                this.insert({type: 'add' + fileType[0].toUpperCase() + fileType.substring(1), value: res.url,
                    title: res.title, size: res.size});
            }, () => {});
        }
    }

    private pasteHtml(data: DataTransfer) {
        const value = data.getData(data.types[1]);
        if (!value) {
            return '';
        }
        this.insert({type: EditorBlockType.AddRaw, value});
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
        this.container.emit(EDITOR_EVENT_SHOW_COLUMN_TOOL, <IBound>{
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
                    this.removeNode(n);
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
                    this.removeNode(n);
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

    /**
     * 删除节点
     * @param node 
     * @returns 
     */
    private removeNode(node: Node) {
        if (!node.parentNode) {
            return;
        }
        node.parentNode.removeChild(node);
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
                event = EDITOR_EVENT_SHOW_LINK_TOOL;
                return false;
            }
            if (tableTag.indexOf(node.nodeName) >= 0) {
                event = EDITOR_EVENT_SHOW_TABLE_TOOL;
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

    /**
     * 判断父级是否只有这一个子节点
     * @param node 
     * @returns 
     */
    private isOnlyNode(node: Node): boolean {
        const parent = node.parentNode;
        if (!parent) {
            return false;
        }
        for (let i = 0; i < parent.childNodes.length; i++) {
            const element = parent.childNodes[i];
            if (element !== node && element.nodeName !== 'BR') {
                return false;
            }
        }
        return true;
    }

    private isEmptyLineNode(node: Node): boolean {
        if (node.nodeType !== 1) {
            return false;
        }
        for (let i = 0; i < node.childNodes.length; i++) {
            const element = node.childNodes[i];
            if (['P', 'DIV'].indexOf(element.nodeName) >= 0) {
                if (!this.isEmptyLineNode(element)) {
                    return false;
                }
                continue;
            }
            if (element.nodeName !== 'BR') {
                return false;
            }
        }
        return true;
    }
}