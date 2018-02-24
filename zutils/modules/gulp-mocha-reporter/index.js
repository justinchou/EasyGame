/**
 * Created by EasyGame.
 * File: index.js
 * User: justin
 * Date: 24/2/2018
 * Time: 09:32
 */

'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const dargs = require('dargs');
const execa = require('execa');
const PluginError = require('plugin-error');
const through = require('through2');
// TODO: Use execa localDir option when available
const npmRunPath = require('npm-run-path');
const utils = require('./utils');

const HUNDRED_MEGABYTES = 1000 * 1000 * 100;

// Mocha options that can be specified multiple times
const MULTIPLE_OPTS = new Set([
    'require'
]);

module.exports = opts => {

    let reporter = opts.reporter;
    let reporterOptions = opts.reporterOptions;

    opts = Object.assign({
        colors: true,
        suppress: false
    }, opts);

    for (const key of Object.keys(opts)) {
        const val = opts[key];

        if (Array.isArray(val)) {
            if (!MULTIPLE_OPTS.has(key)) {
                // Convert arrays into comma separated lists
                opts[key] = val.join(',');
            }
        } else if (typeof val === 'object') {
            // Convert an object into comma separated list
            opts[key] = utils.convertObjectToList(val);
        }
    }

    const args = dargs(opts, {
        excludes: ['suppress'],
        ignoreFalse: true
    });

    const files = [];

    function aggregate(file, encoding, done) {
        if (file.isStream()) {
            done(new PluginError('gulp-mocha', 'Streaming not supported'));
            return;
        }

        files.push(file.path);

        done();
    }

    function flush(done) {
        const env = npmRunPath.env({cwd: __dirname});
        const proc = execa('mocha', files.concat(args), {
            env,
            maxBuffer: HUNDRED_MEGABYTES
        });

        this.on('_result', function (result) {
            if (opts.result && reporter && reporter !== 'xunit' && reporterOptions && reporterOptions.output) {
                if (!fs.createWriteStream) {
                    throw new Error('file output not supported in browser');
                }
                mkdirp.sync(path.dirname(reporterOptions.output));
                fs.writeFileSync(reporterOptions.output, result.stdout);
            }
        });

        proc.then(result => {
            this.emit('_result', result);
            // console.warn('account is [ %s ]', require('events').EventEmitter.listenerCount(this, '_result'));
            done();
        })
            .catch(err => {
                this.emit('error', new PluginError('gulp-mocha', err));
                done();
            });

        if (!opts.suppress) {
            proc.stdout.pipe(process.stdout);
            proc.stderr.pipe(process.stderr);
        }
    }

    return through.obj(aggregate, flush);
};
