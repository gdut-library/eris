/*global chrome*/
/*
 * options.js
 *
 * 选项页控制
 */


var _ = require('underscore'),
    request = require('superagent-browserify'),
    config = require('./config'),
    utils = require('./utils');


// 对 `_.template` 进行 monkey patch，去除对 CSP 的依赖
_.template = function(tmpl) {
    return function(data) {
        return utils.template(tmpl, data);
    };
};


var loginForm = document.querySelector('#login'),
    informations = document.querySelector('#infomations'),
    parts = [loginForm, infomations];


// 显示登录表单
function loginValidate() {
    var username = document.querySelector('input[name="username"]'),
        password = document.querySelector('input[name="password"]'),
        message = document.querySelector('.message h3');

    loginForm.classList.remove('hide');
    loginForm.onsubmit = function(e) {
        var name = username.value.trim(),
            pwd = password.value.trim(),
            reason = null;

        e.preventDefault();

        if (!name || !(/\d{10}/.test(name))) {
            reason = '用户名格式错误';
        }
        if (!pwd) {
            reason = '密码不能为空';
        }

        if (reason) {
            message.innerHTML = reason;
            return;
        }

        request
            .post(config.baseUri + '/user/login')
            .set('X-LIBRARY-USERNAME', name)
            .set('X-LIBRARY-PASSWORD', pwd)
            .end(function(error, resp) {
                var userInfos;

                if (error) {
                    // TODO 根据错误内容设置错误信息
                    // e.g. 密码错误
                    console.error(error);
                    message.innerHTML = '网络错误';
                    return;
                }

                if (resp.ok) {
                    userInfos = _.extend(resp.body, {
                        username: name,
                        password: pwd
                    });
                    // 登录成功后保存用户信息并刷新本页
                    chrome.extension.sendRequest({
                        name: 'user',
                        value: userInfos
                    }, function() {
                        main();
                    });
                    return;
                } else {
                    message.innerHTML = resp.body.error;
                    return;
                }
            });
    };
}


// 显示用户个人信息
function showInfomations(userInfos) {
    var tmpl = _.template('' +
        '<h3 class="name"><em>Hi</em>, <%= name %></h3>' +
        '<h4 class="major"><%= faculty %> <%= major %></h4>');

    var books = (function(books) {
        var tmpl = _.template('<li><h3 class="title">' +
                '<a href="<%= uri %>"><%= name %></a>' +
            '</h3></li>'),
            parent = _.template('<ul><%= list %></ul>'),
            buf = '',
            i;

        for (i = 0;i < books.length;i++) {
            buf += tmpl({
                name: books[i].name,
                uri: config.libraryUri + '/bookinfo.aspx?ctrlno=' +
                     books[i].ctrlno
            });
        }

        return parent({list: buf});
    })(userInfos.bookSlip);

    infomations.classList.remove('hide');
    infomations.innerHTML = tmpl(userInfos.user) + books;
}


function main() {
    var i;

    for (i = parts.length - 1;i >= 0;i--) {
        parts[i].classList.add('hide');
    }

    utils.getCurrentUser()
        // 如果用户已经登录，显示用户信息
        .then(showInfomations)
        // 未登录则显示登录表单
        .fail(loginValidate);
}


main();
