// ==UserScript==
// @name       GDUT library helper
// @namespace  http://library.gdut.edu.cn
// @version    0.1.0
// @description  Show the available books amount in GDUT library.
// @match      http://book.douban.com/*
// @copyright  2012-2013, Link, hbc
// @require http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.3.min.js
// @require http://isbn.jpn.org/js/isbn.js
// @require http://isbn.jpn.org/js/isbn-groups.js
// ==/UserScript==
// @grant GM_xmlhttpRequest

var helper = {
    url: 'http://222.200.98.171:81/',
    book: {},
    parser: {},
    query: {},
    inject: {},
    utils: {},
    tmpl: {},
    init: {},
    kick: {}
};

/* utils */
// Origin code from Bean vine: userscripts.org/scripts/review/49911
helper.utils.gb2312 = function(keyword) {
    var dfd = $.Deferred();

    GM_xmlhttpRequest({
        method: 'GET',
        url: 'http://www.baidu.com/s?ie=utf-8&wd=' + encodeURIComponent(keyword),
        overrideMimeType: 'text/xml; charset=gb2312',
        onload: function(resp) {
            if (resp.status < 200 || resp.status > 300) {
                return;
            }
            var keywordGB = String(resp.responseText.match(/word=[^'"&]+['"&]/i)).replace(/word=|['"&]/ig,'');
            /* in gb2312 now */
            helper.book.name = keywordGB;
            dfd.resolve(keywordGB);
        },
        onerror: function() {
            return;
        }
    });

    return dfd.promise();
};

// Origin code from isbn.jpn.org
helper.utils.convertISBN = function(isbn, length) {
    var result = [ ];
    isbn = ISBN.parse(isbn);
    if(length === 10) {
        result.push(isbn.asIsbn10(true));
    }
    else if(length === 13) {
        result.push(isbn.asIsbn13(true));
    }
    return result;
};

/* Origin code from John Resig's post
 * http://ejohn.org/blog/javascript-micro-templating/
 *
 * But I removed the cache implement as it will not affect
 * the efficiency obviously.
 */
helper.utils.tmpl = function(str, data) {
    var fn = new Function("obj",
        "var p=[],PRINT=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        str
         .replace(/[\r\t\n]/g, " ")
         .split("<%").join("\t")
         .replace(/((^|%>)[^\t]*)'/g, "$1\r")
         .replace(/\t=(.*?)%>/g, "',$1,'")
         .split("\t").join("');")
         .split("%>").join("p.push('")
         .split("\r").join("\\'")
    + "');}return p.join('');");
    return fn(data);
};

helper.utils.publisher_cmp = function(a, b) {
    if (a.publisher === b.publisher) {
        return true;
    }
    return false;
};

/* inject */

helper.inject.book = function(result) {
    var info = $('#info');
    var tmpl;

    if (result.foundc <= 0) {
        tmpl = helper.tmpl.result(helper.tmpl.link(result.url, '没有找到哦'));
    } else {
        if (result.total === 0 && result.remains === 0) {
            tmpl = helper.tmpl.result(
                    helper.tmpl.link(result.url,
                                     '找到 ' + result.foundc + ' 本类似的')
                   );
        } else {
            tmpl = helper.tmpl.result(
                    helper.tmpl.link(result.url, '还剩 ' + result.remains + ' 本')
                   );
        }
    }
    info.append(tmpl);
};

helper.inject.search = function(result) {
    var r = $('#content .aside .mb20');
    var tmpl;

    if (result.foundc <= 0) {
        tmpl = helper.tmpl.search('没有找到哦');
    } else {
        tmpl = helper.tmpl.search(
                helper.tmpl.link(result.url,
                                 '找到 ' + result.foundc + ' 本类似的')
               );
    }
    $(tmpl).insertBefore(r);
};

/* templating */

helper.tmpl.result = function(buffer) {
    return helper.utils.tmpl(
        '<span class="pl">GDUT:</span> <%=content%><br />',
         {content: buffer}
    );
};

helper.tmpl.link = function(url, content) {
    return helper.utils.tmpl(
        '&nbsp;<a target="_blank" href=<%=url%>><%=content%></a>',
        {url: url, content: content}
    );
};

helper.tmpl.query = function(type, value) {
    return helper.utils.tmpl(
        helper.url + 'searchresult.aspx?dp=50&<%=type%>=<%=value%>',
        {type: type, value: value}
    );
};

helper.tmpl.book = function(ctrlno) {
    return helper.url + 'bookinfo.aspx?ctrlno=' + ctrlno;
};

helper.tmpl.search = function(desc) {
    return helper.utils.tmpl(
        '<div class="mb20"><div class="hd"><h2>在广工图书馆&nbsp;·&nbsp;·&nbsp;·</h2></div><div class="bd"><p class="pl"><%=desc%></p></div>',
        {desc: desc}
    );
};

/* parser */

helper.parser.book = function() {

    var publisher = /出版社: (.*)/.exec($('#info').text());
    if (publisher !== null) {
        publisher = publisher[1].trim();
    }
    var isbn = /ISBN: (.*)/.exec($('#info').text());
    if(isbn !== null) {
        isbn = isbn[1].trim();
    }
    
    /* still in utf-8 */
    helper.book.name = $('#wrapper h1 span').text();
    helper.book.publisher = publisher;
    helper.book.isbn10 = helper.utils.convertISBN(isbn,10);
    helper.book.isbn13 = helper.utils.convertISBN(isbn,13);
};

helper.parser.search = function() {
    helper.book.query_text = $('#inp-query').attr('value');
};

helper.parser.result = function(buffer) {
    var c = $(buffer).children();
    if (c.length < 9) {
        return null;
    }

    return {
        name: $(c[1]).text().trim(),
        ctrlno: $('input', c[0]).attr('value').trim(),
        author: $(c[2]).text().trim(),
        publisher: $(c[3]).text().trim(),
        total: parseInt($(c[6]).text().trim(), 10),
        remains: parseInt($(c[7]).text().trim(), 10)
    };
};

helper.parser.results = function(buffer, url, cmp) {
    var ret = {
        remains: 0,
        total: 0,
        foundc: 0,
        url: url,
    };

    var not_found = $('#searchnotfound', buffer);
    if (not_found.length === 0) {
        /* found the books */
        var results = $('tbody tr', buffer);
        var r;
        var i;
        ret.foundc = $('#ctl00_ContentPlaceHolder1_countlbl', buffer).html();
        ret.foundc = parseInt(ret.foundc, 10);
        for (i = 0;i < results.length;i ++) {
            r = helper.parser.result(results[i]);
            if (r !== null && cmp(r, helper.book)) {
                ret.url = helper.tmpl.book(r.ctrlno);
                ret.remains += r.remains;
                ret.total += r.total;
                break;
            }
        }
    }

    return ret;
};

/* query */

helper.query.query_factory = function(type, cmp) {
    return function(value) {
        var dfd = new $.Deferred();
        var query_url = helper.tmpl.query(type, value);

        GM_xmlhttpRequest({
            method: 'GET',
            url: query_url,
            onload: function(resp) {
                result = helper.parser.results(resp.responseText, query_url,
                                               cmp);
                if (result.found) {
                    dfd.resolve(result);
                } else {
                    dfd.reject(result);
                }
            }
        });

        return dfd.promise();
    };
};

helper.query.title = function() {
    var dfd = new $.Deferred();

    var fn = helper.query.query_factory('title_f', helper.utils.publisher_cmp);
    helper.utils.gb2312(helper.book.name).then(function(name) {
        fn(name).then(helper.inject.book).fail(dfd.reject);
    }).fail(dfd.reject);

    return dfd.promise();
};

helper.query.isbn = function() {
    var dfd = new $.Deferred();

    var fn = helper.query.query_factory('isbn_f', helper.utils.publisher_cmp);
    fn(helper.book.isbn13).fail(function() {
            fn(helper.book.isbn10).then(helper.inject.book).fail(dfd.reject);
    }).then(helper.inject.book);

    return dfd.promise();
};

helper.query.anywords = function() {
    var dfd = new $.Deferred();

    var cmp = function(a, b) {return false;};
    var fn = helper.query.query_factory('anywords', cmp);
    helper.utils.gb2312(helper.book.query_text).then(function(name) {
        fn(name).then(helper.inject.search).fail(dfd.reject);
    }).fail(dfd.reject);

    return dfd.promise();
};

helper.init.book = function() {
    helper.parser.book();
};

helper.init.search = function() {
    helper.parser.search();
};

helper.kick = function() {
    var type = /com\/([\w]+)\/*/.exec(document.URL);
    if (type !== null) {
        type = type[1].trim();
    } else {
        type = 'index';
    }

    /* dispatch the request */
    if (type === 'subject') {
        helper.init.book();
        helper.query.isbn().fail(function() {
            helper.query.title().fail(helper.inject.book);
        });
    } else if (type === 'subject_search') {
        helper.init.search();
        helper.query.anywords().fail(helper.inject.search);
    } else {
        console.log(type);
    }
};

/* kick off */
helper.kick();
