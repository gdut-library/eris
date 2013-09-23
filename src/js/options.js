/*global chrome*/

var _ = require('underscore'),
    request = require('superagent-browserify'),
    config = require('./config');


var loginForm = document.querySelector('#login'),
    informations = document.querySelector('#infomations'),
    parts = [loginForm, infomations];


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
                    console.log(error);
                    message.innerHTML = '网络错误';
                    return;
                }

                if (resp.ok) {
                    userInfos = _.extend(resp.body, {
                        username: name,
                        password: pwd
                    });
                    chrome.extension.sendRequest({
                        name: 'user',
                        value: userInfos
                    }, function() {
                        main();
                    });
                    return;
                } else {
                    message.innerHTML = resp.body.msg;
                    return;
                }
            });
    };
}

function showInfomations(userInfos) {
    // TODO remove templating
    var tmpl = _.template('' +
        '<h3 class="name"><em>Hi</em>, <%= name %></h3>' +
        '<h4 class="major"><%= faculty %> <%= major %></h4>');

    infomations.classList.remove('hide');
    infomations.innerHTML = tmpl(userInfos.user);
}


function main() {
    var i;

    for (i = parts.length - 1;i >= 0;i--) {
        parts[i].classList.add('hide');
    }

    chrome.extension.sendRequest({
        name: 'user'
    }, function(user) {
        if (user) {
            showInfomations(user);
        } else {
            loginValidate();
        }
    });
}

main();
