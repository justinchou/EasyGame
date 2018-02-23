/**
 * Created by EasyGame.
 * File: index.js
 * User: justin
 * Date: 3/2/2018
 * Time: 16:52
 */

'use strict';

const Express = require('express');
const RQ = require('request');
const QS = require('querystring');
const Router = Express.Router();
const Util = require('util');

const Logger = require('log4js').getLogger('zhall');
const Crypto = require('../../zutils/utils/crypto');
const HttpResponser = require('../../zutils/classes/HttpResponser');

let RoomService = require('../services/roomService');

let ConfigUtils = require('../../config/utils');
let ErrorCode = require('../config/errorCode');

let DataIns = require('../../zutils/classes/Singleton').getInstance();
let GameServers = DataIns.get('GameServers');

/**
 * Game服务器向Hall服务器发起注册请求, 将自己加入到可以服务状态列表中.
 *
 * GET
 *
 * host 外网服务地址
 * port 外网服务端口
 * load 当前负载
 * privateHost 内网服务地址
 * privatePort 内网服务端口
 *
 */
Router.get('/registerGameServer', function (req, res, next) {

    let host = req.query.host;
    let port = req.query.port;

    let load = req.query.load;

    let privateHost = req.query.privateHost || req.ip;
    let privatePort = req.query.privatePort;

    let checkserver = req.query.checkserver;

    if (!checkserver || checkserver !== Crypto.calcServer(host, port, load, privateHost, privatePort)) {
        req.send(new HttpResponser(ErrorCode.CheckServerFailed, {"message": "check server failed!"}));
        return;
    }

    let serverId = Util.format('%s:%s', host, port);

    if (GameServers[serverId]) {
        let info = GameServers[serverId];
        if (info.host !== host || info.port !== port || info.privateHost !== privateHost || info.privatePort !== privatePort) {
            Logger.error('Duplicate gsId: [ %s ], info: [ %j ], address: [ %s:%s ]', serverId, info, privateHost, privatePort);
            res.send(new HttpResponser().fill(ErrorCode.DuplicateGameServerId, {
                "message": Util.format("duplicate game server id [ %s ]", serverId)
            }).encode());
            return;
        }
        info.online = true;
        info.load = load;
    } else {
        GameServers[serverId] = {
            id: serverId,
            host: host,
            port: port,
            privateHost: privateHost,
            privatePort: privatePort,
            load: load,
            online: true
        };
    }

    res.send(new HttpResponser().fill(ErrorCode.Success, {
        "message": "success",
        "privateHost": privateHost,
        "privatePort": privatePort
    }).encode());

    // setInterval(update, 1e3, serverId, privateHost, privatePort);
});

function checkUpdate(serverId, serverInfo) {
    let data = {
        serverId: serverId,
        sign: Crypto.calcServer(serverId)
    };

    // todo game server api getServerInfo
    RQ(Util.format("http://%s:$s/getServerInfo?%s", serverInfo.privateHost, serverInfo.privatePort, QS.stringify(data)), (err, res, data) => {
        if (err || !res || !data || data.code !== ErrorCode.Success) {
            // todo handle error
            return;
        }

        // todo handle server info
    });
}

Router.update = function update() {
    for (let serverId in GameServers) {
        if (GameServers.hasOwnProperty(serverId)) {
            RoomService.isServerOnline(GameServers[serverId].host, GameServers[serverId].port, (err, online) => {

            });
            checkUpdate(serverId, GameServers[serverId], (err, data) => {

            });
        }
    }
};

module.exports = Router;
