/// <reference types="jquery" />
declare class Accordion {
    element: JQuery;
    constructor(element: JQuery, options?: AccordionOptions);
    item: JQuery;
    options: AccordionOptions;
    width: number;
    length: number;
    getMaxWidth(): number;
    addActive(element: JQuery | number): void;
}
declare enum AccordionDirection {
    Horizon = 0,
    Vertical = 1
}
interface AccordionOptions {
    itemTag?: string;
    activeClass?: string;
    minWidth?: number;
    direction?: AccordionDirection;
}
declare class AccordionDefaultOptions implements AccordionOptions {
    itemTag: string;
    activeClass: string;
    minWidth: number;
    direction: AccordionDirection;
}
