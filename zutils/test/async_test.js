/**
 * Created by EasyGame.
 * File: async_test.js
 * User: justin
 * Date: 13/2/2018
 * Time: 17:00
 */

'use strict';

const Async = require('async');

Async.waterfall([
    cb => {
        // cb(null, 3);
        cb(new Error('Init Failed'));
    },
    (num, cb) => {
        cb(null, num * num);
    },
    (num, cb) => {
        cb(null, num + num);
    }
], (err, data) => {
    console.log(err, data);
    // data is a number|undefined
});

Async.parallel([
    cb => {
        // cb(null, 3);
        cb(new Error('Init Failed'));
    },
    cb => {
        cb(null, 3 * 3);
    },
    cb => {
        cb(null, 3 + 3);
    },
], (err, data) => {
    console.log(err, data);
    // data is an array
});

Async.auto({
    'init': cb => {
        // cb(null, 3);
        cb(new Error('Init Failed'));
    },
    'multi': ['init', (results, cb) => {
        cb(null, results.init * results.init)
    }],
    'plus': ['init', (results, cb) => {
        cb(null, results.init + results.init)
    }]
}, (err, data) => {
    console.log(err, data);
    // data is an object
});