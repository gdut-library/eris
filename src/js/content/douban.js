var _ = require('underscore'),
    config = require('../config'),
    utils = require('../utils'),
    query = require('./query'),
    tmpl = require('./tmpl.douban'),
    Q = require('q');


var page = _.extend({}, {
    parse: function() {
        return {};
    },

    inject: function() {
        console.log('inject here');
    },

    injectError: function() {
        console.log('inject error here');
    }
});


var subject = _.extend(page, {
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
                // TODO compare ISBN
                return b.publisher === meta.publisher;
            };

        if (bookInfos.length === 1 && detailCompare(bookInfos[0], bookMeta)) {
            var b = bookInfos[0];
            pieces = tmpl.remains({
                url: config.libraryUri + '/bookinfo.aspx?ctrlno=' + b.ctrlno,
                remains: b.available,
                location: b.location
            });
            // 写入缓存
            query.updateCache(_.extend(b, {
                id: bookMeta.id
            }));

            this.base.innerHTML += pieces;
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
            // TODO inject on readerrecommend
            url: config.libraryUri + '/readerrecommend.aspx'
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
