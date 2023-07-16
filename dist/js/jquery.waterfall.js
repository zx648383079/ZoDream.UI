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
var HorizontalBar = /** @class */ (function () {
    function HorizontalBar(max, gap, items) {
        if (items === void 0) { items = []; }
        this.max = max;
        this.gap = gap;
        this.items = [];
        this.reset(items);
    }
    Object.defineProperty(HorizontalBar.prototype, "minRang", {
        /**
         * 返回去除了边框的可以用
         */
        get: function () {
            var data = this.items;
            var x = 0;
            var min = undefined;
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                if (item.x > x) {
                    return {
                        x: Math.max(0, x),
                        y: item.y,
                        width: item.x - this.gap
                    };
                }
                if (!min || min.y > item.y) {
                    min = __assign({}, item);
                }
                else if (min.y === item.y && item.x <= min.x + min.width) {
                    min.width = Math.max(item.x + item.width - min.x, min.width);
                }
                x = item.x + item.width;
            }
            return x >= this.max ? __assign(__assign({}, min), { x: Math.max(0, min.x), width: min.width - ((min.x + min.width) < this.max ? this.gap : 0) }) : {
                x: Math.max(x, 0),
                y: 0,
                width: Math.min(this.max, this.max - x)
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HorizontalBar.prototype, "bottom", {
        get: function () {
            return 0;
        },
        enumerable: false,
        configurable: true
    });
    HorizontalBar.prototype.log = function () {
        console.log(this.items);
    };
    HorizontalBar.prototype.leftHeight = function (rang) {
        if (rang.x <= 0) {
            return 0;
        }
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            var r = item.x + item.width;
            if (r === rang.x) {
                return item.y - this.gap - rang.y;
            }
        }
        return 0;
    };
    HorizontalBar.prototype.rightHeight = function (rang) {
        if (rang.x >= this.max) {
            return 0;
        }
        var rr = rang.x + rang.width + this.gap;
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.x === rr) {
                return item.y - this.gap - rang.y;
            }
        }
        return 0;
    };
    HorizontalBar.prototype.push = function (rect) {
        var items = [];
        var x = 0;
        var checkFn = function (item) {
            // if (item.width <= 2 * this.gap) {
            //     return;
            // }
            if (item.x < x) {
                return;
            }
            if (item.x > x) {
                x = item.x;
            }
            items.push(item);
        };
        var found = false;
        var rx = rect.x;
        var rw = this.computedWidth(rect);
        var ry = rect.y;
        var rb = rect.y + this.computedHeight(rect);
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            var r = item.x + item.width;
            if (x > item.x) {
                if (r <= x) {
                    continue;
                }
                checkFn({
                    x: x,
                    y: item.y,
                    width: r - x
                });
                continue;
            }
            if (item.x < rx) {
                if (r <= rx) {
                    checkFn(item);
                    continue;
                }
                var w = rx - item.x + (item.y === rb ? rw : 0);
                checkFn(__assign(__assign({}, item), { width: w }));
                if (item.y <= ry) {
                    checkFn({
                        x: rx,
                        y: rb,
                        width: rw
                    });
                }
                x = rx + rw;
                found = true;
            }
            else if (item.x === rx) {
                checkFn({
                    x: rx,
                    y: rb,
                    width: rw
                });
                if (item.width > rw) {
                    checkFn({
                        x: rx + rw,
                        y: item.y,
                        width: item.width - rw
                    });
                }
                x = Math.max(r, rx + rw);
                found = true;
            }
            else {
                var rr = rx + rw;
                if (rr < item.x) {
                    if (found) {
                        checkFn({
                            x: rx,
                            y: rb,
                            width: rw
                        });
                        found = true;
                    }
                    checkFn(item);
                    continue;
                }
                checkFn({
                    x: rx,
                    y: rb,
                    width: rw
                });
                checkFn({
                    x: rr,
                    y: item.y,
                    width: r - rr
                });
                found = true;
            }
        }
        if (!found) {
            checkFn({
                x: rx,
                y: rb,
                width: rw
            });
        }
        this.items = items;
    };
    HorizontalBar.prototype.reset = function (items) {
        if (items === void 0) { items = []; }
        var bound = [];
        for (var i = items.length - 1; i >= 0; i--) {
            var item = items[i];
            var b = item.y + this.computedHeight(item);
            var w = this.computedWidth(item);
            var found = false;
            for (var _i = 0, bound_1 = bound; _i < bound_1.length; _i++) {
                var rect = bound_1[_i];
                if (rect.x <= item.x && rect.width >= w && b > rect.y) {
                    rect.y = b;
                    found = true;
                }
            }
            if (found) {
                continue;
            }
            bound.push({
                y: b,
                x: item.x,
                width: w
            });
            if (this.isFullLine(bound)) {
                break;
            }
        }
        this.items = bound.sort(this.compareX);
    };
    HorizontalBar.prototype.isFullLine = function (items) {
        var data = items.sort(this.compareX);
        var x = 0;
        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
            var item = data_2[_i];
            if (item.x > x) {
                return false;
            }
            x = item.x + item.width;
        }
        return x >= this.max;
    };
    HorizontalBar.prototype.compareX = function (a, b) {
        return a.x < b.x ? 1 : -1;
    };
    HorizontalBar.prototype.computedWidth = function (rect) {
        return rect.width + (rect.x + rect.width >= this.max ? 0 : this.gap);
    };
    HorizontalBar.prototype.computedHeight = function (rect) {
        return rect.height + this.gap;
    };
    return HorizontalBar;
}());
var WaterFall = /** @class */ (function () {
    function WaterFall(container, option) {
        var _this = this;
        this.container = container;
        this.option = option;
        this.items = [];
        this.bindEvent();
        this.bar = new HorizontalBar(this.container.width(), this.option.gap);
        var items = this.option.items;
        if (!items || items.length === 0) {
            return;
        }
        if (typeof items[0] === 'object') {
            this.push(items.map(function (i) {
                if (typeof i.originalHeight !== 'undefined') {
                    return i;
                }
                return __assign(__assign({}, i), { originalWidth: i.width, originalHeight: i.height });
            }));
            return;
        }
        this.preload(items, function (data) {
            _this.push(data);
        });
    }
    WaterFall.prototype.push = function (items) {
        var _this = this;
        var i = -1;
        var last = items.length - 1;
        var c = 0;
        while (i < last) {
            c++;
            if (c > last) {
                break;
            }
            var min = this.bar.minRang;
            var left = this.bar.leftHeight(min);
            var right = this.bar.rightHeight(min);
            var x = min.x;
            var y = min.y;
            var maxWidth = min.width;
            var width = 0;
            while (maxWidth > 0 && i < last) {
                var item = items[++i];
                if (x === min.x && left >= this.option.min && left < item.originalHeight) {
                    width = left / item.originalHeight * item.originalWidth;
                    if (width >= this.option.min && maxWidth - width > this.option.min) {
                        // 靠左对齐
                        var rect_1 = this.computed(item, x, y, width);
                        this.items.push(rect_1);
                        this.bar.push(rect_1);
                        x += width + this.option.gap;
                        maxWidth -= (width + this.option.gap);
                        continue;
                    }
                }
                if (maxWidth === min.width && right >= this.option.min && right < item.originalHeight) {
                    width = right / item.originalHeight * item.originalWidth;
                    if (width >= this.option.min && maxWidth - width > this.option.min) {
                        // 靠右对齐
                        var rect_2 = this.computed(item, x + maxWidth - width, y, width);
                        this.items.push(rect_2);
                        this.bar.push(rect_2);
                        maxWidth -= (width + this.option.gap);
                        continue;
                    }
                }
                // 宽不能大于图片宽度，
                if (item.originalWidth >= maxWidth) {
                    var rect_3 = this.computed(item, x, y, maxWidth);
                    this.items.push(rect_3);
                    this.bar.push(rect_3);
                    maxWidth = 0;
                    break;
                }
                width = Math.min(item.originalWidth, maxWidth - this.option.min - this.option.gap);
                if (width <= 0) {
                    break;
                }
                var rect = this.computed(item, x, y, width);
                this.items.push(rect);
                this.bar.push(rect);
                x += width + this.option.gap;
                maxWidth -= (width + this.option.gap);
                if (i >= last) {
                    break;
                }
                // 高最好能平附近的
            }
        }
        var height = 0;
        this.container.html('');
        this.items.forEach(function (item, i) {
            height = Math.max(height, item.y + item.height);
            _this.renderItem(item, i);
        });
        this.container.height(height);
    };
    WaterFall.prototype.preload = function (items, cb) {
        var data = [];
        var failure = 0;
        var checkFn = function () {
            if (data.length + failure >= items.length) {
                cb(data);
            }
        };
        var _loop_1 = function (item) {
            var img = new Image();
            img.onload = function () {
                data.push({
                    image: img,
                    src: item,
                    originalWidth: img.width,
                    originalHeight: img.height
                });
                checkFn();
            };
            img.onabort = function () {
                failure++;
                checkFn();
            };
            img.src = item;
        };
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            _loop_1(item);
        }
    };
    WaterFall.prototype.resize = function () {
        var items = this.items;
        this.items = [];
        this.bar = new HorizontalBar(this.container.width(), this.option.gap);
        this.push(items);
    };
    WaterFall.prototype.bindEvent = function () {
        var _this = this;
        $(window).on('resize', function () {
            _this.resize();
        });
    };
    WaterFall.prototype.renderItem = function (item, i) {
        if (this.option.render) {
            this.container.append(this.option.render(item));
            return;
        }
        var ele;
        if (Object.prototype.hasOwnProperty.call(item, 'image')) {
            ele = $(item.image);
        }
        else {
            ele = $('<div></div>');
            ele.text(i);
            ele.css({
                'background-color': this.randomColor(),
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
            });
        }
        ele.css({
            position: 'absolute',
            left: item.x + 'px',
            top: item.y + 'px',
            width: item.width + 'px',
            height: item.height + 'px',
        });
        this.container.append(ele);
    };
    WaterFall.prototype.randomColor = function () {
        var randomInt = function () {
            return Math.floor(Math.random() * 255);
        };
        var r = randomInt();
        var g = randomInt();
        var b = randomInt();
        return "rgb(".concat(r, ",").concat(g, ",").concat(b, ")");
    };
    WaterFall.prototype.computed = function (item, x, y, width) {
        var scale = width / item.originalWidth;
        return __assign(__assign({}, item), { scale: scale, x: x, y: y, width: width, height: scale * item.originalHeight });
    };
    return WaterFall;
}());
;
(function ($) {
    $.fn.waterfall = function (options) {
        return new WaterFall(this, options);
    };
})(jQuery);
