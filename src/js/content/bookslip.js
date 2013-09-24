/*global chrome*/

var _ = require('underscore'),
    utils = require('../utils');


function injectActions(fn) {
    var selector = '.bookslip',
        actions = document.querySelectorAll(selector),
        i;

    for (i = actions.length - 1;i >= 0;i--) {
        fn(actions[i]);
    }
}


function injectAdded() {
    injectActions(function(element) {
        element.innerText = '从借书单里移除';
        element.onclick = function(e) {
            var ctrlno = element.attributes['data-ctrlno'].value;
            e.preventDefault();

            chrome.extension.sendRequest({
                name: 'bookSlip:remove',
                key: ctrlno
            }, function() {
                injectAdd();
            });
        };
    });
}


function injectAdd(userInfos) {
    injectActions(function(element) {
        element.innerText = '添加到借书单';
        element.onclick = function(e) {
            var ctrlno = element.attributes['data-ctrlno'].value;
            e.preventDefault();

            chrome.extension.sendRequest({
                name: 'bookSlip:add',
                key: ctrlno
            }, function() {
                injectAdded();
            });
        };
    });
}


function injectRefresh() {
    injectActions(function(element) {
        element.innerText = '点击刷新页面';
        element.onclick = function(e) {
            e.preventDefault();
            document.location.href = '';
        };
    });
}


function injectLoginRequired() {
    injectActions(function(element) {
        element.innerText = '添加到借书单';
        element.onclick = function(e) {
            e.preventDefault();

            chrome.extension.sendRequest({name: 'userLogin'}, function() {
                injectRefresh();
            });
        };
    });
}


function parse(meta) {
    utils.getCurrentUser()
        .then(function() {
            chrome.extension.sendRequest({
                name: 'bookSlip:get'
            }, function(books) {
                if (_.findWhere(books, {ctrlno: meta.ctrlno})) {
                    injectAdded();
                } else {
                    injectAdd();
                }
            });
        })
        .fail(injectLoginRequired);
}

module.exports = {
    parse: parse
};
