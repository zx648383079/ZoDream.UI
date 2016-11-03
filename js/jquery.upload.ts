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
                        instance.deal(data);
                        return;
                    }
                }
            });
    }

    public deal(data) {
        let urlFor = this.element.attr("data-grid") || this.option.grid;
        if (!urlFor) {
            return;
        }
        let tags = urlFor.split("|");
        let value = this.replace(data);
        $(tags).each(function(index, tag) {
            let item = $(tag);
            if (item.length == 0) {
                return;
            }
            item.each(function(i, element) {
                switch (element.nodeName.toUpperCase()) {
                    case "INPUT":
                        item.val(value);
                        return;
                    case "IMG":
                        item.attr("src", value);
                        return;
                    default:
                        break;
                }
                item.append(value);
            });
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
    filter?: string,       // 文件过滤
}

class UploadDefaultOption implements UploadOption {
    name: string = "file";
    template: string = "<li>{url}</li>";
    //grid: string = ".zdGrid";
    removeTag: string = ".delete";
    removeCallback: (eventObject: JQueryEventObject, ...eventData: any[]) => any = function() {
        $(this).parent().remove();
    };
    multiple: boolean = false;
    fileClass: string = "zdUploadFile";
    filter: string = "";
}


;(function($: any) {
  $.fn.upload = function(option ?: UploadOption) {
    return new Upload(this, option); 
  };
})(jQuery);