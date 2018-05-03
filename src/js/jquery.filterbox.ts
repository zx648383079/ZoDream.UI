class FilterBox {
    constructor(
        public element: JQuery,
        options: FilterOption
    ) {
        this.options = $.extend({}, new LazyDefaultOptions(), options);

    }

    public options: FilterOption;

    public createHtml(): string {
        let html = '<div class="filter-box">{0}<div class="filter-property"><span class="property-header">已选择</span><ul><li><span>分类1</span><i class="fa fa-close"></i></li><li><span>分类1</span><i class="fa fa-close"></i></li></ul></div><div class="property-box"><div class="property-item"><span class="property-header">分类</span><div class="property-body"><ul><li class="active">分类1</li></ul></div><div class="property-action"><span class="property-more">更多</span><span class="property-multiple">多选</span></div></div></div>{2}</div>';

        return ZUtils.str.format(html, this._createSearchHtml(), );
    }

    private _createPropertyHtml(attr: any) {
        return ZUtils.str.format('<div class="property-item"><span class="property-header">{0}</span><div class="property-body"><ul>{1}</ul></div><div class="property-action"><span class="property-more">更多</span><span class="property-multiple">多选</span></div></div>', attr.name, attr.type)
    }

    private _createSearchHtml(): string {
        return ZUtils.str.format('<div class="search-box"><span class="property-header">搜索</span><input type="text" name="keywords" placeholder="搜索" value="{0}"></div>', this.options.data.keywords);
    }

    private _createSortHtml(): string {
        let html = '',
            sort: string = this.options.data.sort,
            order: string = this.options.data.order;
        $.each(this.options.sort, function(i, item) {
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
    properties: any,
    sort: any,
    data: any
}

 ;
 (function ($: any) {
     $.fn.filterbox = function (options ? : FilterOption) {
         return new FilterBox(this, options);
     };
 })(jQuery);