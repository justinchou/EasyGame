/**
 * Created by EasyGame.
 * File: account.model.js
 * User: justin
 * Date: 3/2/2018
 * Time: 18:57
 */

'use strict';

const MySQL = require("mysql");
const Util = require("util");
const Logger = require("log4js").getLogger("sql");
const Crypto = require('../../zutils/Crypto');

let config = require("../../config/mysql_account");

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
    pool = MySQL.createPool(config);
    Logger.warn("Pool Created");
}

/**
 * Fetch Connection From Pool
 * @param {Function} next (ERROR, Connection Object)
 */
function getConnection(next) {
    pool.getConnection(function (err, conn) {
        if (err) {
            console.error(err);
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
        if (err) {
            Logger.error('Load Connection From Pool Failed ', err);
            return next(err);
        }
        conn.query(sql, function (err, rows, fields) {
            returnConnection(conn);
            Logger.debug('Execute SQL: %s Return [ %j ] [ %j ]', sql, rows, fields);
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
    if (pool) {
        pool.end(function (err) {
            Logger.warn("Pool Closed ", err);
        });
    }
}


/**
 * Check If Account Exist
 * @param {String} account
 * @param {Function} next (ERROR, Boolean)
 */
function existAccount(account, next) {
    if (!account) {
        next(new Error('Invalid Params'));
        Logger.error('get exist account params [ %j ]', arguments);
        return;
    }

    let sql = MySQL.format('SELECT * FROM `account` WHERE `account` = ?', [account]);
    query(sql, (err, rows) => {
        if (err) {
            next(err);
        } else if (rows && rows.length > 0) {
            next(null, true);
        } else {
            next(null, false);
        }
    });
}

/**
 * Create Account With Password Encrypted With Md5
 * @param {String} account
 * @param {String} password
 * @param {Function} next (ERROR, Boolean)
 */
function createAccount(account, password, next) {
    if (!account || !password || typeof account !== 'string' || typeof password !== 'string') {
        next(new Error('Invalid Params'));
        Logger.error('create account params [ %j ]', arguments);
        return;
    }

    let pwd = Crypto.md5(password);
    let sql = MySQL.format('INSERT INTO `account` (`account`, `password`) VALUES (?, ?)', [account, pwd]);
    query(sql, function (err, rows) {
        if (err) {
            next(err);

            if (err.code !== 'ER_DUP_ENTRY') {
                throw err;
            }
        } else {
            next(null, true);
        }
    });
}

/**
 * Load Account Info
 *
 * accountInfo(account, next) : donnot verify password
 * accountInfo(account, password, next) : verify password
 *
 * @param {String} account
 * @param {String|Function} password
 * @param {Function=} next (ERROR, Account Object)
 */
function accountInfo(account, password, next) {
    if (arguments.length === 2) {
        next = password;
        password = "";
    }

    if (!account || typeof account !== 'string') {
        next(new Error('Invalid Params'));
        Logger.error('load account params [ %j ]', arguments);
        return;
    }

    let sql = MySQL.format('SELECT * FROM `account` WHERE `account` = ?', [account]);
    query(sql, function (err, rows, fields) {
        if (err) {
            next(err);
            throw err;
        } else if (rows && rows.length === 0) {
            next(new Error('Account Not Exist'));
        } else {
            if (password) {
                let pwd = Crypto.md5(password);
                if (rows[0].password !== pwd) {
                    next(new Error('Wrong Password'));
                } else {
                    next(null, rows[0]);
                }
            } else {
                next(null, rows[0]);
            }
        }
    });
}

/**
 * Update Password
 * @param {String} account
 * @param {String} password
 * @param {Function} next (ERROR, Boolean)
 */
function updatePassword(account, password, next) {
    if (!account || !password || typeof account !== 'string' || typeof password !== 'string') {
        next(new Error('Invalid Params'));
        Logger.error('create account params [ %j ]', arguments);
        return;
    }

    let pwd = Crypto.md5(password);
    let sql = MySQL.format('UPDATE `account` SET `password` = ? WHERE `account` = ?', [pwd, account]);

    query(sql, function (err, rows) {
        if (err) {
            next(err);
        } else if (!rows || rows.affectedRows <= 0) {
            next(new Error('Account Not Exist'));
        } else {
            next(null, true);
        }
    });
}

/**
 * Link UserId Onto Account
 * @param {String} account
 * @param {Number} userid
 * @param {Boolean|Function} force true:当用户已绑定账号仍然强制绑定, false:仅当用户从未绑定账号时绑定
 * @param {Function=} next (ERROR, Boolean)
 */
function linkUserId(account, userid, force, next) {
    if (arguments.length === 3) {
        next = force;
        force = false;
    }

    if (!account || !userid || typeof account !== 'string' || typeof userid !== 'string') {
        next(new Error('Invalid Params'));
        Logger.error('create account params [ %j ]', arguments);
        return;
    }

    let sql;
    if (force) {
        sql = MySQL.format('UPDATE `account` SET `userid` = ? WHERE `account` = ?', [userid, account]);
    } else {
        sql = MySQL.format('UPDATE `account` SET `userid` = ? WHERE `account` = ? AND `userid` = ?', [userid, account, 0]);
    }

    query(sql, function (err, rows) {
        if (err) {
            next(err);
        } else if (!rows || rows.affectedRows <= 0) {
            next(new Error('Account Not Exist'));
        } else {
            next(null, true);
        }
    });
}


module.exports = {
    "init": init,
    "getConnection": getConnection,
    'query': query,
    "returnConnection": returnConnection,
    "destory": destory,

    "existAccount": existAccount,
    "createAccount": createAccount,
    "accountInfo": accountInfo,
    "updatePassword": updatePassword,
    "linkUserId": linkUserId
};