abstract class Eve {
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
        if (!this.hasEvent(event)) {
            return;
        }
        return this.options[realEvent].call(this, ...args);
    }
}