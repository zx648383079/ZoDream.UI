/**
 * 分页
 */
class Page extends Box {
    constructor(
        public element: JQuery,
        option?: PageOption
    ) {
        super();
        this.options = $.extend({}, new PageDefaultOption(), option);
        this.options.url = Uri.parse(this.options.url);
        this.options.deleteUrl = Uri.parse(this.options.deleteUrl);
        this.options.updateUrl = Uri.parse(this.options.updateUrl);
        this.init();
        this.search();
    }

    public options: PageOption;

    private _searchForm: JQuery;

    private _searchElements: JQuery;

    private _checkAll: JQuery;

    private _body: JQuery;

    private _pager: Pager;

    public init() {
        let instance = this;
        this._body = this.element.find(this.options.pageBody);
        this._searchForm = this.element.find(this.options.searchForm);
        this._searchElements = this._searchForm.find('input,select,textarea');
        this._pager = $('<ul class="pager"></ul>').pager({
            paginate: function(page: number) {
                instance.search('page', page);
            }
        });
        this._checkAll = this.element.find('.checkAll');
        this.element.append(this._pager.element);
        this._bindEvent();
    }

    public checkAll() {
        this._body.find(".checkbox").addClass('checked');
    }

    public getCheckedRow(): Array<JQuery> {
        let data = [];
        let instance = this;
        this._body.find('.checkbox.checked').each(function(i, el) {
            data.push($(el).parents(instance.options.row));
        });
        return data;
    }

    
    public getChecked(): Array<string> {
        let data = [];
        let instance = this;
        $.each(this.getCheckedRow(), function(i, item) {
            data.push(item.attr(instance.options.idTag));
        });
        return data;
    }

    /**
     * 排序
     * @param name 
     * @param order 
     */
    public sort(name: string, order: string) {
        this.search({
            sort: name,
            order: order
        });
    }

    /**
     * 搜索
     * @param name 
     * @param val 
     */
    public search(name: any = {}, val?: any) {
        if (typeof name != 'object') {
            name = {[name]: val};
        }
        if (!name.hasOwnProperty('page')) {
            name['page'] = 1;
        }
        this.options.url.setData(name);
        this.refresh();
    }

    /**
     * 删除选中
     */
    public deleteChecked() {
        let elements = this.getCheckedRow();
        let instance = this;
        let data = [];
        elements.forEach(item=> {
            data.push(item.attr(instance.options.idTag));
        });
        this.deleteId(...data);
    }

    public deleteRow(element: JQuery) {
        let id = element.attr(this.options.idTag);
        if (!id) {
            return;
        }
        this.deleteId(id);
    }
    /**
     * 获取id标记
     */
    private _getIdTag(): string {
        return this.options.idTag.replace('data-', '');
    }

    public deleteId(...data: string[]) {
        if (data.length == 0) {
            return;
        }
        let instance = this;
        if (false == this.trigger('delete', ...data)) {
            console.log('delete is stop!');
            return;
        }
        this.options.deleteUrl.setData(this._getIdTag(), data).post({},function(data) {
            if (data.code == 0) {
                instance.refresh();
            }
        }, 'json');
    }

    public refresh() {
        let instance = this;
        if (this.options.beforeQuery 
        && this.options.beforeQuery.call(this) == false) {
            console.log('query is stop!');
            return;
        }
        this.options.url.getJson(function(data) {
            if (instance.options.afterQuery) {
                instance.options.afterQuery.call(this, data);
            }
            if (data.code != 0) {
                console.log(data);
                return;
            }
            instance._createBody(data.data.pagelist);
            instance._pager.change(data.data.page, Math.ceil(data.data.total / data.data.pageSize));
        });
    }

    /**
     * 判断是否为空值
     * @param val 
     */
    private _checkEmpty(val?: string): boolean {
        return !val || val == '' || val.trim() == '';
    }

    public updateColumn(element: JQuery) {
        let name = element.attr('data-name');
        if (this._checkEmpty(name)) {
            return;
        }
        let id = element.parents(this.options.row).attr(this.options.idTag);
        if (this._checkEmpty(id)) {
            return;
        }
        if (this.options.beforeUpdate 
        && false == this.options.beforeUpdate.call(this, element, id)) {
            return;
        }
        let instance = this;
        let input = $('<input type="text">');
        input.val(element.text());
        input.blur(function() {
            let val = input.val();
            input.remove();
            element.text(val);
            instance.updateData(id, name, val);
        });
        element.html('').append(input);
        input.focus();
    }

    public updateData(id: string, name: string, val: string) {
        if (false == this.trigger('update', id, name, val)) {
            console.log('update is stop!');
            return;
        }
        this.options.updateUrl.post({
            [this._getIdTag()]: id,
            name: name,
            value: val
        }, function(data) {

        }, 'json');
    }

    private _bindEvent() {
        let instance = this;
        this._searchForm.find("[type=submit]").click(function() {
            instance.search(instance._getSearchFormData());
        });
        this.element.find(this.options.sortRow+ '>*').click(function() {
            let $this = $(this);
            let name = $this.attr('data-name');
            if (instance._checkEmpty(name)) {
                return;
            }
            if ($this.hasClass('sort-asc')) {
                $this.removeClass().addClass('sort-desc');
                instance.sort(name, 'desc');
            } else {
                $this.removeClass().addClass('sort-asc');
                instance.sort(name, 'asc');
            }
        });
        this._checkAll.click(function() {
            let $this = $(this);
            if ($this.hasClass('checked')) {
                $this.removeClass('checked');
                return;
            }
            instance._checkAll.addClass('checked');
            instance._body.find('.checkbox').addClass('checked');
        });
        this.element.find('.deleteAll').click(function() {
            let $this = $(this);
            let tip = $this.attr('data-tip') || instance.options.deleteTip;
            if (confirm(tip)) {
                instance.deleteChecked();
            }
        });
        this.element.find(this.options.filterRow + ' input').blur(function() {
            instance._searchElement($(this));
        });
        this.element.find(this.options.filterRow + ' select').change(function() {
            instance._searchElement($(this));
        });
        this._body.on("click", '.delete', function() {
            let $this = $(this);
            let tip = $this.attr('data-tip') || instance.options.deleteTip;
            if (confirm(tip)) {
                instance.deleteRow($this.parents(instance.options.row));
            }
        });
        this._body.on("click", '.checkbox', function() {
            let $this = $(this);
            if ($this.hasClass('checked')) {
                $this.removeClass('checked');
                instance._checkAll.removeClass('checked');
                return;
            }
            $this.addClass('checked');
        });
        this._body.on('click', this.options.column, function() {
            instance.updateColumn($(this));
        });
    }

    private _searchElement(element: JQuery) {
        let name = element.attr('name');
        if (!name) {
            return;
        }
        this.search(name, element.val());
    }

    private _createBody(data: any) {
        let html = '';
        if (typeof data == 'object') {
            let instance = this;
            $.each(data, function(i, item) {
                html += instance.options.createRow(item);
            });
        } else {
            html = data;
        }
        this._body.html(html);
    }

    private _getSearchFormData() {
        let data = {};
        let instance = this;
        this._searchElements.each(function(i, ele) {
            let element = $(ele);
            let name = element.attr('name');
            if (element.is('[type=ridio]')) {
                if (element.is(':checked')) {
                    data[name] = element.val();
                }
                return;
            }
            if (element.is('[type=checkbox]')) {
                if (element.is(':checked')) {
                    data[name] = element.val(); // 多选时未解决
                }
                return;
            }
            data[name] = element.val();
        });
        return data;
    }

    public delete(callback: (id: string, row: JQuery) => any): this {
        return this.on('delete', callback);
    }

    public update(callback: (id: string, name: string, val: string) => any): this {
        return this.on('update', callback);
    }
}

interface PageOption {
    url?: string | Uri,  // 查询链接
    deleteUrl?: string | Uri, //删除链接， post 提交
    updateUrl?: string | Uri,  // 更新来链接，post 提交
    searchForm?: string,   //搜索表单
    pageBody?: string,     // 列表主体
    filterRow?: string,    //筛选行
    sortRow?: string,      //排序行
    row?: string,          //列表行标签
    column?: string,      //单元格标签
    idTag?: string,        // 行上的id 标记
    createRow?: (data: any) => string,   //一行生成
    deleteTip?: string,     //删除提示
    ondelete?: (id: string, row: JQuery) => any,  //删除事件
    onupdate?: (id: string, name: string, val: string) => any, //更新事件
    beforeUpdate?: (element: JQuery, id: string) => any, 
    beforeQuery?: ()=>any,   //查询开始事件
    afterQuery?: (data) => any, //查询结束
}

class PageDefaultOption implements PageOption {
    url: string = 'query';
    updateUrl: string = 'update';
    deleteUrl: string = 'delete';
    idTag: string = 'data-id';
    searchForm?: string = '.page-search';
    deleteTip: string = '确定删除？';
    pageBody: string = '.page-body';
    filterRow: string = '.filter-row';
    sortRow: string = '.sort-row';
    row: string = 'tr';
    column: string = 'td';
}


;(function($: any) {
  $.fn.page = function(option ?: PageOption) {
    return new Page(this, option); 
  };
})(jQuery);