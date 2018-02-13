/**
 * Created by EasyGame.
 * File: Singleton_test.js
 * User: justin
 * Date: 11/2/2018
 * Time: 00:22
 */

'use strict';

const Should = require('chai').should();
const Path = require('path');

require('log4js').configure(Path.join(__dirname, '../../../config/log4js.json'));
const Logger = require('log4js').getLogger('mocha');
const ConfigMocha = require('../../../config/mocha');

let Singleton = require('../../classes/Singleton').getInstance();
let userInfo = require('./Singleton1').userInfo;
let gameInfo = require('./Singleton2').gameInfo;

describe('ZUtils Singleton', () => {

    beforeEach(function () {
        this.timeout(ConfigMocha.timeout);
    });

    it('should exist user inited here', function (done) {
        let user = Singleton.get('user');
        user.should.eql(userInfo);
        done();
    });

    it('should exist games inited by other file', function (done) {
        setTimeout(function () {
            let games = Singleton.get('games');
            games.should.eql(gameInfo);
            done();
        }, 1.5 * 1e3);
    });
});




