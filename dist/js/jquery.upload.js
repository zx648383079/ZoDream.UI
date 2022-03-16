var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var Eve = /** @class */ (function () {
    function Eve() {
    }
    Eve.prototype.on = function (event, callback) {
        this.options['on' + event] = callback;
        return this;
    };
    Eve.prototype.hasEvent = function (event) {
        return this.options.hasOwnProperty('on' + event);
    };
    Eve.prototype.trigger = function (event) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var realEvent = 'on' + event;
        if (!this.hasEvent(event)) {
            return;
        }
        return (_a = this.options[realEvent]).call.apply(_a, __spreadArray([this], args));
    };
    return Eve;
}());
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
var Upload = /** @class */ (function (_super) {
    __extends(Upload, _super);
    function Upload(element, option) {
        var _this_1 = _super.call(this) || this;
        _this_1.element = element;
        _this_1.options = $.extend({}, new UploadDefaultOption(), option);
        _this_1.options.data = $.extend({}, _this_1.options.data, _this_1.getData());
        _this_1.getElement = _this_1.options.getElement.bind(_this_1);
        if (_this_1.element) {
            _this_1.addEvent();
        }
        return _this_1;
    }
    Upload.prototype.addEvent = function () {
        var _this = this;
        this.element.on('click', function () {
            _this.start($(this));
        });
        if (this.options.grid) {
            $(this.options.grid).on('click', this.options.removeTag, this.options.removeCallback);
        }
    };
    Upload.prototype.start = function (currentElement) {
        this.currentElement = currentElement;
        var _this = this;
        var element = $('.' + this.options.fileClass);
        if (element.length < 1) {
            var file = document.createElement('input');
            file.type = 'file';
            file.className = this.options.fileClass;
            file.multiple = this.options.multiple;
            file.accept = this.options.filter;
            document.body.appendChild(file);
            element = $(file).on('change', function () {
                _this.uploadFiles(this.files);
            }).hide();
        }
        else {
            element.val('');
            element.attr('multiple', this.options.multiple ? 'true' : 'false');
            element.attr('accept', this.options.filter);
            if (this.options.dynamic) {
                element.off('change').on('change', function () {
                    _this.uploadFiles(this.files);
                });
            }
        }
        element.trigger('click');
    };
    Upload.prototype.uploadFiles = function (files) {
        if (this.options.allowMultiple) {
            this.uploadMany(files);
            return;
        }
        var _this = this;
        $.each(files, function (i, file) {
            _this.uploadOne(file);
        });
    };
    Upload.prototype.uploadMany = function (files) {
        var _this = this, data;
        if (this.options.ondealfile) {
            data = this.options.ondealfiles.call(this, files);
        }
        else {
            data = new FormData();
            $.each(files, function (i, file) {
                data.append(_this.options.name, file);
            });
        }
        if (this.trigger('before', data, this.currentElement) === false) {
            console.log('before upload is false');
            return;
        }
        this.uploadForm(data, function (data) {
            if (data instanceof Array) {
                $.each(data, function (i, item) {
                    _this.deal($.extend({}, _this.options.data, item));
                });
                return;
            }
            _this.deal($.extend({}, _this.options.data, data));
        });
    };
    Upload.prototype.uploadOne = function (file) {
        var _this = this, data, deal_data = this.trigger('dealfile', file);
        if (deal_data === false) {
            console.log('deal file is false');
            return;
        }
        if (deal_data) {
            data = deal_data;
        }
        else {
            data = new FormData();
            data.append(this.options.name, file);
        }
        if (this.trigger('before', data, this.currentElement) === false) {
            console.log('before upload is false');
            return;
        }
        this.uploadForm(data, function (data) {
            _this.deal($.extend({}, _this.options.data, data));
        });
    };
    Upload.prototype.uploadForm = function (data, cb) {
        var _this = this;
        var opts = {
            url: this.options.url,
            type: 'POST',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
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
            opts['xhr'] = function () {
                var xhr = $.ajaxSetup({}).xhr();
                if (_this.options.onprogress && xhr.upload) {
                    xhr.upload.addEventListener('progress', _this.options.onprogress, false);
                }
                return xhr;
            };
        }
        $.ajax(opts);
    };
    Upload.prototype.formatFileSize = function (fileSize) {
        var sizeUnitArr = ['Byte', 'KB', 'MB', 'GB'];
        if (fileSize == 0) {
            return "0 KB";
        }
        var i = Math.floor(Math.log(fileSize) / Math.log(1024));
        if (i == 0) {
            return fileSize + sizeUnitArr[i];
        }
        return (fileSize / Math.pow(1024, i)).toFixed(1) + sizeUnitArr[i];
    };
    Upload.prototype.sliceUpload = function (file, cb) {
        var maxLength = 1024 * 1024, _this = this, totalSize = file.size, name, chunks = Math.ceil(totalSize / maxLength), chunk = 0, startUpload = function () {
            var blobFrom = chunk * maxLength, blobTo = Math.min((chunk + 1) * maxLength, totalSize), data = new FormData();
            data.append(_this.options.name, file.slice(blobFrom, blobTo));
            if (name) {
                data.append('name', name);
            }
            data.append('real_name', file.name);
            data.append('total', totalSize + '');
            data.append('status', (chunk == (chunks - 1) ? 2 : (chunk == 0 ? 0 : 1)) + '');
            _this.uploadForm(data, function (res) {
                cb && cb({
                    total: totalSize,
                    size: blobTo
                }, _this.currentElement);
                if (chunk === (chunks - 1)) {
                    _this.deal($.extend({}, _this.options.data, res));
                    return;
                }
                name = res.name;
                chunk++;
                startUpload();
            });
        };
        startUpload();
    };
    /** 图片压缩 start  */
    Upload.prototype.photoCompress = function (file, options, cb) {
        var ready = new FileReader(), _this = this;
        /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
        ready.readAsDataURL(file);
        ready.onload = function () {
            var re = this.result;
            _this._canvasDataURL(re, options, cb);
        };
    };
    Upload.prototype._canvasDataURL = function (path, obj, callback) {
        var img = new Image();
        img.src = path;
        img.onload = function () {
            var that = this;
            // 默认按比例压缩
            var w = that.width, h = that.height, scale = w / h;
            w = obj.width || w;
            h = obj.height || (w / scale);
            var quality = 0.7; // 默认图片质量为0.7
            //生成canvas
            var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
            // 创建属性节点
            var anw = document.createAttribute("width");
            anw.nodeValue = w + '';
            var anh = document.createAttribute("height");
            anh.nodeValue = h + '';
            canvas.setAttributeNode(anw);
            canvas.setAttributeNode(anh);
            ctx.drawImage(that, 0, 0, w, h);
            // 图像质量
            if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
                quality = obj.quality;
            }
            // quality值越小，所绘制出的图像越模糊
            var base64 = canvas.toDataURL('image/jpeg', quality);
            // 回调函数返回base64的值
            callback(base64);
        };
    };
    /**
     * 将以base64的图片url数据转换为Blob
     * @param urlData
     *            用url方式表示的base64图片数据
     */
    Upload.prototype.convertBase64UrlToBlob = function (urlData) {
        var arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };
    /** 压缩处理end  */
    Upload.prototype.deal = function (data) {
        var value = typeof this.options.template == 'function' ? this.options.template.call(this, data) : this.replace(data);
        if (value == false) {
            console.log('template is false');
            return;
        }
        if (false === this.trigger('success', data, this.currentElement)) {
            console.log('success is false');
            return;
        }
        var urlFor = this.options.grid;
        if (this.currentElement && this.currentElement.length > 0) {
            urlFor = this.currentElement.attr('data-grid') || this.options.grid;
        }
        if (!urlFor) {
            console.log('grid element is false');
            return;
        }
        var tags = urlFor.split('|');
        var _this = this;
        tags.forEach(function (tag) {
            var item = _this.getElement(tag, _this.currentElement);
            if (item.length == 0) {
                return;
            }
            item.each(function (i, element) {
                var ele = $(element);
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
                }
                else {
                    ele.prepend(value);
                }
            });
        });
    };
    Upload.prototype.getData = function () {
        if (!this.element || this.element.length < 1) {
            return {};
        }
        var data = {};
        var arg = this.element.attr('data-data');
        if (!arg) {
            return data;
        }
        var args = arg.split(',');
        args.forEach(function (item) {
            var keyValue = item.split(':');
            var key = keyValue[0].trim();
            if (key) {
                data[key] = keyValue[1].trim();
            }
        });
        return data;
    };
    Upload.prototype.replace = function (data) {
        var html = typeof this.options.template == 'function' ? this.options.template.call(this, data) : this.options.template;
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                html = html.replace(new RegExp('{' + i + '}', 'g'), data[i]);
            }
        }
        return html;
    };
    return Upload;
}(Eve));
var UploadDefaultOption = /** @class */ (function () {
    function UploadDefaultOption() {
        this.name = 'file';
        this.isAppend = true;
        this.template = '{url}';
        //grid: string = '.zdGrid';
        this.removeTag = '.delete';
        this.removeCallback = function () {
            $(this).parent().remove();
        };
        this.multiple = false;
        this.allowMultiple = false;
        this.data = {};
        this.fileClass = 'zdUploadFile';
        this.filter = '';
        this.onafter = function (data) {
            // 防止ajax自动转化json
            if (typeof data != 'object') {
                data = JSON.parse(data);
            }
            if (data.code == 0) {
                return data.data;
            }
            return false;
        };
        this.dynamic = true;
        this.getElement = function (tag) {
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
    return UploadDefaultOption;
}());
;
(function ($) {
    $.fn.upload = function (option) {
        return new Upload(this, option);
    };
})(jQuery);
