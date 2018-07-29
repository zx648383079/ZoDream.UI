 class Region {
     constructor(
         public element: JQuery,
         option?: RegionOption
     ) {
         this.option = $.extend({}, new RegionDefaultOption(), option);
         this.selectList = [];
         this.element.find('select').each((i, ele) => {
             this.selectList.push($(ele));
         })
         if (typeof this.option.data == 'object') {
             this.init();
             return;
         }
         let instance = this;
         $.getJSON(this.option.data, function(data) {
            if (data.code == 0) {
                instance.option.data = data.data;
                instance.init();
            }
         });
     }

     public option: RegionOption;

     public selectList: Array<JQuery> = [];

     public map(callback: (ele: JQuery, i: number, count: number) => any, start: number = 0) {
        let count = this.selectList.length;
        for (;start < count; start ++) {
            if (false == callback(this.selectList[start], start, count)) {
                return;
            }
        }
     }

     public init() {
        if (this.option.default) {
            this.map((item, i) => {
                if (this.option.default.length > i) {
                    item.attr('data-value', this.option.default[i]);
                    return;
                }
                return false;
            });
        }
        let instance = this;
        this.map((item, i, count) => {
            if (i >= count - 1) {
                return false;
            }
            item.change(function() {
                let element = instance.eq(i + 1);
                let val = element.val();
                if (val) {
                    element.attr('data-value', val);
                }
                instance.showOption(element, i + 1);
            });
        });
        this.showOption(this.selectList[0], 0);
     }

     
     public set val(args: Array<string|number>) {
        this.map((item, i) => {
            item.attr('data-value', args[i]);
        });
        this.showOption(this.selectList[0], 0);
     }

     
     public get val(): Array<string|number> {
        let args = [];
        this.map(item => {
            args.push(item.val());
        });
        return args;
     }

     

     public eq(i: number): JQuery {
        if (i < 0) {
            i = 0;
        }
        if (this.selectList.length <= i) {
            i = this.selectList.length - 1;
        }
        return this.selectList[i];
     }
     
     

     public getOptionData(i: number): any {
        if (i < 1) {
            return this.option.data;
        }
        let data = this.option.data;
        let id: string;
        this.map((item, index) => {
            if (index >= i) {
                return false;
            }
            id = item.val();
            if (!data.hasOwnProperty(id)) {
                data = null;
                return false;
            }
            data = data[id]['children'];
        });
        return data;
     }

     public getOptionTip(i: number): string {
         if (typeof this.option.tips == 'object') {
             return this.option.tips[i];
         }
         return this.option.tips;
     }

     public showOption(element: JQuery, i: number) {
        let hasSelected = false; 
        element.html(this.getSelectHtml(this.getOptionData(i), element.attr('data-value'), this.getOptionTip(i), () => {
            hasSelected = true;
        }));
        this.map((item, index) => {
            item.html(this.getSelectHtml({}, null, this.getOptionTip(index)));
        }, i + 1);
        if (hasSelected) {
            element.trigger('change');
        }
     }

    public getSelectHtml(data: any, selected?: number | string, defaultLabel: string = '请选择', selectedCallback?: Function): string {
        let html = '<option value="">'+ defaultLabel +'</option>';
        if (!data) {
            return html;
        }
        let instance = this;
        $.each(data, function(id: number, item) {
            let isSelected = id == selected;
            html += instance.getOptionHtml(id, item.name, isSelected);
            isSelected && selectedCallback && selectedCallback();
        });
        return html;
     }

     public getOptionHtml(id: string | number, text: string, isSelected: boolean = false): string {
        if (isSelected) {
            return '<option value="'+id+'" selected>'+ text +'</option>';
        }
        return '<option value="'+id+'">'+ text +'</option>';
     }
}

interface RegionOption {
    default?: Array<string>,
    data?: any,
    tips?: string | Array<string>
}

class RegionDefaultOption implements RegionOption  {
    data: string = 'region/tree';
    tips: string = '请选择';
}
 
 ;(function($: any) {
  $.fn.region = function(options ?: RegionOption) {
    return new Region(this, options); 
  };
})(jQuery);