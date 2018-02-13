/**
 * Created by EasyGame.
 * File: async_test.js
 * User: justin
 * Date: 13/2/2018
 * Time: 17:00
 */

'use strict';

const Async = require('async');
const Should = require('chai').should();

describe('ZUtils Async', () => {

    describe("#waterfall", () => {
        it('should return error', function (done) {
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
                // data is a number|undefined
                Should.not.equal(err, null);
                Should.equal(data, undefined);
                done();
            });
        });

        it('should return success', function (done) {
            Async.waterfall([
                cb => {
                    cb(null, 3);
                    // cb(new Error('Init Failed'));
                },
                (num, cb) => {
                    cb(null, num * num);
                },
                (num, cb) => {
                    cb(null, num + num);
                }
            ], (err, data) => {
                // data is a number|undefined
                Should.equal(err, null);
                data.should.be.equal(18);
                done();
            });
        });

    });

    describe('#parallel', () => {
        it('should return error', function (done) {
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
                // data is an array
                Should.not.equal(err, null);
                data.should.be.eql([undefined]);
                done();
            });
        });
        it('should return success', function (done) {
            Async.parallel([
                cb => {
                    cb(null, 3);
                    // cb(new Error('Init Failed'));
                },
                cb => {
                    cb(null, 3 * 3);
                },
                cb => {
                    cb(null, 3 + 3);
                },
            ], (err, data) => {
                // data is an array
                Should.equal(err, null);
                data.should.be.eql([3, 9, 6]);
                done();
            });
        });
    });

    describe('#auto', () => {
        it('should return error', function (done) {
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
                // data is an object
                Should.not.equal(err, null);
                data.should.be.eql({'init': undefined});
                done();
            });
        });
        it('should return error', function (done) {
            Async.auto({
                'init': cb => {
                    cb(null, 3);
                    // cb(new Error('Init Failed'));
                },
                'multi': ['init', (results, cb) => {
                    cb(null, results.init * results.init)
                }],
                'plus': ['init', (results, cb) => {
                    cb(null, results.init + results.init)
                }]
            }, (err, data) => {
                // data is an object
                Should.equal(err, null);
                data.should.be.eql({'init': 3, 'multi': 9, 'plus': 6});
                done();
            });
        });
    });



});
