/**
 * Created by EasyGame.
 * File: gulpfile.js
 * User: justin
 * Date: 13/2/2018
 * Time: 18:14
 */

'use strict';

const Gulp = require('gulp');
const Through = require('through2');
const Mocha = require('./zutils/modules/gulp-mocha-reporter');
const ConfigMocha = require('./config/mocha');

Gulp.task('default', function () {
    return Gulp.src(['z*/test/**/*_test.js'], {read: false})
        .pipe(Mocha({
            reporter: 'spec',
            checkLeaks: true,

            timeout: ConfigMocha.timeout,
            globals: {
                should: require('chai').should()
            }
        }));
});

Gulp.task('jenkins', function () {
    return Gulp.src(['z*/test/**/*_test.js'], {read: false})
        .pipe(Mocha({
            reporter: 'xunit',
            reporterOptions: {output: 'ztests/mocha.xml'},

            timeout: ConfigMocha.timeout,
            globals: {
                should: require('chai').should()
            }
        }));
});

Gulp.task('github', function () {
    return Gulp.src(['z*/test/**/*_test.js'], {read: false})
        .pipe(Mocha({
            reporter: 'markdown',
            result: true,
            reporterOptions: {output: 'ztests/mocha.md', haha: 11},

            timeout: ConfigMocha.timeout,
            globals: {
                should: require('chai').should()
            }
        }));
});

Gulp.task('mine', function () {
    return Gulp.src(['z*/test/**/*_test.js'], {read: false})
        .pipe(Through.obj(function (file, encoding, cb) {
            console.log('=====================================');
            console.log(file.relative);
            console.log(file.path);
            this.push(file);    // 必须push一下, 否则后面的pipe无法接收到文件.
            cb();
        }));
});