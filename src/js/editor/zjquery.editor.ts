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
        this.codeContainer = new EditorContainer(this.option);
        if (element.style.height) {
            this.option.set('height', element.style.height);
        }
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            this.initByInput($(element));
        } else {
            this.initByDiv($(element));
        }
        this.ready();
    }

    private option: EditorOptionManager;
    public container: EditorContainer;
    private codeContainer: EditorContainer;
    private box: JQuery<HTMLDivElement>;
    private target: JQuery<HTMLTextAreaElement>;
    private textbox: JQuery<HTMLElement>;
    private codebox: JQuery<HTMLElement>;
    private subToolbar: JQuery<HTMLDivElement>;
    private flowToolbar: JQuery<HTMLDivElement>;
    private flowLastTool: IEditorTool[]|undefined;
    private modalContianer: JQuery<HTMLDivElement>;
    private footerBar: JQuery<HTMLDivElement>;
    private subParentName: string|undefined;
    private isFullScreen = false;
    private resizer = new EditorResizerComponent();

    private ready() {
        this.renderToolbar(this.option.leftToolbar, this.box.find<HTMLDivElement>('.tool-bar-top .tool-left'));
        this.renderToolbar(this.option.rightToolbar, this.box.find<HTMLDivElement>('.tool-bar-top .tool-right'));
        this.textbox = this.box.find('.editor-view');
        this.codebox = this.box.find('.editor-code-container');
        const height = this.option.get('height');
        if (height) {
            this.textbox.parent().css('height', /^\d+$/.test(height) ? height + 'px' : height);
        }
        this.container.ready(this.textbox[0] as any);
        this.codeContainer.ready(new CodeElement(this.codebox[0] as any, this.codeContainer));
        this.subToolbar = this.box.find<HTMLDivElement>('.editor-tool-bar .tool-bar-bottom');
        this.flowToolbar = this.box.find<HTMLDivElement>('.editor-flow-tool-bar');
        this.modalContianer = this.box.find<HTMLDivElement>('.editor-flow-area .editor-modal-area');
        this.footerBar = this.box.find<HTMLDivElement>('.editor-footer');
        this.bindEvent();
        this.resizer.ready(this.modalContianer.parent());
        this.container.value = this.target.val() as any;
    }

    public tapTool(item: IEditorTool, isRight: boolean, event: MouseEvent) {
        this.container.focus();
        if (item.name === this.subParentName) {
            this.toggleSubToolbar(item.name, isRight);
            this.subParentName = '';
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
        const isCode = this.box.hasClass('editor-code-mode');
        this.modalContianer.html('');
        if (item.name === EDITOR_CODE_TOOL) {
            this.box.toggleClass('editor-code-mode', !isCode);
            this.option.toolToggle(EDITOR_CODE_TOOL, !isCode);
            this.container.emit(EDITOR_EVENT_CLOSE_TOOL);
            if (!isCode) {
                this.codeContainer.value = this.container.value;
            }
            return;
        }
        if (item.name === EDITOR_FULL_SCREEN_TOOL) {
            this.toggleFullScreen();
            return;
        }
        if (isCode) {
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
        if (typeof (modal as any).modalReady === 'function') {
            (modal as IEditorSharedModal).modalReady(module, this.modalContianer, this.option);
        }
        modal.open({}, res => {
            this.hideModal();
            this.container.execute(module, undefined, res);
        }, position);
    }

    private getOffsetPosition(event: MouseEvent): IPoint {
        const rect = this.textbox.offset();
        if (event.currentTarget) {
            const target = $(event.currentTarget);
            if (target.hasClass('tool-item')) {
                const offset = target.offset()
                return {
                    x: offset.left - rect.left,
                    y: offset.top + target.height() - rect.top,
                };
            }
        }
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    private toggleFullScreen() {
        this.isFullScreen = !this.isFullScreen;
    }


    private bindEvent() {
        this.container.on(EDITOR_EVENT_UNDO_CHANGE, () => {
            this.toggleTool({name: EDITOR_UNDO_TOOL, disabled: !this.container.canUndo},
                {name: EDITOR_REDO_TOOL, disabled: !this.container.canRedo},);
        }).on(EDITOR_EVENT_SHOW_ADD_TOOL, y => {
            this.resizer.close();
            this.hideModal();
            this.toggleFlowbar(this.option.tool(EDITOR_ADD_TOOL), {
                x: 0,
                y,
            });
        }).on(EDITOR_EVENT_SHOW_LINE_BREAK_TOOL, p => {
            this.resizer.close();
            this.toggleFlowbar(this.container.option.toolChildren(EDITOR_ENTER_TOOL), {
                x: 0,
                y: p.y,
            });
        }).on(EDITOR_EVENT_SHOW_TABLE_TOOL, p => {
            this.resizer.close();
            this.toggleFlowbar(this.container.option.toolChildren(EDITOR_TABLE_TOOL), p);
        }).on(EDITOR_EVENT_SHOW_LINK_TOOL, p => {
            this.resizer.close();
            this.toggleFlowbar(this.container.option.toolChildren(EDITOR_LINK_TOOL), p);
        }).on(EDITOR_EVENT_SHOW_IMAGE_TOOL, (p, cb) => {
            this.toggleFlowbar(this.option.toolChildren(EDITOR_IMAGE_TOOL), {...p, y: p.y + p.height + 20});
            this.resizer.openResize(p, cb);
        }).on(EDITOR_EVENT_SHOW_COLUMN_TOOL, (p, cb) => {
            this.resizer.openHorizontalResize(p, cb);
        }).on(EDITOR_EVENT_CLOSE_TOOL, () => {
            this.hideModal();
            this.toggleFlowbar();
            this.resizer.close();
        }).on(EDITOR_EVENT_EDITOR_CHANGE, () => {
            this.footerBar.text(this.container.wordLength + ' words');
            this.target.val(this.container.value).trigger('change');
        });
        this.codeContainer.on(EDITOR_EVENT_EDITOR_CHANGE, () => {
            this.container.value = this.codeContainer.value;
            this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
        this.option.toolUpdatedFn = items => {
            this.toggleTool(...items);
        };
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
        $(document).on('click', e => {
            if ($(e.target).closest('.editor-box').is(this.box)) {
                return;
            }
            this.container.emit(EDITOR_EVENT_CLOSE_TOOL);
        });
        const $win = $(window).on('scroll', () => {
            const scollTop = $win.scrollTop();
            const offset = this.box.offset();
            this.box.toggleClass('editor-header-fixed', offset.top < scollTop && offset.top + this.box.height() > scollTop - 80);
        });
    }

    private hideModal() {
        this.modalContianer.children().removeClass('modal-visible');
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
            let offset = 0;
            const of = this.box.offset()
            if (p.x + of.left < 40) {
                offset = p.y + of.top > 40 ?  - 40 : 40;
                // 
            }
            this.flowToolbar.css({
                top: p.y + offset + 'px',
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
        this.target = $(document.createElement('textarea'));
        this.target.attr('name', element.attr('name'));
        if (element[0].nodeName === 'SCRIPT') {
            this.box = $('<div class="editor-box"></div>');
            element.before(this.box);
            this.target.val(element.html());
        } else {
            this.box = element as any;
            this.box.addClass('editor-box');
        }
        this.box.html(this.renderBase());
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
            <div class="editor-flow-tool-bar"></div>
            <div class="editor-modal-area"></div>
        </div>
        <div class="editor-code-container"></div>
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
        if (this.data('editor')) {
            return;
        }
        this.data('editor', 1);
        return new EditorApp(this[0], option);
    };
})(jQuery);