/**
 * 更新器
 */
var Updater = (function () {
    function Updater() {
    }
    Updater.text = function (ele, value) {
        if (value === void 0) { value = ''; }
        ele.textContent = value;
    };
    Updater.html = function (ele, value) {
        if (value === void 0) { value = ''; }
        ele.innerHTML = value;
    };
    Updater.class = function (ele, value, oldValue) {
        var className = ele.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');
        var space = className && String(value) ? ' ' : '';
        ele.className = className + space + value;
    };
    Updater.model = function (ele, value) {
        if (value === void 0) { value = ''; }
        ele.value = value;
    };
    return Updater;
}());
var Compile = (function () {
    function Compile(el, $vm) {
        this.$vm = $vm;
        this.$el = this.isElementNode(el) ? el : document.querySelector(el);
        if (this.$el) {
            this.$fragment = this.node2Fragment(this.$el);
            this.init();
            this.$el.appendChild(this.$fragment);
        }
    }
    Compile.prototype.node2Fragment = function (el) {
        var fragment = document.createDocumentFragment(), child;
        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    };
    Compile.prototype.init = function () {
        this.compileElement(this.$fragment);
    };
    Compile.prototype.compileElement = function (el) {
        var childNodes = el.childNodes, me = this;
        [].slice.call(childNodes).forEach(function (node) {
            var text = node.textContent;
            var reg = /\{\{(.*)\}\}/;
            if (me.isElementNode(node)) {
                me.compile(node);
            }
            else if (me.isTextNode(node) && reg.test(text)) {
                me.compileText(node, RegExp.$1);
            }
            if (node.childNodes && node.childNodes.length) {
                me.compileElement(node);
            }
        });
    };
    Compile.prototype.compile = function (node) {
        var nodeAttrs = node.attributes, me = this;
        [].slice.call(nodeAttrs).forEach(function (attr) {
            var attrName = attr.name;
            if (me.isDirective(attrName)) {
                var exp = attr.value;
                var dir = attrName.substring(2);
                // 事件指令
                if (me.isEventDirective(dir)) {
                    CompileUtil.eventHandler(node, me.$vm, exp, dir);
                }
                else {
                    CompileUtil[dir] && CompileUtil[dir](node, me.$vm, exp);
                }
                node.removeAttribute(attrName);
            }
        });
    };
    Compile.prototype.compileText = function (node, exp) {
        CompileUtil.text(node, this.$vm, exp);
    };
    Compile.prototype.isDirective = function (attr) {
        return attr.indexOf('v-') == 0;
    };
    Compile.prototype.isEventDirective = function (dir) {
        return dir.indexOf('on') === 0;
    };
    Compile.prototype.isElementNode = function (node) {
        return node.nodeType == 1;
    };
    Compile.prototype.isTextNode = function (node) {
        return node.nodeType == 3;
    };
    return Compile;
}());
;
// 指令处理集合
var CompileUtil = (function () {
    function CompileUtil() {
    }
    CompileUtil.text = function (node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    };
    CompileUtil.html = function (node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    };
    CompileUtil.model = function (node, vm, exp) {
        this.bind(node, vm, exp, 'model');
        var me = this, val = this._getVMVal(vm, exp);
        node.addEventListener('input', function (e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            me._setVMVal(vm, exp, newValue);
            val = newValue;
        });
    };
    CompileUtil.class = function (node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    };
    CompileUtil.bind = function (node, vm, exp, dir) {
        var updaterFn = Updater[dir];
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        new Watcher(vm, exp, function (value, oldValue) {
            updaterFn && updaterFn(node, value, oldValue);
        });
    };
    // 事件处理
    CompileUtil.eventHandler = function (node, vm, exp, dir) {
        var eventType = dir.split(':')[1], fn = vm.$options.methods && vm.$options.methods[exp];
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    };
    CompileUtil._getVMVal = function (vm, exp) {
        var val = vm._data;
        exp = exp.split('.');
        exp.forEach(function (k) {
            val = val[k];
        });
        return val;
    };
    CompileUtil._setVMVal = function (vm, exp, value) {
        var val = vm._data;
        exp = exp.split('.');
        exp.forEach(function (k, i) {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            }
            else {
                val[k] = value;
            }
        });
    };
    return CompileUtil;
}());
;
var Observer = (function () {
    function Observer(data) {
        this.data = data;
    }
    Observer.prototype.walk = function (data) {
        var instance = this;
        Object.keys(data).forEach(function (key) {
            instance.conver(key);
        });
    };
    Observer.prototype.conver = function (key, value) {
        this.defineReactive(this.data, key, value);
    };
    Observer.prototype.defineReactive = function (data, key, value) {
        var dep = new Dep();
        var childObj = observe(value);
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                if (Dep.target) {
                    dep.depend();
                }
                return value;
            },
            set: function (newVal) {
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
    };
    return Observer;
}());
function observe(value) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
}
;
var uid = 0;
var Dep = (function () {
    function Dep() {
        this.uid = uid++;
    }
    Dep.prototype.addSub = function (sub) {
        this.subs.push(sub);
    };
    Dep.prototype.depend = function () {
        Dep.target.addDep(this);
    };
    Dep.prototype.removeSub = function (sub) {
        var index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    };
    Dep.prototype.notify = function () {
        this.subs.forEach(function (sub) {
            sub.update();
        });
    };
    return Dep;
}());
Dep.target = null;
var Watcher = (function () {
    function Watcher(vm, exp, cb) {
        this.vm = vm;
        this.exp = exp;
        this.cb = cb;
        this.depIds = {};
        this.value = this.get();
    }
    Watcher.prototype.update = function () {
        this.run();
    };
    Watcher.prototype.run = function () {
        var value = this.get();
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    };
    Watcher.prototype.addDep = function (dep) {
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
    };
    Watcher.prototype.get = function () {
        Dep.target = this;
        var value = this.getVMVal();
        Dep.target = null;
        return value;
    };
    Watcher.prototype.getVMVal = function () {
        var exp = this.exp.split('.');
        var val = this.vm._data;
        exp.forEach(function (k) {
            val = val[k];
        });
        return val;
    };
    return Watcher;
}());
var MVVM = (function () {
    function MVVM(options) {
        this.options = options;
        this._data = this.options.data;
        var me = this;
        // 数据代理
        // 实现 vm.xxx -> vm._data.xxx
        Object.keys(this._data).forEach(function (key) {
            me._proxy(key);
        });
        observe(this._data, this);
        this.$compile = new Compile(options.el || document.body, this);
    }
    MVVM.prototype.$watch = function (key, cb, options) {
        new Watcher(this, key, cb);
    };
    MVVM.prototype._proxy = function (key) {
        var me = this;
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
    };
    return MVVM;
}());
