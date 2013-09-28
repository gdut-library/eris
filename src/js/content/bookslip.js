/*global chrome*/
/*
 * bookslip.js
 *
 * 绑定页面借书单操作
 */

var _ = require('underscore'),
    utils = require('../utils');


function injectActions(fn) {
    var selector = '.bookslip', // 选择元素
        actions = document.querySelectorAll(selector),
        i;

    for (i = actions.length - 1;i >= 0;i--) {
        fn(actions[i]);
    }
}


// 提示已经在借书单中
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


// 添加到借书单
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


// 提示登录后要刷新页面
function injectRefresh() {
    injectActions(function(element) {
        element.innerText = '点击刷新页面';
        element.onclick = function(e) {
            e.preventDefault();
            document.location.href = '';
        };
    });
}


// 提示需要登录
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
    // 检查当前用户是否登录
    utils.getCurrentUser()
        .then(function() {
            chrome.extension.sendRequest({
                name: 'bookSlip:get'
            }, function(books) {
                // 检查是否在借书单中
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
