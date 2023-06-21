class EditorContainer implements IEditorContainer {
    private selection: IEditorRange;
    private element: IEditorElement;
    private undoStack: string[] = [];
    private undoIndex: number;
    private asyncTimer = 0;
    private listeners: {
        [key: string]: Function[];
    } = {};
    // private mouseMoveListeners = {
    //     move: undefined,
    //     finish: undefined,
    // };

    constructor(
        public option: EditorOptionManager = new EditorOptionManager(),
    ) {
        // document.addEventListener('mousemove', e => {
        //     this.emit(EDITOR_EVENT_MOUSE_MOVE, {x: e.clientX, y: e.clientX});
        // });
        // document.addEventListener('mouseup', e => {
        //     this.emit(EDITOR_EVENT_MOUSE_UP, {x: e.clientX, y: e.clientX});
        // });
    }

    public ready(element: HTMLTextAreaElement|HTMLDivElement|IEditorElement) {
        if (element instanceof HTMLDivElement) {
            this.element = new DivElement(element, this);
        } else if (element instanceof HTMLTextAreaElement) {
            this.element = new TextareaElement(element, this);
        } else {
            this.element = element;
        }
        if (!this.element) {
            return;
        }
        // this.on(EDITOR_EVENT_MOUSE_MOVE, p => {
        //     if (this.mouseMoveListeners.move) {
        //         this.mouseMoveListeners.move(p);
        //     }
        // }).on(EDITOR_EVENT_MOUSE_UP, p => {
        //     if (this.mouseMoveListeners.finish) {
        //         this.mouseMoveListeners.finish(p);
        //     }
        // });
        this.on(EDITOR_EVENT_INPUT_KEYDOWN, (e: KeyboardEvent) => {
            const modifiers = [];
            if (e.ctrlKey) {
                modifiers.push('Ctrl');
            }
            if (e.shiftKey) {
                modifiers.push('Shift');
            }
            if (e.altKey) {
                modifiers.push('Alt');
            }
            if (e.metaKey) {
                modifiers.push('Meta');
            }
            if (e.key !== 'Control' && modifiers.indexOf(e.key) < 0) {
                modifiers.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
            }
            const module = this.option.hotKeyModule(modifiers.join('+'));
            if (module) {
                e.preventDefault();
                this.execute(module);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                this.insert({type: EditorBlockType.AddLineBreak});
                return;
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insert({type: EditorBlockType.Indent});
            }
        });
        this.on(EDITOR_EVENT_INPUT_BLUR, () => {
            this.saveSelection();
            // this.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
        this.on(EDITOR_EVENT_EDITOR_CHANGE, () => {
            this.asynSave();
        });
        this.on(EDITOR_EVENT_EDITOR_AUTO_SAVE, () => {
            if (this.undoIndex >= 0 && this.undoIndex < this.undoStack.length - 1) {
                this.undoStack.splice(this.undoIndex);
            }
            const maxUndoCount = this.option.maxUndoCount;
            if (maxUndoCount < this.undoStack.length) {
                this.undoStack.splice(0, this.undoStack.length - maxUndoCount - 1);
            }
            this.undoStack.push(this.value);
            this.undoIndex = this.undoStack.length - 1;
            this.emit(EDITOR_EVENT_UNDO_CHANGE);
        });
        this.emit(EDITOR_EVENT_EDITOR_READY);
    }

    public get canUndo() {
        return this.undoIndex > 0 && this.undoStack.length > 0;
    }

    public get canRedo() {
        return this.undoIndex < this.undoStack.length && this.undoStack.length > 0;
    }


    /**
        是否有选择字符串
     */
    public get hasSelection() {
        return this.selection && this.selection.start < this.selection.end;
    }

    public get value(): string {
        if (!this.element) {
            return '';
        }
        return this.element.value;
    }

    public set value(content: string) {
        if (!this.element) {
            this.once(EDITOR_EVENT_EDITOR_READY, () => {
                this.element.value = content;
            });
            return;
        }
        this.element.value = typeof content === 'undefined' ? '' : content;
        // this.emit(EDITOR_EVENT_EDITOR_CHANGE);
    }

    public get length(): number {
        return this.element ? this.element.length : 0;
    }
    public get wordLength(): number {
        return this.element ? this.element.wordLength : 0;
    }

    private checkSelection() {
        if (!this.selection) {
            this.selection = this.element.selection;
        }
    }

    public selectAll(): void {
        this.element.selectAll();
    }

    public saveSelection() {
        this.selection = this.element.selection;
    }

    public insert(block: IEditorBlock|string, range?: IEditorRange): void {
        if (typeof block !== 'object') {
            block = {
                type: EditorBlockType.AddText,
                value: block,
            }
        }
        this.element.insert(block, range ?? this.selection);
    }
    
    public execute(module: string|IEditorTool, range?: IEditorRange, data?: any): void {
        const instance = this.option.toModule(module);
        if (!instance || !instance.handler) {
            return;
        }
        instance.handler(this, range ?? this.selection, data);
    }

    public clear(focus: boolean = true) {
        this.element.value = '';
        if (!focus) {
            return;
        }
        this.focus();
    }

    /**
     * focus
     */
    public focus() {
        this.checkSelection();
        this.element.selection = this.selection;
        this.element.focus();
    }

    public asynSave() {
        if (this.asyncTimer > 0) {
            clearTimeout(this.asyncTimer);
        }
        this.asyncTimer = window.setTimeout(() => {
            this.asyncTimer = 0;
            this.emit(EDITOR_EVENT_EDITOR_AUTO_SAVE);
        }, 2000);
    }

    public blur() {
        this.element.blur();
    }

    public destroy(): void {
        this.emit(EDITOR_EVENT_EDITOR_DESTORY);
        this.listeners = {};
    }

    public undo(): void {
        if (!this.canUndo) {
            this.emit(EDITOR_EVENT_UNDO_CHANGE);
            return;
        }
        this.undoIndex --;
        this.value = this.undoStack[this.undoIndex];
    }
    public redo(): void {
        if (!this.canRedo) {
            this.emit(EDITOR_EVENT_UNDO_CHANGE);
            return;
        }
        this.undoIndex ++;
        this.value = this.undoStack[this.undoIndex];
    }

    // public get hasMoveListener() {
    //     return typeof this.mouseMoveListeners.move !== 'undefined';
    // }

    // public mouseMove(move?: (p: IPoint) => void, finish?: (p: IPoint) => void) {
    //     this.mouseMoveListeners = {
    //         move,
    //         finish: !move && !finish ? undefined : (p: IPoint) => {
    //             this.mouseMoveListeners = {move: undefined, finish: undefined};
    //             finish && finish(p);
    //         },
    //     };
    // }

    public on<E extends keyof IEditorListeners>(event: E, listener: IEditorListeners[E]): IEditorContainer;
    public on(event: string, cb: any) {
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(cb);
        return this;
    }

    public emit(event: string, ...items: any[]) {
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            return this;
        }
        const listeners = this.listeners[event];
        for (let i = listeners.length - 1; i >= 0; i--) {
            const cb = listeners[i];
            const res = cb(...items);
            //  允许事件不进行传递
            if (res === false) {
                break;
            }
        }
        return this;
    }


    public off(...events: string[]): this;
    public off(event: string, cb: Function): this;
    public off(...events: any[]) {
        if (events.length == 2 && typeof events[1] === 'function') {
            return this.offListener(events[0], events[1]);
        }
        for (const event of events) {
            delete this.listeners[event];
        }
        return this;
    }

    public once<E extends keyof IEditorListeners>(event: E, listener: IEditorListeners[E]): IEditorContainer;
    public once(event: string, cb: any) {
        const func = (...items: any[]) => {
            this.off(event, func);
            cb(...items);
        };
        this.on(event as any, func);
        return this;
    }

    private offListener(event: string, cb: Function): this {
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            return this;
        }
        const items = this.listeners[event];
        for (let i = items.length - 1; i >= 0; i--) {
            if (items[i] === cb) {
                items.splice(i, 1);
            }
        }
        return this;
    }
}