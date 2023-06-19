class EditorApp {
    /**
    *
    */
    constructor(
        element: HTMLDivElement|HTMLTextAreaElement,
        option?: IEditorOption
    ) {
        this.option = new EditorOptionManager();
        if (option) {
            this.option.merge(option);
        }
        this.container = new EditorContainer(this.option);
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            this.initByInput($(element));
        } else {
            this.initByDiv($(element));
        }
        this.ready();
    }

    private option: EditorOptionManager;
    private container: EditorContainer;
    private box: JQuery<HTMLDivElement>;
    private target: JQuery<HTMLTextAreaElement>;
    private textbox: JQuery<HTMLElement>;
    private subToolbar: JQuery<HTMLDivElement>;
    private flowToolbar: JQuery<HTMLDivElement>;
    private flowLastTool: IEditorTool[]|undefined;
    private modalContianer: JQuery<HTMLDivElement>;
    private footerBar: JQuery<HTMLDivElement>;
    private subParentName: string|undefined;
    private isFullScreen = false;

    private ready() {
        this.renderToolbar(this.option.leftToolbar, this.box.find<HTMLDivElement>('.tool-bar-top .tool-left'));
        this.renderToolbar(this.option.rightToolbar, this.box.find<HTMLDivElement>('.tool-bar-top .tool-right'));
        this.textbox = this.box.find('.editor-view');
        this.container.ready(this.textbox[0] as any);
        this.subToolbar = this.box.find<HTMLDivElement>('.editor-tool-bar .tool-bar-bottom');
        this.flowToolbar = this.box.find<HTMLDivElement>('.flow-tool-bar');
        this.modalContianer = this.box.find<HTMLDivElement>('.editor-flow-area .editor-modal-area');
        this.footerBar = this.box.find<HTMLDivElement>('.editor-footer');
        this.bindEvent();
    }

    public tapTool(item: IEditorTool, isRight: boolean, event: MouseEvent) {
        this.container.focus();
        if (item.name === this.subParentName) {
            this.toggleSubToolbar(item.name, isRight);
            return;
        }
        const next = this.container.option.toolChildren(item.name);
        if (next.length === 0) {
            this.executeModule(item, this.getOffsetPosition(event));
            return;
        }
        this.toggleSubToolbar(item.name, isRight);
    }

    public tapFlowTool(item: IEditorTool, event: MouseEvent) {
        this.container.focus();
        if (item.name === EDITOR_CLOSE_TOOL) {
            this.toggleFlowbar(true);
            return;
        }
        const items = this.container.option.toolChildren(item.name);
        if (items.length > 0) {
            this.toggleFlowbar([this.container.option.closeTool, ...items]);
            return;
        }
        this.toggleFlowbar();
        this.executeModule(item, this.getOffsetPosition(event));
    }

    public insert(block: IEditorBlock|string): void {
        this.container.insert(block);
    }

    private executeModule(item: IEditorTool, position: IPoint) {
        this.modalContianer.html('');
        if (item.name === EDITOR_CODE_TOOL) {
            // this.isCodeMode = !this.isCodeMode;
            // if (this.isCodeMode) {
            //     this.codeEditor.writeValue(this.container.value);
            //     this.codeEditor.registerOnChange(res => {
            //         this.writeValue(res);
            //     });
            // }
            return;
        }
        if (item.name === EDITOR_FULL_SCREEN_TOOL) {
            this.toggleFullScreen();
            return;
        }
        const module = this.container.option.toModule(item);
        if (!module) {
            return;
        }
        if (!module.modal) {
            this.container.execute(module);
            return;
        }
        const modal = module.modal;
        if ((modal as any).modalReady === 'function') {
            (modal as IEditorSharedModal).modalReady(module, this.modalContianer, this.option);
        }
        modal.open({}, res => {
            this.modalContianer.children().hide();
            this.container.execute(module, undefined, res);
        }, position);
    }

    private getOffsetPosition(event: MouseEvent): IPoint {
        const ele = this.textbox;
        const rect = ele.offset();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    private toggleFullScreen() {
        this.isFullScreen = !this.isFullScreen;

    }


    private bindEvent() {
        this.container.on(EVENT_UNDO_CHANGE, () => {
            this.toggleTool({name: EDITOR_UNDO_TOOL, disabled: !this.container.canUndo},
                {name: EDITOR_REDO_TOOL, disabled: !this.container.canRedo},);
        });
        this.container.on(EVENT_SHOW_ADD_TOOL, y => {
            this.modalContianer.children().hide();
            this.toggleFlowbar(this.container.option.tool(EDITOR_ADD_TOOL), {
                x: 0,
                y,
            });
        });
        this.container.on(EVENT_SHOW_LINE_BREAK_TOOL, p => {
            this.toggleFlowbar(this.container.option.tool(EDITOR_ENTER_TOOL), {
                x: 0,
                y: p.y,
            });
        });
        this.container.on(EVENT_SHOW_TABLE_TOOL, p => {
            this.toggleFlowbar(this.container.option.tool(EDITOR_TABLE_TOOL), p);
        });
        this.container.on(EVENT_SHOW_LINK_TOOL, p => {
            this.toggleFlowbar(this.container.option.tool(EDITOR_LINK_TOOL), p);
        });
        this.container.on(EVENT_SHOW_IMAGE_TOOL, (p, cb) => {
            this.toggleFlowbar(this.container.option.tool(EDITOR_IMAGE_TOOL), {...p, y: p.y + p.height + 20});
            // this.resizer.openResize(p, cb);
        });
        this.container.on(EVENT_SHOW_COLUMN_TOOL, (p, cb) => {
            // this.resizer.openHorizontalResize(p, cb);
        });
        this.container.on(EVENT_CLOSE_TOOL, () => {
            this.modalContianer.children().hide();
            this.toggleFlowbar();
            // this.flowItems = [];
            // if (this.modalRef) {
            //     this.modalRef.destroy();
            //     this.modalRef = undefined;
            // }
            // this.resizer.close();
        });
        const that = this;
        this.box.on('click', '.tool-item', function(e) {
            const $this = $(this);
            const module = $this.data('module');
            const parent = $this.parent();
            if (parent.is(that.flowToolbar)) {
                that.tapFlowTool(that.option.toolOnly(module), e as any);
                return;
            }
            that.tapTool(that.option.toolOnly(module), parent.hasClass('tool-right'), e as any);
        });
    }

    private toggleFlowbar(): void;
    private toggleFlowbar(back: true);
    private toggleFlowbar(items: IEditorTool[])
    private toggleFlowbar(items: IEditorTool[], p: IPoint)
    private toggleFlowbar(items?: IEditorTool[]|true, p?: IPoint) {
        if (items === true) {
            items = this.flowLastTool;
            this.flowLastTool = undefined;
        }
        if (!items || items.length < 1) {
            this.flowToolbar.hide();
            return;
        }
        // this.flowLastTool = items;
        this.renderToolbar(items, this.flowToolbar);
        if (p) {
            this.flowToolbar.css({
                top: p.y + 'px',
                left: p.x + 'px',
            });
        }
        this.flowToolbar.toggleClass('flow-tool-one', items.length === 1);
        this.flowToolbar.show();
    }

    private toggleSubToolbar(parent: string, isRight = false) {
        if (this.subParentName === parent) {
            this.subToolbar.hide();
            return;
        }
        const items = this.option.toolChildren(parent);
        this.subParentName = parent;
        if (items.length < 1) {
            this.subToolbar.hide();
        }
        this.renderToolbar(items, this.subToolbar);
        this.subToolbar.toggleClass('tool-align-right', isRight);
        this.subToolbar.show();
    }

    private toggleTool(...items: IEditorToolStatus[]) {
        const maps: {[name: string]: IEditorToolStatus} = {};
        for (const item of items) {
            maps[item.name] = item;
        }
        this.box.find('.tool-item').each((_, ele) => {
            const $this = $(ele);
            const name = $this.data('module');
            if (!name || !Object.prototype.hasOwnProperty.call(maps, name)) {
                return;
            }
            const item = maps[name];
            if (typeof item.actived === 'boolean') {
                $this.toggleClass('active', item.actived);
            }
            if (typeof item.disabled === 'boolean') {
                $this.toggleClass('disabled', item.disabled);
            }
        });
    }


    private initByDiv(element: JQuery) {
        this.box = element as any;
        this.box.addClass('editor-box');
        this.box.html(this.renderBase());
        this.target = $(document.createElement('textarea'));
        this.target.attr('name', this.box.attr('name'));
        this.target.hide();
        this.box.append(this.target);
    }

    private initByInput(element: JQuery) {
        this.target = element as any;
        this.box = $('<div class="editor-box"></div>');
        this.box.html(this.renderBase());
        element.hide();
        element.before(this.box);
        this.box.append(element);
    }

    private renderBase() {
        return `<div class="editor-tool-bar">
        <div class="tool-bar-top">
            <div class="tool-left"></div>
            <div class="tool-right"></div>
        </div>
        <div class="tool-bar-bottom">
        </div>
    </div>
    <div class="editor-body">
        <div class="editor-area">
            <div class="editor-view" contentEditable="true" spellcheck="false"></div>
        </div>
        <div class="editor-flow-area">
            <div class="flow-tool-bar"></div>
            <div class="editor-modal-area"></div>
        </div>
    </div>
    <div class="editor-footer">0 words</div>`;
    }

    private renderToolIcon(item: IEditorTool): string;
    private renderToolIcon(item: IEditorTool, target: JQuery<HTMLDivElement>): void;
    private renderToolIcon(item: IEditorTool, target?: JQuery<HTMLDivElement>): string|void {
        if (target) {
            target.toggleClass('active', !!item.actived);
            target.toggleClass('disabled', !!item.disabled);
            target.attr('title', item.label);
            target.data('module', item.name);
            target.find('i').attr('class', 'fa ' + item.icon);
            return;
        }
        let cls = '';
        if (item.actived) {
            cls += ' active';
        }
        if (item.disabled) {
            cls += ' disabled';
        }
        return `<div class="tool-item${cls}" title="${item.label}" data-module="${item.name}">
        <i class="fa ${item.icon}"></i>
    </div>`;
    }

    private renderToolbar(items: IEditorTool[]): string;
    private renderToolbar(items: IEditorTool[], target: JQuery<HTMLDivElement>): void;
    private renderToolbar(items: IEditorTool[], target?: JQuery<HTMLDivElement>): string|void {
        if (!target) {
            return items.map(i => this.renderToolIcon(i)).join();
        }
        let i = -1;
        target.find('.tool-item').each((_, ele) => {
            i ++;
            const $this = $(ele) as any;
            if (i >= items.length) {
                $this.remove();
                return;
            }
            this.renderToolIcon(items[i], $this);
        });
        i ++;
        if (i >= items.length) {
            return;
        }
        let html = '';
        for (; i < items.length; i ++) {
            html += this.renderToolIcon(items[i]);
        }
        target.append(html);
    }

}
;(function($: any) {
    $.fn.editor = function(option?: IEditorOption) {
        return new EditorApp(this[0], option);
    };
})(jQuery);