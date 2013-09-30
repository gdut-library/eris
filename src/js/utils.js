/*
 * utils.js
 *
 * 工具函数
 */


var config = require('./config'),
    ISBN = require('./vendor/isbn'),
    _ = require('underscore'),
    Q = require('q'),
    request = require('superagent-browserify');

/**
 * 转换 isbn 到 isbn10 / isbn13 格式
 *
 * @param isbn 原始的 isbn 码
 * @return isbn 对象，包含 10 位/10 位分割/13 位/13 位分割 格式的 isbn 码
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
            // TODO 使用原生的对象字面量的字符形式
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
        toString: function() {
            return this['13'];
        }
    };
}

/**
 * 将查询结果缓存到 `localStorage` 里
 * 或从 `localStorage` 里读取对应结果
 *
 * @param key 缓存键值
 * @param value 缓存内容，如果为 `undefined`，
 * 则函数从 `localStorage` 读取对应值并进行 `json.parse`，
 * 该值包含内容需要和 json 格式兼容
 * @return 缓存内容
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


/**
 * 将字符串转换为 GB2312  编码
 *
 * 原始代码来自豆藤 [0]
 *
 * @param str 原始字符串
 * @return promise 对象
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


/**
 * 获取 url 中的查询参数
 *
 * @param str 原始的查询字符串 (e.g. `document.location.search`)
 * @return 查询参数的键值对象
 *
 * 原始代码来自 http://stackoverflow.com/a/1099670
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


/**
 * 构造 url 中的查询参数
 *
 * @param params 查询参数的键值对象
 * @return 查询字符串
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


/**
 * 获取当前的用户信息
 *
 * @return promise 对象
 *
 * added: 0.5.0
 */
function getCurrentUser() {
    var dfd = Q.defer();

    chrome.extension.sendMessage({
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


/**
 * 提供类似 `_.template` 的模板语法，
 * 但只包含变量代换
 *
 * @param tmpl 原始模板
 * @param data 需要绑定的数据
 * @return 替换后的字符串
 *
 * added: 0.5.0
 */
function template(tmpl, data) {
    // 使用 <%= %> 的形式
    var pattern = /<%=([\w ]+)%>/,
        r;

    while ((r = pattern.exec(tmpl)) !== null) {
        tmpl = tmpl.replace(r[0], data[r[1].trim()]);
    }

    return tmpl;
}


module.exports = {
    convertISBN: convertISBN,
    cache: cache,
    convertGB2312: convertGB2312,
    getQueryParams: getQueryParams,
    buildQueryParams: buildQueryParams,
    getCurrentUser: getCurrentUser,
    template: template
};
