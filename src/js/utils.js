var config = require('./config'),
    ISBN = require('./vendor/isbn'),
    _ = require('underscore'),
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
            '13h': isbn.isbn13h,
            toString: function() {
                return this['13'];
            }
        };
    }

    return {
        '10': isbn,
        '10h': isbn,
        '13': isbn,
        '13h': isbn,
        toLocaleString: function() {
            return this['13'];
        }
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


/*
 * 获取 url 中的 query parameters
 *
 * origin code from http://stackoverflow.com/a/1099670
 *
 * added: 0.5.0
 */
function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while ((tokens = re.exec(qs))) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}


/*
 * 构造 url query parameters
 *
 * added: 0.5.0
 */
function buildQueryParams(params) {
    var qs = [],
        key,
        value;

    for (key in params) {
        value = params[key];
        // for isbn
        if (typeof value === 'object') {
            value = value.toString();
        }
        qs.push(encodeURIComponent(key) + '=' +
                encodeURIComponent(value));
    }

    return qs.join('&');
}


/*
 * 获取当前的用户信息
 *
 * added: 0.5.0
 */
function getCurrentUser() {
    var dfd = Q.defer();

    chrome.extension.sendRequest({
        name: 'user'
    }, function(userInfos) {
        if (userInfos) {
            dfd.resolve(_.extend(userInfos, {
                isLogin: true
            }));
        } else {
            dfd.reject(userInfos);
        }
    });

    return dfd.promise;
}


module.exports = {
    convertISBN: convertISBN,
    cache: cache,
    convertGB2312: convertGB2312,
    getQueryParams: getQueryParams,
    buildQueryParams: buildQueryParams,
    getCurrentUser: getCurrentUser
};
