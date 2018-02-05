/**
 * Created by EasyGame.
 * File: index.js
 * User: justin
 * Date: 4/2/2018
 * Time: 19:28
 */

'use strict';

const Util = require('util');

const Async = require('async');
const Express = require('express');
const Router = Express.Router();

const LogStat = require('log4js').getLogger('statistics');
const Logger = require('log4js').getLogger('account');

const Crypto = require('../../zutils/utils/crypto');
const WeChatAPI = require('../../zutils/utils/wechat');
const HttpResponser = require('../../zutils/classes/HttpResponser');

const ConfigAccount = require('../../config/account');
const ConfigHall = require('../../config/hall');
const ErrorCode = require('../config/error_code');

let AccountModel = require('../../zutils/model/account.model');
let UserModel = require('../../zutils/model/user.model');

function create_user(account, type, password, name, sex, headimgurl, next) {
    let parmas = [account, type, password, name, sex, headimgurl];

    let retid;

    AccountModel.existAccount(account, type, function (err, exist, userid) {
        if (err) {
            next(err);
            Logger.error('Check Account Exist Error: params [ %j ] err ', parmas, err);
            return
        }

        if (!exist) {
            AccountModel.createAccount(account, type, password, (err, success) => {
                if (err || !success) {
                    next(err || new Error('Create Account Failed'));
                    Logger.error('Create Account Failed: params [ %j ] err ', parmas, err);
                    return;
                }

                UserModel.createUser(name, sex, headimgurl, (err, userid) => {
                    if (err || typeof userid !== 'number') {
                        next(err || new Error('Create User Got Invalid Userid'));
                        Logger.error('Create User Got Invalid Userid: params [ %j ] err ', parmas, err);
                        return;
                    }

                    retid = userid;
                    AccountModel.linkUserId(account, type, userid, (err, success) => {
                        if (err || !success) {
                            next(err || new Error('Link Created User To Account Failed'));
                            Logger.error('Link Created User To Account Failed: params [ %j ] err ', parmas, err);
                            return;
                        }

                        next(null, retid);
                        LogStat.info('Create Account And User: Account [ %s ] Name [ %s ] Sex [ %s ] Img [ %s ]', account, name, sex, headimgurl);
                    });
                });
            });
        } else if (exist && !userid) {
            UserModel.createUser(name, sex, headimgurl, (err, userid) => {
                if (err || typeof userid !== 'number') {
                    next(err || new Error('Create User Got Invalid Userid'));
                    Logger.error('Create User Got Invalid Userid: params [ %j ] err ', parmas, err);
                    return;
                }

                retid = userid;
                AccountModel.linkUserId(account, type, userid, (err, success) => {
                    if (err || !success) {
                        next(err || new Error('Link Created User To Account Failed'));
                        Logger.error('Link Created User To Account Failed: params [ %j ] err ', parmas, err);
                        return;
                    }

                    next(null, retid);
                    LogStat.info('Create User, Account Exist: Account [ %s ] Name [ %s ] Sex [ %s ] Img [ %s ]', account, name, sex, headimgurl);
                });
            });
        } else {
            retid = userid;
            UserModel.updateUser(userid, nickname, sex, headimgurl, function (err, success) {
                if (err || !success) {
                    next(err || new Error('Update User Info Failed'));
                    Logger.error('Update User Info Failed: params [ %j ] err ', parmas, err);
                    return;
                }

                next(null, retid);
                LogStat.info('Update User, Account And User Both Exist: Account [ %s ] Name [ %s ] Sex [ %s ] Img [ %s ]', account, name, sex, headimgurl);
            });
        }
    });
}

Router.get('/register', function (req, res) {
    let account = req.query.account;
    let type = req.query.type;
    let password = req.query.password || "";
    let name = req.query.name || '';
    let sex = req.query.sex || 1;
    let headimgurl = req.query.headimgurl || '';
    let checksum = req.query.checksum;
    if (checksum !== Crypto.md5(Util.format('%s_%s_%s_%s', account, type, password, ConfigAccount.keys.checksum_key))) {
        res.json(new HttpResponser().fill(ErrorCode.APICheckSumFailed, {'message': 'check sum failed'}));
        return;
    }

    create_user(account, type, password, name, sex, headimgurl, (err, userid) => {
        if (err || !userid) {
            res.json(new HttpResponser().fill(ErrorCode.AccountRegistered, {'message': 'account been used'}));
        } else {
            res.json(new HttpResponser().fill(ErrorCode.Success, {"userid": userid}));
        }
    });
});

Router.get('/guest_auth', function (req, res) {
    let account = req.query.account;
    let type = "guest";

    if (!account) {
        res.json(new HttpResponser().fill(ErrorCode.InvalidParams, {"message":"invalid params"}));
        Logger.error('Invalid Params: params [ %j ]', req.query);
        return;
    }

    AccountModel.accountInfo(account, type, (err, data) => {
        if (err || !data) {
            res.json(new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {"message":"no account data"}));
            Logger.error('No Account Data: params [ %j ] err ', req.query, err);
            return;
        }
        let account = req.query.account;
        let sign = Crypto.md5(account + req.ip + ConfigAccount.keys.account_key);
        let auth = {
            account: account,
            userid: data.userid,
            hall_server: ConfigHall.host + ':' + ConfigHall.port,
            sign: sign
        };

        res.json(new HttpResponser().fill(ErrorCode.Success, {auth: auth}));

        LogStat.info('Login Guest [ %j ] [ %j ]', req.query, auth);
    });
});

Router.get('/email_auth', function (req, res) {
    let account = req.query.account;
    let type = 'email';
    let password = req.query.password;

    if (!account || !password) {
        res.json(new HttpResponser().fill(ErrorCode.InvalidParams, {"message":"invalid params"}));
        Logger.error('Invalid Params: params [ %j ]', req.query);
        return;
    }

    AccountModel.accountInfo(account, type, password, (err, data) => {
        if (err || !data) {
            res.json(new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {"message":"no account data"}));
            Logger.error('No Account Data: params [ %j ] err ', req.query, err);
            return;
        }
        let account = req.query.account;
        let sign = Crypto.md5(account + req.ip + ConfigAccount.keys.account_key);
        let auth = {
            account: account,
            userid: data.userid,
            hall_server: ConfigHall.host + ':' + ConfigHall.port,
            sign: sign
        };

        res.json(new HttpResponser().fill(ErrorCode.Success, {auth: auth}));

        LogStat.info('Login Email [ %j ] [ %j ]', req.query, auth);
    });
});

Router.get('/wechat_auth', function (req, res) {
    let code = req.query.code;
    let type = "wechat";
    let os = req.query.os;
    let info = ConfigAccount.app[os];

    if (!code || !os || !info) {
        res.json(new HttpResponser().fill(ErrorCode.InvalidParams, {"message":"invalid params"}));
        Logger.error('Invalid Params: params [ %j ]', req.query);
        return;
    }

    WeChatAPI.get_access_token(code, info, function (err, data) {
        if (err) {
            res.json(new HttpResponser().fill(ErrorCode.WeChatAPIError, {"message": "load wechat access_token failed"}));
            Logger.error('Load Wechat AccessToken Failed: params [ %j ] err ', req.query, err);
            return;
        }

        if (data.errcode) {
            res.json(new HttpResponser().fill(ErrorCode.WeChatAPIError, {"message": data.errmsg}));
            Logger.error('Load Wechat AccessToken Failed: params [ %j ] err ', req.query, data.errmsg);
            return;
        }

        let access_token = data.access_token;
        let openid = data.openid;
        WeChatAPI.get_state_info(access_token, openid, function (err, data) {
            if (err) {
                res.json(new HttpResponser().fill(ErrorCode.WeChatAPIError, {"message": "load wechat state_info failed"}));
                Logger.error('Load Wechat StateInfo Failed: params [ %j ] err ', req.query, err);
                return;
            }

            if (data.errcode) {
                res.json(new HttpResponser().fill(ErrorCode.WeChatAPIError, {"message": data.errmsg}));
                Logger.error('Load Wechat StateInfo Failed: params [ %j ] err ', req.query, data.errmsg);
                return;
            }

            let account = data.openid;
            let nickname = data.nickname;
            let sex = data.sex;
            let headimgurl = data.headimgurl;
            create_user(account, type, "", nickname, sex, headimgurl, function (err, userid) {
                if (err || !userid) {
                    res.json(new HttpResponser().fill(ErrorCode.WeChatAPIError, {"message": "create wechat user info failed"}));
                    Logger.error('Create Wechat Userinfo Failed: params [ %j ] err ', req.query, err);
                    return;
                }

                let sign = Crypto.md5(account + req.ip + ConfigAccount.keys.account_key);
                let auth = {
                    account: account,
                    userid: userid,
                    hall_server: ConfigHall.host + ':' + ConfigHall.port,
                    sign: sign
                };

                res.json(new HttpResponser().fill(ErrorCode.Success, {auth: auth}));

                LogStat.info('Login Wechat [ %j ] [ %j ]', req.query, auth);
            });

        });

    });
});

module.exports = Router;
