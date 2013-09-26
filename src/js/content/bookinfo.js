var _ = require('underscore'),
    utils = require('../utils'),
    page = require('./page'),
    bookSlip = require('./bookslip');


var infos = _.extend(page.page, {
    parse: function() {
        return {
            ctrlno: utils.getQueryParams(document.location.search).ctrlno
        };
    },

    inject: function(bookInfos, bookMeta) {
        var node = (function() {
            var n = document.createElement('div');
            n.innerHTML = _.template('<a data-ctrlno="<%= ctrlno %>" href="#"' +
                                     ' class="act bookslip">添加到借书单</a>')(bookMeta);

            return n.firstChild;
        })(),
            parent = document.querySelector('.headactinfo nobr'),
            sibling = document.querySelector('.headactinfo .act');

        parent.insertBefore(node, sibling);

        // 绑定借书单
        bookSlip.parse(bookMeta);
    }
});


var helper = _.extend({}, {
    kick: function() {
        var meta = infos.parse();

        console.log(meta);

        infos.inject(meta, meta);
    }
});


helper.kick();
