/*!
 * jquery.upload - https://github.com/zx648383079/ZoDream.UI
 * Version - 1.0
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2017 ZoDream
 */
/**
 * EXAMPLE:
 * $('#upload').upload({
 *      url: 'upload.php',
 *      name: 'file',
 *      template: '{url}',
 *      grid: '.img'
 * });
 */
class Upload extends Eve {
    constructor(
        public element?: JQuery,
        option?: UploadOption
    ) {
        super();
        this.options = $.extend({}, new UploadDefaultOption(), option);
        this.options.data = $.extend({}, this.options.data, this.getData());
        this.getElement = this.options.getElement.bind(this);
        if (this.element) {
            this.addEvent();
        }
    }

    public options: UploadOption;

    public success: (data: any, currentElement: JQuery) => boolean;

    public getElement: (tag: string, currentElement: JQuery) => JQuery;

    private currentElement: JQuery;

    public addEvent() {
        let instance = this;
        this.element.click(function() {
            instance.currentElement = $(this);
            instance.start();
        });
        $(this.options.grid).on('click', this.options.removeTag, this.options.removeCallback);
    }

    public start() {
        let instance = this;
        let element = $('.' + this.options.fileClass);
        if (element.length < 1) {
            let file = document.createElement('input');
            file.type = 'file';
            file.className = this.options.fileClass;
            file.multiple = this.options.multiple;
            file.accept = this.options.filter;
            document.body.appendChild(file);
            element = $(file).bind('change', function() {
                instance.uploadFiles(this.files);
            }).hide();
        } else {
            element.val('');
            element.attr('multiple', this.options.multiple ? 'true' : 'false');
            element.attr('accept', this.options.filter);
            if (this.options.dynamic) {
                element.unbind('change').bind('change', function() {
                    instance.uploadFiles(this.files);
                });
            }
        }
        element.click();
    }

    public uploadFiles(files) {
        if (this.options.allowMultiple) {
            this.uploadMany(files);
            return;
        }
        let instance = this;
        $.each(files, function(i, file) {
            instance.uploadOne(file);
        });
    }

    public uploadMany(files) {
        let instance = this;
        let data = new FormData();
        $.each(files, function(i, file) {
            data.append(instance.options.name, file);
        });
        if (this.trigger('before', data, this.currentElement) === false) {
            console.log('before upload is false');
            return;
        }
        let opts = {
            url: this.options.url,
            type:'POST',
            data: data,
            cache: false,
            contentType: false,    //不可缺
            processData: false,    //不可缺
            success: function(data) {
                data = instance.trigger('after', data, instance.currentElement);
                if (data == false) {
                    console.log('after upload is false');
                    return;
                }
                if (data instanceof Array) {
                    $.each(data, function(i, item) {
                        instance.deal($.extend({}, instance.options.data, item));
                    });
                    return;
                }
                instance.deal($.extend({}, instance.options.data, data));
            }
        };
        if (this.hasEvent('progress')) {
            opts['xhr'] = function(){
                let xhr = $.ajaxSettings.xhr();
                if(onprogress && xhr.upload) {
                    xhr.upload.addEventListener('progress' , this.options.onprogress, false);
                    return xhr;
                }
            };
        }
        $.ajax(opts);
    }

    public uploadOne(file: File) {
        let instance = this;
        let data = new FormData();
        data.append(this.options.name, file);
        if (this.trigger('before', data, this.currentElement) === false) {
            console.log('before upload is false');
            return;
        }
        let opts = {
            url: this.options.url,
            type:'POST',
            data: data,
            cache: false,
            contentType: false,    //不可缺
            processData: false,    //不可缺
            success: function(data) {
                data = instance.trigger('after', data, instance.currentElement);
                if (data == false) {
                    console.log('after upload is false');
                    return;
                }
                instance.deal($.extend({}, instance.options.data, data));
            }
        };
        if (this.hasEvent('progress')) {
            opts['xhr'] = function(){
                let xhr = $.ajaxSettings.xhr();
                if(onprogress && xhr.upload) {
                    xhr.upload.addEventListener('progress' , this.options.onprogress, false);
                    return xhr;
                }
            };
        }
        $.ajax(opts);
    }

    public deal(data: any) {
        let value = typeof this.options.template == 'function' ? this.options.template.call(this, data) : this.replace(data);
        if (value == false) {
            console.log('template is false');
            return;
        }
        if (false === this.trigger('success', data, this.currentElement)) {
            console.log('success is false');
            return;
        }
        let urlFor = this.options.grid;
        if (this.currentElement && this.currentElement.length > 0) {
            urlFor = this.currentElement.attr('data-grid') || this.options.grid;
        }
        if (!urlFor) {
            console.log('grid element is false');
            return;
        }
        let tags = urlFor.split('|');
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
                    ele.attr('src', value);
                    return;
                }
                if (instance.options.isAppend) {
                    ele.append(value);
                } else {
                    ele.prepend(value);
                }
            });
        });
    }

    public getData(): any {
        if (!this.element || this.element.length < 1) {
            return {};
        }
        let data = {};
        let arg = this.element.attr('data-data');
        if (!arg) {
            return data;
        }
        let args = arg.split(',');
        args.forEach(function(item) {
            let keyValue = item.split(':');
            let key = keyValue[0].trim();
            if (key) {
                data[key] = keyValue[1].trim();
            }
        });
        return data;
    }

    public replace(data: Object): string {
        let html: string = typeof this.options.template == 'function' ? this.options.template.call(this, data) : this.options.template;
        for (let i in data) {
            if (data.hasOwnProperty(i)) {
                html = html.replace(new RegExp('{' + i + '}', 'g'), data[i]);
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
    onbefore?: (data: FormData, currentElement: JQuery) => any,  //验证要上传的文件
    onafter?: (data: any, currentElement: JQuery) => any,   //验证上传返回数据
    onsuccess?: (data: any, currentElement: JQuery) => boolean ,     //成功添加回掉
    dynamic?: boolean, //是否动态绑定上传时间
    getElement?: (tag: string, currentElement: JQuery) => JQuery,   //获取容器的方法
    onprogress?: (data: any) => void, // 上传进度
    allowMultiple?: boolean,     // 是否允许上传一次多个
}

class UploadDefaultOption implements UploadOption {
    [setting: string]: any;
    name: string = 'file';
    isAppend: boolean = true;
    template: string = '{url}';
    //grid: string = '.zdGrid';
    removeTag: string = '.delete';
    removeCallback: (eventObject: JQueryEventObject, ...eventData: any[]) => any = function() {
        $(this).parent().remove();
    };
    multiple: boolean = false;
    allowMultiple: boolean = false;
    data: any = {};
    fileClass: string = 'zdUploadFile';
    filter: string = '';
    onafter: (data: any) => any = function(data: any) {
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