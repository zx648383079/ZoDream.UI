

class EditorTableComponent implements IEditorSharedModal {

    private confirmFn: EditorModalCallback;
    private element: JQuery<HTMLDivElement>;

    public render() {
        return `<div class="editor-modal-box editor-table-modal"><div class="table-grid"></div></div>`;
    }

    private renderTableRow(column = 10): string {
        let row = '';
        for (let j = 0; j < column; j++) {
            row += `<span class="table-cell"></span>`
        }
        return `<div class="table-row">${row}</div>`
    }

    private renderTable(row: number, column = 10) {
        let html = '';
        for (let i = 0; i < row; i++) {
            html += this.renderTableRow(column);
        }
        this.element.find('.table-grid').html(html);
    }

    private bindEvent() {
        const that = this;
        this.element.on('mouseover', '.table-cell', function() {
            const $this = $(this);
            const i = $this.index();
            const parent = $this.parent();
            const j = parent.index();
            const box = parent[0].parentNode as HTMLDivElement;
            for (let r = 0; r < box.children.length; r++) {
                const re = box.children[r];
                for (let c = 0; c < re.children.length; c++) {
                    const ce = re.children[c];
                    $(ce).toggleClass('active', r <= j && c <= i);
                }
            }
            if (j < box.children.length - 1 || j >= 9) {
                return;
            }
            $(box).append(that.renderTableRow());
        }).on('click', '.table-cell', function() {
            const $this = $(this);
            if (that.confirmFn) {
                that.confirmFn({
                    row: $this.parent().index() + 1,
                    column: $this.index() + 1
                });
            }
        });
    }

    public modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
    }

    public open(data: any, cb: EditorModalCallback) {
        this.renderTable(2, 10);
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    }
}