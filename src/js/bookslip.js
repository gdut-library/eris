/*global chrome*/

var Q = require('q'),
    request = require('superagent-browserify'),
    config = require('./config'),
    utils = require('./utils');


/* 同步服务器端到本地 */
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
                update();
                dfd.resolve();
            }
        });

    return dfd.promise;
}


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


function get(ctrlno) {
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
