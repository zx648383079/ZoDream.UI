 class Region {
     constructor(
         public element: JQuery,
         option?: RegionOption
     ) {
         this.option = $.extend({}, new RegionDefaultOption(), option);
         this.provEle = this.element.find('.prov');
         this.cityEle = this.element.find('.city');
         this.distEle = this.element.find('.dist');
         if (typeof this.option.data == 'object') {
             this.init();
             return;
         }
         let instance = this;
         $.getJSON(this.option.data, function(data) {
            if (data.code == 0) {
                instance.option.data = data.data[1] ? data.data[1]['children'] : data.data;
                instance.init();
            }
         });
     }

     public option: RegionOption;

     public provEle: JQuery;

     public cityEle: JQuery;

     public distEle: JQuery;



     public init() {
        this.initProv();
        let instance = this;
        this.provEle.change(function() {
            instance.initCity();
        });
        this.cityEle.change(function() {
            instance.initDist();
        });
     }

     public initProv() {
         this.provEle.html(this.getSelectHtml(this.option.data));
         this.cityEle.html(this.getSelectHtml({}));
         this.distEle.html(this.getSelectHtml({}));
     }

     public initCity() {
         let id = this.provEle.val();
         this.cityEle.html(this.getSelectHtml(this.option.data[id]['children']));
         this.distEle.html(this.getSelectHtml({}));
     }

    public initDist() {
         let prov = this.provEle.val();
         let city = this.cityEle.val();
         this.distEle.html(this.getSelectHtml(this.option.data[prov]['children'][city]['children']));
     }

    public getSelectHtml(data: any, selected?: number, defaultLabel: string = '请选择'): string {
        let html = '<option value="">'+ defaultLabel +'</option>';
        let instance = this;
        $.each(data, function(id: number, item) {
            html += instance.getOptionHtml(id, item.name, id == selected);
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
    data?: any
}

class RegionDefaultOption implements RegionOption  {
    data: string = 'region/tree';
}
 
 ;(function($: any) {
  $.fn.region = function(options ?: RegionOption) {
    return new Region(this, options); 
  };
})(jQuery);