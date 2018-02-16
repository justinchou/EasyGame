/**
 * Created by EasyGame.
 * File: Singleton.js
 * User: justin
 * Date: 9/2/2018
 * Time: 09:57
 */

'use strict';

const EventEmitter   = require('events').EventEmitter;
const Util           = require('util');

Util.inherits(Singleton, EventEmitter);
function Singleton() {
    EventEmitter.call(this);
    this.data = {};
}

let instance;

function getListenerKey(key) {
    return Util.format('Key_%s_Changed', key);
}

Singleton.prototype.get = function (key) {
    return this.data[key];
};

Singleton.prototype.set = function (key, value) {
    this.data[key] = value;
    instance.emit(getListenerKey(key), value);
};

Singleton.prototype.startListen = function (key, listener) {
    instance.on(getListenerKey(key), listener);
};

Singleton.prototype.stopListen = function (key, listener) {
    instance.removeListener(getListenerKey(key), listener);
};

module.exports = {
    "getInstance": function getInstance() {
        if (!instance) {
            instance = new Singleton();
        }
        return instance;
    }
};
