/**
 * EXAMPLE:
 * $("#upload").upload({
 *      url: 'upload.php',
 *      name: 'file',
 *      template: '{url}',
 *      grid: '.img'
 * });
 */
class Upload {
    constructor(
        public element: JQuery,
        option?: UploadOption
    ) {
        this.option = $.extend({}, new UploadDefaultOption(), option);
        this.option.data = $.extend({}, this.option.data, this.getData());
        if (this.option.success) {
            this.success = this.option.success.bind(this);
        }
        this.getElement = this.option.getElement.bind(this);
        this.addEvent();
    }

    public option: UploadOption;

    public success: (data: any, currentElement: JQuery) => boolean;

    public getElement: (tag: string, currentElement: JQuery) => JQuery;

    private currentElement: JQuery;

    public addEvent() {
        let instance = this;
        this.element.click(function() {
            instance.currentElement = $(this);
            let element = $("." + instance.option.fileClass);
            if (element.length < 1) {
                let file = document.createElement("input");
                file.type = "file";
                file.className = instance.option.fileClass;
                file.multiple = instance.option.multiple;
                file.accept = instance.option.filter;
                document.body.appendChild(file);
                element = $(file).bind("change", function() {
                    $.each(this.files, function(i, file) {
                        instance.uploadOne(file);
                    });
                }).hide();
            } else {
                element.val('');
                element.attr('multiple', instance.option.multiple ? "true" : "false");
                element.attr('accept', instance.option.filter);
                if (instance.option.dynamic) {
                    element.unbind("change").bind("change", function() {
                        $.each(this.files, function(i, file) {
                            instance.uploadOne(file);
                        });
                    });
                }
            }
            element.click();
        });
        $(this.option.grid).on("click", this.option.removeTag, this.option.removeCallback);
    }

    public uploadOne(file: File) {
        if (this.option.beforeUpload && this.option.beforeUpload.call(this, file, this.currentElement) == false) {
            return;
        }
        let instance = this;
        let data = new FormData();
            data.append(this.option.name, file);
            $.ajax({
                url: this.option.url,
                type:'POST',
                data: data,
                cache: false,
                contentType: false,    //不可缺
                processData: false,    //不可缺
                success: function(data) {
                    data = instance.option.afterUpload.call(instance, data, instance.currentElement);
                    if (data != false) {
                        instance.deal($.extend({}, instance.option.data, data));
                        return;
                    }
                }
            });
    }

    public deal(data: any) {
        let urlFor = this.currentElement.attr("data-grid") || this.option.grid;
        if (!urlFor || (this.success && false === this.success(data, this.currentElement))) {
            return;
        }
        let tags = urlFor.split("|");
        let value = this.replace(data);
        let instance = this;
        tags.forEach(function(tag) {
            let item = instance.getElement(tag, instance.currentElement);
            if (item.length == 0) {
                return;
            }
            item.each(function(i, element) {
                let ele = $(element);
                if (ele.is('input') || ele.is('textarea')) {
                    ele.val(value);
                    return;
                }
                if (ele.is('img')) {
                    ele.attr("src", value);
                    return;
                }
                if (instance.option.isAppend) {
                    ele.append(value);
                } else {
                    ele.prepend(value);
                }
            });
        });
    }

    public getData(): any {
        let data = {};
        let arg = this.element.attr("data-data");
        if (!arg) {
            return data;
        }
        let args = arg.split(",");
        args.forEach(function(item) {
            let keyValue = item.split(":");
            let key = keyValue[0].trim();
            if (key) {
                data[key] = keyValue[1].trim();
            }
        });
        return data;
    }

    public replace(data: Object): string {
        let html = this.option.template;
        for (let i in data) {
            if (data.hasOwnProperty(i)) {
                html = html.replace(new RegExp("{" + i + "}", 'g'), data[i]);
            }
        }
        return html;
    }
}

interface UploadOption {
    [setting: string]: any,
    url?: string,         // 上传网址
    name?: string,        // 上传名
    isAppend?: boolean,    //在后面加还是前面加 ，对多个有效
    template?: string,    // 模板
    grid?: string,        // 装载容器
    data?: any,           //默认值
    removeTag?: string,   // 删除标志
    removeCallback?: (eventObject: JQueryEventObject, ...eventData: any[]) => any,  //删除触发事件
    multiple?: boolean,   // 是否允许上传多个
    fileClass?: string,   // 上传文件Class 名
    filter?: string,       // 文件过滤
    beforeUpload?: (file: File, currentElement: JQuery) => any,  //验证要上传的文件
    afterUpload?: (data: any, currentElement: JQuery) => any,   //验证上传返回数据
    success?: (data: any, currentElement: JQuery) => boolean ,     //成功添加回掉
    dynamic?: boolean, //是否动态绑定上传时间
    getElement?: (tag: string, currentElement: JQuery) => JQuery   //获取容器的方法
}

class UploadDefaultOption implements UploadOption {
    [setting: string]: any;
    name: string = "file";
    isAppend: boolean = true;
    template: string = "<li>{url}</li>";
    //grid: string = ".zdGrid";
    removeTag: string = ".delete";
    removeCallback: (eventObject: JQueryEventObject, ...eventData: any[]) => any = function() {
        $(this).parent().remove();
    };
    multiple: boolean = false;
    data: any = {};
    fileClass: string = "zdUploadFile";
    filter: string = "";
    afterUpload: (data: any) => any = function(data: any) {
        // 防止ajax自动转化json
        if (typeof data != 'object') {
            data = JSON.parse(data);
        }
        if (data.code == 0) {
            return data.data;
        }
        return false;
    };
    dynamic: boolean = true;
    getElement: (tag: string, currentElement: JQuery) => JQuery = function(tag: string): JQuery {
        return $(tag);
    }
}


;(function($: any) {
  $.fn.upload = function(option ?: UploadOption) {
    return new Upload(this, option); 
  };
})(jQuery);