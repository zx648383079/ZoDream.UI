class search {
    /**
     * replace
     */
    public static replace(key: string, val: string) {
        let uri = new Uri(window.location.href);
        uri.setData(key, val);
        uri.deleteData('page');
        window.location.href = uri.toString();
    }

    /**
     * sort
     */
    public static sort(name: string, order?: string) {
        let uri = new Uri(window.location.href);
        if (!order) {
            order = uri.getData(name) == 'desc' ? 'asc' : 'desc';
        }
        uri.setData('sort', name);
        uri.setData('order', order);
        uri.deleteData('page');
        window.location.href = uri.toString();
    }

    /**
     * replaceInput
     */
    public static replaceInput(...names: string[]|any[]) {
        let uri = new Uri(window.location.href);
        $.each(names, function(i, name) {
            if (typeof name == 'object') {
                uri.setData(name[0] as any, $('*[name='+name[1]+']').val() as any);
                return;
            }
            uri.setData(name, $('*[name='+name+']').val() as any);
        });
        uri.deleteData('page');
        window.location.href = uri.toString();
    }

    /**
     * prevPage
     */
    public static prevPage() {
        let uri = new Uri(window.location.href);
        let page = uri.getData<number>('page');
        if (page > 1) {
            page --;
        }
        uri.setData('page', page);
        window.location.href = uri.toString();
    }

    /**
     * page
     */
    public static page(page: number) {
        let uri = new Uri(window.location.href);
        uri.setData('page', page);
        window.location.href = uri.toString();
    }

    /**
     * nextPage
     */
    public static nextPage() {
        let uri = new Uri(window.location.href);
        let page = uri.getData<number>('page');
        if (page < 1) {
            page = 1;
        }
        uri.setData('page', page + 1);
        window.location.href = uri.toString();
    }
}