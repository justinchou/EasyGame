/**
 * Created by EasyGame.
 * File: app_test.js
 * User: justin
 * Date: 3/2/2018
 * Time: 13:20
 */

'use strict';

const Should = require('chai').should();
const Request = require('supertest');
const Path = require('path');
const Util = require('util');
const QS = require('querystring');

const Crypto = require('../../zutils/utils/crypto');

require('log4js').configure(Path.join(__dirname, '../../config/log4js.json'));
const Logger = require('log4js').getLogger('mocha');

const ConfigGameDemo = require('../../config/gameDemo');
const ConfigUtils = require('../../config/utils');
const ConfigMocha = require('../../config/mocha');
const ErrorCode = require('../config/errorCode');

let App = require('../app');

describe('ZHall App', () => {
    describe('#App Run 检测APP基础功能', () => {
        let app;

        before(done => {
            app = Request(App);
            done();
        });

        it('Lbs Check Alive 负载均衡检活接口', done => {
            let api = '/lbs';
            app.get(api).expect(200).end((err, res) => {
                if (err) {
                    Logger.error('Request API %s Failed, err: ', api, err);
                }
                if (ConfigMocha.debug > 1) {
                    Logger.info('%s: res.text [ %s ], res.body [ %j ]', api, res.text, res.body);
                    Logger.info('%s: res.header [ %j ], res.headers [ %j ]', api, res.header, res.headers);
                    Logger.info('%s: res.status [ %s ], res.statusCode [ %s ]', api, res.status, res.statusCode);
                }
                done();
            });
        });
    });

    describe('#gameService 检测服务器注册接口 - 接收Game服务器注册消息', () => {
        let app;

        before(done => {
            app = Request(App);
            done();
        });

        it('#Game Server Register', () => {
            let api = '/gameManager/registerGameServer?' + QS.stringify({
                host: ConfigGameDemo.host,
                port: ConfigGameDemo.port,
                privateHost: ConfigGameDemo.privateHost,
                privatePort: ConfigGameDemo.privatePort,
                load: 24,
                checkserver: Crypto.calcServer(ConfigGameDemo.host, ConfigGameDemo.port, 24, ConfigGameDemo.privateHost, ConfigGameDemo.privatePort)
            });
            // app.get(api)
        });
    })
});
