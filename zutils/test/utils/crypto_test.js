/**
 * Created by EasyGame.
 * File: crypto_test.js
 * User: justin
 * Date: 12/2/2018
 * Time: 07:56
 */

'use strict';

const Should = require('chai').should();
const Crypto = require('../../utils/crypto');

const Path = require('path');

require('log4js').configure(Path.join(__dirname, '../../../config/log4js.json'));
const Logger = require('log4js').getLogger('mocha');

describe('ZUtils Crypto', () => {
    it('should calc sum', function () {

    });

    it('should calc server', function () {

    });

    it('should calc sign', function () {

    });

    it('should calc server addr', function () {
        let host = "127.0.0.2", port = 2386;
        let addr = Crypto.calcServerAddr(host, port);

        addr.should.be.include(":");
        addr.should.be.include(host);
        addr.should.be.include(port);
        addr.should.be.lengthOf(host.length + 1 + ("" + port).length);
    });

    it('should calc uuid', function () {
        let uuid = Crypto.calcUUID();

        uuid.should.not.include('-');
        uuid.should.be.lengthOf(32);
    });
});