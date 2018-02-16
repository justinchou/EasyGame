/**
 * Created by EasyGame.
 * File: array.js
 * User: justin
 * Date: 16/2/2018
 * Time: 21:43
 */

'use strict';

Array.prototype.realForEach = function (next) {
    for (let i = this.length - 1; i >= 0; i--) {
        next(this[i], i, this);
    }
};

module.exports = Array;