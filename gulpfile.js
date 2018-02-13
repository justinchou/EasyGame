/**
 * Created by EasyGame.
 * File: gulpfile.js
 * User: justin
 * Date: 13/2/2018
 * Time: 18:14
 */

'use strict';

const Gulp = require('gulp');
const Mocha = require('gulp-mocha');
const ConfigMocha = require('./config/mocha');

Gulp.task('default', function () {
    return Gulp.src(['z*/test/**/*_test.js'], {read: false})
        .pipe(Mocha({
            reporter: 'spec',

            timeout: ConfigMocha.timeout,
            globals: {
                should: require('chai').should()
            }
        }));
});
