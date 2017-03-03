/**
 * 更新器
 */
class Updater {
    public static text(ele: HTMLElement, value: string = '') {
        ele.textContent = value;
    }

    public static html(ele: HTMLElement, value: string = '') {
        ele.innerHTML = value;
    }

    public static class(ele: HTMLElement, value: string, oldValue: string) {
        let className = ele.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');
        let space = className && String(value) ? ' ' : '';
        ele.className = className + space + value;
    }

    public static model(ele: HTMLInputElement, value: string = '') {
        ele.value = value;
    }
}

class Compile {
    constructor (
        el, 
        public $vm:any
    ) {
        this.$el = this.isElementNode(el) ? el : document.querySelector(el);
        if (this.$el) {
            this.$fragment = this.node2Fragment(this.$el);
            this.init();
            this.$el.appendChild(this.$fragment);
        }
    }

    public $el: HTMLElement;

    public $fragment: any;
    
    public node2Fragment(el) {
        let fragment = document.createDocumentFragment(),
            child;

        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }

        return fragment;
    }

    public init() {
        this.compileElement(this.$fragment);
    }

    public compileElement(el) {
        let childNodes = el.childNodes,
            me = this;

        [].slice.call(childNodes).forEach(function(node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/;

            if (me.isElementNode(node)) {
                me.compile(node);

            } else if (me.isTextNode(node) && reg.test(text)) {
                me.compileText(node, RegExp.$1);
            }

            if (node.childNodes && node.childNodes.length) {
                me.compileElement(node);
            }
        });
    }

    public compile(node) {
        let nodeAttrs = node.attributes,
            me = this;

        [].slice.call(nodeAttrs).forEach(function(attr) {
            let attrName = attr.name;
            if (me.isDirective(attrName)) {
                let exp = attr.value;
               let dir = attrName.substring(2);
                // 事件指令
                if (me.isEventDirective(dir)) {
                    CompileUtil.eventHandler(node, me.$vm, exp, dir);
                    // 普通指令
                } else {
                    CompileUtil[dir] && CompileUtil[dir](node, me.$vm, exp);
                }

                node.removeAttribute(attrName);
            }
        });
    }

    public compileText(node, exp) {
        CompileUtil.text(node, this.$vm, exp);
    }

    public isDirective(attr) {
        return attr.indexOf('v-') == 0;
    }

    public isEventDirective(dir) {
        return dir.indexOf('on') === 0;
    }

    public isElementNode(node) {
        return node.nodeType == 1;
    }

    public isTextNode(node) {
        return node.nodeType == 3;
    }
};

// 指令处理集合
class CompileUtil{
    public static text(node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    }

    public static html(node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    }

    public static model(node, vm, exp) {
        this.bind(node, vm, exp, 'model');

        let me = this,
            val = this._getVMVal(vm, exp);
        node.addEventListener('input', function(e) {
            let newValue = e.target.value;
            if (val === newValue) {
                return;
            }

            me._setVMVal(vm, exp, newValue);
            val = newValue;
        });
    }

    public static class(node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    }

    public static bind(node, vm, exp, dir) {
        let updaterFn = Updater[dir];

        updaterFn && updaterFn(node, this._getVMVal(vm, exp));

        new Watcher(vm, exp, function(value, oldValue) {
            updaterFn && updaterFn(node, value, oldValue);
        });
    }

    // 事件处理
    public static eventHandler(node, vm, exp, dir) {
        let eventType = dir.split(':')[1],
            fn = vm.$options.methods && vm.$options.methods[exp];

        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    }

    public static _getVMVal(vm, exp) {
        let val = vm._data;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    }

    public static _setVMVal(vm, exp, value) {
        let val = vm._data;
        exp = exp.split('.');
        exp.forEach(function(k, i) {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }
};


class Observer {
    constructor(
        public data: any
    ) {

    }

    public walk(data) {
        let instance = this;
        Object.keys(data).forEach(function(key) {
            instance.conver(key);
        });
    }

    public conver(key: string, value?: any) {
        this.defineReactive(this.data, key, value);
    }

    public defineReactive(data: any, key:string, value: any) {
        let dep = new Dep();
        let childObj = observe(value);

        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get: function() {
                if (Dep.target) {
                    dep.depend();
                }
                return value;
            },
            set: function(newVal) {
                if (newVal === value) {
                    return;
                }
                value = newVal;
                // 新的值是object的话，进行监听
                childObj = observe(newVal);
                // 通知订阅者
                dep.notify();
            }
        });
    }
}

function observe(value: any) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
};

var uid = 0;

class Dep {
    constructor() {
        this.uid = uid ++;
    }

    public uid: number;

    public subs: any[];

    public addSub(sub) {
        this.subs.push(sub);
    }

    public depend() {
        Dep.target.addDep(this);
    }

    public removeSub(sub) {
        var index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    }

    public notify() {
        this.subs.forEach(function(sub) {
            sub.update();
        });
    }

    public static target: any = null;

}

class Watcher{
    constructor(
        public vm, 
        public exp: string, 
        public cb) {
            this.value = this.get();
    }

    public depIds = {};

    public value;

    public update() {
        this.run();
    }
    public run() {
        let value = this.get();
        let oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    }
    public addDep(dep) {
        // 1. 每次调用run()的时候会触发相应属性的getter
        // getter里面会触发dep.depend()，继而触发这里的addDep
        // 2. 假如相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
        // 则不需要将当前watcher添加到该属性的dep里
        // 3. 假如相应属性是新的属性，则将当前watcher添加到新属性的dep里
        // 如通过 vm.child = {name: 'a'} 改变了 child.name 的值，child.name 就是个新属性
        // 则需要将当前watcher(child.name)加入到新的 child.name 的dep里
        // 因为此时 child.name 是个新值，之前的 setter、dep 都已经失效，如果不把 watcher 加入到新的 child.name 的dep中
        // 通过 child.name = xxx 赋值的时候，对应的 watcher 就收不到通知，等于失效了
        // 4. 每个子属性的watcher在添加到子属性的dep的同时，也会添加到父属性的dep
        // 监听子属性的同时监听父属性的变更，这样，父属性改变时，子属性的watcher也能收到通知进行update
        // 这一步是在 this.get() --> this.getVMVal() 里面完成，forEach时会从父级开始取值，间接调用了它的getter
        // 触发了addDep(), 在整个forEach过程，当前wacher都会加入到每个父级过程属性的dep
        // 例如：当前watcher的是'child.child.name', 那么child, child.child, child.child.name这三个属性的dep都会加入当前watcher
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    }
    public get() {
        Dep.target = this;
        let value = this.getVMVal();
        Dep.target = null;
        return value;
    }

    public getVMVal(): any {
        let exp: string[] = this.exp.split('.');
        let val: any = this.vm._data;
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    }
}

class MVVM {
    constructor(
        public options: any
    ) {
        this._data = this.options.data;
        var me = this;

        // 数据代理
        // 实现 vm.xxx -> vm._data.xxx
        Object.keys(this._data).forEach(function(key) {
            me._proxy(key);
        });

        observe(this._data, this);

        this.$compile = new Compile(options.el || document.body, this)
    }

    public _data: any;

    public $compile: any;


    public $watch(key, cb, options) {
        new Watcher(this, key, cb);
    }

    public _proxy(key) {
        let me = this;
        Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return me._data[key];
            },
            set: function proxySetter(newVal) {
                me._data[key] = newVal;
            }
        });
    }
}
