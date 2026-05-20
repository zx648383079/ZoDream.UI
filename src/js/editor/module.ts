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
const EDITOR_OVERLAY_TOOL = 'overlay_edit';
const EDITOR_LINK_TOOL = 'link_edit';


const EditorModules: IEditorModule[] = [
    {
        name: 'text',
        icon: 'fa-font',
        short: 'Text',
        label: 'Edit Text',
    },
    {
        name: 'paragraph',
        icon: 'fa-paragraph',
        short: 'Paragraph',
        label: 'Edit Paragraph',
    },
    {
        name: EDITOR_ADD_TOOL,
        icon: 'fa-plus',
        label: 'Add Content',
        short: 'Add',
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
            editor.execute({type: EditorCommandType.AddLineBreak});
        }
    },
    // 文字处理
    {
        name: 'head',
        icon: 'fa-heading',
        label: 'H1-H6',
        parent: 'text',
        modal: new EditorDropdownComponent(true),
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.H});
        },
    },
    {
        name: 'bold',
        icon: 'fa-bold',
        short: 'Bold',
        label: 'Font Bold',
        parent: 'text',
        handler(editor) {
            editor.execute({type: EditorCommandType.Bold});
        },
    },
    {
        name: 'italic',
        icon: 'fa-italic',
        short: 'Italic',
        label: 'Font Italic',
        parent: 'text',
        handler(editor) {
            editor.execute({type: EditorCommandType.Italic});
        },
    },
    {
        name: 'underline',
        icon: 'fa-underline',
        short: 'Underline',
        label: 'Add Underline',
        parent: 'text',
        handler(editor) {
            editor.execute({type: EditorCommandType.Underline});
        },
    },
    {
        name: 'wavyline',
        icon: 'fa-wavyline',
        short: 'Wavyline',
        label: 'Add Wavyline',
        parent: 'text',
        handler(editor) {
            editor.execute({type: EditorCommandType.Wavyline});
        },
    },
    {
        name: 'dashed',
        icon: 'fa-dashed',
        short: 'Mark',
        label: 'Subscript and dot',
        parent: 'text',
        handler(editor) {
            editor.execute({type: EditorCommandType.Dashed});
        },
    },
    {
        name: 'strike',
        icon: 'fa-strikethrough',
        label: 'Strike Through',
        parent: 'text',
        handler(editor) {
            editor.execute({type: EditorCommandType.Strike});
        },
    },
    {
        name: 'sub',
        icon: 'fa-subscript',
        label: 'Sub',
        parent: 'text',
        handler(editor) {
            editor.execute({type: EditorCommandType.Sub});
        },
    },
    {
        name: 'sup',
        icon: 'fa-superscript',
        label: 'Sup',
        parent: 'text',
        handler(editor) {
            editor.execute({type: EditorCommandType.Sub});
        },
    },
    {
        name: 'fontsize',
        icon: 'fa-pen-nib',
        label: 'Font Size',
        short: 'Size',
        parent: 'text',
        modal: new EditorDropdownComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.FontSize});
        },
    },
    {
        name: 'font',
        icon: 'fa-font',
        label: 'Font Family',
        short: 'Font',
        parent: 'text',
        modal: new EditorDropdownComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.FontFamily});
        },
    },
    {
        name: 'foreground',
        icon: 'fa-broom',
        label: 'Font Color',
        short: 'Color',
        parent: 'text',
        modal: new EditorColorComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.Foreground});
        },
    },
    {
        name: 'background',
        icon: 'fa-fill',
        label: 'Background',
        parent: 'text',
        modal: new EditorColorComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.Background});
        },
    },
    {
        name: 'clear',
        icon: 'fa-tint-slash',
        label: 'Clear Style',
        short: 'Clear',
        parent: 'text',
        handler(editor) {
            editor.execute({type: EditorCommandType.ClearStyle});
        },
    },

    // 段落处理
    {
        name: 'align-left',
        icon: 'fa-align-left',
        label: 'Algin Left',
        short: 'Left',
        parent: 'paragraph',
        handler(editor) {
            editor.execute({type: EditorCommandType.Align, value: 'left'})
        },
    },
    {
        name: 'align-center',
        icon: 'fa-align-center',
        label: 'Algin Center',
        short: 'Center',
        parent: 'paragraph',
        handler(editor) {
            editor.execute({type: EditorCommandType.Align, value: 'center'})
        },
    },
    {
        name: 'align-right',
        icon: 'fa-align-right',
        label: 'Algin Right',
        short: 'Right',
        parent: 'paragraph',
        handler(editor) {
            editor.execute({type: EditorCommandType.Align, value: 'right'})
        },
    },
    {
        name: 'align-justify',
        icon: 'fa-align-justify',
        label: 'Algin Justify',
        short: 'Justify',
        parent: 'paragraph',
        handler(editor) {
            editor.execute({type: EditorCommandType.Align, value: ''})
        },
    },
    {
        name: 'list',
        icon: 'fa-list',
        label: 'As List',
        short: 'List',
        parent: 'paragraph',
        handler(editor) {
            editor.execute({type: EditorCommandType.List});
        },
    },
    {
        name: 'indent',
        icon: 'fa-indent',
        label: 'Line Indent',
        short: 'Indent',
        parent: 'paragraph',
        handler(editor) {
            editor.execute({type: EditorCommandType.Indent});
        },
    },
    {
        name: 'outdent',
        icon: 'fa-outdent',
        label: 'Line Outdent',
        short: 'Outdent',
        parent: 'paragraph',
        handler(editor) {
            editor.execute({type: EditorCommandType.Outdent});
        },
    },
    {
        name: 'blockquote',
        icon: 'fa-quote-left',
        short: 'Blockquote',
        label: 'Add Blockquote',
        parent: 'paragraph',
        handler(editor) {
            editor.execute({type: EditorCommandType.Blockquote});
        },
    },


    // 添加
    {
        name: 'link',
        icon: 'fa-link',
        label: 'Add Link',
        short: 'Link',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorLinkComponent,
        handler(editor, range, data) {
            editor.execute({
                type: EditorCommandType.AddLink,
                ...data                
            }, range);
        },
    },
    {
        name: 'image',
        icon: 'fa-image',
        label: 'Add Image',
        short: 'Image',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorImageComponent,
        handler(editor, range, data) {
            editor.execute({
                type: EditorCommandType.AddImage,
                ...data                
            }, range);
        },
    },
    {
        name: 'video',
        icon: 'fa-file-video',
        label: 'Add Video',
        short: 'Video',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorVideoComponent,
        handler(editor, range, data) {
            editor.execute({
                type: EditorCommandType.AddVideo,
                ...data                
            }, range);
        },
    },
    {
        name: 'table',
        icon: 'fa-table',
        label: 'Add Table',
        short: 'Table',
        parent: 'add',
        modal: new EditorTableComponent,
        handler(editor, range, data) {
            editor.execute({
                type: EditorCommandType.AddTable,
                ...data                
            }, range);
        },
    },
    {
        name: 'file',
        icon: 'fa-file',
        label: 'Add File',
        short: 'File',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorFileComponent,
        handler(editor, range, data) {
            editor.execute({
                type: EditorCommandType.AddFile,
                ...data                
            }, range);
        },
    },
    {
        name: 'code',
        icon: 'fa-code',
        label: 'Add Code',
        short: 'Code',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorCodeComponent,
        handler(editor, range, data) {
            editor.execute({
                type: EditorCommandType.AddCode,
                ...data                
            }, range);
        },
    },
    {
        name: 'line',
        icon: 'fa-minus',
        label: 'Add Line',
        short: 'Line',
        parent: EDITOR_ADD_TOOL,
        handler(editor) {
            editor.execute({type: EditorCommandType.AddHr});
        }
    },
    {
        name: 'map',
        icon: 'fa-map-marked',
        label: 'Add Map Marker',
        short: 'Map',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorMapComponent,
        handler(editor, range, data) {
            editor.execute({
                type: EditorCommandType.AddFrame,
                value: '/home/map?point=' + data.value + '&marker=' + encodeURIComponent(data.mark),        
            }, range);
        }
    },

    // 更多
    {
        name: EDITOR_FULL_SCREEN_TOOL,
        icon: 'fa-expand',
        label: 'Toggle Full Screen',
        short: 'FullScreen',
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
        label: 'Replace',
        parent: EDITOR_IMAGE_TOOL, 
        modal: new EditorImageComponent,
        handler(editor, range, data) {
            editor.execute({
                type: EditorCommandType.AddImage,
                ...data                
            }, range);
        },
    },
    {
        name: 'align-image',
        icon: 'fa-align-right',
        label: 'Position',
        parent: EDITOR_IMAGE_TOOL, 
        modal: new EditorDropdownComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.Align});
        },
    },
    {
        name: 'caption-image',
        icon: 'fa-image',
        label: 'Image Title',
        parent: EDITOR_IMAGE_TOOL,
        modal: new EditorTextComponent('Title'),
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.NodeTitle});
        },
    },
    {
        name: 'delete-image',
        icon: 'fa-trash',
        label: 'Delete Image',
        parent: EDITOR_IMAGE_TOOL, 
        handler(editor) {
            editor.execute({type: EditorCommandType.NodeRemove});
        },
    },
    {
        name: 'link-image',
        icon: 'fa-link',
        label: 'Insert Link',
        parent: EDITOR_IMAGE_TOOL,
        modal: new EditorLinkComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.AddLink});
        },
    },
    {
        name: 'alt-image',
        icon: 'fa-font',
        label: 'Image caption',
        modal: new EditorTextComponent('Caption'),
        parent: EDITOR_IMAGE_TOOL,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.NodeTitle});
        },
    },
    {
        name: 'size-image',
        icon: 'fa-ruler',
        label: 'Adjust size',
        parent: EDITOR_IMAGE_TOOL,
        modal: new EditorSizeComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.NodeResize});
        },
    },
    
    // 视频处理
    {
        name: 'replace-video',
        icon: 'fa-exchange',
        label: 'Replace',
        parent: EDITOR_VIDEO_TOOL, 
        modal: new EditorVideoComponent,
        handler(editor, range, data) {
            editor.execute({
                type: EditorCommandType.AddVideo,
                ...data                
            }, range);
        },
    },
    {
        name: 'align-video',
        icon: 'fa-align-right',
        label: 'Position',
        parent: EDITOR_VIDEO_TOOL,
        modal: new EditorDropdownComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.Align});
        },
    },
    {
        name: 'caption-video',
        icon: 'fa-film',
        label: 'Video Title',
        parent: EDITOR_VIDEO_TOOL, 
        modal: new EditorTextComponent('Title'),
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.NodeTitle});
        },
    },
    {
        name: 'delete-video',
        icon: 'fa-trash',
        label: 'Delete Video',
        parent: EDITOR_VIDEO_TOOL, 
        handler(editor) {
            editor.execute({type: EditorCommandType.NodeRemove});
        },
    },
    {
        name: 'size-video',
        icon: 'fa-ruler',
        label: 'Adjust size',
        parent: EDITOR_VIDEO_TOOL,
        modal: new EditorSizeComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.NodeResize});
        },
    },
    /// iframe
    {
        name: 'align-frame',
        icon: 'fa-align-right',
        label: 'Position',
        parent: EDITOR_OVERLAY_TOOL,
        modal: new EditorDropdownComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.Align});
        },
    },
    {
        name: 'delete-frame',
        icon: 'fa-trash',
        label: 'Delete',
        parent: EDITOR_OVERLAY_TOOL, 
        handler(editor) {
            editor.execute({type: EditorCommandType.NodeRemove});
        },
    },
    {
        name: 'size-frame',
        icon: 'fa-ruler',
        label: 'Adjust size',
        parent: EDITOR_OVERLAY_TOOL,
        modal: new EditorSizeComponent,
        handler(editor, _, data) {
            editor.execute({...data, type: EditorCommandType.NodeResize});
        },
    },

    // 表格处理

    {
        name: 'header-table',
        icon: 'fa-heading',
        label: 'Table Head',
        parent: EDITOR_TABLE_TOOL, 
        handler(editor) {
            editor.execute({type: EditorCommandType.Thead});
        },
    },
    {
        name: 'footer-table',
        icon: 'fa-table',
        label: 'Table Foot',
        parent: EDITOR_TABLE_TOOL, 
        handler(editor) {
            editor.execute({type: EditorCommandType.TFoot});
        },
    },
    {
        name: 'delete-table',
        icon: 'fa-trash',
        label: 'Delete Table',
        parent: EDITOR_TABLE_TOOL,
        handler(editor) {
            editor.execute({type: EditorCommandType.DeleteTable});
        },
    },
    {
        name: 'add-row-table',
        icon: 'fa-add-row',
        label: 'Add Row',
        parent: EDITOR_TABLE_TOOL,
        handler(editor) {
            editor.execute({type: EditorCommandType.AddRow});
        },
    },
    {
        name: 'add-column-table',
        icon: 'fa-add-col',
        label: 'Add Column',
        parent: EDITOR_TABLE_TOOL, 
        handler(editor) {
            editor.execute({type: EditorCommandType.AddCol});
        },
    },
    {
        name: 'delete-row-table',
        icon: 'fa-delete-row',
        label: 'Delete Row',
        parent: EDITOR_TABLE_TOOL,
        handler(editor) {
            editor.execute({type: EditorCommandType.DeleteRow});
        },
    },
    {
        name: 'delete-column-table',
        icon: 'fa-delete-col',
        label: 'Delete Column',
        parent: EDITOR_TABLE_TOOL,
        handler(editor) {
            editor.execute({type: EditorCommandType.DeleteCol});
        },
    },
    // {
    //     name: 'style-table',
    //     icon: 'fa-table',
    //     label: 'Table Style',
    //     parent: EDITOR_TABLE_TOOL, 
    // },
    // {
    //     name: 'cell-table',
    //     icon: 'fa-table',
    //     label: 'Cell',
    //     parent: EDITOR_TABLE_TOOL, 
    // },
    // {
    //     name: 'cell-background-table',
    //     icon: 'fa-brush',
    //     label: 'Cell background',
    //     parent: EDITOR_TABLE_TOOL, 
    // },
    // {
    //     name: 'cell-style-table',
    //     icon: 'fa-table',
    //     label: 'Cell Style',
    //     parent: EDITOR_TABLE_TOOL, 
    // },
    {
        name: 'horizontal-table',
        icon: 'fa-grip-horizontal',
        label: 'Horizontal merger',
        parent: EDITOR_TABLE_TOOL, 
        handler(editor) {
            editor.execute({type: EditorCommandType.ColSpan});
        },
    },
    {
        name: 'vertical-table',
        icon: 'fa-grip-vertical',
        label: 'Vertical merger',
        parent: EDITOR_TABLE_TOOL, 
        handler(editor) {
            editor.execute({type: EditorCommandType.RowSpan});
        },
    },
    // 链接处理

    {
        name: 'open-link',
        icon: 'fa-paper-plane',
        label: 'Open Link',
        parent: EDITOR_LINK_TOOL, 
        handler(editor) {
            editor.execute({type: EditorCommandType.OpenLink});
        },
    },
    // {
    //     name: 'link-style',
    //     icon: 'fa-brush',
    //     label: 'Change Style',
    //     parent: EDITOR_LINK_TOOL, 
    // },
    {
        name: 'edit-link',
        icon: 'fa-edit',
        label: 'Edit Link',
        parent: EDITOR_LINK_TOOL, 
        modal: new EditorLinkComponent,
        handler(editor, range, data) {
            editor.execute({
                type: EditorCommandType.AddLink,
                ...data                
            }, range);
        },
    },
    {
        name: 'unlink',
        icon: 'fa-unlink',
        label: 'Disconnect',
        parent: EDITOR_LINK_TOOL,
        handler(editor) {
            editor.execute({type: EditorCommandType.Unlink});
        },
    },
];