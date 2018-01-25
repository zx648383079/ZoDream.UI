class DialogForm extends DialogBox {
    constructor(
        option: DialogOption,
        id?: number
    ) {
        super(option, id);
    }

    private _data: {[name: string]: string | string[]};

    /**
     * 表单数据
     */
    public get data(): {[name: string]: string | string[]} {
        if (!this._data) {
            this._data = this._getFormData();
        }
        return this._data;
    }

    private _elements: {[name: string]: JQuery};
    /**
     * 表单控件
     */
    public get elements(): {[name: string]: JQuery} {
        if (!this._elements) {
            this._elements = this._getFormElement();
        }
        return this._elements;
    }

    protected getContentHtml(): string {
        return '<div class="dialog-body">'+ this._createForm(this.options.content) +'</div>';
    }

    private _createForm(data: any): string {
        if (typeof data != 'object') {
            return data;
        }
        let html = '';
        let instance = this;
        $.each(data, function(name: string, item: any) {
            html += instance._createInput(name, item);
        });
        return html;
    }

    private _createInput(name: string, data: any): string {
        if (typeof data != 'object') {
            data = {label: data};
        }
        if (!data.type) {
            data.type = !data.item ? 'text' : 'select';
        }
        let attr = '';
        let html = '';
        let defaultVal = '';
        if (data.default) {
            defaultVal = data.default;
        }
        if (data.value) {
            defaultVal = data.value;
        }
        if (data.label) {
            html += '<label>'+data.label+'</label>'; 
        }
        if (data.id) {
            attr += ' id="'+data.id+'"';
        }
        if (data.class) {
            attr += ' class="'+data.class+'"';
        }
        if (data.required) {
            attr += ' required="required"';
        }
        if (data.placeholder) {
            attr += ' placeholder="'+data.placeholder+'"';
        }
        switch (data.type) {
            case 'textarea':
                html += '<textarea name="'+name+'" '+attr+'>'+defaultVal+'</textarea>';
                break;
            case 'select':
                let option = '';
                $.each(data.item, function(val, label) {
                    if (val == defaultVal) {
                        val += '" selected="selected';
                    }
                    option += '<option value="'+val+'">'+label+'</option>';
                });
                html += '<select name="'+name+'" '+attr+'>'+option+'<select>';
                break;
            case 'radio':
            case 'checkbox':
                html += '<div'+attr+'>'
                $.each(data.item, function(val, label) {
                    if (val == defaultVal) {
                        val += '" checked="checked';
                    }
                    html += '<input type="'+data.type+'" name="'+name+'" value="'+val+'">' + label;
                });
                html += '<div>';
                break;
            default:
                html += '<input type="'+data.type+'" name="'+name+'" '+attr+' value="'+defaultVal+'">';
                break;
        }
        return '<div class="input-group">'+html+'</div>';
    }

    /**
     * 获取表单控件
     */
    private _getFormElement():{[name:string]: JQuery} {
        let elements = {};
        let instance = this;
        this.box.find('input,select,textarea,button').each(function(i, ele) {
            let item = $(ele);
            let name = item.attr('name');
            if (!name) {
                return;
            }
            if (!item.is('[type=ridio]') && !item.is('[type=checkbox]') && name.indexOf('[]') < 0) {
                elements[name] = item;
                return;
            }
            if (!elements.hasOwnProperty(name)) {
                elements[name] = item;
                return;
            }
            elements[name].push(ele);
        });
        return elements;
    }

    /**
     * 获取表单数据
     */
    private _getFormData(): {[name: string]: any} {
        let formData = {};
        $.each(this.elements, function(name: string, element: JQuery) {
            if (element.is('[type=ridio]')) {
                element.each(function(i, ele) {
                    let item = $(ele);
                    if (item.attr('checked')) {
                        formData[name] = item.val();
                    }
                });
                return;
            }
            if (element.is('[type=checkbox]')) {
                let data = [];
                element.each(function(i, ele) {
                    let item = $(ele);
                    if (item.attr('checked')) {
                       data.push(item.val());
                    }
                });
                formData[name] = data;
                return;
            }
            if (name.indexOf('[]') > 0) {
                let data = [];
                element.each(function(i, ele) {
                    let item = $(ele);
                    data.push(item.val());
                });
                formData[name] = data;
                return;
            }
            formData[name] = element.val();
        });
        return formData;
    }
    
}

Dialog.addMethod(DialogType.form, DialogForm);