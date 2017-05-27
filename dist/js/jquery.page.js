var Uri = (function () {
    function Uri(_path, _data) {
        if (_path === void 0) { _path = ''; }
        if (_data === void 0) { _data = {}; }
        this._path = _path;
        this._data = _data;
        if (_path.indexOf('?') >= 0) {
            _a = this._parseUrl(_path), _path = _a[0], _data = _a[1];
        }
        var _a;
    }
    Uri.prototype.setData = function (key, val) {
        if (typeof key == 'object') {
            this._data = $.extend(this._data, key);
        }
        else {
            this._data[key] = val;
        }
        return this;
    };
    Uri.prototype.clearData = function () {
        this._data = {};
        return this;
    };
    Uri.prototype.get = function (success, dataType) {
        $.get(this.toString(), success, dataType);
    };
    Uri.prototype.getJson = function (success) {
        $.getJSON(this.toString(), success);
    };
    Uri.prototype.post = function (data, success, dataType) {
        $.post(this.toString(), data, success, dataType);
    };
    Uri.parse = function (url) {
        if (typeof url == 'object') {
            return url;
        }
        return new Uri(url);
    };
    Uri.prototype.toString = function () {
        var param = Uri.getData(this._data);
        if (param == '') {
            return this._path;
        }
        return this._path + '?' + param;
    };
    Uri.getData = function (args) {
        if ('object' != typeof args) {
            return args;
        }
        var value = '';
        $.each(args, function (key, item) {
            value += Uri._filterValue(item, key);
        });
        return value.substring(0, value.length - 1);
    };
    Uri._filterValue = function (data, pre) {
        if (typeof data != 'object') {
            return pre + "=" + data + "&";
        }
        var value = '';
        var isArray = data instanceof Array;
        $.each(data, function (key, item) {
            value += Uri._filterValue(item, pre + (isArray ? "[]" : "[" + key + "]"));
        });
        return value;
    };
    Uri.prototype._parseUrl = function (url) {
        var _a = url.split('?', 2), path = _a[0], param = _a[1];
        if (!param) {
            return [path, {}];
        }
        var ret = {}, seg = param.split('&'), len = seg.length, i = 0, s; //len = 2
        for (; i < len; i++) {
            if (!seg[i]) {
                continue;
            }
            s = seg[i].split('=');
            ret[s[0]] = s[1];
        }
        return [path, ret];
    };
    return Uri;
}());
var Page = (function () {
    function Page(element, option) {
        this.element = element;
        this.option = $.extend({}, new PageDefaultOption(), option);
        this.option.url = Uri.parse(this.option.url);
        this.option.deleteUrl = Uri.parse(this.option.deleteUrl);
        this.option.updateUrl = Uri.parse(this.option.updateUrl);
        this.init();
        this.search();
    }
    Page.prototype.init = function () {
        var instance = this;
        this._body = this.element.find(this.option.pageBody);
        this._searchForm = this.element.find(this.option.searchForm);
        this._searchElements = this._searchForm.find('input,select,textarea');
        this._pager = $('<ul class="pager"></ul>').pager({
            paginate: function (page) {
                instance.search('page', page);
            }
        });
        this._checkAll = this.element.find('.checkAll');
        this.element.append(this._pager.element);
        this._bindEvent();
    };
    Page.prototype.checkAll = function () {
        this._body.find(".checkbox").addClass('checked');
    };
    Page.prototype.getCheckedRow = function () {
        var data = [];
        var instance = this;
        this._body.find('.checkbox.checked').each(function (i, el) {
            data.push($(el).parents(instance.option.row));
        });
        return data;
    };
    Page.prototype.getChecked = function () {
        var data = [];
        var instance = this;
        $.each(this.getCheckedRow(), function (i, item) {
            data.push(item.attr(instance.option.idTag));
        });
        return data;
    };
    /**
     * 排序
     * @param name
     * @param order
     */
    Page.prototype.sort = function (name, order) {
        this.search({
            sort: name,
            order: order
        });
    };
    /**
     * 搜索
     * @param name
     * @param val
     */
    Page.prototype.search = function (name, val) {
        if (name === void 0) { name = {}; }
        if (typeof name != 'object') {
            name = (_a = {}, _a[name] = val, _a);
        }
        if (!name.hasOwnProperty('page')) {
            name['page'] = 1;
        }
        this.option.url.setData(name);
        this.refresh();
        var _a;
    };
    /**
     * 删除选中
     */
    Page.prototype.deleteChecked = function () {
        var elements = this.getCheckedRow();
        var instance = this;
        var data = [];
        elements.forEach(function (item) {
            data.push(item.attr(instance.option.idTag));
        });
        this.deleteId.apply(this, data);
    };
    Page.prototype.deleteRow = function (element) {
        var id = element.attr(this.option.idTag);
        if (!id) {
            return;
        }
        this.deleteId(id);
    };
    /**
     * 获取id标记
     */
    Page.prototype._getIdTag = function () {
        return this.option.idTag.replace('data-', '');
    };
    Page.prototype.deleteId = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        if (data.length == 0) {
            return;
        }
        var instance = this;
        if (this.option.onDelete
            && this.option.onDelete.apply(this, data) == false) {
            console.log('delete is stop!');
            return;
        }
        this.option.deleteUrl.setData(this._getIdTag(), data).post({}, function (data) {
            if (data.code == 0) {
                instance.refresh();
            }
        }, 'json');
    };
    Page.prototype.refresh = function () {
        var instance = this;
        if (this.option.beforeQuery
            && this.option.beforeQuery.call(this) == false) {
            console.log('query is stop!');
            return;
        }
        this.option.url.getJson(function (data) {
            if (instance.option.afterQuery) {
                instance.option.afterQuery.call(this, data);
            }
            if (data.code != 0) {
                console.log(data);
                return;
            }
            instance._createBody(data.data.pagelist);
            instance._pager.change(data.data.page, Math.ceil(data.data.total / data.data.pageSize));
        });
    };
    /**
     * 判断是否为空值
     * @param val
     */
    Page.prototype._checkEmpty = function (val) {
        return !val || val == '' || val.trim() == '';
    };
    Page.prototype.updateColumn = function (element) {
        var name = element.attr('data-name');
        if (this._checkEmpty(name)) {
            return;
        }
        var id = element.parents(this.option.row).attr(this.option.idTag);
        if (this._checkEmpty(id)) {
            return;
        }
        var instance = this;
        var input = $('<input type="text">');
        input.val(element.text());
        input.blur(function () {
            var val = input.val();
            input.remove();
            element.text(val);
            instance.updateData(id, name, val);
        });
        element.html('').append(input);
        input.focus();
    };
    Page.prototype.updateData = function (id, name, val) {
        if (this.option.onUpdate
            && this.option.onUpdate.call(this, id, name, val) == false) {
            console.log('update is stop!');
            return;
        }
        this.option.updateUrl.post((_a = {},
            _a[this._getIdTag()] = id,
            _a.name = name,
            _a.value = val,
            _a), function (data) {
        }, 'json');
        var _a;
    };
    Page.prototype._bindEvent = function () {
        var instance = this;
        this._searchForm.find("[type=submit]").click(function () {
            instance.search(instance._getSearchFormData());
        });
        this.element.find(this.option.sortRow + '>*').click(function () {
            var $this = $(this);
            var name = $this.attr('data-name');
            if (instance._checkEmpty(name)) {
                return;
            }
            if ($this.hasClass('sort-asc')) {
                $this.removeClass().addClass('sort-desc');
                instance.sort(name, 'desc');
            }
            else {
                $this.removeClass().addClass('sort-asc');
                instance.sort(name, 'asc');
            }
        });
        this._checkAll.click(function () {
            var $this = $(this);
            if ($this.hasClass('checked')) {
                $this.removeClass('checked');
                return;
            }
            instance._checkAll.addClass('checked');
            instance._body.find('.checkbox').addClass('checked');
        });
        this.element.find('.deleteAll').click(function () {
            var $this = $(this);
            var tip = $this.attr('data-tip') || instance.option.deleteTip;
            if (confirm(tip)) {
                instance.deleteChecked();
            }
        });
        this.element.find(this.option.filterRow + ' input').blur(function () {
            instance._searchElement($(this));
        });
        this.element.find(this.option.filterRow + ' select').change(function () {
            instance._searchElement($(this));
        });
        this._body.on("click", '.delete', function () {
            var $this = $(this);
            var tip = $this.attr('data-tip') || instance.option.deleteTip;
            if (confirm(tip)) {
                instance.deleteRow($this.parents(instance.option.row));
            }
        });
        this._body.on("click", '.checkbox', function () {
            var $this = $(this);
            if ($this.hasClass('checked')) {
                $this.removeClass('checked');
                instance._checkAll.removeClass('checked');
                return;
            }
            $this.addClass('checked');
        });
        this._body.on('click', this.option.column, function () {
            instance.updateColumn($(this));
        });
    };
    Page.prototype._searchElement = function (element) {
        var name = element.attr('name');
        if (!name) {
            return;
        }
        this.search(name, element.val());
    };
    Page.prototype._createBody = function (data) {
        var html = '';
        if (typeof data == 'object') {
            var instance_1 = this;
            $.each(data, function (i, item) {
                html += instance_1.option.createRow(item);
            });
        }
        else {
            html = data;
        }
        this._body.html(html);
    };
    Page.prototype._getSearchFormData = function () {
        var data = {};
        var instance = this;
        this._searchElements.each(function (i, ele) {
            var element = $(ele);
            var name = element.attr('name');
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
    };
    return Page;
}());
var PageDefaultOption = (function () {
    function PageDefaultOption() {
        this.url = 'query';
        this.updateUrl = 'update';
        this.deleteUrl = 'delete';
        this.idTag = 'data-id';
        this.searchForm = '.page-search';
        this.deleteTip = '确定删除？';
        this.pageBody = '.page-body';
        this.filterRow = '.filter-row';
        this.sortRow = '.sort-row';
        this.row = 'tr';
        this.column = 'td';
    }
    return PageDefaultOption;
}());
;
(function ($) {
    $.fn.page = function (option) {
        return new Page(this, option);
    };
})(jQuery);
