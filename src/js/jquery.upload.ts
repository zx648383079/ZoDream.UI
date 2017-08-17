/*!
 * jquery.upload - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
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
                    instance.uploadFiles(this.files);
                }).hide();
            } else {
                element.val('');
                element.attr('multiple', instance.option.multiple ? "true" : "false");
                element.attr('accept', instance.option.filter);
                if (instance.option.dynamic) {
                    element.unbind("change").bind("change", function() {
                        instance.uploadFiles(this.files);
                    });
                }
            }
            element.click();
        });
        $(this.option.grid).on("click", this.option.removeTag, this.option.removeCallback);
    }

    public uploadFiles(files) {
        if (this.option.allowMultiple) {
            this.uploadMany(files);
            return;
        }
        $.each(files, function(i, file) {
            this.uploadOne(file);
        });
    }

    public uploadMany(files) {
        let instance = this;
        let data = new FormData();
        $.each(files, function(i, file) {
            data.append(instance.option.name, file);
        });
        if (this.option.beforeUpload && this.option.beforeUpload.call(this, data, this.currentElement) == false) {
            console.log('before upload is false');
            return;
        }
        let opts = {
            url: this.option.url,
            type:'POST',
            data: data,
            cache: false,
            contentType: false,    //不可缺
            processData: false,    //不可缺
            success: function(data) {
                data = instance.option.afterUpload.call(instance, data, instance.currentElement);
                if (data == false) {
                    console.log('after upload is false');
                    return;
                }
                if (data instanceof Array) {
                    $.each(data, function(i, item) {
                        instance.deal($.extend({}, instance.option.data, item));
                    });
                    return;
                }
                instance.deal($.extend({}, instance.option.data, data));
            }
        };
        if (this.option.onUploadProgress) {
            opts['xhr'] = function(){
                let xhr = $.ajaxSettings.xhr();
                if(onprogress && xhr.upload) {
                    xhr.upload.addEventListener("progress" , this.option.onUploadProgress, false);
                    return xhr;
                }
            };
        }
        $.ajax(opts);
    }

    public uploadOne(file: File) {
        let instance = this;
        let data = new FormData();
        data.append(this.option.name, file);
        if (this.option.beforeUpload && this.option.beforeUpload.call(this, data, this.currentElement) == false) {
            console.log('before upload is false');
            return;
        }
        let opts = {
            url: this.option.url,
            type:'POST',
            data: data,
            cache: false,
            contentType: false,    //不可缺
            processData: false,    //不可缺
            success: function(data) {
                data = instance.option.afterUpload.call(instance, data, instance.currentElement);
                if (data == false) {
                    console.log('after upload is false');
                    return;
                }
                instance.deal($.extend({}, instance.option.data, data));
            }
        };
        if (this.option.onUploadProgress) {
            opts['xhr'] = function(){
                let xhr = $.ajaxSettings.xhr();
                if(onprogress && xhr.upload) {
                    xhr.upload.addEventListener("progress" , this.option.onUploadProgress, false);
                    return xhr;
                }
            };
        }
        $.ajax(opts);
    }

    public deal(data: any) {
        let value = typeof this.option.template == 'function' ? this.option.template.call(this, data) : this.replace(data);
        if (value == false) {
            console.log('template is false');
            return;
        }
        let urlFor = this.currentElement.attr("data-grid") || this.option.grid;
        if (!urlFor || (this.success && false === this.success(data, this.currentElement))) {
            console.log('element or success is false');
            return;
        }
        let tags = urlFor.split("|");
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
        let html: string = this.option.template;
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
    template?: string | Function,    // 模板
    grid?: string,        // 装载容器
    data?: any,           //默认值
    removeTag?: string,   // 删除标志
    removeCallback?: (eventObject: JQueryEventObject, ...eventData: any[]) => any,  //删除触发事件
    multiple?: boolean,   // 是否允许上传多个
    fileClass?: string,   // 上传文件Class 名
    filter?: string,       // 文件过滤
    beforeUpload?: (data: FormData, currentElement: JQuery) => any,  //验证要上传的文件
    afterUpload?: (data: any, currentElement: JQuery) => any,   //验证上传返回数据
    success?: (data: any, currentElement: JQuery) => boolean ,     //成功添加回掉
    dynamic?: boolean, //是否动态绑定上传时间
    getElement?: (tag: string, currentElement: JQuery) => JQuery,   //获取容器的方法
    onUploadProgress?: (data: any) => void, // 上传进度
    allowMultiple?: boolean,     // 是否允许上传一次多个
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
    allowMultiple: boolean = false;
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