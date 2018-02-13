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

const ConfigPlatform = require('../../config/platform');
const ConfigHall = require('../../config/hall');
const ConfigUtils = require('../../config/utils');
const ErrorCode = require('../config/errorCode');

let AccountModel = require('../../zutils/model/account.model');
let UserModel = require('../../zutils/model/user.model');

function createUser(account, type, password, name, sex, headimgurl, next) {
    let parmas = [account, type, password, name, sex, headimgurl];

    let retId;

    AccountModel.existAccount(account, type, function (err, exist, userId) {
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

                UserModel.createUser(name, sex, headimgurl, (err, userId) => {
                    if (err || typeof userId !== 'number') {
                        next(err || new Error('Create User Got Invalid UserId'));
                        Logger.error('Create User Got Invalid UserId: params [ %j ] err ', parmas, err);
                        return;
                    }

                    retId = userId;
                    AccountModel.linkUserId(account, type, userId, (err, success) => {
                        if (err || !success) {
                            next(err || new Error('Link Created User To Account Failed'));
                            Logger.error('Link Created User To Account Failed: params [ %j ] err ', parmas, err);
                            return;
                        }

                        next(null, retId);
                        LogStat.info('Create Account And User: Account [ %s ] Name [ %s ] Sex [ %s ] Img [ %s ]', account, name, sex, headimgurl);
                    });
                });
            });
        } else if (exist && !userId) {
            UserModel.createUser(name, sex, headimgurl, (err, userId) => {
                if (err || typeof userId !== 'number') {
                    next(err || new Error('Create User Got Invalid UserId'));
                    Logger.error('Create User Got Invalid UserId: params [ %j ] err ', parmas, err);
                    return;
                }

                retId = userId;
                AccountModel.linkUserId(account, type, userId, (err, success) => {
                    if (err || !success) {
                        next(err || new Error('Link Created User To Account Failed'));
                        Logger.error('Link Created User To Account Failed: params [ %j ] err ', parmas, err);
                        return;
                    }

                    next(null, retId);
                    LogStat.info('Create User, Account Exist: Account [ %s ] Name [ %s ] Sex [ %s ] Img [ %s ]', account, name, sex, headimgurl);
                });
            });
        } else {
            retId = userId;
            UserModel.updateUser(userId, nickname, sex, headimgurl, function (err, success) {
                if (err || !success) {
                    next(err || new Error('Update User Info Failed'));
                    Logger.error('Update User Info Failed: params [ %j ] err ', parmas, err);
                    return;
                }

                next(null, retId);
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
    if (checksum !== Crypto.calcSum(account, type, password)) {
        new HttpResponser().fill(ErrorCode.APICheckSumFailed, {'message': 'check sum failed'}).send(res);
        return;
    }

    createUser(account, type, password, name, sex, headimgurl, (err, userId) => {
        if (err || !userId) {
            new HttpResponser().fill(ErrorCode.AccountRegistered, {'message': 'account been used'}).send(res);
        } else {
            new HttpResponser().fill(ErrorCode.Success, {"userId": userId}).send(res);
        }
    });
});

Router.get('/guestAuth', function (req, res) {
    let account = req.query.account;
    let type = "guest";

    if (!account) {
        new HttpResponser().fill(ErrorCode.InvalidParams, {"message":"invalid params"}).send(res);
        Logger.error('Invalid Params: params [ %j ]', req.query);
        return;
    }

    AccountModel.accountInfo(account, type, (err, data) => {
        if (err || !data) {
            new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {"message":"no account data"}).send(res);
            Logger.error('No Account Data: params [ %j ] err ', req.query, err);
            return;
        }
        let account = req.query.account;
        let sign = Crypto.calcSign(account, req.ip);
        let auth = {
            account: account,
            userId: data.userId,
            hallServer: ConfigHall.host + ':' + ConfigHall.port,
            sign: sign
        };

        new HttpResponser().fill(ErrorCode.Success, {auth: auth}).send(res);

        LogStat.info('Login Guest [ %j ] [ %j ]', req.query, auth);
    });
});

Router.get('/emailAuth', function (req, res) {
    let account = req.query.account;
    let type = 'email';
    let password = req.query.password;

    if (!account || !password) {
        new HttpResponser().fill(ErrorCode.InvalidParams, {"message":"invalid params"}).send(res);
        Logger.error('Invalid Params: params [ %j ]', req.query);
        return;
    }

    AccountModel.accountInfo(account, type, password, (err, data) => {
        if (err || !data) {
            new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {"message":"no account data"}).send(res);
            Logger.error('No Account Data: params [ %j ] err ', req.query, err);
            return;
        }
        let account = req.query.account;
        let sign = Crypto.calcSign(account, req.ip);
        let auth = {
            account: account,
            userId: data.userId,
            hallServer: Crypto.calcServerAddr(ConfigHall.host, ConfigHall.port),
            sign: sign
        };

        new HttpResponser().fill(ErrorCode.Success, {auth: auth}).send(res);

        LogStat.info('Login Email [ %j ] [ %j ]', req.query, auth);
    });
});

Router.get('/wechatAuth', function (req, res) {
    let code = req.query.code;
    let type = "wechat";
    let os = req.query.os;
    let info = ConfigUtils.app[os];

    if (!code || !os || !info) {
        new HttpResponser().fill(ErrorCode.InvalidParams, {"message":"invalid params"}).send(res);
        Logger.error('Invalid Params: params [ %j ]', req.query);
        return;
    }

    WeChatAPI.getAccessToken(code, info, function (err, data) {
        if (err) {
            new HttpResponser().fill(ErrorCode.WeChatAPIError, {"message": "load wechat access_token failed"}).send(res);
            Logger.error('Load Wechat AccessToken Failed: params [ %j ] err ', req.query, err);
            return;
        }

        if (data.errcode) {
            new HttpResponser().fill(ErrorCode.WeChatAPIError, {"message": data.errmsg}).send(res);
            Logger.error('Load Wechat AccessToken Failed: params [ %j ] err ', req.query, data.errmsg);
            return;
        }

        let accessToken = data.access_token;
        let openId = data.openid;
        WeChatAPI.getStateInfo(accessToken, openId, function (err, data) {
            if (err) {
                new HttpResponser().fill(ErrorCode.WeChatAPIError, {"message": "load wechat stateInfo failed"}).send(res);
                Logger.error('Load Wechat StateInfo Failed: params [ %j ] err ', req.query, err);
                return;
            }

            if (data.errcode) {
                new HttpResponser().fill(ErrorCode.WeChatAPIError, {"message": data.errmsg}).send(res);
                Logger.error('Load Wechat StateInfo Failed: params [ %j ] err ', req.query, data.errmsg);
                return;
            }

            let account = data.openid;
            let nickname = data.nickname;
            let sex = data.sex;
            let headimgurl = data.headimgurl;
            createUser(account, type, "", nickname, sex, headimgurl, function (err, userId) {
                if (err || !userId) {
                    new HttpResponser().fill(ErrorCode.WeChatAPIError, {"message": "create wechat user info failed"}).send(res);
                    Logger.error('Create Wechat UserInfo Failed: params [ %j ] err ', req.query, err);
                    return;
                }

                let sign = Crypto.calcSign(account, req.ip);
                let auth = {
                    account: account,
                    userId: userId,
                    hallServer: Crypto.calcServerAddr(ConfigHall.host, ConfigHall.port),
                    sign: sign
                };

                new HttpResponser().fill(ErrorCode.Success, {auth: auth}).send(res);

                LogStat.info('Login Wechat [ %j ] [ %j ]', req.query, auth);
            });

        });

    });
});

module.exports = Router;
