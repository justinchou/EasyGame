/**
 * Created by EasyGame.
 * File: app_test.js
 * User: justin
 * Date: 3/2/2018
 * Time: 13:20
 */

'use strict';

let Should = require('chai').should();
let Request = require('supertest');
let Path = require('path');
let Util = require('util');
let QS = require('querystring');

let App = require('../app');
let Crypto = require('../../zutils/utils/crypto');

require('log4js').configure(Path.join(__dirname, '../../config/log4js.json'));
let Logger = require('log4js').getLogger('mocha');

let ConfigPlatform = require('../../config/platform');
let ConfigUtils = require('../../config/utils');
let ConfigMocha = require('../../config/mocha');
let ErrorCode = require('../config/error_code');

describe('App', () => {

    let userid = '23432545';
    let password = 'lvgetech';
    let nickname = '老王家的二狗蛋';
    let gender = 1;
    let headimg = 'http://laowangjia.com/ergoudan.jpg';

    let guest_account = '' + (Math.floor(Math.random() * 10000000) + 1);
    let guest_userid = '';

    let email_account = '' + (Math.floor(Math.random() * 10000000) + 1) + '@lvge.tech';
    let email_userid = '';

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
            let api = '/resources/client_info';
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);

                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.not.equal(msg.client_info, undefined);
                Should.equal(msg.client_info.version_min, ConfigUtils.version.client_min);
                Should.equal(msg.client_info.version_new, ConfigUtils.version.client_new);
                Should.equal(msg.client_info.app_web, ConfigUtils.version.client_web);
                Should.exist(msg.client_info.hall_server);
                done();
            });
        });

        it('获取用户公开信息 #无checksum', done => {
            let api = '/resources/user_public_info?' + QS.stringify({userid: userid});
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
            let api = '/resources/user_private_info?' + QS.stringify({userid: userid});
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
            let api = '/resources/user_public_info?' + QS.stringify({
                userid: userid,
                checksum: Crypto.md5(userid + '_' + ConfigUtils.keys.checksum_key)
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
            let api = '/resources/user_private_info?' + QS.stringify({
                userid: userid,
                checksum: Crypto.md5(userid + '_' + ConfigUtils.keys.checksum_key)
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
                account: guest_account,
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
                account: guest_account,
                type: 'guest',
                password: '',
                name: nickname,
                sex: gender,
                headimgurl: headimg,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', guest_account, 'guest', '', ConfigUtils.keys.checksum_key))
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.exist(msg.userid);
                guest_userid = msg.userid;
                done();
            });
        });

        it('注册用户 #Email', done => {
            let api = '/account/register?' + QS.stringify({
                account: email_account,
                type: 'email',
                password: password,
                name: nickname,
                sex: gender,
                headimgurl: headimg,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', email_account, 'email', password, ConfigUtils.keys.checksum_key))
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.exist(msg.userid);
                email_userid = msg.userid;
                done();
            });
        });

        it('获取用户公开信息 #有对应用户', done => {
            let api = '/resources/user_public_info?' + QS.stringify({
                userid: email_userid,
                checksum: Crypto.md5(email_userid + '_' + ConfigUtils.keys.checksum_key)
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userid, "" + email_userid);
                Should.equal(msg.userInfo.name, nickname);
                Should.equal(msg.userInfo.sex, gender);
                Should.equal(msg.userInfo.headimgurl, headimg);
                done();
            });
        });

        it('获取用户私密信息 #有对应用户', done => {
            let api = '/resources/user_private_info?' + QS.stringify({
                userid: guest_userid,
                checksum: Crypto.md5(guest_userid + '_' + ConfigUtils.keys.checksum_key)
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userid, "" + guest_userid);
                Should.equal(msg.userInfo.lv, ConfigPlatform.user.lv);
                Should.equal(msg.userInfo.exp, ConfigPlatform.user.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.user.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.user.gems);
                done();
            });
        });



        it('授权Guest用户', done => {
            let api = '/account/guest_auth?' + QS.stringify({
                account: guest_account
            });
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.auth.account, guest_account);
                Should.equal(msg.auth.userid, guest_userid);
                Should.exist(msg.auth.hall_server);
                Should.exist(msg.auth.sign);

                done();
            });
        });

        it('授权Email用户', done => {
            let api = '/account/email_auth?' + QS.stringify({
                account: email_account,
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
                Should.equal(msg.auth.account, email_account);
                Should.equal(msg.auth.userid, email_userid);
                Should.exist(msg.auth.hall_server);
                Should.exist(msg.auth.sign);

                done();
            });
        });

        it('授权WeChat用户', done => {
            let api = '/account/wechat_auth?' + QS.stringify({
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
                Should.equal(msg.auth.account, email_account);
                Should.equal(msg.auth.userid, "" + email_userid);
                Should.exist(msg.auth.hall_server);
                Should.exist(msg.auth.sign);

                done();
            });
        });



        it('增加用户的资源 #Coins', done => {
            let api = '/resources/add_user_res';
            let type = 'coins';
            app.post(api).send({
                userid: email_userid,
                type: type,
                amount: amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', email_userid, type, amount, ConfigUtils.keys.checksum_key))
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userid, email_userid);
                Should.equal(msg.userInfo.lv, ConfigPlatform.user.lv);
                Should.equal(msg.userInfo.exp, ConfigPlatform.user.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.user.coins + 10);
                Should.equal(msg.userInfo.gems, ConfigPlatform.user.gems);

                Should.equal(msg.addInfo.coins, amount);
                done();
            });
        });

        it('减少用户的资源 #Coins', done => {
            let api = '/resources/cost_user_res';
            let type = 'coins';
            app.post(api).send({
                userid: email_userid,
                type: type,
                amount: amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', email_userid, type, amount, ConfigUtils.keys.checksum_key))
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userid, email_userid);
                Should.equal(msg.userInfo.lv, ConfigPlatform.user.lv);
                Should.equal(msg.userInfo.exp, ConfigPlatform.user.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.user.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.user.gems);

                Should.equal(msg.costInfo.coins, amount);
                done();
            });
        });


        it('增加用户的资源 #Gems', done => {
            let api = '/resources/add_user_res';
            let type = 'gems';
            app.post(api).send({
                userid: email_userid,
                type: type,
                amount: amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', email_userid, type, amount, ConfigUtils.keys.checksum_key))
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userid, email_userid);
                Should.equal(msg.userInfo.lv, ConfigPlatform.user.lv);
                Should.equal(msg.userInfo.exp, ConfigPlatform.user.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.user.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.user.gems + 10);

                Should.equal(msg.addInfo.gems, amount);
                done();
            });
        });

        it('减少用户的资源 #Gems', done => {
            let api = '/resources/cost_user_res';
            let type = 'gems';
            app.post(api).send({
                userid: email_userid,
                type: type,
                amount: amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', email_userid, type, amount, ConfigUtils.keys.checksum_key))
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userid, email_userid);
                Should.equal(msg.userInfo.lv, ConfigPlatform.user.lv);
                Should.equal(msg.userInfo.exp, ConfigPlatform.user.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.user.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.user.gems);

                Should.equal(msg.costInfo.gems, amount);
                done();
            });
        });


        it('增加用户的资源 #Lv', done => {
            let api = '/resources/add_user_res';
            let type = 'lv';
            app.post(api).send({
                userid: guest_userid,
                type: type,
                amount: amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', guest_userid, type, amount, ConfigUtils.keys.checksum_key))
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userid, guest_userid);
                Should.equal(msg.userInfo.lv, ConfigPlatform.user.lv + 10);
                Should.equal(msg.userInfo.exp, ConfigPlatform.user.exp);
                Should.equal(msg.userInfo.coins, ConfigPlatform.user.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.user.gems);

                Should.equal(msg.addInfo.lv, amount);
                done();
            });
        });

        it('增加用户的资源 #Exp', done => {
            let api = '/resources/add_user_res';
            let type = 'exp';
            app.post(api).send({
                userid: guest_userid,
                type: type,
                amount: amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', guest_userid, type, amount, ConfigUtils.keys.checksum_key))
            }).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);
                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.equal(msg.userInfo.userid, guest_userid);
                Should.equal(msg.userInfo.lv, ConfigPlatform.user.lv + 10);
                Should.equal(msg.userInfo.exp, ConfigPlatform.user.exp + 10);
                Should.equal(msg.userInfo.coins, ConfigPlatform.user.coins);
                Should.equal(msg.userInfo.gems, ConfigPlatform.user.gems);

                Should.equal(msg.addInfo.exp, amount);
                done();
            });
        });


        it('增加用户的资源 #错误的checksum', done => {
            let api = '/resources/add_user_res';
            let type = 'exp';
            app.post(api).send({
                userid: email_userid,
                type: type,
                amount: amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s123', email_userid, type, amount, ConfigUtils.keys.checksum_key))
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
            let api = '/resources/cost_user_res';
            let type = 'exp';
            app.post(api).send({
                userid: email_userid,
                type: type,
                amount: amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s123', email_userid, type, amount, ConfigUtils.keys.checksum_key))
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
            let api = '/resources/add_user_res';
            let type = 'lalala';
            app.post(api).send({
                userid: guest_userid,
                type: type,
                amount: amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', guest_userid, type, amount, ConfigUtils.keys.checksum_key))
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
            let api = '/resources/cost_user_res';
            let type = 'lv';
            app.post(api).send({
                userid: guest_userid,
                type: type,
                amount: amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', guest_userid, type, amount, ConfigUtils.keys.checksum_key))
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
            let api = '/resources/add_user_res';
            let type = 'lalala';
            app.post(api).send({
                userid: guest_userid,
                type: type,
                amount: -amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', guest_userid, type, -amount, ConfigUtils.keys.checksum_key))
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
            let api = '/resources/cost_user_res';
            let type = 'gems';
            app.post(api).send({
                userid: guest_userid,
                type: type,
                amount: -amount,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', guest_userid, type, -amount, ConfigUtils.keys.checksum_key))
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
