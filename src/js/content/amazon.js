var _ = require('underscore'),
    config = require('../config'),
    utils = require('../utils'),
    page = require('./page'),
    query = require('./query'),
    tmpl = require('./tmpl.amazon'),
    bookSlip = require('./bookslip');


var amazon = _.extend(page.page, {
    base: document.querySelector('#priceBlock .product tbody'),

    parse: function(id) {
        var h = function(pattern, raw) {
                r = pattern.exec(raw);
                return (r !== null) ? (r[1].trim()) : ('');
            },
            raw = document.querySelector('table .content > ul').innerText,
            hh = function(pattern) {
                return h(pattern, raw);
            };

        return {
            id: id,
            title: h(/(.*)\[.*/,
                     document.querySelector('#btAsinTitle').innerText),
            author: document.querySelector('.buying h1 + a').innerText.trim(),
            publisher: hh(/出版社:(.*);.*/),
            isbn: utils.convertISBN(hh(/ISBN: ([X\d]*)/)),
            publish_time: hh(/出版社:.*\((.*)\)/)
        };
    },

    inject: function(bookInfos, bookMeta) {
        var that = this,
            pieces;
            detailCompare = function(b, meta) {
            // TODO compare ISBN
            return b.publisher === meta.publisher;
        };

        if (bookInfos.length === 1 && detailCompare(bookInfos[0], bookMeta)) {
            var b = bookInfos[0];

            pieces = tmpl.remains({
                url: config.libraryUri + '/bookinfo.aspx?ctrlno=' + b.ctrlno,
                remains: b.available
            });
            pieces += tmpl.addList(b);
            pieces += tmpl.location(b);

            that.base.innerHTML += pieces;

            // 绑定借书单
            bookSlip.parse(b);
            
            // 写入缓存
            query.updateCache(_.extend(b, {
                id: bookMeta.id
            }));
        } else {
            utils.convertGB2312(bookMeta.title).then(function(gbTitle) {
                pieces = tmpl.similar({
                    url: config.libraryUri + '/searchresult.aspx?dp=50&anywords=' +
                         gbTitle,
                    total: bookInfos.length
                });

                that.base.innerHTML += pieces;
            });
        }
    },

    injectError: function(bookInfos, bookMeta) {
        var pieces = tmpl.notFound({
            url: config.libraryUri + '/readerrecommend.aspx?' +
                 utils.buildQueryParams(bookMeta)
        });

        this.base.innerHTML += pieces;
    }
});


var helper = _.extend({}, {
    kick: function() {
        if (!(/图书/.test(
            document.querySelector('.nav-category-button').innerText))) {
            return;
        }

        var patterns = [
            /.*\/dp\/(.*)\//,
            /.*\/gp\/product\/(.*)\//
        ], i, id;

        for (i = 0;i < patterns.length;i++) {
            id = patterns[i].exec(location.href);
            if (id && id.length > 1) {
                this.product(id[1].trim());
                return;
            }
        }
    },

    product: function(id) {
        var meta = amazon.parse(id);

        console.log(meta);

        query.queryCache(meta)
            .fail(function() {
                return query.queryISBN10(meta);
            })
            .fail(function() {
                return query.queryISBN13(meta);
            })
            .fail(function() {
                return query.queryTitle(meta);
            })
            // 成功查询到书籍，显示书籍信息
            .then(function(bookInfos) {
                amazon.inject(bookInfos, meta);
            })
            // 查询失败，显示失败信息
            .fail(function(error) {
                amazon.injectError(error, meta);
            });
    }
});


helper.kick();
