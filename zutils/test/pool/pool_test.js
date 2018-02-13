/**
 * Created by EasyGame.
 * File: pool_test.js
 * User: justin
 * Date: 13/2/2018
 * Time: 21:54
 */

'use strict';

const Should = require('chai').should();

let pool = require('./pool');
let pool1 = require('./pool1');
let pool2 = require('./pool2');

describe('ZUtils pool', () => {
    let ins = pool.getInstance();
    let ins1 = pool1.getInstance();
    let ins2 = pool2.getInstance();

    it('different includes equal', () => {
        ins.should.equal(ins1);
        ins.should.equal(ins2);
    });

    it('different handle equal', function () {
        pool.set('times', 3);

        ins1.should.includes({'times': 3});
        ins2.should.includes({'times': 3});
    });
});