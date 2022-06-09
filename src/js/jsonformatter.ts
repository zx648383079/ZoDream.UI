
enum VALUE_TYPE {
    NULL,
    STRING,
    BOOL,
    NUMBER,
    OBJECT,
    ARRAY,
    COMMENT,
}

class JSONFormatter {
    
    public render(data: any): string {
        if (typeof data !== 'string') {
            return this.renderBar() + this.renderRaw(JSON.stringify(data)) + this.renderFormat(data);
        }
        return this.renderBar() + this.renderRaw(data) + this.renderFormat(data);
    }

    private renderRaw(data: string) {
        return `<pre class="raw-body" style="display:none;">${data}</pre>`
    }

    private getSpanBoth(innerText?: string, className?: string) {
        let attr = '';
        if (className) {
            attr = ` class="${className}"`;
        }
        if (!innerText) {
            innerText = '';
        }
        return `<span${attr}>${innerText}</span>`;
    }

    private firstJSONCharIndex(s: string): number {
        const arrayIdx = s.indexOf('[');
        const objIdx = s.indexOf('{');
        let idx = 0;
        if (arrayIdx !== -1)
          idx = arrayIdx ;
        if (objIdx !== -1) {
          if (arrayIdx === -1)
            idx = objIdx ;
          else
            idx = Math.min(objIdx, arrayIdx) ;
        }
        return idx;
    }

    private removeComments(str: string): string {
        const blocks = ('__' + str + '__').split('');
        const mode = {
          singleQuote: false,
          doubleQuote: false,
          regex: false,
          blockComment: false,
          lineComment: false,
          condComp: false
        };
        for (var i = 0, l = blocks.length; i < l; i++) {
          if (mode.regex) {
            if (blocks[i] === '/' && blocks[i-1] !== '\\') {
              mode.regex = false;
            }
            continue;
          }
          if (mode.singleQuote) {
            if (blocks[i] === "'" && blocks[i-1] !== '\\') {
              mode.singleQuote = false;
            }
            continue;
          }
          if (mode.doubleQuote) {
            if (blocks[i] === '"' && blocks[i-1] !== '\\') {
              mode.doubleQuote = false;
            }
            continue;
          }
          if (mode.blockComment) {
            if (blocks[i] === '*' && blocks[i+1] === '/') {
              blocks[i+1] = '';
              mode.blockComment = false;
            }
            blocks[i] = '';
            continue;
          }
          if (mode.lineComment) {
            if (blocks[i+1] === '\n' || blocks[i+1] === '\r') {
              mode.lineComment = false;
            }
            blocks[i] = '';
            continue;
          }
          if (mode.condComp) {
            if (blocks[i-2] === '@' && blocks[i-1] === '*' && blocks[i] === '/') {
              mode.condComp = false;
            }
            continue;
          }
          mode.doubleQuote = blocks[i] === '"';
          mode.singleQuote = blocks[i] === "'";
          if (blocks[i] === '/') {
            if (blocks[i+1] === '*' && blocks[i+2] === '@') {
              mode.condComp = true;
              continue;
            }
            if (blocks[i+1] === '*') {
              blocks[i] = '';
              mode.blockComment = true;
              continue;
            }
            if (blocks[i+1] === '/') {
              blocks[i] = '';
              mode.lineComment = true;
              continue;
            }
            mode.regex = true;
          }
        }
        return blocks.join('').slice(2, -2);
    }

    private renderFormat(text: any) {
        if (typeof text === 'object') {
            const html = this.renderJson(text) ;
            return `<div class="format-body">${html}</div>`;
        }
        // Try to parse as JSON
        let obj: any;
        let jsonpFunctionName = '';

        // Strip any leading garbage, such as a 'while(1);'
        const strippedText = text.substring(this.firstJSONCharIndex(text) ) ;

        try {
            obj = JSON.parse(strippedText);
        }
        catch (e) {

        // Not JSON; could be JSONP though.
        // Try stripping 'padding' (if any), and try parsing it again
            text = text.trim() ;
            // Find where the first paren is (and exit if none)
            var indexOfParen ;
            if (!(indexOfParen = text.indexOf('(') ) ) {
                return 'error';
            }
    
            // Get the substring up to the first "(", with any comments/whitespace stripped out
            const firstBit = this.removeComments(text.substring(0, indexOfParen)).trim() ;
            if ( ! firstBit.match(/^[a-zA-Z_$][\.\[\]'"0-9a-zA-Z_$]*$/) ) {
                // The 'firstBit' is NOT a valid function identifier.
                return 'error';
            }
    
            // Find last parenthesis (exit if none)
            let indexOfLastParen: number ;
            if ( ! (indexOfLastParen = text.lastIndexOf(')') ) ) {
                return 'error';
            }
    
            // Check that what's after the last parenthesis is just whitespace, comments, and possibly a semicolon (exit if anything else)
            const lastBit = this.removeComments(text.substring(indexOfLastParen+1)).trim() ;
            if ( lastBit !== "" && lastBit !== ';' ) {
                return 'error';
            }
      
            // So, it looks like a valid JS function call, but we don't know whether it's JSON inside the parentheses...
            // Check if the 'argument' is actually JSON (and record the parsed result)
            text = text.substring(indexOfParen+1, indexOfLastParen) ;
            try {
                obj = JSON.parse(text);
            }
            catch (e2) {
                // Just some other text that happens to be in a function call.
                // Respond as not JSON, and exit
                return 'error';
            }
      
            jsonpFunctionName = firstBit ;
        }

        // If still running, we now have obj, which is valid JSON.

        // Ensure it's not a number or string (technically valid JSON, but no point prettifying it)
        if (typeof obj !== 'object') {
            return 'error';
        }
        // Do formatting
        const html = this.renderJson(obj, jsonpFunctionName) ;
        return `<div class="format-body">${html}</div>`;
    }

    private parseType(value: any): VALUE_TYPE {
        if (typeof value === 'string')
        {
            return VALUE_TYPE.STRING;
        }
        if (typeof value === 'number')
        {
            return VALUE_TYPE.NUMBER;
        }
        if (typeof value === 'boolean')
        {
            return VALUE_TYPE.BOOL;
        }
        if (value === null || typeof value === 'undefined') {
            return VALUE_TYPE.NULL;
        }
        if (value instanceof Array)
        {
            return VALUE_TYPE.ARRAY;
        }
        return VALUE_TYPE.OBJECT;
    }

    private renderValue(value: any, type: VALUE_TYPE): string {
        if (type === VALUE_TYPE.NULL) {
            return this.getSpanBoth('null', 'nl');
        }
        if (type === VALUE_TYPE.NUMBER) {
            return this.getSpanBoth(`${value}`, 'n');
        }
        if (type === VALUE_TYPE.BOOL) {
            return this.getSpanBoth(value ? 'true' : 'false', 'bl');
        }
        if (type === VALUE_TYPE.STRING) {
            return this.getSpanBoth(`"${value}"`, 's');
        }
        if (type === VALUE_TYPE.ARRAY) {
            return this.renderArrayValue(value);
        }
        return this.renderObjectValue(value);
    }

    private renderObjectValue(value: any): string {
        const keys = Object.keys(value);
        const items: string[] = keys.map((v, i) => {
            const t = this.parseType(value[v]);
            const s = this.renderValue(value[v], t);
            const comma = i >= keys.length - 1 ? '' : ',';
            const prefix = t === VALUE_TYPE.ARRAY || t === VALUE_TYPE.OBJECT ? '<span class="e"></span>' : '';
            return `<span class="kvov objProp">${prefix}"<span class="k">${v}</span>": ${s}${comma}</span>`;
        });
        let text = '';
        if (items.length > 0) {
            text = `<span class="block-inner">${items.join('')}</span>`;
        }
        return `<span class="b">{</span><span class="ell"></span>${text}<span class="b">}</span><span class="bc">// ${items.length} items</span>`;
    }

    private renderArrayValue(value: any[]): string {
        const items: string[] = value.map((v, i) => {
            const s = this.renderValue(v, this.parseType(v));
            const comma = i >= value.length - 1 ? '' : ',';
            return `<span class="kvov arrEle">${s}${comma}</span>`;
        });
        let text = '';
        if (items.length > 0) {
            text = `<span class="block-inner">${items.join('')}</span>`;
        }
        return `<span class="b">[</span><span class="ell"></span>${text}<span class="b">]</span><span class="bc">// ${items.length} items</span>`;
    }

    private renderJson(obj: any, func?: string): string {
        const t = this.parseType(obj);
        const prefix = t === VALUE_TYPE.ARRAY || t === VALUE_TYPE.OBJECT ? '<span class="e"></span>' : '';
        const innerHtml = this.renderValue(obj, t);
        const html = `<div class="formatted-json"><span class="kvov arrEle rootKvov">${prefix}${innerHtml}</span></div>`;
        
      // Top and tail with JSONP padding if necessary
        if (func) {
          return `<div class="jsonp-opener">${func} ( </div>${html}<div class="jsonp-closer">)</div>`;
        }
        return html;
    }

    private renderBar(): string {
        return `<div class="formatter-bar">
        <span class="btn-plain">Raw</span>
        <span class="btn-format active">Parsed</span>
    </div>`;
    }

    public bind(element: HTMLDivElement) {
        const plainBtn = element.querySelector('.btn-plain');
        const formatBtn = element.querySelector('.btn-format');
        const rawBody = element.querySelector('.raw-body') as HTMLDivElement;
        const formatBody = element.querySelector('.format-body') as HTMLDivElement;
        plainBtn.addEventListener('click', () => {
            plainBtn.classList.add('active');
            formatBtn.classList.remove('active');
            rawBody.style.display = 'block';
            formatBody.style.display = 'none';
        });
        formatBtn.addEventListener('click', () => {
            formatBtn.classList.add('active');
            plainBtn.classList.remove('active');
            formatBody.style.display = 'block';
            rawBody.style.display = 'none';
        });
        const hideTag = 'collapsed';
        const expand = (elements: HTMLSpanElement[]) => {
            for (const item of elements) {
                item.classList.remove(hideTag);
            }
        }
        const collapse = (elements: HTMLSpanElement[]) => {
            for (const item of elements) {
                const items = item.querySelectorAll('.kvov');
                items.forEach(it => {
                    it.classList.add(hideTag);
                });
                item.classList.add(hideTag)
            }
        };
        const toggle = (ele: HTMLSpanElement) => {
            if (ele.classList.contains(hideTag)) {
                expand([ele]);
            } else {
                collapse([ele]);
            }
        };
        formatBody.addEventListener('click', e => {
            if (e.target instanceof HTMLSpanElement && (e.target as HTMLSpanElement).className === 'e') {
                toggle(e.target.parentElement);
            }
        }, false);
    }
}


;(function($: any) {
    $.fn.jsonformatter = function(this: JQuery<HTMLDivElement>, data: any) {
        const formatter = new JSONFormatter();
        this.each(function() {
            this.innerHTML = formatter.render(data);
            formatter.bind(this);
        });
        return formatter; 
    };
})(jQuery);