/**
 * Created by EasyGame.
 * File: Singleton2_test.js
 * User: justin
 * Date: 11/2/2018
 * Time: 00:22
 */

'use strict';

let Singleton = require('../../classes/Singleton').getInstance();
Singleton.startListen('games', function (value) {
    console.log('games changed to [ %j ]', value);
});

let gameInfo = [
    {"name": "demo", "host": "127.0.0.1", "port": 3001},
    {"name": "xiaoxiaole", "host": "127.0.0.1", "port": 3002},
    {"name": "tanchishe", "host": "127.0.0.1", "port": 3003},
];
Singleton.set('games', gameInfo);

module.exports = {"gameInfo": gameInfo};
