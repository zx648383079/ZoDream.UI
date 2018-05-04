class FilterBox {
    constructor(
        public element: JQuery,
        options: FilterOption
    ) {
        this.options = $.extend({}, new FilterDefaultOption(), options);
        this.refresh();
    }

    public options: FilterOption;

    private _selectedProperty: Array<string>;

    public refresh() {
        this.element.html(this.createHtml());
    }

    public createHtml(): string {
        return ZUtils.str.format('<div class="filter-box">{0}{3}<div class="property-box">{1}</div>{2}</div>', this._createSearchHtml(), 
        this._createPropertiesHtml(), 
        this._createSortHtml(), 
        this._createSelectedHtml());
    }

    private _createSelectedHtml(): string {
        if (this._selectedProperty.length < 1) {
            return '';
        }
        let html = '';
        $.each(this._selectedProperty, function(i, label) {
            html += ZUtils.str.format('<li><span>{0}</span><i class="fa fa-close"></i></li>', label);
        });
        return ZUtils.str.format('<div class="filter-property"><span class="property-header">已选择</span><ul>{0}</ul></div>', html);
    }

    private _createPropertiesHtml() {
        let html = '', 
            that = this;
        this._selectedProperty = [];
        $.each(this.options.properties, function(i, item) {
            html += that._createPropertyHtml(item);
        });
        return html;
    }

    private _createPropertyHtml(attr: any): string {
        return ZUtils.str.format('<div class="property-item"><span class="property-header">{0}</span><div class="property-body"><ul>{1}</ul></div><div class="property-action"><span class="property-more">更多</span>{2}</div></div>', attr.name, attr.type == 'range' ? this._createRangePropertyHtml(attr) : this._createCommonPropertyHtml(attr), attr.multiple ? '<span class="property-multiple">多选</span>' : '')
    }

    private _createCommonPropertyHtml(attr: any): string {
        let args: any = this.options.data[attr.key],
            html = '',
            that = this;
        $.each(attr.children, function(i: number, item) {
            if (!args || (typeof args == 'object' && args.indexOf(item.id) < 0) ||  (typeof args != 'object' && args != item.id)) {
                html += ZUtils.str.format('<li>{0}</li>', item.name);
                return;
            }
            that._selectedProperty.push(item.name);
            html += ZUtils.str.format('<li class="active">{0}</li>', item.name);
        });
        return html;
    }

    private _createRangePropertyHtml(attr: any): string {
        let args: Array<number> = this.options.data[attr.key], 
            start = 0,
            is_array = typeof attr.children == 'object' && attr.children instanceof Array,
            is_active = false,
            html = '', 
            that = this,
            end: number, label: string, is_a: boolean;
        $.each(attr.children, function(i: number, item) {
            if (is_array) {
                end = item;
                label = ZUtils.str.format('{0}-{1}', start, end);
            } else {
                end = i;
                label = item;
            }
            is_a = args && args[0] == start && args[1] == end;
            if (is_a) {
                that._selectedProperty.push(label);
                is_active = true;
                html += ZUtils.str.format('<li class="active">{0}</li>', label);
                return;
            }
            html += ZUtils.str.format('<li>{0}</li>', label);
        });
        if (!is_active && args) {
            this._selectedProperty.push(args.join('-'));
            return ZUtils.str.format('{0}<li class="range-input"><input type="text" name="{1}_min" value="{2}">-<input type="text" name="{1}_max" value="{3}"></li>', html, attr.key, args[0], args[1])
        }
        return ZUtils.str.format('{0}<li class="range-input"><input type="text" name="{1}_min">-<input type="text" name="{1}_max"></li>', html, attr.key);
    }

    private _createSearchHtml(): string {
        return ZUtils.str.format('<div class="search-box"><span class="property-header">搜索</span><input type="text" name="keywords" placeholder="搜索" value="{0}"></div>', this.options.data.keywords);
    }

    private _createSortHtml(): string {
        let html = '',
            sort: string = this.options.data.sort,
            order: string = this.options.data.order;
        $.each(this.options.sorts, function(i, item) {
            if (i != sort) {
                html += ZUtils.str.format('<span>{0}{1}</span>', item, i == '' ? '' : '<i></i>');
                return;
            }
            html += ZUtils.str.format('<span class="active order-{0}">{1}{2}</span>', order, item, i == '' ? '' : '<i></i>');
        });
        return ZUtils.str.format('<div class="sort-box">{0}</div>', html);
    }
}


interface FilterOption {
    properties?: any,
    sorts?: any,
    data?: any
}

class FilterDefaultOption implements FilterOption {

}

 ;
 (function ($: any) {
     $.fn.filterbox = function (options ? : FilterOption) {
         return new FilterBox(this, options);
     };
 })(jQuery);