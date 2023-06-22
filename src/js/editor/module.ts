const EDITOR_CLOSE_TOOL = 'close';
const EDITOR_ADD_TOOL = 'add';
const EDITOR_ENTER_TOOL = 'enter';
const EDITOR_UNDO_TOOL = 'undo';
const EDITOR_REDO_TOOL = 'redo';
const EDITOR_MORE_TOOL = 'more';
const EDITOR_FULL_SCREEN_TOOL = 'full-screen';
const EDITOR_CODE_TOOL = 'code';
const EDITOR_IMAGE_TOOL = 'image_edit';
const EDITOR_TABLE_TOOL = 'table_edit';
const EDITOR_VIDEO_TOOL = 'video_edit';
const EDITOR_LINK_TOOL = 'link_edit';


const EditorModules: IEditorModule[] = [
    {
        name: 'text',
        icon: 'fa-font',
        label: 'Edit Text',
    },
    {
        name: 'paragraph',
        icon: 'fa-paragraph',
        label: 'Edit Paragraph',
    },
    {
        name: EDITOR_ADD_TOOL,
        icon: 'fa-plus',
        label: 'Add Content',
    },
    {
        name: EDITOR_UNDO_TOOL,
        icon: 'fa-undo',
        label: 'Undo',
        hotKey: 'Ctrl+Z',
        handler(editor) {
            editor.undo();
        }
    },
    {
        name: EDITOR_REDO_TOOL,
        icon: 'fa-redo',
        label: 'Redo',
        hotKey: 'Ctrl+Shift+Z',
        handler(editor) {
            editor.redo();
        }
    },
    {
        name: EDITOR_MORE_TOOL,
        icon: 'fa-ellipsis-v',
        label: 'More'
    },
    {
        name: EDITOR_CLOSE_TOOL,
        icon: 'fa-times',
        label: 'Close'
    },

    {
        name: EDITOR_ENTER_TOOL,
        icon: 'fa-enter',
        label: 'Link Break',
        handler(editor) {
            editor.insert({type: EditorBlockType.AddLineBreak});
        }
    },
    // 文字处理
    {
        name: 'head',
        icon: 'fa-heading',
        label: 'H1-H6',
        parent: 'text',
        modal: new EditorDropdownComponent(true),
    },
    {
        name: 'bold',
        icon: 'fa-bold',
        label: 'Font Bold',
        parent: 'text',
    },
    {
        name: 'italic',
        icon: 'fa-italic',
        label: 'Font Italic',
        parent: 'text',
    },
    {
        name: 'underline',
        icon: 'fa-underline',
        label: 'Add Underline',
        parent: 'text',
    },
    {
        name: 'wavyline',
        icon: 'fa-percentage',
        label: 'Add Wavyline',
        parent: 'text',
    },
    {
        name: 'dashed',
        icon: 'fa-burn',
        label: '下标加点',
        parent: 'text',
    },
    {
        name: 'strike',
        icon: 'fa-strikethrough',
        label: '画线',
        parent: 'text',
    },
    {
        name: 'sub',
        icon: 'fa-subscript',
        label: '下标',
        parent: 'text',
    },
    {
        name: 'sup',
        icon: 'fa-superscript',
        label: '上标',
        parent: 'text',
    },
    {
        name: 'fontsize',
        icon: 'fa-pen-nib',
        label: 'Font Size',
        parent: 'text',
        modal: new EditorDropdownComponent,
    },
    {
        name: 'font',
        icon: 'fa-font',
        label: 'Font Family',
        parent: 'text',
        modal: new EditorDropdownComponent,
    },
    {
        name: 'foreground',
        icon: 'fa-broom',
        label: 'Font Color',
        parent: 'text',
        modal: new EditorColorComponent,
    },
    {
        name: 'background',
        icon: 'fa-fill',
        label: 'Background',
        parent: 'text',
        modal: new EditorColorComponent,
    },
    {
        name: 'clear',
        icon: 'fa-tint-slash',
        label: 'Clear Style',
        parent: 'text',
    },

    // 段落处理
    {
        name: 'align-left',
        icon: 'fa-align-left',
        label: 'Algin Left',
        parent: 'paragraph',
        handler(editor) {
            editor.insert({type: EditorBlockType.Align, value: 'left'})
        },
    },
    {
        name: 'align-center',
        icon: 'fa-align-center',
        label: 'Algin Center',
        parent: 'paragraph',
        handler(editor) {
            editor.insert({type: EditorBlockType.Align, value: 'center'})
        },
    },
    {
        name: 'align-right',
        icon: 'fa-align-right',
        label: 'Algin Right',
        parent: 'paragraph',
        handler(editor) {
            editor.insert({type: EditorBlockType.Align, value: 'right'})
        },
    },
    {
        name: 'align-justify',
        icon: 'fa-align-justify',
        label: 'Algin Justify',
        parent: 'paragraph',
        handler(editor) {
            editor.insert({type: EditorBlockType.Align, value: ''})
        },
    },
    {
        name: 'list',
        icon: 'fa-list',
        label: 'As List',
        parent: 'paragraph',
    },
    {
        name: 'indent',
        icon: 'fa-indent',
        label: 'Line Indent',
        parent: 'paragraph',
    },
    {
        name: 'outdent',
        icon: 'fa-outdent',
        label: 'Line Outdent',
        parent: 'paragraph',
    },
    {
        name: 'blockquote',
        icon: 'fa-quote-left',
        label: 'Add Blockquote',
        parent: 'paragraph',
    },


    // 添加
    {
        name: 'link',
        icon: 'fa-link',
        label: 'Add Link',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorLinkComponent,
        handler(editor, range, data) {
            editor.insert({
                type: EditorBlockType.AddLink,
                ...data                
            }, range);
        },
    },
    {
        name: 'image',
        icon: 'fa-image',
        label: 'Add Image',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorImageComponent,
        handler(editor, range, data) {
            editor.insert({
                type: EditorBlockType.AddImage,
                ...data                
            }, range);
        },
    },
    {
        name: 'video',
        icon: 'fa-file-video',
        label: 'Add Video',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorVideoComponent,
        handler(editor, range, data) {
            editor.insert({
                type: EditorBlockType.AddVideo,
                ...data                
            }, range);
        },
    },
    {
        name: 'table',
        icon: 'fa-table',
        label: 'Add Table',
        parent: 'add',
        modal: new EditorTableComponent,
        handler(editor, range, data) {
            editor.insert({
                type: EditorBlockType.AddTable,
                ...data                
            }, range);
        },
    },
    {
        name: 'file',
        icon: 'fa-file',
        label: 'Add File',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorFileComponent,
        handler(editor, range, data) {
            editor.insert({
                type: EditorBlockType.AddFile,
                ...data                
            }, range);
        },
    },
    {
        name: 'code',
        icon: 'fa-code',
        label: 'Add Code',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorCodeComponent,
        handler(editor, range, data) {
            editor.insert({
                type: EditorBlockType.AddCode,
                ...data                
            }, range);
        },
    },
    {
        name: 'line',
        icon: 'fa-minus',
        label: 'Add Line',
        parent: EDITOR_ADD_TOOL,
        handler(editor) {
            editor.insert({type: EditorBlockType.AddHr});
        }
    },

    // 更多
    {
        name: EDITOR_FULL_SCREEN_TOOL,
        icon: 'fa-expand',
        label: 'Toggle Full Screen',
        parent: EDITOR_MORE_TOOL,
    },
    {
        name: 'select-all',
        icon: 'fa-braille',
        label: 'Select All',
        parent: EDITOR_MORE_TOOL,
        handler(editor, range, data) {
            editor.selectAll();
        },
    },
    {
        name: EDITOR_CODE_TOOL,
        icon: 'fa-code',
        label: 'View Code',
        parent: EDITOR_MORE_TOOL,
    },

    // 图片处理
    {
        name: 'replace-image',
        icon: 'fa-exchange-alt',
        label: '替换',
        parent: EDITOR_IMAGE_TOOL, 
    },
    {
        name: 'align-image',
        icon: 'fa-align-right',
        label: '位置',
        parent: EDITOR_IMAGE_TOOL, 
    },
    {
        name: 'caption-image',
        icon: 'fa-image',
        label: '图片标题',
        parent: EDITOR_IMAGE_TOOL, 
    },
    {
        name: 'delete-image',
        icon: 'fa-trash',
        label: '删除图片',
        parent: EDITOR_IMAGE_TOOL, 
    },
    {
        name: 'link-image',
        icon: 'fa-link',
        label: '插入链接',
        parent: EDITOR_IMAGE_TOOL, 
    },
    {
        name: 'alt-image',
        icon: 'fa-font',
        label: '图片备注',
        modal: new EditorTextComponent('备注'),
        parent: EDITOR_IMAGE_TOOL, 
    },
    {
        name: 'size-image',
        icon: 'fa-ruler',
        label: '调整尺寸',
        modal: new EditorSizeComponent,
        parent: EDITOR_IMAGE_TOOL, 
    },
    
    // 视频处理
    {
        name: 'replace-video',
        icon: 'fa-exchange',
        label: '替换',
        parent: EDITOR_VIDEO_TOOL, 
    },
    {
        name: 'align-video',
        icon: 'fa-alignright',
        label: '位置',
        parent: EDITOR_VIDEO_TOOL, 
    },
    {
        name: 'caption-video',
        icon: 'fa-film',
        label: '视频标题',
        parent: EDITOR_VIDEO_TOOL, 
    },
    {
        name: 'delete-video',
        icon: 'fa-trash',
        label: '删除视频',
        parent: EDITOR_VIDEO_TOOL, 
    },
    {
        name: 'size-video',
        icon: 'fa-ruler',
        label: '调整尺寸',
        parent: EDITOR_VIDEO_TOOL, 
    },

    // 表格处理

    {
        name: 'header-table',
        icon: 'fa-heading',
        label: '表头',
        parent: EDITOR_TABLE_TOOL, 
    },
    {
        name: 'footer-table',
        icon: 'fa-table',
        label: '表尾',
        parent: EDITOR_TABLE_TOOL, 
    },
    {
        name: 'delete-table',
        icon: 'fa-trash',
        label: '删除表格',
        parent: EDITOR_TABLE_TOOL, 
    },
    {
        name: 'row-table',
        icon: 'fa-table',
        label: '行',
        parent: EDITOR_TABLE_TOOL, 
    },
    {
        name: 'column-table',
        icon: 'fa-table',
        label: '列',
        parent: EDITOR_TABLE_TOOL, 
    },
    {
        name: 'style-table',
        icon: 'fa-table',
        label: '表格样式',
        parent: EDITOR_TABLE_TOOL, 
    },
    {
        name: 'cell-table',
        icon: 'fa-table',
        label: '单元格',
        parent: EDITOR_TABLE_TOOL, 
    },
    {
        name: 'cell-background-table',
        icon: 'fa-brush',
        label: '单元格背景',
        parent: EDITOR_TABLE_TOOL, 
    },
    {
        name: 'cell-style-table',
        icon: 'fa-table',
        label: '单元格样式',
        parent: EDITOR_TABLE_TOOL, 
    },
    {
        name: 'horizontal-table',
        icon: 'fa-grip-horizontal',
        label: '横向合并',
        parent: EDITOR_TABLE_TOOL, 
    },
    {
        name: 'vertical-table',
        icon: 'fa-grip-vertical',
        label: '纵向合并',
        parent: EDITOR_TABLE_TOOL, 
    },
    // 链接处理

    {
        name: 'open-link',
        icon: 'fa-paper-plane',
        label: '打开链接',
        parent: EDITOR_LINK_TOOL, 
    },
    {
        name: 'link-style',
        icon: 'fa-brush',
        label: '更改样式',
        parent: EDITOR_LINK_TOOL, 
    },
    {
        name: 'edit-link',
        icon: 'fa-edit',
        label: '编辑链接',
        parent: EDITOR_LINK_TOOL, 
    },
    {
        name: 'unlink',
        icon: 'fa-unlink',
        label: '断开链接',
        parent: EDITOR_LINK_TOOL, 
    },
];