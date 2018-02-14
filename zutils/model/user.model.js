/**
 * Created by EasyGame.
 * File: user.model.js
 * User: justin
 * Date: 3/2/2018
 * Time: 20:44
 */

'use strict';

const MySQL = require("mysql");
const Logger = require("log4js").getLogger("sql");
const Crypto = require('../utils/crypto');

const ConfigMySQL = require("../../config/mysqlPlatform");
const ConfigUserInitInfo = require("../../config/platform").userInitInfo;

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
            Logger.error('Get Connection Failed', err);
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
 * Check If User Exist
 * @param {Number} userId
 * @param {Function} next (ERROR, Boolean)
 */
function existUser(userId, next) {
    if (!userId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist userId params [ %j ]', arguments);
        return;
    }

    let sql = MySQL.format('SELECT userId FROM `user` WHERE userId = ?', [userId]);
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
 * Load User Info
 * @param {Number} userId
 * @param {Function} next (ERROR, UserInfo)
 */
function userInfo(userId, next) {
    if (!userId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist userId params [ %j ]', arguments);
        return;
    }

    let sql = MySQL.format(
        'SELECT `userId`,`nickname`,`lv`,`exp`,`coins`,`gems`,`gender`,`headimg` FROM `user` WHERE `userId` = ? LIMIT 1',
        [userId]
    );
    query(sql, function (err, rows) {
        if (err) {
            next(err);
            throw err;
        } else if (!rows || rows.length === 0) {
            next(new Error('No User ' + userId));
            return;
        }

        rows[0].nickname = Crypto.fromBase64(rows[0].nickname);
        next(null, rows[0]);
    });
}

/**
 * User Base Info - Public Info
 * @param {Number} userId
 * @param {Function} next (ERROR, BaseUserInfo)
 */
function userPubInfo(userId, next) {
    userInfo(userId, (err, info) => {
        if (err) {
            next(err);
        } else {
            next(null, {
                "userId": userId,
                "nickname": info.nickname,
                "gender": info.gender,
                "headimg": info.headimg
            });
        }
    });
}

/**
 * Get Gem
 * @param {Number} userId
 * @param {Function} next (ERROR, BaseUserInfo)
 */
function userPriInfo(userId, next) {
    userInfo(userId, (err, info) => {
        if (err) {
            next(err);
        } else {
            next(null, {
                "userId": userId,
                "lv": info.lv,
                "exp": info.exp,
                "coins": info.coins,
                "gems": info.gems
            });
        }
    });
}

/**
 * Create User Info
 * @param {String} nickname
 * @param {Number} gender  0: male, 1: female, 2: other
 * @param {String|Function} headimg
 * @param {Function=} next (ERROR, Number)
 */
function createUser(nickname, gender, headimg, next) {
    if (arguments.length === 3) {
        next = headimg;
        headimg = 'null';
    }

    nickname = Crypto.toBase64(nickname);

    let sql = MySQL.format(
        'INSERT INTO `user` (`nickname`,`lv`,`exp`,`coins`,`gems`,`gender`,`headimg`) VALUES(?,?,?,?,?,?,?)',
        [nickname, ConfigUserInitInfo.lv, ConfigUserInitInfo.exp, ConfigUserInitInfo.coins, ConfigUserInitInfo.gems, gender, headimg]
    );
    query(sql, function (err, rows) {
        if (err) {
            next(err);
            throw err;
        } else {
            next(null, rows.insertId);
        }
    });
}

/**
 * Update User Info
 * @param {Number} userId
 * @param {String} nickname
 * @param {Number} gender  0: male, 1: female, 2: other
 * @param {String|Function} headimg
 * @param {Function=} next (ERROR, Boolean)
 */
function updateUser(userId, nickname, gender, headimg, next) {
    if (arguments.length === 4) {
        next = headimg;
        headimg = '';
    }

    if (!userId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist userId params [ %j ]', arguments);
        return;
    }

    nickname = Crypto.toBase64(nickname);

    let sql;
    if (!headimg) {
        sql = MySQL.format(
            'UPDATE `user` SET `nickname` = ?, `gender` = ? WHERE `userId` = ?',
            [nickname, gender, userId]
        );
    } else {
        sql = MySQL.format(
            'UPDATE `user` SET `nickname` = ?, `gender` = ?, `headimg` = ? WHERE `userId` = ?',
            [nickname, gender, headimg, userId]
        );
    }

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
 * Add Gem
 * @param {Number} userId
 * @param {Number} gems  must be positive
 * @param {Function} next (ERROR, Boolean)
 */
function addGems(userId, gems, next) {
    if (!userId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist userId params [ %j ]', arguments);
        return;
    }

    if (gems <= 0) {
        Logger.warn('Add Gems But Gems Value Negative [ %s ]', gems);
    }

    let sql = MySQL.format('UPDATE `user` SET `gems` = `gems` + ? WHERE `userId` = ?', [gems, userId]);
    query(sql, function (err, rows) {
        if (err) {
            next(err);
            throw err;
        }

        next(null, rows.affectedRows > 0);
    });
}

/**
 * Minus Gem
 * @param {Number} userId
 * @param {Number} gems  must be positive
 * @param {Function} next (ERROR, Boolean)
 */
function costGems(userId, gems, next) {
    if (gems < 0) gems = -gems;

    let sql = MySQL.format('UPDATE `user` SET `gems` = `gems` - ? WHERE `userId` = ?', [gems, userId]);
    query(sql, function (err, rows) {
        if (err) {
            next(err);
            throw err;
        }

        next(null, rows.affectedRows > 0);
    });
}

/**
 * Add Coins
 * @param {Number} userId
 * @param {Number} coins  must be positive
 * @param {Function} next (ERROR, Boolean)
 */
function addCoins(userId, coins, next) {
    if (!userId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist userId params [ %j ]', arguments);
        return;
    }

    if (coins <= 0) {
        Logger.warn('Add Coins But Gems Value Negative [ %s ]', coins);
    }

    let sql = MySQL.format('UPDATE `user` SET `coins` = `coins` + ? WHERE `userId` = ?', [coins, userId]);
    query(sql, function (err, rows) {
        if (err) {
            next(err);
            throw err;
        }

        next(null, rows.affectedRows > 0);
    });
}

/**
 * Minus Gems
 * @param {Number} userId
 * @param {Number} coins  must be positive
 * @param {Function} next (ERROR, Boolean)
 */
function costCoins(userId, coins, next) {
    if (coins < 0) coins = -coins;

    let sql = MySQL.format('UPDATE `user` SET `coins` = `coins` - ? WHERE `userId` = ?', [coins, userId]);
    query(sql, function (err, rows) {
        if (err) {
            next(err);
            throw err;
        }

        next(null, rows.affectedRows > 0);
    });
}

/**
 * Add Lv
 * @param {Number} userId
 * @param {Number} lv  must be positive
 * @param {Function} next (ERROR, Boolean)
 */
function addLv(userId, lv, next) {
    if (!userId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist userId params [ %j ]', arguments);
        return;
    }

    if (lv <= 0) {
        Logger.warn('Add Lv But Gems Value Negative [ %s ]', lv);
    }

    let sql = MySQL.format('UPDATE `user` SET `lv` = `lv` + ? WHERE `userId` = ?', [lv, userId]);
    query(sql, function (err, rows) {
        if (err) {
            next(err);
            throw err;
        }

        next(null, rows.affectedRows > 0);
    });
}

/**
 * Add Exp
 * @param {Number} userId
 * @param {Number} exp  must be positive
 * @param {Function} next (ERROR, Boolean)
 */
function addExp(userId, exp, next) {
    if (!userId) {
        next(new Error('Invalid Params'));
        Logger.error('get exist userId params [ %j ]', arguments);
        return;
    }

    if (exp <= 0) {
        Logger.warn('Add Gems But Gems Value Negative [ %s ]', exp);
    }

    let sql = MySQL.format('UPDATE `user` SET `exp` = `exp` + ? WHERE `userId` = ?', [exp, userId]);
    query(sql, function (err, rows) {
        if (err) {
            next(err);
            throw err;
        }

        next(null, rows.affectedRows > 0);
    });
}

module.exports = {
    "init": init,
    "getConnection": getConnection,
    'query': query,
    "returnConnection": returnConnection,
    "destory": destory,

    "existUser": existUser,

    "userInfo": userInfo,
    "userPubInfo": userPubInfo,
    "userPriInfo": userPriInfo,
    "createUser": createUser,
    "updateUser": updateUser,

    "addGems": addGems,
    "costGems": costGems,
    "addCoins": addCoins,
    "costCoins": costCoins,
    "addLv": addLv,
    "addExp": addExp,
};
