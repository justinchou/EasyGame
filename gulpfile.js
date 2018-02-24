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

function DefaultTask(name, src) {
    Gulp.task(name, function () {
        return Gulp.src(src, {read: false})
            .pipe(Mocha({
                reporter: 'spec',
                checkLeaks: true,

                timeout: ConfigMocha.timeout,
                globals: {
                    should: require('chai').should()
                }
            }));
    });
}

DefaultTask('zutils', ['zutils/test/**/*_test.js']);
DefaultTask('zwebsite', ['zwebsite/test/**/*_test.js']);
DefaultTask('zplatform', ['zplatform/test/**/*_test.js']);
DefaultTask('zhall', ['zhall/test/**/*_test.js']);
DefaultTask('default', ['z*/test/**/*_test.js']);

// Gulp.task('default', function () {
//     return Gulp.src(['z*/test/**/*_test.js'], {read: false})
//         .pipe(Mocha({
//             reporter: 'spec',
//             checkLeaks: true,
//
//             timeout: ConfigMocha.timeout,
//             globals: {
//                 should: require('chai').should()
//             }
//         }));
// });

function JenkinsTask(name, src, filepath, suiteName) {
    Gulp.task(name, function () {
        return Gulp.src(src, {read: false})
            .pipe(Mocha({
                reporter: 'xunit',
                reporterOptions: {output: filepath, suiteName: suiteName},

                timeout: ConfigMocha.timeout,
                globals: {
                    should: require('chai').should()
                }
            }));
    });
}

JenkinsTask('jenkins-zutils', ['zutils/test/**/*_test.js'], 'ztests/zutils.xml', 'ZUtils');
JenkinsTask('jenkins-zwebsite', ['zwebsite/test/**/*_test.js'], 'ztests/zwebsite.xml', 'ZWebsite');
JenkinsTask('jenkins-zplatform', ['zplatform/test/**/*_test.js'], 'ztests/zplatform.xml', 'ZPlatform');
JenkinsTask('jenkins-zhall', ['zhall/test/**/*_test.js'], 'ztests/zhall.xml', 'ZHall');
JenkinsTask('jenkins', ['z*/test/**/*_test.js'], 'ztests/mocha.xml', 'JenkinsEasyGame');

// Gulp.task('jenkins', function () {
//     return Gulp.src(['z*/test/**/*_test.js'], {read: false})
//         .pipe(Mocha({
//             reporter: 'xunit',
//             reporterOptions: {output: 'ztests/mocha.xml'},
//
//             timeout: ConfigMocha.timeout,
//             globals: {
//                 should: require('chai').should()
//             }
//         }));
// });

function GitHubTask(name, src, filepath) {
    Gulp.task(name, function () {
        return Gulp.src(src, {read: false})
            .pipe(Mocha({
                reporter: 'markdown',
                result: true,
                reporterOptions: {output: filepath},

                timeout: ConfigMocha.timeout,
                globals: {
                    should: require('chai').should()
                }
            }));
    });
}

GitHubTask('github-zutils', ['zutils/test/**/*_test.js'], 'ztests/zutils.md');
GitHubTask('github-zwebsite', ['zwebsite/test/**/*_test.js'], 'ztests/zwebsite.md');
GitHubTask('github-zplatform', ['zplatform/test/**/*_test.js'], 'ztests/zplatform.md');
GitHubTask('github-zhall', ['zhall/test/**/*_test.js'], 'ztests/zhall.md');
GitHubTask('github', ['z*/test/**/*_test.js'], 'ztests/mocha.md');

// Gulp.task('github', function () {
//     return Gulp.src(['z*/test/**/*_test.js'], {read: false})
//         .pipe(Mocha({
//             reporter: 'markdown',
//             result: true,
//             reporterOptions: {output: 'ztests/mocha.md'},
//
//             timeout: ConfigMocha.timeout,
//             globals: {
//                 should: require('chai').should()
//             }
//         }));
// });

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



