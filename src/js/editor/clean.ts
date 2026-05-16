
class EditorHtmlCleaner {

    private static overlayTag = '--with-overlay';
    private static overlayTags = ['video', 'iframe'];

    private static removeTags = ['script', 'style', 'link', 'meta', 'noscript', 
            'basefont', 'center', 'dir', 'font', 'frame', 
            'frameset', 'isindex', 'menu', 'noframes', 
            's', 'strike', 'u'];
    private static removeStyles = ['font', 'font-family', 'letter-spacing', 'font-stretch', 'font-size-adjust'];
    /**
     * 粘贴的时候删除
     */
    private static removeStylesIf = ['color', 'background', 'background-color'];
    private static replaceTags = [
        [['b', 'big'], 'strong'],
        [['i'], 'em']
    ];
    private static tagAttributes = [
        ['class'],  // default, for all tags not mentioned
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

    public static classStartsWith(items: DOMTokenList|HTMLElement): boolean {
        if (items instanceof HTMLElement) {
            items = items.classList;
        }
        for (let i = 0; i < items.length; i++) {
            if (items[i].startsWith(this.overlayTag)) {
                return true;
            }
        }
        return false;
    }

    public static getReplaceTag(tag: string): string|undefined {
        for (const item of this.removeTags) {
            if (item[0].indexOf(tag) >= 0) {
                return item[1];
            }
        }
        return undefined;
    }

    public static replaceTag(node: HTMLElement, tag: string): HTMLElement {
        const res = document.createElement(tag);
        const attributes = node.attributes;
        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            res.setAttribute(attr.name, attr.value);
        }
        while (node.firstChild) {
            res.appendChild(node.firstChild);
        }
        return res;
    }

    public static isRemoveTag(tag: string): boolean {
        return this.removeTags.indexOf(tag) >= 0;
    }

    public static filterNodeStyle(el: HTMLElement, excludes: string[]) {
        if (!el.hasAttribute('style')) {
            return;  
        }
        const style = el.getAttribute('style');
        if (!style) {
            return;
        }
        const filteredStyle = style
            .split(';')
            .map(decl => decl.trim())
            .filter(decl => {
                if (!decl) return false;
                const prop = decl.split(':')[0].trim().toLowerCase();
                return excludes.indexOf(prop) < 0;
            })
            .join(';');
        if (filteredStyle) {
            el.setAttribute('style', filteredStyle);
        } else {
            el.removeAttribute('style');
        }
    }

    public static getAttributeNames (tag: string): string[] {
        for (let index = 1; index < this.tagAttributes.length; index += 2) {
            if (this.tagAttributes[index] === tag) {
                return this.tagAttributes[index + 1] as string[];
            }
        }
        return this.tagAttributes[0] as string[];
    }

    public static filterNodeAttr(el: HTMLElement, tag: string) {
        const items = [...this.getAttributeNames(tag), 'style'];

        const names = el.getAttributeNames();
        for (const name of names) {
            if (items.indexOf(name.toLowerCase()) >= 0) {
                continue;
            }
            el.removeAttribute(name);
        }
    }

    public static isOverlay(node: Node): boolean {
        return node instanceof HTMLDivElement && node.classList.contains(this.overlayTag);
    }

    public static createOverlay(node?: Node): Node {
        const wrapper = document.createElement('div');
        wrapper.className = this.overlayTag;
        if (node) {
            wrapper.appendChild(node);
        }
        return wrapper;
    }

    /**
     * 节点是否需要遮罩
     * @param tag 
     * @returns 
     */
    public static isOverlayTag(tag: string): boolean {
        return this.overlayTags.indexOf(tag) >= 0;
    }

    /**
     * 添加到节点上
     * @param parent 
     * @param value 
     * @param cleansing 是否需要删除一些节点，清除背景
     */
    public static toNode(parent: HTMLElement, 
        value: string, cleansing = false): void {
        parent.innerHTML = value;
        for (let i = parent.childNodes.length - 1; i >= 0; i --) {
            this.decorateNode(parent.childNodes[i], cleansing);
        }
    }

    /**
     * 处理元素节点，添加遮罩
     * @param node 
     * @returns 
     */
    private static decorateNode(node: Node, cleansing = false): void {
        // 处理元素节点
        if (!(node instanceof HTMLElement)) {
            return;
        }
        const tagName = node.tagName.toLowerCase();
        if (cleansing) {
            if (this.isRemoveTag(tagName)) {
                node.parentNode?.removeChild(node);
                return;
            }
            this.filterNodeStyle(node, this.removeStylesIf);
        }
        if (this.isOverlayTag(tagName)) {
            this.addOverlay(node);
            return;
        }
        for (let i = node.childNodes.length - 1; i >= 0; i --) {
            this.decorateNode(node.childNodes[i], cleansing);
        }
    }

    private static addOverlay(node: HTMLElement): void {
        const parent = node.parentNode;
        if (!parent) {
            return;
        }
        const wrapper = this.createOverlay();
        parent.replaceChild(wrapper, node);
        wrapper.appendChild(node);
    }

    /**
     * 转化为 html
     * @param items 
     */
    public static toRaw(parent: HTMLElement): string {
        const clone = parent.cloneNode(true) as HTMLElement;
        this.cleanNode(clone);
        return clone.innerHTML;
    }


    /**
     * 清理不需要的节点，去除遮罩
     * @param node 
     * @returns 
     */
    private static cleanNode(node: Node): Node | null {
        // 处理元素节点
        if (node instanceof HTMLElement) {
            const tagName = node.tagName.toLowerCase();

            // 检查是否需要移除该标签
            if (this.isRemoveTag(tagName)) {
                return null; // 移除整个节点
            }

            const toTag = this.getReplaceTag(tagName);
            if (toTag) {
                node = this.replaceTag(node, toTag);
            }

            if (this.isOverlay(node)) {
                // 找到第一个非空子节点（元素或文本）
                let firstChild: Node | null = null;
                for (let i = 0; i < node.childNodes.length; i ++) {
                    const processed = this.cleanNode(node.childNodes[i]);
                    if (processed) {
                        firstChild = processed;
                        break;
                    }
                }
                // 返回第一个子节点，替换当前元素
                return firstChild;
            }

            this.filterNodeAttr(node as HTMLElement, tagName);

            this.filterNodeStyle(node as HTMLElement, this.removeStyles);

            for (let i = node.childNodes.length - 1; i >= 0; i--) {
                const child = node.childNodes[i];
                const processed = this.cleanNode(child);
                if (processed === null) {
                    node.removeChild(child);
                } else if (processed !== child) {
                    node.replaceChild(processed, child);
                }
            }
        }

        return node;
    }
}