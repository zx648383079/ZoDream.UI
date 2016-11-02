var Upload = (function () {
    function Upload(element, option) {
        this.element = element;
        this.option = $.extend({}, new UploadDefaultOption(), option);
        this.addEvent();
    }
    Upload.prototype.addEvent = function () {
        var instance = this;
        this.element.click(function () {
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
            }
            element.click();
        });
        $(this.option.grid).on("click", this.option.removeTag, this.option.removeCallback);
    };
    Upload.prototype.uploadOne = function (file) {
        var instance = this;
        var data = new FormData();
        data.append(this.option.name, file);
        $.ajax({
            url: this.option.url,
            type: 'POST',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                data = JSON.parse(data);
                if (data.state == "SUCCESS") {
                    instance.deal(data);
                    return;
                }
            }
        });
    };
    Upload.prototype.deal = function (data) {
        if (this.option.grid) {
            $(this.option.grid).append(this.replace(data));
        }
        var urlFor = this.element.attr("data-url");
        if (!urlFor) {
            return;
        }
        var tags = urlFor.split("|");
        $(tags).each(function (index, element) {
            var item = $(element);
            if (item.length == 0) {
                return;
            }
            if (item.attr("type") == "text") {
                item.val(data.url);
            }
            item.attr("src", data.url);
        });
    };
    Upload.prototype.replace = function (data) {
        var html = this.option.template;
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                html = html.replace("{" + i + "}", data[i]);
            }
        }
        return html;
    };
    return Upload;
}());
var UploadDefaultOption = (function () {
    function UploadDefaultOption() {
        this.name = "file";
        this.template = "<li>{url}</li>";
        //grid: string = ".zdGrid";
        this.removeTag = ".delete";
        this.removeCallback = function () {
            $(this).parent().remove();
        };
        this.multiple = false;
        this.fileClass = "zdUploadFile";
    }
    return UploadDefaultOption;
}());
;
(function ($) {
    $.fn.upload = function (option) {
        return new Upload(this, option);
    };
})(jQuery);
//# sourceMappingURL=jquery.upload.js.map