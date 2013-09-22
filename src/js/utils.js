var config = require('./config'),
    ISBN = require('./vendor/isbn'),
    Q = require('q'),
    request = require('superagent-browserify');

/*
 * 转换 isbn 到 isbn10 / isbn13 格式
 *
 * added: 0.5.0
 */
function convertISBN(isbn) {
    var parsed = ISBN.parse(isbn);

    if (parsed !== null) {
        isbn = parsed.codes;
        return {
            '10': isbn.isbn10,
            '10h': isbn.isbn10h,
            '13': isbn.isbn13,
            '13h': isbn.isbn13h
        };
    }

    return {
        '10': isbn,
        '10h': isbn,
        '13': isbn,
        '13h': isbn
    };
}

/*
 * 将查询结果缓存到 `localStorage` 里
 *
 * added: 0.3.2
 */
function cache(key, value) {
    key = config.name + '.' + key;

    if (value !== undefined) {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        value = JSON.parse(localStorage.getItem(key));
    }

    return value;
}


/*
 * 将字符串转换为 GB2312  编码
 *
 * origin code from Bean Vine [0]
 *
 * [0] http://www.userscripts.org/scripts/review/49911
 */
function convertGB2312(str) {
    var dfd = Q.defer();

    request
        .get('http://www.baidu.com/s')
        .query({ie: 'utf-8'})
        .query({wd: str})
        .set('overrideMimeType', 'text/xml; charset=gb2312')
        .end(function(error, resp) {
            if (error) {
                dfd.reject(error);
            } else {
                var gbStr = String(
                    resp.xhr.responseText.match(/word=[^'"&]+['"&]/i))
                        .replace(/word=|['"&]/ig, '');
                dfd.resolve(gbStr);
            }
        });

    return dfd.promise;
}


module.exports = {
    convertISBN: convertISBN,
    cache: cache,
    convertGB2312: convertGB2312
};
