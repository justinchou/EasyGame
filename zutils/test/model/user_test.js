/**
 * Created by EasyGame.
 * File: account_test.js.js
 * User: justin
 * Date: 3/2/2018
 * Time: 22:42
 */

'use strict';

let Should = require('chai').should();
let Path = require('path');

require('log4js').configure(Path.join(__dirname, '../../../config/log4js.json'));

let Logger = require('log4js').getLogger('mocha');
let ConfigPlatform = require('../../../config/platform');
let ConfigMocha = require('../../../config/mocha');

let UserModel = require('../../model/user.model');
let Crypto = require('../../utils/crypto');

describe('Model', () => {
    describe('#UserModel 检测User数据表处理函数', () => {

        before(done => {
            if (ConfigMocha.debug > 1) Logger.debug('Wait Database Connection For 3s');
            setTimeout(function () {
                if (ConfigMocha.debug > 1) Logger.debug('Maybe Database Connected');
                done();
            }, 1000);
        });

        beforeEach(function() {
            this.timeout(ConfigMocha.timeout);
        });

        after(done => {
            UserModel.destory();
            done();
        });

        let userid = Math.floor(Math.random() * 100000) + 1;
        let nickname = '二狗蛋';
        let gender = 1;
        let headimg = 'http://3w.moumoumou.com/header.jpg';

        let newnick = '虎妞';
        let newgender = 0;

        let amount = 10;

        it('Check User #Not Exist', done => {
            UserModel.existUser(userid, (err, exist) => {
                Should.equal(err, null);
                Should.equal(exist, false);
                done();
            });
        });

        it('Load User #Not Exist', done => {
            UserModel.userInfo(userid, (err, info) => {
                Should.not.equal(err, null);
                Should.equal(info, undefined);
                done();
            });
        });

        it('Load User Pub #Not Exist', done => {
            UserModel.userPubInfo(userid, (err, info) => {
                Should.not.equal(err, null);
                Should.equal(info, undefined);
                done();
            });
        });

        it('Load User Pri #Not Exist', done => {
            UserModel.userPriInfo(userid, (err, info) => {
                Should.not.equal(err, null);
                Should.equal(info, undefined);
                done();
            });
        });



        it('Create User', done => {
            UserModel.createUser(nickname, gender, headimg, (err, id) => {
                Should.equal(err, null);
                Should.equal(typeof id, 'number');
                userid = id;
                done();
            });
        });

        it('Check User #Exist', done => {
            UserModel.existUser(userid, (err, exist) => {
                Should.equal(err, null);
                Should.equal(exist, true);
                done();
            });
        });

        it('Load User #Exist', done => {
            UserModel.userInfo(userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.nickname, nickname);
                Should.equal(info.gender, gender);
                Should.equal(info.headimg, headimg);
                Should.equal(info.lv, ConfigPlatform.user.lv);
                Should.equal(info.exp, ConfigPlatform.user.exp);
                Should.equal(info.coins, ConfigPlatform.user.coins);
                Should.equal(info.gems, ConfigPlatform.user.gems);
                done();
            });
        });

        it('Load User Pub #Exist', done => {
            UserModel.userPubInfo(userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.nickname, nickname);
                Should.equal(info.gender, gender);
                Should.equal(info.headimg, headimg);
                done();
            });
        });

        it('Load User Pri #Exist', done => {
            UserModel.userPriInfo(userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.lv, ConfigPlatform.user.lv);
                Should.equal(info.exp, ConfigPlatform.user.exp);
                Should.equal(info.coins, ConfigPlatform.user.coins);
                Should.equal(info.gems, ConfigPlatform.user.gems);
                done();
            });
        });



        it('Update User', done => {
            UserModel.updateUser(userid, newnick, newgender, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, true);
                done();
            });
        });

        it('Load User Pub #Exist', done => {
            UserModel.userPubInfo(userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.nickname, newnick);
                Should.equal(info.gender, newgender);
                Should.equal(info.headimg, headimg);
                done();
            });
        });



        it('Gems #Add Gems', done => {
            UserModel.addGems(userid, amount, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, true);
                done();
            });
        });
        it('Load User Pri #Exist', done => {
            UserModel.userPriInfo(userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.lv, ConfigPlatform.user.lv);
                Should.equal(info.exp, ConfigPlatform.user.exp);
                Should.equal(info.coins, ConfigPlatform.user.coins);
                Should.equal(info.gems, ConfigPlatform.user.gems + amount);
                done();
            });
        });

        it('Gems #Cost Gems', done => {
            UserModel.costGems(userid, amount, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, true);
                done();
            });
        });
        it('Load User Pri #Exist', done => {
            UserModel.userPriInfo(userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.lv, ConfigPlatform.user.lv);
                Should.equal(info.exp, ConfigPlatform.user.exp);
                Should.equal(info.coins, ConfigPlatform.user.coins);
                Should.equal(info.gems, ConfigPlatform.user.gems);
                done();
            });
        });

        it('Gems #Add Coins', done => {
            UserModel.addCoins(userid, amount, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, true);
                done();
            });
        });
        it('Load User Pri #Exist', done => {
            UserModel.userPriInfo(userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.lv, ConfigPlatform.user.lv);
                Should.equal(info.exp, ConfigPlatform.user.exp);
                Should.equal(info.coins, ConfigPlatform.user.coins + amount);
                Should.equal(info.gems, ConfigPlatform.user.gems);
                done();
            });
        });

        it('Gems #Cost Coins', done => {
            UserModel.costCoins(userid, amount, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, true);
                done();
            });
        });
        it('Load User Pri #Exist', done => {
            UserModel.userPriInfo(userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.lv, ConfigPlatform.user.lv);
                Should.equal(info.exp, ConfigPlatform.user.exp);
                Should.equal(info.coins, ConfigPlatform.user.coins);
                Should.equal(info.gems, ConfigPlatform.user.gems);
                done();
            });
        });

        it('Gems #Add Lv', done => {
            UserModel.addLv(userid, amount, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, true);
                done();
            });
        });
        it('Load User Pri #Exist', done => {
            UserModel.userPriInfo(userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.lv, ConfigPlatform.user.lv + amount);
                Should.equal(info.exp, ConfigPlatform.user.exp);
                Should.equal(info.coins, ConfigPlatform.user.coins);
                Should.equal(info.gems, ConfigPlatform.user.gems);
                done();
            });
        });

        it('Gems #Add Exp', done => {
            UserModel.addExp(userid, amount, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, true);
                done();
            });
        });
        it('Load User Pri #Exist', done => {
            UserModel.userPriInfo(userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.lv, ConfigPlatform.user.lv + amount);
                Should.equal(info.exp, ConfigPlatform.user.exp + amount);
                Should.equal(info.coins, ConfigPlatform.user.coins);
                Should.equal(info.gems, ConfigPlatform.user.gems);
                done();
            });
        });
    });
});
