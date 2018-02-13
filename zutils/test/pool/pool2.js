/**
 * Created by EasyGame.
 * File: pool2.js
 * User: justin
 * Date: 13/2/2018
 * Time: 21:54
 */

'use strict';

let pool = require('./pool');

module.exports = {
    getInstance: () => {
        return pool.getInstance();
    },
    echo: function () {
        console.log(pool);
    }
};
