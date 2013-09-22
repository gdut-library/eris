/*global require*/

module.exports = function(grunt) {
    'use strict';

    var devConfig = {
        baseUri: 'http://127.0.0.1:9001'
    };

    var distConfig = {
        baseUri: 'http://beta.youknowmymind.com:1944'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        distConfig: distConfig,

        replace: {
            configjs: {
                src: ['dist/**/*.js', 'dist/**/*.json'],
                overwrite: true,
                replacements: [{
                    from: devConfig.baseUri,
                    to: distConfig.baseUri
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-text-replace');

    grunt.registerTask('default', ['replace']);
};
