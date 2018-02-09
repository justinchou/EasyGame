/**
 * Created by EasyGame.
 * File: req.js
 * User: justin
 * Date: 6/2/2018
 * Time: 09:31
 */

'use strict';

module.exports = {
    "isMobile": function (req) {
        return false;
    },
    "getClientIp": function (req) {
        let ip = req.ip;
        if (ip.indexOf("::ffff:") !== -1) {
            ip = ip.substr(7);
        }
        return ip;
    },
};