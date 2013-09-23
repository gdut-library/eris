/*global chrome*/

var utils = require('./utils');


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
