var _ = require('underscore').template;


module.exports = {
    remains: _('<tr><td class="priceBlockLabel">GDUT:</td>' +
               '<td><a target="_blank" href=<%= url %>>还剩 <%= remains %> 本</a></td>' +
               '</tr>'),

    location: _('<tr><td class="priceBlockLabel"></td><td>在 <%= location %></td></tr>'),

    addList: _('<tr><td class="priceBlockLabel"></td><td><a href="#" data-ctrlno="<%= ctrlno %>"' +
               ' class="bookslip">添加到借书单</a></td></tr>'),

    similar: _('<tr><td class="priceBlockLabel">GDUT:</td>' +
               '<td><a target="_blank" href=<%= url %>>找到 <%= total %> 本类似的</a></td>' +
               '</tr>'),

    notFound: _('<tr><td class="priceBlockLabel">GDUT:</td>' +
                '<td>没有找到哦，去<a target="_blank" href=<%= url %>>荐购</a></td>' +
                '</tr>')
};
