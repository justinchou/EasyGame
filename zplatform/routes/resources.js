/**
 * Created by EasyGame.
 * File: resources.js
 * User: justin
 * Date: 5/2/2018
 * Time: 21:46
 */

'use strict';

const Util = require('util');

const Async = require('async');
const Express = require('express');
const Router = Express.Router();

const LogStat = require('log4js').getLogger('statistics');
const Logger = require('log4js').getLogger('account');

const Crypto = require('../../zutils/utils/crypto');
const HttpResponser = require('../../zutils/classes/HttpResponser');

const ConfigPlatform = require('../../config/platform');
const ConfigUtils = require('../../config/utils');
const ConfigHall = require('../../config/hall');
const ErrorCode = require('../config/errorCode');

let AccountModel = require('../../zutils/model/account.model');
let UserModel = require('../../zutils/model/user.model');

Router.get('/clientInfo', function (req, res) {
    let clientInfo = {
        versionMin: ConfigUtils.version.clientMin,
        versionNew: ConfigUtils.version.clientNew,
        appWeb: ConfigUtils.version.clientWeb,
        hallServer: Crypto.calcServerAddr(ConfigHall.host, ConfigHall.port)
    };
    new HttpResponser().fill(ErrorCode.Success, {'clientInfo': clientInfo}).send(res);
});

Router.get('/userPublicInfo', function (req, res) {
    let userid = req.query.userid;
    let checksum = req.query.checksum;
    if (checksum !== Crypto.calcSum(userid)) {
        new HttpResponser().fill(ErrorCode.APICheckSumFailed, {'message': 'check sum failed'}).send(res);
        return;
    }

    UserModel.userPubInfo(userid, function (err, data) {
        if (err) {
            new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {'message': 'db error or no record'}).send(res);
            return;
        }

        let userInfo = {
            userid: userid,
            name: data.nickname,
            sex: data.gender,
            headimgurl: data.headimg || ''
        };
        new HttpResponser().fill(ErrorCode.Success, {userInfo: userInfo}).send(res);
    });
});

Router.get('/userPrivateInfo', function (req, res) {
    let userid = req.query.userid;
    let checksum = req.query.checksum;
    if (checksum !== Crypto.calcSum(userid)) {
        new HttpResponser().fill(ErrorCode.APICheckSumFailed, {'message': 'check sum failed'}).send(res);
        return;
    }

    UserModel.userPriInfo(userid, function (err, data) {
        if (err) {
            new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {'message': 'db error or no record'}).send(res);
            return;
        }

        let userInfo = {
            userid: userid,
            lv: data.lv,
            exp: data.exp,
            coins: data.coins,
            gems: data.gems
        };
        new HttpResponser().fill(ErrorCode.Success, {userInfo: userInfo}).send(res);
    });
});

Router.post('/addUserRes', function (req, res) {
    let userid = req.body.userid;
    let type = req.body.type;
    let amount = req.body.amount;
    let checksum = req.body.checksum;
    if (checksum !== Crypto.calcSum(userid, type, amount)) {
        new HttpResponser().fill(ErrorCode.APICheckSumFailed, {'message': 'check sum failed'}).send(res);
        return;
    }

    amount = parseInt(amount, 10);
    if (!userid || !type || !amount || Number.isNaN(amount) || amount < 0) {
        new HttpResponser().fill(ErrorCode.InvalidParams, {"message": "invalid params"}).send(res);
        return;
    }

    function cb(err, success) {
        if (err || !success) {
            Logger.error('Add User Res Failed, type [ %s ] params [ %j ] [ %j ]', type, req.body, req.query);
            new HttpResponser().fill(ErrorCode.UpdateDBFailed, {"message": "write db failed"}).send(res);
            return;
        }
        UserModel.userPriInfo(userid, function (err, data) {
            if (err) {
                new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {'message': 'db error or no record'}).send(res);
                return;
            }

            let userInfo = {
                userid: userid,
                lv: data.lv,
                exp: data.exp,
                coins: data.coins,
                gems: data.gems
            };

            let addInfo = {};
            addInfo[type] = amount;

            new HttpResponser().fill(ErrorCode.Success, {userInfo: userInfo, addInfo: addInfo}).send(res);
        });
    }

    switch (type) {
        case "gems":
            UserModel.addGems(userid, amount, cb);
            break;
        case "coins":
            UserModel.addCoins(userid, amount, cb);
            break;
        case "lv":
            UserModel.addLv(userid, amount, cb);
            break;
        case "exp":
            UserModel.addExp(userid, amount, cb);
            break;
        default:
            Logger.error('Add User Res Failed, type [ %s ] params [ %j ] [ %j ]', type, req.body, req.query);
            new HttpResponser().fill(ErrorCode.InvalidParams, {"message": "invalid type"}).send(res);
            break;
    }
});

Router.post('/costUserRes', function (req, res) {
    let userid = req.body.userid;
    let type = req.body.type;
    let amount = req.body.amount;
    let checksum = req.body.checksum;
    if (checksum !== Crypto.calcSum(userid, type, amount)) {
        new HttpResponser().fill(ErrorCode.APICheckSumFailed, {'message': 'check sum failed'}).send(res);
        return;
    }

    amount = parseInt(amount, 10);
    if (!userid || !type || !amount || Number.isNaN(amount) || amount < 0) {
        new HttpResponser().fill(ErrorCode.InvalidParams, {"message": "invalid params"}).send(res);
        return;
    }

    function cb(err, success) {
        if (err || !success) {
            Logger.error('Cost User Res Failed, type [ %s ] params [ %j ] [ %j ]', type, req.body, req.query);
            new HttpResponser().fill(ErrorCode.UpdateDBFailed, {"message": "write db failed"}).send(res);
            return;
        }
        UserModel.userPriInfo(userid, function (err, data) {
            if (err) {
                new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {'message': 'db error or no record'}).send(res);
                return;
            }

            let userInfo = {
                userid: userid,
                lv: data.lv,
                exp: data.exp,
                coins: data.coins,
                gems: data.gems
            };

            let costInfo = {};
            costInfo[type] = amount;

            new HttpResponser().fill(ErrorCode.Success, {userInfo: userInfo, costInfo: costInfo}).send(res);
        });
    }

    switch (type) {
        case "gems":
            UserModel.costGems(userid, amount, cb);
            break;
        case "coins":
            UserModel.costCoins(userid, amount, cb);
            break;
        default:
            Logger.error('Add User Res Failed, type [ %s ] params [ %j ] [ %j ]', type, req.body, req.query);
            new HttpResponser().fill(ErrorCode.InvalidParams, {"message": "invalid type"}).send(res);
            break;
    }
});

module.exports = Router;