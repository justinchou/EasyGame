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
const ConfigMocha = require('../config/mocha');

const LogStat = require('log4js').getLogger('statistics');
const Logger = require('log4js').getLogger('website');

let app = new Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: false}));
app.use(CookieParser());


let lbs = require('./routes/lbs');
app.use('/lbs', lbs);
let website = require('./routes/website/index');
app.use('/', website);


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

if (!ConfigMocha.debug) {
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
