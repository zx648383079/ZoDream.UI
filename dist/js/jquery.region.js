var Region = /** @class */ (function () {
    function Region(element, option) {
        var _this = this;
        this.element = element;
        this.selectList = [];
        this.option = $.extend({}, new RegionDefaultOption(), option);
        this.selectList = [];
        this.element.find('select').each(function (i, ele) {
            _this.selectList.push($(ele));
        });
        if (typeof this.option.data == 'object') {
            this.init();
            return;
        }
        var instance = this;
        $.getJSON(this.option.data, function (data) {
            if (data.code == 0) {
                instance.option.data = data.data;
                instance.init();
            }
        });
    }
    Region.prototype.map = function (callback, start) {
        if (start === void 0) { start = 0; }
        var count = this.selectList.length;
        for (; start < count; start++) {
            if (false == callback(this.selectList[start], start, count)) {
                return;
            }
        }
    };
    Region.prototype.init = function () {
        this.showOption(this.selectList[0], 0);
        var instance = this;
        this.map(function (item, i, count) {
            if (i >= count - 1) {
                return false;
            }
            item.change(function () {
                var element = instance.eq(i + 1);
                var val = element.val();
                if (val) {
                    element.attr('data-value', val);
                }
                instance.showOption(element, i + 1);
            });
        });
    };
    Object.defineProperty(Region.prototype, "val", {
        get: function () {
            var args = [];
            this.map(function (item) {
                args.push(item.val());
            });
            return args;
        },
        set: function (args) {
            this.map(function (item, i) {
                item.attr('data-value', args[i]);
            });
            this.showOption(this.selectList[0], 0);
        },
        enumerable: true,
        configurable: true
    });
    Region.prototype.eq = function (i) {
        if (i < 0) {
            i = 0;
        }
        if (this.selectList.length <= i) {
            i = this.selectList.length - 1;
        }
        return this.selectList[i];
    };
    Region.prototype.getOptionData = function (i) {
        if (i < 1) {
            return this.option.data;
        }
        var data = this.option.data;
        var id;
        this.map(function (item, index) {
            if (index >= i) {
                return false;
            }
            id = item.val();
            if (!data.hasOwnProperty(id)) {
                data = null;
                return false;
            }
            data = data[id]['children'];
        });
        return data;
    };
    Region.prototype.getOptionTip = function (i) {
        if (typeof this.option.tips == 'object') {
            return this.option.tips[i];
        }
        return this.option.tips;
    };
    Region.prototype.showOption = function (element, i) {
        var _this = this;
        var hasSelected = false;
        element.html(this.getSelectHtml(this.getOptionData(i), element.attr('data-value'), this.getOptionTip(i), function () {
            hasSelected = true;
        }));
        this.map(function (item, index) {
            item.html(_this.getSelectHtml({}, null, _this.getOptionTip(index)));
        }, i + 1);
        if (hasSelected) {
            element.trigger('change');
        }
    };
    Region.prototype.getSelectHtml = function (data, selected, defaultLabel, selectedCallback) {
        if (defaultLabel === void 0) { defaultLabel = '请选择'; }
        var html = '<option value="">' + defaultLabel + '</option>';
        if (!data) {
            return html;
        }
        var instance = this;
        $.each(data, function (id, item) {
            var isSelected = id == selected;
            html += instance.getOptionHtml(id, item.name, isSelected);
            isSelected && selectedCallback && selectedCallback();
        });
        return html;
    };
    Region.prototype.getOptionHtml = function (id, text, isSelected) {
        if (isSelected === void 0) { isSelected = false; }
        if (isSelected) {
            return '<option value="' + id + '" selected>' + text + '</option>';
        }
        return '<option value="' + id + '">' + text + '</option>';
    };
    return Region;
}());
var RegionDefaultOption = /** @class */ (function () {
    function RegionDefaultOption() {
        this.data = 'region/tree';
        this.tips = '请选择';
    }
    return RegionDefaultOption;
}());
;
(function ($) {
    $.fn.region = function (options) {
        return new Region(this, options);
    };
})(jQuery);
