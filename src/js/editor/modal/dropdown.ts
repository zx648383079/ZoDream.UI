const FontItems: IEditorOptionItem[] = [
    {
        name: 'Arial',
        value: 'Arial,Helvetica,sans-serif',
    },
    {
        name: 'Georgia',
        value: 'Georgia,serif',
    },
    {
        name: 'Impact',
        value: 'Impact,Charcoal,sans-serif',
    },
    {
        name: '微软雅黑',
        value: '微软雅黑,sans-serif',
    },
    {
        name: '宋体',
        value: 'serif',
    },
    {
        name: '黑体',
        value: 'sans-serif',
    }
]

class EditorDropdownComponent implements IEditorSharedModal {
    private items: IEditorOptionItem[] = [];
    private confirmFn: EditorModalCallback;
    private element: JQuery<HTMLDivElement>;

    constructor() {
    }

    public render() {
        return `<div class="editor-modal-box editor-dropdown-modal">
        <ul class="option-bar">
        </ul>
    </div>`;
    }

    private renderItem(item: IEditorOptionItem): string {
        return `<li style="${EditorHelper.nodeStyle(item.style)}">${item.name}</li>`
    }

    public modalReady(module: IEditorModule, parent: JQuery<HTMLDivElement>, option: EditorOptionManager) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
        if (module.name === 'font') {
            this.items = FontItems.map(i => {
                i.style = {
                    'font-family': i.value
                };
                return i;
            });
        } else if (module.name === 'fontsize') {
            const items = [];
            let last = 7;
            let step = 1;
            for (let i = 0; i < 16; i++) {
                if (i > 0 && i % 3 === 0) {
                    step *= 2;
                }
                const value = last + step;
                items.push({
                    name: value,
                    value,
                });
                last = value;
            }
            this.items = items;
        }
        this.element.find('.option-bar').html(this.items.map(this.renderItem).join(''));
    }

    private bindEvent() {
        const that = this;
        this.element.on('click', 'li', function() {
            const $this = $(this);
            $this.addClass('selected').siblings().removeClass('selected');
            that.tapConfirm(that.items[$this.index()]);
        });
    }

    public open(data: any, cb: EditorModalCallback, position?: IPoint) {
        this.element.css(position ? {left: position.x + 'px', top: position.y + 'px'} : {});
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    }

    public tapConfirm(item: IEditorOptionItem) {
        if (this.confirmFn) {
            this.confirmFn({
                value: item.value
            });
        }
    }

}