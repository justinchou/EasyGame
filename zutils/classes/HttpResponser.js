/**
 * Created by EasyGame.
 * File: HttpResponser.js
 * User: justin
 * Date: 3/2/2018
 * Time: 10:57
 */

'use strict';

// const Util = require('util');
const Logger = require('log4js').getLogger('utils');

function HttpResponser() {
    this.code = 0;
    this.message = {};
    this.attachment = [];
    this.stack = {};
}

module.exports = HttpResponser;

HttpResponser.prototype.fill = function (code, msg, attach, stack) {
    if (arguments.length === 1) {
        let data = code;
        this.code = data.code;
        this.message = data.message;

    } else {
        this.code = code;
        this.message = msg;

    }

    // todo handle attach and stack

    return this;
};

HttpResponser.prototype.encode = function () {
    return JSON.stringify(this);
};

HttpResponser.prototype.decode = function (msg) {
    let data;
    try {
        data = JSON.parse(msg);
    } catch (e) {
        Logger.error('Http Responser decode failed, %s', msg);
    }

    this.code = data.code;
    this.message = data.message;
    this.attachment = data.attachment;
    this.stack = data.stack;

    return this;
};
