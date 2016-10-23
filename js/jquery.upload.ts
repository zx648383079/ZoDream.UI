class Upload {
    constructor(
        public element: JQuery,
        option?: UploadOption
    ) {
        this.option = $.extend({}, new UploadDefaultOption(), option);
        this.addEvent();
    }

    public option: UploadOption;

    public addEvent() {
        let instance = this;
        this.element.click(function() {
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
            }
            element.click();
        });
        $(this.option.grid).on("click", this.option.removeTag, this.option.removeCallback);
    }

    public uploadOne(file) {
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
                    data = JSON.parse(data);
                    if (data.state == "SUCCESS") {
                        $(instance.option.grid).append(instance.replace(data));
                        return;
                    }
                }
            });
    }

    public replace(data: Object): string {
        let html = this.option.template;
        for (let i in data) {
            if (data.hasOwnProperty(i)) {
                html = html.replace("{"+i+"}", data[i]);
            }
        }
        return html;
    }
}

interface UploadOption {
    url?: string,         // 上传网址
    name?: string,        // 上传名
    template?: string,    // 模板
    grid?: string,        // 装载容器
    removeTag?: string,   // 删除标志
    removeCallback?: (eventObject: JQueryEventObject, ...eventData: any[]) => any,  //删除触发事件
    multiple?: boolean,   // 是否允许上传多个
    fileClass?: string,   // 上传文件Class 名
    filter?: string       // 文件过滤
}

class UploadDefaultOption implements UploadOption {
    name: string = "file";
    template: string = "<li>{url}</li>";
    grid: string = ".zdGrid";
    removeTag: string = ".delete";
    removeCallback: (eventObject: JQueryEventObject, ...eventData: any[]) => any = function() {
        $(this).parent().remove();
    };
    multiple: boolean = false;
    fileClass: string = "zdUploadFile";
}


;(function($: any) {
  $.fn.upload = function(option ?: UploadOption) {
    return new Upload(this, option); 
  };
})(jQuery);

function a() {
    var content = document.getElementById("content");
    if (content.offsetWidth < 600) {
        var tables = content.getElementsByTagName("table");
        for (var i = 0, length = tables.length; i < length; i ++) {
            var table = tables[i];
            table.style.width = "100%";
            var html = table.innerHTML;
            var matches = [];
            var match;
            var patt = new RegExp('<tr([^<>]*)>\s*(<td[^<>]*>.+?<\/td>)(.+?)<\/tr>', 'g');
            while ((match = patt.exec(html)) != null) {
                matches.push(match);
            }
            var td = '<td rowspan="' + matches.length +'"><div style="width:' + (table.offsetWidth - 100) +'px; overflow-y:auto"><table style="width:877px">';
            $(matches).each((i, item) => {
                td += '<tr' + item[1] +'>' + item[3] + '</tr>';
            });
            td += '</table></div></td>';

            html = '';
            $(matches).each((i, item) => {
                if (i == 0) {
                    html += '<tr' + item[1] +'>' + item[2] + td + '</tr>';
                } else {
                    html += '<tr' + item[1] +'>' + item[2] + '</tr>';
                }
            });
            table.innerHTML = html;
        }
    }
}