/**
 * Created by EasyGame.
 * File: Singleton_test.js
 * User: justin
 * Date: 11/2/2018
 * Time: 00:22
 */

'use strict';

const Should = require('chai').should();

const ConfigMocha = require('../../../config/mocha');

let Singleton = require('../../classes/Singleton').getInstance();

let gameinfo = require('./Singleton2_test').gameinfo;
let userinfo = {
    name: 'justin',
    age: 22,
    gender: 1,
    img: "http://"
};

Singleton.set('user', userinfo);

describe('Check Singleton', () => {

    beforeEach(function () {
        this.timeout(ConfigMocha.timeout);
    });

    it('should exist user inited here', function (done) {
        let user = Singleton.get('user');
        user.should.eql(userinfo);
        done();
    });

    it('should exist games inited by other file', function (done) {
        setTimeout(function () {
            let games = Singleton.get('games');
            games.should.eql(gameinfo);
            done();
        }, 1.5 * 1e3);
    });
});




