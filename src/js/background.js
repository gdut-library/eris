/*global chrome*/

var _ = require('underscore'),
    utils = require('./utils'),
    bookSlip = require('./bookslip');


function displayOptionsPage(cb) {
    chrome.tabs.create({url: 'options.html'}, cb);
}


// bootstrap
(function() {
    // display the options page after install
    if (!utils.cache('optionsShowed')) {
        displayOptionsPage(function(tab) {
            utils.cache('optionsShowed', true);
        });
    }
})();


function onRequest(req, sender, resp) {
    var user;

    if (req.name === 'cache') {
        resp(utils.cache(req.key, req.value));
    } else if (req.name === 'user') {
        user = utils.cache('user', req.value);

        if (user) {
            user = _.extend(user, {
                bookSlip: utils.cache('bookSlip')
            });
        }

        resp(user);
    } else if (req.name === 'userLogin') {
        displayOptionsPage(resp);
    } else if (req.name === 'bookSlip:get') {
        bookSlip.get().then(resp);
    } else if (req.name === 'bookSlip:add') {
        bookSlip.add(req.key).then(resp);
    } else if (req.name === 'bookSlip:remove') {
        bookSlip.remove(req.key).then(resp);
    } else {
        console.log(req, 'nothing to do with that');
    }
}

chrome.extension.onRequest.addListener(onRequest);
