/**
 * Created by EasyGame.
 * File: app.js
 * User: justin
 * Date: 3/2/2018
 * Time: 12:02
 */

'use strict';

const Express = require('express');
const Path = require('path');
const Log4JS = require('log4js');
Log4JS.configure(Path.join(__dirname, '../config/log4js.json'));
const CookieParser = require('cookie-parser');
const BodyParser = require('body-parser');

const HttpResponser = require('../zutils/classes/HttpResponser');
const ResMonitor = require('../zutils/utils/monitor');

const ErrorCode = require('./config/error_code');
const MochaConfig = require('../config/mocha');

const LogStat = require('log4js').getLogger('statistics');
const Logger = require('log4js').getLogger('account');

let app = new Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: false}));
app.use(CookieParser());


let lbs = require('./routes/lbs');
app.use('/lbs', lbs);
// 设置跨域访问 - 避免 Html5 的游戏无法访问
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Methods", "POST,GET");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    Logger.debug('Recv %s %s [ %j ] [ %j ]', req.method, req.url, req.query, req.body);
    next();
});
let account = require('./routes/account');
app.use('/account', account);
let resources = require('./routes/resources');
app.use('/resources', resources);


app.use(function (req, res, next) {
    let err = new Error('Api Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    let msg = {
        code: ErrorCode.NoAPI,
        message: err.message,
        stack: req.app.get('env') === 'development' ? err : {}
    };
    res.status(err.status || 500);
    res.json(new HttpResponser().fill(msg));
});

if (!MochaConfig.debug) {
    setInterval(function () {
        let info = ResMonitor.getSysRss();
        LogStat.info("Gid:%s Uid:%s Pid:%s Uptime:%s Memory:%j", info.gid, info.uid, info.pid, info.uptime, info.mem);
    }, 5 * 60 * 1e3);

    process.on('unhandledRejection', function (err) {
        Logger.error('Unhandled Rejection:');
        Logger.error(err);
        Logger.error(err.stack);
    });
    process.on('uncaughtException', function (err) {
        Logger.error('Unhandled Exception:');
        Logger.error(err);
        Logger.error(err.stack);
    });
    process.on('SIGINT', function (err) {
        Logger.info("you pressed ctrl and c to exit process");
        Logger.warn(err);
        process.exit(0);
    });
}

module.exports = app;
