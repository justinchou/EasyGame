/**
 * Created by EasyGame.
 * File: Player.js
 * User: justin
 * Date: 15/2/2018
 * Time: 08:22
 */

'use strict';

/**
 * 计算年龄
 * @param {Date} birthday
 */
function getAge(birthday) {
    let now = new Date();
    let age = now.getFullYear() - birthday.getFullYear();
    birthday.setFullYear(now.getFullYear());
    if (birthday > now) {
        age -= 1;
    }
    return age;
}

/**
 * 计算星座
 * @param {Date} birthday
 */
function getHoroscope(birthday) {
    let now = new Date();

    birthday.setFullYear(now.getFullYear());

    let mojie    = new Date(now.getFullYear() + '-01-21 00:00:00');
    let shuiping = new Date(now.getFullYear() + '-02-20 00:00:00');
    let shuangyu = new Date(now.getFullYear() + '-03-21 00:00:00');
    let muyang   = new Date(now.getFullYear() + '-04-21 00:00:00');
    let jinniu   = new Date(now.getFullYear() + '-05-22 00:00:00');
    let shuangzi = new Date(now.getFullYear() + '-06-22 00:00:00');
    let juxie    = new Date(now.getFullYear() + '-07-24 00:00:00');
    let shizi    = new Date(now.getFullYear() + '-08-24 00:00:00');
    let chunv    = new Date(now.getFullYear() + '-09-24 00:00:00');
    let tiancheng = new Date(now.getFullYear() + '-10-24 00:00:00');
    let tianxie  = new Date(now.getFullYear() + '-11-23 00:00:00');
    let sheshou  = new Date(now.getFullYear() + '-12-23 00:00:00');

    if (birthday < mojie) return '摩羯座';
    else if (birthday < shuiping) return '水瓶座';
    else if (birthday < shuangyu) return '双鱼座';
    else if (birthday < muyang) return '牡羊座';
    else if (birthday < jinniu) return '金牛座';
    else if (birthday < shuangzi) return '双子座';
    else if (birthday < juxie) return '巨蟹座';
    else if (birthday < shizi) return '狮子座';
    else if (birthday < chunv) return '处女座';
    else if (birthday < tiancheng) return '天秤座';
    else if (birthday < tianxie) return '天蝎座';
    else if (birthday < sheshou) return '射手座';
    else return '摩羯座';
}

/**
 * 玩家数据
 * @param {Number} playerId
 * @param {Object} playerInfo
 * @constructor
 */
function Player(playerId, playerInfo) {
    this.playerId = playerId;

    this.nickname = playerInfo.nickname;
    this.age = getAge(playerInfo.birthday);
    this.gender = playerInfo.gender;
    this.headImg = playerInfo.headImg;
    this.location = playerInfo.location;
    this.horoscope = getHoroscope(playerInfo.birthday);

    this.bestTime = playerInfo.bestTime || 0;
    this.bestScore = playerInfo.bestScore || 0;
    this.rounds = 0;
}

Player.prototype.setBestScore = function (score) {
    if (this.bestScore < score) {
        this.bestScore = score;
        return true;
    }
    return false;
};

Player.prototype.setBestTime = function (time) {
    if (this.bestTime > time) {
        this.bestTime = time;
        return true;
    }
    return false;
};

Player.prototype.addRounds = function () {
    this.rounds += 1;
    return this.rounds;
};

module.exports = Player;
