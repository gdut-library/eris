var _ = require('underscore');

module.exports = {
    page: _.extend({}, {
        parse: function() {
            return {};
        },

        inject: function() {
            console.log('inject here');
        },

        injectError: function() {
            console.log('inject error here');
        }
    })
};
