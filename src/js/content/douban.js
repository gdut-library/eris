var _ = require('underscore'),
    Q = require('q'),
    page = require('./page'),
    config = require('../config'),
    utils = require('../utils'),
    query = require('./query'),
    bookSlip = require('./bookslip'),
    tmpl = require('./tmpl.douban');


var subject = _.extend(page.page, {
    base: document.querySelector('#info'),

    parse: function() {
        var raw = this.base.innerText,
            h = function(pattern) {
                r = pattern.exec(raw);
                return (r !== null) ? (r[1].trim()) : ('');
        };

        var id = /subject\/(\d+)/.exec(location.href);
        id = (id.length > 1) ? (id[1]) : (null);

        return {
            id: id,
            title: document.querySelector('#wrapper h1').innerText.trim(),
            author: h(/作者: (.*)/),
            publisher: h(/出版社: (.*)/),
            isbn: utils.convertISBN(h(/ISBN: (.*)/)),
            publish_time: h(/出版年: (.*)/)
        };
    },

    inject: function(bookInfos, bookMeta) {
        var that = this,
            pieces,
            detailCompare = function(b, meta) {
                if (b.details) {
                    for (var i in meta.isbn) {
                        if (meta.isbn[i] === b.details.isbn) {
                            return true;
                        }
                    }
                }
                return b.publisher === meta.publisher;
            };

        if (bookInfos.length === 1 && detailCompare(bookInfos[0], bookMeta)) {
            var b = bookInfos[0];

            pieces = tmpl.remains({
                url: config.libraryUri + '/bookinfo.aspx?ctrlno=' + b.ctrlno,
                remains: b.available
            });

            // TODO 在 bookslip 里处理
            // 目前就是模板和借书单的绑定分离了
            // 应该将这两个合并在一起
            if (config.enableBookSlip) {
                pieces += tmpl.addList(b);
            }
            pieces += tmpl.location(b);

            that.base.innerHTML += pieces;

            // 绑定借书单
            // TODO 在 bookslip 里处理
            // 目前就是模板和借书单的绑定分离了
            // 应该将这两个合并在一起
            if (config.enableBookSlip) {
                bookSlip.parse(b);
            }

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
        var type = /com\/([\w]+)\/*/.exec(document.URL);
        type = (type === null) ? ('index') : (type[1].trim());

        if (type === 'subject') {
            this.subject();
        } else {
            console.log(type);
        }
    },

    subject: function() {
        var meta = subject.parse();

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
                 subject.inject(bookInfos, meta);
             })
             // 查询失败，显示失败信息
             .fail(function(error) {
                 subject.injectError(error, meta);
             });
    }
});


helper.kick();
