/**
 * Created by EasyGame.
 * File: room_test.js
 * User: justin
 * Date: 14/2/2018
 * Time: 10:49
 */

'use strict';

const Should = require('chai').should();
const Path = require('path');
const _ = require('lodash');

require('log4js').configure(Path.join(__dirname, '../../../config/log4js.json'));

const Logger = require('log4js').getLogger('mocha');
const ConfigPlatform = require('../../../config/platform');
const ConfigMocha = require('../../../config/mocha');

const Crypto = require('../../utils/crypto');

let RoomModel = require('../../model/room.model');

describe('ZUtils Model Room', () => {
    before(done => {
        if (ConfigMocha.debug > 1) Logger.debug('Wait Database Connection For 3s');
        setTimeout(function () {
            if (ConfigMocha.debug > 1) Logger.debug('Maybe Database Connected');
            done();
        }, 1000);
    });

    beforeEach(function () {
        this.timeout(ConfigMocha.timeout);
    });

    after(done => {
        RoomModel.destory();
        done();
    });

    let roomId = "1239531";
    let turns = 3;
    let nexts = 82745;
    let userInfo = {
        "userId": 82745,
        "nickname": "BulaBula",
        "gender": 1,
        "gems": 214,
        "coins": 309500,
        "lv": 12,
        "exp": 134
    };
    let roomInfo = {
        "game": "tanchishe",
        "max_users": 10,
        "min_users": 2,
    };
    let gameInfo = {
        "host": "104.13.129.18",
        "port": 10492
    };
    let playerInfo = {
        "userId": 394572,
        "nickname": "Duduzui",
        "gender": 0,
        "gems": 173,
        "coins": 948274,
        "lv": 32,
        "exp": 784
    };

    describe('#Not Exist Room', () => {


        it('Check Room', done => {
            RoomModel.existRoom(roomId, (err, exist) => {
                Should.equal(err, null);
                exist.should.be.false;
                done();
            })
        });

        it('Load Room Raw Info', done => {
            RoomModel.roomRawInfo(roomId, (err, info) => {
                err.should.be.eql(err, new Error('No Room ' + roomId));
                Should.equal(info, undefined);
                done();
            });
        });

        it('Load Room Info', done => {
            RoomModel.roomInfo(roomId, (err, info) => {
                err.should.be.eql(err, new Error('No Room ' + roomId));
                Should.equal(info, undefined);
                done();
            });
        });

        it('Update Turns', done => {
            RoomModel.updateTurns(roomId, turns, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, false);
                done();
            });
        });

        it('Update Nexts', done => {
            RoomModel.updateNexts(roomId, nexts, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, false);
                done();
            });
        });

        it('Enter Room', done => {
            RoomModel.enterRoom(roomId, userInfo.userId, userInfo, (err, result) => {
                err.message.should.be.eql('Transaction Error ');
                Should.equal(result, undefined);
                done();
            });
        });

        it('Leave Room', done => {
            RoomModel.leaveRoom(roomId, userInfo.userId, userInfo, (err, result) => {
                err.message.should.be.eql('Transaction Error ');
                Should.equal(result, undefined);
                done();
            });
        });

        it('Delete Room', done => {
            RoomModel.deleteRoom(roomId, (err, result) => {
                err.message.should.be.eql('Transaction Error ');
                Should.equal(result, undefined);
                done();
            });
        });


    });

    describe('Create Room', () => {


        it('Create Room', done => {
            RoomModel.createRoom(userInfo.userId, userInfo, roomInfo, gameInfo, (err, result) => {
                Should.equal(err, null);
                result.should.be.an('object').and.not.equal(undefined);
                result.uuid.should.be.a('string').and.lengthOf(32);
                result.roomId.should.be.a('string').and.lengthOf.within(6, 12);

                roomId = result.roomId;

                done();
            });
        });

    });

    describe('#Exist Room', () => {


        it('Check Room', done => {
            RoomModel.existRoom(roomId, (err, exist) => {
                Should.equal(err, null);
                exist.should.be.true;
                done();
            })
        });

        it('Load Room Raw Info', done => {
            RoomModel.roomRawInfo(roomId, (err, info) => {
                Should.equal(err, null);
                info.roomId.should.be.equal(roomId);
                done();
            });
        });

        it('Load Room Info', done => {
            RoomModel.roomInfo(roomId, (err, info) => {
                Should.equal(err, null);
                info.roomId.should.be.equal(roomId);
                done();
            });
        });

        it('Update Turns', done => {
            RoomModel.updateTurns(roomId, turns, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, true);
                done();
            });
        });

        it('Update Nexts', done => {
            RoomModel.updateNexts(roomId, nexts, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, true);
                done();
            });
        });

        it('Enter Room', done => {
            RoomModel.enterRoom(roomId, userInfo.userId, userInfo, (err) => {
                Should.equal(err, null);
                done();
            });
        });

        it('Leave Room', done => {
            RoomModel.leaveRoom(roomId, userInfo.userId, userInfo, (err) => {
                Should.equal(err, null);
                done();
            });
        });

        it('Delete Room', done => {
            RoomModel.deleteRoom(roomId, (err) => {
                Should.equal(err, null);
                done();
            });
        });


    });
});