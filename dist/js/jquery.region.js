var Region = (function () {
    function Region(element, option) {
        this.element = element;
        this.option = $.extend({}, new RegionDefaultOption(), option);
        this.provEle = this.element.find('.prov');
        this.cityEle = this.element.find('.city');
        this.distEle = this.element.find('.dist');
        if (typeof this.option.data == 'object') {
            this.init();
            return;
        }
        var instance = this;
        $.getJSON(this.option.data, function (data) {
            if (data.code == 0) {
                instance.option.data = data.data[1] ? data.data[1]['children'] : data.data;
                instance.init();
            }
        });
    }
    Region.prototype.init = function () {
        this.initProv();
        var instance = this;
        this.provEle.change(function () {
            instance.initCity();
        });
        this.cityEle.change(function () {
            instance.initDist();
        });
    };
    Region.prototype.initProv = function () {
        this.provEle.html(this.getSelectHtml(this.option.data));
        this.cityEle.html(this.getSelectHtml({}));
        this.distEle.html(this.getSelectHtml({}));
    };
    Region.prototype.initCity = function () {
        var id = this.provEle.val();
        this.cityEle.html(this.getSelectHtml(this.option.data[id]['children']));
        this.distEle.html(this.getSelectHtml({}));
    };
    Region.prototype.initDist = function () {
        var prov = this.provEle.val();
        var city = this.cityEle.val();
        this.distEle.html(this.getSelectHtml(this.option.data[prov]['children'][city]['children']));
    };
    Region.prototype.getSelectHtml = function (data, selected, defaultLabel) {
        if (defaultLabel === void 0) { defaultLabel = '请选择'; }
        var html = '<option value="">' + defaultLabel + '</option>';
        var instance = this;
        $.each(data, function (id, item) {
            html += instance.getOptionHtml(id, item.name, id == selected);
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
var RegionDefaultOption = (function () {
    function RegionDefaultOption() {
        this.data = 'region/tree';
    }
    return RegionDefaultOption;
}());
;
(function ($) {
    $.fn.region = function (options) {
        return new Region(this, options);
    };
})(jQuery);
