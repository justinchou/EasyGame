/**
 * Created by EasyGame.
 * File: index.js
 * User: justin
 * Date: 3/2/2018
 * Time: 16:52
 */

'use strict';

const Express = require('express');
const Router = Express.Router();

const HttpResponser = require('../../../zutils/classes/HttpResponser');

const ErrorCode = require('../../config/error_code');

Router.get('/', function (req, res, next) {
    res.json(new HttpResponser().fill(ErrorCode.Success, {"message": "success"}));
});

module.exports = Router;
