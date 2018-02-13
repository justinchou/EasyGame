/**
 * Created by EasyGame.
 * File: app_test.js
 * User: justin
 * Date: 3/2/2018
 * Time: 13:20
 */

'use strict';

const Should = require('chai').should();
const Request = require('supertest');
const Path = require('path');
const Util = require('util');
const QS = require('querystring');

const Crypto = require('../../zutils/utils/crypto');

let App = require('../app');

require('log4js').configure(Path.join(__dirname, '../../config/log4js.json'));
const Logger = require('log4js').getLogger('mocha');

const ConfigPlatform = require('../../config/platform');
const ConfigUtils = require('../../config/utils');
const ConfigMocha = require('../../config/mocha');
const ErrorCode = require('../config/errorCode');

describe('ZPlatform App', () => {

    let userId = '23432545';
    let password = 'lvgetech';
    let nickname = '老王家的二狗蛋';
    let gender = 1;
    let headimg = 'http://laowangjia.com/ergoudan.jpg';

    let guestAccount = '' + (Math.floor(Math.random() * 10000000) + 1);
    let guestUserId = '';

    let emailAccount = '' + (Math.floor(Math.random() * 10000000) + 1) + '@lvge.tech';
    let emailUserId = '';

    let amount = 10;

    describe('#App Run 检测APP基础功能', () => {
        let app;

        before(done => {
            app = Request(App);
            done();
        });

        it('Lbs Check Alive 负载均衡检活接口', done => {
            let api = '/lbs';
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                if (ConfigMocha.debug > 1) {
                    Logger.info('%s: res.text [ %s ], res.body [ %j ]', api, res.text, res.body);
                    Logger.info('%s: res.header [ %j ], res.headers [ %j ]', api, res.header, res.headers);
                    Logger.info('%s: res.status [ %s ], res.statusCode [ %s ]', api, res.status, res.statusCode);
                }
                done();
            });
        });
    });

    describe('#Account 账号服务器功能', () => {
        let app;

        before(done => {
            app = Request(App);
            done();
        });

        beforeEach(function () {
            this.timeout(ConfigMocha.timeout);
        });

        after(done => {
            let AccountModel = require('../../zutils/model/account.model');
            let UserModel = require('../../zutils/model/user.model');
            AccountModel.destory();
            UserModel.destory();
            done();
        });

        it('获取客户端版本信息', done => {
            let api = '/resources/clientInfo';
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);

                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.not.equal(msg.clientInfo, undefined);
                Should.equal(msg.clientInfo.versionMin, ConfigUtils.version.clientMin);
                Should.equal(msg.clientInfo.versionNew, ConfigUtils.version.clientNew);
                Should.equal(msg.clientInfo.appWeb, ConfigUtils.version.clientWeb);
                Should.exist(msg.clientInfo.hallServer);
                done();
            });
        });

        it('获取用户公开信息 #无checksum', done => {
            let api = '/resources/userPublicInfo?' + QS.stringify({userId: userId});
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.APICheckSumFailed);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                done();
            });
        });

        it('获取用户私密信息 #无checksum', done => {
            let api = '/resources/userPrivateInfo?' + QS.stringify({userId: userId});
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.APICheckSumFailed);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                done();
            });
        });

        it('获取用户公开信息 #无对应用户', done => {
            let api = '/resources/userPublicInfo?' + QS.stringify({
                userId: userId,
                checksum: Crypto.calcSum(userId)
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.DatabaseNoRecord);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                done();
            });
        });

        it('获取用户私密信息 #无对应用户', done => {
            let api = '/resources/userPrivateInfo?' + QS.stringify({
                userId: userId,
                checksum: Crypto.calcSum(userId)
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.DatabaseNoRecord);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                done();
            });
        });



        it('注册用户 #无checksum', done => {
            let api = '/account/register?' + QS.stringify({
                account: guestAccount,
                type: 'guest',
                password: '',
                checksum: ''
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.APICheckSumFailed);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                done();
            });
        });

        it('注册用户 #Guest', done => {
            let api = '/account/register?' + QS.stringify({
                account: guestAccount,
                type: 'guest',
                password: '',
                name: nickname,
                sex: gender,
                headimgurl: headimg,
                checksum: Crypto.calcSum(guestAccount, 'guest', '')
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.exist(msg.userId);
                guestUserId = msg.userId;
                done();
            });
        });

        it('注册用户 #Email', done => {
            let api = '/account/register?' + QS.stringify({
                account: emailAccount,
                type: 'email',
                password: password,
                name: nickname,
                sex: gender,
                headimgurl: headimg,
                checksum: Crypto.calcSum(emailAccount, 'email', password)
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.exist(msg.userId);
                emailUserId = msg.userId;
                done();
            });
        });

        it('获取用户公开信息 #有对应用户', done => {
            let api = '/resources/userPublicInfo?' + QS.stringify({
                userId: emailUserId,
                checksum: Crypto.calcSum(emailUserId)
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userId, "" + emailUserId);
                Should.equal(msg.userInfo.name, nickname);
                Should.equal(msg.userInfo.sex, gender);
                Should.equal(msg.userInfo.headimgurl, headimg);
                done();
            });
        });

        it('获取用户私密信息 #有对应用户', done => {
            let api = '/resources/userPrivateInfo?' + QS.stringify({
                userId: guestUserId,
                checksum: Crypto.calcSum(guestUserId)
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userId, "" + guestUserId);
                Should.equal(msg.userInfo.lv, ConfigPlatform.userInitInfo.lv);
                Should.equal(msg.userInfo.exp, ConfigPlatform.userInitInfo.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.userInitInfo.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.userInitInfo.gems);
                done();
            });
        });



        it('授权Guest用户', done => {
            let api = '/account/guestAuth?' + QS.stringify({
                account: guestAccount
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.auth.account, guestAccount);
                Should.equal(msg.auth.userId, guestUserId);
                Should.exist(msg.auth.hallServer);
                Should.exist(msg.auth.sign);

                done();
            });
        });

        it('授权Email用户', done => {
            let api = '/account/emailAuth?' + QS.stringify({
                account: emailAccount,
                password: password
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.auth.account, emailAccount);
                Should.equal(msg.auth.userId, emailUserId);
                Should.exist(msg.auth.hallServer);
                Should.exist(msg.auth.sign);

                done();
            });
        });

        it('授权WeChat用户', done => {
            let api = '/account/wechatAuth?' + QS.stringify({
                code: "123456",
                os: "IOS"
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.auth.account, emailAccount);
                Should.equal(msg.auth.userId, "" + emailUserId);
                Should.exist(msg.auth.hallServer);
                Should.exist(msg.auth.sign);

                done();
            });
        });



        it('增加用户的资源 #Coins', done => {
            let api = '/resources/addUserRes';
            let type = 'coins';
            app.post(api).send({
                userId: emailUserId,
                type: type,
                amount: amount,
                checksum: Crypto.calcSum(emailUserId, type, amount)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userId, emailUserId);
                Should.equal(msg.userInfo.lv, ConfigPlatform.userInitInfo.lv);
                Should.equal(msg.userInfo.exp, ConfigPlatform.userInitInfo.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.userInitInfo.coins + 10);
                Should.equal(msg.userInfo.gems, ConfigPlatform.userInitInfo.gems);

                Should.equal(msg.addInfo.coins, amount);
                done();
            });
        });

        it('减少用户的资源 #Coins', done => {
            let api = '/resources/costUserRes';
            let type = 'coins';
            app.post(api).send({
                userId: emailUserId,
                type: type,
                amount: amount,
                checksum: Crypto.calcSum(emailUserId, type, amount)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userId, emailUserId);
                Should.equal(msg.userInfo.lv, ConfigPlatform.userInitInfo.lv);
                Should.equal(msg.userInfo.exp, ConfigPlatform.userInitInfo.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.userInitInfo.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.userInitInfo.gems);

                Should.equal(msg.costInfo.coins, amount);
                done();
            });
        });


        it('增加用户的资源 #Gems', done => {
            let api = '/resources/addUserRes';
            let type = 'gems';
            app.post(api).send({
                userId: emailUserId,
                type: type,
                amount: amount,
                checksum: Crypto.calcSum(emailUserId, type, amount)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userId, emailUserId);
                Should.equal(msg.userInfo.lv, ConfigPlatform.userInitInfo.lv);
                Should.equal(msg.userInfo.exp, ConfigPlatform.userInitInfo.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.userInitInfo.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.userInitInfo.gems + 10);

                Should.equal(msg.addInfo.gems, amount);
                done();
            });
        });

        it('减少用户的资源 #Gems', done => {
            let api = '/resources/costUserRes';
            let type = 'gems';
            app.post(api).send({
                userId: emailUserId,
                type: type,
                amount: amount,
                checksum: Crypto.calcSum(emailUserId, type, amount)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userId, emailUserId);
                Should.equal(msg.userInfo.lv, ConfigPlatform.userInitInfo.lv);
                Should.equal(msg.userInfo.exp, ConfigPlatform.userInitInfo.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.userInitInfo.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.userInitInfo.gems);

                Should.equal(msg.costInfo.gems, amount);
                done();
            });
        });


        it('增加用户的资源 #Lv', done => {
            let api = '/resources/addUserRes';
            let type = 'lv';
            app.post(api).send({
                userId: guestUserId,
                type: type,
                amount: amount,
                checksum: Crypto.calcSum(guestUserId, type, amount)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userId, guestUserId);
                Should.equal(msg.userInfo.lv, ConfigPlatform.userInitInfo.lv + 10);
                Should.equal(msg.userInfo.exp, ConfigPlatform.userInitInfo.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.userInitInfo.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.userInitInfo.gems);

                Should.equal(msg.addInfo.lv, amount);
                done();
            });
        });

        it('增加用户的资源 #Exp', done => {
            let api = '/resources/addUserRes';
            let type = 'exp';
            app.post(api).send({
                userId: guestUserId,
                type: type,
                amount: amount,
                checksum: Crypto.calcSum(guestUserId, type, amount)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userId, guestUserId);
                Should.equal(msg.userInfo.lv, ConfigPlatform.userInitInfo.lv + 10);
                Should.equal(msg.userInfo.exp, ConfigPlatform.userInitInfo.exp + 10);
                Should.equal(msg.userInfo.coins, ConfigPlatform.userInitInfo.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.userInitInfo.gems);

                Should.equal(msg.addInfo.exp, amount);
                done();
            });
        });


        it('增加用户的资源 #错误的checksum', done => {
            let api = '/resources/addUserRes';
            let type = 'exp';
            app.post(api).send({
                userId: emailUserId,
                type: type,
                amount: amount,
                checksum: Crypto.calcSum(emailUserId, type, amount, 123)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.APICheckSumFailed);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.not.equal(msg.message, undefined);
                done();
            });
        });

        it('减少用户的资源 #错误的checksum', done => {
            let api = '/resources/costUserRes';
            let type = 'exp';
            app.post(api).send({
                userId: emailUserId,
                type: type,
                amount: amount,
                checksum: Crypto.calcSum(emailUserId, type, amount, 123)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.APICheckSumFailed);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.not.equal(msg.message, undefined);
                done();
            });
        });

        it('增加用户的资源 #其他非支持类型', done => {
            let api = '/resources/addUserRes';
            let type = 'lalala';
            app.post(api).send({
                userId: guestUserId,
                type: type,
                amount: amount,
                checksum: Crypto.calcSum(guestUserId, type, amount)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.InvalidParams);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.not.equal(msg.message, undefined);
                done();
            });
        });

        it('减少用户的资源 #其他非支持类型', done => {
            let api = '/resources/costUserRes';
            let type = 'lv';
            app.post(api).send({
                userId: guestUserId,
                type: type,
                amount: amount,
                checksum: Crypto.calcSum(guestUserId, type, amount)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.InvalidParams);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.not.equal(msg.message, undefined);
                done();
            });
        });

        it('增加用户的资源 #增加资源数为负数', done => {
            let api = '/resources/addUserRes';
            let type = 'lalala';
            app.post(api).send({
                userId: guestUserId,
                type: type,
                amount: -amount,
                checksum: Crypto.calcSum(guestUserId, type, -amount)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.InvalidParams);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.not.equal(msg.message, undefined);
                done();
            });
        });

        it('减少用户的资源 #减少资源数为负数', done => {
            let api = '/resources/costUserRes';
            let type = 'gems';
            app.post(api).send({
                userId: guestUserId,
                type: type,
                amount: -amount,
                checksum: Crypto.calcSum(guestUserId, type, -amount)
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.InvalidParams);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.not.equal(msg.message, undefined);
                done();
            });
        });



    });
});
