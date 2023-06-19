
/**
 * markdown 模式
 */
class TextareaElement implements IEditorElement {
    constructor(
        private element: HTMLTextAreaElement,
        private container: IEditorContainer) {
        this.bindEvent();
    }

    private isComposition = false;

    public get selection(): IEditorRange {
        return {
            start: this.element.selectionStart,
            end: this.element.selectionEnd
        };
    }
    public set selection(v: IEditorRange) {
        this.element.selectionStart = v.start;
        this.element.selectionEnd = v.end;
        this.container.saveSelection();
    }

    public get selectedValue(): string {
        const s = this.selection;
        if (!s || s.start >= s.end) {
            return '';
        }
        return this.value.substring(s.start, s.end);
    }

    public set selectedValue(val: string) {
        const s = this.selection;
        const v = this.value;
        this.value = v.substring(0, s.start) + val + v.substring(s.end);
        this.selection = {
            start: s.start,
            end: s.start + val.length
        };
    }

    public get value(): string {
        return this.element.value;
    }
    public set value(v: string) {
        this.element.value = v;
    }

    public get length(): number {
        return this.value.length;
    }
    public get wordLength(): number {
        return wordLength(this.value);
    }

    public selectAll(): void {
        this.selection = {
            start: 0,
            end: this.value.length
        };
    }

    public insert(block: IEditorBlock, range?: IEditorRange): void {
        if (!range) {
            range = this.selection;
        }
        if (block.begin && block.end) {
            this.includeBlock(block.begin, block.end, range);
            return;
        }
        switch(block.type) {
            case EditorBlockType.AddLink:
                this.insertLink(block as any, range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.AddText:
            case EditorBlockType.AddRaw:
                this.insertText(block.value, range, block.cursor);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.AddImage:
                this.insertImage(block as any, range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.Indent:
                this.insertIndent(range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.Outdent:
                this.insertOutdent(range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.AddLineBreak:
                this.insertLineBreak(range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.AddCode:
                this.insertCode(block as any, range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
        }
    }
    public focus(): void {
        this.element.focus();
    }

    public blur(): void {
        return this.element.blur();
    }

    private insertLineBreak(range: IEditorRange) {
        this.insertText('\n', range);
    }

    private insertIndent(range: IEditorRange) {
        this.replaceSelectLine(s => {
            return s.split('\n').map(v => {
                return '    ' + v;
            }).join('\n');
        }, range);
    }

    private insertOutdent(range: IEditorRange) {
        this.replaceSelectLine(s => {
            return s.split('\n').map(v => {
                if (v.length < 1) {
                    return v;
                }
                switch(v.charCodeAt(0)) {
                    case 9:// \t
                        return v.substring(1);
                    case 32:// 空格
                        return v.replace(/^\s{1,4}/, '');
                    default:
                        return v;
                }
            }).join('\n');
        }, range);
    }

    private replaceSelectLine(cb: (s: string) => string, range: IEditorRange) {
        const v = this.value;
        let begin = range.start;
        if (begin > 0) {
            const i = v.lastIndexOf('\n', begin);
            if (i >= 0) {
                begin = i + 1;
            } else {
                begin = 0;
            }
        }
        const selected = v.substring(begin, range.end);
        const replace = cb(selected);
        this.value = v.substring(0, begin) + replace + v.substring(range.end);
        this.selection = {
            start: begin,
            end: begin + replace.length
        };
        this.focus();
    }

    private insertText(text: string, range: IEditorRange, cursor?: number) {
        const v = this.value;
        this.value = v.substring(0, range.start) + text + v.substring(range.start);
        this.moveCursor(range.start + (!cursor ? text.length : cursor));
    }

    private insertCode(block: IEditorCodeBlock, range: IEditorRange) {
        const v = this.value;
        const selected = v.substring(range.start, range.end);
        
        let replace = '```'+ block.language + '\n' + (block.value ?? selected) + '\n```';
        if (range.start > 0 && v.charAt(range.start - 1) !== '\n') {
            replace = '\n' + replace;
        }
        const cursor = replace.length - 4;
        if (range.end >= v.length - 1 || v.charAt(range.end + 1) !== '\n') {
            replace += '\n';
        }
        this.value = v.substring(0, range.start) + replace + v.substring(range.end);
        this.moveCursor(range.start + cursor);
    }

    private insertLink(block: IEditorLinkBlock, range: IEditorRange) {
        if (!block.value) {
            block.value = '';
        } 
        if (block.title) {
            this.insertText(`[${block.title}](${block.value})`, range);
            return;
        }
        this.replaceSelect(s => {
            return `[${s}](${block.value})`;
        }, range, block.value ? block.value.length + 4 : 3);
    }

    private insertImage(block: IEditorFileBlock, range: IEditorRange) {
        this.replaceSelect(s => {
            if (s.trim().length === 0 && block.title) {
                s = block.title;
            }
            return `![${block.title}](${block.value})`;
        }, range, block.title ? block.title.length + 4 : 2);
    }

    private includeBlock(begin: string, end: string, range: IEditorRange) {
        this.replaceSelect(s => {
            return begin + s + end;
        }, range, begin.length);
    }

    private replaceSelect(cb: (s: string) => string, range: IEditorRange, cursor = 0, cursorBefore = true) {
        const v = this.value;
        const selected = v.substring(range.start, range.end);
        const replace = cb(selected);
        this.value = v.substring(0, range.start) + replace + v.substring(range.end);
        this.moveCursor(range.start + (cursorBefore ? selected.length : 0) + cursor);
    }

    /**
     * 移动光标到指定位置并focus
     * @param pos 
     */
    private moveCursor(pos: number) {
        this.selection = {
            start: pos,
            end: pos,
        };
        this.focus();
    }

    private bindEvent() {
        this.element.addEventListener('keydown', e => {
            this.container.emit(EVENT_INPUT_KEYDOWN, e);
        });
        this.element.addEventListener('keyup', e => {
            if (this.isComposition) {
                return;
            }
            this.container.saveSelection();
        });
        this.element.addEventListener('blur', () => {
            this.container.emit(EVENT_INPUT_BLUR);
        });
        this.element.addEventListener('paste', () => {
            setTimeout(() => {
                this.container.emit(EVENT_EDITOR_CHANGE);
            }, 10);
        });
        this.element.addEventListener('mouseup', () => {
            this.container.saveSelection();
            this.container.emit(EVENT_SELECTION_CHANGE);
        });
        this.element.addEventListener('compositionstart', () => {
            this.isComposition = true;
        });
        this.element.addEventListener('compositionend', () => {
            this.isComposition = false;
            this.container.emit(EVENT_SELECTION_CHANGE);
        });
    }

}