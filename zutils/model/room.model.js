/**
 * Created by EasyGame.
 * File: room.model.js
 * User: justin
 * Date: 12/2/2018
 * Time: 07:16
 */

'use strict';

const MySQL = require("mysql");
const Logger = require("log4js").getLogger("sql");
const Crypto = require('../utils/crypto');
const Async = require('async');

const ConfigMySQL = require("../../config/mysqlGame");

let pool = null;

(function () {
    if (pool === null) {
        init();
    }
})();


/**
 * Connect To MySQL, Create Connection Pool
 */
function init() {
    pool = MySQL.createPool(ConfigMySQL);
    Logger.warn("Pool Created");
    pool.on('acquire', function (connection) {
        // console.log('Connection %d acquired', connection.threadId);
    });
    pool.on('connection', function (connection) {
        // console.log('Connection %d connected', connection.threadId);
    });
    pool.on('enqueue', function () {
        // console.log('Waiting for available connection slot');
    });
    pool.on('release', function (connection) {
        // console.log('Connection %d released', connection.threadId);
    });
}

/**
 * Fetch Connection From Pool
 * @param {Function} next (ERROR, Connection Object)
 */
function getConnection(next) {
    if (!pool || pool._closed) {
        init();
    }

    pool.getConnection(function (err, conn) {
        if (err) {
            Logger.error("Get Connection Error ", err);
            return next(err);
        }
        next(null, conn);
        Logger.debug("Connection Fetched");
    });
}

/**
 * Return Connection BackTo Pool
 * @param {Object} conn Connection Object
 */
function returnConnection(conn) {
    if (conn) {
        conn.release();
        Logger.debug("Connection Returned");
    }
}

/**
 * Do Query
 * @param {String} sql Pure String Or MySQL.format String
 * @param {Function} next (ERROR, DBReturn Object, Extras Object || Null)
 */
function query(sql, next) {
    getConnection((err, conn) => {
        if (err || !conn) {
            next(err || new Error('Connection Invalid'));
            Logger.error('Get Connection From Pool Failed ', err || new Error('Connection Invalid'));
            return;
        }
        conn.query(sql, function (err, rows, fields) {
            returnConnection(conn);
            Logger.info('Execute SQL: %s Return [ %j ] [ %j ]', sql, rows, fields);
            if (err) {
                Logger.error('Execute SQL: %s Error: ', sql, err);
            }
            next(err, rows, fields);
        });
    });
}

/**
 * DisConnect From MySQL, Close All Connections
 */
function destory() {
    if (pool && !pool._closed) {
        pool.end(function (err) {
            Logger.warn("Pool Closed ", err);
        });
    }
}


/**
 * Check If Room Exist
 * @param {String} roomId
 * @param {Function} next (ERROR, Boolean)
 */
function existRoom(roomId, next) {
    if (!roomId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist roomId params [ %j ]', arguments);
        return;
    }

    let sql = MySQL.format('SELECT roomId FROM `room` WHERE roomId = ?', [roomId]);
    query(sql, (err, rows) => {
        if (err) {
            next(null, true);
        } else if (rows && rows.length > 0) {
            next(null, true);
        } else {
            next(null, false);
        }
    });
}

/**
 * Load Room Raw Info
 * @param {String} roomId
 * @param {Function} next (ERROR, RoomRawInfo)
 */
function roomRawInfo(roomId, next) {
    if (!roomId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist roomId params [ %j ]', arguments);
        return;
    }

    let sql = MySQL.format(
        'SELECT `uuid`,`roomId`,`create_time`,`finish_time`,`config`,`max_users`,`cur_users`,`min_users`,`playing`,`data`,`turns`,`nexts`,`host`,`port` FROM `room` WHERE `roomId` = ? LIMIT 1',
        [roomId]
    );
    query(sql, function (err, rows) {
        if (err) {
            next(err);
            throw err;
        } else if (!rows || rows.length === 0) {
            next(new Error('No Room ' + roomId));
            return;
        }

        rows[0].config = JSON.parse(rows[0].config);
        rows[0].data = JSON.parse(rows[0].data);

        for (let i = 0; i < rows[0].data.length; i++) {
            rows[0].data[i].nickname = Crypto.fromBase64(rows[0].data[i].nickname);
        }
        next(null, rows[0]);
    });
}

/**
 * Load Room Info
 * @param {String} roomId
 * @param {Function} next (ERROR, RoomInfo)
 */
function roomInfo(roomId, next) {
    roomRawInfo(roomId, (err, info) => {
        if (err) {
            next(err);
        } else {
            next(null, {
                "uuid": info.uuid,
                "roomId": roomId,
                "is_full": info.cur_users >= info.max_users,
                "can_start": info.cur_users >= info.min_users,
                "is_playing": info.playing,
                "config": info.config,
                "data": info.data,
                "turns": info.turns,
                "next": info.next,
                "host": info.host,
                "port": info.port
            });
        }
    });
}

/**
 * 随机生成房间号, 然后校验该房间当前是否存在
 *
 * @private
 * @param {Number} len 房间号长度, 一般 6-11位
 * @param {Function} next (ERROR, Number)
 */
function generateRoomId(len, next) {
    if (len >= 11) {
        return next(new Error('No Room Id Valid!'));
    }

    let roomId = "";
    for (let i = 0; i < len; ++i) {
        roomId += Math.floor(Math.random() * 10);
    }

    existRoom(roomId, function (err, exist) {
        if (err || exist) {
            return generateRoomId(len + 1, next);
        }
        next(null, roomId);
    });
}

/**
 * Create Room Info
 * @param {Number} userId
 * @param {Object} userInfo
 * @param {Object} roomInfo
 * @param {Object} gameInfo
 * @param {Function} next (ERROR, {uuid, roomId})
 */
function createRoom(userId, userInfo, roomInfo, gameInfo, next) {
    userInfo.nickname = Crypto.toBase64(userInfo.nickname);

    generateRoomId(6, (err, roomId) => {
        if (err || !roomId) {
            next(err);
            Logger.error('No Valid RoomId ', err);
            return;
        }

        let uuid = Crypto.calcUUID();
        let sql = MySQL.format(
            'INSERT INTO `room` (`uuid`,`roomId`,`create_time`,`finish_time`,' +
            '`config`,`max_users`,`cur_users`,`min_users`,`playing`,' +
            '`data`,`turns`,`nexts`,`host`,`port`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [uuid, roomId, Math.floor(Date.now() / 1000), 0,
                JSON.stringify(roomInfo), roomInfo.max_users, 1, roomInfo.min_users, 0,
                JSON.stringify([userInfo]), 0, 0, gameInfo.host, gameInfo.port]
        );
        query(sql, function (err, rows) {
            if (err) {
                next(err);
                Logger.error('Create Room Failed Error ', err);
                return;
            }

            if (rows.affectedRows !== 1) {
                next(new Error('Affect Rows Invalid ' + rows.affectedRows));
                Logger.error("Create Room Return [ %j ]", rows);
                return;
            }

            next(null, {"uuid": uuid, "roomId": roomId});
        });

    });
}

/**
 * 更新房间信息
 *
 * @private
 * @param {String} roomId
 * @param {Object} roomInfo
 * @param {Function} next (ERROR, Boolean)
 */
function updateRoom(roomId, roomInfo, next) {
    let keys = Object.keys(roomInfo);
    let sql = MySQL.format('UPDATE `room` SET ?? = ? WHERE `roomId` = ?', [keys[0], roomInfo[keys[0]], roomId]);
    query(sql, function (err, rows) {
        if (err) {
            next(err);
            throw err;
        } else {
            next(null, rows.affectedRows === 1);
        }
    });
}

/**
 *
 * @param {String} roomId
 * @param {Number} turns
 * @param {Function} next (ERROR, Boolean)
 */
function updateTurns(roomId, turns, next) {
    updateRoom(roomId, {"turns": turns}, next);
}

/**
 *
 * @param {String} roomId
 * @param {Number} nexts
 * @param {Function} next (ERROR, Boolean)
 */
function updateNexts(roomId, nexts, next) {
    updateRoom(roomId, {"nexts": nexts}, next);
}

/**
 * 进入房间
 * @param {String} roomId
 * @param {Number} userId
 * @param {Object} userInfo
 * @param {Function} next
 */
function enterRoom(roomId, userId, userInfo, next) {
    if (!roomId || !userId || !userInfo || userInfo.userId !== userId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist roomId params [ %j ]', arguments);
        return;
    }

    getConnection((err, conn) => {
        if (err) {
            Logger.error('Load Connection From Pool Failed ', err);
            return next(err);
        }

        conn.beginTransaction((err) => {
            if (err) {
                Logger.error('Start Transaction Failed ', err);
                return next(err);
            }

            Async.waterfall([
                (cb) => {
                    let sql = MySQL.format(
                        'SELECT `uuid`,`roomId`,`create_time`,`finish_time`,`config`,`max_users`,`cur_users`,`min_users`,`playing`,`data`,`turns`,`nexts`,`host`,`port` FROM `room` WHERE `roomId` = ? LIMIT 1',
                        [roomId]
                    );
                    conn.query(sql, (err, rows, fields) => {
                        if (err) {
                            Logger.error('Load Userinfo From DB Failed With Error ', err);
                            cb(err);
                            return;
                        }
                        if (rows.length <= 0) {
                            Logger.warn('Room Not Exist Any More');
                            cb(new Error('Room Not Exist'));
                            return;
                        }

                        let config, data;
                        try {
                            config = JSON.parse(rows[0].config);
                            data = JSON.parse(rows[0].data);
                        } catch (e) {
                            Logger.error('Parse JSON From DB Failed, Data Ruined [ %s ] [ %s ]', rows[0].config, rows[0].data);
                            cb(new Error('Parse JSON From DB Failed'));
                            return;
                        }

                        rows[0].config = config;
                        rows[0].data = data;
                        cb(null, rows[0]);
                    });
                },
                (room, cb) => {
                    room.data.push(userInfo);
                    let sql = MySQL.format('UPDATE `room` SET `data` = ?, `cur_users` = ? WHERE `uuid` = ? AND `roomId` = ?', [JSON.stringify(room.data), room.data.length, room.uuid, room.roomId]);
                    conn.query(sql, (err, rows, fields) => {
                        if (err) {
                            Logger.error('Write UserInfo Into DB Failed Error ', err);
                            cb(err);
                            return;
                        }
                        if (rows.affectedRows !== 1) {
                            Logger.error('Update UserInfo Into DB Failed With Return [ %s ] [ %j ]', sql, rows);
                            cb(new Error('Affected Rows Error ' + rows.affectedRows));
                            return;
                        }

                        cb(null);
                    });
                }
            ], (err, result) => {
                if (err) {
                    Logger.error("Transaction Error ", err);
                    conn.rollback(function (err) {
                        if (err) {
                            Logger.error("Transaction Rollback Error ", err);
                        } else {
                            Logger.debug("Transaction Rollback Success");
                        }
                        returnConnection(conn);
                        next(new Error('Transaction Error ' + (err ? 'And Rollback Error' : '')));
                    });
                    return;
                }

                Logger.debug("Transaction Success Result [ %j ]", result);
                conn.commit(function (err, info) {
                    if (err) {
                        Logger.error("Transaction Commit Error ", err);
                        conn.rollback(function (err) {
                            if (err) {
                                Logger.error("Transaction Rollback Error After Commit Error ", err);
                            } else {
                                Logger.debug("Transaction Rollback Success");
                            }
                            returnConnection(conn);
                            next(new Error('Transaction Commit Error ' + (err ? 'And Rollback Error' : '')));
                        });
                        return;
                    }

                    returnConnection(conn);
                    Logger.debug('Enter Room Success [ %j ]', info);
                    return next(null, info);

                });

            });
        });
    });
}

/**
 * 退出房间
 * @param {String} roomId
 * @param {Number} userId
 * @param {Object} userInfo
 * @param {Function} next
 */
function leaveRoom(roomId, userId, userInfo, next) {
    if (!roomId || !userId || !userInfo || userInfo.userId !== userId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist roomId params [ %j ]', arguments);
        return;
    }

    getConnection((err, conn) => {
        if (err) {
            Logger.error('Load Connection From Pool Failed ', err);
            return next(err);
        }

        conn.beginTransaction((err) => {
            if (err) {
                Logger.error('Start Transaction Failed ', err);
                return next(err);
            }

            Async.waterfall([
                (cb) => {
                    let sql = MySQL.format(
                        'SELECT `uuid`,`roomId`,`create_time`,`finish_time`,`config`,`max_users`,`cur_users`,`min_users`,`playing`,`data`,`turns`,`nexts`,`host`,`port` FROM `room` WHERE `roomId` = ? LIMIT 1',
                        [roomId]
                    );
                    conn.query(sql, (err, rows, fields) => {
                        if (err) {
                            Logger.error('Load Userinfo From DB Failed With Error ', err);
                            cb(err);
                            return;
                        }
                        if (rows.length <= 0) {
                            Logger.warn('Room Not Exist Any More');
                            cb(new Error('Room Not Exist'));
                            return;
                        }

                        let config, data;
                        try {
                            config = JSON.parse(rows[0].config);
                            data = JSON.parse(rows[0].data);
                        } catch (e) {
                            Logger.error('Parse JSON From DB Failed, Data Ruined [ %s ] [ %s ]', rows[0].config, rows[0].data);
                            cb(new Error('Parse JSON From DB Failed'));
                            return;
                        }

                        rows[0].config = config;
                        rows[0].data = data;
                        cb(null, rows[0]);
                    });
                },
                (room, cb) => {
                    for (let i = 0; i < room.data.length; i++) {
                        if (userInfo.userId === room.data[i].userId) {
                            room.data.splice(i, 1);
                            break;
                        }
                    }

                    let sql = MySQL.format('UPDATE `room` SET `data` = ?, `cur_users` = ? WHERE `uuid` = ? AND `roomId` = ?', [JSON.stringify(room.data), room.data.length, room.uuid, room.roomId]);
                    conn.query(sql, (err, rows, fields) => {
                        if (err) {
                            Logger.error('Write UserInfo Into DB Failed Error ', err);
                            cb(err);
                            return;
                        }
                        if (rows.affectedRows !== 1) {
                            Logger.error('Update UserInfo Into DB Failed With Return [ %s ] [ %j ]', sql, rows);
                            cb(new Error('Affected Rows Error ' + rows.affectedRows));
                            return;
                        }

                        cb(null);
                    });
                }
            ], (err, result) => {
                if (err) {
                    Logger.error("Transaction Error ", err);
                    conn.rollback(function (err) {
                        if (err) Logger.error("Transaction Rollback Error ", err);
                        returnConnection(conn);
                        next(new Error('Transaction Error ' + (err ? 'And Rollback Error' : '')));
                    });
                    return;
                }

                Logger.debug("Transaction Success Result [ %j ]", result);
                conn.commit(function (err, info) {
                    if (err) {
                        Logger.error("Transaction Commit Error ", err);
                        conn.rollback(function (err) {
                            if (err) Logger.error("Transaction Rollback Error After Commit Error ", err);
                            returnConnection(conn);
                            next(new Error('Transaction Commit Error ' + (err ? 'And Rollback Error' : '')));
                        });
                        return;
                    }

                    returnConnection(conn);
                    Logger.debug('Leave Room Success [ %j ]', info);
                    return next(null, info);

                });

            });
        });
    });
}

/**
 * 删除房间
 * @param {String} roomId
 * @param {Function} next
 */
function deleteRoom(roomId, next) {
    if (!roomId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist roomId params [ %j ]', arguments);
        return;
    }

    getConnection((err, conn) => {
        if (err) {
            Logger.error('Load Connection From Pool Failed ', err);
            return next(err);
        }

        conn.beginTransaction((err) => {
            if (err) {
                Logger.error('Start Transaction Failed ', err);
                return next(err);
            }

            Async.waterfall([
                (cb) => {
                    let sql = MySQL.format(
                        'SELECT `uuid`,`roomId`,`create_time`,`finish_time`,`config`,`max_users`,`cur_users`,`min_users`,`playing`,`data`,`turns`,`nexts`,`host`,`port` FROM `room` WHERE `roomId` = ? LIMIT 1',
                        [roomId]
                    );
                    conn.query(sql, (err, rows, fields) => {
                        if (err) {
                            Logger.error('Load Userinfo From DB Failed With Error ', err);
                            cb(err);
                            return;
                        }
                        if (rows.length <= 0) {
                            Logger.warn('Room Not Exist Any More');
                            cb(new Error('Room Not Exist'));
                            return;
                        }

                        cb(null, rows[0]);
                    });
                },
                (room, cb) => {
                    let sql = MySQL.format(
                        'INSERT INTO `room_archive` (`uuid`,`roomId`,`create_time`,`finish_time`,' +
                        '`config`,`max_users`,`cur_users`,`min_users`,`playing`,' +
                        '`data`,`turns`,`nexts`,`host`,`port`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                        [room.uuid, room.roomId, room.create_time, Math.floor(Date.now() / 1000),
                            room.config, room.max_users, room.cur_users, room.min_users, room.playing,
                            room.data, room.turns, room.nexts, room.host, room.port]
                    );
                    conn.query(sql, (err, rows, fields) => {
                        if (err) {
                            Logger.error('Rewrite Data Into DB Failed Error ', err);
                            cb(err);
                            return;
                        }
                        if (rows.affectedRows !== 1) {
                            Logger.error('Rewrite Data Into DB Failed With Return [ %s ] [ %j ]', sql, rows);
                            cb(new Error('Affected Rows Error ' + rows.affectedRows));
                            return;
                        }

                        cb(null, room);
                    });
                },
                (room, cb) => {
                    let sql = MySQL.format('DELETE FROM `room` WHERE `uuid` = ? AND `roomId` = ? LIMIT 1', [room.uuid, room.roomId]);
                    conn.query(sql, (err, rows, fields) => {
                        if (err) {
                            Logger.error('Remove Data From DB Failed Error ', err);
                            cb(err);
                            return;
                        }
                        if (rows.affectedRows !== 1) {
                            Logger.error('Remove Data From DB Failed With Return [ %s ] [ %j ]', sql, rows);
                            cb(new Error('Affected Rows Error ' + rows.affectedRows));
                            return;
                        }

                        cb(null);
                    });
                }
            ], (err, result) => {
                if (err) {
                    Logger.error("Transaction Error ", err);
                    conn.rollback(function (err) {
                        if (err) Logger.error("Transaction Rollback Error ", err);
                        returnConnection(conn);
                        next(new Error('Transaction Error ' + (err ? 'And Rollback Error' : '')));
                    });
                    return;
                }

                Logger.debug("Transaction Success Result [ %j ]", result);
                conn.commit(function (err, info) {
                    if (err) {
                        Logger.error("Transaction Commit Error ", err);
                        conn.rollback(function (err) {
                            if (err) Logger.error("Transaction Rollback Error After Commit Error ", err);
                            returnConnection(conn);
                            next(new Error('Transaction Commit Error ' + (err ? 'And Rollback Error' : '')));
                        });
                        return;
                    }

                    returnConnection(conn);
                    return next(null, info);

                });

            });
        });
    });
}

module.exports = {
    "init": init,
    "getConnection": getConnection,
    'query': query,
    "returnConnection": returnConnection,
    "destory": destory,

    "generateRoomId": generateRoomId,
    "updateRoom": updateRoom,

    "existRoom": existRoom,
    "roomRawInfo": roomRawInfo,
    "roomInfo": roomInfo,
    "createRoom": createRoom,
    "updateTurns": updateTurns,
    "updateNexts": updateNexts,
    "enterRoom": enterRoom,
    "leaveRoom": leaveRoom,
    "deleteRoom": deleteRoom
};
