var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ChatType;
(function (ChatType) {
    ChatType[ChatType["MESSAGE"] = 0] = "MESSAGE";
    ChatType[ChatType["MORE"] = 1] = "MORE";
    ChatType[ChatType["TIP"] = 2] = "TIP";
    ChatType[ChatType["TIME"] = 3] = "TIME";
})(ChatType || (ChatType = {}));
var ChatBaseBox = /** @class */ (function () {
    function ChatBaseBox() {
        this.cache_element = {};
        this.events = {};
    }
    ChatBaseBox.prototype.on = function (event, callback) {
        this.events[event] = callback;
        return this;
    };
    ChatBaseBox.prototype.hasEvent = function (event) {
        return this.events.hasOwnProperty(event);
    };
    ChatBaseBox.prototype.trigger = function (event) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.hasEvent(event)) {
            return;
        }
        return (_a = this.events[event]).call.apply(_a, [this].concat(args));
    };
    ChatBaseBox.prototype.find = function (tag) {
        if (this.cache_element.hasOwnProperty(tag)) {
            return this.cache_element[tag];
        }
        return this.cache_element[tag] = this.box.find(tag);
    };
    ChatBaseBox.prototype.show = function () {
        this.box.show();
        return this;
    };
    ChatBaseBox.prototype.hide = function () {
        this.box.hide();
    };
    return ChatBaseBox;
}());
var ChatMenu = /** @class */ (function (_super) {
    __extends(ChatMenu, _super);
    /**
     *
     */
    function ChatMenu(box, menus) {
        if (menus === void 0) { menus = []; }
        var _this_1 = _super.call(this) || this;
        _this_1.box = box;
        _this_1.menus = menus;
        _this_1.bindEvent();
        return _this_1;
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
            if (menu && menu.onclick && menu.onclick(li, this.target, this) === false) {
                return;
            }
        }
        if (name && this.hasEvent(name) && this.trigger(name, li, menu, this.target, this) === false) {
            return;
        }
        this.trigger('click', li, menu, this.target);
    };
    ChatMenu.prototype.addMenu = function (menu) {
        this.menus.push(menu);
        return this;
    };
    ChatMenu.prototype.showPosition = function (x, y, target) {
        this.refresh();
        this.box.css({
            'left': x + 'px',
            'top': y + 'px'
        }).show();
        this.target = target;
        return this;
    };
    ChatMenu.prototype.hide = function () {
        this.box.hide();
        this.target = null;
    };
    ChatMenu.prototype.refresh = function () {
        this.menuMap = {};
        var menus = this.cleanMenuList(this.menus), html = menus ? this.getMenuHtml(menus) : '';
        this.box.html(html);
    };
    ChatMenu.prototype.getMenuHtml = function (menus) {
        var _this_1 = this;
        var html = '';
        menus.forEach(function (menu) {
            html += _this_1.getMenuItemHtml(menu);
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
        var _this_1 = this;
        if (!menus || menus.length == 0) {
            return null;
        }
        var real_menu = [];
        menus.forEach(function (menu) {
            if (menu.toggle && menu.toggle(_this_1.target, _this_1) === false) {
                return;
            }
            real_menu.push(menu);
        });
        return real_menu;
    };
    return ChatMenu;
}(ChatBaseBox));
var ChatAddUserBox = /** @class */ (function (_super) {
    __extends(ChatAddUserBox, _super);
    /**
     *
     */
    function ChatAddUserBox(box, parent) {
        var _this_1 = _super.call(this) || this;
        _this_1.box = box;
        _this_1.parent = parent;
        return _this_1;
    }
    return ChatAddUserBox;
}(ChatBaseBox));
var ChatUserInfoBox = /** @class */ (function (_super) {
    __extends(ChatUserInfoBox, _super);
    /**
     *
     */
    function ChatUserInfoBox(box, parent) {
        var _this_1 = _super.call(this) || this;
        _this_1.box = box;
        _this_1.parent = parent;
        return _this_1;
    }
    return ChatUserInfoBox;
}(ChatBaseBox));
var ChatSearchBox = /** @class */ (function (_super) {
    __extends(ChatSearchBox, _super);
    /**
     *
     */
    function ChatSearchBox(box, parent) {
        var _this_1 = _super.call(this) || this;
        _this_1.box = box;
        _this_1.parent = parent;
        _this_1.users = [];
        _this_1.bindEvent();
        return _this_1;
    }
    ChatSearchBox.prototype.render = function () {
        var tpl = "<div class=\"dialog-info\">\n        <div class=\"dialog-info-avatar\">\n            <img src=\"{0}\" alt=\"\">\n        </div>\n        <div class=\"dialog-info-name\">\n            <h3>{1}</h3>\n            <p>{2}</p>\n        </div>\n    </div>", html = '';
        this.users.forEach(function (user) {
            html += ZUtils.str.format(tpl, user.avatar, user.name, user.brief);
        });
        this.find('.dialog-search-list').html(html);
    };
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
    return ChatSearchBox;
}(ChatBaseBox));
var ChatEditor = /** @class */ (function () {
    function ChatEditor(box, parent) {
        this.box = box;
        this.parent = parent;
    }
    ChatEditor.prototype.html = function () {
        return this.box.html();
    };
    ChatEditor.prototype.text = function () {
        return this.box.text();
    };
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
var ChatMessageBox = /** @class */ (function (_super) {
    __extends(ChatMessageBox, _super);
    /**
     *
     */
    function ChatMessageBox(box, parent, send, revice) {
        var _this_1 = _super.call(this) || this;
        _this_1.box = box;
        _this_1.parent = parent;
        _this_1.send = send;
        _this_1.revice = revice;
        _this_1.messages = [];
        _this_1.refresh();
        _this_1.bindEvent();
        return _this_1;
    }
    ChatMessageBox.prototype.refresh = function () {
        this.editor = new ChatEditor(this.find('.dialog-message-text'), this);
        this.renderTitle();
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
    ChatMessageBox.prototype.renderTitle = function () {
        if (!this.revice) {
            return;
        }
        this.find('.dialog-title').html('与 ' + this.revice.name + ' 聊天中');
    };
    ChatMessageBox.prototype.addMessage = function (message) {
        this.messages.push(message);
        this.renderMessage();
    };
    ChatMessageBox.prototype.prependMessage = function (messages) {
        this.messages = messages.concat(this.messages);
        this.renderMessage();
    };
    ChatMessageBox.prototype.renderMessage = function () {
        var _this_1 = this;
        var html = '', messages = this.cleanMessage();
        messages.forEach(function (item) {
            html += _this_1.renderMessageItem(item);
        });
        this.find('.dialog-message-box').html(html);
    };
    ChatMessageBox.prototype.renderMessageItem = function (item) {
        switch (item.type) {
            case ChatType.MORE:
                return '<p class="message-more">加载更多</p>';
            case ChatType.TIME:
                return '<p class="message-line">' + item.content + '</p>';
            case ChatType.TIP:
                return '<p class="message-tip">' + item.content + '</p>';
            case ChatType.MESSAGE:
            default:
                break;
        }
        if (item.user.id == this.send.id) {
            return ZUtils.str.format("<div class=\"message-right\">\n            <img class=\"avatar\" src=\"{0}\">\n            <div class=\"content\">\n                {1}\n            </div>\n        </div>", item.user.avatar, item.content);
        }
        return ZUtils.str.format("<div class=\"message-left\">\n        <img class=\"avatar\" src=\"{0}\">\n        <div class=\"content\">\n            {1}\n        </div>\n    </div>", item.user.avatar, item.content);
    };
    ChatMessageBox.prototype.cleanMessage = function () {
        var _this_1 = this;
        var messages = [
            {
                type: ChatType.MORE
            }
        ], lastTime = 0;
        this.messages.forEach(function (item) {
            if (item.time - lastTime > 200) {
                lastTime = item.time;
                _this_1.messages.push({
                    content: ZUtils.time + '',
                    type: ChatType.TIME
                });
            }
        });
        return messages;
    };
    return ChatMessageBox;
}(ChatBaseBox));
var ChatUserBox = /** @class */ (function (_super) {
    __extends(ChatUserBox, _super);
    /**
     *
     */
    function ChatUserBox(box, parent) {
        var _this_1 = _super.call(this) || this;
        _this_1.box = box;
        _this_1.parent = parent;
        _this_1.refresh();
        _this_1.bindEvent();
        return _this_1;
    }
    ChatUserBox.prototype.refresh = function () {
        this.menu = new ChatMenu(this.find('.dialog-menu'), USER_MENU);
    };
    ChatUserBox.prototype.renderGroup = function () {
        var tpl = "<div class=\"dialog-user\">\n        <div class=\"dialog-user-avatar\">\n            <img src=\"{0}\" alt=\"\">\n        </div>\n        <div class=\"dialog-user-info\">\n            <p>\n                <span class=\"name\">{1}</span>\n            </p>\n            <p>\n                <span class=\"content\">{2}</span>\n            </p>\n        </div>\n    </div>", html = '';
        this.groups.forEach(function (group) {
            html += ZUtils.str.format(tpl, group.avatar, group.name, group.brief);
        });
        this.find('.dialog-tab-box .dialog-tab-item').eq(2).html(html);
    };
    ChatUserBox.prototype.renderFriends = function () {
        var panel = "\n        <div class=\"dialog-panel expanded\">\n        <div class=\"dialog-panel-header\">\n            <i class=\"dialog-panel-icon\"></i>\n            <span>{0} ({1} / {2})</span>\n        </div>\n        <div class=\"dialog-panel-box\">\n            {3}\n        </div>\n    </div>\n        ", tpl = "<div class=\"dialog-user\">\n            <div class=\"dialog-user-avatar\">\n                <img src=\"{0}\" alt=\"\">\n            </div>\n            <div class=\"dialog-user-info\">\n                <p>\n                    <span class=\"name\">{1}</span>\n                </p>\n                <p>\n                    <span class=\"content\">{2}</span>\n                </p>\n            </div>\n        </div>", html = '';
        this.friends.forEach(function (group) {
            var groupHtml = '';
            group.users.forEach(function (user) {
                groupHtml += ZUtils.str.format(tpl, user.avatar, user.name, user.brief);
            });
            html += ZUtils.str.format(panel, group.name, group.online_count, group.count, groupHtml);
        });
        this.find('.dialog-tab-box .dialog-tab-item').eq(1).html(html);
    };
    ChatUserBox.prototype.renderLastFriends = function () {
        var tpl = "<div class=\"dialog-user\">\n        <div class=\"dialog-user-avatar\">\n            <img src=\"{0}\" alt=\"\">\n        </div>\n        <div class=\"dialog-user-info\">\n            <p>\n                <span class=\"name\">{1}</span>\n                <span class=\"time\">{2}</span>\n            </p>\n            <p>\n                <span class=\"content\">{3}</span>\n                <span class=\"count\">{4}</span>\n            </p>\n        </div>\n    </div>", html = '';
        this.last_friends.forEach(function (user) {
            html += ZUtils.str.format(tpl, user.avatar, user.name, user.last_message.time, user.last_message.content, user.new_count);
        });
        this.find('.dialog-tab-box .dialog-tab-item').eq(0).html(html);
    };
    ChatUserBox.prototype.renderUser = function () {
        var tpl = "<div class=\"dialog-info-avatar\">\n        <img src=\"{0}\" alt=\"\">\n    </div>\n    <div class=\"dialog-info-name\">\n        <h3>{1}</h3>\n        <p>{2}</p>\n    </div>\n    <div class=\"dialog-message-count\">\n    {3}\n    </div>";
        this.find('.dialog-info').html(ZUtils.str.format(tpl, this.user.avatar, this.user.name, this.user.brief, this.user.new_count));
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
            _this.menu.showPosition(event.clientX, event.clientY, $(this));
            return false;
        });
        this.menu.on('click', function () {
            console.log(arguments);
            _this.parent.userBox.show();
        });
    };
    return ChatUserBox;
}(ChatBaseBox));
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
var room = new ChatRoom($('.dialog-chat-page')), fixed_room = new ChatRoom($('.dialog-fixed'));
$(function () {
    $('.dialog-box').on('click', '.dialog-header .fa-close', function () {
        $(this).closest('.dialog-box').hide();
    });
});
