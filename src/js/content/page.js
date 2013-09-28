/*
 * page.js
 *
 * 一般 content script 的模式
 */


var _ = require('underscore');

module.exports = {
    // `page` 对页面进行处理
    //
    // Q: content script 作用是什么?
    // A: content script 主要对特定站点的(图书)页面进行解析，
    // 获取条目的详细信息；然后查询服务器端的数据并将结果插入
    // 到页面中去。
    //
    // 一个 content script 主要包含这几个生命周期：
    //
    // 1. 解析页面，获取条目信息 -> `parse`
    // 2. 发起查询；查询一般顺序是：
    //    i. 缓存
    //   ii. ISBN 10
    //  iii. ISBN 13
    //   iv. 条目标题
    // 3. 将查询结果注入到页面中 -> `inject` & `injectError`
    //   * `inject` 除了显示查询结果外，还需要将结果写入到缓存中以及
    //   绑定借书单操作
    //   * `injectError` 根据条目信息生成到图书馆荐购的链接
    page: _.extend({}, {
        /**
         * 解析页面，获取条目信息
         *
         * @return 返回条目信息，一般包括：
         * - 条目 id
         * - 条目标题
         * - 条目作者
         * - 条目 isbn 对象
         * - 条目出版时间
         */
        parse: function() {
            return {};
        },

        /**
         * 注入条目查询信息，包括查询成功或查询到相关结果
         *
         * @param bookInfos 条目查询信息
         * @param bookMeta 条目信息（从 `parse` 中获得）
         */
        inject: function(bookInfos, bookMeta) {
            console.log('inject here');
        },

        /**
         * 注入条目查询错误信息，包括没有查询到或者网络异常
         *
         * @param error 错误信息
         * @param bookMeta 条目信息 （从 `parse` 中获得）
         */
        injectError: function(error, bookMeta) {
            console.log('inject error here');
        }
    })
};
