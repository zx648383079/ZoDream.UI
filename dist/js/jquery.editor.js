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
var Eve = /** @class */ (function () {
    function Eve() {
    }
    Eve.prototype.on = function (event, callback) {
        this.options['on' + event] = callback;
        return this;
    };
    Eve.prototype.hasEvent = function (event) {
        return this.options.hasOwnProperty('on' + event);
    };
    Eve.prototype.trigger = function (event) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var realEvent = 'on' + event;
        if (!this.hasEvent(event)) {
            return;
        }
        return (_a = this.options[realEvent]).call.apply(_a, __spreadArray([this], args, false));
    };
    return Eve;
}());
var EditorCodeComponent = /** @class */ (function () {
    function EditorCodeComponent() {
        this.visible = false;
        this.language = '';
        this.code = '';
    }
    EditorCodeComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\" [ngClass]=\"{'modal-visible': visible}\">\n        <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!language}\">\n            <input type=\"text\" [(ngModel)]=\"language\">\n            <label for=\"\">\u4EE3\u7801\u8BED\u8A00</label>\n        </div>\n        <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!code}\">\n            <textarea [(ngModel)]=\"code\" rows=\"10\"></textarea>\n            <label for=\"\">\u6807\u9898</label>\n        </div>\n        <div class=\"modal-action\">\n            <div class=\"btn btn-outline-primary\" (click)=\"tapConfirm()\">\u63D2\u5165</div>\n        </div>\n    </div>";
    };
    EditorCodeComponent.prototype.modalReady = function (module, parent) {
    };
    EditorCodeComponent.prototype.open = function (data, cb) {
        this.visible = true;
        this.confirmFn = cb;
    };
    EditorCodeComponent.prototype.tapConfirm = function () {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn({
                value: this.code,
                language: this.language
            });
        }
    };
    return EditorCodeComponent;
}());
var EditorColorComponent = /** @class */ (function () {
    function EditorColorComponent() {
        this.visible = false;
        this.color = '';
    }
    EditorColorComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\" [ngClass]=\"{'modal-visible': visible}\">\n        <div class=\"color-layer\">\n            <div class=\"color-picker-sv\" (touchstart)=\"touchStart($event)\" (touchmove)=\"touchMove($event)\" (touchend)=\"touchEnd($event)\" (click)=\"tapNotTouch($event)\" [ngStyle]=\"{'background-color': background}\">\n                <div class=\"color-picker-white\"></div>\n                <div class=\"color-picker-black\"></div>\n                <i [ngStyle]=\"svStyle\"></i>\n            </div>\n            <div class=\"color-picker-h\" (touchstart)=\"touchHStart($event)\" (touchmove)=\"touchHMove($event)\" (click)=\"tapHNotTouch($event)\">\n                <i [ngStyle]=\"hStyle\"></i>\n            </div>\n        </div>\n        <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!color}\">\n            <input type=\"text\" [(ngModel)]=\"color\">\n            <label for=\"\">Hex</label>\n        </div>\n        <div class=\"modal-action\">\n            <div class=\"btn btn-outline-primary\" (click)=\"tapConfirm()\">\u786E\u8BA4</div>\n        </div>\n    </div>";
    };
    EditorColorComponent.prototype.open = function (data, cb) {
        this.visible = true;
        this.confirmFn = cb;
    };
    EditorColorComponent.prototype.tapConfirm = function () {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn({
                value: this.color
            });
        }
    };
    return EditorColorComponent;
}());
var FontItems = [
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
    function EditorDropdownComponent() {
        this.visible = false;
        this.items = [];
        this.selected = '';
        this.modalStyle = {};
    }
    EditorDropdownComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\" [ngClass]=\"{'modal-visible': visible}\" [ngStyle]=\"modalStyle\">\n        <ul class=\"option-bar\">\n            <ng-container *ngFor=\"let item of items\">\n                <li [ngClass]=\"{active: item.value == selected}\" [ngStyle]=\"item.style\" (click)=\"tapConfirm(item)\">{{ item.name }}</li>\n            </ng-container>\n        </ul>\n    </div>";
    };
    EditorDropdownComponent.prototype.modalReady = function (module) {
        if (module.name === 'font') {
            this.items = FontItems.map(function (i) {
                i.style = {
                    'font-family': i.value
                };
                return i;
            });
            return;
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
            return;
        }
    };
    EditorDropdownComponent.prototype.open = function (data, cb, position) {
        this.modalStyle = position ? { left: position.x + 'px', top: position.y + 'px' } : {};
        this.visible = true;
        this.confirmFn = cb;
    };
    EditorDropdownComponent.prototype.tapConfirm = function (item) {
        this.visible = false;
        this.selected = item.value;
        if (this.confirmFn) {
            this.confirmFn({
                value: this.selected
            });
        }
    };
    return EditorDropdownComponent;
}());
var EditorFileComponent = /** @class */ (function () {
    function EditorFileComponent(
    // private uploadService: FileUploadService,
    ) {
        this.visible = false;
        this.fileName = '';
        this.isLoading = false;
    }
    EditorFileComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\" [ngClass]=\"{'modal-visible': visible, 'modal-loading': isLoading}\" appFileDrop (fileDrop)=\"uploadFiles($event)\">\n        <label class=\"drag-input\" [for]=\"fileName\">\n            \u62D6\u653E\u6587\u4EF6\n            <p>(\u6216\u70B9\u51FB)</p>\n            <input type=\"file\" [id]=\"fileName\" (change)=\"uploadFile($event)\">\n        </label>\n        <app-loading-ring></app-loading-ring>\n    </div>";
    };
    EditorFileComponent.prototype.open = function (data, cb) {
        this.visible = true;
        this.confirmFn = cb;
    };
    EditorFileComponent.prototype.uploadFile = function (e) {
        if (this.isLoading) {
            return;
        }
        var files = e.target.files;
        this.uploadFiles(files);
    };
    EditorFileComponent.prototype.uploadFiles = function (files) {
        if (this.isLoading) {
            return;
        }
        if (files.length < 1) {
            return;
        }
        this.isLoading = true;
        // this.uploadService.uploadFile(files[0]).subscribe({
        //     next: res => {
        //         this.isLoading = false;
        //         this.tapConfirm(res.url, res.original, res.size);
        //     },
        //     error: () => {
        //         this.isLoading = false;
        //     }
        // })
    };
    EditorFileComponent.prototype.tapConfirm = function (value, title, size) {
        this.visible = false;
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
    function EditorImageComponent(
    // private uploadService: FileUploadService,
    ) {
        this.visible = false;
        this.fileName = '';
        this.tabIndex = 0;
        this.url = '';
        this.isLoading = false;
    }
    EditorImageComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\" [ngClass]=\"{'modal-visible': visible, 'modal-loading': isLoading}\" appFileDrop (fileDrop)=\"uploadFiles($event)\">\n        <div class=\"tab-bar\">\n            <a class=\"item\" [ngClass]=\"{active: tabIndex < 1}\" (click)=\"tabIndex = 0\" title=\"\u4E0A\u4F20\">\n                <i class=\"iconfont icon-upload\"></i>\n            </a>\n            <a class=\"item\" [ngClass]=\"{active: tabIndex == 1}\" (click)=\"tabIndex = 1\" title=\"\u94FE\u63A5\">\n                <i class=\"iconfont icon-chain\"></i>\n            </a>\n            <a class=\"item\" [ngClass]=\"{active: tabIndex == 2}\" (click)=\"tabIndex = 2\" title=\"\u5728\u7EBF\u56FE\u5E93\">\n                <i class=\"iconfont icon-folder-open-o\"></i>\n            </a>\n        </div>\n        <label class=\"drag-input\" [for]=\"fileName\" *ngIf=\"tabIndex < 1\">\n            \u62D6\u653E\u6587\u4EF6\n            <p>(\u6216\u70B9\u51FB)</p>\n            <input type=\"file\" [id]=\"fileName\" (change)=\"uploadFile($event)\">\n        </label>\n        <div *ngIf=\"tabIndex == 1\">\n            <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!url}\">\n                <input type=\"text\" [(ngModel)]=\"url\">\n                <label for=\"\">\u94FE\u63A5</label>\n            </div>\n            <div class=\"modal-action\">\n                <div class=\"btn btn-outline-primary\" (click)=\"tapConfirm()\">\u63D2\u5165</div>\n            </div>\n        </div>\n        <app-loading-ring></app-loading-ring>\n    </div>";
    };
    EditorImageComponent.prototype.open = function (data, cb) {
        this.visible = true;
        this.confirmFn = cb;
    };
    EditorImageComponent.prototype.uploadFile = function (e) {
        if (this.isLoading) {
            return;
        }
        var files = e.target.files;
        this.uploadFiles(files);
    };
    EditorImageComponent.prototype.uploadFiles = function (files) {
        if (this.isLoading) {
            return;
        }
        if (files.length < 1) {
            return;
        }
        this.isLoading = true;
        // this.uploadService.uploadImage(files[0]).subscribe({
        //     next: res => {
        //         this.isLoading = false;
        //         this.url = res.url;
        //         this.output({
        //             value: res.url,
        //             title: res.original
        //         });
        //     },
        //     error: () => {
        //         this.isLoading = false;
        //     }
        // })
    };
    EditorImageComponent.prototype.tapConfirm = function () {
        this.output({
            value: this.url
        });
    };
    EditorImageComponent.prototype.output = function (data) {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn(data);
        }
    };
    return EditorImageComponent;
}());
var EditorLinkComponent = /** @class */ (function () {
    function EditorLinkComponent() {
        this.visible = false;
        this.url = '';
        this.title = '';
        this.isBlank = false;
    }
    EditorLinkComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\" [ngClass]=\"{'modal-visible': visible}\">\n        <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!url}\">\n            <input type=\"url\" [(ngModel)]=\"url\">\n            <label for=\"\">\u7F51\u5740</label>\n        </div>\n        <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!title}\">\n            <input type=\"text\" [(ngModel)]=\"title\">\n            <label for=\"\">\u6807\u9898</label>\n        </div>\n        <div class=\"input-flex-line\">\n            <i class=\"iconfont\" [ngClass]=\"{'icon-check-square-o': isBlank, 'icon-square-o': !isBlank}\" (click)=\"isBlank = !isBlank\"></i>\n            \u5728\u65B0\u6807\u7B7E\u9875\u6253\u5F00\n        </div>\n        <div class=\"modal-action\">\n            <div class=\"btn btn-outline-primary\" (click)=\"tapConfirm()\">\u63D2\u5165</div>\n        </div>\n    </div>";
    };
    EditorLinkComponent.prototype.open = function (data, cb) {
        this.visible = true;
        this.confirmFn = cb;
    };
    EditorLinkComponent.prototype.tapConfirm = function () {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn({
                value: this.url,
                title: this.title,
                target: this.isBlank
            });
        }
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
        return "<div class=\"reflect-container\">\n        <div class=\"selection-container\" [ngStyle]=\"boxStyle\">\n            <div class=\"rotate-icon\">\n                <i class=\"iconfont icon-refresh\"></i>\n            </div>\n            <div class=\"eight-corner\">\n                <div class=\"cursor lt\" (mousedown)=\"onMoveLt($event)\"></div>\n                <div class=\"cursor t\" (mousedown)=\"onMoveT($event)\"></div>\n                <div class=\"cursor rt\" (mousedown)=\"onMoveRt($event)\"></div>\n                <div class=\"cursor r\" (mousedown)=\"onMoveR($event)\"></div>\n                <div class=\"cursor rb\" (mousedown)=\"onMoveRb($event)\"></div>\n                <div class=\"cursor b\" (mousedown)=\"onMoveB($event)\"></div>\n                <div class=\"cursor lb\" (mousedown)=\"onMoveLb($event)\"></div>\n                <div class=\"cursor l\" (mousedown)=\"onMoveL($event)\"></div>\n            </div>\n        </div>\n        <div class=\"horizontal-bar\" [ngStyle]=\"horizontalStyle\"></div>\n        <div class=\"vertical-bar\" [ngStyle]=\"verticalStyle\"></div>\n    </div>";
    };
    Object.defineProperty(EditorResizerComponent.prototype, "boxStyle", {
        get: function () {
            if (this.toolType !== 1) {
                return {
                    display: 'none',
                };
            }
            return {
                display: 'block',
                left: this.rectBound.x + 'px',
                top: this.rectBound.y + 'px',
                width: this.rectBound.width + 'px',
                height: this.rectBound.height + 'px',
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorResizerComponent.prototype, "horizontalStyle", {
        get: function () {
            if (this.toolType !== 2) {
                return {
                    display: 'none',
                };
            }
            return {
                display: 'block',
                left: this.rectBound.x + 'px',
                top: this.rectBound.y + 'px',
                height: this.rectBound.height + 'px',
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EditorResizerComponent.prototype, "verticalStyle", {
        get: function () {
            if (this.toolType !== 3) {
                return {
                    display: 'none',
                };
            }
            return {
                display: 'block',
                left: this.rectBound.x + 'px',
                top: this.rectBound.y + 'px',
                width: this.rectBound.width + 'px',
            };
        },
        enumerable: false,
        configurable: true
    });
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
    EditorResizerComponent.prototype.openResize = function (bound, cb) {
        this.toolType = 1;
        this.updatedHandler = cb;
        this.rectBound = bound;
    };
    EditorResizerComponent.prototype.openHorizontalResize = function (bound, cb) {
        this.toolType = 2;
        this.updatedHandler = cb;
        this.rectBound = bound;
        this.mouseMove(undefined, function (b, x, y) {
            return __assign(__assign({}, b), { x: b.x + x });
        });
    };
    EditorResizerComponent.prototype.openVerticalResize = function (bound, cb) {
        this.toolType = 3;
        this.updatedHandler = cb;
        this.rectBound = bound;
        this.mouseMove(undefined, function (b, x, y) {
            return __assign(__assign({}, b), { y: b.y + y });
        });
    };
    EditorResizerComponent.prototype.close = function () {
        this.toolType = 0;
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
            last = p;
        }, function (_) {
            var toolType = _this.toolType;
            _this.toolType = 0;
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
        this.visible = false;
        this.width = '';
        this.height = '';
    }
    EditorSizeComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\" [ngClass]=\"{'modal-visible': visible}\">\n        <div class=\"tab-bar\">\n            <a class=\"item\" (click)=\"tapBack()\">\n                <i class=\"iconfont icon-back\"></i>\n            </a>\n        </div>\n        <div class=\"input-flex-group\">\n            <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!width}\">\n                <input type=\"text\" [(ngModel)]=\"width\">\n                <label for=\"\">\u5BBD</label>\n            </div>\n            <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!height}\">\n                <input type=\"text\" [(ngModel)]=\"height\">\n                <label for=\"\">\u9AD8</label>\n            </div>\n        </div>\n        <div class=\"modal-action\">\n            <div class=\"btn btn-outline-primary\" (click)=\"tapConfirm()\">\u66F4\u65B0</div>\n        </div>\n    </div>";
    };
    EditorSizeComponent.prototype.tapBack = function () {
    };
    EditorSizeComponent.prototype.open = function (data, cb) {
        this.visible = true;
        this.confirmFn = cb;
    };
    EditorSizeComponent.prototype.tapConfirm = function () {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn({
                height: this.height,
                width: this.width
            });
        }
    };
    return EditorSizeComponent;
}());
var EditorTableComponent = /** @class */ (function () {
    function EditorTableComponent() {
        this.visible = false;
        this.columnItems = [];
        this.rowItems = [];
        this.column = 1;
        this.row = 1;
        this.columnItems = this.generateRange(10);
        this.rowItems = this.generateRange(2);
    }
    EditorTableComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\" [ngClass]=\"{'modal-visible': visible}\">\n        <div class=\"table-grid\">\n            <div class=\"table-row\" *ngFor=\"let i of rowItems\">\n                <ng-container *ngFor=\"let j of columnItems\">\n                    <span class=\"table-cell\" [ngClass]=\"{active: column >= j && row >= i}\" (mouseover)=\"tapCell(i, j)\" (click)=\"tapConfirm(i, j)\"></span>\n                </ng-container>\n            </div>\n        </div>\n    </div>";
    };
    EditorTableComponent.prototype.tapCell = function (row, col) {
        this.column = col;
        this.row = row;
        if (row >= 9 && this.rowItems.length == 10) {
            return;
        }
        this.rowItems = this.generateRange(row + 1);
    };
    EditorTableComponent.prototype.tapConfirm = function (row, column) {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn({
                row: row,
                column: column
            });
        }
    };
    EditorTableComponent.prototype.open = function (data, cb) {
        this.visible = true;
        this.confirmFn = cb;
    };
    EditorTableComponent.prototype.generateRange = function (count) {
        var items = [];
        for (var i = 1; i <= count; i++) {
            items.push(i);
        }
        return items;
    };
    return EditorTableComponent;
}());
var EditorTextComponent = /** @class */ (function () {
    function EditorTextComponent() {
        this.visible = false;
        this.value = '';
        this.label = '文字';
    }
    EditorTextComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\" [ngClass]=\"{'modal-visible': visible}\">\n        <div class=\"tab-bar\">\n            <a class=\"item\" (click)=\"tapBack()\">\n                <i class=\"iconfont icon-back\"></i>\n            </a>\n        </div>\n        <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!value}\">\n            <input type=\"text\" [(ngModel)]=\"value\">\n            <label for=\"\">{{ label }}</label>\n        </div>\n        <div class=\"modal-action\">\n            <div class=\"btn btn-outline-primary\" (click)=\"tapConfirm()\">\u66F4\u65B0</div>\n        </div>\n    </div>";
    };
    EditorTextComponent.prototype.tapBack = function () {
    };
    EditorTextComponent.prototype.open = function (data, cb) {
        this.visible = true;
        this.confirmFn = cb;
    };
    EditorTextComponent.prototype.tapConfirm = function () {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn({
                value: this.value
            });
        }
    };
    return EditorTextComponent;
}());
var EditorVideoComponent = /** @class */ (function () {
    function EditorVideoComponent(
    //private uploadService: FileUploadService,
    ) {
        this.visible = false;
        this.fileName = '';
        this.tabIndex = 0;
        this.url = '';
        this.code = '';
        this.isAutoplay = false;
        this.isLoading = false;
    }
    EditorVideoComponent.prototype.render = function () {
        return "<div class=\"editor-modal-box\" [ngClass]=\"{'modal-visible': visible,'modal-loading': isLoading}\" appFileDrop (fileDrop)=\"uploadFiles($event)\">\n        <div class=\"tab-bar\">\n            <a class=\"item\" [ngClass]=\"{active: tabIndex == 1}\" (click)=\"tabIndex = 1\" title=\"\u94FE\u63A5\">\n                <i class=\"iconfont icon-chain\"></i>\n            </a>\n            <a class=\"item\" [ngClass]=\"{active: tabIndex == 2}\" (click)=\"tabIndex = 2\" title=\"\u4EE3\u7801\">\n                <i class=\"iconfont icon-code\"></i>\n            </a>\n            <a class=\"item\" [ngClass]=\"{active: tabIndex < 1}\" (click)=\"tabIndex = 0\" title=\"\u4E0A\u4F20\">\n                <i class=\"iconfont icon-upload\"></i>\n            </a>\n        </div>\n        <label class=\"drag-input\" [for]=\"fileName\" *ngIf=\"tabIndex < 1\">\n            \u62D6\u653E\u6587\u4EF6\n            <p>(\u6216\u70B9\u51FB)</p>\n            <input type=\"file\" [id]=\"fileName\" (change)=\"uploadFile($event)\">\n        </label>\n        <div *ngIf=\"tabIndex == 1\">\n            <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!url}\">\n                <input type=\"text\" [(ngModel)]=\"url\">\n                <label for=\"\">\u94FE\u63A5</label>\n            </div>\n            <div class=\"input-flex-line\">\n                <i class=\"iconfont\" [ngClass]=\"{'icon-check-square-o': isAutoplay, 'icon-square-o': !isAutoplay}\" (click)=\"isAutoplay = !isAutoplay\"></i>\n                \u81EA\u52A8\u64AD\u653E\n            </div>\n            <div class=\"modal-action\">\n                <div class=\"btn btn-outline-primary\" (click)=\"tapConfirm()\">\u63D2\u5165</div>\n            </div>\n        </div>\n        <div *ngIf=\"tabIndex == 2\">\n            <div class=\"input-header-block\" [ngClass]=\"{'input-not-empty': !!code}\">\n                <textarea [(ngModel)]=\"code\" rows=\"4\"></textarea>\n                <label for=\"\">\u4EE3\u7801</label>\n            </div>\n            <div class=\"modal-action\">\n                <div class=\"btn btn-outline-primary\" (click)=\"tapConfirm()\">\u63D2\u5165</div>\n            </div>\n        </div>\n        <app-loading-ring></app-loading-ring>\n    </div>";
    };
    EditorVideoComponent.prototype.open = function (data, cb) {
        this.visible = true;
        this.confirmFn = cb;
    };
    EditorVideoComponent.prototype.uploadFile = function (e) {
        var files = e.target.files;
        this.uploadFiles(files);
    };
    EditorVideoComponent.prototype.uploadFiles = function (files) {
        if (this.isLoading) {
            return;
        }
        if (files.length < 1) {
            return;
        }
        this.isLoading = true;
        // this.uploadService.uploadVideo(files[0]).subscribe({
        //     next: res => {
        //         this.isLoading = false;
        //         this.url = res.url;
        //         this.tapConfirm();
        //     },
        //     error: () => {
        //         this.isLoading = false;
        //     }
        // })
    };
    EditorVideoComponent.prototype.tapConfirm = function () {
        this.visible = false;
        if (this.confirmFn) {
            this.confirmFn(this.tabIndex === 2 ? { code: this.code } : { value: this.url, autoplay: this.isAutoplay });
        }
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
            this.insertText(v, range);
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
            return wordLength(this.value);
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
        switch (block.type) {
            case EditorBlockType.AddText:
            case EditorBlockType.AddRaw:
                this.insertText(block.value, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddLineBreak:
                this.insertLineBreak(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.Indent:
                this.insertIndent(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.Outdent:
                this.insertOutdent(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
        }
    };
    CodeElement.prototype.focus = function () {
        this.bodyPanel.focus({ preventScroll: true });
    };
    CodeElement.prototype.blur = function () {
        return this.bodyPanel.blur();
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
        this.container.on(EVENT_EDITOR_DESTORY, function () {
            resizeObserver.disconnect();
        });
    };
    CodeElement.prototype.bindEvent = function () {
        var _this = this;
        this.bindResize();
        this.bodyPanel.addEventListener('keydown', function (e) {
            _this.container.saveSelection();
            _this.container.emit(EVENT_INPUT_KEYDOWN, e);
        });
        this.bodyPanel.addEventListener('keyup', function (e) {
            if (_this.isComposition) {
                return;
            }
            _this.selectRangeLine(_this.selection.range);
            _this.container.emit(EVENT_EDITOR_CHANGE);
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
            _this.insert({
                type: EditorBlockType.AddRaw,
                value: e.clipboardData.getData('text/plain')
            });
            _this.container.emit(EVENT_EDITOR_CHANGE);
        });
        this.bodyPanel.addEventListener('compositionstart', function () {
            _this.isComposition = true;
            // this.container.saveSelection();
        });
        this.bodyPanel.addEventListener('compositionend', function () {
            _this.isComposition = false;
            _this.container.saveSelection();
            _this.container.emit(EVENT_SELECTION_CHANGE);
            _this.container.emit(EVENT_EDITOR_CHANGE);
        });
    };
    CodeElement.prototype.insertText = function (v, range) {
        var _a = this.getRangeLineNo(range), begin = _a[0], end = _a[1];
        var items = v.split('\n');
        items[0] = this.getLinePrevious(range) + items[0];
        items[items.length - 1] += this.getLineNext(range);
        this.insertLines.apply(this, __spreadArray([begin, end], items, false));
    };
    CodeElement.prototype.insertLineBreak = function (range) {
        var _a = this.getRangeLineNo(range), begin = _a[0], end = _a[1];
        this.insertLines(begin, end, this.getLinePrevious(range), this.getLineNext(range));
    };
    CodeElement.prototype.insertIndent = function (range) {
        this.replaceSelectLine(function (s) {
            return '    ' + s;
        }, range);
    };
    CodeElement.prototype.insertOutdent = function (range) {
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
        if (range.endOffset > 0) {
            var text = range.endContainer;
            cb(text.textContent.substring(range.endOffset));
        }
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
        for (var i = end; i >= lineNo; i--) {
            this.removeLine(i);
        }
        this.updateLineNo();
        var selectIndex = begin + items.length - 1;
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
            dd.style.height = dt.clientHeight + 'px';
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
            if (element.clientHeight > 0 && (minHeight === 0
                || element.clientHeight < minHeight)) {
                minHeight = element.clientHeight;
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
            dd.style.height = (dt && dt.clientHeight > minHeight ? dt.clientHeight : minHeight) + 'px';
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
            dd.style.height = lineBody.clientHeight + 'px';
        }
        return dd;
    };
    CodeElement.prototype.createLine = function (v) {
        var dt = document.createElement('div');
        dt.className = 'editor-line';
        this.renderLine(dt, v);
        dt.appendChild(document.createElement('br'));
        return dt;
    };
    CodeElement.prototype.updateLine = function (index, text) {
        var i = index - 1;
        var lineBody = this.bodyPanel.children[i];
        if (typeof text !== 'undefined') {
            this.renderLine(lineBody, text);
        }
        var lineNo = this.linePanel.children[i];
        lineNo.style.height = lineBody.clientHeight + 'px';
    };
    CodeElement.prototype.updateLineNo = function (index) {
        if (index === void 0) { index = 1; }
        for (; index <= this.linePanel.children.length; index++) {
            this.linePanel.children[index - 1].textContent = index.toString();
        }
    };
    CodeElement.prototype.renderLine = function (parent, line) {
        if (!line) {
            return;
        }
        parent.innerText = line;
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
        //     this.emit(EVENT_MOUSE_MOVE, {x: e.clientX, y: e.clientX});
        // });
        // document.addEventListener('mouseup', e => {
        //     this.emit(EVENT_MOUSE_UP, {x: e.clientX, y: e.clientX});
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
        // this.on(EVENT_MOUSE_MOVE, p => {
        //     if (this.mouseMoveListeners.move) {
        //         this.mouseMoveListeners.move(p);
        //     }
        // }).on(EVENT_MOUSE_UP, p => {
        //     if (this.mouseMoveListeners.finish) {
        //         this.mouseMoveListeners.finish(p);
        //     }
        // });
        this.on(EVENT_INPUT_KEYDOWN, function (e) {
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
        this.on(EVENT_INPUT_BLUR, function () {
            _this.saveSelection();
            // this.emit(EVENT_EDITOR_CHANGE);
        });
        this.on(EVENT_EDITOR_CHANGE, function () {
            _this.asynSave();
        });
        this.on(EVENT_EDITOR_AUTO_SAVE, function () {
            if (_this.undoIndex >= 0 && _this.undoIndex < _this.undoStack.length - 1) {
                _this.undoStack.splice(_this.undoIndex);
            }
            var maxUndoCount = _this.option.maxUndoCount;
            if (maxUndoCount < _this.undoStack.length) {
                _this.undoStack.splice(0, _this.undoStack.length - maxUndoCount - 1);
            }
            _this.undoStack.push(_this.value);
            _this.undoIndex = _this.undoStack.length - 1;
            _this.emit(EVENT_UNDO_CHANGE);
        });
        this.emit(EVENT_EDITOR_READY);
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
                this.once(EVENT_EDITOR_READY, function () {
                    _this.element.value = content;
                });
                return;
            }
            this.element.value = typeof content === 'undefined' ? '' : content;
            // this.emit(EVENT_EDITOR_CHANGE);
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
            _this.emit(EVENT_EDITOR_AUTO_SAVE);
        }, 2000);
    };
    EditorContainer.prototype.blur = function () {
        this.element.blur();
    };
    EditorContainer.prototype.destroy = function () {
        this.emit(EVENT_EDITOR_DESTORY);
        this.listeners = {};
    };
    EditorContainer.prototype.undo = function () {
        if (!this.canUndo) {
            this.emit(EVENT_UNDO_CHANGE);
            return;
        }
        this.undoIndex--;
        this.value = this.undoStack[this.undoIndex];
    };
    EditorContainer.prototype.redo = function () {
        if (!this.canRedo) {
            this.emit(EVENT_UNDO_CHANGE);
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
            return wordLength(this.element.innerText);
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
        switch (block.type) {
            case EditorBlockType.AddHr:
                this.insertHr(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddText:
                this.insertText(block, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddRaw:
                this.insertRaw(block, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.Indent:
                this.insertIndent(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.Outdent:
                this.insertOutdent(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.AddLineBreak:
                this.insertLineBreak(range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddImage:
                this.insertImage(block, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddTable:
                this.insertTable(block, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddVideo:
                this.insertVideo(block, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
            case EditorBlockType.AddLink:
                this.insertLink(block, range.range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                break;
        }
    };
    DivElement.prototype.focus = function () {
        this.element.focus({ preventScroll: true });
    };
    DivElement.prototype.blur = function () {
        return this.element.blur();
    };
    DivElement.prototype.insertHr = function (range) {
        var hr = document.createElement('hr');
        this.replaceSelected(range, hr);
    };
    DivElement.prototype.insertIndent = function (range) {
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
                var p = document.createElement(this.container.option.blockTag);
                p.appendChild(node.cloneNode(true));
                this.element.replaceChild(p, node);
                node = p;
            }
            var style = window.getComputedStyle(node);
            node.style.marginLeft = parseFloat(style.marginLeft.replace('px', '')) + 20 + 'px';
        }
    };
    DivElement.prototype.insertOutdent = function (range) {
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
    DivElement.prototype.insertTable = function (block, range) {
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
    DivElement.prototype.insertImage = function (block, range) {
        var image = document.createElement('img');
        image.src = block.value;
        image.title = block.title || '';
        this.replaceSelected(range, image);
    };
    DivElement.prototype.insertText = function (block, range) {
        var span = document.createElement('span');
        span.innerText = block.value;
        this.replaceSelected(range, span);
    };
    DivElement.prototype.insertRaw = function (block, range) {
        var p = document.createElement('div');
        p.innerHTML = block.value;
        var items = [];
        for (var i = 0; i < p.childNodes.length; i++) {
            items.push(p.childNodes[i]);
        }
        this.replaceSelected.apply(this, __spreadArray([range], items, false));
    };
    DivElement.prototype.insertVideo = function (block, range) {
        var ele = document.createElement('video');
        ele.src = block.value;
        ele.title = block.title || '';
        this.replaceSelected(range, ele);
    };
    DivElement.prototype.insertFile = function (block, range) {
        var ele = document.createElement('a');
        ele.href = block.value;
        ele.title = block.title || '';
        this.replaceSelected(range, ele);
    };
    DivElement.prototype.insertLink = function (block, range) {
        var link = document.createElement('a');
        link.href = block.value;
        link.text = block.title;
        if (block.target) {
            link.target = '_blank';
        }
        this.insertElement(link, range);
        this.selectNode(link);
    };
    DivElement.prototype.insertLineBreak = function (range) {
        var _this = this;
        var begin = range.startContainer;
        var beginOffset = range.startOffset;
        var p = document.createElement(this.container.option.blockTag);
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
            var ele = document.createElement(this.container.option.blockTag);
            ele.appendChild(document.createElement('br'));
            this.insertBefore(p, ele);
        }
        this.selectNode(p);
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
        if (this.isNotSelected(range)) {
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
    /**
     * 切换父级的标签，例如 b strong
     */
    DivElement.prototype.toggleParentNode = function (range, tag) {
    };
    /**
     * 切换父级的样式
     */
    DivElement.prototype.toggleParentStyle = function (range, style) {
    };
    DivElement.prototype.isNotSelected = function (range) {
        return range.startContainer === range.endContainer && range.startOffset === range.endOffset;
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
    DivElement.prototype.bindEvent = function () {
        var _this = this;
        this.element.addEventListener('keydown', function (e) {
            _this.container.saveSelection();
            _this.container.emit(EVENT_INPUT_KEYDOWN, e);
            _this.container.emit(EVENT_CLOSE_TOOL);
        });
        this.element.addEventListener('keyup', function () {
            if (_this.isComposition) {
                return;
            }
            var range = _this.selection.range;
            if (_this.isEmptyLine(range)) {
                _this.container.emit(EVENT_SHOW_ADD_TOOL, _this.getNodeOffset(range.startContainer).y);
                return;
            }
        });
        this.element.addEventListener('compositionstart', function () {
            _this.isComposition = true;
            // this.container.saveSelection();
        });
        this.element.addEventListener('compositionend', function () {
            _this.isComposition = false;
            _this.container.saveSelection();
            _this.container.emit(EVENT_SELECTION_CHANGE);
            _this.container.emit(EVENT_EDITOR_CHANGE);
        });
        this.element.addEventListener('mouseup', function () {
            _this.container.saveSelection();
            _this.container.emit(EVENT_SELECTION_CHANGE);
            // console.log([this.selectedValue]);
        });
        this.element.addEventListener('mouseenter', function (e) {
            if (!e.target) {
                return;
            }
            if (e.target instanceof HTMLHRElement) {
                if (e.target.previousSibling instanceof HTMLHRElement) {
                    _this.selectNode(e.target);
                    _this.container.emit(EVENT_SHOW_LINE_BREAK_TOOL, _this.getNodeOffset(e.target.previousSibling));
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
                _this.container.emit(EVENT_SHOW_IMAGE_TOOL, _this.getNodeBound(img_1), function (data) { return _this.updateNode(img_1, data); });
                return;
            }
            var range = _this.selection.range;
            if (_this.isInBlock(range)) {
                return;
            }
            if (_this.isEmptyLine(range)) {
                _this.container.emit(EVENT_SHOW_ADD_TOOL, _this.getNodeOffset(range.startContainer).y);
                return;
            }
            _this.container.emit(EVENT_INPUT_CLICK);
            _this.container.emit(EVENT_CLOSE_TOOL);
        });
        this.element.addEventListener('blur', function () {
            _this.container.saveSelection();
            _this.container.emit(EVENT_INPUT_BLUR);
        });
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
        this.container.emit(EVENT_SHOW_COLUMN_TOOL, {
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
        if (cb(begin) === false) {
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
        for (var _a = 0, items_3 = items; _a < items_3.length; _a++) {
            var item = items_3[_a];
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
        for (var _a = 0, items_4 = items; _a < items_4.length; _a++) {
            var item = items_4[_a];
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
        var _loop_1 = function (i) {
            var begin = beginParentItems.length - i;
            var end = endParentItems.length - i;
            var beginNode = begin >= 0 ? beginParentItems[begin] : undefined;
            var endNode = end >= 0 ? endParentItems[end] : undefined;
            if (beginNode) {
                this_1.eachNextBrother(beginNode, function (n) {
                    if (!n || n === beginNode || n === endNode) {
                        return;
                    }
                    n.parentNode.removeChild(n);
                }, endNode);
            }
            if (endNode && (!beginNode || endNode.parentNode !== beginNode.parentNode)) {
                this_1.eachBrother(endNode, function (n) {
                    if (n === endNode) {
                        return false;
                    }
                    if (n === beginNode) {
                        return;
                    }
                    n.parentNode.removeChild(n);
                }, false);
            }
        };
        var this_1 = this;
        for (var i = 1; i <= max; i++) {
            _loop_1(i);
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
        var _loop_2 = function (i) {
            var begin = beginParentItems.length - i;
            var end = endParentItems.length - i;
            var beginNode = begin >= 0 ? beginParentItems[begin] : undefined;
            var endNode = end >= 0 ? endParentItems[end] : undefined;
            if (beginNode) {
                this_2.eachNextBrother(beginNode, function (n) {
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
                this_2.eachBrother(endNode, function (n) {
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
        var this_2 = this;
        for (var i = 1; i <= max; i++) {
            _loop_2(i);
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
                event = EVENT_SHOW_LINK_TOOL;
                return false;
            }
            if (tableTag.indexOf(node.nodeName) >= 0) {
                event = EVENT_SHOW_TABLE_TOOL;
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
            if (cb(current) === false) {
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
                    return;
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
    /**
     * 拆分元素
     * @param node
     * @param offset
     * @returns
     */
    DivElement.prototype.splitNode = function (node, offset) {
        if (offset < 1) {
            return node;
        }
        if (!node.parentNode) {
            return node;
        }
        if (node instanceof Text && node.length > offset) {
            return node.splitText(offset);
        }
        return node;
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
    DivElement.prototype.isEmptyLine = function (range) {
        if (range.startOffset !== range.endOffset || range.startOffset > 0) {
            return false;
        }
        if (range.startContainer !== range.endContainer) {
            return false;
        }
        return this.isEmptyLineNode(range.startContainer);
    };
    DivElement.prototype.isEmptyLineNode = function (node) {
        if (node.nodeType !== 1) {
            return false;
        }
        for (var i = 0; i < node.childNodes.length; i++) {
            var element = node.childNodes[i];
            if (element.nodeName !== 'BR') {
                return false;
            }
            return true;
        }
        return true;
    };
    return DivElement;
}());
var EVENT_INPUT_KEYDOWN = 'input.keydown';
var EVENT_INPUT_BLUR = 'input.blur';
var EVENT_INPUT_CLICK = 'input.click';
var EVENT_MOUSE_UP = 'mouse.up';
var EVENT_MOUSE_MOVE = 'mouse.move';
var EVENT_EDITOR_CHANGE = 'change';
var EVENT_EDITOR_READY = 'ready';
var EVENT_EDITOR_DESTORY = 'destroy';
var EVENT_EDITOR_AUTO_SAVE = 'auto_save'; // 自动保存跟内容变化不一样，自动保存步骤少于内容变化
var EVENT_SELECTION_CHANGE = 'selection_change';
var EVENT_UNDO_CHANGE = 'undo';
var EVENT_SHOW_ADD_TOOL = 'tool.add';
var EVENT_SHOW_LINE_BREAK_TOOL = 'tool.line.break';
var EVENT_SHOW_IMAGE_TOOL = 'tool.image';
var EVENT_SHOW_COLUMN_TOOL = 'tool.column';
var EVENT_SHOW_LINK_TOOL = 'tool.link';
var EVENT_SHOW_TABLE_TOOL = 'tool.table';
var EVENT_CLOSE_TOOL = 'tool.flow.close';
var EDITOR_CLOSE_TOOL = 'close';
var EDITOR_ADD_TOOL = 'add';
var EDITOR_ENTER_TOOL = 'enter';
var EDITOR_UNDO_TOOL = 'undo';
var EDITOR_REDO_TOOL = 'redo';
var EDITOR_FULL_SCREEN_TOOL = 'full-screen';
var EDITOR_CODE_TOOL = 'code';
var EDITOR_IMAGE_TOOL = 'image_edit';
var EDITOR_TABLE_TOOL = 'table_edit';
var EDITOR_VIDEO_TOOL = 'video_edit';
var EDITOR_LINK_TOOL = 'link_edit';
var EditorBlockType;
(function (EditorBlockType) {
    EditorBlockType[EditorBlockType["AddLineBreak"] = 0] = "AddLineBreak";
    EditorBlockType[EditorBlockType["AddHr"] = 1] = "AddHr";
    EditorBlockType[EditorBlockType["AddText"] = 2] = "AddText";
    EditorBlockType[EditorBlockType["AddRaw"] = 3] = "AddRaw";
    EditorBlockType[EditorBlockType["AddImage"] = 4] = "AddImage";
    EditorBlockType[EditorBlockType["AddLink"] = 5] = "AddLink";
    EditorBlockType[EditorBlockType["AddTable"] = 6] = "AddTable";
    EditorBlockType[EditorBlockType["AddVideo"] = 7] = "AddVideo";
    EditorBlockType[EditorBlockType["AddFile"] = 8] = "AddFile";
    EditorBlockType[EditorBlockType["AddCode"] = 9] = "AddCode";
    EditorBlockType[EditorBlockType["Bold"] = 10] = "Bold";
    EditorBlockType[EditorBlockType["Indent"] = 11] = "Indent";
    EditorBlockType[EditorBlockType["Outdent"] = 12] = "Outdent";
    EditorBlockType[EditorBlockType["NodeResize"] = 13] = "NodeResize";
    EditorBlockType[EditorBlockType["NodeMove"] = 14] = "NodeMove";
})(EditorBlockType || (EditorBlockType = {}));
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
        name: 'more',
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
        icon: 'fa-wavy-line',
        label: 'Add Wavyline',
        parent: 'text',
    },
    {
        name: 'dashed',
        icon: 'fa-dottedunderline',
        label: '下标加点',
        parent: 'text',
    },
    {
        name: 'strike',
        icon: 'fa-strike',
        label: '画线',
        parent: 'text',
    },
    {
        name: 'sub',
        icon: 'fa-sub',
        label: '下标',
        parent: 'text',
    },
    {
        name: 'sup',
        icon: 'fa-sup',
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
    },
    {
        name: 'align-center',
        icon: 'fa-align-center',
        label: 'Algin Center',
        parent: 'paragraph',
    },
    {
        name: 'align-right',
        icon: 'fa-align-right',
        label: 'Algin Right',
        parent: 'paragraph',
    },
    {
        name: 'align-justify',
        icon: 'fa-align-justify',
        label: 'Algin Justify',
        parent: 'paragraph',
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
        parent: 'more',
    },
    {
        name: 'select-all',
        icon: 'fa-braille',
        label: 'Select All',
        parent: 'more',
        handler: function (editor, range, data) {
            editor.selectAll();
        },
    },
    {
        name: EDITOR_CODE_TOOL,
        icon: 'fa-code',
        label: 'View Code',
        parent: 'more',
    },
    // 图片处理
    {
        name: 'replace-image',
        icon: 'fa-exchange',
        label: '替换',
        parent: EDITOR_IMAGE_TOOL,
    },
    {
        name: 'align-image',
        icon: 'fa-alignright',
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
        icon: 'fa-chain',
        label: '插入链接',
        parent: EDITOR_IMAGE_TOOL,
    },
    {
        name: 'alt-image',
        icon: 'fa-char',
        label: '图片备注',
        parent: EDITOR_IMAGE_TOOL,
    },
    {
        name: 'size-image',
        icon: 'fa-ruler',
        label: '调整尺寸',
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
        icon: 'fa-table',
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
        icon: 'fa-table',
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
        icon: 'fa-shuipingdengjianju',
        label: '横向',
        parent: EDITOR_TABLE_TOOL,
    },
    {
        name: 'vertical-table',
        icon: 'fa-chuizhidengjianju',
        label: '纵向',
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
        icon: 'fa-font-foreground',
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
        icon: 'fa-chain-broken',
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
    EditorOptionManager.prototype.merge = function (option) {
        for (var key in option) {
            if (Object.prototype.hasOwnProperty.call(option, key)) {
                if (typeof this.option[key] !== 'object') {
                    this.option[key] = option[key];
                }
            }
        }
        if (option.icons) {
            this.option.icons = this.mergeObject(this.option.icons, option.icons);
        }
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
        var items = [];
        for (var key in this.moduleItems) {
            if (Object.prototype.hasOwnProperty.call(this.moduleItems, key) && this.moduleItems[key].parent == name && this.isVisible(key)) {
                items.push(this.moduleItems[key]);
            }
        }
        return items;
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
    EditorOptionManager.prototype.filterTool = function (items) {
        if (!items) {
            return [];
        }
        var data = [];
        for (var _i = 0, items_5 = items; _i < items_5.length; _i++) {
            var item = items_5[_i];
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
    return EditorOptionManager;
}());
/**
 * markdown 模式
 */
var TextareaElement = /** @class */ (function () {
    function TextareaElement(element, container) {
        this.element = element;
        this.container = container;
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
            return wordLength(this.value);
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
        switch (block.type) {
            case EditorBlockType.AddLink:
                this.insertLink(block, range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.AddText:
            case EditorBlockType.AddRaw:
                this.insertText(block.value, range, block.cursor);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.AddImage:
                this.insertImage(block, range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.Indent:
                this.insertIndent(range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.Outdent:
                this.insertOutdent(range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.AddLineBreak:
                this.insertLineBreak(range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
            case EditorBlockType.AddCode:
                this.insertCode(block, range);
                this.container.emit(EVENT_EDITOR_CHANGE);
                return;
        }
    };
    TextareaElement.prototype.focus = function () {
        this.element.focus();
    };
    TextareaElement.prototype.blur = function () {
        return this.element.blur();
    };
    TextareaElement.prototype.insertLineBreak = function (range) {
        this.insertText('\n', range);
    };
    TextareaElement.prototype.insertIndent = function (range) {
        this.replaceSelectLine(function (s) {
            return s.split('\n').map(function (v) {
                return '    ' + v;
            }).join('\n');
        }, range);
    };
    TextareaElement.prototype.insertOutdent = function (range) {
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
    TextareaElement.prototype.insertText = function (text, range, cursor) {
        var v = this.value;
        this.value = v.substring(0, range.start) + text + v.substring(range.start);
        this.moveCursor(range.start + (!cursor ? text.length : cursor));
    };
    TextareaElement.prototype.insertCode = function (block, range) {
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
    TextareaElement.prototype.insertLink = function (block, range) {
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
    TextareaElement.prototype.insertImage = function (block, range) {
        this.replaceSelect(function (s) {
            if (s.trim().length === 0 && block.title) {
                s = block.title;
            }
            return "![".concat(block.title, "](").concat(block.value, ")");
        }, range, block.title ? block.title.length + 4 : 2);
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
        this.element.addEventListener('keydown', function (e) {
            _this.container.emit(EVENT_INPUT_KEYDOWN, e);
        });
        this.element.addEventListener('keyup', function (e) {
            if (_this.isComposition) {
                return;
            }
            _this.container.saveSelection();
        });
        this.element.addEventListener('blur', function () {
            _this.container.emit(EVENT_INPUT_BLUR);
        });
        this.element.addEventListener('paste', function () {
            setTimeout(function () {
                _this.container.emit(EVENT_EDITOR_CHANGE);
            }, 10);
        });
        this.element.addEventListener('mouseup', function () {
            _this.container.saveSelection();
            _this.container.emit(EVENT_SELECTION_CHANGE);
        });
        this.element.addEventListener('compositionstart', function () {
            _this.isComposition = true;
        });
        this.element.addEventListener('compositionend', function () {
            _this.isComposition = false;
            _this.container.emit(EVENT_SELECTION_CHANGE);
        });
    };
    return TextareaElement;
}());
var OTHER_WORD_CODE = [8220, 8221, 8216, 8217, 65281, 12290, 65292, 12304, 12305, 12289, 65311, 65288, 65289, 12288, 12298, 12299, 65306];
/**
 * 计算内容的长度，排除空格符号等特殊字符
 */
function wordLength(val) {
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
            || (code > 128 && OTHER_WORD_CODE.indexOf(code) >= 0)) {
            continue;
        }
        length++;
    }
    return length;
}
var EditorApp = /** @class */ (function () {
    /**
    *
    */
    function EditorApp(element, option) {
        this.isFullScreen = false;
        this.option = new EditorOptionManager();
        if (option) {
            this.option.merge(option);
        }
        this.container = new EditorContainer(this.option);
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
        this.container.ready(this.textbox[0]);
        this.subToolbar = this.box.find('.editor-tool-bar .tool-bar-bottom');
        this.flowToolbar = this.box.find('.flow-tool-bar');
        this.modalContianer = this.box.find('.editor-flow-area .editor-modal-area');
        this.footerBar = this.box.find('.editor-footer');
        this.bindEvent();
    };
    EditorApp.prototype.tapTool = function (item, isRight, event) {
        this.container.focus();
        if (item.name === this.subParentName) {
            this.toggleSubToolbar(item.name, isRight);
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
    EditorApp.prototype.executeModule = function (item, position) {
        var _this = this;
        this.modalContianer.html('');
        if (item.name === EDITOR_CODE_TOOL) {
            // this.isCodeMode = !this.isCodeMode;
            // if (this.isCodeMode) {
            //     this.codeEditor.writeValue(this.container.value);
            //     this.codeEditor.registerOnChange(res => {
            //         this.writeValue(res);
            //     });
            // }
            return;
        }
        if (item.name === EDITOR_FULL_SCREEN_TOOL) {
            this.toggleFullScreen();
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
        if (modal.modalReady === 'function') {
            modal.modalReady(module, this.modalContianer, this.option);
        }
        modal.open({}, function (res) {
            _this.modalContianer.children().hide();
            _this.container.execute(module, undefined, res);
        }, position);
    };
    EditorApp.prototype.getOffsetPosition = function (event) {
        var ele = this.textbox;
        var rect = ele.offset();
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
        this.container.on(EVENT_UNDO_CHANGE, function () {
            _this.toggleTool({ name: EDITOR_UNDO_TOOL, disabled: !_this.container.canUndo }, { name: EDITOR_REDO_TOOL, disabled: !_this.container.canRedo });
        });
        this.container.on(EVENT_SHOW_ADD_TOOL, function (y) {
            _this.modalContianer.children().hide();
            _this.toggleFlowbar(_this.container.option.tool(EDITOR_ADD_TOOL), {
                x: 0,
                y: y,
            });
        });
        this.container.on(EVENT_SHOW_LINE_BREAK_TOOL, function (p) {
            _this.toggleFlowbar(_this.container.option.tool(EDITOR_ENTER_TOOL), {
                x: 0,
                y: p.y,
            });
        });
        this.container.on(EVENT_SHOW_TABLE_TOOL, function (p) {
            _this.toggleFlowbar(_this.container.option.tool(EDITOR_TABLE_TOOL), p);
        });
        this.container.on(EVENT_SHOW_LINK_TOOL, function (p) {
            _this.toggleFlowbar(_this.container.option.tool(EDITOR_LINK_TOOL), p);
        });
        this.container.on(EVENT_SHOW_IMAGE_TOOL, function (p, cb) {
            _this.toggleFlowbar(_this.container.option.tool(EDITOR_IMAGE_TOOL), __assign(__assign({}, p), { y: p.y + p.height + 20 }));
            // this.resizer.openResize(p, cb);
        });
        this.container.on(EVENT_SHOW_COLUMN_TOOL, function (p, cb) {
            // this.resizer.openHorizontalResize(p, cb);
        });
        this.container.on(EVENT_CLOSE_TOOL, function () {
            _this.modalContianer.children().hide();
            _this.toggleFlowbar();
            // this.flowItems = [];
            // if (this.modalRef) {
            //     this.modalRef.destroy();
            //     this.modalRef = undefined;
            // }
            // this.resizer.close();
        });
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
            this.flowToolbar.css({
                top: p.y + 'px',
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
        for (var _a = 0, items_6 = items; _a < items_6.length; _a++) {
            var item = items_6[_a];
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
        this.box = element;
        this.box.addClass('editor-box');
        this.box.html(this.renderBase());
        this.target = $(document.createElement('textarea'));
        this.target.attr('name', this.box.attr('name'));
        this.target.hide();
        this.box.append(this.target);
    };
    EditorApp.prototype.initByInput = function (element) {
        this.target = element;
        this.box = $('<div class="editor-box"></div>');
        this.box.html(this.renderBase());
        element.hide();
        element.before(this.box);
        this.box.append(element);
    };
    EditorApp.prototype.renderBase = function () {
        return "<div class=\"editor-tool-bar\">\n        <div class=\"tool-bar-top\">\n            <div class=\"tool-left\"></div>\n            <div class=\"tool-right\"></div>\n        </div>\n        <div class=\"tool-bar-bottom\">\n        </div>\n    </div>\n    <div class=\"editor-body\">\n        <div class=\"editor-area\">\n            <div class=\"editor-view\" contentEditable=\"true\" spellcheck=\"false\"></div>\n        </div>\n        <div class=\"editor-flow-area\">\n            <div class=\"flow-tool-bar\"></div>\n            <div class=\"editor-modal-area\"></div>\n        </div>\n    </div>\n    <div class=\"editor-footer\">0 words</div>";
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
    $.fn.editor = function (option) {
        return new EditorApp(this[0], option);
    };
})(jQuery);
