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

Router.get('/client_info', function (req, res) {
    let client_info = {
        version_min: ConfigUtils.version.client_min,
        version_new: ConfigUtils.version.client_new,
        app_web: ConfigUtils.version.client_web,
        hall_server: ConfigHall.host + ':' + ConfigHall.port
    };
    res.json(new HttpResponser().fill(ErrorCode.Success, {'client_info': client_info}));
});

Router.get('/user_public_info', function (req, res) {
    let userid = req.query.userid;
    let checksum = req.query.checksum;
    if (checksum !== Crypto.md5(Util.format('%s_%s', userid, ConfigUtils.keys.checksum_key))) {
        res.json(new HttpResponser().fill(ErrorCode.APICheckSumFailed, {'message': 'check sum failed'}));
        return;
    }

    UserModel.userPubInfo(userid, function (err, data) {
        if (err) {
            res.json(new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {'message': 'db error or no record'}));
            return;
        }

        let userInfo = {
            userid: userid,
            name: data.nickname,
            sex: data.gender,
            headimgurl: data.headimg || ''
        };
        res.json(new HttpResponser().fill(ErrorCode.Success, {userInfo: userInfo}));
    });
});

Router.get('/user_private_info', function (req, res) {
    let userid = req.query.userid;
    let checksum = req.query.checksum;
    if (checksum !== Crypto.md5(Util.format('%s_%s', userid, ConfigUtils.keys.checksum_key))) {
        res.json(new HttpResponser().fill(ErrorCode.APICheckSumFailed, {'message': 'check sum failed'}));
        return;
    }

    UserModel.userPriInfo(userid, function (err, data) {
        if (err) {
            res.json(new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {'message': 'db error or no record'}));
            return;
        }

        let userInfo = {
            userid: userid,
            lv: data.lv,
            exp: data.exp,
            coins: data.coins,
            gems: data.gems
        };
        res.json(new HttpResponser().fill(ErrorCode.Success, {userInfo: userInfo}));
    });
});

Router.post('/add_user_res', function (req, res) {
    let userid = req.body.userid;
    let type = req.body.type;
    let amount = req.body.amount;
    let checksum = req.body.checksum;
    if (checksum !== Crypto.md5(Util.format('%s_%s_%s_%s', userid, type, amount, ConfigUtils.keys.checksum_key))) {
        res.json(new HttpResponser().fill(ErrorCode.APICheckSumFailed, {'message': 'check sum failed'}));
        return;
    }

    amount = parseInt(amount, 10);
    if (!userid || !type || !amount || Number.isNaN(amount) || amount < 0) {
        res.json(new HttpResponser().fill(ErrorCode.InvalidParams, {"message": "invalid params"}));
        return;
    }

    function cb(err, success) {
        if (err || !success) {
            Logger.error('Add User Res Failed, type [ %s ] params [ %j ] [ %j ]', type, req.body, req.query);
            res.json(new HttpResponser().fill(ErrorCode.UpdateDBFailed, {"message": "write db failed"}));
            return;
        }
        UserModel.userPriInfo(userid, function (err, data) {
            if (err) {
                res.json(new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {'message': 'db error or no record'}));
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

            res.json(new HttpResponser().fill(ErrorCode.Success, {userInfo: userInfo, addInfo: addInfo}));
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
            res.json(new HttpResponser().fill(ErrorCode.InvalidParams, {"message": "invalid type"}));
            break;
    }
});

Router.post('/cost_user_res', function (req, res) {
    let userid = req.body.userid;
    let type = req.body.type;
    let amount = req.body.amount;
    let checksum = req.body.checksum;
    if (checksum !== Crypto.md5(Util.format('%s_%s_%s_%s', userid, type, amount, ConfigUtils.keys.checksum_key))) {
        res.json(new HttpResponser().fill(ErrorCode.APICheckSumFailed, {'message': 'check sum failed'}));
        return;
    }

    amount = parseInt(amount, 10);
    if (!userid || !type || !amount || Number.isNaN(amount) || amount < 0) {
        res.json(new HttpResponser().fill(ErrorCode.InvalidParams, {"message": "invalid params"}));
        return;
    }

    function cb(err, success) {
        if (err || !success) {
            Logger.error('Cost User Res Failed, type [ %s ] params [ %j ] [ %j ]', type, req.body, req.query);
            res.json(new HttpResponser().fill(ErrorCode.UpdateDBFailed, {"message": "write db failed"}));
            return;
        }
        UserModel.userPriInfo(userid, function (err, data) {
            if (err) {
                res.json(new HttpResponser().fill(ErrorCode.DatabaseNoRecord, {'message': 'db error or no record'}));
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

            res.json(new HttpResponser().fill(ErrorCode.Success, {userInfo: userInfo, costInfo: costInfo}));
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
            res.json(new HttpResponser().fill(ErrorCode.InvalidParams, {"message": "invalid type"}));
            break;
    }
});

module.exports = Router;