var ChatMenu = /** @class */ (function () {
    /**
     *
     */
    function ChatMenu(box, menus) {
        if (menus === void 0) { menus = []; }
        this.box = box;
        this.menus = menus;
        this.events = {};
        this.bindEvent();
    }
    ChatMenu.prototype.bindEvent = function () {
        var _this = this;
        this.box.on('click', 'li', function () {
            _this.clickLi($(this));
        });
    };
    ChatMenu.prototype.clickLi = function (li) {
        var name = li.attr('data-name'), menu;
        if (name && this.menuMap.hasOwnProperty(name)) {
            menu = this.menuMap[name];
            if (menu && menu.onclick) {
                menu.onclick(li);
            }
        }
        if (name && this.hasEvent(name)) {
            this.trigger(name, li, menu);
        }
        this.trigger('click', li, menu);
    };
    ChatMenu.prototype.addMenu = function (menu) {
        this.menus.push(menu);
        return this;
    };
    ChatMenu.prototype.show = function (x, y) {
        this.refresh();
        this.box.css({
            'left': x + 'px',
            'top': y + 'px'
        }).show();
        return this;
    };
    ChatMenu.prototype.hide = function () {
        this.box.hide();
    };
    ChatMenu.prototype.refresh = function () {
        this.menuMap = {};
        var menus = this.cleanMenuList(this.menus), html = menus ? this.getMenuHtml(menus) : '';
        this.box.html(html);
    };
    ChatMenu.prototype.getMenuHtml = function (menus) {
        var _this = this;
        var html = '';
        menus.forEach(function (menu) {
            html += _this.getMenuItemHtml(menu);
        });
        return '<ul>' + html + '</ul>';
    };
    ChatMenu.prototype.getMenuItemHtml = function (menu) {
        var name = (menu.text || menu.name), html = '<li data-name="' + name
            + '"><span><i class="fa fa-' + menu.icon + '"></i>' + (menu.text || menu.name), menus = this.cleanMenuList(menu.children);
        this.menuMap[name] = menu;
        if (menus && menus.length > 0) {
            return html + '<i class="fa fa-chevron-right"></i></span>' + this.getMenuHtml(menus) + '</li>';
        }
        return html + '</span></li>';
    };
    ChatMenu.prototype.cleanMenuList = function (menus) {
        if (!menus || menus.length == 0) {
            return null;
        }
        var real_menu = [];
        menus.forEach(function (menu) {
            if (menu.toggle && menu.toggle() === false) {
                return;
            }
            real_menu.push(menu);
        });
        return real_menu;
    };
    ChatMenu.prototype.on = function (event, callback) {
        this.events[event] = callback;
        return this;
    };
    ChatMenu.prototype.hasEvent = function (event) {
        return this.events.hasOwnProperty(event);
    };
    ChatMenu.prototype.trigger = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.hasEvent(event)) {
            return;
        }
        return (_a = this.events[event]).call.apply(_a, [this].concat(args));
        var _a;
    };
    return ChatMenu;
}());
var ChatAddUserBox = /** @class */ (function () {
    /**
     *
     */
    function ChatAddUserBox(box, parent) {
        this.box = box;
        this.parent = parent;
    }
    ChatAddUserBox.prototype.show = function () {
        this.box.show();
    };
    return ChatAddUserBox;
}());
var ChatUserInfoBox = /** @class */ (function () {
    /**
     *
     */
    function ChatUserInfoBox(box, parent) {
        this.box = box;
        this.parent = parent;
    }
    ChatUserInfoBox.prototype.show = function () {
        this.box.show();
    };
    return ChatUserInfoBox;
}());
var ChatSearchBox = /** @class */ (function () {
    /**
     *
     */
    function ChatSearchBox(box, parent) {
        this.box = box;
        this.parent = parent;
        this.bindEvent();
    }
    /**
     * bindEvent
     */
    ChatSearchBox.prototype.bindEvent = function () {
        var _this = this;
        this.box.on('click', '.dialog-search-list .dialog-info', function () {
            _this.parent.addBox.show();
        });
        this.box.on('click', '.dialog-tab-header .dialog-tab-item', function () {
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
        });
    };
    ChatSearchBox.prototype.show = function () {
        this.box.show();
    };
    return ChatSearchBox;
}());
var ChatEditor = /** @class */ (function () {
    function ChatEditor(box, parent) {
        this.box = box;
        this.parent = parent;
    }
    ChatEditor.prototype.insertHtmlAtCaret = function (html) {
        var sel, range, editor = this.box;
        if (!editor.is(":focus")) {
            editor.focus();
            range = document.createRange();
            range.setStartAfter(editor[0]);
            range.setEnd(editor[0], editor[0].childNodes.length);
        }
        if (!window.getSelection) {
            return;
        }
        sel = window.getSelection();
        if (!sel.getRangeAt || !sel.rangeCount) {
            return;
        }
        if (!range) {
            range = sel.getRangeAt(0);
            range.deleteContents();
        }
        var el = document.createElement("div");
        el.innerHTML = html;
        var frag = document.createDocumentFragment(), node, lastNode;
        while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };
    return ChatEditor;
}());
var ChatMessageBox = /** @class */ (function () {
    /**
     *
     */
    function ChatMessageBox(box, parent) {
        this.box = box;
        this.parent = parent;
        this.refresh();
        this.bindEvent();
    }
    ChatMessageBox.prototype.refresh = function () {
        this.editor = new ChatEditor(this.box.find('.dialog-message-text'), this);
    };
    /**
     * bindEvent
     */
    ChatMessageBox.prototype.bindEvent = function () {
        var _this = this;
        this.box.on('click', '.fa-smile-o', function () {
            _this.editor.insertHtmlAtCaret('<img src="./image/avatar.jpg" alt="">');
        });
    };
    return ChatMessageBox;
}());
var ChatUserBox = /** @class */ (function () {
    /**
     *
     */
    function ChatUserBox(box, parent) {
        this.box = box;
        this.parent = parent;
        this.refresh();
        this.bindEvent();
    }
    ChatUserBox.prototype.refresh = function () {
        this.menu = new ChatMenu(this.box.find('.dialog-menu'), USER_MENU);
    };
    ChatUserBox.prototype.bindEvent = function () {
        var _this = this;
        $(document).click(function () {
            _this.menu.hide();
        });
        this.box.click(function () {
            if ($(this).hasClass('dialog-min')) {
                $(this).removeClass('dialog-min');
            }
        });
        this.box.on('click', '.dialog-header .fa-minus', function (e) {
            e.stopPropagation();
            _this.box.addClass('dialog-min');
        });
        this.box.on('click', '.dialog-header .fa-plus', function () {
            _this.parent.searchBox.show();
        });
        this.box.on('click', '.dialog-tab .dialog-tab-header .dialog-tab-item', function () {
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            $this.closest('.dialog-tab').find('.dialog-tab-box .dialog-tab-item').eq($this.index()).addClass('active').siblings().removeClass('active');
        });
        this.box.on('click', '.dialog-panel .dialog-panel-header', function () {
            $(this).closest('.dialog-panel').toggleClass('expanded');
        });
        this.box.on('click', '.dialog-tab .dialog-user', function () {
            $(this).closest('.dialog-chat').find('.dialog-chat-room').show();
        });
        this.box.on('contextmenu', '.dialog-tab .dialog-user', function (event) {
            _this.menu.show(event.clientX, event.clientY);
            return false;
        });
        this.menu.on('click', function () {
            console.log(arguments);
            _this.parent.userBox.show();
        });
    };
    return ChatUserBox;
}());
var ChatRoom = /** @class */ (function () {
    function ChatRoom(target) {
        this.target = target;
        this.refresh();
    }
    ChatRoom.prototype.refresh = function () {
        this.mainBox = new ChatUserBox(this.target.find('.dialog-chat-box'), this);
        this.addBox = new ChatAddUserBox(this.target.find('.dialog-add-box'), this);
        this.userBox = new ChatUserInfoBox(this.target.find('.dialog-user-box'), this);
        this.searchBox = new ChatSearchBox(this.target.find('.dialog-search-box'), this);
        this.chatBox = new ChatMessageBox(this.target.find('.dialog-chat-room'), this);
    };
    return ChatRoom;
}());
var USER_MENU = [
    {
        icon: 'eye',
        text: '查看资料'
    },
    {
        icon: 'bookmark',
        text: '移动好友'
    },
    {
        icon: 'trash',
        text: '删除好友'
    },
];
new ChatRoom($('.dialog-chat-page'));
$(function () {
    $('.dialog-box').on('click', '.dialog-header .fa-close', function () {
        $(this).closest('.dialog-box').hide();
    });
});
