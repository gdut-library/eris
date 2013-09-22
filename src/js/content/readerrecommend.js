var _ = require('underscore'),
    basePage = require('./page').page,
    utils = require('../utils');


var page = _.extend(basePage, {
    parse: function() {
        var params = utils.getQueryParams(document.location.search);

        return {
            title: params.title || '',
            author: params.author || '',
            isbn: params.isbn || '',
            publisher: params.publisher || '',
            publish_time: params.publish_time || ''
        };
    },

    inject: function(meta) {
        var i,
            fields = {
                title: document.querySelector('#ctl00_ContentPlaceHolder1_titletb'),
                author:  document.querySelector('#ctl00_ContentPlaceHolder1_authortb'),
                isbn: document.querySelector('#ctl00_ContentPlaceHolder1_isbntb'),
                publisher: document.querySelector('#ctl00_ContentPlaceHolder1_publishertb'),
                publish_time: document.querySelector('#ctl00_ContentPlaceHolder1_publishdatetb')
            };

        for (i in fields) {
            fields[i].value = meta[i] || '';
        }
    }
});


var helper = _.extend({}, {
    kick: function() {
        page.inject(page.parse());
    }
});

helper.kick();
