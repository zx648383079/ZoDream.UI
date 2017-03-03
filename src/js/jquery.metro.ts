 class Metro {
     constructor(
         public element: JQuery,
         options?: MetroOptions
     ) {
         this.options = $.extend({}, new MetroDefaultOptions(), options);
         this.Width = element.width();
         this.addMetro(...this.options.data);
     }

     public options: MetroOptions;
     private _elementList: MetroElement[] = [];
     private _width: number;
     private _smallWidth: number;

     public columnCount: number = 0;

     public set Width(arg: number) {
         this._width = arg;
         this.refresh();
     }

     public get Width(): number {
         return this._width;
     }

     public refresh() {
         this.columnCount = Math.floor(this.Width / this.options.maxSmallWith);
         this._smallWidth = this.Width / this.columnCount - this.getSpace();
         for(let i = this._elementList.length - 1; i >= 0; i --) {
             this._elementList[i].setSize();
         }
     }

     public getSmallWidth(): number {
         return this._smallWidth;
     }

     public getSpace(): number {
         return this.options.space;
     }

     public getMiddleWidth(): number {
         return 2 * this.getSmallWidth() + this.getSpace();
     }

     public getLargeWidth(): number {
         return 4 * this.getSmallWidth() + this.getSpace() * 3;
     }

     public addMetro(...args: MetroItem[]) {
         for(let i = 0, length = args.length; i < length; i++) {
             this.createElement(args[i]);
         }
     }

     public createElement(item: MetroItem) {
         let element = new MetroElement(item, this);
         element.element.className = this.options.className;
         element.setSize();
         this._elementList.push(element);
         this.element.append(element.element);
     }

     public removeElement() {

     }
 }

class MetroElement {
     constructor(
         item?: MetroItem,
         public metro?: Metro
     ) {
        if (!item) {
            return;
        }
        this.size = item.size;
        this.element = window.document.createElement("div");
        if (typeof item.content == "object") {
            this.element.appendChild(item.content);
        } else {
            this.element.innerHTML = item.content;
        }
     }

     public element: HTMLElement;

     public size: MetroSize = MetroSize.Middle;

     public setSize(): MetroElement {
         let width: number,height:number;
         switch (this.size) {
            case MetroSize.Middle:
                 height = width = this.metro.getMiddleWidth();
                 break;
            case MetroSize.Large:
                 height = this.metro.getMiddleWidth();
                 width = this.metro.getLargeWidth();
                 break;
            case MetroSize.Small:
            default:
                 height = width = this.metro.getSmallWidth();
                 break;
         }
         this.element.style.height = height + "px";
         this.element.style.width = width + "px";
         this.element.style.margin = this.metro.getSpace() / 2 + "px";
         return this;
     }
 }

 enum MetroSize {
     Small,
     Middle,
     Large
 }

class MetroItem {
     public size: MetroSize = MetroSize.Middle;

     public content: any;
 }
 
interface MetroOptions {
     data: MetroItem[];
     space?: number;
     className?: string;
     maxSmallWith: number;
     createMetro?: (arg: MetroItem, metro: Metro) => HTMLElement;
 }

 class MetroDefaultOptions implements MetroOptions {
     data: MetroItem[] = [];
     space: number = 4;
     maxSmallWith: number = 50;
     className: string = "metroItem";
     createMetro = function(arg: MetroItem, metro: Metro) {
         return new HTMLDivElement();
     }
 }
 
 ;(function($: any) {

  $.fn.metro = function(options ?: MetroOptions) {
    return new Metro(this, options); 
  };
  
})(jQuery);