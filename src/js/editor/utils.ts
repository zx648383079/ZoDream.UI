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
    /**
     * zhuang
     * @param items 
     */
    public static toRaw(parent: HTMLElement): string {
        const removeTags = ['script', 'style', 'link', 'meta', 'iframe', 'noscript', 
            'basefont', 'center', 'dir', 'font', 'frame', 
            'frameset', 'isindex', 'menu', 'noframes', 
            's', 'strike', 'u'];
        const removeStyles = ['font', 'letter-spacing', 'font-stretch', 'font-size-adjust'];
        const replaceTags = [
            [['b', 'big'], 'strong'],
            [['i'], 'em']
        ];
        const tagAttributes = [
            ['class', 'style'],  // default, for all tags not mentioned
            '?xml', [],
            '!doctype', [],
            'a', ['accesskey', 'class', 'href', 'name', 'title', 'rel', 'rev', 'type', 'tabindex'],
            'abbr', ['class', 'title'],
            'acronym', ['class', 'title'],
            'blockquote', ['cite', 'class'],
            'button', ['class', 'disabled', 'name', 'type', 'value'],
            'del', ['cite', 'class', 'datetime'],
            'form', ['accept', 'action', 'class', 'enctype', 'method', 'name'],
            'iframe', ['class', 'height', 'frameborder', 'name', 'sandbox', 'seamless', 'src', 'srcdoc', 'width'],
            'input', ['accept', 'accesskey', 'alt', 'checked', 'class', 'disabled', 'ismap', 'maxlength', 'name', 'size', 'readonly', 'src', 'tabindex', 'type', 'usemap', 'value', 'multiple'],
            'img', ['alt', 'class', 'height', 'src', 'width'],
            'ins', ['cite', 'class', 'datetime'],
            'label', ['accesskey', 'class', 'for'],
            'legend', ['accesskey', 'class'],
            'link', ['href', 'rel', 'type'],
            'meta', ['content', 'http-equiv', 'name', 'scheme', 'charset'],
            'map', ['name'],
            'optgroup', ['class', 'disabled', 'label'],
            'option', ['class', 'disabled', 'label', 'selected', 'value'],
            'q', ['class', 'cite'],
            'script', ['src', 'type'],
            'select', ['class', 'disabled', 'multiple', 'name', 'size', 'tabindex'],
            'style', ['type'],
            'table', ['class', 'summary'],
            'th', ['class', 'colspan', 'rowspan'],
            'td', ['class', 'colspan', 'rowspan'],
            'textarea', ['accesskey', 'class', 'cols', 'disabled', 'name', 'readonly', 'rows', 'tabindex'],
            'param', ['name', 'value'],
            'embed', ['height', 'src', 'type', 'width']
        ];
        const clone = parent.cloneNode(true) as HTMLElement;

        /**
         * 递归处理节点
         */
        const processNode = (node: Node): Node | null => {
            // 处理元素节点
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const tagName = el.tagName.toLowerCase();

                // 检查是否需要移除该标签
                if (removeTags.indexOf(tagName) >= 0) {
                    return null; // 移除整个节点
                }

                

                let hasNotPrefix = false;
                for (const className in el.classList) {
                    if (className.startsWith('--not')) {
                        hasNotPrefix = true;
                        break;
                    }
                }

                if (hasNotPrefix) {
                    // 找到第一个非空子节点（元素或文本）
                    let firstChild: Node | null = null;
                    for (const child of Array.from(el.childNodes)) {
                        const processed = processNode(child);
                        if (processed) {
                            firstChild = processed;
                            break;
                        }
                    }
                    // 返回第一个子节点，替换当前元素
                    return firstChild;
                }

                // 处理 style 属性：移除字体相关设置
                if (el.hasAttribute('style')) {
                    const style = el.getAttribute('style');
                    if (style) {
                        // 移除 font-*, font 简写, letter-spacing, line-height 等
                        const filteredStyle = style
                            .split(';')
                            .map(decl => decl.trim())
                            .filter(decl => {
                                if (!decl) return false;
                                const prop = decl.split(':')[0].trim().toLowerCase();
                                // 保留非字体相关属性
                                return removeStyles.indexOf(prop) < 0;
                            })
                            .join(';');
                        
                        if (filteredStyle) {
                            el.setAttribute('style', filteredStyle);
                        } else {
                            el.removeAttribute('style');
                        }
                    }
                }

                // 递归处理子节点
                const children = Array.from(el.childNodes);
                for (const child of children) {
                    const processed = processNode(child);
                    if (processed === null) {
                        el.removeChild(child);
                    } else if (processed !== child) {
                        el.replaceChild(processed, child);
                    }
                }
            }

            return node;
        }

        processNode(clone);
        return clone.innerHTML;
    }

    public static toNode(parent: HTMLElement, value: string): void {
        parent.innerHTML = value;
    
        /**
         * 递归处理节点，为每个 iframe 添加包装父级
         * @param node 当前节点
         */
        const processNode = (node: Node): void => {
            // 处理元素节点
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                
                // 如果是 iframe 元素，进行包装
                if (element.tagName.toLowerCase() === 'iframe') {
                    wrapOverlay(element);
                } else {
                    // 递归处理子节点
                    const children = Array.from(element.childNodes);
                    for (const child of children) {
                        processNode(child);
                    }
                }
            }
        }
        
        /**
         * 为 iframe 元素添加包装 div
         * @param iframe 原始 iframe 元素
         */
        const wrapOverlay = (iframe: HTMLElement): void => {
            // 创建包装 div
            const wrapper = document.createElement('div');
            wrapper.className = '--not-node';
            
            // 获取 iframe 的父节点
            const parent = iframe.parentNode;
            if (!parent) return;
            
            // 将包装 div 插入到 iframe 的位置
            parent.replaceChild(wrapper, iframe);
            
            // 将 iframe 添加到包装 div 中
            wrapper.appendChild(iframe);
        }
        
        // 处理容器内的所有节点
        const children = Array.from(parent.childNodes);
        for (const child of children) {
            processNode(child);
        }
    }
}