enum Mode {
    LOOP,
    TURN,
    RANDOM
}


class Couplet {
    constructor(
        public title: string,
        public top: string,
        public bottom: string
    ) {

    }

    public static parse(data: any): Couplet {
        if (data instanceof Couplet) {
            return data;
        }
        return new Couplet(data[0], data[1], data[2]);
    }

    public drawing(speed: number, callback: Function) {
        
    }

    private _drawing(element: JQuery, text: string, speed: number) {
        let index = 0;
        let timer = new Timer(function() {
            element.append(text[index]);
            index ++;
        }, speed, text.length);
    }
}

class Coupletor {
    constructor(
        public element: JQuery,
        option?: CoupletOption
    ) {
        this.option = $.extend({}, new CoupletDefaultOption(), option);
        
    }

    public option: CoupletOption;

    public timer: Timer;

    public elements: Array<JQuery>;

    private _drawing(text: string, callback: Function) {
        let index = 0;
        let timer = new Timer(function() {
            
        }, this.option.speed);
    }
}

interface CoupletOption {
    data?: Array<Couplet>,
    speed?: number,
    space?: number,
    mode?: Mode
}

class CoupletDefaultOption implements CoupletOption {
    constructor() {
        this.data.push(
            new Couplet('五福临门', '心想事成兴伟业', '万事如意展宏图'),
            new Couplet('喜迎新春', '笑盈盈辞旧岁', '喜滋滋迎新年')
        );
    }
    data: Array<Couplet> = [];
    speed: number = 100;
    space: number = 2000;
    mode: Mode = Mode.LOOP;
}


;(function($: any) {
  $.fn.couplet = function(option ?: CoupletOption) {
    return new Coupletor(this, option); 
  };
})(jQuery);