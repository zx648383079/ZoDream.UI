/// <reference types="jquery" />
declare module ZUtils {
    class time {
        /**
         * 获取真实的月份
         */
        static getRealMonth(date: Date): number;
        /**
         * 格式化日期
         */
        static format(date: Date, fmt?: string): string;
    }
    class str {
        static format(arg: string, ...args: any[]): string;
    }
}
declare abstract class Eve {
    options: any;
    on(event: string, callback: Function): this;
    hasEvent(event: string): boolean;
    trigger(event: string, ...args: any[]): any;
}
declare abstract class Box extends Eve {
    element: JQuery;
    box: JQuery;
    protected showPosition(): this;
    /**
     * 自适应布局
     */
    protected setPosition(): this;
    /**
     * 根据可能是相对值获取绝对值
     * @param abservable
     * @param reltive
     */
    static getReal(abservable: number, reltive: number): number;
}
/*!
 * jquery.datetimer - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
/**
 * 已知问题当最大值最小值为DateTimer 时无法正确显示
 */
declare class DateTimer extends Box {
    element: JQuery;
    constructor(element: JQuery, options?: DateTimerOptions);
    options: DateTimerOptions;
    box: JQuery;
    /**
     * 年月选择面板
     */
    private _yearGrid;
    /**
     * 时间选择面板
     */
    private _dayGrid;
    /**
     * 年选择列表
     */
    private _yearBox;
    /**
     * 月份选择列表
     */
    private _monthBox;
    /**
     * 小时选择列表
     */
    private _hourBox;
    /**
     * 分钟选择列表
     */
    private _minuteBox;
    /**
     * 秒选择列表
     */
    private _secondBox;
    /**
     * 是否有时间
     */
    private _hasTime;
    /**
     * 当前日期时间
     */
    private _currentDate;
    /**
     * 获取设置的最小值
     */
    private _getMin;
    /**
     * 获取设置的最大值
     */
    private _getMax;
    /**
     * 初始化
     * @param time
     */
    init(time: string | number): void;
    show(): this;
    hide(): this;
    /**
     * 创建元素
     */
    createHtml(): void;
    /**
     * 格式化数字
     */
    private _iTs;
    /**
     * 生成指定数目的li
     */
    private _nLi;
    /**
     * 显示
     */
    open(): void;
    /**
     * 获取当前设置的时间
     */
    getCurrentDate(): Date;
    /**
     * 获取当前时间
     */
    getDateOrNull(): Date | undefined;
    /**
     * 上一年
     */
    previousYear(): void;
    /**
     * 下一年
     */
    nextYear(): void;
    /**
     * 上月
     */
    previousMonth(): void;
    /**
     * 下月
     */
    nextMonth(): void;
    /**
     * 显示日期
     * @param year
     * @param month
     */
    showDate(year: number | Date | string, month?: number): void;
    /**
     * 针对最大值最小值动态获取的情况重新刷新年选择
     */
    private _refreshYearList;
    /**
     * 刷新年月列表
     */
    private _refreshYearGrid;
    /**
     * 刷新时间列表
     */
    private _refreshDayGrid;
    /**
     * 改变list-group 中的ul
     */
    private _changeListGroup;
    /**
     * 改变年
     * @param y
     */
    private _changeYear;
    /**
     * 改变月
     * @param m
     */
    private _changeMonth;
    /**
     * 改变时
     * @param h
     */
    private _changeHour;
    /**
     * 改变分
     * @param i
     */
    private _changeMinute;
    /**
     * 改变秒
     * @param s
     */
    private _changeSecond;
    /**
     * 刷新日
     */
    private _refreshDay;
    /**
     * 刷新时间
     */
    private _refreshTime;
    /**
     * 返回天的列表
     * @param y
     * @param m
     */
    private _mLi;
    /**
     * 切换年份选择
     */
    toggleYear(is_show?: boolean): this;
    /**
     * 切换时间选择
     */
    toggleTime(is_show?: boolean): this;
    /**
     * 绑定事件
     */
    private _bindEvent;
    /**
     * 点击日期
     * @param element
     */
    private _clickDay;
    /**
     * 获取月中最后一天
     * @param y
     * @param m
     */
    private _yD;
    /**
     * 获取第一天和最后一天
     * @param y
     * @param m
     */
    private _mD;
    /**
     * 获取当前时间
     */
    val(): string;
    /**
     * 验证Date
     * @param date
     */
    checkDate(date: Date): boolean;
    /**
     * 清除
     */
    clear(): void;
    /**
     * 输出时间
     * @param isHide
     */
    output(isHide?: boolean): void;
    /**
     * 转化时间
     */
    private _tD;
    done(callback: (date: Date, element: JQuery) => any): this;
}
interface DateTimerOptions {
    format?: string;
    min?: string | Date | DateTimer;
    max?: string | Date | DateTimer;
    minYear?: number;
    maxYear?: number;
    readonly?: boolean;
    ondone?: (date: Date, element: JQuery) => any;
    onclick?: (date: Date, element: JQuery) => any;
    onerror?: (date: Date, element: JQuery) => any;
    title?: string;
    autoHide: boolean;
}
declare class DateTimerDefaultOptions implements DateTimerOptions {
    format: string;
    min: string;
    max: string;
    title: string;
    readonly: boolean;
    minYear: number;
    maxYear: number;
    autoHide: boolean;
}
