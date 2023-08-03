class EditorHelper {
    private static OTHER_WORD_CODE = [8220, 8221, 8216, 8217, 65281, 12290, 65292, 12304, 12305, 12289, 65311, 65288, 65289, 12288, 12298, 12299, 65306];
    /**
    * 计算内容的长度，排除空格符号等特殊字符
    */
    public static wordLength(val: string): number {
        if (!val) {
            return 0;
        }
        let code: number;
        let length = 0;
        for (let i = val.length - 1; i >= 0; i --) {
            code = val.charCodeAt(i);
            if (code < 48
                || (code > 57 && code < 65)
                || (code > 90 && code < 97)
                || (code > 122 && code < 128)
                || (code > 128 && this.OTHER_WORD_CODE.indexOf(code) >= 0)
                ) {
                continue;
            }
            length ++;
        }
        return length;
    }

    public static css(node: HTMLElement, style: any) {
        $(node).css(style);
    }

    public static height(node: HTMLElement): number {
        return $(node).height();
    }

    public static nodeClass(obj: any): string {
        const items = [];
        $.each(obj, (i, v) => {
            if (typeof i !== 'number') {
                v = v ? i : '';
            }
            if (v) {
                items.push(v);
            }
        });
        return items.join(' ');
    }

    public static nodeStyle(obj: any): string {
        if (!obj) {
            return '';
        }
        const items = [];
        $.each(obj, (i, v) => {
            if (typeof i !== 'number') {
                if (i !== 'z-index' && typeof v === 'number') {
                    v = v + 'px';
                }
                v = `${i.toString()}:${v};`;
            }
            if (v) {
                items.push(v);
            }
        });
        return items.join('');
    }

    public static modalInputBind<T = any>(element: JQuery<HTMLDivElement>, confirmFn: (data: T) => void) {
        element.on('change', 'input,textarea,select', function() {
            const $this = $(this);
            if ($this.attr('type') === 'file') {
                return;
            }
            const val = $this.val();
            $this.parent().toggleClass('input-not-empty', !!val);
        }).on('click', '.check-input', function() {
            const $this = $(this);
            const val = !$this.hasClass('fa-check-square');
            EditorHelper.toggleCheck($this, val);
        }).on('click', '.btn', function() {
            confirmFn(EditorHelper.modalInputData(element));
        });
    }

    private static toggleCheck(element: JQuery<HTMLElement>, val: any = false) {
        element.toggleClass('fa-check-square', !!val).toggleClass('fa-square', !val);
    }

    public static modalInputData(element: JQuery<HTMLDivElement>): any;
    public static modalInputData<T = any>(element: JQuery<HTMLDivElement>, data: T): T;
    public static modalInputData<T = any>(element: JQuery<HTMLDivElement>, data?: T): T|void {
        const res: any = {};
        const isSet = !!data;
        element.find('input,textarea,select,.check-input').each(function() {
            const $this = $(this);
            if ($this.attr('type') === 'file') {
                return;
            }
            const name = $this.attr('name');
            if ($this.hasClass('.check-input')) {
                if (isSet) {
                    EditorHelper.toggleCheck($this, data[name]);
                    return;
                }
                res[name] = $this.hasClass('fa-check-square');
                return;
            }
            if (isSet) {
                $this.val(data[name] || '').trigger('change');
                return;
            }
            res[name] = $this.val();
        });
        if (!isSet) {
            return res;
        }
    }

    public static modalFileUpload(element: JQuery<HTMLDivElement>, uploadFn: (data: FileList) => void) {
        element.on('change', 'input[type=file]', (e) => {
            uploadFn(e.target.files as FileList);
        }).on('dragover', e => {
            const transfer = this.getTransfer(e);
            if (!this.haveFiles(transfer.types)) {
                return;
            }
            transfer.dropEffect = 'copy';
            this.preventAndStop(e as any);
        }).on('dragleave', e => {
            if (e.currentTarget === element[0]) {
                return;
            }
            this.preventAndStop(e as  any);
        }).on('drop', e => {
            const transfer = this.getTransfer(e);
            if (!transfer) {
                return;
            }
            this.preventAndStop(e as any);
            uploadFn(transfer.files);
        });
    }

    public static uploadFile(url: string, files: File[]|FileList|File, success: (res: any) => void, failure: (message: string) => void, name = 'upfile') {
        const form = new FormData();
        if (files instanceof File) {
            form.append(name, files);
        } else {
            form.append(name, files[0]);
        }
        $.ajax({
            method: 'POST',
            url,
            data: form,
            cache: false,
            contentType: false,    //不可缺
            processData: false,    //不可缺
            success(res) {
                const data = typeof res === 'string' ? JSON.parse(res) : res;
                if (data.state === 'SUCCESS') {
                    data.title = data.original;
                    success(data);
                    return;
                }
                failure(data.state);
            }
        })
    }

    public static fileType(file: File): 'image'|'video'|'file' {
        if (file.type.indexOf('image') >= 0) {
            return 'image';
        }
        if (file.type.indexOf('video') >= 0) {
            return 'video';
        }
        return 'file';
    }

    private static getTransfer(event: any): any {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
    }
    
    private static preventAndStop(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    private static haveFiles(types: any): boolean {
        if (!types) {
            return false;
        }
        if (types.indexOf) {
            return types.indexOf('Files') !== -1;
        } else if (types.contains) {
            return types.contains('Files');
        } else {
            return false;
        }
    }
}