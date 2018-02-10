/**
 * Created by EasyGame.
 * File: lbs.js
 * User: justin
 * Date: 3/2/2018
 * Time: 16:54
 */

'use strict';

const Express = require('express');
const Router = Express.Router();

const HttpResponser = require('../../zutils/classes/HttpResponser');

const ErrorCode = require('../config/error_code');

// lbs means load balance service, provide for lbs live check
Router.all('/', function (req, res, next) {
    res.json(new HttpResponser().fill(ErrorCode.Success, "Success"));
});

module.exports = Router;