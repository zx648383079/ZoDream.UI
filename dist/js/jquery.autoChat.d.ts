/// <reference types="jquery" />
/// <reference types="jquery" />
declare enum ChatStatus {
    STOP = 0,//停止
    PAUSE = 1,//暂停
    RUNNING = 2,//运行中
    COMPLETE = 3
}
declare enum ChatDirection {
    Left = 0,
    Right = 1
}
declare enum ChatAnimation {
    None = 0,
    Write = 1
}
interface ChatInterface {
    start(): this;
    pause(): this;
    stop(): this;
}
declare class Group {
    text: string;
    direction: ChatDirection;
    animation: ChatAnimation;
    constructor(text: string, direction?: ChatDirection, animation?: ChatAnimation);
}
declare class ChatPlayText implements ChatInterface {
    element: JQuery;
    group: Group;
    callback?: Function;
    speed: number;
    constructor(element: JQuery, group: Group, callback?: Function, speed?: number);
    init(): void;
    private _status;
    private _index;
    private _handle;
    private _otherElement;
    set status(arg: ChatStatus);
    get status(): ChatStatus;
    /** 开始 */
    start(): this;
    /** 暂停 */
    pause(): this;
    /** 停止 */
    stop(): this;
    /** 根据标记创造元素 */
    private _createElementByTag;
    /** 无动画效果 */
    private _createNoneAnimation;
    /** 输入效果 */
    private _createWriteAnimation;
    /** 清除 */
    clear(): void;
}
/** 组操作 */
declare class ChatPlayGroup implements ChatInterface {
    element: JQuery;
    callback: Function;
    options: ChatOptions;
    constructor(element: JQuery, group: any, callback: Function, options: ChatOptions);
    /** 格式化之后的组 */
    private _group;
    set group(arg: any);
    private _index;
    private _handle;
    private _text;
    private _status;
    set status(arg: ChatStatus);
    get status(): ChatStatus;
    /** 获取当前组 */
    currentGroup(): Group;
    /** 暂停 */
    pause(): this;
    /** 开始 */
    start(): this;
    /** 新建并开始 */
    createTextAndStart(): this;
    /** 下一个 */
    next(): void;
    /** 停止 */
    stop(): this;
    /** 创建新的文本 */
    private _createText;
    /** 清除所有 */
    clear(): void;
}
/**
 * 总控制器
 * JQuery 拓展类
 */
declare class Chat implements ChatInterface {
    element: JQuery;
    constructor(element: JQuery, options?: ChatOptions);
    /** 设置 */
    options: ChatOptions;
    /** 当前执行的组 */
    private _index;
    /** 定时器的指针 */
    private _handle;
    /** 当前执行组 */
    private _group;
    private _status;
    set status(arg: ChatStatus);
    get status(): ChatStatus;
    /** 暂停 */
    pause(): this;
    /** 暂停/播放 */
    toggle(): this;
    /** 播放 */
    start(): this;
    /** 停止 */
    stop(): this;
    /** 上一组 */
    previous(): void;
    /** 下一组 */
    next(): void;
    set index(arg: number);
    get index(): number;
    /** 跳到第几个 */
    go(arg: number): void;
    /** 清除所有 */
    clear(): void;
}
interface ChatOptions {
    data?: any[];
    wordSpace?: number;
    groupSpace?: number;
    space?: number;
    leftClass?: string;
    rightClass?: string;
    callback?: (ChatPlayGroup: any) => void;
}
declare class ChatDefaultOptions implements ChatOptions {
    data: any[];
    wordSpace: number;
    groupSpace: number;
    space: number;
    leftClass: string;
    rightClass: string;
}
