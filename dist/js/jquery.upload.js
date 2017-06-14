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
var Upload = (function () {
    function Upload(element, option) {
        this.element = element;
        this.option = $.extend({}, new UploadDefaultOption(), option);
        this.option.data = $.extend({}, this.option.data, this.getData());
        if (this.option.success) {
            this.success = this.option.success.bind(this);
        }
        this.getElement = this.option.getElement.bind(this);
        this.addEvent();
    }
    Upload.prototype.addEvent = function () {
        var instance = this;
        this.element.click(function () {
            instance.currentElement = $(this);
            var element = $("." + instance.option.fileClass);
            if (element.length < 1) {
                var file = document.createElement("input");
                file.type = "file";
                file.className = instance.option.fileClass;
                file.multiple = instance.option.multiple;
                file.accept = instance.option.filter;
                document.body.appendChild(file);
                element = $(file).bind("change", function () {
                    $.each(this.files, function (i, file) {
                        instance.uploadOne(file);
                    });
                }).hide();
            }
            else {
                element.val('');
                element.attr('multiple', instance.option.multiple ? "true" : "false");
                element.attr('accept', instance.option.filter);
                if (instance.option.dynamic) {
                    element.unbind("change").bind("change", function () {
                        $.each(this.files, function (i, file) {
                            instance.uploadOne(file);
                        });
                    });
                }
            }
            element.click();
        });
        $(this.option.grid).on("click", this.option.removeTag, this.option.removeCallback);
    };
    Upload.prototype.uploadOne = function (file) {
        var instance = this;
        var data = new FormData();
        data.append(this.option.name, file);
        if (this.option.beforeUpload && this.option.beforeUpload.call(this, data, this.currentElement) == false) {
            return;
        }
        $.ajax({
            url: this.option.url,
            type: 'POST',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                data = instance.option.afterUpload.call(instance, data, instance.currentElement);
                if (data != false) {
                    instance.deal($.extend({}, instance.option.data, data));
                    return;
                }
            }
        });
    };
    Upload.prototype.deal = function (data) {
        var urlFor = this.currentElement.attr("data-grid") || this.option.grid;
        if (!urlFor || (this.success && false === this.success(data, this.currentElement))) {
            return;
        }
        var tags = urlFor.split("|");
        var value = this.replace(data);
        var instance = this;
        tags.forEach(function (tag) {
            var item = instance.getElement(tag, instance.currentElement);
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
                    ele.attr("src", value);
                    return;
                }
                if (instance.option.isAppend) {
                    ele.append(value);
                }
                else {
                    ele.prepend(value);
                }
            });
        });
    };
    Upload.prototype.getData = function () {
        var data = {};
        var arg = this.element.attr("data-data");
        if (!arg) {
            return data;
        }
        var args = arg.split(",");
        args.forEach(function (item) {
            var keyValue = item.split(":");
            var key = keyValue[0].trim();
            if (key) {
                data[key] = keyValue[1].trim();
            }
        });
        return data;
    };
    Upload.prototype.replace = function (data) {
        var html = this.option.template;
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                html = html.replace(new RegExp("{" + i + "}", 'g'), data[i]);
            }
        }
        return html;
    };
    return Upload;
}());
var UploadDefaultOption = (function () {
    function UploadDefaultOption() {
        this.name = "file";
        this.isAppend = true;
        this.template = "<li>{url}</li>";
        //grid: string = ".zdGrid";
        this.removeTag = ".delete";
        this.removeCallback = function () {
            $(this).parent().remove();
        };
        this.multiple = false;
        this.data = {};
        this.fileClass = "zdUploadFile";
        this.filter = "";
        this.afterUpload = function (data) {
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
    }
    return UploadDefaultOption;
}());
;
(function ($) {
    $.fn.upload = function (option) {
        return new Upload(this, option);
    };
})(jQuery);
