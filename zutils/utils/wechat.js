/**
 * Created by EasyGame.
 * File: WeChatApi.js
 * User: justin
 * Date: 3/2/2018
 * Time: 20:38
 */

'use strict';

const RQ = require('request');
const QS = require('querystring');

const Logger = require('log4js').getLogger('utils');

function get_access_token(code, info, next) {
    let data = {
        appid: info.appid,
        secret: info.secret,
        code: code,
        grant_type: "authorization_code"
    };

    RQ({url: "https://api.weixin.qq.com/sns/oauth2/access_token?" + QS.stringify(data)}, (err, res, text) => {
        let body;
        try {
            body = JSON.parse(text);
        } catch (e) {
            next(new Error('parse json failed'));
            Logger.error('parse json failed!', text);
        }
        Logger.debug('Load Wechat AccessToken [ %j ]', body);
        next(err, body);
    });
}

function get_state_info(access_token, openid, next) {
    let data = {
        access_token: access_token,
        openid: openid
    };

    RQ({"url": "https://api.weixin.qq.com/sns/userinfo?" + QS.stringify(data)}, (err, res, text) => {
        let body;
        try {
            body = JSON.parse(text);
        } catch (e) {
            next(new Error('parse json failed'));
            Logger.error('parse json failed!', text);
        }
        Logger.debug('Load Wechat UserInfo [ %j ]', body);
        next(err, body);
    });
}

module.exports = {
    "get_access_token": get_access_token,
    "get_state_info": get_state_info
};
