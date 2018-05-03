/// <reference types="jquery" />
declare class SelectBox {
    element: JQuery;
    constructor(element: JQuery, options?: SelectBoxOptions);
    options: SelectBoxOptions;
}
interface SelectBoxOptions {
    data?: any;
    onClick?: (item: string, element: JQuery) => any;
}
declare class SelectBoxDefaultOptions implements SelectBoxOptions {
}
