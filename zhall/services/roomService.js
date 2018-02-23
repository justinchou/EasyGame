/**
 * Created by EasyGame.
 * File: roomService.js
 * User: justin
 * Date: 11/2/2018
 * Time: 23:11
 */

'use strict';

const Util = require('util');
const RQ = require('request');
const Async = require('async');

const Logger = require('log4js').getLogger('zhall');
const Crypto = require('../../zutils/utils/crypto');

let ConfigUtils = require('../../config/utils');
let ErrorCode = require('../config/errorCode');

let UserModel = require('../../zutils/model/user.model');
let RoomModel = require('../../zutils/model/room.model');

let DataIns = require('../../zutils/classes/Singleton').getInstance();
let GameServers = DataIns.get('GameServers');

/**
 * @private
 * @returns {*}
 */
function chooseServer() {
    let server = null;
    let online = [];

    // 选取在线服务器
    for (let s in GameServers) {
        if (!GameServers.hasOwnProperty(s)) continue;
        if (GameServers[s] && GameServers[s].online) online.push(GameServers[s]);
    }

    // 冒泡选取最小负载服务器
    for (let i = 0; i < online.length; i++) {
        if (server == null) {
            server = online[i];
        } else if (server.load > online[i].load) {
            server = online[i];
        }
    }
    return server;
}

function createRoom(userId, roomConf, next) {
    let server = chooseServer();
    if (!server) {
        next(ErrorCode.NoServerOnline);
        return;
    }

    UserModel.userInfo(userId, (err, user) => {
        let data = {
            userId: userId,
            user: user,
            conf: roomConf,
            checkserver: Crypto.calcServer(userId, JSON.stringify(user), JSON.stringify(roomConf))
        };

        RQ.post(Util.format("http://%s:%s/createRoom", server.privateHost, server.privatePort), {"form": data}, function (err, res, body) {
            if (err || !res || res.statusCode !== 200 || !body) {
                next(ErrorCode.GameServerNotAlive);
                return;
            }
            if (body.code !== ErrorCode.Success) {
                next(body.code);
                return;
            }
            next(null, {roomId: body.roomId, server: server, room: roomConf, users: body.users});
        });
    });

}

/**
 *
 * @private
 * @param serverInfo
 * @param roomId
 * @param next
 */
function isRoomRunningReq(serverInfo, roomId, next) {
    let data = {
        roomId: roomId,
        checkserver: Crypto.calcServer(roomId)
    };

    RQ(Util.format('http://%s:%s/isRoomRunning', serverInfo.privateHost, serverInfo.privatePort), {"form": data}, (err, res, body) => {
        if (err || !res || res.statusCode !== 200 || !body) {
            next(null, false);
            Logger.error('Check Room Running Failed !res:%s code:%s !body: Err ', !res, res.statusCode, !body, err);
            return;
        }

        if (body.code === ErrorCode.Success && body.message.checkserver === Crypto.calcServer()) {
            next(null, true);
            return;
        }

        next(null, false);
        Logger.error('Room On Target Game Server Check Running Error [ %j ]', body);
    });
}

function enterRoomReq(serverInfo, roomId, userId, user, next) {
    let data = {
        roomId: roomId,
        userId: userId,
        user: user,
        checkserver: Crypto.calcServer(roomId, userId, JSON.stringify(user))
    };

    RQ(Util.format('http://%s:%s/enterRoom', serverInfo.privateHost, serverInfo.privatePort), {"form": data}, (err, res, body) => {
        if (err || !res || res.statusCode !== 200 || !body) {
            next(err || new Error('Enter Room Req Return Failure'));
            Logger.error('Check Room Running Failed !res:%s code:%s !body: Err ', !res, res.statusCode, !body, err);
            return;
        }

        if (body.code === ErrorCode.Success && body.message.checkserver === Crypto.calcServer()) {
            next(null, true);
            // todo set_room_id_of_user
            db.set_room_id_of_user(userId, roomId, function (ret) {
                fnCallback(0, {
                    ip: serverInfo.clientip,
                    port: serverInfo.clientport,
                    token: data.token
                });
            });
            return;
        }

        next(body.code === ErrorCode.Success ? new Error('Packet Check Failed') : new Error('Api Return Failure ' + body.code));
        Logger.error('Room On Target Game Server Check Running Error [ %j ]', body);
    });
}

/**
 * 进入房间
 * @param {Number} userId
 * @param {String} roomId
 * @param {Function} next (ERROR, Boolean)
 */
function enterRoom(userId, roomId, next) {

    Async.auto({
        "LoadUserInfo": (cb) => {
            UserModel.userInfo(userId, (err, user) => {
                if (!err) {
                    cb(err);
                    Logger.error('Get Room Info Failed [ %s ]', roomId);
                    return;
                }

                cb(null, user);
            });
        },
        "LoadRoomInfo": (cb) => {
            RoomModel.roomInfo(roomId, function (err, room) {
                if (!err) {
                    cb(err);
                    Logger.error('Get Room Info Failed [ %s ]', roomId);
                    return;
                }

                cb(null, room);
            });
        },
        'LoadServerInfo': ['LoadRoomInfo', (results, cb) => {
            let room = results.LoadRoomInfo;

            let serverId = Crypto.calcServerAddr(room.host, room.port);
            let serverInfo = GameServers[serverId];

            if (!serverInfo) {
                cb(new Error('No Valid Server Run Now'));
                Logger.error('No Valid Server Run Now For [ %s:%s ] [ %j ]', room.host, room.port, GameServers);
                return;
            }

            if (!serverInfo.online) {
                cb(new Error('Server Match Room Is Offline'));
                Logger.error('Server Match Room Is Offline [ %j ] [ %j ]', room, GameServers);
                return;
            }

            cb(null, serverInfo);
        }],
        "IsRoomRunning": ['LoadServerInfo', (results, cb) => {
            let serverInfo = results.LoadServerInfo;

            isRoomRunningReq(serverInfo, roomId, function (err, running) {
                if (err) {
                    cb(err);
                    Logger.error('Get Running Info Of Room Failed ', err);
                    return;
                }
                cb(null, running);
            });
        }]
    }, (err, results) => {
        if (err) {
            next(err);
            return;
        }

        let running = results.IsRoomRunning;
        let room = results.LoadRoomInfo;
        let serverInfo = results.LoadServerInfo;
        let user = results.LoadUserInfo;

        if (!running) {
            next(new Error('Room Is Down'));
            Logger.error('Room Is Down, Info In DB Need To Clean [ %j ]', room);
            return;
        }

        if (room.is_full) {
            next(new Error('Room Is Full'));
            Logger.info('Room Is Full Now, Please Choose Another One');
            return;
        }

        enterRoomReq(serverInfo, roomId, userId, user, next);
    });


}

function isServerOnline(host, port, next) {

    let serverId = Util.format('%s:%s', host, port);
    let serverInfo = GameServers[serverId];

    if (!serverInfo) {
        next(null, false);
        return;
    }

    let data = {
        host: host,
        port: port,
        privateHost: serverInfo.privateHost,
        privatePort: serverInfo.privatePort,
        checkserver: Crypto.calcServer(host, port, serverInfo.privateHost, serverInfo.privatePort)
    };

    RQ.post(Util.format('http://%s:%s/ping', serverInfo.privateHost, serverInfo.privatePort), {"form": data}, function (err, res, body) {
        if (err || !res || res.statusCode !== 200 || !body) {
            next(null, false);
            serverInfo.online = false;
            Logger.error('Load Server Online Status Failed !res:%s code:%s !body: Err ', !res, res.statusCode, !body, err);
            return;
        }

        if (body.code === ErrorCode.Success &&
            body.message.host === host &&
            body.message.port === port &&
            body.message.privateHost === serverInfo.privateHost &&
            body.message.privatePort === serverInfo.privatePort &&
            body.message.checkserver === Crypto.calcServer(body.message.host, body.message.port, body.message.privateHost, body.message.privatePort, data.message.load)
        ) {
            next(null, true);
            serverInfo.online = true;
            serverInfo.load = data.message.load;
            return;
        }

        next(null, false);
        Logger.error('Target Game Server Return Error [ %j ]', body.code);
    });

}

module.exports = {
    createRoom: createRoom,
    enterRoom: enterRoom,
    isServerOnline: isServerOnline
};
