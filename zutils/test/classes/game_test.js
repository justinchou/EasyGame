/**
 * Created by EasyGame.
 * File: classes_test.js
 * User: justin
 * Date: 15/2/2018
 * Time: 08:50
 */

'use strict';

const Should = require('chai').should();

const Player = require('../classes/Player');
const Room = require('../classes/Room');


describe('ZGame QingwaWangzi', () => {

    let id = 13452;
    let info = {
        nickname: "Justin",
        birthday: new Date('1995-12-21 18:05:12'),
        gender: 1,
        headImg: "http://some.img.com",
        location: "Beijing Chaoyang",

        bestTime: 29.54,
        bestScore: 1654,
    };
    let config = {
        "name": "青蛙王子",
        // black 是荷叶, 0表示左边, 1表示右边; wupo 是巫婆, 表示该位置有巫婆, 卡顿有几率被冻住.
        "init": [{black: 0}, {black: 1}, {black: 0}, {black: 1}, {black: 1}, {black: 1}, {black: 0, wupo: true}, {black: 0}, {black: 0}, {black: 0}]
    };

    it('Player Instance', () => {
        let player = new Player(id, info);
        player.should.be.instanceof(Player);
        player.nickname.should.be.equal(info.nickname);
        player.age.should.be.equal(22); // 18-02-15
        player.horoscope.should.be.equal('射手座');
    });

    it('GameProgress ', () => {

    });

    it('Room Instance', () => {
        let room = new Room(config);
        room.startTime = Date.now();

        room.should.be.an.instanceof(Room);
    });

});