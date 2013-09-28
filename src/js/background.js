/*global chrome*/
/*
 * background.js
 *
 * 提供 background page 通信分发处理
 */

var _ = require('underscore'),
    utils = require('./utils'),
    bookSlip = require('./bookslip');


function displayOptionsPage(cb) {
    chrome.tabs.create({url: 'options.html'}, cb);
}


// 检查是否显示过登录页（安装后），如果没有，自动打开
(function() {
    if (!utils.cache('optionsShowed')) {
        displayOptionsPage(function(tab) {
            utils.cache('optionsShowed', true);
        });
    }
})();


/**
 * 请求接收端
 *
 * 根据 `req` 来进行分发
 *
 * req = {
 *     name: # 请求类型
 *     key: # 键
 *     value: # 值
 *     ...etc...
 * }
 */
function onRequest(req, sender, resp) {
    var user;

    if (req.name === 'cache') {
        // 缓存获取、设置
        resp(utils.cache(req.key, req.value));
    } else if (req.name === 'user') {
        // 用户信息获取；
        // 如果用户存在，添加借书单记录
        user = utils.cache('user', req.value);

        if (user) {
            user = _.extend(user, {
                bookSlip: utils.cache('bookSlip')
            });
        }

        resp(user);
    } else if (req.name === 'userLogin') {
        // 用户登录，打开登录页
        displayOptionsPage(resp);
    } else if (req.name === 'bookSlip:get') {
        // 获取借书单
        bookSlip.get().then(resp);
    } else if (req.name === 'bookSlip:add') {
        // 向借书单添加一个条目
        bookSlip.add(req.key).then(resp);
    } else if (req.name === 'bookSlip:remove') {
        // 从借书单里移除一个条目
        bookSlip.remove(req.key).then(resp);
    } else {
        console.error(req, 'nothing to do with that');
    }
}


// 注册监听函数
chrome.extension.onRequest.addListener(onRequest);
