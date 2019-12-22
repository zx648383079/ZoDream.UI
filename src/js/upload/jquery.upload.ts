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
        let _this = this;
        this.element.click(function() {
            _this.start($(this));
        });
        if (this.options.grid) {
            $(this.options.grid).on('click', this.options.removeTag, this.options.removeCallback);
        }
    }

    public start(currentElement?: JQuery) {
        this.currentElement = currentElement;
        let _this = this;
        let element = $('.' + this.options.fileClass);
        if (element.length < 1) {
            let file = document.createElement('input');
            file.type = 'file';
            file.className = this.options.fileClass;
            file.multiple = this.options.multiple;
            file.accept = this.options.filter;
            document.body.appendChild(file);
            element = $(file).bind('change', function(this: HTMLInputElement) {
                _this.uploadFiles(this.files);
            }).hide();
        } else {
            element.val('');
            element.attr('multiple', this.options.multiple ? 'true' : 'false');
            element.attr('accept', this.options.filter);
            if (this.options.dynamic) {
                element.unbind('change').bind('change', function(this: HTMLInputElement) {
                    _this.uploadFiles(this.files);
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
        let _this = this;
        $.each(files, function(i, file) {
            _this.uploadOne(file);
        });
    }

    public uploadMany(files) {
        let _this = this,
            data: FormData;
        if (this.options.ondealfile) {
            data = this.options.ondealfiles.call(this, files);
        } else {
            data = new FormData();
            $.each(files, function(i, file) {
                data.append(_this.options.name, file);
            });
        }
        if (this.trigger('before', data, this.currentElement) === false) {
            console.log('before upload is false');
            return;
        }
        this.uploadForm(data, function(data) {
            if (data instanceof Array) {
                $.each(data, function(i, item) {
                    _this.deal($.extend({}, _this.options.data, item));
                });
                return;
            }
            _this.deal($.extend({}, _this.options.data, data));
        });
    }

    public uploadOne(file: File) {
        let _this = this,
            data: FormData,
            deal_data = this.trigger('dealfile', file);
        if (deal_data === false) {
            console.log('deal file is false');
            return;
        }
        if (deal_data) {
            data = deal_data;
        } else {
            data = new FormData();
            data.append(this.options.name, file);
        }
        
        if (this.trigger('before', data, this.currentElement) === false) {
            console.log('before upload is false');
            return;
        }
        this.uploadForm(data, function(data) {
            _this.deal($.extend({}, _this.options.data, data));
        });
    }

    public uploadForm(data: FormData, cb?: (data: any)=>void) {
        let _this = this;
        let opts = {
            url: this.options.url,
            type:'POST',
            data: data,
            cache: false,
            contentType: false,    //不可缺
            processData: false,    //不可缺
            success: function(data) {
                data = _this.trigger('after', data, _this.currentElement);
                if (data == false) {
                    console.log('after upload is false');
                    return;
                }
                cb && cb(data);
            }
        };
        if (this.options.timeout) {
            opts['timeout'] = this.options.timeout;
        }
        if (_this.options.onprogress) {
            opts['xhr'] = function(){
                let xhr = $.ajaxSettings.xhr();
                if(_this.options.onprogress && xhr.upload) {
                    xhr.upload.addEventListener('progress' , _this.options.onprogress, false);
                }
                return xhr;
            };
        }
        $.ajax(opts as any);
    }

    public formatFileSize(fileSize): string {
        let sizeUnitArr = ['Byte','KB','MB','GB'];
        if (fileSize == 0) {
            return "0 KB";
        }
        let i = Math.floor(Math.log(fileSize) / Math.log(1024));
        if (i == 0) {
            return fileSize + sizeUnitArr[i];
        }
        return (fileSize / Math.pow(1024, i)).toFixed(1) + sizeUnitArr[i];
    }


    public sliceUpload(file: File, cb?: (data: any, currentElement: JQuery) => void) {
        let maxLength = 1024 * 1024,
            _this = this,
            totalSize = file.size,
            name: string,
            chunks = Math.ceil(totalSize / maxLength),
            chunk = 0,
            startUpload = function() {
                let blobFrom = chunk * maxLength,
                    blobTo = Math.min((chunk + 1) * maxLength, totalSize),
                    data = new FormData();
                data.append(_this.options.name, file.slice(blobFrom, blobTo));
                if (name) {
                    data.append('name', name);
                }
                data.append('real_name', file.name);
                data.append('total', totalSize + '');
                data.append('status', (chunk == (chunks - 1) ? 2 : (chunk == 0 ? 0 : 1)) + '');
                _this.uploadForm(data, (res) => {
                    cb && cb({
                        total: totalSize,
                        size: blobTo
                    }, _this.currentElement);
                    if (chunk === (chunks - 1)) {
                        _this.deal($.extend({}, _this.options.data, res));
                        return;
                    }
                    name = res.name;
                    chunk ++;
                    startUpload();
                });
            };
        startUpload();
    }


    /** 图片压缩 start  */

    public photoCompress(file: File, options: any, cb: (data: string) => void){
        let ready = new FileReader(),
            _this = this;
        /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
        ready.readAsDataURL(file);
        ready.onload = function(){
            let re = this.result;
            _this._canvasDataURL(re as string, options, cb)
        }
    }
    private _canvasDataURL(path: string, obj: any, callback: (data: string) => void){
        let img = new Image();
        img.src = path;
        img.onload = function(this: HTMLImageElement){
            let that = this;
            // 默认按比例压缩
            let w = that.width,
                h = that.height,
                scale = w / h;
            w = obj.width || w;
            h = obj.height || (w / scale);
            let quality = 0.7;  // 默认图片质量为0.7
            //生成canvas
            let canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d');
            // 创建属性节点
            let anw = document.createAttribute("width");
            anw.nodeValue = w + '';
            let anh = document.createAttribute("height");
            anh.nodeValue = h + '';
            canvas.setAttributeNode(anw);
            canvas.setAttributeNode(anh);
            ctx.drawImage(that, 0, 0, w, h);
            // 图像质量
            if(obj.quality && obj.quality <= 1 && obj.quality > 0){
                quality = obj.quality;
            }
            // quality值越小，所绘制出的图像越模糊
            let base64 = canvas.toDataURL('image/jpeg', quality);
            // 回调函数返回base64的值
            callback(base64);
        }
    }
    /**
     * 将以base64的图片url数据转换为Blob
     * @param urlData
     *            用url方式表示的base64图片数据
     */
    public convertBase64UrlToBlob(urlData: string){
        var arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    /** 压缩处理end  */

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
        let _this = this;
        tags.forEach(function(tag) {
            let item = _this.getElement(tag, _this.currentElement);
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
                if (_this.options.isAppend) {
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
    timeout?: number,
    removeTag?: string,   // 删除标志
    removeCallback?: (eventObject: JQueryEventObject, ...eventData: any[]) => any,  //删除触发事件
    multiple?: boolean,   // 是否允许上传多个
    fileClass?: string,   // 上传文件Class 名
    filter?: string,       // 文件过滤
    ondealfile?: (file: File) => FormData | void,
    ondealfiles?: (file: FileList) => FormData | void,
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
    };
    // ondealfile: (file: File) => FormData| void = function(file: File) {
    //     if(file.size/1024 > 1025) { //大于1M，进行压缩上传
    //         this.photoCompress(file, {
    //             quality: 0.2
    //         }, function(base64Codes){
    //             //console.log("压缩后：" + base.length / 1024 + " " + base);
    //             let data = new FormData();
    //             let bl = this.convertBase64UrlToBlob(base64Codes);
    //             data.append("file", bl, "file_"+new Date().getTime()+".jpg"); // 文件对象
    //             this.uploadForm(data);
    //         });
    //         return;
    //     }
    // }
}


;(function($: any) {
  $.fn.upload = function(option ?: UploadOption) {
    return new Upload(this, option); 
  };
})(jQuery);