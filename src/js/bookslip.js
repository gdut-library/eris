/*global chrome*/
/*
 * bookslip.js
 *
 * 借书单
 */


var Q = require('q'),
    request = require('superagent-browserify'),
    config = require('./config'),
    utils = require('./utils');


/**
 * 同步服务器端借书单记录到本地
 *
 * @return promise 对象
 */
function update() {
    var dfd = Q.defer();

    user = utils.cache('user');
    request
        .get(config.baseUri + '/user/books')
        .set('X-LIBRARY-USERNAME', user.username)
        .set('X-LIBRARY-PASSWORD', user.password)
        .end(function(error, resp) {
            if (error) {
                dfd.reject(error);
            }

            if (resp.ok) {
                utils.cache('bookSlip', resp.body.books);
                dfd.resolve(resp.body.books);
            }
        });

    return dfd.promise;
}


/**
 * 添加一个条目到借书单
 *
 * @param ctrlno 条目的控制编码
 * @return promise 对象
 */
function add(ctrlno) {
    var dfd = Q.defer();

    user = utils.cache('user');
    request
        .put(config.baseUri + '/user/books/' + ctrlno)
        .set('X-LIBRARY-USERNAME', user.username)
        .set('X-LIBRARY-PASSWORD', user.password)
        .end(function(error, resp) {
            if (error) {
                dfd.reject(error);
            }

            if (resp.ok) {
                // 更新服务器端数据到本地
                update();
                dfd.resolve();
            }
        });

    return dfd.promise;
}


/**
 * 从借书单中移除一个条目
 *
 * @param ctrlno 条目的控制编码
 * @return promise 对象
 */
function remove(ctrlno) {
    var dfd = Q.defer();

    user = utils.cache('user');
    request
        .del(config.baseUri + '/user/books/' + ctrlno)
        .set('X-LIBRARY-USERNAME', user.username)
        .set('X-LIBRARY-PASSWORD', user.password)
        .end(function(error, resp) {
            if (error) {
                dfd.reject(error);
            }

            if (resp.ok) {
                update();
                dfd.resolve();
            }
        });

    return dfd.promise;
}


/**
 * 获取整个借书单
 *
 * @return promise 对象
 */
function get() {
    var dfd = Q.defer();

    update().then(function(books) {
        dfd.resolve(books);
    });

    return dfd.promise;
}


// TODO reduce request
module.exports = {
    add: add,
    remove: remove,
    get: get
};
