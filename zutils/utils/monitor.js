/**
 * Created by EasyGame.
 * File: ResMonitor.js
 * User: justin
 * Date: 3/2/2018
 * Time: 16:37
 */

'use strict';

function getSysRss() {
    return {
        gid: process.getgid(),
        uid: process.getuid(),
        pid: process.pid,
        uptime: process.uptime(),
        mem: process.memoryUsage()
    }
}

module.exports = {
    getSysRss: getSysRss
};