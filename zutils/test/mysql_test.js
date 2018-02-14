/**
 * Created by EasyGame.
 * File: mysql_test.js
 * User: justin
 * Date: 14/2/2018
 * Time: 08:28
 */

'use strict';

const Should = require('chai').should();
const MySQL = require("mysql");
const Logger = require("log4js").getLogger("sql");
const Async = require('async');

const ConfigMySQL = require("../../config/mysqlGame");

let pool = null;

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
        if (err) {
            Logger.error('Load Connection From Pool Failed ', err);
            return next(err);
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

function querys(sqls, next) {

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

            let arr = [];

            sqls.forEach(v => {
                arr.push(function (cb) {
                    let sql = MySQL.format(v.sql, v.param);
                    conn.query(sql, function (err, rows, fields) {
                        if (err) {
                            Logger.error('Transaction Failed %s Err ', sql, err);
                            cb(err);
                            // conn.rollback(function () {
                            //     cb(err);
                            // });
                        } else {
                            Logger.debug('Do Transaction %s Result [ %j ] [ %j ]', sql, rows, fields);
                            cb(null);
                        }
                    });
                });
            });

            Async.series(arr, (err, result) => {
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

describe('ZUtils MySQL', () => {

    before(() => {
        if (pool === null) {
            init();
        }
    });

    after(() => {
        destory();
    });

    it('should pool exist', function () {
        Should.exist(pool);
        pool._closed.should.be.equal(false);
    });

    it('should pool connections', function (done) {
        getConnection((err, conn) => {
            Should.equal(err, null);
            // console.log(conn);
            // console.log(pool);
            done();
        });
    });
});

let poolObject = {
    domain: null,
    _events: {
        acquire: [Function],
        connection: [Function],
        enqueue: [Function],
        release: [Function]
    },
    _eventsCount: 4,
    _maxListeners: undefined,
    // PoolConfig
    config: {
        acquireTimeout: 10000,
        // ConnectionConfig
        connectionConfig: {
            host: 'localhost',
            port: 3306,
            localAddress: undefined,
            socketPath: undefined,
            user: 'root',
            password: '123456',
            database: 'platform',
            connectTimeout: 10000,
            insecureAuth: false,
            supportBigNumbers: false,
            bigNumberStrings: false,
            dateStrings: false,
            debug: undefined,
            trace: true,
            stringifyObjects: false,
            timezone: 'local',
            flags: '',
            queryFormat: undefined,
            pool: [],
            ssl: false,
            multipleStatements: false,
            typeCast: true,
            maxPacketSize: 0,
            charsetNumber: 33,
            clientFlags: 455631
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    },
    _acquiringConnections: [],
    _allConnections: [],
    _freeConnections: [],
    _connectionQueue: [],
    _closed: false
};

let poolConnection = {
    domain: null,
    _events: {
        end: function _removeFromPool() {
        },
        error: function () {
        }
    },
    _eventsCount: 2,
    _maxListeners: undefined,
    // ConnectionConfig
    config: {
        host: 'localhost',
        port: 3306,
        localAddress: undefined,
        socketPath: undefined,
        user: 'root',
        password: '123456',
        database: 'game_demo',
        connectTimeout: 10000,
        insecureAuth: false,
        supportBigNumbers: false,
        bigNumberStrings: false,
        dateStrings: false,
        debug: undefined,
        trace: true,
        stringifyObjects: false,
        timezone: 'local',
        flags: '',
        queryFormat: undefined,
        // Pool
        pool: {
            domain: null,
            _events: [Object],
            _eventsCount: 4,
            _maxListeners: undefined,
            config: [Object],
            _acquiringConnections: [],
            _allConnections: [Object],
            _freeConnections: [],
            _connectionQueue: [],
            _closed: false
        },
        ssl: false,
        multipleStatements: false,
        typeCast: true,
        maxPacketSize: 0,
        charsetNumber: 33,
        clientFlags: 455631,
        protocol41: true
    },
    // Socket
    _socket: {
        connecting: false,
        _hadError: false,
        // TCP
        _handle: {
            bytesRead: 89,
            _externalStream: {},
            fd: 13,
            reading: true,
            owner: [],
            onread: function onread() {
            },
            onconnection: null,
            writeQueueSize: 0
        },
        _parent: null,
        _host: 'localhost',
        // ReadableState
        _readableState: {
            objectMode: false,
            highWaterMark: 16384,
            buffer: [Object],
            length: 0,
            pipes: null,
            pipesCount: 0,
            flowing: true,
            ended: false,
            endEmitted: false,
            reading: false,
            sync: false,
            needReadable: true,
            emittedReadable: false,
            readableListening: false,
            resumeScheduled: false,
            defaultEncoding: 'utf8',
            ranOut: false,
            awaitDrain: 0,
            readingMore: false,
            decoder: null,
            encoding: null
        },
        readable: true,
        domain: null,
        _events: {
            end: [Object],
            finish: function onSocketFinish() {
            },
            _socketEnd: function onSocketEnd() {
            },
            data: [Function],
            error: function bound() {
            },
            connect: function bound() {
            },
        },
        _eventsCount: 6,
        _maxListeners: undefined,
        // WritableState
        _writableState: {
            objectMode: false,
            highWaterMark: 16384,
            needDrain: false,
            ending: false,
            ended: false,
            finished: false,
            decodeStrings: false,
            defaultEncoding: 'utf8',
            length: 0,
            writing: false,
            corked: 0,
            sync: false,
            bufferProcessing: false,
            onwrite: [Function],
            writecb: null,
            writelen: 0,
            bufferedRequest: null,
            lastBufferedRequest: null,
            pendingcb: 0,
            prefinished: false,
            errorEmitted: false,
            bufferedRequestCount: 0,
            corkedRequestsFree: [Object]
        },
        writable: true,
        allowHalfOpen: false,
        destroyed: false,
        _bytesDispatched: 72,
        _sockname: null,
        _pendingData: null,
        _pendingEncoding: '',
        server: null,
        _server: null,
        _idleTimeout: -1,
        _idleNext: null,
        _idlePrev: null,
        _idleStart: 832,
        read: [Function],
        _consuming: true
    },
    // Protocol
    _protocol: {
        domain: null,
        _events:
            {
                data: [Function],
                end: [Object],
                handshake: function bound_handleProtocolHandshake() {
                },
                unhandledError: function bound() {
                },
                drain: function bound() {
                },
                enqueue: function bound_handleProtocolEnqueue() {
                },
            },
        _eventsCount: 6,
        _maxListeners: undefined,
        readable: true,
        writable: true,
        // ConnectionConfig
        _config: {
            host: 'localhost',
            port: 3306,
            localAddress: undefined,
            socketPath: undefined,
            user: 'root',
            password: '123456',
            database: 'game_demo',
            connectTimeout: 10000,
            insecureAuth: false,
            supportBigNumbers: false,
            bigNumberStrings: false,
            dateStrings: false,
            debug: undefined,
            trace: true,
            stringifyObjects: false,
            timezone: 'local',
            flags: '',
            queryFormat: undefined,
            pool: [Object],
            ssl: false,
            multipleStatements: false,
            typeCast: true,
            maxPacketSize: 0,
            charsetNumber: 33,
            clientFlags: 455631,
            protocol41: true
        },
        _connection: [],
        _callback: null,
        _fatalError: null,
        _quitSequence: null,
        _handshake: true,
        _handshaked: true,
        _ended: false,
        _destroyed: false,
        _queue: [[Object]],
        // HandshakeInitializationPacket
        _handshakeInitializationPacket: {
            protocolVersion: 10,
            serverVersion: '5.7.19',
            threadId: 137,
            scrambleBuff1: "Buffer 2f 6b 2b 08 76 43 07 07",
            filler1: "Buffer 00",
            serverCapabilities1: 63487,
            serverLanguage: 8,
            serverStatus: 2,
            serverCapabilities2: 33279,
            scrambleLength: 21,
            filler2: "Buffer 00 00 00 00 00 00 00 00 00 00",
            scrambleBuff2: "Buffer 10 47 32 6f 3a 6e 6c 37 14 72 79 1c",
            filler3: "Buffer 00",
            pluginData: 'mysql_native_password',
            protocol41: true
        },
        // Parser
        _parser: {
            _supportBigNumbers: false,
            _buffer: "Buffer 07 00 00 02 00 00 00 02 00 00 00",
            _nextBuffers: [Object],
            _longPacketBuffers: [Object],
            _offset: 11,
            _packetEnd: 11,
            _packetHeader: [Object],
            _packetOffset: 4,
            _onError: function bound_handleParserError() {
            },
            _onPacket: function bound() {
            },
            _nextPacketNumber: 3,
            _encoding: 'utf-8',
            _paused: false
        }
    },
    _connectCalled: true,
    state: 'authenticated',
    threadId: 137,
    // Pool
    _pool: {
        domain: null,
        _events: {
            acquire: [Function],
            connection: [Function],
            enqueue: [Function],
            release: [Function]
        },
        _eventsCount: 4,
        _maxListeners: undefined,
        // PoolConfig
        config: {
            acquireTimeout: 10000,
            connectionConfig: [Object],
            waitForConnections: true,
            connectionLimit: 50,
            queueLimit: 0
        },
        _acquiringConnections: [],
        _allConnections: [[]],
        _freeConnections: [],
        _connectionQueue: [],
        _closed: false
    }
};
