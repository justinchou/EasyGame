/**
 * Created by EasyGame.
 * File: Singleton_test.js
 * User: justin
 * Date: 11/2/2018
 * Time: 00:22
 */

'use strict';

let Singleton = require('../../classes/Singleton').getInstance();

let userInfo = {
    name: 'justin',
    age: 22,
    gender: 1,
    img: "http://"
};
Singleton.set('user', userInfo);

module.exports = {"userInfo": userInfo};

