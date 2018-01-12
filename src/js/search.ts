class search {
    /**
     * replace
     */
    public static replace(key: string, val: string) {
        let uri = new Uri(window.location.href);
        uri.replaceQueryParam(key, val);
        uri.deleteQueryParam('page');
        window.location.href = uri.toString();
    }

    /**
     * sort
     */
    public static sort(name: string, order?: string) {
        let uri = new Uri(window.location.href);
        if (!order) {
            order = uri.getQueryParamValue(name) == 'desc' ? 'asc' : 'desc';
        }
        uri.replaceQueryParam('sort', name);
        uri.replaceQueryParam('order', order);
        uri.deleteQueryParam('page');
        window.location.href = uri.toString();
    }

    /**
     * replaceInput
     */
    public static replaceInput(...names: string[]) {
        let uri = new Uri(window.location.href);
        $.each(names, function(i, name) {
            if (typeof name == 'object') {
                uri.replaceQueryParam(name[0], $('*[name='+name[1]+']').val());
                return;
            }
            uri.replaceQueryParam(name, $('*[name='+name+']').val());
        });
        uri.deleteQueryParam('page');
        window.location.href = uri.toString();
    }

    /**
     * prevPage
     */
    public static prevPage() {
        let uri = new Uri(window.location.href);
        let page = uri.getQueryParamValue('page');
        if (page > 1) {
            page --;
        }
        uri.replaceQueryParam('page', page);
        window.location.href = uri.toString();
    }

    /**
     * page
     */
    public static page(page: number) {
        let uri = new Uri(window.location.href);
        uri.replaceQueryParam('page', page);
        window.location.href = uri.toString();
    }

    /**
     * nextPage
     */
    public static nextPage() {
        let uri = new Uri(window.location.href);
        let page = uri.getQueryParamValue('page');
        if (page < 1) {
            page = 1;
        }
        uri.replaceQueryParam('page', page + 1);
        window.location.href = uri.toString();
    }
}