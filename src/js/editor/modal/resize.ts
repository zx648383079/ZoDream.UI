class EditorResizerComponent {

    public toolType = 0;
    private rectBound?: IBound;
    private mouseMoveListeners = {
        move: undefined,
        finish: undefined,
    };
    private updatedHandler: EditorUpdatedCallback;
    private element: JQuery<HTMLDivElement>;

    public render() {
        return `<div class="editor-resizer-modal">
        <div class="selection-container">
            <div class="rotate-icon">
                <i class="iconfont icon-refresh"></i>
            </div>
            <div class="eight-corner">
                <div class="cursor lt"></div>
                <div class="cursor t"></div>
                <div class="cursor rt"></div>
                <div class="cursor r"></div>
                <div class="cursor rb"></div>
                <div class="cursor b"></div>
                <div class="cursor lb"></div>
                <div class="cursor l"></div>
            </div>
        </div>
        <div class="horizontal-bar"></div>
        <div class="vertical-bar"></div>
    </div>`;
    }

    private triggerBoxStyle() {
        this.element.find('.selection-container').css(this.toolType !== 1 ? {
            display: 'none',
        } : {
            display: 'block',
            left: this.rectBound.x + 'px',
            top: this.rectBound.y + 'px',
            width: this.rectBound.width + 'px',
            height: this.rectBound.height + 'px',
        });
    }

    private triggerHorizontalStyle() {
        this.element.find('.horizontal-bar').css(this.toolType !== 2 ? {
                display: 'none',
            } : {
            display: 'block',
            left: this.rectBound.x + 'px',
            top: this.rectBound.y + 'px',
            height: this.rectBound.height + 'px',
        });
    }

    private triggerVerticalStyle() {
        this.element.find('.vertical-bar').css(this.toolType !== 3 ? {
                display: 'none',
            } : {
            display: 'block',
            left: this.rectBound.x + 'px',
            top: this.rectBound.y + 'px',
            width: this.rectBound.width + 'px',
        });
    }

    private bindEvent() {
        const that = this;
        const fnMap = [this.onMoveLt, this.onMoveT, this.onMoveRt, this.onMoveR, this.onMoveRb, this.onMoveB, this.onMoveLb, this.onMoveL];
        this.element.on('mousedown', '.eight-corner .cursor', function(e) {
            const fn = fnMap[$(this).index()];
            fn && fn.call(that, e);
        });
        $(document).on('mousemove', this.docMouseMove.bind(this))
            .on('mouseup', this.docMouseUp.bind(this));
    }

    private docMouseMove(e: MouseEvent) {
        if (this.mouseMoveListeners.move) {
            this.mouseMoveListeners.move({x: e.clientX, y: e.clientY});
        }
    }

    private docMouseUp(e: MouseEvent) {
        if (this.mouseMoveListeners.finish) {
            this.mouseMoveListeners.finish({x: e.clientX, y: e.clientY});
        }
    }

    public ready(parent: JQuery<HTMLDivElement>) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
    }

    public openResize(bound: IBound, cb: EditorUpdatedCallback) {
        this.rectBound = bound;
        this.toggleType(1);
        this.updatedHandler = cb;
    }

    public openHorizontalResize(bound: IBound, cb: EditorUpdatedCallback) {
        this.rectBound = bound;
        this.toggleType(2);
        this.updatedHandler = cb;
        this.mouseMove(undefined, (b, x, y) => {
            return {
                ...b,
                x: b.x  + x,
            };
        });
    }

    
    public openVerticalResize(bound: IBound, cb: EditorUpdatedCallback) {
        this.rectBound = bound;
        this.toggleType(3);
        this.updatedHandler = cb;
        this.mouseMove(undefined, (b, x, y) => {
            return {
                ...b,
                y: b.y + y,
            };
        });
    }

    public close() {
        this.toggleType(0);
    }

    private toggleType(i = 0) {
        if (this.toolType === i) {
            return;
        }
        const old = this.toolType;
        this.toolType = i;
        this.updateStyle(old);
        this.updateStyle(i);
    }

    private updateStyle(i: number = this.toolType) {
        if (i === 1) {
            this.triggerBoxStyle();
        } else if (i === 2) {
            this.triggerHorizontalStyle();
        } else if (i === 3) {
            this.triggerVerticalStyle();
        }
    }


    public onMoveLt(e: MouseEvent) {
        this.mouseMove(e, (b, x, y) => {
            return {
                x: b.x  + x,
                y: b.y  + y,
                width: b.width  - x,
                height: b.height - y,
            };
        });
    }
    public onMoveT(e: MouseEvent) {
        this.mouseMove(e, (b, x, y) => {
            return {
                ...b,
                y: b.y  + y,
                height: b.height - y,
            };
        });
    }
    public onMoveRt(e: MouseEvent) {
        this.mouseMove(e, (b, x, y) => {
            return {
                ...b,
                y: b.y  + y,
                height: b.height - y,
                width: b.width + x
            };
        });
    }
    public onMoveR(e: MouseEvent) {
        this.mouseMove(e, (b, x, y) => {
            return {
                ...b,
                width: b.width + x
            };
        });
    }
    public onMoveRb(e: MouseEvent) {
        this.mouseMove(e, (b, x, y) => {
            return {
                ...b,
                height: b.height + y,
                width: b.width + x
            };
        });
    }
    public onMoveB(e: MouseEvent) {
        this.mouseMove(e, (b, x, y) => {
            return {
                ...b,
                height: b.height + y,
            };
        });
    }
    public onMoveLb(e: MouseEvent) {
        this.mouseMove(e, (b, x, y) => {
            return {
                ...b,
                x: b.x + x,
                width: b.width - x,
                height: b.height + y,
            };
        });
    }
    public onMoveL(e: MouseEvent) {
        this.mouseMove(e, (b, x, y) => {
            return {
                ...b,
                x: b.x + x,
                width: b.width - x,
            };
        });
    }

    private mouseMove(start: MouseEvent|undefined, move: (last: IBound, x: number, y: number) => IBound) {
        if (this.toolType < 1) {
            return;
        }
        let last: IPoint
        if (start) {
            start.stopPropagation();
            last = {x: start.clientX, y: start.clientY};
        }
        this.onMouseMove(p => {
            if (!last) {
                last = {x: p.x, y: p.y};
                return;
            }
            const offsetX = p.x - last.x;
            const offsetY = p.y - last.y;
            this.rectBound = move(this.rectBound, offsetX, offsetY);
            this.updateStyle();
            last = p;
        }, _ => {
            const toolType = this.toolType;
            this.toggleType(0);
            if (!this.updatedHandler) {
                return;
            }
            if (toolType === 1) {
                this.updatedHandler(<IEditorResizeBlock>{
                    type: EditorBlockType.NodeResize,
                    ...this.rectBound,
                });
                return;
            } else if (toolType === 2 || toolType === 3) {
                
                this.updatedHandler(<IEditorResizeBlock>{
                    type: EditorBlockType.NodeMove,
                    ...this.rectBound,
                });
            }
        });
    }

    private onMouseMove(move?: (p: IPoint) => void, finish?: (p: IPoint) => void) {
        this.mouseMoveListeners = {
            move,
            finish: !move && !finish ? undefined : (p: IPoint) => {
                this.mouseMoveListeners = {move: undefined, finish: undefined};
                finish && finish(p);
            },
        };
    }
}
