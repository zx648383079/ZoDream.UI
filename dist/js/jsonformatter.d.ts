declare enum VALUE_TYPE {
    NULL = 0,
    STRING = 1,
    BOOL = 2,
    NUMBER = 3,
    OBJECT = 4,
    ARRAY = 5,
    COMMENT = 6
}
declare class JSONFormatter {
    render(data: any): string;
    private renderRaw;
    private getSpanBoth;
    private firstJSONCharIndex;
    private removeComments;
    private renderFormat;
    private parseType;
    private renderValue;
    private renderObjectValue;
    private renderArrayValue;
    private renderJson;
    private renderBar;
    bind(element: HTMLDivElement): void;
}
