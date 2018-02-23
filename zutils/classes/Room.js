/**
 * Created by EasyGame.
 * File: Room.js
 * User: justin
 * Date: 15/2/2018
 * Time: 08:13
 */

'use strict';

const Player = require('./Player');
const GameProgress = require('./GameProgress');
const _ = require('lodash');

function Room() {
    this.config = null;

    // 连续局数
    this.rounds = 0;

    this.players = {};
    this._players = [];

    // 开始时间
    this.startTime = 0;
    // 进行游戏的玩家
    this._gameingPlayers = [];
    // 已经结算等待下局的玩家/主动选择结束本局游戏的玩家
    this._waitingPlayers = [];
    // 玩家游戏进度
    this.progress = null;

    this.history = [];
}


/**
 * 拷贝值而不拷贝数组 - 值引用拷贝, 数组值拷贝
 * @param {Array} source
 * @param {Array} target
 */
function copyArray(source, target) {
    for (let i = 0; i < source.length; i++) {
        target.push(source[i]);
    }
}

/**
 * 将 Object 转换成数组
 * @param {Object} obj
 * @param {Array|Function=} arr 外部定义的空数组, 如果传递该数组则避免数组的拷贝, 如果不传递则以return返回数组会进行内存拷贝
 * @param {Function=} handler 对每个值的处理函数
 * @returns {*}
 */
function object2Array(obj, arr, handler) {
    let ret = false;
    if (!arr || Array.isArray(arr) === false) {
        if (typeof arr === 'function') {
            handler = arr;
        }
        arr = [];
        ret = true;
    }

    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            let v = typeof handler === 'function' ? handler(obj[i]) : obj[i];
            arr.push(v);
        }
    }

    if (ret) return arr;
}

function realForEach(source, next) {
    for (let i = source.length - 1; i >= 0; i--) {
        next(source[i], i, source);
    }
}

/**
 * 将对象从数组中移除
 * @param {Array} source
 * @param {Number} playerId
 * @returns {*}
 */
function removeElement(source, playerId) {
    let element = null;
    for (let i = 0; i < source.length; i++) {
        if (source[i].playerId === playerId) {
            element = source.splice(i, 1);
            break;
        }
    }
    return element;
}

/**
 * 倒叙排序, 传递给一个数组的sort方法
 * @param {Object} a
 * @param {Object} b
 * @param {String} name
 * @returns {number}
 */
function rankElement(a, b, name) {
    return b[name] - a[name];
}

/**
 * 按时间排序, 从小到大
 * @param a
 * @param b
 */
function rankByTime(a, b) {
    return rankElement(b, a, 'time');
}

/**
 * 先考虑是否完成游戏, 再按照时间排序
 *
 * 完成的与完成的排序, 未完成的与未完成的排序, 完成的优先于未完成的
 *
 * @param a
 * @param b
 * @returns {number}
 */
function rankByTimeAndFinished(a, b) {
    if ((a._unfinished && b._unfinished) || (!a._unfinished && !b._unfinished)) {
        return rankElement(b, a, 'time');
    } else {
        // +: b>a 大到小排序; -: a>b 小到大排序;
        if (a._unfinished) {
            return 1;
        } else {
            return -1;
        }
    }
}

/**
 * 先考虑是否完成游戏, 再按照时间排序
 *
 * 完成的与完成的排序, 未完成的与未完成的排序, 完成的优先于未完成的
 *
 * @param a
 * @param b
 * @returns {number}
 */
function rankByScoreAndFinished(a, b) {
    if ((a._unfinished && b._unfinished) || (!a._unfinished && !b._unfinished)) {
        return rankElement(a, b, 'score');
    } else {
        // +: b>a 大到小排序; -: a>b 小到大排序;
        if (a._unfinished) {
            return 1;
        } else {
            return -1;
        }
    }
}


/**
 * 初始化房间数据
 * @param {Object} config
 */
Room.prototype.init = function (config) {
    this.config = config;
};

/**
 * 玩家进入房间
 * @param {Number} playerId
 * @param {Object} playerInfo
 */
Room.prototype.enter = function (playerId, playerInfo) {
    this.players[playerId] = new Player(playerId, playerInfo);
    this._players.push(this.players[playerId]);
};

/**
 * 未开局前离开
 * @param {Number} playerId
 * @returns {boolean}
 */
Room.prototype.leave = function (playerId) {
    if (this.startTime === 0 && this._waitingPlayers.length === 0 && this._gameingPlayers.length === 0 && !this.progress) {
        // 游戏非进行中
        removeElement(this._players, playerId);
        delete this.players[playerId];
        return true;
    } else {
        // 游戏进行中
        return false;
    }
};

/**
 * 游戏开局
 */
Room.prototype.startGame = function () {
    this.rounds += 1;
    this.startTime = Date.now();

    this._gameingPlayers = [];
    copyArray(this._players, this._gameingPlayers);
    this._waitingPlayers = [];

    this.progress = {};
    for (let i = 0; i < this._gameingPlayers.length; i++) {
        let playerId = this._gameingPlayers[i].playerId;
        this.progress[playerId] = new GameProgress(playerId);
        this.progress[playerId].startGame();
    }
};

/**
 * 成功完成游戏/主动点击退出, 将游戏结束并放入等待数组
 * @param playerId
 */
Room.prototype.finishGame = function (playerId) {
    this.progress[playerId].gameOver();
    let player = removeElement(this._gameingPlayers, playerId);
    if (player) {
        this._waitingPlayers.push(player);
    }
};

/**
 * 判断房间是否只剩最后一个玩家
 * @returns {boolean}
 */
Room.prototype.isLastPlayer = function () {
    return this._gameingPlayers.length <= 1;
};

Room.prototype.getSettlementByTime = function (progress) {
    // 排序结算结果 - 以时间排序
    progress.sort(rankByTimeAndFinished);

    let best = {};
    realForEach(progress, (item) => {
        if (!item._unfinished && item.time < this.players[item.playerId].bestTime) {
            best[item.playerId] = true;
            this.players[item.playerId].bestTime = item.time;
        }
    });

    return best;
};

Room.prototype.getSettlementByScore = function (progress) {
    // 排序结算结果 - 以分数排序
    progress.sort(rankByScoreAndFinished);

    let best = {};
    realForEach(progress, (item) => {
        if (!item._unfinished && item.score > this.players[item.playerId].bestScore) {
            best[item.playerId] = true;
            this.players[item.playerId].bestScore = item.score;
        }
    });

    return best;
};

Room.prototype.endGame = function (type, next) {

    realForEach(this._gameingPlayers, (player) => {
        let playerId = player.playerId;
        this.progress[playerId].endGame();
        this._waitingPlayers[playerId] = player;
        removeElement(this._gameingPlayers, playerId);
    });

    let progress = [], rounds = {};
    object2Array(this.progress, progress, (gameProgress) => {
        rounds[gameProgress.playerId] = this.players[gameProgress.playerId].addRounds();
    });

    let best;
    switch (type) {
        case 'time':
            best = this.getSettlementByTime(progress);
            break;
        case 'score':
            best = this.getSettlementByScore(progress);
            break;
        default:
            best = {};
            break;
    }

    this.history.push({
        "startTime": this.startTime,
        "config": _.cloneDeep(this.config),
        "players": _.cloneDeep(this.players),
        "progress": progress
    });

    // 重置房间
    this.startTime = 0;
    this._gameingPlayers = [];
    this._waitingPlayers = [];
    this.progress = null;

    let result = {
        "players": this.players,
        "result": progress,
        "rounds": rounds,
        "best": best
    };
    if (typeof next === 'function') {
        next(null, result);
    } else {
        return result;
    }
};

module.exports = Room;