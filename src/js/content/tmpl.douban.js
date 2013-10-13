var _ = require('underscore').template;


module.exports = {
    remains: _('<span class="pl">GDUT:</span>&nbsp;' +
               '<a target="_blank" href=<%= url %>>还剩 <%= remains %> 本</a>'),

    location: _('<br /> 在 <%= location %>'),

    addList: _(' | <a href="#" data-ctrlno="<%= ctrlno %>"' +
               ' class="bookslip"></a>'),

    similar: _('<span class="pl">GDUT:</span>&nbsp;' +
               '<a target="_blank" href=<%= url %>>找到 <%= total %> 本类似的</a>'),

    notFound: _('<span class="pl">GDUT:</span>&nbsp;' +
                '没有找到哦，去<a target="_blank" href=<%= url %>>荐购</a>')
};
