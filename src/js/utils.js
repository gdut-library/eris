var config = require('./config'),
    ISBN = require('./vendor/isbn');

/*
 * 转换 isbn 到 isbn10 / isbn13 格式
 *
 * added: 0.5.0
 */
function convertISBN(isbn) {
    var parsed = ISBN.parse(isbn);

    if (parsed !== null) {
        isbn = parsed.codes;
        return {
            '10': isbn.isbn10,
            '10h': isbn.isbn10h,
            '13': isbn.isbn13,
            '13h': isbn.isbn13h
        };
    }

    return {
        '10': isbn,
        '10h': isbn,
        '13': isbn,
        '13h': isbn
    };
}

/*
 * 将查询结果缓存到 `localStorage` 里
 *
 * added: 0.3.2
 */
function cache(key, value) {
    key = config.name + '.' + key;

    if (value !== undefined) {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        value = JSON.parse(localStorage.getItem(key));
    }

    return value;
}


module.exports = {
    convertISBN: convertISBN,
    cache: cache
};
