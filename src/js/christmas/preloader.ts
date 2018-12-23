class Preloader {
    private static caches: {[name: string]: any} = {};

    public static loadImg(name: string, url: string, cb?: Function) {
        let img = new Image();
        img.src = url;
        img.onload = () => {
            cb && cb();
        }
        Preloader.caches[name] = img;
    }

    /**
     * get<T>
     */
    public static get<T>(name: string): T {
        return Preloader.caches[name];
    }


}