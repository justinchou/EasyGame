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
let MochaConfig = require('../../../config/mocha');

let AccountModel = require('../../model/account.model');

describe('Model', () => {
    describe('#Account 检测Account数据表处理函数', () => {

        before(done => {
            if (MochaConfig.debug > 1) Logger.debug('Wait Database Connection For 3s');
            setTimeout(function () {
                if (MochaConfig.debug > 1) Logger.debug('Maybe Database Connected');
                done();
            }, 1000);
        });

        beforeEach(function() {
            this.timeout(MochaConfig.timeout);
        });

        after(done => {
            AccountModel.destory();
            done();
        });

        let type = "guest";
        let account = type + "_" + (Math.floor(Math.random() * 10000000000) + 1);
        let password = '123456';
        let newpass = '2345678';
        let userid = '349573';

        it('Check Account #Not Exist', done => {
            AccountModel.existAccount(account, type, (err, exist) => {
                Should.equal(err, null);
                Should.equal(exist, false);
                done();
            });
        });

        it('Get Account Info #Not Exist With Password', done => {
            AccountModel.accountInfo(account, type, password, (err, info) => {
                Should.not.equal(err, null);
                Should.equal(info, undefined);
                done();
            });
        });

        it('Get Account Info #Not Exist Without Password', done => {
            AccountModel.accountInfo(account, type, (err, info) => {
                Should.not.equal(err, null);
                Should.equal(info, undefined);
                done();
            });
        });

        it('Update Password #Not Exist', done => {
            AccountModel.updatePassword(account, type, newpass, (err, success) => {
                Should.not.equal(err, null);
                Should.equal(success, undefined);
                done();
            });
        });

        it('Create Account #With Invalid Params Account', done => {
            AccountModel.createAccount('', type, password, (err, success) => {
                Should.not.equal(err, null);
                Should.equal(success, undefined);
                done();
            });
        });

        it('Create Account #With Invalid Params Password', done => {
            AccountModel.createAccount(account, type, '', (err, success) => {
                Should.not.equal(err, null);
                Should.equal(success, undefined);
                done();
            });
        });

        it('Create Account #With Valid Params', done => {
            AccountModel.createAccount(account, type, password, (err, success) => {
                Should.equal(err, null);
                Should.equal(success, true);
                done();
            });
        });

        it('Create Account #Account Already Exist', done => {
            AccountModel.createAccount(account, type, password, (err, success) => {
                Should.equal(err.code, 'ER_DUP_ENTRY');
                Should.equal(success, undefined);
                done();
            });
        });

        it('Check Account #Exist', done => {
            AccountModel.existAccount(account, type, (err, exist) => {
                Should.equal(err, null);
                Should.equal(exist, true);
                done();
            });
        });

        it('Get Account Info #Not Exist With Password Wrong', done => {
            AccountModel.accountInfo(account, type, '2345678', (err, info) => {
                Should.not.equal(err, null);
                Should.equal(info, undefined);
                done();
            });
        });

        it('Get Account Info #Exist With Password Right', done => {
            AccountModel.accountInfo(account, type, password, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.account, account);
                done();
            });
        });

        it('Get Account Info #Exist Without Password', done => {
            AccountModel.accountInfo(account, type, (err, info) => {
                Should.equal(err, null);
                Should.equal(info.account, account);
                done();
            });
        });

        it('Update Password #Exist', done => {
            AccountModel.updatePassword(account, type, newpass, (err, info) => {
                Should.equal(err, null);
                Should.equal(info, true);
                done();
            });
        });

        it('Link UserId #First Time', done => {
            AccountModel.linkUserId(account, type, userid, (err, info) => {
                Should.equal(err, null);
                Should.equal(info, true);
                done();
            });
        });

        it('Link UserId #Not First Time', done => {
            AccountModel.linkUserId(account, type, userid, (err, info) => {
                Should.not.equal(err, null);
                Should.equal(info, undefined);
                done();
            });
        });

        it('Link UserId #Not First Time Force', done => {
            AccountModel.linkUserId(account, type, userid, true, (err, info) => {
                Should.equal(err, null);
                Should.equal(info, true);
                done();
            });
        });
    });
});
