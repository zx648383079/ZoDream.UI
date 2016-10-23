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
                    $(instance.option.grid).append(instance.replace(data));
                    return;
                }
            }
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
        this.grid = ".zdGrid";
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
function a() {
    var content = document.getElementById("content");
    if (content.offsetWidth < 600) {
        var tables = content.getElementsByTagName("table");
        for (var i = 0, length = tables.length; i < length; i++) {
            var table = tables[i];
            table.style.width = "100%";
            var html = table.innerHTML;
            var matches = [];
            var match;
            var patt = new RegExp('<tr([^<>]*)>\s*(<td[^<>]*>.+?<\/td>)(.+?)<\/tr>', 'g');
            while ((match = patt.exec(html)) != null) {
                matches.push(match);
            }
            var td = '<td rowspan="' + matches.length + '"><div style="width:' + (table.offsetWidth - 100) + 'px; overflow-y:auto"><table style="width:877px">';
            $(matches).each(function (i, item) {
                td += '<tr' + item[1] + '>' + item[3] + '</tr>';
            });
            td += '</table></div></td>';
            html = '';
            $(matches).each(function (i, item) {
                if (i == 0) {
                    html += '<tr' + item[1] + '>' + item[2] + td + '</tr>';
                }
                else {
                    html += '<tr' + item[1] + '>' + item[2] + '</tr>';
                }
            });
            table.innerHTML = html;
        }
    }
}
//# sourceMappingURL=jquery.upload.js.map