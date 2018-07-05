# jquery.selectbox.js

## 起步

### 文件下载
[js](https://github.com/zx648383079/ZoDream.UI/blob/master/dist/js/jquery.selectbox.js)、[css](https://github.com/zx648383079/ZoDream.UI/blob/master/dist/css/dialog-select.css)

### 引用文件（依赖jQuery）

```HTML

<link rel="stylesheet" href="/assets/css/dialog-select.css">

 <script src="http://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>  
<script type="text/javascript" src="/assets/js/jquery.selectbox.js"></script>

```

### 配置

```JS

    title: string   // 显示标题，默认 “请选择”
    data: object | string | (callback: () => object) => object | void,     //  数据来源，支持网址、方法回调
    default: string | number,  // 默认值，多级数据会自动寻找第一个匹配的 value 的路径
    column: number,      // 显示几级联动，默认 1
    textTag: string,     // 数据显示的值字段, 默认 value
    valueTag: string,   // 数据不显示的键字段, 默认 id
    childrenTag: string, //多级时，数据中子代的字段，默认 children
    lineHeight: number,  // 行高，需与css 设置的匹配，现在只能显示5行，默认 30
    ondone: (...val: string| number, ...text: string, ...option: JQuery, ...index: number) => any // 确定事件通知，val 表示根据valueTag取到的值, text 表示根据 textTag 取到的值，option 行的元素，index 表示在第几行 "..." 表示有几级

```

## 方法

```JS

    /**
     * 滑动
     * @param distance 距离的绝对值
     * @param isUp 是否是上滑
     * @param x 触发的位置，自动定位到第几级
     */
    touchMove(distance: number, isUp?: boolean, x?: number): this;
    /**
     * 显示
     */
    show(): this;
    /**
     * 隐藏并重置
     */
    hide(): this;
    /**
     * 重置
     */
    restore(): this;
    /**
     * 刷新
     */
    refresh(): this;
    /**
     * 根据值自动选中
     * @param val
     */
    applyValue(val: any): this;
    /**
     * 根据ID查找无限树的路径
     * @param id
     */
    getPath(id: string): Array<number>;
    /**
     * 刷新第几级的数据
     * @param column 第几级
     */
    refreshColumn(column?: number): this;
    /**
     * 选中哪一个
     * @param option
     * @param column  第几级
     */
    selected(option: JQuery | number, column?: number): this;
    /**
     * 选中第几行
     * @param index 行号 0 开始
     * @param column 第几级
     */
    selectedIndex(index?: number, column?: number): this;
    /**
     * 选中哪个值
     * @param id 值
     * @param column  第几级
     */
    selectedValue(id: number | string, column?: number): this;
    /**
     * 选中哪一行
     * @param option 行元素
     * @param column 第几级
     */
    selectedOption(option: JQuery, column?: number): this;
    /**
     * 获取当前的选中值 一级是单个值，多级是值的集合
     */
    val(): any;
    /**
     * 循环所有选中的项
     * @param cb (option: JQuery, index: number) => any
     */
    mapSelected(cb: (option: JQuery, index: number) => any): this;
    /**
     * 获取当前选中的选项
     * @param column 第几级
     */
    getSelectedOption(column?: number): JQuery<HTMLElement>;
    /**
     * 触发通知
     */
    notify(): this;

```

## Demo

### 替换 select

```HTML

    <select></select>

    <script>
    $("select").select();
    </script>

```

简单使用，自动获取 数据 和 默认值，并隐藏原本的select。如果动态设置 select 选项，请触发 optionschange 事件，会自动更新，也可以使用 refresh() 方法

### 绑定元素触发

```HTML

    <button></button>

    <script>
    $("button").select(options);
    </script>

```

#### 指定数据

```JS

options = {
    data: [
        {
            id: 1,
            value: 2
        }
    ]
}

```

#### 指定默认值

```JS

options = {
    default: 1,
    data: [
        {
            id: 1,
            value: 2
        }
    ]
}

```

#### 指定请求源

```JS

options = {
    data: 'city.php'
}

```

自动根据网址请求数据，并全局缓存
数据返回结构

```JSON

{
    "code": 0,
    "data": [

    ]
}

```

#### 省市区三级联动

```JS

options = {
    column: 3,
    data: 'city.php'
}

```
