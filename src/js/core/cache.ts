/**
 * 缓存数据
 */
class CacheUrl {
    /**
     * 缓存的数据
     */
    private static _cacheData: {[url: string]: any} = {};

    /**
     * 缓存的事件
     */
    private static _event: {[url: string]: Array<(data: any) => void>} = {};

    public static hasData(url: string): boolean {
        return this._cacheData.hasOwnProperty(url);
    }

    public static hasEvent(url: string) {
        return this._event.hasOwnProperty(url);
    }

    public static addEvent(url: string, callback: (data: any) => void) {
        if (!this.hasEvent(url)) {
            this._event[url] = [callback];
            return;
        }
        this._event[url].push(callback);
    }

    /**
     * 获取数据通过回调返回
     * @param url 
     * @param callback 
     */
    public static getData(url: string, callback: (data: any) => void) {
        if (this.hasData(url)) {
            callback(this._cacheData[url]);
            return;
        }
        if (this.hasEvent(url)) {
            this._event[url].push(callback);
            return;
        }
        this._event[url] = [callback];
        let instance = this;
        $.getJSON(url, function(data) {
            if (data.code == 200) {
                instance.setData(url, data.data);
                return;
            }
            console.log('URL ERROR! ' + url);
        });
    }

    /**
     * 设置数据并回调
     * @param url 
     * @param data 
     */
    public static setData(url: string, data: any) {
        this._cacheData[url] = data;
        if (!this.hasEvent(url)) {
            return;
        }
        this._event[url].forEach(callback=>{
            callback(data);
        });
        delete this._event[url];
    }
}