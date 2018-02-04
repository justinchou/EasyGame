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
let Crypto = require('../../zutils/crypto');

require('log4js').configure(Path.join(__dirname, '../../config/log4js.json'));
let Logger = require('log4js').getLogger('mocha');
let AccountConfig = require('../../config/account');
let MochaConfig = require('../../config/mocha');
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
                if (MochaConfig.debug > 1) {
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

        beforeEach(function() {
            this.timeout(MochaConfig.timeout);
        });

        after(done => {
            let AccountModel = require('../model/account.model');
            let UserModel = require('../model/user.model');
            AccountModel.destory();
            UserModel.destory();
            done();
        });

        it('获取客户端版本信息', done => {
            let api = '/client_info';
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                Should.equal(err, null);

                Should.equal(res.body.code, ErrorCode.Success);

                let msg = res.body.message;
                Should.not.equal(msg, undefined);
                Should.not.equal(msg.client_info, undefined);
                Should.equal(msg.client_info.version_min, AccountConfig.version.client_min);
                Should.equal(msg.client_info.version_new, AccountConfig.version.client_new);
                Should.equal(msg.client_info.app_web, AccountConfig.version.client_web);
                Should.exist(msg.client_info.hall_server);
                done();
            });
        });

        it('获取用户公开信息 #无checksum', done => {
            let api = '/user_public_info?' + QS.stringify({userid: userid});
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
            let api = '/user_private_info?' + QS.stringify({userid: userid});
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
            let api = '/user_public_info?' + QS.stringify({
                userid: userid,
                checksum: Crypto.md5(userid + '_' + AccountConfig.keys.checksum_key)
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
            let api = '/user_private_info?' + QS.stringify({
                userid: userid,
                checksum: Crypto.md5(userid + '_' + AccountConfig.keys.checksum_key)
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
            let api = '/register?' + QS.stringify({
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
            let api = '/register?' + QS.stringify({
                account: guest_account,
                type: 'guest',
                password: '',
                name: nickname,
                sex: gender,
                headimgurl: headimg,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', guest_account, 'guest', '', AccountConfig.keys.checksum_key))
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
            let api = '/register?' + QS.stringify({
                account: email_account,
                type: 'email',
                password: password,
                name: nickname,
                sex: gender,
                headimgurl: headimg,
                checksum: Crypto.md5(Util.format('%s_%s_%s_%s', email_account, 'email', password, AccountConfig.keys.checksum_key))
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
            let api = '/user_public_info?' + QS.stringify({
                userid: email_userid,
                checksum: Crypto.md5(email_userid + '_' + AccountConfig.keys.checksum_key)
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
            let api = '/user_private_info?' + QS.stringify({
                userid: guest_userid,
                checksum: Crypto.md5(guest_userid + '_' + AccountConfig.keys.checksum_key)
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
                Should.equal(msg.userInfo.lv, AccountConfig.user.lv);
                Should.equal(msg.userInfo.exp, AccountConfig.user.exp);
                Should.equal(msg.userInfo.coins, AccountConfig.user.coins);
                Should.equal(msg.userInfo.gems, AccountConfig.user.gems);
                done();
            });
        });

        it('授权Guest用户', done => {
            let api = '/guest_auth?' + QS.stringify({
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
            let api = '/email_auth?' + QS.stringify({
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
            let api = '/wechat_auth?' + QS.stringify({
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

    });
});
