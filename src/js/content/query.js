/*global chrome*/

var Q = require('q'),
    request = require('superagent-browserify'),
    config = require('../config');


/* 删除书籍缓存记录 */
function removeCache(book) {
    var dfd = Q.defer();

    chrome.extension.sendRequest({
        name: 'cache',
        key: book.id,
        value: null
    }, function(cache) {
        dfd.resolve(null);
    });

    return dfd.promise;
}


/* 更新或创建书籍缓存记录 */
function updateCache(book) {
    var dfd = Q.defer();

    if (book.view) {
        book.view += 1;
    } else {
        book.view = 1;
    }
    chrome.extension.sendRequest({
        name: 'cache',
        key: book.id,
        value: book
    }, function(cache) {
        if (cache) {
            dfd.resolve([cache]);
        } else {
            dfd.reject([cache]);
        }
    });

    return dfd.promise;
}


function queryCache(book) {
    var dfd = Q.defer();

    chrome.extension.sendRequest({
        name: 'cache',
        key: book.id,
        value: undefined
    }, function(cache) {
        if (!cache) { // 缓存不存在
            dfd.reject([cache]);
        } else if (cache.view > config.refresh) { // 需要更新缓存
            removeCache(book);
            dfd.reject([cache]);
        } else {
            dfd.resolve([cache]);
        }
    });

    return dfd.promise;
}


function queryBook(keyword) {
    var dfd = Q.defer(),
        req;

    request
        .get(config.baseUri + '/book/search')
        .query({q: keyword})
        .end(function(error, resp) {
            if (error) {
                dfd.reject(error);
                return;
            }
            if (resp.ok) {
                dfd.resolve(resp.body.books);
            } else {
                dfd.reject(resp.body.books);
            }
        });

    return dfd.promise;
}


function queryISBN(isbn) {
    var dfd = Q.defer(),
        req;

    request
        .get(config.baseUri + '/book/search')
        .query({q: isbn})
        .end(function(error, resp) {
            if (error) {
                dfd.reject(error);
                return;
            }
            // 确保 isbn 查询只匹配一本
            if (resp.ok && resp.body.books.length === 1) {
                dfd.resolve(resp.body.books);
            } else {
                dfd.reject(resp.body);
            }
        });

    return dfd.promise;
}


function queryISBN10(book) {
    return queryISBN(book.isbn['10h']);
}


function queryISBN13(book) {
    return queryISBN(book.isbn['13h']);
}


function queryTitle(book) {
    return queryBook(book.title);
}


module.exports = {
    updateCache: updateCache,
    queryCache: queryCache,
    queryISBN10: queryISBN10,
    queryISBN13: queryISBN13,
    queryTitle: queryTitle
};
