/**
 * Created by EasyGame.
 * File: HttpResponser.js
 * User: justin
 * Date: 9/2/2018
 * Time: 10:13
 */

'use strict';

const Should = require('chai').should();
const Path = require('path');

require('log4js').configure(Path.join(__dirname, '../../../config/log4js.json'));
const Logger = require('log4js').getLogger('mocha');
const ConfigMocha = require('../../../config/mocha');

const HttpResponser = require('../../classes/HttpResponser');

describe('ZUtils HttpResponser', () => {
    let decode = {code: 0, message: {message: "success"}, "attachment": [], "stack": {}};
    let encode = JSON.stringify(decode);

    it('should be a HttpResponser Duck Object', () => {
        let res = new HttpResponser().fill(decode.code, decode.message);

        res = JSON.parse(JSON.stringify(res));
        Should.equal(res.code, decode.code);
        Should.equal(res.message.message, decode.message.message);
    });

    it('should encode', () => {
        let res = new HttpResponser().fill(decode.code, decode.message);
        Should.equal(res.encode(), encode);

        res = JSON.parse(res.encode());
        Should.equal(res.code, 0);
        Should.equal(res.message.message, decode.message.message);
    });

    it('should decode', () => {
        let res = new HttpResponser().fill(decode.code, decode.message);
        res = JSON.parse(res.encode());
        Should.equal(res.code, 0);
        Should.equal(res.message.message, decode.message.message);
    });
});