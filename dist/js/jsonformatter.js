var VALUE_TYPE;
(function (VALUE_TYPE) {
    VALUE_TYPE[VALUE_TYPE["NULL"] = 0] = "NULL";
    VALUE_TYPE[VALUE_TYPE["STRING"] = 1] = "STRING";
    VALUE_TYPE[VALUE_TYPE["BOOL"] = 2] = "BOOL";
    VALUE_TYPE[VALUE_TYPE["NUMBER"] = 3] = "NUMBER";
    VALUE_TYPE[VALUE_TYPE["OBJECT"] = 4] = "OBJECT";
    VALUE_TYPE[VALUE_TYPE["ARRAY"] = 5] = "ARRAY";
    VALUE_TYPE[VALUE_TYPE["COMMENT"] = 6] = "COMMENT";
})(VALUE_TYPE || (VALUE_TYPE = {}));
var JSONFormatter = /** @class */ (function () {
    function JSONFormatter() {
    }
    JSONFormatter.prototype.render = function (data) {
        if (typeof data !== 'string') {
            return this.renderBar() + this.renderRaw(JSON.stringify(data)) + this.renderFormat(data);
        }
        return this.renderBar() + this.renderRaw(data) + this.renderFormat(data);
    };
    JSONFormatter.prototype.renderRaw = function (data) {
        return "<pre class=\"raw-body\" style=\"display:none;\">".concat(data, "</pre>");
    };
    JSONFormatter.prototype.getSpanBoth = function (innerText, className) {
        var attr = '';
        if (className) {
            attr = " class=\"".concat(className, "\"");
        }
        if (!innerText) {
            innerText = '';
        }
        return "<span".concat(attr, ">").concat(innerText, "</span>");
    };
    JSONFormatter.prototype.firstJSONCharIndex = function (s) {
        var arrayIdx = s.indexOf('[');
        var objIdx = s.indexOf('{');
        var idx = 0;
        if (arrayIdx !== -1)
            idx = arrayIdx;
        if (objIdx !== -1) {
            if (arrayIdx === -1)
                idx = objIdx;
            else
                idx = Math.min(objIdx, arrayIdx);
        }
        return idx;
    };
    JSONFormatter.prototype.removeComments = function (str) {
        var blocks = ('__' + str + '__').split('');
        var mode = {
            singleQuote: false,
            doubleQuote: false,
            regex: false,
            blockComment: false,
            lineComment: false,
            condComp: false
        };
        for (var i = 0, l = blocks.length; i < l; i++) {
            if (mode.regex) {
                if (blocks[i] === '/' && blocks[i - 1] !== '\\') {
                    mode.regex = false;
                }
                continue;
            }
            if (mode.singleQuote) {
                if (blocks[i] === "'" && blocks[i - 1] !== '\\') {
                    mode.singleQuote = false;
                }
                continue;
            }
            if (mode.doubleQuote) {
                if (blocks[i] === '"' && blocks[i - 1] !== '\\') {
                    mode.doubleQuote = false;
                }
                continue;
            }
            if (mode.blockComment) {
                if (blocks[i] === '*' && blocks[i + 1] === '/') {
                    blocks[i + 1] = '';
                    mode.blockComment = false;
                }
                blocks[i] = '';
                continue;
            }
            if (mode.lineComment) {
                if (blocks[i + 1] === '\n' || blocks[i + 1] === '\r') {
                    mode.lineComment = false;
                }
                blocks[i] = '';
                continue;
            }
            if (mode.condComp) {
                if (blocks[i - 2] === '@' && blocks[i - 1] === '*' && blocks[i] === '/') {
                    mode.condComp = false;
                }
                continue;
            }
            mode.doubleQuote = blocks[i] === '"';
            mode.singleQuote = blocks[i] === "'";
            if (blocks[i] === '/') {
                if (blocks[i + 1] === '*' && blocks[i + 2] === '@') {
                    mode.condComp = true;
                    continue;
                }
                if (blocks[i + 1] === '*') {
                    blocks[i] = '';
                    mode.blockComment = true;
                    continue;
                }
                if (blocks[i + 1] === '/') {
                    blocks[i] = '';
                    mode.lineComment = true;
                    continue;
                }
                mode.regex = true;
            }
        }
        return blocks.join('').slice(2, -2);
    };
    JSONFormatter.prototype.renderFormat = function (text) {
        if (typeof text === 'object') {
            var html_1 = this.renderJson(text);
            return "<div class=\"format-body\">".concat(html_1, "</div>");
        }
        // Try to parse as JSON
        var obj;
        var jsonpFunctionName = '';
        // Strip any leading garbage, such as a 'while(1);'
        var strippedText = text.substring(this.firstJSONCharIndex(text));
        try {
            obj = JSON.parse(strippedText);
        }
        catch (e) {
            // Not JSON; could be JSONP though.
            // Try stripping 'padding' (if any), and try parsing it again
            text = text.trim();
            // Find where the first paren is (and exit if none)
            var indexOfParen;
            if (!(indexOfParen = text.indexOf('('))) {
                return 'error';
            }
            // Get the substring up to the first "(", with any comments/whitespace stripped out
            var firstBit = this.removeComments(text.substring(0, indexOfParen)).trim();
            if (!firstBit.match(/^[a-zA-Z_$][\.\[\]'"0-9a-zA-Z_$]*$/)) {
                // The 'firstBit' is NOT a valid function identifier.
                return 'error';
            }
            // Find last parenthesis (exit if none)
            var indexOfLastParen = void 0;
            if (!(indexOfLastParen = text.lastIndexOf(')'))) {
                return 'error';
            }
            // Check that what's after the last parenthesis is just whitespace, comments, and possibly a semicolon (exit if anything else)
            var lastBit = this.removeComments(text.substring(indexOfLastParen + 1)).trim();
            if (lastBit !== "" && lastBit !== ';') {
                return 'error';
            }
            // So, it looks like a valid JS function call, but we don't know whether it's JSON inside the parentheses...
            // Check if the 'argument' is actually JSON (and record the parsed result)
            text = text.substring(indexOfParen + 1, indexOfLastParen);
            try {
                obj = JSON.parse(text);
            }
            catch (e2) {
                // Just some other text that happens to be in a function call.
                // Respond as not JSON, and exit
                return 'error';
            }
            jsonpFunctionName = firstBit;
        }
        // If still running, we now have obj, which is valid JSON.
        // Ensure it's not a number or string (technically valid JSON, but no point prettifying it)
        if (typeof obj !== 'object') {
            return 'error';
        }
        // Do formatting
        var html = this.renderJson(obj, jsonpFunctionName);
        return "<div class=\"format-body\">".concat(html, "</div>");
    };
    JSONFormatter.prototype.parseType = function (value) {
        if (typeof value === 'string') {
            return VALUE_TYPE.STRING;
        }
        if (typeof value === 'number') {
            return VALUE_TYPE.NUMBER;
        }
        if (typeof value === 'boolean') {
            return VALUE_TYPE.BOOL;
        }
        if (value === null || typeof value === 'undefined') {
            return VALUE_TYPE.NULL;
        }
        if (value instanceof Array) {
            return VALUE_TYPE.ARRAY;
        }
        return VALUE_TYPE.OBJECT;
    };
    JSONFormatter.prototype.renderValue = function (value, type) {
        if (type === VALUE_TYPE.NULL) {
            return this.getSpanBoth('null', 'nl');
        }
        if (type === VALUE_TYPE.NUMBER) {
            return this.getSpanBoth("".concat(value), 'n');
        }
        if (type === VALUE_TYPE.BOOL) {
            return this.getSpanBoth(value ? 'true' : 'false', 'bl');
        }
        if (type === VALUE_TYPE.STRING) {
            return this.getSpanBoth("\"".concat(value, "\""), 's');
        }
        if (type === VALUE_TYPE.ARRAY) {
            return this.renderArrayValue(value);
        }
        return this.renderObjectValue(value);
    };
    JSONFormatter.prototype.renderObjectValue = function (value) {
        var _this = this;
        var keys = Object.keys(value);
        var items = keys.map(function (v, i) {
            var t = _this.parseType(value[v]);
            var s = _this.renderValue(value[v], t);
            var comma = i >= keys.length - 1 ? '' : ',';
            var prefix = t === VALUE_TYPE.ARRAY || t === VALUE_TYPE.OBJECT ? '<span class="e"></span>' : '';
            return "<span class=\"kvov objProp\">".concat(prefix, "\"<span class=\"k\">").concat(v, "</span>\": ").concat(s).concat(comma, "</span>");
        });
        var text = '';
        if (items.length > 0) {
            text = "<span class=\"block-inner\">".concat(items.join(''), "</span>");
        }
        return "<span class=\"b\">{</span><span class=\"ell\"></span>".concat(text, "<span class=\"b\">}</span><span class=\"bc\">// ").concat(items.length, " items</span>");
    };
    JSONFormatter.prototype.renderArrayValue = function (value) {
        var _this = this;
        var items = value.map(function (v, i) {
            var s = _this.renderValue(v, _this.parseType(v));
            var comma = i >= value.length - 1 ? '' : ',';
            return "<span class=\"kvov arrEle\">".concat(s).concat(comma, "</span>");
        });
        var text = '';
        if (items.length > 0) {
            text = "<span class=\"block-inner\">".concat(items.join(''), "</span>");
        }
        return "<span class=\"b\">[</span><span class=\"ell\"></span>".concat(text, "<span class=\"b\">]</span><span class=\"bc\">// ").concat(items.length, " items</span>");
    };
    JSONFormatter.prototype.renderJson = function (obj, func) {
        var t = this.parseType(obj);
        var prefix = t === VALUE_TYPE.ARRAY || t === VALUE_TYPE.OBJECT ? '<span class="e"></span>' : '';
        var innerHtml = this.renderValue(obj, t);
        var html = "<div class=\"formatted-json\"><span class=\"kvov arrEle rootKvov\">".concat(prefix).concat(innerHtml, "</span></div>");
        // Top and tail with JSONP padding if necessary
        if (func) {
            return "<div class=\"jsonp-opener\">".concat(func, " ( </div>").concat(html, "<div class=\"jsonp-closer\">)</div>");
        }
        return html;
    };
    JSONFormatter.prototype.renderBar = function () {
        return "<div class=\"formatter-bar\">\n        <span class=\"btn-plain\">Raw</span>\n        <span class=\"btn-format active\">Parsed</span>\n    </div>";
    };
    JSONFormatter.prototype.bind = function (element) {
        var plainBtn = element.querySelector('.btn-plain');
        var formatBtn = element.querySelector('.btn-format');
        var rawBody = element.querySelector('.raw-body');
        var formatBody = element.querySelector('.format-body');
        plainBtn.addEventListener('click', function () {
            plainBtn.classList.add('active');
            formatBtn.classList.remove('active');
            rawBody.style.display = 'block';
            formatBody.style.display = 'none';
        });
        formatBtn.addEventListener('click', function () {
            formatBtn.classList.add('active');
            plainBtn.classList.remove('active');
            formatBody.style.display = 'block';
            rawBody.style.display = 'none';
        });
        var hideTag = 'collapsed';
        var expand = function (elements) {
            for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                var item = elements_1[_i];
                item.classList.remove(hideTag);
            }
        };
        var collapse = function (elements) {
            for (var _i = 0, elements_2 = elements; _i < elements_2.length; _i++) {
                var item = elements_2[_i];
                var items = item.querySelectorAll('.kvov');
                items.forEach(function (it) {
                    it.classList.add(hideTag);
                });
                item.classList.add(hideTag);
            }
        };
        var toggle = function (ele) {
            if (ele.classList.contains(hideTag)) {
                expand([ele]);
            }
            else {
                collapse([ele]);
            }
        };
        formatBody.addEventListener('click', function (e) {
            if (e.target instanceof HTMLSpanElement && e.target.className === 'e') {
                toggle(e.target.parentElement);
            }
        }, false);
    };
    return JSONFormatter;
}());
;
(function ($) {
    $.fn.jsonformatter = function (data) {
        var formatter = new JSONFormatter();
        this.each(function () {
            this.innerHTML = formatter.render(data);
            formatter.bind(this);
        });
        return formatter;
    };
})(jQuery);
