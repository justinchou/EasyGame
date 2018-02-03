/**
 * Created by EasyGame.
 * File: index.js
 * User: justin
 * Date: 3/2/2018
 * Time: 16:52
 */

'use strict';

let Express = require('express');
let Router = Express.Router();

const HttpResponser = require('../../../zutils/HttpResponser');

let ErrorCode = require('../../config/error_code');

Router.get('/', function (req, res, next) {
    res.json(new HttpResponser().fill(ErrorCode.Success, "Success"));
});

module.exports = Router;
