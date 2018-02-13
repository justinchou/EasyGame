/**
 * Created by EasyGame.
 * File: pool.js
 * User: justin
 * Date: 13/2/2018
 * Time: 21:56
 */

'use strict';

const Crypto = require('../../utils/crypto');

let pool = null;

((function () {
    if (!pool) {
        pool = {
            name: 'Justin',
            age: 12,
            create: Date.now(),
            uuid: Crypto.calcUUID()
        }
    }
})());

module.exports = {
    getInstance: () => {
        return pool;
    },
    echo: function () {
        console.log(pool);
    },
    set: function (k, v) {
        pool[k] = v;
    }
};