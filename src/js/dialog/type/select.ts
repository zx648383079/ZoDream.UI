class DialogSelect extends DialogCore {
    protected createContent(): this {
        throw new Error("Method not implemented.");
    }
    protected setProperty(): this {
        throw new Error("Method not implemented.");
    }
    constructor(
        option: DialogOption,
        id?: number
    ) {
        super(option, id);
    }

    public init() {

    }

    
}