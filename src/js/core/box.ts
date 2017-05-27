abstract class Box {

    public options: any;

    public on(event: string, callback: Function): this {
        this.options['on' + event] = callback;
        return this;
    }

    public hasEvent(event: string): boolean {
        return this.options.hasOwnProperty('on' + event);
    }

    public trigger(event: string, ... args: any[]) {
        let realEvent = 'on' + event;
        if (this.hasEvent(event)) {
            return;
        }
        return this.options[realEvent].call(this, ...args);
    }

    /**
     * 根据可能是相对值获取绝对值
     * @param abservable 
     * @param reltive 
     */
    public static getReal(abservable: number, reltive: number): number {
        if (reltive > 1) {
            return reltive;
        }
        return abservable * reltive;
    }
}