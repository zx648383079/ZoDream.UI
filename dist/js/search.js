var search = /** @class */ (function () {
    function search() {
    }
    /**
     * replace
     */
    search.replace = function (key, val) {
        var uri = new Uri(window.location.href);
        uri.setData(key, val);
        uri.deleteData('page');
        window.location.href = uri.toString();
    };
    /**
     * sort
     */
    search.sort = function (name, order) {
        var uri = new Uri(window.location.href);
        if (!order) {
            order = uri.getData(name) == 'desc' ? 'asc' : 'desc';
        }
        uri.setData('sort', name);
        uri.setData('order', order);
        uri.deleteData('page');
        window.location.href = uri.toString();
    };
    /**
     * replaceInput
     */
    search.replaceInput = function () {
        var names = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            names[_i] = arguments[_i];
        }
        var uri = new Uri(window.location.href);
        $.each(names, function (i, name) {
            if (typeof name == 'object') {
                uri.setData(name[0], $('*[name=' + name[1] + ']').val());
                return;
            }
            uri.setData(name, $('*[name=' + name + ']').val());
        });
        uri.deleteData('page');
        window.location.href = uri.toString();
    };
    /**
     * prevPage
     */
    search.prevPage = function () {
        var uri = new Uri(window.location.href);
        var page = uri.getData('page');
        if (page > 1) {
            page--;
        }
        uri.setData('page', page);
        window.location.href = uri.toString();
    };
    /**
     * page
     */
    search.page = function (page) {
        var uri = new Uri(window.location.href);
        uri.setData('page', page);
        window.location.href = uri.toString();
    };
    /**
     * nextPage
     */
    search.nextPage = function () {
        var uri = new Uri(window.location.href);
        var page = uri.getData('page');
        if (page < 1) {
            page = 1;
        }
        uri.setData('page', page + 1);
        window.location.href = uri.toString();
    };
    return search;
}());
