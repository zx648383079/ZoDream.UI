function insertHtmlAtCaret(html) {
    var sel, range, editor = $('.dialog-chat-room .dialog-message-text');
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
}
$(function () {
    var mainBox = $('.dialog-chat-box'), addBox = $('.dialog-add-box'), userBox = $('.dialog-user-box'), searchBox = $('.dialog-search-box'), chatBox = $('.dialog-chat-room');
    $(document).click(function () {
        $(".dialog-menu").hide();
    }).on('selectionchange', function (e) {
        console.log(e);
    });
    mainBox.click(function () {
        if ($(this).hasClass('dialog-min')) {
            $(this).removeClass('dialog-min');
        }
    });
    mainBox.on('click', '.dialog-header .fa-minus', function (e) {
        e.stopPropagation();
        mainBox.addClass('dialog-min');
    });
    $('.dialog-box').on('click', '.dialog-header .fa-close', function () {
        $(this).closest('.dialog-box').hide();
    });
    mainBox.on('click', '.dialog-header .fa-plus', function () {
        searchBox.show();
    });
    mainBox.on('click', '.dialog-tab .dialog-tab-header .dialog-tab-item', function () {
        var $this = $(this);
        $this.addClass('active').siblings().removeClass('active');
        $this.closest('.dialog-tab').find('.dialog-tab-box .dialog-tab-item').eq($this.index()).addClass('active').siblings().removeClass('active');
    });
    mainBox.on('click', '.dialog-panel .dialog-panel-header', function () {
        $(this).closest('.dialog-panel').toggleClass('expanded');
    });
    mainBox.on('click', '.dialog-tab .dialog-user', function () {
        $(this).closest('.dialog-chat').find('.dialog-chat-room').show();
    });
    searchBox.on('click', '.dialog-search-list .dialog-info', function () {
        addBox.show();
    });
    searchBox.on('click', '.dialog-tab-header .dialog-tab-item', function () {
        var $this = $(this);
        $this.addClass('active').siblings().removeClass('active');
    });
    mainBox.on('contextmenu', '.dialog-tab .dialog-user', function (event) {
        mainBox.find('.dialog-menu').css({
            'left': event.clientX + 'px',
            'top': event.clientY + 'px'
        }).show();
        return false;
    });
    mainBox.on('click', '.dialog-menu li', function () {
        userBox.show();
    });
    chatBox.on('click', '.fa-smile-o', function () {
        insertHtmlAtCaret('<img src="./image/avatar.jpg" alt="">');
    });
});
