var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var EditorCodeComponent = /** @class */ (function () {
    function EditorCodeComponent() {
    }
    EditorCodeComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\">\n        <div class=\"input-header-block\">\n            <input type=\"text\" name=\"language\">\n            <label for=\"\">\u4EE3\u7801\u8BED\u8A00</label>\n        </div>\n        <div class=\"input-header-block\">\n            <textarea name=\"code\" rows=\"10\"></textarea>\n            <label for=\"\">\u6807\u9898</label>\n        </div>\n        <div class=\"modal-action\">\n            <div class=\"btn btn-outline-primary\">\u63D2\u5165</div>\n        </div>\n    </div>";
    };
    EditorCodeComponent.prototype.bindEvent = function () {
        var _this = this;
        EditorHelper.modalInputBind(this.element, function (data) {
            if (_this.confirmFn) {
                _this.confirmFn({
                    value: data.code,
                    language: data.language
                });
            }
        });
    };
    EditorCodeComponent.prototype.modalReady = function (module, parent, option) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
    };
    EditorCodeComponent.prototype.open = function (data, cb) {
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    };
    return EditorCodeComponent;
}());
var EditorColorComponent = /** @class */ (function () {
    function EditorColorComponent() {
        this.hY = 0;
        this.x = 0;
        this.y = 0;
        this.hsv = [0, 0, 0];
        this.disabled = false;
    }
    EditorColorComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box editor-color-modal\">\n        <div class=\"editor-color-layer\">\n            <div class=\"color-picker-sv\">\n                <div class=\"color-picker-white\"></div>\n                <div class=\"color-picker-black\"></div>\n                <i></i>\n            </div>\n            <div class=\"color-picker-h\">\n                <i></i>\n            </div>\n        </div>\n        <div class=\"input-header-block\">\n            <input type=\"text\" name=\"color\">\n            <label for=\"\">Hex</label>\n        </div>\n        <div class=\"modal-action\">\n            <div class=\"btn btn-outline-primary\">\u786E\u8BA4</div>\n        </div>\n    </div>";
    };
    EditorColorComponent.prototype.bindEvent = function () {
        var _this = this;
        this.element.on('touchstart', '.color-picker-h', function (e) {
            _this.touchHStart(e);
        }).on('touchmove', '.color-picker-h', function (e) {
            _this.touchHMove(e);
        }).on('click', '.color-picker-h', function (e) {
            _this.tapHNotTouch(e);
        }).on('touchstart', '.color-picker-sv', function (e) {
            _this.touchStart(e);
        }).on('touchmove', '.color-picker-sv', function (e) {
            _this.touchMove(e);
        }).on('touchend', '.color-picker-sv', function (e) {
            _this.touchEnd(e);
        }).on('click', '.color-picker-sv', function (e) {
            _this.tapNotTouch(e);
        });
        EditorHelper.modalInputBind(this.element, function (data) {
            if (_this.confirmFn) {
                _this.confirmFn({
                    value: data.color
                });
            }
        });
    };
    EditorColorComponent.prototype.modalReady = function (module, parent, option) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
        this.triggerHStyle();
        this.triggerSvStyle();
    };
    EditorColorComponent.prototype.open = function (data, cb) {
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    };
    EditorColorComponent.prototype.triggerSvStyle = function () {
        this.element.find('.color-picker-sv i').css({ left: this.x - 5 + 'px', top: this.y - 5 + 'px' });
    };
    EditorColorComponent.prototype.triggerHStyle = function () {
        this.element.find('.color-picker-h i').css({ top: this.hY - 3 + 'px' });
    };
    EditorColorComponent.prototype.tapNotTouch = function (e) {
        if (this.disabled) {
            return;
        }
        if ('ontouchstart' in document.documentElement) {
            return;
        }
        var clientX = e.clientX + document.body.scrollLeft;
        var clientY = e.clientY + document.body.scrollTop;
        this.touchMove({
            target: e.target,
            targetTouches: [
                { clientX: clientX, clientY: clientY }
            ]
        });
        this.triggerChange();
    };
    EditorColorComponent.prototype.tapHNotTouch = function (e) {
        if (this.disabled) {
            return;
        }
        if ('ontouchstart' in document.documentElement) {
            return;
        }
        var clientX = e.clientX + document.body.scrollLeft;
        var clientY = e.clientY + document.body.scrollTop;
        this.touchHMove({
            target: e.target,
            targetTouches: [
                { clientX: clientX, clientY: clientY }
            ]
        });
    };
    EditorColorComponent.prototype.touchStart = function (e) {
        if (this.disabled) {
            return;
        }
        this.doColor(e);
    };
    EditorColorComponent.prototype.touchMove = function (e) {
        if (this.disabled) {
            return;
        }
        this.doColor(e);
    };
    EditorColorComponent.prototype.touchEnd = function (e) {
        if (this.disabled) {
            return;
        }
        this.triggerChange();
    };
    EditorColorComponent.prototype.touchHStart = function (e) {
        if (this.disabled) {
            return;
        }
        this.doH(e);
    };
    EditorColorComponent.prototype.touchHMove = function (e) {
        if (this.disabled) {
            return;
        }
        this.doH(e);
    };
    EditorColorComponent.prototype.applyColor = function (value) {
        this.hsv = this.parse(value);
        this.hY = this.clamp(160 - this.hsv[0] * 160, 0, 160);
        this.setBackground(this.hsv[0]);
        this.x = this.clamp(this.hsv[1] * 160, 0, 160);
        this.y = this.clamp(160 - this.hsv[2] * 160, 0, 160);
        this.triggerHStyle();
        this.triggerSvStyle();
    };
    EditorColorComponent.prototype.setBackground = function (off) {
        this.hsv[0] = off;
        var b = this.HSV2RGB([off, 1, 1]);
        this.element.find('.color-picker-sv').css('background-color', 'rgb(' + b.join(',') + ')');
    };
    EditorColorComponent.prototype.triggerChange = function () {
        this.element.find('input').val('#' + this.HSV2HEX(this.hsv)).trigger('change');
    };
    EditorColorComponent.prototype.doColor = function (e) {
        var offset = e.target.getBoundingClientRect();
        this.y = this.clamp(e.targetTouches[0].clientY - offset.top, 0, offset.height);
        this.x = this.clamp(e.targetTouches[0].clientX - offset.left, 0, offset.width);
        this.hsv[1] = this.x / offset.width;
        this.hsv[2] = (offset.height - this.y) / offset.height;
        this.triggerChange();
        this.triggerSvStyle();
    };
    EditorColorComponent.prototype.doH = function (e) {
        var offset = e.target.getBoundingClientRect();
        this.hY = this.clamp(e.targetTouches[0].clientY - offset.top, 0, offset.height);
        this.setBackground(offset.height - this.hY / offset.height);
        this.triggerChange();
        this.triggerHStyle();
    };
    /**
     * 限制最大最小值
     */
    EditorColorComponent.prototype.clamp = function (val, min, max) {
        return val > max ? max : val < min ? min : val;
    };
    EditorColorComponent.prototype.parse = function (x) {
        if (typeof x === 'object') {
            return x;
        }
        var rgb = /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i.exec(x);
        var hsv = /\s*hsv\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/i.exec(x);
        var hex = x[0] === '#' && x.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
        if (hex) {
            return this.HEX2HSV(x.slice(1));
        }
        else if (hsv) {
            return this._2HSV_pri([+hsv[1], +hsv[2], +hsv[3]]);
        }
        else if (rgb) {
            return this.RGB2HSV([+rgb[1], +rgb[2], +rgb[3]]);
        }
        return [0, 1, 1]; // default is red
    };
    // [h, s, v] ... 0 <= h, s, v <= 1
    EditorColorComponent.prototype.HSV2RGB = function (a) {
        var h = +a[0];
        var s = +a[1];
        var v = +a[2];
        var r = 0;
        var g = 0;
        var b = 0;
        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);
        i = i || 0;
        q = q || 0;
        t = t || 0;
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        return [this.round(r * 255), this.round(g * 255), this.round(b * 255)];
    };
    EditorColorComponent.prototype.HSV2HEX = function (a) {
        return this.RGB2HEX(this.HSV2RGB(a));
    };
    // [r, g, b] ... 0 <= r, g, b <= 255
    EditorColorComponent.prototype.RGB2HSV = function (a) {
        var r = +a[0];
        var g = +a[1];
        var b = +a[2];
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var d = max - min;
        var h = 0;
        var s = (max === 0 ? 0 : d / max);
        var v = max / 255;
        switch (max) {
            case min:
                h = 0;
                break;
            case r:
                h = (g - b) + d * (g < b ? 6 : 0);
                h /= 6 * d;
                break;
            case g:
                h = (b - r) + d * 2;
                h /= 6 * d;
                break;
            case b:
                h = (r - g) + d * 4;
                h /= 6 * d;
                break;
        }
        return [h, s, v];
    };
    EditorColorComponent.prototype.RGB2HEX = function (a) {
        // tslint:disable-next-line: no-bitwise
        var s = +a[2] | (+a[1] << 8) | (+a[0] << 16);
        s = '000000' + s.toString(16);
        return s.slice(-6);
    };
    // rrggbb or rgb
    EditorColorComponent.prototype.HEX2HSV = function (s) {
        return this.RGB2HSV(this.HEX2RGB(s));
    };
    EditorColorComponent.prototype.HEX2RGB = function (s) {
        if (s.length === 3) {
            s = s.replace(/./g, '$&$&');
        }
        return [this.num(s[0] + s[1], 16), this.num(s[2] + s[3], 16), this.num(s[4] + s[5], 16)];
    };
    // convert range from `0` to `360` and `0` to `100` in color into range from `0` to `1`
    EditorColorComponent.prototype._2HSV_pri = function (a) {
        return [+a[0] / 360, +a[1] / 100, +a[2] / 100];
    };
    // convert range from `0` to `1` into `0` to `360` and `0` to `100` in color
    EditorColorComponent.prototype._2HSV_pub = function (a) {
        return [this.round(+a[0] * 360), this.round(+a[1] * 100), this.round(+a[2] * 100)];
    };
    // convert range from `0` to `255` in color into range from `0` to `1`
    EditorColorComponent.prototype._2RGB_pri = function (a) {
        return [+a[0] / 255, +a[1] / 255, +a[2] / 255];
    };
    EditorColorComponent.prototype.num = function (i, j) {
        if (j === void 0) { j = 10; }
        return parseInt(i, j || 10);
    };
    EditorColorComponent.prototype.round = function (i) {
        return Math.round(i);
    };
    return EditorColorComponent;
}());
var EditorFontItems = [
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
];
var EditorDropdownComponent = /** @class */ (function () {
    function EditorDropdownComponent(isNodeTag) {
        if (isNodeTag === void 0) { isNodeTag = false; }
        this.isNodeTag = isNodeTag;
        this.items = [];
    }
    EditorDropdownComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box editor-dropdown-modal\"></div>";
    };
    EditorDropdownComponent.prototype.renderItems = function (isTag) {
        if (isTag === void 0) { isTag = false; }
        var html = '';
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            html += this.renderItem(item, isTag ? item.value : 'li');
        }
        var tag = isTag ? 'div' : 'ul';
        return "<".concat(tag, " class=\"option-bar\">").concat(html, "</").concat(tag, ">");
    };
    EditorDropdownComponent.prototype.renderItem = function (item, tag) {
        if (tag === void 0) { tag = 'li'; }
        return "<".concat(tag, " class=\"option-item\" style=\"").concat(EditorHelper.nodeStyle(item.style), "\">").concat(item.name, "</").concat(tag, ">");
    };
    EditorDropdownComponent.prototype.modalReady = function (module, parent, option) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
        if (module.name === 'font') {
            this.items = EditorFontItems.map(function (i) {
                i.style = {
                    'font-family': i.value
                };
                return i;
            });
        }
        else if (module.name === 'fontsize') {
            var items = [];
            var last = 7;
            var step = 1;
            for (var i = 0; i < 16; i++) {
                if (i > 0 && i % 3 === 0) {
                    step *= 2;
                }
                var value = last + step;
                items.push({
                    name: value,
                    value: value,
                });
                last = value;
            }
            this.items = items;
        }
        else if (module.name === 'head') {
            var items = [];
            for (var i = 1; i < 7; i++) {
                var value = "h".concat(i);
                items.push({
                    name: value,
                    value: value,
                });
            }
            this.items = items;
        }
        this.element.html(this.renderItems(this.isNodeTag));
    };
    EditorDropdownComponent.prototype.bindEvent = function () {
        var that = this;
        this.element.on('click', '.option-item', function () {
            var $this = $(this);
            $this.addClass('selected').siblings().removeClass('selected');
            that.tapConfirm(that.items[$this.index()]);
        });
    };
    EditorDropdownComponent.prototype.open = function (data, cb, position) {
        this.element.css(position ? { left: position.x + 'px', top: position.y + 'px' } : {});
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    };
    EditorDropdownComponent.prototype.tapConfirm = function (item) {
        if (this.confirmFn) {
            this.confirmFn({
                value: item.value
            });
        }
    };
    return EditorDropdownComponent;
}());
var EditorFileComponent = /** @class */ (function () {
    function EditorFileComponent() {
    }
    EditorFileComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\">\n        <label class=\"drag-input\" for=\"editor-modal-file\">\n            \u62D6\u653E\u6587\u4EF6\n            <p>(\u6216\u70B9\u51FB)</p>\n            <input type=\"file\" id=\"editor-modal-file\">\n        </label>\n        <div class=\"loading-ring\">\n            <span></span>\n            <span></span>\n            <span></span>\n            <span></span>\n            <span></span>\n        </div>\n    </div>";
    };
    EditorFileComponent.prototype.bindEvent = function () {
        EditorHelper.modalFileUpload(this.element, this.uploadFiles.bind(this));
    };
    EditorFileComponent.prototype.modalReady = function (module, parent, option) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
        this.option = option;
    };
    EditorFileComponent.prototype.open = function (data, cb) {
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    };
    EditorFileComponent.prototype.uploadFiles = function (files) {
        var _this = this;
        if (this.element.hasClass('editor-modal-loading')) {
            return;
        }
        if (files.length < 1) {
            return;
        }
        this.element.addClass('editor-modal-loading');
        this.option.upload(files[0], 'file', function (res) {
            _this.element.removeClass('editor-modal-loading');
            _this.tapConfirm(res.url, res.title, res.size);
        }, function () {
            _this.element.removeClass('editor-modal-loading');
        });
    };
    EditorFileComponent.prototype.tapConfirm = function (value, title, size) {
        if (this.confirmFn) {
            this.confirmFn({
                value: value,
                title: title,
                size: size
            });
        }
    };
    return EditorFileComponent;
}());
var EditorImageComponent = /** @class */ (function () {
    function EditorImageComponent() {
    }
    EditorImageComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\">\n        <div class=\"tab-bar\">\n            <a class=\"item\" title=\"\u4E0A\u4F20\">\n                <i class=\"fa fa-upload\"></i>\n            </a>\n            <a class=\"item active\" title=\"\u94FE\u63A5\">\n                <i class=\"fa fa-link\"></i>\n            </a>\n            <a class=\"item\" title=\"\u5728\u7EBF\u56FE\u5E93\">\n                <i class=\"fa fa-folder-open\"></i>\n            </a>\n        </div>\n        <div class=\"tab-body-item\">\n            <label class=\"drag-input\" for=\"editor-modal-image\">\n                \u62D6\u653E\u6587\u4EF6\n                <p>(\u6216\u70B9\u51FB)</p>\n                <input type=\"file\" id=\"editor-modal-image\" accept=\"image/*\">\n            </label>\n        </div>\n        <div class=\"tab-body-item active\">\n            <div class=\"input-header-block\">\n                <input type=\"text\" name=\"url\">\n                <label for=\"\">\u94FE\u63A5</label>\n            </div>\n            <div class=\"modal-action\">\n                <div class=\"btn btn-outline-primary\">\u63D2\u5165</div>\n            </div>\n        </div>\n        <div class=\"loading-ring\">\n            <span></span>\n            <span></span>\n            <span></span>\n            <span></span>\n            <span></span>\n        </div>\n    </div>";
    };
    EditorImageComponent.prototype.bindEvent = function () {
        var _this = this;
        var that = this;
        this.element.on('click', '.tab-bar .item', function () {
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            that.element.find('.tab-body-item').each(function (i) {
                $(this).toggleClass('active', $this.index() === i);
            });
        });
        EditorHelper.modalFileUpload(this.element, this.uploadFiles.bind(this));
        EditorHelper.modalInputBind(this.element, function (data) {
            _this.output({
                value: data.url
            });
        });
    };
    EditorImageComponent.prototype.modalReady = function (module, parent, option) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
        this.option = option;
    };
    EditorImageComponent.prototype.open = function (data, cb) {
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    };
    EditorImageComponent.prototype.uploadFiles = function (files) {
        var _this = this;
        if (this.element.hasClass('editor-modal-loading')) {
            return;
        }
        if (files.length < 1) {
            return;
        }
        this.element.addClass('editor-modal-loading');
        this.option.upload(files[0], 'image', function (res) {
            _this.element.removeClass('editor-modal-loading');
            _this.output({
                value: res.url,
                title: res.title
            });
        }, function () {
            _this.element.removeClass('editor-modal-loading');
        });
    };
    EditorImageComponent.prototype.output = function (data) {
        if (this.confirmFn) {
            this.confirmFn(data);
        }
    };
    return EditorImageComponent;
}());
var EditorLinkComponent = /** @class */ (function () {
    function EditorLinkComponent() {
    }
    EditorLinkComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\">\n        <div class=\"input-header-block\">\n            <input type=\"url\" name=\"url\">\n            <label for=\"\">\u7F51\u5740</label>\n        </div>\n        <div class=\"input-header-block\">\n            <input type=\"text\" name=\"title\">\n            <label for=\"\">\u6807\u9898</label>\n        </div>\n        <div class=\"input-flex-line\">\n            <i class=\"fa check-input fa-square\" name=\"is_blank\"></i>\n            \u5728\u65B0\u6807\u7B7E\u9875\u6253\u5F00\n        </div>\n        <div class=\"modal-action\">\n            <div class=\"btn btn-outline-primary\">\u63D2\u5165</div>\n        </div>\n    </div>";
    };
    EditorLinkComponent.prototype.bindEvent = function () {
        var _this = this;
        EditorHelper.modalInputBind(this.element, function (data) {
            if (_this.confirmFn) {
                _this.confirmFn({
                    value: data.url,
                    title: data.title,
                    target: data.is_blank
                });
            }
        });
    };
    EditorLinkComponent.prototype.modalReady = function (module, parent, option) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
    };
    EditorLinkComponent.prototype.open = function (data, cb) {
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    };
    return EditorLinkComponent;
}());
var EditorResizerComponent = /** @class */ (function () {
    function EditorResizerComponent() {
        this.toolType = 0;
        this.mouseMoveListeners = {
            move: undefined,
            finish: undefined,
        };
    }
    EditorResizerComponent.prototype.render = function () {
        return "<div class=\"editor-resizer-modal\">\n        <div class=\"selection-container\">\n            <div class=\"rotate-icon\">\n                <i class=\"iconfont icon-refresh\"></i>\n            </div>\n            <div class=\"eight-corner\">\n                <div class=\"cursor lt\"></div>\n                <div class=\"cursor t\"></div>\n                <div class=\"cursor rt\"></div>\n                <div class=\"cursor r\"></div>\n                <div class=\"cursor rb\"></div>\n                <div class=\"cursor b\"></div>\n                <div class=\"cursor lb\"></div>\n                <div class=\"cursor l\"></div>\n            </div>\n        </div>\n        <div class=\"horizontal-bar\"></div>\n        <div class=\"vertical-bar\"></div>\n    </div>";
    };
    EditorResizerComponent.prototype.triggerBoxStyle = function () {
        this.element.find('.selection-container').css(this.toolType !== 1 ? {
            display: 'none',
        } : {
            display: 'block',
            left: this.rectBound.x + 'px',
            top: this.rectBound.y + 'px',
            width: this.rectBound.width + 'px',
            height: this.rectBound.height + 'px',
        });
    };
    EditorResizerComponent.prototype.triggerHorizontalStyle = function () {
        this.element.find('.horizontal-bar').css(this.toolType !== 2 ? {
            display: 'none',
        } : {
            display: 'block',
            left: this.rectBound.x + 'px',
            top: this.rectBound.y + 'px',
            height: this.rectBound.height + 'px',
        });
    };
    EditorResizerComponent.prototype.triggerVerticalStyle = function () {
        this.element.find('.vertical-bar').css(this.toolType !== 3 ? {
            display: 'none',
        } : {
            display: 'block',
            left: this.rectBound.x + 'px',
            top: this.rectBound.y + 'px',
            width: this.rectBound.width + 'px',
        });
    };
    EditorResizerComponent.prototype.bindEvent = function () {
        var that = this;
        var fnMap = [this.onMoveLt, this.onMoveT, this.onMoveRt, this.onMoveR, this.onMoveRb, this.onMoveB, this.onMoveLb, this.onMoveL];
        this.element.on('mousedown', '.eight-corner .cursor', function (e) {
            var fn = fnMap[$(this).index()];
            fn && fn.call(that, e);
        });
        $(document).on('mousemove', this.docMouseMove.bind(this))
            .on('mouseup', this.docMouseUp.bind(this));
    };
    EditorResizerComponent.prototype.docMouseMove = function (e) {
        if (this.mouseMoveListeners.move) {
            this.mouseMoveListeners.move({ x: e.clientX, y: e.clientY });
        }
    };
    EditorResizerComponent.prototype.docMouseUp = function (e) {
        if (this.mouseMoveListeners.finish) {
            this.mouseMoveListeners.finish({ x: e.clientX, y: e.clientY });
        }
    };
    EditorResizerComponent.prototype.ready = function (parent) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
    };
    EditorResizerComponent.prototype.openResize = function (bound, cb) {
        this.rectBound = bound;
        this.toggleType(1);
        this.updatedHandler = cb;
    };
    EditorResizerComponent.prototype.openHorizontalResize = function (bound, cb) {
        this.rectBound = bound;
        this.toggleType(2);
        this.updatedHandler = cb;
        this.mouseMove(undefined, function (b, x, y) {
            return __assign(__assign({}, b), { x: b.x + x });
        });
    };
    EditorResizerComponent.prototype.openVerticalResize = function (bound, cb) {
        this.rectBound = bound;
        this.toggleType(3);
        this.updatedHandler = cb;
        this.mouseMove(undefined, function (b, x, y) {
            return __assign(__assign({}, b), { y: b.y + y });
        });
    };
    EditorResizerComponent.prototype.close = function () {
        this.toggleType(0);
    };
    EditorResizerComponent.prototype.toggleType = function (i) {
        if (i === void 0) { i = 0; }
        if (this.toolType === i) {
            return;
        }
        var old = this.toolType;
        this.toolType = i;
        this.updateStyle(old);
        this.updateStyle(i);
    };
    EditorResizerComponent.prototype.updateStyle = function (i) {
        if (i === void 0) { i = this.toolType; }
        if (i === 1) {
            this.triggerBoxStyle();
        }
        else if (i === 2) {
            this.triggerHorizontalStyle();
        }
        else if (i === 3) {
            this.triggerVerticalStyle();
        }
    };
    EditorResizerComponent.prototype.onMoveLt = function (e) {
        this.mouseMove(e, function (b, x, y) {
            return {
                x: b.x + x,
                y: b.y + y,
                width: b.width - x,
                height: b.height - y,
            };
        });
    };
    EditorResizerComponent.prototype.onMoveT = function (e) {
        this.mouseMove(e, function (b, x, y) {
            return __assign(__assign({}, b), { y: b.y + y, height: b.height - y });
        });
    };
    EditorResizerComponent.prototype.onMoveRt = function (e) {
        this.mouseMove(e, function (b, x, y) {
            return __assign(__assign({}, b), { y: b.y + y, height: b.height - y, width: b.width + x });
        });
    };
    EditorResizerComponent.prototype.onMoveR = function (e) {
        this.mouseMove(e, function (b, x, y) {
            return __assign(__assign({}, b), { width: b.width + x });
        });
    };
    EditorResizerComponent.prototype.onMoveRb = function (e) {
        this.mouseMove(e, function (b, x, y) {
            return __assign(__assign({}, b), { height: b.height + y, width: b.width + x });
        });
    };
    EditorResizerComponent.prototype.onMoveB = function (e) {
        this.mouseMove(e, function (b, x, y) {
            return __assign(__assign({}, b), { height: b.height + y });
        });
    };
    EditorResizerComponent.prototype.onMoveLb = function (e) {
        this.mouseMove(e, function (b, x, y) {
            return __assign(__assign({}, b), { x: b.x + x, width: b.width - x, height: b.height + y });
        });
    };
    EditorResizerComponent.prototype.onMoveL = function (e) {
        this.mouseMove(e, function (b, x, y) {
            return __assign(__assign({}, b), { x: b.x + x, width: b.width - x });
        });
    };
    EditorResizerComponent.prototype.mouseMove = function (start, move) {
        var _this = this;
        if (this.toolType < 1) {
            return;
        }
        var last;
        if (start) {
            start.stopPropagation();
            last = { x: start.clientX, y: start.clientY };
        }
        this.onMouseMove(function (p) {
            if (!last) {
                last = { x: p.x, y: p.y };
                return;
            }
            var offsetX = p.x - last.x;
            var offsetY = p.y - last.y;
            _this.rectBound = move(_this.rectBound, offsetX, offsetY);
            _this.updateStyle();
            last = p;
        }, function (_) {
            var toolType = _this.toolType;
            _this.toggleType(0);
            if (!_this.updatedHandler) {
                return;
            }
            if (toolType === 1) {
                _this.updatedHandler(__assign({ type: EditorBlockType.NodeResize }, _this.rectBound));
                return;
            }
            else if (toolType === 2 || toolType === 3) {
                _this.updatedHandler(__assign({ type: EditorBlockType.NodeMove }, _this.rectBound));
            }
        });
    };
    EditorResizerComponent.prototype.onMouseMove = function (move, finish) {
        var _this = this;
        this.mouseMoveListeners = {
            move: move,
            finish: !move && !finish ? undefined : function (p) {
                _this.mouseMoveListeners = { move: undefined, finish: undefined };
                finish && finish(p);
            },
        };
    };
    return EditorResizerComponent;
}());
var EditorSizeComponent = /** @class */ (function () {
    function EditorSizeComponent() {
    }
    EditorSizeComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\">\n        <div class=\"tab-bar\">\n            <a class=\"item\">\n                <i class=\"fa fa-arrow-left\"></i>\n            </a>\n        </div>\n        <div class=\"input-flex-group\">\n            <div class=\"input-header-block\">\n                <input type=\"text\" name=\"width\">\n                <label for=\"\">\u5BBD</label>\n            </div>\n            <div class=\"input-header-block\">\n                <input type=\"text\" name=\"height\">\n                <label for=\"\">\u9AD8</label>\n            </div>\n        </div>\n        <div class=\"modal-action\">\n            <div class=\"btn btn-outline-primary\">\u66F4\u65B0</div>\n        </div>\n    </div>";
    };
    EditorSizeComponent.prototype.bindEvent = function () {
        var _this = this;
        EditorHelper.modalInputBind(this.element, function (data) {
            if (_this.confirmFn) {
                _this.confirmFn({
                    height: data.height,
                    width: data.width
                });
            }
        });
    };
    EditorSizeComponent.prototype.modalReady = function (module, parent, option) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
    };
    EditorSizeComponent.prototype.open = function (data, cb) {
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    };
    return EditorSizeComponent;
}());
var EditorTableComponent = /** @class */ (function () {
    function EditorTableComponent() {
    }
    EditorTableComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box editor-table-modal\"><div class=\"table-grid\"></div></div>";
    };
    EditorTableComponent.prototype.renderTableRow = function (column) {
        if (column === void 0) { column = 10; }
        var row = '';
        for (var j = 0; j < column; j++) {
            row += "<span class=\"table-cell\"></span>";
        }
        return "<div class=\"table-row\">".concat(row, "</div>");
    };
    EditorTableComponent.prototype.renderTable = function (row, column) {
        if (column === void 0) { column = 10; }
        var html = '';
        for (var i = 0; i < row; i++) {
            html += this.renderTableRow(column);
        }
        this.element.find('.table-grid').html(html);
    };
    EditorTableComponent.prototype.bindEvent = function () {
        var that = this;
        this.element.on('mouseover', '.table-cell', function () {
            var $this = $(this);
            var i = $this.index();
            var parent = $this.parent();
            var j = parent.index();
            var box = parent[0].parentNode;
            for (var r = 0; r < box.children.length; r++) {
                var re = box.children[r];
                for (var c = 0; c < re.children.length; c++) {
                    var ce = re.children[c];
                    $(ce).toggleClass('active', r <= j && c <= i);
                }
            }
            if (j < box.children.length - 1 || j >= 9) {
                return;
            }
            $(box).append(that.renderTableRow());
        }).on('click', '.table-cell', function () {
            var $this = $(this);
            if (that.confirmFn) {
                that.confirmFn({
                    row: $this.parent().index() + 1,
                    column: $this.index() + 1
                });
            }
        });
    };
    EditorTableComponent.prototype.modalReady = function (module, parent, option) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
    };
    EditorTableComponent.prototype.open = function (data, cb) {
        this.renderTable(2, 10);
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    };
    return EditorTableComponent;
}());
var EditorTextComponent = /** @class */ (function () {
    function EditorTextComponent(label) {
        if (label === void 0) { label = '文字'; }
        this.label = label;
    }
    EditorTextComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\">\n        <div class=\"tab-bar\">\n            <a class=\"item\">\n                <i class=\"fa fa-arrow-left\"></i>\n            </a>\n        </div>\n        <div class=\"input-header-block\">\n            <input type=\"text\" name=\"value\">\n            <label for=\"\">".concat(this.label, "</label>\n        </div>\n        <div class=\"modal-action\">\n            <div class=\"btn btn-outline-primary\">\u66F4\u65B0</div>\n        </div>\n    </div>");
    };
    EditorTextComponent.prototype.bindEvent = function () {
        var _this = this;
        EditorHelper.modalInputBind(this.element, function (data) {
            if (_this.confirmFn) {
                _this.confirmFn({
                    value: data.value,
                });
            }
        });
    };
    EditorTextComponent.prototype.modalReady = function (module, parent, option) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
    };
    EditorTextComponent.prototype.open = function (data, cb) {
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    };
    return EditorTextComponent;
}());
var EditorVideoComponent = /** @class */ (function () {
    function EditorVideoComponent() {
    }
    EditorVideoComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\">\n        <div class=\"tab-bar\">\n            <a class=\"item active\" title=\"\u94FE\u63A5\">\n                <i class=\"fa fa-link\"></i>\n            </a>\n            <a class=\"item\" title=\"\u4EE3\u7801\">\n                <i class=\"fa fa-code\"></i>\n            </a>\n            <a class=\"item\" title=\"\u4E0A\u4F20\">\n                <i class=\"fa fa-upload\"></i>\n            </a>\n        </div>\n        <div class=\"tab-body-item active\">\n            <div class=\"input-header-block\">\n                <input type=\"text\" name=\"url\">\n                <label for=\"\">\u94FE\u63A5</label>\n            </div>\n            <div class=\"input-flex-line\">\n                <i class=\"fa fa-square check-input\" name=\"auto_play\"></i>\n                \u81EA\u52A8\u64AD\u653E\n            </div>\n            <div class=\"modal-action\">\n                <div class=\"btn btn-outline-primary\">\u63D2\u5165</div>\n            </div>\n        </div>\n        <div class=\"tab-body-item\">\n            <div class=\"input-header-block\">\n                <textarea name=\"code\" rows=\"4\"></textarea>\n                <label for=\"\">\u4EE3\u7801</label>\n            </div>\n            <div class=\"modal-action\">\n                <div class=\"btn btn-outline-primary\">\u63D2\u5165</div>\n            </div>\n        </div>\n        <div class=\"tab-body-item\">\n            <label class=\"drag-input\" for=\"editor-modal-video\">\n                \u62D6\u653E\u6587\u4EF6\n                <p>(\u6216\u70B9\u51FB)</p>\n                <input type=\"file\" id=\"editor-modal-video\" accept=\"video/*\">\n            </label>\n        </div>\n\n        <div class=\"loading-ring\">\n            <span></span>\n            <span></span>\n            <span></span>\n            <span></span>\n            <span></span>\n        </div>\n    </div>";
    };
    EditorVideoComponent.prototype.bindEvent = function () {
        var _this = this;
        var that = this;
        this.element.on('click', '.tab-bar .item', function () {
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            that.element.find('.tab-body-item').each(function (i) {
                $(this).toggleClass('active', $this.index() === i);
            });
        });
        EditorHelper.modalFileUpload(this.element, this.uploadFiles.bind(this));
        EditorHelper.modalInputBind(this.element, function (data) {
            // this.output({
            //     value: data.url
            // });
            if (!_this.confirmFn) {
                return;
            }
            var index = _this.element.find('.tab-bar .active').index();
            _this.confirmFn(index === 2 ? { code: data.code } : { value: data.url, autoplay: data.auto_play });
        });
    };
    EditorVideoComponent.prototype.modalReady = function (module, parent, option) {
        if (!this.element) {
            this.element = $(this.render());
        }
        parent.append(this.element);
        this.bindEvent();
        this.option = option;
    };
    EditorVideoComponent.prototype.open = function (data, cb) {
        this.element.addClass('modal-visible');
        this.confirmFn = cb;
    };
    EditorVideoComponent.prototype.uploadFile = function (e) {
        var files = e.target.files;
        this.uploadFiles(files);
    };
    EditorVideoComponent.prototype.uploadFiles = function (files) {
        var _this = this;
        if (this.element.hasClass('editor-modal-loading')) {
            return;
        }
        if (files.length < 1) {
            return;
        }
        this.element.addClass('editor-modal-loading');
        this.option.upload(files[0], 'video', function (res) {
            _this.element.removeClass('editor-modal-loading');
            if (!_this.confirmFn) {
                return;
            }
            _this.confirmFn({ value: res.url });
        }, function () {
            _this.element.removeClass('editor-modal-loading');
        });
    };
    return EditorVideoComponent;
}());
var CodeElement = /** @class */ (function () {
    function CodeElement(element, container) {
        this.element = element;
        this.container = container;
        this.isComposition = false;
        this.init();
        this.bindEvent();
    }
    Object.defineProperty(CodeElement.prototype, "selection", {
        get: function () {
            var sel = window.getSelection();
            var range = sel.getRangeAt(0);
            return {
                start: range.startOffset,
                end: range.endOffset,
                range: range.cloneRange()
            };
        },
        set: function (v) {
            var sel = window.getSelection();
            var range;
            if (v.range) {
                range = v.range;
            }
            else {
                range = sel.getRangeAt(0);
                range.deleteContents();
                range = range.cloneRange();
                range.setStart(this.bodyPanel, v.start);
                range.setEnd(this.bodyPanel, v.end);
            }
            sel.removeAllRanges();
            sel.addRange(range);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CodeElement.prototype, "selectedValue", {
        get: function () {
            return '';
        },
        set: function (v) {
            var range = this.selection.range;
            this.addTextExecute(range, { value: v });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CodeElement.prototype, "value", {
        get: function () {
            var items = [];
            this.eachLine(function (dt) {
                items.push(dt.textContent.replace('\n', ''));
            });
            return items.join('\n');
        },
        set: function (v) {
            var _this = this;
            this.bodyPanel.innerHTML = '';
            v.split('\n').forEach(function (line) {
                _this.addLine(line);
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CodeElement.prototype, "length", {
        get: function () {
            return this.value.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CodeElement.prototype, "wordLength", {
        get: function () {
            return EditorHelper.wordLength(this.value);
        },
        enumerable: false,
        configurable: true
    });
    CodeElement.prototype.selectAll = function () {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(this.bodyPanel);
        sel.removeAllRanges();
        sel.addRange(range);
    };
    CodeElement.prototype.insert = function (block, range) {
        if (!range) {
            range = this.selection;
        }
        var type = block.type === EditorBlockType.AddRaw ? EditorBlockType.AddText : block.type;
        var func = this[type + 'Execute'];
        if (typeof func === 'function') {
            func.call(this, range.range, block);
            return;
        }
        throw new Error("insert type error:[".concat(block.type, "]"));
    };
    CodeElement.prototype.focus = function () {
        this.bodyPanel.focus({ preventScroll: true });
    };
    CodeElement.prototype.blur = function () {
        return this.bodyPanel.blur();
    };
    CodeElement.prototype.destroy = function () {
    };
    CodeElement.prototype.init = function () {
        this.linePanel = document.createElement('div');
        this.linePanel.className = 'editor-line-numbers';
        this.bodyPanel = document.createElement('div');
        this.bodyPanel.className = 'editor-content';
        this.bodyPanel.contentEditable = 'true';
        this.bodyPanel.spellcheck = false;
        this.element.appendChild(this.linePanel);
        this.element.appendChild(this.bodyPanel);
        this.addLine();
    };
    CodeElement.prototype.bindResize = function () {
        var _this = this;
        // let lastWidth = '';
        var lastHeight = 0;
        var resizeObserver = new ResizeObserver(function (entries) {
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var item = entries_1[_i];
                if (item.contentRect.height === lastHeight) {
                    continue;
                }
                if (lastHeight === 0) {
                    _this.updateLineNoStyle();
                }
                lastHeight = item.contentRect.height;
            }
        });
        resizeObserver.observe(this.element);
        this.container.on(EDITOR_EVENT_EDITOR_DESTORY, function () {
            resizeObserver.disconnect();
        });
    };
    CodeElement.prototype.bindEvent = function () {
        var _this = this;
        this.bindResize();
        this.bodyPanel.addEventListener('keydown', function (e) {
            _this.container.saveSelection();
            _this.container.emit(EDITOR_EVENT_INPUT_KEYDOWN, e);
        });
        this.bodyPanel.addEventListener('keyup', function (e) {
            if (_this.isComposition) {
                return;
            }
            _this.selectRangeLine(_this.selection.range);
            _this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
            if (e.key === 'Backspace') {
                _this.updateLineCount();
            }
        });
        this.element.addEventListener('mouseup', function () {
            _this.container.saveSelection();
            _this.selectRangeLine(_this.selection.range);
        });
        this.element.addEventListener('paste', function (e) {
            e.preventDefault();
            _this.paste((e.clipboardData || window.clipboardData));
        });
        this.bodyPanel.addEventListener('compositionstart', function () {
            _this.isComposition = true;
            // this.container.saveSelection();
        });
        this.bodyPanel.addEventListener('compositionend', function () {
            _this.isComposition = false;
            _this.container.saveSelection();
            _this.container.emit(EDITOR_EVENT_SELECTION_CHANGE);
            _this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
    };
    CodeElement.prototype.paste = function (data) {
        var value = data.getData('text');
        if (!value) {
            return;
        }
        this.insert({ type: EditorBlockType.AddText, value: value });
    };
    //#region 外部调用的方法
    CodeElement.prototype.addTextExecute = function (range, block) {
        var _a = this.getRangeLineNo(range), begin = _a[0], end = _a[1];
        var items = block.value.split('\n');
        items[0] = this.getLinePrevious(range) + items[0];
        items[items.length - 1] += this.getLineNext(range);
        this.insertLines.apply(this, __spreadArray([begin, end], items, false));
    };
    CodeElement.prototype.addLineBreakExecute = function (range) {
        var _a = this.getRangeLineNo(range), begin = _a[0], end = _a[1];
        this.insertLines(begin, end, this.getLinePrevious(range), this.getLineNext(range));
    };
    CodeElement.prototype.indentExecute = function (range) {
        this.replaceSelectLine(function (s) {
            return '    ' + s;
        }, range);
    };
    CodeElement.prototype.outdentExecute = function (range) {
        this.replaceSelectLine(function (s) {
            if (s.length < 1) {
                return s;
            }
            switch (s.charCodeAt(0)) {
                case 9: // \t
                    return s.substring(1);
                case 32: // 空格
                    return s.replace(/^\s{1,4}/, '');
                default:
                    return s;
            }
        }, range);
    };
    //#endregion
    CodeElement.prototype.replaceSelectLine = function (cb, range) {
        var _a = this.getRangeLineNo(range), begin = _a[0], end = _a[1];
        for (var i = begin; i <= end; i++) {
            var ele = this.bodyPanel.children[i - 1];
            this.renderLine(ele, cb(ele.textContent));
        }
    };
    CodeElement.prototype.getLinePrevious = function (range) {
        var items = [];
        this.eachLinePrevious(range, function (line) {
            items.push(line);
        });
        return items.reverse().join('');
    };
    CodeElement.prototype.getLineNext = function (range) {
        var items = [];
        this.eachLineNext(range, function (line) {
            items.push(line);
        });
        return items.join('');
    };
    CodeElement.prototype.eachLinePrevious = function (range, cb) {
        if (range.startContainer === this.bodyPanel) {
            return;
        }
        if (range.startContainer instanceof HTMLDivElement) {
            return;
        }
        if (range.startOffset > 0) {
            var text = range.startContainer;
            cb(text.textContent.substring(0, range.startOffset));
        }
        var current = range.startContainer;
        while (true) {
            if (current.previousSibling) {
                current = current.previousSibling;
                cb(current.textContent);
                continue;
            }
            if (current.parentNode instanceof HTMLDivElement) {
                break;
            }
            current = current.parentNode;
        }
    };
    CodeElement.prototype.eachLineNext = function (range, cb) {
        if (range.endContainer === this.bodyPanel) {
            return;
        }
        if (range.endContainer instanceof HTMLDivElement) {
            return;
        }
        var text = range.endContainer;
        cb(range.endOffset > 0 ? text.textContent.substring(range.endOffset) : text.textContent);
        var current = range.endContainer;
        while (true) {
            if (current.nextSibling) {
                if (current.nextSibling instanceof HTMLBRElement) {
                    break;
                }
                current = current.nextSibling;
                cb(current.textContent);
                continue;
            }
            if (current.parentNode instanceof HTMLDivElement) {
                break;
            }
            current = current.parentNode;
        }
    };
    CodeElement.prototype.getRangeLineNo = function (range) {
        var begin = this.findLine(range.startContainer);
        var beginNo = this.getLineNo(begin);
        var endNo = beginNo;
        if (range.startContainer !== range.endContainer) {
            var end = this.findLine(range.endContainer);
            if (begin !== end) {
                endNo = this.getLineNo(end);
            }
        }
        return [Math.max(beginNo, 1), Math.max(endNo, 1)];
    };
    /**
     *
     * @param node
     * @returns
     */
    CodeElement.prototype.getLineNo = function (node) {
        if (!node || node === this.element) {
            return 1;
        }
        for (var i = 0; i < this.bodyPanel.children.length; i++) {
            var element = this.bodyPanel.children[i];
            if (element === node) {
                return i + 1;
            }
        }
        return -1;
    };
    CodeElement.prototype.findLine = function (node) {
        while (!(node instanceof HTMLDivElement)) {
            if (node === this.bodyPanel) {
                return undefined;
            }
            node = node.parentNode;
        }
        return node;
    };
    /**
     *
     * @param index
     */
    CodeElement.prototype.removeLine = function (index) {
        var i = index - 1;
        if (this.bodyPanel.children.length > i) {
            this.bodyPanel.removeChild(this.bodyPanel.children[i]);
        }
        if (this.linePanel.children.length > i) {
            this.linePanel.removeChild(this.linePanel.children[i]);
        }
    };
    CodeElement.prototype.insertLines = function (begin, end) {
        var items = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            items[_i - 2] = arguments[_i];
        }
        var max = this.bodyPanel.children.length;
        var lineNo = 0;
        for (var i = 0; i < items.length; i++) {
            lineNo = begin + i;
            if (max >= lineNo && lineNo <= end) {
                this.updateLine(lineNo, items[i]);
                continue;
            }
            if (lineNo > max) {
                this.addLine(items[i]);
                continue;
            }
            this.beforeLine(lineNo, items[i]);
        }
        for (var i = end; i > lineNo; i--) {
            this.removeLine(i);
        }
        this.updateLineNo();
        var selectIndex = begin + items.length - 1;
        if (selectIndex > this.bodyPanel.children.length) {
            return;
        }
        this.selectNode(this.bodyPanel.children[selectIndex - 1].firstChild, 0);
        this.selectLine(selectIndex);
    };
    CodeElement.prototype.selectLine = function () {
        var _this = this;
        var lines = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lines[_i] = arguments[_i];
        }
        this.eachLine(function (dt, dd, index) {
            var has = lines.indexOf(index) >= 0;
            _this.toggleClass(dt, 'editor-line-active', has);
            _this.toggleClass(dd, 'editor-line-active', has);
        });
    };
    CodeElement.prototype.selectRangeLine = function (range) {
        var _this = this;
        var _a = this.getRangeLineNo(range), begin = _a[0], end = _a[1];
        this.eachLine(function (dt, dd, index) {
            var has = index >= begin && index <= end;
            dd.style.height = EditorHelper.height(dt) + 'px';
            _this.toggleClass(dt, 'editor-line-active', has);
            _this.toggleClass(dd, 'editor-line-active', has);
        });
    };
    CodeElement.prototype.updateLineCount = function () {
        var begin = Math.max(5, this.bodyPanel.children.length);
        for (var i = this.linePanel.children.length - 1; i >= begin; i--) {
            this.linePanel.removeChild(this.linePanel.children[i]);
        }
    };
    CodeElement.prototype.updateLineNoStyle = function () {
        var minHeight = 0;
        for (var i = 0; i < this.bodyPanel.children.length; i++) {
            var element = this.bodyPanel.children[i];
            var h = EditorHelper.height(element);
            if (h > 0 && (minHeight === 0
                || h < minHeight)) {
                minHeight = h;
            }
        }
        if (minHeight <= 0) {
            return;
        }
        var max = Math.max(this.bodyPanel.children.length, this.linePanel.children.length);
        var dt;
        var dd;
        for (var i = 0; i < max; i++) {
            dt = this.bodyPanel.children.length > i ? this.bodyPanel.children[i] : undefined;
            dd = this.linePanel.children.length > i ? this.linePanel.children[i] : undefined;
            if (!dd) {
                dd = this.createLineNo(i + 1);
            }
            var h = dt ? EditorHelper.height(dt) : 0;
            dd.style.height = (h > minHeight ? h : minHeight) + 'px';
        }
    };
    CodeElement.prototype.toggleClass = function (ele, tag, force) {
        if (force === void 0) {
            force = !ele.classList.contains(tag);
        }
        if (force) {
            ele.classList.add(tag);
            return;
        }
        ele.classList.remove(tag);
    };
    CodeElement.prototype.selectNode = function (node, offset) {
        if (offset === void 0) { offset = 0; }
        var sel = window.getSelection();
        var range = sel.getRangeAt(0);
        range.deleteContents();
        range = range.cloneRange();
        range.setStart(node, offset);
        range.setEnd(node, offset);
        sel.removeAllRanges();
        sel.addRange(range);
    };
    CodeElement.prototype.addLines = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        for (var _a = 0, items_1 = items; _a < items_1.length; _a++) {
            var line = items_1[_a];
            this.addLine(line);
        }
    };
    CodeElement.prototype.beforeLine = function (index, text) {
        var dt = this.createLine(text);
        this.bodyPanel.insertBefore(dt, this.bodyPanel.children[index - 1]);
        if (this.linePanel.children.length >= this.bodyPanel.children.length) {
            return;
        }
        this.linePanel.insertBefore(this.createLineNo(index, dt), this.linePanel.children[index - 1]);
    };
    CodeElement.prototype.addLine = function (v) {
        var line = this.bodyPanel.children.length + 1;
        var dt = this.createLine(v);
        this.bodyPanel.appendChild(dt);
        if (this.linePanel.children.length >= this.bodyPanel.children.length) {
            this.updateLine(line);
            return;
        }
        this.linePanel.appendChild(this.createLineNo(line, dt));
    };
    CodeElement.prototype.createLineNo = function (line, lineBody) {
        // if (this.linePanel.children.length >= line) {
        //     return this.linePanel.children[line - 1] as HTMLDivElement;
        // }
        var dd = document.createElement('div');
        dd.className = 'editor-line-no';
        dd.textContent = line.toString();
        if (lineBody) {
            dd.style.height = EditorHelper.height(lineBody) + 'px';
        }
        return dd;
    };
    CodeElement.prototype.createLine = function (v) {
        var dt = document.createElement('div');
        dt.className = 'editor-line';
        this.renderLine(dt, v);
        this.appendBr(dt);
        return dt;
    };
    CodeElement.prototype.updateLine = function (index, text) {
        var i = index - 1;
        var lineBody = this.bodyPanel.children[i];
        if (typeof text !== 'undefined') {
            this.renderLine(lineBody, text);
        }
        var lineNo = this.linePanel.children[i];
        lineNo.style.height = EditorHelper.height(lineBody) + 'px';
    };
    CodeElement.prototype.updateLineNo = function (index) {
        if (index === void 0) { index = 1; }
        for (; index <= this.linePanel.children.length; index++) {
            this.linePanel.children[index - 1].textContent = index.toString();
        }
    };
    CodeElement.prototype.renderLine = function (parent, line) {
        if (typeof line === 'undefined') {
            return;
        }
        parent.innerText = line;
        this.appendBr(parent);
    };
    CodeElement.prototype.appendBr = function (node) {
        if (node.childNodes.length > 0 && node.childNodes[node.childNodes.length - 1].nodeName === 'BR') {
            return;
        }
        node.appendChild(document.createElement('br'));
    };
    CodeElement.prototype.eachLine = function (cb) {
        for (var i = 0; i < this.bodyPanel.children.length; i++) {
            var dt = this.bodyPanel.children[i];
            if (cb(dt, this.linePanel.children[i], i + 1) === false) {
                break;
            }
        }
    };
    return CodeElement;
}());
var EditorContainer = /** @class */ (function () {
    // private mouseMoveListeners = {
    //     move: undefined,
    //     finish: undefined,
    // };
    function EditorContainer(option) {
        if (option === void 0) { option = new EditorOptionManager(); }
        this.option = option;
        this.undoStack = [];
        this.asyncTimer = 0;
        this.listeners = {};
        // document.addEventListener('mousemove', e => {
        //     this.emit(EDITOR_EVENT_MOUSE_MOVE, {x: e.clientX, y: e.clientX});
        // });
        // document.addEventListener('mouseup', e => {
        //     this.emit(EDITOR_EVENT_MOUSE_UP, {x: e.clientX, y: e.clientX});
        // });
    }
    EditorContainer.prototype.ready = function (element) {
        var _this = this;
        if (element instanceof HTMLDivElement) {
            this.element = new DivElement(element, this);
        }
        else if (element instanceof HTMLTextAreaElement) {
            this.element = new TextareaElement(element, this);
        }
        else {
            this.element = element;
        }
        if (!this.element) {
            return;
        }
        // this.on(EDITOR_EVENT_MOUSE_MOVE, p => {
        //     if (this.mouseMoveListeners.move) {
        //         this.mouseMoveListeners.move(p);
        //     }
        // }).on(EDITOR_EVENT_MOUSE_UP, p => {
        //     if (this.mouseMoveListeners.finish) {
        //         this.mouseMoveListeners.finish(p);
        //     }
        // });
        this.on(EDITOR_EVENT_INPUT_KEYDOWN, function (e) {
            var modifiers = [];
            if (e.ctrlKey) {
                modifiers.push('Ctrl');
            }
            if (e.shiftKey) {
                modifiers.push('Shift');
            }
            if (e.altKey) {
                modifiers.push('Alt');
            }
            if (e.metaKey) {
                modifiers.push('Meta');
            }
            if (e.key !== 'Control' && modifiers.indexOf(e.key) < 0) {
                modifiers.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
            }
            var module = _this.option.hotKeyModule(modifiers.join('+'));
            if (module) {
                e.preventDefault();
                _this.execute(module);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                _this.insert({ type: EditorBlockType.AddLineBreak });
                return;
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                _this.insert({ type: EditorBlockType.Indent });
            }
        });
        this.on(EDITOR_EVENT_INPUT_BLUR, function () {
            _this.saveSelection();
            // this.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
        this.on(EDITOR_EVENT_EDITOR_CHANGE, function () {
            _this.asynSave();
        });
        this.on(EDITOR_EVENT_EDITOR_AUTO_SAVE, function () {
            if (_this.undoIndex >= 0 && _this.undoIndex < _this.undoStack.length - 1) {
                _this.undoStack.splice(_this.undoIndex);
            }
            var maxUndoCount = _this.option.maxUndoCount;
            if (maxUndoCount < _this.undoStack.length) {
                _this.undoStack.splice(0, _this.undoStack.length - maxUndoCount - 1);
            }
            _this.undoStack.push(_this.value);
            _this.undoIndex = _this.undoStack.length - 1;
            _this.emit(EDITOR_EVENT_UNDO_CHANGE);
        });
        this.emit(EDITOR_EVENT_EDITOR_READY);
    };
    Object.defineProperty(EditorContainer.prototype, "canUndo", {
        get: function () {
            return this.undoIndex > 0 && this.undoStack.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorContainer.prototype, "canRedo", {
        get: function () {
            return this.undoIndex < this.undoStack.length && this.undoStack.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorContainer.prototype, "hasSelection", {
        /**
            是否有选择字符串
         */
        get: function () {
            return this.selection && this.selection.start < this.selection.end;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorContainer.prototype, "value", {
        get: function () {
            if (!this.element) {
                return '';
            }
            return this.element.value;
        },
        set: function (content) {
            var _this = this;
            if (!this.element) {
                this.once(EDITOR_EVENT_EDITOR_READY, function () {
                    _this.element.value = content;
                });
                return;
            }
            this.element.value = typeof content === 'undefined' ? '' : content;
            // this.emit(EDITOR_EVENT_EDITOR_CHANGE);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorContainer.prototype, "length", {
        get: function () {
            return this.element ? this.element.length : 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorContainer.prototype, "wordLength", {
        get: function () {
            return this.element ? this.element.wordLength : 0;
        },
        enumerable: false,
        configurable: true
    });
    EditorContainer.prototype.checkSelection = function () {
        if (!this.selection) {
            this.selection = this.element.selection;
        }
    };
    EditorContainer.prototype.selectAll = function () {
        this.element.selectAll();
    };
    EditorContainer.prototype.saveSelection = function () {
        this.selection = this.element.selection;
    };
    EditorContainer.prototype.insert = function (block, range) {
        if (typeof block !== 'object') {
            block = {
                type: EditorBlockType.AddText,
                value: block,
            };
        }
        this.element.insert(block, range !== null && range !== void 0 ? range : this.selection);
    };
    EditorContainer.prototype.execute = function (module, range, data) {
        var instance = this.option.toModule(module);
        if (!instance || !instance.handler) {
            return;
        }
        instance.handler(this, range !== null && range !== void 0 ? range : this.selection, data);
    };
    EditorContainer.prototype.paste = function (data) {
        this.element.paste(data);
    };
    EditorContainer.prototype.clear = function (focus) {
        if (focus === void 0) { focus = true; }
        this.element.value = '';
        if (!focus) {
            return;
        }
        this.focus();
    };
    /**
     * focus
     */
    EditorContainer.prototype.focus = function () {
        this.checkSelection();
        this.element.selection = this.selection;
        this.element.focus();
    };
    EditorContainer.prototype.asynSave = function () {
        var _this = this;
        if (this.asyncTimer > 0) {
            clearTimeout(this.asyncTimer);
        }
        this.asyncTimer = window.setTimeout(function () {
            _this.asyncTimer = 0;
            _this.emit(EDITOR_EVENT_EDITOR_AUTO_SAVE);
        }, 2000);
    };
    EditorContainer.prototype.blur = function () {
        this.element.blur();
    };
    EditorContainer.prototype.destroy = function () {
        this.element.destroy();
        this.emit(EDITOR_EVENT_EDITOR_DESTORY);
        this.listeners = {};
    };
    EditorContainer.prototype.undo = function () {
        if (!this.canUndo) {
            this.emit(EDITOR_EVENT_UNDO_CHANGE);
            return;
        }
        this.undoIndex--;
        this.value = this.undoStack[this.undoIndex];
    };
    EditorContainer.prototype.redo = function () {
        if (!this.canRedo) {
            this.emit(EDITOR_EVENT_UNDO_CHANGE);
            return;
        }
        this.undoIndex++;
        this.value = this.undoStack[this.undoIndex];
    };
    EditorContainer.prototype.on = function (event, cb) {
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(cb);
        return this;
    };
    EditorContainer.prototype.emit = function (event) {
        var items = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            items[_i - 1] = arguments[_i];
        }
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            return this;
        }
        var listeners = this.listeners[event];
        for (var i = listeners.length - 1; i >= 0; i--) {
            var cb = listeners[i];
            var res = cb.apply(void 0, items);
            //  允许事件不进行传递
            if (res === false) {
                break;
            }
        }
        return this;
    };
    EditorContainer.prototype.off = function () {
        var events = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            events[_i] = arguments[_i];
        }
        if (events.length == 2 && typeof events[1] === 'function') {
            return this.offListener(events[0], events[1]);
        }
        for (var _a = 0, events_1 = events; _a < events_1.length; _a++) {
            var event_1 = events_1[_a];
            delete this.listeners[event_1];
        }
        return this;
    };
    EditorContainer.prototype.once = function (event, cb) {
        var _this = this;
        var func = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            _this.off(event, func);
            cb.apply(void 0, items);
        };
        this.on(event, func);
        return this;
    };
    EditorContainer.prototype.offListener = function (event, cb) {
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            return this;
        }
        var items = this.listeners[event];
        for (var i = items.length - 1; i >= 0; i--) {
            if (items[i] === cb) {
                items.splice(i, 1);
            }
        }
        return this;
    };
    return EditorContainer;
}());
/**
 * 富文本模式
 */
var DivElement = /** @class */ (function () {
    function DivElement(element, container) {
        this.element = element;
        this.container = container;
        this.isComposition = false;
        this.bindEvent();
    }
    Object.defineProperty(DivElement.prototype, "blockTagName", {
        get: function () {
            return this.container.option.blockTag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DivElement.prototype, "selection", {
        get: function () {
            var sel = window.getSelection();
            if (sel.rangeCount < 1) {
                var range_1 = document.createRange();
                range_1.setStart(this.element, this.element.children.length);
                range_1.setEnd(this.element, this.element.children.length);
                return {
                    start: this.element.children.length,
                    end: this.element.children.length,
                    range: range_1.cloneRange()
                };
            }
            var range = sel.getRangeAt(0);
            return {
                start: range.startOffset,
                end: range.endOffset,
                range: range.cloneRange()
            };
        },
        set: function (v) {
            var sel = window.getSelection();
            var range;
            if (v.range) {
                range = v.range;
            }
            else {
                range = sel.getRangeAt(0);
                range.deleteContents();
                range = range.cloneRange();
                range.setStart(this.element, v.start);
                range.setEnd(this.element, v.end);
            }
            sel.removeAllRanges();
            sel.addRange(range);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DivElement.prototype, "selectedValue", {
        get: function () {
            var _this = this;
            var items = [];
            var range = this.selection.range;
            var lastLine;
            this.eachRange(range, function (node) {
                if (node === range.startContainer && range.startContainer === range.endContainer) {
                    items.push(node.textContent.substring(range.startOffset, range.endOffset));
                    return;
                }
                if (node.nodeName === 'BR') {
                    items.push('\n');
                    lastLine = undefined;
                    return;
                }
                if (lastLine !== node.parentNode && node.parentNode !== _this.element && ['P', 'DIV', 'TR'].indexOf(node.parentNode.nodeName) >= 0) {
                    // 这里可以加一个判断 p div tr
                    if (lastLine) {
                        items.push('\n');
                    }
                    lastLine = node.parentNode;
                }
                if (node === range.startContainer) {
                    items.push(node.textContent.substring(range.startOffset));
                }
                else if (node === range.endContainer) {
                    items.push(node.textContent.substring(0, range.endOffset));
                }
            });
            return items.join('');
        },
        set: function (val) {
            this.insert({ type: EditorBlockType.AddText, text: val });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DivElement.prototype, "value", {
        get: function () {
            return this.element.innerHTML;
        },
        set: function (v) {
            this.element.innerHTML = v;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DivElement.prototype, "length", {
        get: function () {
            return this.value.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DivElement.prototype, "wordLength", {
        get: function () {
            return EditorHelper.wordLength(this.element.innerText);
        },
        enumerable: false,
        configurable: true
    });
    DivElement.prototype.selectAll = function () {
        var sel = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(this.element);
        sel.removeAllRanges();
        sel.addRange(range);
    };
    DivElement.prototype.insert = function (block, range) {
        if (!range) {
            range = this.selection;
        }
        var func = this[block.type + 'Execute'];
        if (typeof func === 'function') {
            func.call(this, range.range, block);
            this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
            return;
        }
        throw new Error("insert type error:[".concat(block.type, "]"));
    };
    DivElement.prototype.focus = function () {
        this.element.focus({ preventScroll: true });
    };
    DivElement.prototype.blur = function () {
        return this.element.blur();
    };
    DivElement.prototype.destroy = function () {
    };
    //#region 外部调用的方法
    DivElement.prototype.addHrExecute = function (range) {
        var hr = document.createElement('hr');
        this.replaceSelected(range, hr);
    };
    DivElement.prototype.indentExecute = function (range) {
        var _this = this;
        var items = [];
        this.eachRangeParentNode(range, function (node) {
            if (_this.isBlockNode(node) || node.parentNode === _this.element) {
                items.push(node);
                return true;
            }
        });
        for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
            var item = items_2[_i];
            var node = item;
            if (!this.isBlockNode(node)) {
                var p = document.createElement(this.blockTagName);
                p.appendChild(node.cloneNode(true));
                this.element.replaceChild(p, node);
                node = p;
            }
            var style = window.getComputedStyle(node);
            node.style.marginLeft = parseFloat(style.marginLeft.replace('px', '')) + 20 + 'px';
        }
    };
    DivElement.prototype.outdentExecute = function (range) {
        var _this = this;
        this.eachRangeParentNode(range, function (node) {
            if (!_this.isBlockNode(node)) {
                return;
            }
            var ele = node;
            var style = window.getComputedStyle(ele);
            var padding = parseFloat(style.marginLeft.replace('px', '')) - 20;
            ele.style.marginLeft = Math.max(0, padding) + 'px';
            return true;
        });
    };
    DivElement.prototype.tabExecute = function (range) {
        var cell = this.nodeParent(range.startContainer, 'td,' + this.blockTagName);
        if (!(cell instanceof HTMLTableCellElement)) {
            this.indentExecute(range);
            return;
        }
        if (this.moveTableFocus(cell)) {
            return;
        }
        this.focusAfter(this.nodeParent(cell, 'table'));
    };
    DivElement.prototype.addTableExecute = function (range, block) {
        var table = document.createElement('table');
        table.style.width = '100%';
        var tbody = table.createTBody();
        var tdWidth = 100 / block.column + '%';
        for (var i = 0; i < block.row; i++) {
            var tr = document.createElement('tr');
            for (var j = 0; j < block.column; j++) {
                var td = document.createElement('td');
                td.appendChild(document.createElement('br'));
                td.style.width = tdWidth;
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        this.replaceSelected(range, table);
    };
    DivElement.prototype.addImageExecute = function (range, block) {
        var image = document.createElement('img');
        image.src = block.value;
        image.title = block.title || '';
        this.replaceSelected(range, image);
    };
    DivElement.prototype.addTextExecute = function (range, block) {
        var span = document.createElement('span');
        span.innerText = block.value;
        this.replaceSelected(range, span);
    };
    DivElement.prototype.addRawExecute = function (range, block) {
        var value = block.value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); //.replace(/<([\/]?)(div)((:?\s*)(:?[^>]*)(:?\s*))>/g, '<$1p$3>');
        var p = document.createElement('div');
        p.innerHTML = value;
        var items = [];
        for (var i = 0; i < p.childNodes.length; i++) {
            items.push(p.childNodes[i]);
        }
        this.replaceSelected.apply(this, __spreadArray([range], items, false));
    };
    DivElement.prototype.addVideoExecute = function (range, block) {
        var ele = document.createElement('video');
        ele.src = block.value;
        ele.title = block.title || '';
        this.replaceSelected(range, ele);
    };
    DivElement.prototype.addFileExecute = function (range, block) {
        var ele = document.createElement('a');
        ele.href = block.value;
        ele.title = block.title || '';
        this.replaceSelected(range, ele);
    };
    DivElement.prototype.addLinkExecute = function (range, block) {
        var link = document.createElement('a');
        link.href = block.value;
        link.text = block.title;
        if (block.target) {
            link.target = '_blank';
        }
        this.insertElement(link, range);
        this.selectNode(link);
    };
    DivElement.prototype.addLineBreakExecute = function (range) {
        var _this = this;
        var begin = range.startContainer;
        var beginOffset = range.startOffset;
        var p = document.createElement(this.blockTagName);
        if (begin === this.element) {
            p.appendChild(document.createElement('br'));
            if (this.element.children.length === 0) {
                this.insertLast(this.element, p.cloneNode(true), p);
            }
            else {
                this.insertToChildIndex(p, begin, range.startOffset);
            }
            this.selectNode(p);
            return;
        }
        var li = this.nodeParent(begin, 'li,td,' + this.blockTagName);
        if (li) {
            if (li.nodeName === 'LI') {
                var next_1 = document.createElement(li.nodeName);
                this.insertAfter(li, next_1);
                this.selectNode(next_1);
                return;
            }
            if (li instanceof HTMLTableCellElement) {
                if (this.moveTableFocus(li)) {
                    return;
                }
                this.focusAfter(this.nodeParent(li, 'table'));
                return;
            }
        }
        var addBlock = false;
        this.eachBlockNext(range.endContainer, range.endOffset, function (node) {
            // 会出现嵌套的情况
            if (node === begin) {
                begin = begin.parentNode;
                beginOffset = 0;
                addBlock = true;
            }
            p.appendChild(node);
        });
        p.appendChild(document.createElement('br'));
        this.removeRange(range);
        // this.insertElement(p, range);
        var next;
        var done = false;
        this.eachParentNode(begin, function (node) {
            if (_this.isBlockNode(node) && node) {
                _this.insertAfter(node, p);
                next = undefined;
                done = true;
                return false;
            }
            next = node;
        });
        if (!done) {
            if (next) {
                this.insertAfter(next, p);
            }
            else {
                this.element.appendChild(p);
            }
        }
        if (addBlock) {
            var ele = document.createElement(this.blockTagName);
            ele.appendChild(document.createElement('br'));
            this.insertBefore(p, ele);
        }
        this.selectNode(p);
    };
    DivElement.prototype.hExecute = function (range, block) {
        this.replaceNodeName(range.startContainer, block.value);
    };
    DivElement.prototype.blockquoteExecute = function (range) {
        this.toggleRangeTag(range, 'blockquote');
    };
    DivElement.prototype.listExecute = function (range) {
        var node = range.startContainer;
        var box = this.nodeParent(node, 'ul,ol');
        if (box) {
            var items_3 = [];
            for (var j = 0; j < box.childNodes.length; j++) {
                var li_1 = box.childNodes[j];
                if (li_1.nodeName !== 'li') {
                    items_3.push(li_1);
                    continue;
                }
                li_1.childNodes.forEach(function (v) {
                    items_3.push(v);
                });
            }
            this.replaceNode(box, items_3);
            return;
        }
        box = document.createElement('ul');
        var li = document.createElement('li');
        box.appendChild(li);
        this.replaceNode(node, box, function () {
            li.appendChild(node);
        });
    };
    DivElement.prototype.boldExecute = function (range) {
        this.toggleRangeTag(range, 'b');
    };
    DivElement.prototype.subExecute = function (range) {
        this.toggleRangeStyle(range, {
            'vertical-align': 'text-bottom',
            'font-size': '8px'
        });
    };
    DivElement.prototype.supExecute = function (range) {
        this.toggleRangeStyle(range, {
            'vertical-align': 'text-top',
            'font-size': '8px'
        });
    };
    DivElement.prototype.italicExecute = function (range, block) {
        this.toggleRangeTag(range, 'i');
    };
    DivElement.prototype.underlineExecute = function (range) {
        this.toggleRangeStyle(range, {
            'text-decoration': 'underline'
        });
    };
    DivElement.prototype.strikeExecute = function (range) {
        this.toggleRangeStyle(range, {
            'text-decoration': 'strike'
        });
    };
    DivElement.prototype.fontSizeExecute = function (range, block) {
        this.toggleRangeStyle(range, {
            'font-size': block.value
        });
    };
    DivElement.prototype.fontFamilyExecute = function (range, block) {
        this.toggleRangeStyle(range, {
            'font-family': block.value
        });
    };
    DivElement.prototype.backgroundExecute = function (range, block) {
        this.toggleRangeStyle(range, {
            'background-color': block.value
        });
    };
    DivElement.prototype.foregroundExecute = function (range, block) {
        this.toggleRangeStyle(range, {
            color: block.value
        });
    };
    DivElement.prototype.clearStyleExecute = function (range) {
        var _this = this;
        this.eachRangeParentNode(range, function (node) {
            if (!(node instanceof HTMLElement)) {
                return;
            }
            node.removeAttribute('style');
            if (['B', 'I'].indexOf(node.nodeName) >= 0) {
                return _this.replaceNodeName(node, 'span', false);
                ;
            }
            if (/^H\d$/.test(node.tagName)) {
                return _this.replaceNodeName(node, _this.blockTagName, false);
            }
        });
    };
    DivElement.prototype.alignExecute = function (range, block) {
        this.toggleRangeStyle(range, {
            'text-align': block.value
        });
    };
    DivElement.prototype.theadExecute = function (range) {
        var table = this.nodeParent(range.startContainer, 'table');
        if (!table) {
            return;
        }
        if (table.tHead) {
            table.tHead = null;
            return;
        }
        table.createTHead();
    };
    DivElement.prototype.tfootExecute = function (range) {
        var table = this.nodeParent(range.startContainer, 'table');
        if (!table) {
            return;
        }
        if (table.tFoot) {
            table.tFoot = null;
            return;
        }
        table.createTFoot();
    };
    DivElement.prototype.rowSpanExecute = function (range) {
        var start = this.getTableCell(range.startContainer);
        var end = this.getTableCell(range.endContainer);
        var body = start.parentNode.parentNode;
        var startSpan = this.getTableCellSpan(start);
        if (start === end) {
            if (start.rowSpan < 2) {
                return;
            }
            var count = start.rowSpan - 1;
            start.rowSpan = 1;
            var found = false;
            for (var i = 0; i < body.rows.length; i++) {
                if (count < 1) {
                    break;
                }
                var tr = body.rows[i];
                if (tr === start.parentNode) {
                    found = true;
                    continue;
                }
                if (!found) {
                    continue;
                }
                count--;
                var span_1 = 0;
                for (var j = 0; j < tr.cells.length; j++) {
                    var item = tr.cells[i];
                    span_1 += item.colSpan;
                    if (span_1 === startSpan) {
                        this.insertAfter(item, document.createElement(start.nodeName));
                        break;
                    }
                    else if (span_1 > startSpan) {
                        item.colSpan++;
                        break;
                    }
                }
            }
            return;
        }
        if (start.parentNode === end.parentNode) {
            return;
        }
        if (body !== end.parentNode.parentNode) {
            return;
        }
        // 获取 td|th table
        // 判断 两个 table 是否是同一个
        // 获取 tr.index 
        // 设置第一个 td rowspan ，删除其他行的td
        var endIndex = -1;
        var span = 0;
        for (var i = body.rows.length - 1; i >= 0; i--) {
            var tr = body.rows[i];
            if (tr === start.parentNode) {
                start.rowSpan += span;
                break;
            }
            if (tr === end.parentNode) {
                endIndex = i;
            }
            if (endIndex < 0) {
                return;
            }
            span++;
            var s = 0;
            for (var j = 0; j < tr.cells.length; j++) {
                var item = tr.cells[j];
                s += item.colSpan;
                if (s < startSpan) {
                    continue;
                }
                if (s > startSpan || item.colSpan > 1) {
                    item.colSpan--;
                }
                else {
                    tr.removeChild(item);
                }
                break;
            }
        }
    };
    DivElement.prototype.colSpanExecute = function (range) {
        var start = this.getTableCell(range.startContainer);
        var end = this.getTableCell(range.endContainer);
        if (start === end) {
            if (start.colSpan < 2) {
                return;
            }
            var count = start.colSpan - 1;
            start.colSpan = 1;
            for (var i = 0; i < count; i++) {
                this.insertAfter(start, document.createElement(start.nodeName));
            }
            return;
        }
        var tr = start.parentNode;
        // 获取 td|th tr
        // 判断 两个 tr 是否是同一个
        // 获取 td.index 
        // 设置第一个 td rowspan ，删除其他的td
        if (tr !== end.parentNode) {
            return;
        }
        var endIndex = -1;
        var span = 0;
        for (var i = tr.cells.length - 1; i >= 0; i--) {
            var item = tr.cells[i];
            if (item === start) {
                item.colSpan += span;
                break;
            }
            if (item === end) {
                endIndex = i;
            }
            if (endIndex > 0) {
                span += item.colSpan;
                tr.removeChild(item);
            }
        }
    };
    DivElement.prototype.delTableExecute = function (range) {
        var table = this.nodeParent(range.startContainer, 'table');
        if (table) {
            this.removeNode(table);
        }
    };
    DivElement.prototype.openLinkExecute = function (range) {
        var link = this.nodeParent(range.startContainer, 'a');
        if (!link) {
            return;
        }
        window.open(link.getAttribute('href'));
    };
    //#endregion
    DivElement.prototype.getModuleItems = function (range) {
        var _a;
        var node = (_a = range.range) === null || _a === void 0 ? void 0 : _a.startContainer;
        if (!node) {
            return [];
        }
        var blockName = this.blockTagName.toUpperCase();
        var data = [];
        this.eachParentNode(node, function (item) {
            if (node.nodeName === blockName || node.nodeName === 'IMG'
                || node.nodeName === 'TABLE' || node.nodeName === 'VIDEO') {
                return false;
            }
            if (!(item instanceof HTMLElement)) {
                return;
            }
            if (item.nodeName === 'B') {
                data.push('bold');
            }
            else if (item.nodeName === 'I') {
                data.push('italic');
            }
            else if (item.nodeName === 'BLOCKQUOTE') {
                data.push('blockquote');
            }
            else if (/^H[1-6]$/.test(item.nodeName)) {
                data.push('head');
            }
            if (item.style.verticalAlign === 'text-top') {
                data.push('sup');
            }
            else if (item.style.verticalAlign === 'text-bottom') {
                data.push('sub');
            }
            if (item.style.textDecoration === 'underline') {
                data.push('wavyline');
            }
            else if (item.style.textDecoration === 'wavyline') {
                data.push('dashed');
            }
            else if (item.style.textDecoration === 'strike') {
                data.push('strike');
            }
            if (item.style.backgroundColor) {
                data.push('background');
            }
            if (item.style.color) {
                data.push('foreground');
            }
        });
        return data;
    };
    DivElement.prototype.getTableCellSpan = function (node) {
        var parent = node.parentNode;
        var span = 0;
        for (var i = 0; i < parent.cells.length; i++) {
            var item = parent.cells[i];
            if (item === node) {
                break;
            }
            span += item.colSpan;
        }
        return span;
    };
    DivElement.prototype.getTableCell = function (node) {
        if (node instanceof HTMLTableCellElement) {
            return node;
        }
        while (node.parentNode) {
            if (node.parentNode instanceof HTMLTableCellElement) {
                return node.parentNode;
            }
        }
        return;
    };
    /**
     * 移动光标到下一格
     * @param node
     * @returns
     */
    DivElement.prototype.moveTableFocus = function (node) {
        if (node.nextSibling) {
            this.selectNode(node.nextSibling);
            return true;
        }
        var tr = node.parentNode;
        if (!tr || !(tr instanceof HTMLTableRowElement)) {
            return false;
        }
        if (tr.nextSibling && tr.nextSibling.childNodes.length >= 1) {
            this.selectNode(tr.nextSibling.childNodes[0]);
            return true;
        }
        var body = tr.parentNode;
        if (!body || !(body instanceof HTMLTableSectionElement)) {
            return false;
        }
        if (!body.nextSibling || body.nextSibling.childNodes.length === 0) {
            return false;
        }
        var nextTr = body.nextSibling.childNodes[0];
        if (nextTr.childNodes.length === 0) {
            return false;
        }
        this.selectNode(nextTr.childNodes[0]);
        return true;
    };
    /**
     * 删除选中并替换为新的
     */
    DivElement.prototype.replaceSelected = function (range) {
        var _this = this;
        var items = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            items[_i - 1] = arguments[_i];
        }
        if (this.isEmptyRange(range)) {
            this.insertToElement.apply(this, __spreadArray([range.startContainer, range.startOffset], items, false));
            return;
        }
        this.removeRange(range);
        // this.insertElement(p, range);
        var next;
        var done = false;
        this.eachParentNode(range.startContainer, function (node) {
            if (_this.isBlockNode(node) && node) {
                _this.insertAfter.apply(_this, __spreadArray([node], items, false));
                next = undefined;
                done = true;
                return false;
            }
            next = node;
        });
        if (!done) {
            if (next) {
                this.insertAfter.apply(this, __spreadArray([next], items, false));
            }
            else {
                this.insertLast.apply(this, __spreadArray([this.element], items, false));
            }
        }
        this.selectNode(items[items.length - 1]);
    };
    /**
     * 把选中的作为子项包含进去
     */
    DivElement.prototype.includeSelected = function (range, parent) {
        this.insertLast.apply(this, __spreadArray([parent], this.copySelectedNode(range), false));
        this.replaceSelected(range, parent);
    };
    DivElement.prototype.toggleRangeTag = function (range, tag) {
        var _this = this;
        tag = tag.toUpperCase();
        if (this.isEmptyRange(range)) {
            this.toggleParentNode(range, tag);
            return;
        }
        this.eachTopRange(range, function (node) {
            var items = _this.splitNodeRange(node, range);
            if (items.length === 0) {
                return;
            }
            if (!_this.isBlockNode(items[0])) {
                _this.replaceNode(items[0], document.createElement(tag), function (n) {
                    _this.insertLast.apply(_this, __spreadArray([n], items, false));
                });
                return;
            }
            for (var _i = 0, items_4 = items; _i < items_4.length; _i++) {
                var item = items_4[_i];
                if (_this.isBlockNode(item)) {
                    _this.toggleBlockTag(item, tag);
                    continue;
                }
                if (item.nodeName === tag) {
                    continue;
                }
                _this.replaceNodeName(item, tag, false);
            }
        });
    };
    DivElement.prototype.toggleRangeStyle = function (range, attrs) {
        var _this = this;
        if (this.isEmptyRange(range)) {
            this.toggleParentStyle(range, attrs);
            return;
        }
        this.eachTopRange(range, function (node) {
            var items = _this.splitNodeRange(node, range);
            if (items.length === 0) {
                return;
            }
            for (var _i = 0, items_5 = items; _i < items_5.length; _i++) {
                var item = items_5[_i];
                if (item instanceof HTMLElement) {
                    EditorHelper.css(item, attrs);
                    continue;
                }
                EditorHelper.css(_this.replaceNodeName(item, 'span', false), attrs);
            }
        });
    };
    DivElement.prototype.toggleBlockTag = function (node, tag) {
        var n = document.createElement(tag);
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            n.append(node.childNodes[i]);
        }
        node.append(n);
    };
    /**
     * 切换父级的标签，例如 b strong
     */
    DivElement.prototype.toggleParentNode = function (range, tag) {
        var _this = this;
        var n = document.createElement(tag);
        var node = range.startContainer;
        if (node === this.element) {
            this.insertToChildIndex(n, node, range.startOffset);
            this.selectNode(n);
            return;
        }
        var parent = this.nodeParent(node, tag);
        if (parent) {
            this.replaceNodeName(parent, tag === 'b' ? 'span' : this.blockTagName);
            return;
        }
        var target = node;
        if (node.parentNode && node.parentNode !== this.element && this.isOnlyNode(node)) {
            target = node.parentNode;
        }
        this.replaceNode(target, n, function () {
            n.appendChild(node);
            if (target !== node) {
                _this.removeNode(target);
            }
        });
        this.selectNode(node);
    };
    /**
     * 切换父级的样式
     */
    DivElement.prototype.toggleParentStyle = function (range, style) {
        var box = this.getBlockParent(range.startContainer);
        EditorHelper.css(box, style);
    };
    /**
     * 获取节点的父级
     * @param node
     * @returns
     */
    DivElement.prototype.getBlockParent = function (node) {
        var box = node.parentNode;
        if (box !== this.element) {
            return box;
        }
        var p = document.createElement(this.blockTagName);
        this.replaceNode(node, p, function () {
            p.appendChild(node);
        });
        return p;
    };
    DivElement.prototype.nodeParent = function (node, tag) {
        if (!tag) {
            return node.parentNode;
        }
        var items = tag.toUpperCase().split(',');
        var parent;
        this.eachParentNode(node, function (item) {
            if (items.indexOf(item.nodeName) >= 0) {
                parent = item;
                return false;
            }
        });
        return parent;
    };
    /**
     * 判断节点是否处于范围内
     * @param node
     * @returns
     */
    DivElement.prototype.hasNode = function (node) {
        if (node === this.element) {
            return false;
        }
        while (node.parentNode) {
            if (node.parentNode.nodeName === 'BODY') {
                return false;
            }
            if (node.parentNode === this.element) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };
    DivElement.prototype.replaceNodeName = function (node, tag, isSelected) {
        if (isSelected === void 0) { isSelected = true; }
        var n = document.createElement(tag);
        if (node instanceof HTMLElement) {
            if (n.nodeName === node.nodeName) {
                return node;
            }
            n.innerHTML = node.innerHTML;
            this.replaceNode(node, n);
        }
        else {
            this.replaceNode(node, n, function (next) {
                next.appendChild(node);
            });
        }
        if (isSelected) {
            this.selectNode(n);
        }
        return n;
    };
    DivElement.prototype.replaceNode = function (node, newNode, removeFn) {
        var _this = this;
        var target = newNode instanceof Array ? newNode : [newNode];
        var fn = function () {
            if (removeFn) {
                removeFn(newNode);
                return;
            }
            _this.removeNode(node);
        };
        var borther = node.previousSibling;
        if (borther) {
            fn();
            this.insertAfter.apply(this, __spreadArray([borther], target, false));
            return;
        }
        borther = node.nextSibling;
        if (borther) {
            fn();
            this.insertBefore.apply(this, __spreadArray([borther], target, false));
            return;
        }
        var parent = node.parentNode;
        fn();
        this.insertLast.apply(this, __spreadArray([parent], target, false));
        return;
    };
    DivElement.prototype.selectNode = function (node, offset) {
        if (offset === void 0) { offset = 0; }
        var sel = window.getSelection();
        var range = document.createRange();
        // range.deleteContents();
        // range = range.cloneRange();
        range.setStart(node, offset);
        range.setEnd(node, offset);
        sel.removeAllRanges();
        sel.addRange(range);
    };
    DivElement.prototype.focusAfter = function (node) {
        if (!node) {
            return;
        }
        if (node.nextSibling) {
            this.selectNode(node.nextSibling);
            return;
        }
        this.selectNode(node.parentNode, node.parentNode.childNodes.length);
    };
    DivElement.prototype.bindEvent = function () {
        var _this = this;
        this.element.addEventListener('keydown', function (e) {
            _this.container.saveSelection();
            if (e.key === 'Tab') {
                e.preventDefault();
                _this.tabExecute(_this.selection.range);
            }
            else {
                _this.container.emit(EDITOR_EVENT_INPUT_KEYDOWN, e);
            }
            _this.container.emit(EDITOR_EVENT_CLOSE_TOOL);
        });
        this.element.addEventListener('keyup', function () {
            if (_this.isComposition) {
                return;
            }
            var range = _this.selection.range;
            if (_this.isEmptyLine(range)) {
                _this.container.emit(EDITOR_EVENT_SHOW_ADD_TOOL, _this.getNodeOffset(range.startContainer).y);
                return;
            }
            _this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
        this.element.addEventListener('compositionstart', function () {
            _this.isComposition = true;
            // this.container.saveSelection();
        });
        this.element.addEventListener('compositionend', function () {
            _this.isComposition = false;
            _this.container.saveSelection();
            _this.container.emit(EDITOR_EVENT_SELECTION_CHANGE);
            _this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
        this.element.addEventListener('mouseup', function () {
            _this.container.saveSelection();
            _this.container.emit(EDITOR_EVENT_SELECTION_CHANGE);
            // console.log([this.selectedValue]);
        });
        this.element.addEventListener('mouseenter', function (e) {
            if (!e.target) {
                return;
            }
            if (e.target instanceof HTMLHRElement) {
                if (e.target.previousSibling instanceof HTMLHRElement) {
                    _this.selectNode(e.target);
                    _this.container.emit(EDITOR_EVENT_SHOW_LINE_BREAK_TOOL, _this.getNodeOffset(e.target.previousSibling));
                }
            }
        });
        this.element.addEventListener('mousemove', function (e) {
            // this.container.saveSelection();
            if (!e.target) {
                return;
            }
            if (e.target instanceof HTMLTableCellElement) {
                var td = e.target;
                var x = e.offsetX;
                if (x > 0 && x < 4 && td.previousSibling) {
                    td.style.cursor = 'col-resize';
                    return;
                }
                else if (td.nextSibling && x > td.clientWidth - 4) {
                    td.style.cursor = 'col-resize';
                    return;
                }
                else {
                    td.style.cursor = 'auto';
                }
            }
        });
        this.element.addEventListener('paste', function (e) {
            e.preventDefault();
            _this.paste((e.clipboardData || window.clipboardData));
        });
        this.element.addEventListener('mousedown', function (e) {
            if (!e.target) {
                return;
            }
            if (e.target instanceof HTMLTableCellElement) {
                var td = e.target;
                var x = e.offsetX;
                if (x > 0 && x < 4 && td.previousSibling) {
                    _this.moveTableCol(td.previousSibling);
                    return;
                }
                else if (td.nextSibling && x > td.clientWidth - 4) {
                    _this.moveTableCol(td);
                    return;
                }
            }
        });
        this.element.addEventListener('touchend', function () {
            _this.container.saveSelection();
        });
        this.element.addEventListener('click', function (e) {
            _this.container.saveSelection();
            if (e.target instanceof HTMLImageElement) {
                var img_1 = e.target;
                _this.selectNode(img_1);
                _this.container.emit(EDITOR_EVENT_SHOW_IMAGE_TOOL, _this.getNodeBound(img_1), function (data) { return _this.updateNode(img_1, data); });
                return;
            }
            var range = _this.selection.range;
            if (_this.isInBlock(range)) {
                return;
            }
            if (_this.isEmptyLine(range)) {
                _this.container.emit(EDITOR_EVENT_SHOW_ADD_TOOL, _this.getNodeOffset(range.startContainer).y);
                return;
            }
            _this.container.emit(EDITOR_EVENT_INPUT_CLICK);
            _this.container.emit(EDITOR_EVENT_CLOSE_TOOL);
        });
        this.element.addEventListener('blur', function () {
            _this.container.saveSelection();
            _this.container.emit(EDITOR_EVENT_INPUT_BLUR);
        });
    };
    DivElement.prototype.paste = function (data) {
        if (this.isPasteFile(data)) {
            this.pasteFile(data);
            return;
        }
        if (this.isPasteHtml(data)) {
            this.pasteHtml(data);
            return;
        }
        var value = data.getData('text');
        if (!value) {
            return;
        }
        this.insert({ type: EditorBlockType.AddText, value: value });
    };
    DivElement.prototype.isPasteFile = function (data) {
        return data.types.length > 0 && data.types[0] === 'Files';
    };
    DivElement.prototype.isPasteHtml = function (data) {
        return data.types.length > 1 && data.types[1] === 'text/html';
    };
    DivElement.prototype.pasteFile = function (data) {
        var _this = this;
        var _loop_1 = function (i) {
            var item = data.files[i];
            var fileType = EditorHelper.fileType(item);
            this_1.container.option.upload(item, fileType, function (res) {
                _this.insert({ type: 'add' + fileType[0].toUpperCase() + fileType.substring(1), value: res.url,
                    title: res.title, size: res.size });
            }, function () { });
        };
        var this_1 = this;
        for (var i = 0; i < data.files.length; i++) {
            _loop_1(i);
        }
    };
    DivElement.prototype.pasteHtml = function (data) {
        var value = data.getData(data.types[1]);
        if (!value) {
            return '';
        }
        this.insert({ type: EditorBlockType.AddRaw, value: value });
    };
    DivElement.prototype.moveTableCol = function (node) {
        var table = node.closest('table');
        if (!table) {
            return;
        }
        var base = this.element.getBoundingClientRect();
        var rect = table.getBoundingClientRect();
        var nodeRect = node.getBoundingClientRect();
        var x = nodeRect.x + nodeRect.width - base.x;
        this.container.emit(EDITOR_EVENT_SHOW_COLUMN_TOOL, {
            x: x,
            y: table.offsetTop,
            width: 0,
            height: rect.height,
        }, function (data) {
            var cellIndex = node.cellIndex + node.colSpan;
            var pre = (data.x - x) * 100 / rect.width;
            for (var i = 0; i < table.rows.length; i++) {
                var tr = table.rows[i];
                for (var j = 0; j < tr.cells.length; j++) {
                    var cell = tr.cells[j];
                    if (cell.cellIndex + cell.colSpan === cellIndex) {
                        cell.style.width = parseFloat(cell.style.width.replace('%', '')) + pre + '%';
                        var next = tr.cells[j + 1];
                        next.style.width = parseFloat(next.style.width.replace('%', '')) - pre + '%';
                    }
                }
            }
        });
    };
    DivElement.prototype.updateNode = function (node, data) {
        if (data.type === EditorBlockType.NodeResize) {
            var bound = data;
            node.style.width = bound.width + 'px';
            node.style.height = bound.height + 'px';
        }
    };
    /**
     * 遍历选中的所有元素，最末端的元素，无子元素
     * @param range
     * @param cb
     */
    DivElement.prototype.eachRange = function (range, cb) {
        var begin = range.startContainer;
        var end = range.endContainer;
        if (cb(begin) === false || end === begin) {
            return;
        }
        var current = begin;
        while (current !== end) {
            var next = this.nextNode(current);
            if (!next) {
                break;
            }
            if (next === end) {
                cb(next);
                break;
            }
            while (next.hasChildNodes()) {
                next = next.firstChild;
                if (next === end) {
                    break;
                }
            }
            if (cb(next) === false) {
                break;
            }
            current = next;
        }
    };
    /**
     * 遍历选中的所有元素，最顶端的元素，元素直接无交集
     * @param range
     * @param cb
     * @returns
     */
    DivElement.prototype.eachTopRange = function (range, cb) {
        var begin = range.startContainer;
        var end = range.endContainer;
        if (cb(begin) === false || end === begin) {
            return;
        }
        var beginParents = [];
        this.eachParentNode(begin, function (node) {
            beginParents.push(node);
        });
        var endParents = [];
        this.eachParentNode(end, function (node) {
            endParents.push(node);
        });
        var current = begin;
        var _loop_2 = function () {
            var next = this_2.nextNode(current);
            if (!next) {
                return { value: void 0 };
            }
            if (next === end) {
                return "break";
            }
            this_2.eachParentNode(next, function (n) {
                if (beginParents.indexOf(n) >= 0) {
                    return false;
                }
                if (endParents.indexOf(n) >= 0) {
                    return false;
                }
                next = n;
            });
            if (beginParents.indexOf(next) >= 0) {
                current = next;
                return "continue";
            }
            var i = endParents.indexOf(next);
            if (i === 0) {
                return "break";
            }
            else if (i > 0) {
                while (next.hasChildNodes()) {
                    next = next.childNodes[0];
                    if (endParents.indexOf(next) <= 0) {
                        break;
                    }
                }
            }
            if (next !== end && cb(next) === false) {
                return "break";
            }
            current = next;
        };
        var this_2 = this;
        while (current !== end) {
            var state_1 = _loop_2();
            if (typeof state_1 === "object")
                return state_1.value;
            if (state_1 === "break")
                break;
        }
        cb(end);
    };
    DivElement.prototype.insertElement = function (node, range) {
        this.insertToElement(range.startContainer, range.startOffset, node);
    };
    DivElement.prototype.insertToElement = function (current, offset) {
        var items = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            items[_i - 2] = arguments[_i];
        }
        var isText = current instanceof Text;
        if (offset < 1) {
            if (isText) {
                this.insertBefore.apply(this, __spreadArray([current], items, false));
                return;
            }
            this.insertFirst.apply(this, __spreadArray([current], items, false));
            return;
        }
        var max = isText ? current.length : current.childNodes.length;
        if (offset >= max) {
            if (isText) {
                this.insertAfter.apply(this, __spreadArray([current], items, false));
                return;
            }
            this.insertLast.apply(this, __spreadArray([current], items, false));
            return;
        }
        if (isText) {
            this.insertBefore.apply(this, __spreadArray([current.splitText(offset)], items, false));
            return;
        }
        this.insertBefore.apply(this, __spreadArray([current.childNodes[offset]], items, false));
    };
    /**
     * 在内部前面添加子节点
     * @param current
     * @param items
     */
    DivElement.prototype.insertFirst = function (current) {
        var items = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            items[_i - 1] = arguments[_i];
        }
        if (current.childNodes.length < 1) {
            this.insertLast.apply(this, __spreadArray([current], items, false));
            return;
        }
        this.insertBefore.apply(this, __spreadArray([current.childNodes[0]], items, false));
    };
    /**
     * 在子节点最后添加元素
     * @param current
     * @param items
     */
    DivElement.prototype.insertLast = function (current) {
        var items = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            items[_i - 1] = arguments[_i];
        }
        for (var _a = 0, items_6 = items; _a < items_6.length; _a++) {
            var item = items_6[_a];
            current.appendChild(item);
        }
    };
    /**
     * 在元素之前添加兄弟节点
     * @param current
     * @param items
     */
    DivElement.prototype.insertBefore = function (current) {
        var items = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            items[_i - 1] = arguments[_i];
        }
        var parent = current.parentNode;
        for (var _a = 0, items_7 = items; _a < items_7.length; _a++) {
            var item = items_7[_a];
            parent.insertBefore(item, current);
        }
    };
    /**
     * 在元素之后添加兄弟节点
     * @param current
     * @param items
     * @returns
     */
    DivElement.prototype.insertAfter = function (current) {
        var items = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            items[_i - 1] = arguments[_i];
        }
        if (current.nextSibling) {
            this.insertBefore.apply(this, __spreadArray([current.nextSibling], items, false));
            return;
        }
        this.insertLast.apply(this, __spreadArray([current.parentNode], items, false));
    };
    DivElement.prototype.insertToChildIndex = function (newEle, parent, index) {
        if (parent.childNodes.length <= index) {
            parent.appendChild(newEle);
            return;
        }
        parent.insertBefore(newEle, parent.childNodes[index]);
    };
    DivElement.prototype.removeRange = function (range) {
        var _this = this;
        if (range.startContainer === range.endContainer) {
            if (range.startOffset === range.endOffset) {
                return;
            }
            if (range.startContainer instanceof Text) {
                var text = range.startContainer.textContent;
                range.startContainer.textContent = text.substring(0, range.startOffset) + text.substring(range.endOffset);
                return;
            }
            for (var i = range.endOffset; i >= range.startOffset; i--) {
                range.startContainer.removeChild(range.startContainer.childNodes[i]);
            }
            return;
        }
        var beginParentItems = [];
        this.eachParentNode(range.startContainer, function (node) {
            beginParentItems.push(node);
        });
        var endParentItems = [];
        this.eachParentNode(range.endContainer, function (node) {
            var i = beginParentItems.indexOf(node);
            if (i < 0) {
                endParentItems.push(node);
                return;
            }
            beginParentItems.splice(i, beginParentItems.length - i);
            return false;
        });
        var max = Math.max(beginParentItems.length, endParentItems.length);
        var _loop_3 = function (i) {
            var begin = beginParentItems.length - i;
            var end = endParentItems.length - i;
            var beginNode = begin >= 0 ? beginParentItems[begin] : undefined;
            var endNode = end >= 0 ? endParentItems[end] : undefined;
            if (beginNode) {
                this_3.eachNextBrother(beginNode, function (n) {
                    if (!n || n === beginNode || n === endNode) {
                        return;
                    }
                    _this.removeNode(n);
                }, endNode);
            }
            if (endNode && (!beginNode || endNode.parentNode !== beginNode.parentNode)) {
                this_3.eachBrother(endNode, function (n) {
                    if (n === endNode) {
                        return false;
                    }
                    if (n === beginNode) {
                        return;
                    }
                    _this.removeNode(n);
                }, false);
            }
        };
        var this_3 = this;
        for (var i = 1; i <= max; i++) {
            _loop_3(i);
        }
        if (range.startContainer instanceof Text) {
            var text = range.startContainer.textContent;
            range.startContainer.textContent = text.substring(0, range.startOffset);
        }
        else {
            for (var i = range.startContainer.childNodes.length - 1; i >= range.startOffset; i--) {
                range.startContainer.removeChild(range.startContainer.childNodes[i]);
            }
        }
        if (range.endContainer instanceof Text) {
            var text = range.endContainer.textContent;
            range.endContainer.textContent = text.substring(range.endOffset);
        }
        else {
            for (var i = range.endOffset - 1; i >= 0; i--) {
                range.endContainer.removeChild(range.endContainer.childNodes[i]);
            }
        }
        return;
    };
    /**
     * 删除节点
     * @param node
     * @returns
     */
    DivElement.prototype.removeNode = function (node) {
        if (!node.parentNode) {
            return;
        }
        node.parentNode.removeChild(node);
    };
    DivElement.prototype.copySelectedNode = function (range) {
        if (range.startContainer === range.endContainer) {
            if (range.startOffset === range.endOffset) {
                return [];
            }
            return this.copyRangeNode(range.startContainer, range.startOffset, range.endOffset);
        }
        var beginParentItems = [];
        this.eachParentNode(range.startContainer, function (node) {
            beginParentItems.push(node);
        });
        var endParentItems = [];
        this.eachParentNode(range.endContainer, function (node) {
            var i = beginParentItems.indexOf(node);
            if (i < 0) {
                endParentItems.push(node);
                return;
            }
            beginParentItems.splice(i, beginParentItems.length - i);
            return false;
        });
        var max = Math.max(beginParentItems.length, endParentItems.length);
        var items = [];
        var lastBegin;
        var lastEnd;
        var _loop_4 = function (i) {
            var begin = beginParentItems.length - i;
            var end = endParentItems.length - i;
            var beginNode = begin >= 0 ? beginParentItems[begin] : undefined;
            var endNode = end >= 0 ? endParentItems[end] : undefined;
            if (beginNode) {
                this_4.eachNextBrother(beginNode, function (n) {
                    var cloneN = n.cloneNode(n === beginNode || n === endNode);
                    if (i < 1) {
                        items.push(cloneN);
                    }
                    else {
                        lastBegin.appendChild(cloneN);
                    }
                    if (n === beginNode) {
                        lastBegin = cloneN;
                    }
                    if (n === endNode) {
                        lastEnd = cloneN;
                        return false;
                    }
                }, endNode);
            }
            if (endNode && (!beginNode || endNode.parentNode !== beginNode.parentNode)) {
                this_4.eachBrother(endNode, function (n) {
                    var cloneN = n.cloneNode(n === endNode);
                    if (i < 1) {
                        items.push(cloneN);
                    }
                    else {
                        lastEnd.appendChild(cloneN);
                    }
                    if (n === endNode) {
                        lastEnd = cloneN;
                        return false;
                    }
                }, false);
            }
        };
        var this_4 = this;
        for (var i = 1; i <= max; i++) {
            _loop_4(i);
        }
        if (!lastBegin) {
            items = [].concat(this.copyRangeNode(range.startContainer, range.startOffset), items);
        }
        else {
            this.insertLast.apply(this, __spreadArray([lastBegin], this.copyRangeNode(range.startContainer, range.startOffset), false));
        }
        if (!lastEnd) {
            items.push.apply(items, this.copyRangeNode(range.endContainer, 0, range.endOffset));
        }
        else {
            this.insertLast.apply(this, __spreadArray([lastEnd], this.copyRangeNode(range.endContainer, 0, range.endOffset), false));
        }
    };
    DivElement.prototype.copyRangeNode = function (current, start, end) {
        if (current instanceof Text) {
            return [new Text(current.textContent.substring(start, end))];
        }
        var items = [];
        for (var i = start; i < current.childNodes.length; i++) {
            if (end && i > end) {
                return;
            }
            items.push(current.childNodes[i].cloneNode(true));
        }
        return items;
    };
    DivElement.prototype.indexOfNode = function (items, find) {
        for (var i = 0; i < items.length; i++) {
            if (items[i] === find) {
                return i;
            }
        }
        return -1;
    };
    /**
     * 遍历兄弟节点，包含自身
     * @param node
     * @param cb
     * @param isNext
     * @returns
     */
    DivElement.prototype.eachBrother = function (node, cb, isNext) {
        if (isNext === void 0) { isNext = true; }
        if (!node.parentNode) {
            return;
        }
        var found = isNext;
        var parent = node.parentNode;
        for (var i = parent.children.length - 1; i >= 0; i--) {
            var item = parent.children[i];
            if (item === node) {
                if (cb(item) === false) {
                    break;
                }
                if (isNext) {
                    break;
                }
                found = true;
            }
            if (found && cb(item) === false) {
                break;
            }
        }
    };
    DivElement.prototype.eachNextBrother = function (node, cb, end) {
        if (!node.parentNode) {
            return;
        }
        var parent = node.parentNode;
        var j = end ? this.indexOfNode(parent.childNodes, end) : -1;
        var i = j < 0 ? parent.childNodes.length - 1 : j;
        for (; i >= 0; i--) {
            var item = parent.children[i];
            if (item === node) {
                cb(item);
                break;
            }
            if (cb(item) === false) {
                break;
            }
        }
    };
    DivElement.prototype.eachBlockNext = function (current, offset, cb) {
        if (current === this.element) {
            return;
        }
        if (offset < 1) {
            cb(current);
        }
        else if (current instanceof Text && current.length > offset) {
            cb(current.splitText(offset));
        }
        var node = current;
        while (true) {
            if (!node.nextSibling) {
                if (this.element === node.parentNode || this.isBlockNode(node.parentNode)) {
                    break;
                }
                node = node.parentNode;
                continue;
            }
            node = node.nextSibling;
            if (node.nodeName === 'BR' || this.isBlockNode(node)) {
                break;
            }
            cb(node);
        }
    };
    DivElement.prototype.isBlockNode = function (node) {
        return node.nodeName === 'P' || node.nodeName === 'DIV';
    };
    /**
     * 判断当前是否是在某一个特殊的范围内
     * @param range
     * @returns
     */
    DivElement.prototype.isInBlock = function (range) {
        var linkTag = ['A'];
        var tableTag = ['TABLE', 'TD', 'TR', 'TH'];
        var event;
        this.eachParentNode(range.startContainer, function (node) {
            if (linkTag.indexOf(node.nodeName) >= 0) {
                event = EDITOR_EVENT_SHOW_LINK_TOOL;
                return false;
            }
            if (tableTag.indexOf(node.nodeName) >= 0) {
                event = EDITOR_EVENT_SHOW_TABLE_TOOL;
                return false;
            }
        });
        if (event) {
            this.container.emit(event, this.getNodeOffset(range.startContainer));
        }
        return !!event;
    };
    /**
     * 获取当前作用的样式
     * @param node
     * @returns
     */
    DivElement.prototype.getNodeStyle = function (node) {
        var styleTag = ['B', 'EM', 'I', 'STRONG'];
        var items = [];
        this.eachParentNode(node, function (cur) {
            if (styleTag.indexOf(cur.nodeName) >= 0) {
                items.push(cur.nodeName);
            }
        });
        return items;
    };
    /**
     * 向上遍历父级
     * @param node
     * @param cb 包含自身
     */
    DivElement.prototype.eachParentNode = function (node, cb) {
        var current = node;
        while (true) {
            if (current === this.element) {
                break;
            }
            var res = cb(current);
            if (res === false) {
                break;
            }
            if (res instanceof Node) {
                current = res;
            }
            if (!current) {
                break;
            }
            current = current.parentNode;
        }
    };
    /**
     * 循环遍历选中项的父元素
     * @param range
     * @param cb 返回 true中断某一个子元素的父级查找， 返回false 中断整个查找
     */
    DivElement.prototype.eachRangeParentNode = function (range, cb) {
        var _this = this;
        var exist = [];
        this.eachRange(range, function (node) {
            var isEnd = false;
            _this.eachParentNode(node, function (cur) {
                if (exist.indexOf(cur) >= 0) {
                    return false;
                }
                var res = cb(cur);
                if (typeof res !== 'boolean') {
                    return res;
                }
                if (res === false) {
                    isEnd = true;
                }
                return false;
            });
            if (isEnd) {
                return false;
            }
        });
    };
    /**
     * 获取下一个相邻的元素，不判断最小子元素
     * @param node
     * @returns
     */
    DivElement.prototype.nextNode = function (node) {
        if (node.nextSibling) {
            return node.nextSibling;
        }
        if (node.parentNode === this.element) {
            return undefined;
        }
        return this.nextNode(node.parentNode);
    };
    DivElement.prototype.splitNodeRange = function (node, begin, end) {
        var _a;
        if (end === void 0) { end = -1; }
        if (typeof begin === 'object') {
            _a = this.getNodeRange(node, begin), begin = _a[0], end = _a[1];
        }
        if (begin === end) {
            return [];
        }
        if (node instanceof Text) {
            var len = node.length;
            if (begin > 0) {
                node = node.splitText(begin);
            }
            if (end > begin && end > 0 && end < len - 1) {
                node.splitText(end - begin);
            }
            return [node];
        }
        var count = end > begin && end > 0 && end < node.childNodes.length ? end + 1 : node.childNodes.length;
        var i = begin > 0 ? begin : 0;
        if (i <= 0 && count >= node.childNodes.length) {
            return [node];
        }
        var items = [];
        for (; i < count; i++) {
            items.push(node.childNodes[i]);
        }
        return items;
    };
    /**
     * 获取元素在兄弟中排第几
     * @param node
     * @returns
     */
    DivElement.prototype.getNodeIndex = function (node) {
        if (!node.parentNode) {
            return -1;
        }
        var parent = node.parentNode;
        for (var i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes[i] === node) {
                return i;
            }
        }
        return -1;
    };
    DivElement.prototype.getNodeRange = function (node, range) {
        var begin = node === range.startContainer ? range.startOffset : 0;
        var end = node === range.endContainer ? range.endOffset : -1;
        return [begin, end];
    };
    DivElement.prototype.getNodeOffset = function (node) {
        if (node.nodeType !== 1) {
            node = node.parentNode;
        }
        if (node === this.element) {
            var style = getComputedStyle(this.element);
            return {
                x: parseFloat(style.getPropertyValue('padding-left')),
                y: parseFloat(style.getPropertyValue('padding-top')),
            };
        }
        // rect = elem.getBoundingClientRect();
        // win = elem.ownerDocument.defaultView;
        // return {
        // 	    top: rect.top + win.pageYOffset,
        // 	    left: rect.left + win.pageXOffset
        // };
        return {
            y: node.offsetTop,
            x: node.offsetLeft
        };
    };
    DivElement.prototype.getNodeBound = function (node) {
        if (node.nodeType !== 1) {
            node = node.parentNode;
        }
        if (node === this.element) {
            var style = getComputedStyle(this.element);
            return {
                x: parseFloat(style.getPropertyValue('padding-left')),
                y: parseFloat(style.getPropertyValue('padding-top')),
                width: 0,
                height: 0,
            };
        }
        var ele = node;
        var rect = ele.getBoundingClientRect();
        return {
            y: ele.offsetTop,
            x: ele.offsetLeft,
            width: rect.width,
            height: rect.height
        };
    };
    DivElement.prototype.isEndNode = function (node, offset) {
        if (node instanceof Text) {
            return node.length <= offset;
        }
        if (node.childNodes.length < 1) {
            return true;
        }
        if (node.childNodes.length == 1 && node.childNodes[0].nodeName === 'BR') {
            return true;
        }
        return false;
    };
    /**
     * 未选中状态
     * @param range
     * @returns
     */
    DivElement.prototype.isEmptyRange = function (range) {
        return range.startContainer === range.endContainer && range.startOffset === range.endOffset;
    };
    DivElement.prototype.isEmptyLine = function (range) {
        if (range.startOffset !== range.endOffset || range.startOffset > 0) {
            return false;
        }
        if (range.startContainer !== range.endContainer) {
            return false;
        }
        return this.isEmptyLineNode(range.startContainer);
    };
    /**
     * 判断父级是否只有这一个子节点
     * @param node
     * @returns
     */
    DivElement.prototype.isOnlyNode = function (node) {
        var parent = node.parentNode;
        if (!parent) {
            return false;
        }
        for (var i = 0; i < parent.childNodes.length; i++) {
            var element = parent.childNodes[i];
            if (element !== node && element.nodeName !== 'BR') {
                return false;
            }
        }
        return true;
    };
    DivElement.prototype.isEmptyLineNode = function (node) {
        if (node.nodeType !== 1) {
            return false;
        }
        for (var i = 0; i < node.childNodes.length; i++) {
            var element = node.childNodes[i];
            if (this.isBlockNode(element)) {
                if (!this.isEmptyLineNode(element)) {
                    return false;
                }
                continue;
            }
            if (element.nodeName !== 'BR') {
                return false;
            }
        }
        return true;
    };
    return DivElement;
}());
var EDITOR_EVENT_INPUT_KEYDOWN = 'input.keydown';
var EDITOR_EVENT_INPUT_BLUR = 'input.blur';
var EDITOR_EVENT_INPUT_CLICK = 'input.click';
var EDITOR_EVENT_MOUSE_UP = 'mouse.up';
var EDITOR_EVENT_MOUSE_MOVE = 'mouse.move';
var EDITOR_EVENT_EDITOR_CHANGE = 'change';
var EDITOR_EVENT_EDITOR_READY = 'ready';
var EDITOR_EVENT_EDITOR_DESTORY = 'destroy';
var EDITOR_EVENT_EDITOR_AUTO_SAVE = 'auto_save'; // 自动保存跟内容变化不一样，自动保存步骤少于内容变化
var EDITOR_EVENT_SELECTION_CHANGE = 'selection_change';
var EDITOR_EVENT_UNDO_CHANGE = 'undo';
var EDITOR_EVENT_SHOW_ADD_TOOL = 'tool.add';
var EDITOR_EVENT_SHOW_LINE_BREAK_TOOL = 'tool.line.break';
var EDITOR_EVENT_SHOW_IMAGE_TOOL = 'tool.image';
var EDITOR_EVENT_SHOW_COLUMN_TOOL = 'tool.column';
var EDITOR_EVENT_SHOW_LINK_TOOL = 'tool.link';
var EDITOR_EVENT_SHOW_TABLE_TOOL = 'tool.table';
var EDITOR_EVENT_CLOSE_TOOL = 'tool.flow.close';
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.listeners = [];
    }
    EventEmitter.prototype.on = function (target, type, listener) {
        target.addEventListener(type, listener);
        this.listeners.push({ target: target, type: type, listener: listener });
        return this;
    };
    EventEmitter.prototype.off = function (target, type) {
        for (var i = this.listeners.length - 1; i >= 0; i--) {
            var item = this.listeners[i];
            if (item.target !== target) {
                continue;
            }
            if (type && type !== item.type) {
                continue;
            }
            this.offListener(item);
            this.listeners.splice(i, 1);
        }
        return this;
    };
    EventEmitter.prototype.clear = function () {
        var items = this.listeners;
        this.listeners = [];
        for (var _i = 0, items_8 = items; _i < items_8.length; _i++) {
            var item = items_8[_i];
            this.offListener(item);
        }
        return this;
    };
    EventEmitter.prototype.offListener = function (item) {
        if (!item || !item.target) {
            return;
        }
        item.target.removeEventListener(item.type, item.listener);
    };
    return EventEmitter;
}());
var EditorBlockType;
(function (EditorBlockType) {
    EditorBlockType["AddLineBreak"] = "addLineBreak";
    EditorBlockType["AddHr"] = "addHr";
    EditorBlockType["AddText"] = "addText";
    EditorBlockType["AddRaw"] = "addRaw";
    EditorBlockType["AddImage"] = "addImage";
    EditorBlockType["AddLink"] = "addLink";
    EditorBlockType["AddTable"] = "addTable";
    EditorBlockType["AddVideo"] = "addVideo";
    EditorBlockType["AddFile"] = "addFile";
    EditorBlockType["AddCode"] = "addCode";
    EditorBlockType["H"] = "h";
    EditorBlockType["Bold"] = "bold";
    EditorBlockType["Italic"] = "italic";
    EditorBlockType["Underline"] = "underline";
    EditorBlockType["Strike"] = "strike";
    EditorBlockType["Wavyline"] = "wavyline";
    EditorBlockType["Dashed"] = "dashed";
    EditorBlockType["Sub"] = "sub";
    EditorBlockType["Sup"] = "sup";
    EditorBlockType["FontSize"] = "fontSize";
    EditorBlockType["FontFamily"] = "fontFamily";
    EditorBlockType["Background"] = "background";
    EditorBlockType["Foreground"] = "foreground";
    EditorBlockType["ClearStyle"] = "clearStyle";
    EditorBlockType["Align"] = "align";
    EditorBlockType["List"] = "list";
    EditorBlockType["Blockquote"] = "blockquote";
    EditorBlockType["Thead"] = "thead";
    EditorBlockType["TFoot"] = "tfoot";
    EditorBlockType["DeleteTable"] = "delTable";
    EditorBlockType["RowSpan"] = "rowSpan";
    EditorBlockType["ColSpan"] = "colSpan";
    EditorBlockType["OpenLink"] = "openLink";
    EditorBlockType["Indent"] = "indent";
    EditorBlockType["Outdent"] = "outdent";
    EditorBlockType["NodeResize"] = "nodeResize";
    EditorBlockType["NodeMove"] = "nodeMove";
})(EditorBlockType || (EditorBlockType = {}));
var EDITOR_CLOSE_TOOL = 'close';
var EDITOR_ADD_TOOL = 'add';
var EDITOR_ENTER_TOOL = 'enter';
var EDITOR_UNDO_TOOL = 'undo';
var EDITOR_REDO_TOOL = 'redo';
var EDITOR_MORE_TOOL = 'more';
var EDITOR_FULL_SCREEN_TOOL = 'full-screen';
var EDITOR_CODE_TOOL = 'code';
var EDITOR_IMAGE_TOOL = 'image_edit';
var EDITOR_TABLE_TOOL = 'table_edit';
var EDITOR_VIDEO_TOOL = 'video_edit';
var EDITOR_LINK_TOOL = 'link_edit';
var EditorModules = [
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
        handler: function (editor) {
            editor.undo();
        }
    },
    {
        name: EDITOR_REDO_TOOL,
        icon: 'fa-redo',
        label: 'Redo',
        hotKey: 'Ctrl+Shift+Z',
        handler: function (editor) {
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
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.AddLineBreak });
        }
    },
    // 文字处理
    {
        name: 'head',
        icon: 'fa-heading',
        label: 'H1-H6',
        parent: 'text',
        modal: new EditorDropdownComponent(true),
        handler: function (editor, _, data) {
            editor.insert(__assign(__assign({}, data), { type: EditorBlockType.H }));
        },
    },
    {
        name: 'bold',
        icon: 'fa-bold',
        label: 'Font Bold',
        parent: 'text',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Bold });
        },
    },
    {
        name: 'italic',
        icon: 'fa-italic',
        label: 'Font Italic',
        parent: 'text',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Italic });
        },
    },
    {
        name: 'underline',
        icon: 'fa-underline',
        label: 'Add Underline',
        parent: 'text',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Underline });
        },
    },
    {
        name: 'wavyline',
        icon: 'fa-wavyline',
        label: 'Add Wavyline',
        parent: 'text',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Wavyline });
        },
    },
    {
        name: 'dashed',
        icon: 'fa-dashed',
        label: '下标加点',
        parent: 'text',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Dashed });
        },
    },
    {
        name: 'strike',
        icon: 'fa-strikethrough',
        label: '画线',
        parent: 'text',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Strike });
        },
    },
    {
        name: 'sub',
        icon: 'fa-subscript',
        label: '下标',
        parent: 'text',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Sub });
        },
    },
    {
        name: 'sup',
        icon: 'fa-superscript',
        label: '上标',
        parent: 'text',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Sub });
        },
    },
    {
        name: 'fontsize',
        icon: 'fa-pen-nib',
        label: 'Font Size',
        parent: 'text',
        modal: new EditorDropdownComponent,
        handler: function (editor, _, data) {
            editor.insert(__assign(__assign({}, data), { type: EditorBlockType.FontSize }));
        },
    },
    {
        name: 'font',
        icon: 'fa-font',
        label: 'Font Family',
        parent: 'text',
        modal: new EditorDropdownComponent,
        handler: function (editor, _, data) {
            editor.insert(__assign(__assign({}, data), { type: EditorBlockType.FontFamily }));
        },
    },
    {
        name: 'foreground',
        icon: 'fa-broom',
        label: 'Font Color',
        parent: 'text',
        modal: new EditorColorComponent,
        handler: function (editor, _, data) {
            editor.insert(__assign(__assign({}, data), { type: EditorBlockType.Foreground }));
        },
    },
    {
        name: 'background',
        icon: 'fa-fill',
        label: 'Background',
        parent: 'text',
        modal: new EditorColorComponent,
        handler: function (editor, _, data) {
            editor.insert(__assign(__assign({}, data), { type: EditorBlockType.Background }));
        },
    },
    {
        name: 'clear',
        icon: 'fa-tint-slash',
        label: 'Clear Style',
        parent: 'text',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.ClearStyle });
        },
    },
    // 段落处理
    {
        name: 'align-left',
        icon: 'fa-align-left',
        label: 'Algin Left',
        parent: 'paragraph',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Align, value: 'left' });
        },
    },
    {
        name: 'align-center',
        icon: 'fa-align-center',
        label: 'Algin Center',
        parent: 'paragraph',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Align, value: 'center' });
        },
    },
    {
        name: 'align-right',
        icon: 'fa-align-right',
        label: 'Algin Right',
        parent: 'paragraph',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Align, value: 'right' });
        },
    },
    {
        name: 'align-justify',
        icon: 'fa-align-justify',
        label: 'Algin Justify',
        parent: 'paragraph',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Align, value: '' });
        },
    },
    {
        name: 'list',
        icon: 'fa-list',
        label: 'As List',
        parent: 'paragraph',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.List });
        },
    },
    {
        name: 'indent',
        icon: 'fa-indent',
        label: 'Line Indent',
        parent: 'paragraph',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Indent });
        },
    },
    {
        name: 'outdent',
        icon: 'fa-outdent',
        label: 'Line Outdent',
        parent: 'paragraph',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Outdent });
        },
    },
    {
        name: 'blockquote',
        icon: 'fa-quote-left',
        label: 'Add Blockquote',
        parent: 'paragraph',
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Blockquote });
        },
    },
    // 添加
    {
        name: 'link',
        icon: 'fa-link',
        label: 'Add Link',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorLinkComponent,
        handler: function (editor, range, data) {
            editor.insert(__assign({ type: EditorBlockType.AddLink }, data), range);
        },
    },
    {
        name: 'image',
        icon: 'fa-image',
        label: 'Add Image',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorImageComponent,
        handler: function (editor, range, data) {
            editor.insert(__assign({ type: EditorBlockType.AddImage }, data), range);
        },
    },
    {
        name: 'video',
        icon: 'fa-file-video',
        label: 'Add Video',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorVideoComponent,
        handler: function (editor, range, data) {
            editor.insert(__assign({ type: EditorBlockType.AddVideo }, data), range);
        },
    },
    {
        name: 'table',
        icon: 'fa-table',
        label: 'Add Table',
        parent: 'add',
        modal: new EditorTableComponent,
        handler: function (editor, range, data) {
            editor.insert(__assign({ type: EditorBlockType.AddTable }, data), range);
        },
    },
    {
        name: 'file',
        icon: 'fa-file',
        label: 'Add File',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorFileComponent,
        handler: function (editor, range, data) {
            editor.insert(__assign({ type: EditorBlockType.AddFile }, data), range);
        },
    },
    {
        name: 'code',
        icon: 'fa-code',
        label: 'Add Code',
        parent: EDITOR_ADD_TOOL,
        modal: new EditorCodeComponent,
        handler: function (editor, range, data) {
            editor.insert(__assign({ type: EditorBlockType.AddCode }, data), range);
        },
    },
    {
        name: 'line',
        icon: 'fa-minus',
        label: 'Add Line',
        parent: EDITOR_ADD_TOOL,
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.AddHr });
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
        handler: function (editor, range, data) {
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
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.Thead });
        },
    },
    {
        name: 'footer-table',
        icon: 'fa-table',
        label: '表尾',
        parent: EDITOR_TABLE_TOOL,
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.TFoot });
        },
    },
    {
        name: 'delete-table',
        icon: 'fa-trash',
        label: '删除表格',
        parent: EDITOR_TABLE_TOOL,
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.DeleteTable });
        },
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
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.ColSpan });
        },
    },
    {
        name: 'vertical-table',
        icon: 'fa-grip-vertical',
        label: '纵向合并',
        parent: EDITOR_TABLE_TOOL,
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.RowSpan });
        },
    },
    // 链接处理
    {
        name: 'open-link',
        icon: 'fa-paper-plane',
        label: '打开链接',
        parent: EDITOR_LINK_TOOL,
        handler: function (editor) {
            editor.insert({ type: EditorBlockType.OpenLink });
        },
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
var EditorOptionManager = /** @class */ (function () {
    function EditorOptionManager() {
        this.option = {
            undoCount: 10,
            blockTag: 'p',
            toolbar: {
                left: ['text', 'paragraph', 'add'],
                right: ['undo', 'redo', 'more']
            },
            uploader: {
                image: function (files, success, failure) {
                    EditorHelper.uploadFile('/ueditor.php?action=uploadimage', files, success, failure);
                },
                video: function (files, success, failure) {
                    EditorHelper.uploadFile('/ueditor.php?action=uploadvideo', files, success, failure);
                },
                file: function (files, success, failure) {
                    EditorHelper.uploadFile('/ueditor.php?action=uploadfile', files, success, failure);
                }
            }
        };
        this.moduleItems = {};
        this.push.apply(this, EditorModules);
    }
    Object.defineProperty(EditorOptionManager.prototype, "leftToolbar", {
        get: function () {
            return this.filterTool(this.option.toolbar.left);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorOptionManager.prototype, "rightToolbar", {
        get: function () {
            return this.filterTool(this.option.toolbar.right);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorOptionManager.prototype, "closeTool", {
        get: function () {
            return this.toolOnly(EDITOR_CLOSE_TOOL);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorOptionManager.prototype, "addTool", {
        get: function () {
            return this.toolOnly(EDITOR_ADD_TOOL);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorOptionManager.prototype, "enterTool", {
        get: function () {
            return this.toolOnly(EDITOR_ENTER_TOOL);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorOptionManager.prototype, "blockTag", {
        get: function () {
            return this.get('blockTag');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorOptionManager.prototype, "maxUndoCount", {
        get: function () {
            return this.get('undoCount');
        },
        enumerable: false,
        configurable: true
    });
    EditorOptionManager.prototype.set = function (key, value) {
        this.option[key] = value;
    };
    EditorOptionManager.prototype.merge = function (option) {
        var _this = this;
        for (var key in option) {
            if (Object.prototype.hasOwnProperty.call(option, key)) {
                if (typeof this.option[key] !== 'object') {
                    this.option[key] = option[key];
                }
            }
        }
        ['icons', 'uploader'].forEach(function (k) {
            if (Object.prototype.hasOwnProperty.call(option, k) && typeof option[k] === 'object') {
                _this.option[k] = _this.mergeObject(_this.option[k], option[k]);
            }
        });
        this.option.hiddenModules = this.strToArr(option.hiddenModules);
        this.option.visibleModules = this.strToArr(option.visibleModules);
        if (option.toolbar) {
            this.option.toolbar = {
                left: this.strToArr(option.toolbar.left),
                right: this.strToArr(option.toolbar.right)
            };
        }
    };
    EditorOptionManager.prototype.get = function (optionKey) {
        return this.option[optionKey];
    };
    EditorOptionManager.prototype.toolOnly = function (name) {
        return this.toTool(this.moduleItems[name]);
    };
    EditorOptionManager.prototype.tool = function () {
        var names = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            names[_i] = arguments[_i];
        }
        var items = [];
        for (var _a = 0, names_1 = names; _a < names_1.length; _a++) {
            var name_1 = names_1[_a];
            if (Object.prototype.hasOwnProperty.call(this.moduleItems, name_1) && this.isVisible(name_1)) {
                items.push(this.moduleItems[name_1]);
            }
        }
        return items;
    };
    EditorOptionManager.prototype.toolChildren = function (name) {
        var _this = this;
        var items = [];
        this.moduleMap(function (item) {
            if (item.parent == name && _this.isVisible(item.name)) {
                items.push(item);
            }
        });
        return items;
    };
    EditorOptionManager.prototype.toolToggle = function (items, active) {
        var _this = this;
        if (typeof items === 'string') {
            items = [items];
        }
        var isSystem = true;
        for (var _i = 0, items_9 = items; _i < items_9.length; _i++) {
            var item = items_9[_i];
            if (!this.isSystemTool(item)) {
                isSystem = false;
                break;
            }
        }
        var updated = [];
        if (!isSystem) {
            this.moduleMap(function (item) {
                if (items.indexOf(item.name) >= 0) {
                    if (!_this.isBoolEqual(item.actived, active)) {
                        item.actived = active;
                        updated.push(item);
                    }
                    return;
                }
                if (!item.actived || _this.isSystemTool(item)) {
                    return;
                }
                item.actived = false;
                updated.push(item);
            });
        }
        else {
            for (var _a = 0, items_10 = items; _a < items_10.length; _a++) {
                var item = items_10[_a];
                var module = this.moduleItems[item];
                if (this.isBoolEqual(module.actived, active)) {
                    continue;
                }
                module.actived = active;
                updated.push(module);
            }
        }
        if (this.toolUpdatedFn) {
            this.toolUpdatedFn(updated);
        }
    };
    EditorOptionManager.prototype.push = function () {
        var modules = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            modules[_i] = arguments[_i];
        }
        for (var _a = 0, modules_1 = modules; _a < modules_1.length; _a++) {
            var item = modules_1[_a];
            this.moduleItems[item.name] = item;
        }
    };
    EditorOptionManager.prototype.hotKeyModule = function (hotKey) {
        for (var key in this.moduleItems) {
            if (Object.prototype.hasOwnProperty.call(this.moduleItems, key) && this.moduleItems[key].hotKey == hotKey && this.isVisible(key)) {
                return this.moduleItems[key];
            }
        }
        return undefined;
    };
    EditorOptionManager.prototype.moduleMap = function (cb) {
        for (var key in this.moduleItems) {
            if (!Object.prototype.hasOwnProperty.call(this.moduleItems, key)) {
                continue;
            }
            if (cb(this.moduleItems[key]) === false) {
                return;
            }
        }
    };
    EditorOptionManager.prototype.toModule = function (module) {
        if (typeof module === 'string') {
            return this.moduleItems[module];
        }
        if (module.handler) {
            return module;
        }
        if (module.name) {
            return this.moduleItems[module.name];
        }
        return module;
    };
    EditorOptionManager.prototype.upload = function (files, type, success, failure) {
        var uploader = this.option.uploader;
        var func = typeof uploader === 'function' ? uploader : undefined;
        if (typeof uploader === 'object') {
            func = uploader[type] ? uploader[type] : uploader.file;
        }
        if (!func) {
            failure('uploader not exist');
            return;
        }
        func(files, success, failure);
    };
    EditorOptionManager.prototype.filterTool = function (items) {
        if (!items) {
            return [];
        }
        var data = [];
        for (var _i = 0, items_11 = items; _i < items_11.length; _i++) {
            var item = items_11[_i];
            if (this.isVisible(item) && Object.prototype.hasOwnProperty.call(this.moduleItems, item)) {
                data.push(this.toTool(this.moduleItems[item]));
            }
        }
        return data;
    };
    EditorOptionManager.prototype.toTool = function (item) {
        return {
            name: item.name,
            label: item.label,
            icon: this.option.icons && Object.prototype.hasOwnProperty.call(this.option.icons, item.name) ? this.option.icons[item.name] : item.icon,
        };
    };
    EditorOptionManager.prototype.isVisible = function (module) {
        if (this.option.hiddenModules && this.option.hiddenModules.indexOf(module) >= 0) {
            return false;
        }
        if (this.option.visibleModules) {
            return this.option.visibleModules.indexOf(module) >= 0;
        }
        return true;
    };
    EditorOptionManager.prototype.strToArr = function (data) {
        if (!data) {
            return undefined;
        }
        if (typeof data === 'object') {
            return data;
        }
        return data.split(' ').filter(function (i) { return !!i; });
    };
    EditorOptionManager.prototype.mergeObject = function (data, args) {
        if (!data) {
            return args;
        }
        return $.extend(true, {}, data, args);
    };
    EditorOptionManager.prototype.isBoolEqual = function (a, b) {
        if (a === true || b === true) {
            return a === b;
        }
        return false;
    };
    EditorOptionManager.prototype.isSystemTool = function (module) {
        if (typeof module === 'string') {
            module = this.moduleItems[module];
        }
        return !module.parent || module.parent === EDITOR_MORE_TOOL;
    };
    return EditorOptionManager;
}());
/**
 * markdown 模式
 */
var TextareaElement = /** @class */ (function () {
    function TextareaElement(element, container) {
        this.element = element;
        this.container = container;
        this.emitter = new EventEmitter();
        this.isComposition = false;
        this.bindEvent();
    }
    Object.defineProperty(TextareaElement.prototype, "selection", {
        get: function () {
            return {
                start: this.element.selectionStart,
                end: this.element.selectionEnd
            };
        },
        set: function (v) {
            this.element.selectionStart = v.start;
            this.element.selectionEnd = v.end;
            this.container.saveSelection();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextareaElement.prototype, "selectedValue", {
        get: function () {
            var s = this.selection;
            if (!s || s.start >= s.end) {
                return '';
            }
            return this.value.substring(s.start, s.end);
        },
        set: function (val) {
            var s = this.selection;
            var v = this.value;
            this.value = v.substring(0, s.start) + val + v.substring(s.end);
            this.selection = {
                start: s.start,
                end: s.start + val.length
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextareaElement.prototype, "value", {
        get: function () {
            return this.element.value;
        },
        set: function (v) {
            this.element.value = v;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextareaElement.prototype, "length", {
        get: function () {
            return this.value.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TextareaElement.prototype, "wordLength", {
        get: function () {
            return EditorHelper.wordLength(this.value);
        },
        enumerable: false,
        configurable: true
    });
    TextareaElement.prototype.selectAll = function () {
        this.selection = {
            start: 0,
            end: this.value.length
        };
    };
    TextareaElement.prototype.insert = function (block, range) {
        if (!range) {
            range = this.selection;
        }
        if (block.begin && block.end) {
            this.includeBlock(block.begin, block.end, range);
            return;
        }
        var type = block.type === EditorBlockType.AddRaw ? EditorBlockType.AddText : block.type;
        var func = this[type + 'Execute'];
        if (typeof func === 'function') {
            func.call(this, range, block);
            return;
        }
        throw new Error("insert type error:[".concat(block.type, "]"));
    };
    TextareaElement.prototype.focus = function () {
        this.element.focus();
    };
    TextareaElement.prototype.blur = function () {
        return this.element.blur();
    };
    //#region 外部调用的方法
    TextareaElement.prototype.addLineBreakExecute = function (range) {
        this.insertText('\n', range);
    };
    TextareaElement.prototype.indentExecute = function (range) {
        this.replaceSelectLine(function (s) {
            return s.split('\n').map(function (v) {
                return '    ' + v;
            }).join('\n');
        }, range);
    };
    TextareaElement.prototype.outdentExecute = function (range) {
        this.replaceSelectLine(function (s) {
            return s.split('\n').map(function (v) {
                if (v.length < 1) {
                    return v;
                }
                switch (v.charCodeAt(0)) {
                    case 9: // \t
                        return v.substring(1);
                    case 32: // 空格
                        return v.replace(/^\s{1,4}/, '');
                    default:
                        return v;
                }
            }).join('\n');
        }, range);
    };
    TextareaElement.prototype.addTextExecute = function (range, block) {
        var v = this.value;
        this.value = v.substring(0, range.start) + block.value + v.substring(range.end);
        this.moveCursor(range.start + (!block.cursor ? block.value.length : block.cursor));
    };
    TextareaElement.prototype.addCodeExecute = function (range, block) {
        var _a;
        var v = this.value;
        var selected = v.substring(range.start, range.end);
        var replace = '```' + block.language + '\n' + ((_a = block.value) !== null && _a !== void 0 ? _a : selected) + '\n```';
        if (range.start > 0 && v.charAt(range.start - 1) !== '\n') {
            replace = '\n' + replace;
        }
        var cursor = replace.length - 4;
        if (range.end >= v.length - 1 || v.charAt(range.end + 1) !== '\n') {
            replace += '\n';
        }
        this.value = v.substring(0, range.start) + replace + v.substring(range.end);
        this.moveCursor(range.start + cursor);
    };
    TextareaElement.prototype.addLinkExecute = function (range, block) {
        if (!block.value) {
            block.value = '';
        }
        if (block.title) {
            this.insertText("[".concat(block.title, "](").concat(block.value, ")"), range);
            return;
        }
        this.replaceSelect(function (s) {
            return "[".concat(s, "](").concat(block.value, ")");
        }, range, block.value ? block.value.length + 4 : 3);
    };
    TextareaElement.prototype.addImageExecute = function (range, block) {
        this.replaceSelect(function (s) {
            if (s.trim().length === 0 && block.title) {
                s = block.title;
            }
            return "![".concat(block.title, "](").concat(block.value, ")");
        }, range, block.title ? block.title.length + 4 : 2);
    };
    //#endregion
    TextareaElement.prototype.insertText = function (text, range, cursor) {
        var v = this.value;
        this.value = v.substring(0, range.start) + text + v.substring(range.end);
        this.moveCursor(range.start + (!cursor ? text.length : cursor));
    };
    TextareaElement.prototype.replaceSelectLine = function (cb, range) {
        var v = this.value;
        var begin = range.start;
        if (begin > 0) {
            var i = v.lastIndexOf('\n', begin);
            if (i >= 0) {
                begin = i + 1;
            }
            else {
                begin = 0;
            }
        }
        var selected = v.substring(begin, range.end);
        var replace = cb(selected);
        this.value = v.substring(0, begin) + replace + v.substring(range.end);
        this.selection = {
            start: begin,
            end: begin + replace.length
        };
        this.focus();
    };
    TextareaElement.prototype.includeBlock = function (begin, end, range) {
        this.replaceSelect(function (s) {
            return begin + s + end;
        }, range, begin.length);
    };
    TextareaElement.prototype.replaceSelect = function (cb, range, cursor, cursorBefore) {
        if (cursor === void 0) { cursor = 0; }
        if (cursorBefore === void 0) { cursorBefore = true; }
        var v = this.value;
        var selected = v.substring(range.start, range.end);
        var replace = cb(selected);
        this.value = v.substring(0, range.start) + replace + v.substring(range.end);
        this.moveCursor(range.start + (cursorBefore ? selected.length : 0) + cursor);
    };
    /**
     * 移动光标到指定位置并focus
     * @param pos
     */
    TextareaElement.prototype.moveCursor = function (pos) {
        this.selection = {
            start: pos,
            end: pos,
        };
        this.focus();
    };
    TextareaElement.prototype.bindEvent = function () {
        var _this = this;
        this.emitter.on(this.element, 'keydown', function (e) {
            _this.container.emit(EDITOR_EVENT_INPUT_KEYDOWN, e);
        })
            .on(this.element, 'keyup', function (e) {
            if (_this.isComposition) {
                return;
            }
            _this.container.saveSelection();
            _this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
        })
            .on(this.element, 'blur', function () {
            _this.container.emit(EDITOR_EVENT_INPUT_BLUR);
        })
            .on(this.element, 'paste', function (e) {
            e.preventDefault();
            _this.paste((e.clipboardData || window.clipboardData));
        })
            .on(this.element, 'mouseup', function () {
            _this.container.saveSelection();
            _this.container.emit(EDITOR_EVENT_SELECTION_CHANGE);
        })
            .on(this.element, 'compositionstart', function () {
            _this.isComposition = true;
        })
            .on(this.element, 'compositionend', function () {
            _this.isComposition = false;
            _this.container.emit(EDITOR_EVENT_SELECTION_CHANGE);
            _this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
    };
    TextareaElement.prototype.paste = function (data) {
        if (this.isPasteFile(data)) {
            this.pasteFile(data);
            return;
        }
        var value = data.getData('text');
        if (!value) {
            return;
        }
        this.insert({ type: EditorBlockType.AddText, value: value });
    };
    TextareaElement.prototype.destroy = function () {
        this.emitter.clear();
    };
    TextareaElement.prototype.isPasteFile = function (data) {
        return data.types.length > 0 && data.types[0] === 'Files';
    };
    TextareaElement.prototype.pasteFile = function (data) {
        var _this = this;
        var _loop_5 = function (i) {
            var item = data.files[i];
            var fileType = EditorHelper.fileType(item);
            this_5.container.option.upload(item, fileType, function (res) {
                _this.insert({ type: 'add' + fileType[0].toUpperCase() + fileType.substring(1), value: res.url,
                    title: res.title, size: res.size });
            }, function () { });
        };
        var this_5 = this;
        for (var i = 0; i < data.files.length; i++) {
            _loop_5(i);
        }
    };
    return TextareaElement;
}());
var EditorHelper = /** @class */ (function () {
    function EditorHelper() {
    }
    /**
    * 计算内容的长度，排除空格符号等特殊字符
    */
    EditorHelper.wordLength = function (val) {
        if (!val) {
            return 0;
        }
        var code;
        var length = 0;
        for (var i = val.length - 1; i >= 0; i--) {
            code = val.charCodeAt(i);
            if (code < 48
                || (code > 57 && code < 65)
                || (code > 90 && code < 97)
                || (code > 122 && code < 128)
                || (code > 128 && this.OTHER_WORD_CODE.indexOf(code) >= 0)) {
                continue;
            }
            length++;
        }
        return length;
    };
    EditorHelper.css = function (node, style) {
        $(node).css(style);
    };
    EditorHelper.height = function (node) {
        return $(node).height();
    };
    EditorHelper.nodeClass = function (obj) {
        var items = [];
        $.each(obj, function (i, v) {
            if (typeof i !== 'number') {
                v = v ? i : '';
            }
            if (v) {
                items.push(v);
            }
        });
        return items.join(' ');
    };
    EditorHelper.nodeStyle = function (obj) {
        if (!obj) {
            return '';
        }
        var items = [];
        $.each(obj, function (i, v) {
            if (typeof i !== 'number') {
                if (i !== 'z-index' && typeof v === 'number') {
                    v = v + 'px';
                }
                v = "".concat(i.toString(), ":").concat(v, ";");
            }
            if (v) {
                items.push(v);
            }
        });
        return items.join('');
    };
    EditorHelper.modalInputBind = function (element, confirmFn) {
        element.on('change', 'input,textarea,select', function () {
            var $this = $(this);
            if ($this.attr('type') === 'file') {
                return;
            }
            var val = $this.val();
            $this.parent().toggleClass('input-not-empty', !!val);
        }).on('click', '.check-input', function () {
            var $this = $(this);
            var val = !$this.hasClass('fa-check-square');
            EditorHelper.toggleCheck($this, val);
        }).on('click', '.btn', function () {
            confirmFn(EditorHelper.modalInputData(element));
        });
    };
    EditorHelper.toggleCheck = function (element, val) {
        if (val === void 0) { val = false; }
        element.toggleClass('fa-check-square', !!val).toggleClass('fa-square', !val);
    };
    EditorHelper.modalInputData = function (element, data) {
        var res = {};
        var isSet = !!data;
        element.find('input,textarea,select,.check-input').each(function () {
            var $this = $(this);
            if ($this.attr('type') === 'file') {
                return;
            }
            var name = $this.attr('name');
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
    };
    EditorHelper.modalFileUpload = function (element, uploadFn) {
        var _this = this;
        element.on('change', 'input[type=file]', function (e) {
            uploadFn(e.target.files);
        }).on('dragover', function (e) {
            var transfer = _this.getTransfer(e);
            if (!_this.haveFiles(transfer.types)) {
                return;
            }
            transfer.dropEffect = 'copy';
            _this.preventAndStop(e);
        }).on('dragleave', function (e) {
            if (e.currentTarget === element[0]) {
                return;
            }
            _this.preventAndStop(e);
        }).on('drop', function (e) {
            var transfer = _this.getTransfer(e);
            if (!transfer) {
                return;
            }
            _this.preventAndStop(e);
            uploadFn(transfer.files);
        });
    };
    EditorHelper.uploadFile = function (url, files, success, failure, name) {
        if (name === void 0) { name = 'upfile'; }
        var form = new FormData();
        if (files instanceof File) {
            form.append(name, files);
        }
        else {
            form.append(name, files[0]);
        }
        $.ajax({
            method: 'POST',
            url: url,
            data: form,
            cache: false,
            contentType: false,
            processData: false,
            success: function (res) {
                var data = typeof res === 'string' ? JSON.parse(res) : res;
                if (data.state === 'SUCCESS') {
                    data.title = data.original;
                    success(data);
                    return;
                }
                failure(data.state);
            }
        });
    };
    EditorHelper.fileType = function (file) {
        if (file.type.indexOf('image') >= 0) {
            return 'image';
        }
        if (file.type.indexOf('video') >= 0) {
            return 'video';
        }
        return 'file';
    };
    EditorHelper.getTransfer = function (event) {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
    };
    EditorHelper.preventAndStop = function (event) {
        event.preventDefault();
        event.stopPropagation();
    };
    EditorHelper.haveFiles = function (types) {
        if (!types) {
            return false;
        }
        if (types.indexOf) {
            return types.indexOf('Files') !== -1;
        }
        else if (types.contains) {
            return types.contains('Files');
        }
        else {
            return false;
        }
    };
    EditorHelper.OTHER_WORD_CODE = [8220, 8221, 8216, 8217, 65281, 12290, 65292, 12304, 12305, 12289, 65311, 65288, 65289, 12288, 12298, 12299, 65306];
    return EditorHelper;
}());
var EditorApp = /** @class */ (function () {
    /**
    *
    */
    function EditorApp(element, option, isMarkdown) {
        if (isMarkdown === void 0) { isMarkdown = false; }
        this.isMarkdown = isMarkdown;
        this.isFullScreen = false;
        this.resizer = new EditorResizerComponent();
        this.option = new EditorOptionManager();
        if (option) {
            this.option.merge(option);
        }
        this.container = new EditorContainer(this.option);
        this.codeContainer = new EditorContainer(this.option);
        if (element.style.height) {
            this.option.set('height', element.style.height);
        }
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            this.initByInput($(element));
        }
        else {
            this.initByDiv($(element));
        }
        this.ready();
    }
    EditorApp.prototype.ready = function () {
        this.renderToolbar(this.option.leftToolbar, this.box.find('.tool-bar-top .tool-left'));
        this.renderToolbar(this.option.rightToolbar, this.box.find('.tool-bar-top .tool-right'));
        this.textbox = this.box.find('.editor-view');
        this.codebox = this.box.find('.editor-code-container');
        this.resetSize();
        this.container.ready(this.textbox[0]);
        this.codeContainer.ready(new CodeElement(this.codebox[0], this.codeContainer));
        this.subToolbar = this.box.find('.editor-tool-bar .tool-bar-bottom');
        this.flowToolbar = this.box.find('.editor-flow-tool-bar');
        this.modalContianer = this.box.find('.editor-flow-area .editor-modal-area');
        this.footerBar = this.box.find('.editor-footer');
        this.bindEvent();
        this.resizer.ready(this.modalContianer.parent());
        this.container.value = this.target.val();
        this.box.data('_instance', this);
    };
    EditorApp.prototype.tapTool = function (item, isRight, event) {
        this.container.focus();
        if (item.name === this.subParentName) {
            this.toggleSubToolbar(item.name, isRight);
            this.subParentName = '';
            return;
        }
        var next = this.container.option.toolChildren(item.name);
        if (next.length === 0) {
            this.executeModule(item, this.getOffsetPosition(event));
            return;
        }
        this.toggleSubToolbar(item.name, isRight);
    };
    EditorApp.prototype.tapFlowTool = function (item, event) {
        this.container.focus();
        if (item.name === EDITOR_CLOSE_TOOL) {
            this.toggleFlowbar(true);
            return;
        }
        var items = this.container.option.toolChildren(item.name);
        if (items.length > 0) {
            this.toggleFlowbar(__spreadArray([this.container.option.closeTool], items, true));
            return;
        }
        this.toggleFlowbar();
        this.executeModule(item, this.getOffsetPosition(event));
    };
    EditorApp.prototype.insert = function (block) {
        this.container.insert(block);
    };
    EditorApp.prototype.toggle = function (display) {
        this.box.toggle(display);
    };
    /**
     * 切换编辑器模式
     * @param isMarkdown
     * @returns
     */
    EditorApp.prototype.toggleEditor = function (isMarkdown) {
        if (typeof isMarkdown === 'undefined') {
            isMarkdown = !this.isMarkdown;
        }
        if (isMarkdown === this.isMarkdown) {
            return;
        }
        this.container.emit(EDITOR_EVENT_CLOSE_TOOL).destroy();
        this.isMarkdown = isMarkdown;
        var container = this.box.find('.editor-area');
        var textbox;
        if (!this.isMarkdown) {
            this.codeContainer = new EditorContainer(this.option);
            this.box.append(this.target);
            textbox = $("<div class=\"editor-view\" contentEditable=\"true\" spellcheck=\"false\"></div>");
            this.target.removeClass('editor-view').hide();
            container.append(textbox);
        }
        else {
            container.empty();
            container.append(this.target);
            this.target.addClass('editor-view').attr('spellcheck', 'false').show();
            textbox = this.target;
        }
        this.textbox = textbox;
        this.resetSize();
        this.container.ready(textbox[0]);
    };
    EditorApp.prototype.resetSize = function () {
        var height = this.option.get('height');
        if (height) {
            this.textbox.css({
                height: /^\d+$/.test(height) ? height + 'px' : height,
                overflow: 'auto',
            });
        }
    };
    EditorApp.prototype.executeModule = function (item, position) {
        var _this = this;
        var isCode = this.box.hasClass('editor-code-mode');
        this.modalContianer.html('');
        if (item.name === EDITOR_CODE_TOOL && !this.isMarkdown) {
            this.box.toggleClass('editor-code-mode', !isCode);
            this.option.toolToggle(EDITOR_CODE_TOOL, !isCode);
            this.container.emit(EDITOR_EVENT_CLOSE_TOOL);
            if (!isCode) {
                this.codeContainer.value = this.container.value;
            }
            return;
        }
        if (item.name === EDITOR_FULL_SCREEN_TOOL) {
            this.toggleFullScreen();
            return;
        }
        if (isCode) {
            return;
        }
        var module = this.container.option.toModule(item);
        if (!module) {
            return;
        }
        if (!module.modal) {
            this.container.execute(module);
            return;
        }
        var modal = module.modal;
        if (typeof modal.modalReady === 'function') {
            modal.modalReady(module, this.modalContianer, this.option);
        }
        modal.open({}, function (res) {
            _this.hideModal();
            _this.container.execute(module, undefined, res);
        }, position);
    };
    EditorApp.prototype.getOffsetPosition = function (event) {
        var rect = this.textbox.offset();
        if (event.currentTarget) {
            var target = $(event.currentTarget);
            if (target.hasClass('tool-item')) {
                var offset = target.offset();
                return {
                    x: offset.left - rect.left,
                    y: offset.top + target.height() - rect.top,
                };
            }
        }
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };
    EditorApp.prototype.toggleFullScreen = function () {
        this.isFullScreen = !this.isFullScreen;
    };
    EditorApp.prototype.bindEvent = function () {
        var _this = this;
        this.container.on(EDITOR_EVENT_UNDO_CHANGE, function () {
            _this.toggleTool({ name: EDITOR_UNDO_TOOL, disabled: !_this.container.canUndo }, { name: EDITOR_REDO_TOOL, disabled: !_this.container.canRedo });
        }).on(EDITOR_EVENT_SHOW_ADD_TOOL, function (y) {
            _this.resizer.close();
            _this.hideModal();
            _this.toggleFlowbar(_this.option.tool(EDITOR_ADD_TOOL), {
                x: 0,
                y: y,
            });
        }).on(EDITOR_EVENT_SHOW_LINE_BREAK_TOOL, function (p) {
            _this.resizer.close();
            _this.toggleFlowbar(_this.container.option.toolChildren(EDITOR_ENTER_TOOL), {
                x: 0,
                y: p.y,
            });
        }).on(EDITOR_EVENT_SHOW_TABLE_TOOL, function (p) {
            _this.resizer.close();
            _this.toggleFlowbar(_this.container.option.toolChildren(EDITOR_TABLE_TOOL), p);
        }).on(EDITOR_EVENT_SHOW_LINK_TOOL, function (p) {
            _this.resizer.close();
            _this.toggleFlowbar(_this.container.option.toolChildren(EDITOR_LINK_TOOL), p);
        }).on(EDITOR_EVENT_SHOW_IMAGE_TOOL, function (p, cb) {
            _this.toggleFlowbar(_this.option.toolChildren(EDITOR_IMAGE_TOOL), __assign(__assign({}, p), { y: p.y + p.height + 20 }));
            _this.resizer.openResize(p, cb);
        }).on(EDITOR_EVENT_SHOW_COLUMN_TOOL, function (p, cb) {
            _this.resizer.openHorizontalResize(p, cb);
        }).on(EDITOR_EVENT_CLOSE_TOOL, function () {
            _this.hideModal();
            _this.toggleFlowbar();
            _this.resizer.close();
        }).on(EDITOR_EVENT_EDITOR_CHANGE, function () {
            _this.footerBar.text(_this.container.wordLength + ' words');
            if (!_this.isMarkdown) {
                _this.target.val(_this.container.value).trigger('change');
            }
        });
        this.codeContainer.on(EDITOR_EVENT_EDITOR_CHANGE, function () {
            _this.container.value = _this.codeContainer.value;
            _this.container.emit(EDITOR_EVENT_EDITOR_CHANGE);
        });
        this.option.toolUpdatedFn = function (items) {
            _this.toggleTool.apply(_this, items);
        };
        var that = this;
        this.box.on('click', '.tool-item', function (e) {
            var $this = $(this);
            var module = $this.data('module');
            var parent = $this.parent();
            if (parent.is(that.flowToolbar)) {
                that.tapFlowTool(that.option.toolOnly(module), e);
                return;
            }
            that.tapTool(that.option.toolOnly(module), parent.hasClass('tool-right'), e);
        });
        $(document).on('click', function (e) {
            if ($(e.target).closest('.editor-box').is(_this.box)) {
                return;
            }
            _this.container.emit(EDITOR_EVENT_CLOSE_TOOL);
        });
        var $win = $(window).on('scroll', function () {
            var scollTop = $win.scrollTop();
            var offset = _this.box.offset();
            _this.box.toggleClass('editor-header-fixed', offset.top < scollTop && offset.top + _this.box.height() > scollTop - 80);
        });
    };
    EditorApp.prototype.hideModal = function () {
        this.modalContianer.children().removeClass('modal-visible');
    };
    EditorApp.prototype.toggleFlowbar = function (items, p) {
        if (items === true) {
            items = this.flowLastTool;
            this.flowLastTool = undefined;
        }
        if (!items || items.length < 1) {
            this.flowToolbar.hide();
            return;
        }
        // this.flowLastTool = items;
        this.renderToolbar(items, this.flowToolbar);
        if (p) {
            var offset = 0;
            var of = this.box.offset();
            if (p.x + of.left < 40) {
                offset = p.y + of.top > 40 ? -40 : 40;
                // 
            }
            this.flowToolbar.css({
                top: p.y + offset + 'px',
                left: p.x + 'px',
            });
        }
        this.flowToolbar.toggleClass('flow-tool-one', items.length === 1);
        this.flowToolbar.show();
    };
    EditorApp.prototype.toggleSubToolbar = function (parent, isRight) {
        if (isRight === void 0) { isRight = false; }
        if (this.subParentName === parent) {
            this.subToolbar.hide();
            return;
        }
        var items = this.option.toolChildren(parent);
        this.subParentName = parent;
        if (items.length < 1) {
            this.subToolbar.hide();
        }
        this.renderToolbar(items, this.subToolbar);
        this.subToolbar.toggleClass('tool-align-right', isRight);
        this.subToolbar.show();
    };
    EditorApp.prototype.toggleTool = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var maps = {};
        for (var _a = 0, items_12 = items; _a < items_12.length; _a++) {
            var item = items_12[_a];
            maps[item.name] = item;
        }
        this.box.find('.tool-item').each(function (_, ele) {
            var $this = $(ele);
            var name = $this.data('module');
            if (!name || !Object.prototype.hasOwnProperty.call(maps, name)) {
                return;
            }
            var item = maps[name];
            if (typeof item.actived === 'boolean') {
                $this.toggleClass('active', item.actived);
            }
            if (typeof item.disabled === 'boolean') {
                $this.toggleClass('disabled', item.disabled);
            }
        });
    };
    EditorApp.prototype.initByDiv = function (element) {
        this.target = $(document.createElement('textarea'));
        this.target.attr('name', element.attr('name'));
        if (element[0].nodeName === 'SCRIPT') {
            this.box = $('<div class="editor-box"></div>');
            element.before(this.box);
            this.target.val(element.html());
        }
        else {
            this.box = element;
            this.box.addClass('editor-box');
        }
        this.box.html(this.renderBase());
        if (this.isMarkdown) {
            this.target.addClass('editor-view');
            this.box.find('.editor-area').append(this.target);
        }
        else {
            this.target.hide();
            this.box.append(this.target);
        }
    };
    EditorApp.prototype.initByInput = function (element) {
        this.target = element;
        this.box = $('<div class="editor-box"></div>');
        this.box.html(this.renderBase());
        element.before(this.box);
        if (this.isMarkdown) {
            element.addClass('editor-view').show();
            this.box.find('.editor-area').append(element);
        }
        else {
            element.hide();
            this.box.append(element);
        }
    };
    EditorApp.prototype.renderBase = function () {
        var inputBox = this.isMarkdown ? '' : "<div class=\"editor-view\" contentEditable=\"true\" spellcheck=\"false\"></div>";
        return "<div class=\"editor-tool-bar\">\n        <div class=\"tool-bar-top\">\n            <div class=\"tool-left\"></div>\n            <div class=\"tool-right\"></div>\n        </div>\n        <div class=\"tool-bar-bottom\">\n        </div>\n    </div>\n    <div class=\"editor-body\">\n        <div class=\"editor-area\">\n            ".concat(inputBox, "\n        </div>\n        <div class=\"editor-flow-area\">\n            <div class=\"editor-flow-tool-bar\"></div>\n            <div class=\"editor-modal-area\"></div>\n        </div>\n        <div class=\"editor-code-container\"></div>\n    </div>\n    <div class=\"editor-footer\">0 words</div>");
    };
    EditorApp.prototype.renderToolIcon = function (item, target) {
        if (target) {
            target.toggleClass('active', !!item.actived);
            target.toggleClass('disabled', !!item.disabled);
            target.attr('title', item.label);
            target.data('module', item.name);
            target.find('i').attr('class', 'fa ' + item.icon);
            return;
        }
        var cls = '';
        if (item.actived) {
            cls += ' active';
        }
        if (item.disabled) {
            cls += ' disabled';
        }
        return "<div class=\"tool-item".concat(cls, "\" title=\"").concat(item.label, "\" data-module=\"").concat(item.name, "\">\n        <i class=\"fa ").concat(item.icon, "\"></i>\n    </div>");
    };
    EditorApp.prototype.renderToolbar = function (items, target) {
        var _this = this;
        if (!target) {
            return items.map(function (i) { return _this.renderToolIcon(i); }).join();
        }
        var i = -1;
        target.find('.tool-item').each(function (_, ele) {
            i++;
            var $this = $(ele);
            if (i >= items.length) {
                $this.remove();
                return;
            }
            _this.renderToolIcon(items[i], $this);
        });
        i++;
        if (i >= items.length) {
            return;
        }
        var html = '';
        for (; i < items.length; i++) {
            html += this.renderToolIcon(items[i]);
        }
        target.append(html);
    };
    return EditorApp;
}());
;
(function ($) {
    $.fn.editor = function (option, isMarkdown) {
        if (isMarkdown === void 0) { isMarkdown = false; }
        if (this.data('editor')) {
            return;
        }
        this.data('editor', 1);
        return new EditorApp(this[0], option, isMarkdown);
    };
})(jQuery);
