module ZUtils {
    export class time {
        /**
         * 获取真实的月份
         */
        public static getRealMonth(date: Date) {
            return date.getMonth() + 1;
        }

        /**
         * 格式化日期
         */
        public static format(date: Date, fmt: string = 'y年m月d日'): string {
            let o = {
                "y+": date.getFullYear(),
                "m+": this.getRealMonth(date), //月份 
                "d+": date.getDate(), //日 
                "h+": date.getHours(), //小时 
                "i+": date.getMinutes(), //分 
                "s+": date.getSeconds(), //秒 
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "S": date.getMilliseconds() //毫秒 
            };
            for (let k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    let len =  ("" + o[k]).length;
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1 || RegExp.$1.length == len) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        }
    }

    export class str {
        public static format(arg: string, ...args: any[]) {
            return arg.replace(/\{(\d+)\}/g, function(m,i) {
                return args[i];
            });
        }
    }
}