/**
 * 更新器
 */
declare class Updater {
    static text(ele: HTMLElement, value?: string): void;
    static html(ele: HTMLElement, value?: string): void;
    static class(ele: HTMLElement, value: string, oldValue: string): void;
    static model(ele: HTMLInputElement, value?: string): void;
}
declare class Compile {
    $vm: any;
    constructor(el: any, $vm: any);
    $el: HTMLElement;
    $fragment: any;
    node2Fragment(el: any): DocumentFragment;
    init(): void;
    compileElement(el: any): void;
    compile(node: any): void;
    compileText(node: any, exp: any): void;
    isDirective(attr: any): boolean;
    isEventDirective(dir: any): boolean;
    isElementNode(node: any): boolean;
    isTextNode(node: any): boolean;
}
declare class CompileUtil {
    static text(node: any, vm: any, exp: any): void;
    static html(node: any, vm: any, exp: any): void;
    static model(node: any, vm: any, exp: any): void;
    static class(node: any, vm: any, exp: any): void;
    static bind(node: any, vm: any, exp: any, dir: any): void;
    static eventHandler(node: any, vm: any, exp: any, dir: any): void;
    static _getVMVal(vm: any, exp: any): any;
    static _setVMVal(vm: any, exp: any, value: any): void;
}
declare class Observer {
    data: any;
    constructor(data: any);
    walk(data: any): void;
    conver(key: string, value?: any): void;
    defineReactive(data: any, key: string, value: any): void;
}
declare function observe(value: any): Observer;
declare var uid: number;
declare class Dep {
    constructor();
    uid: number;
    subs: any[];
    addSub(sub: any): void;
    depend(): void;
    removeSub(sub: any): void;
    notify(): void;
    static target: any;
}
declare class Watcher {
    vm: any;
    exp: string;
    cb: any;
    constructor(vm: any, exp: string, cb: any);
    depIds: {};
    value: any;
    update(): void;
    run(): void;
    addDep(dep: any): void;
    get(): any;
    getVMVal(): any;
}
declare class MVVM {
    options: any;
    constructor(options: any);
    _data: any;
    $compile: any;
    $watch(key: any, cb: any, options: any): void;
    _proxy(key: any): void;
}
