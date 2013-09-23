/*global chrome*/

var utils = require('./utils');


// bootstrap
(function() {
    // display the options page after install
    if (!utils.cache('optionsShowed')) {
        chrome.tabs.create({url: 'options.html'}, function(tab) {
            utils.cache('optionsShowed', true);
        });
    }
})();


function onRequest(req, sender, resp) {
    if (req.name === 'cache') {
        resp(utils.cache(req.key, req.value));
    } else if (req.name === 'user') {
        resp(utils.cache('user', req.value));
    } else {
        console.log(req, 'nothing to do with it');
    }
}

chrome.extension.onRequest.addListener(onRequest);
