/**
 * Created by EasyGame.
 *
 * 加密模块
 *
 * File: Crypto.js
 * User: justin
 * Date: 3/2/2018
 * Time: 18:17
 */

'use strict';

//导入模块
const Crypto = require('crypto');
const Util = require('util');

/**
 * aes192加密模块
 * @param {string} str 要加密的字符串
 * @param {string} secret 要使用的加密密钥(要记住,不然就解不了密啦)
 * @returns {string} 加密后的字符串
 */
function encAse192(str, secret) {
    let cipher = Crypto.createCipher('aes192', secret); //设置加密类型 和 要使用的加密密钥
    let enc = cipher.update(str, 'utf8', 'hex');    //编码方式从utf-8转为hex;
    enc += cipher.final('hex'); //编码方式从转为hex;
    return enc; //返回加密后的字符串
}

/**
 * aes192解密模块
 * @param {string} str 要解密的字符串
 * @param {string} secret 要使用的解密密钥(要和密码的加密密钥对应,不然就解不了密啦)
 * @returns {string} 解密后的字符串
 */
function decAse192(str, secret) {
    let decipher = Crypto.createDecipher('aes192', secret);
    let dec = decipher.update(str, 'hex', 'utf8'); //编码方式从hex转为utf-8;
    dec += decipher.final('utf8'); //编码方式从utf-8;
    return dec;
}

/**
 * Hmac-sha1加密模块 (每次加密随机,不可逆)
 * @param {string} str 要加密的字符串
 * @param {string} secret 要使用的加密密钥
 * @returns {string} 加密后的字符串
 */
function hmac(str, secret) {
    let buf = Crypto.randomBytes(16);
    secret = buf.toString('hex'); //密钥加密；
    let Signture = Crypto.createHmac('sha1', secret); //定义加密方式
    Signture.update(str);
    let res;
    res = Signture.digest().toString('base64'); //生成的密文后将再次作为明文再通过pbkdf2算法迭代加密；
    return res;
}

/**
 * sha1加密模块 (加密固定,不可逆)
 * @param {string} str 要加密的字符串
 * @returns {string} 加密后的字符串
 */
function sha1(str) {
    let sha1 = Crypto.createHash('sha1'); //定义加密方式: md5不可逆,此处的md5可以换成任意hash加密的方法名称；
    sha1.update(str);
    let res;
    res = sha1.digest('hex'); //加密后的值d
    return res;
}

/**
 * md5加密模块 (加密固定,不可逆)
 * @param {string} str 要加密的字符串
 * @returns {string} 加密后的字符串
 */
function md5(str) {
    let sha1 = Crypto.createHash('md5'); //定义加密方式: md5不可逆,此处的md5可以换成任意hash加密的方法名称；
    sha1.update(str);
    let res;
    res = sha1.digest('hex'); //加密后的值d
    return res;
}

/**
 * 字符串转换成Base64
 * @param {string} str
 * @returns {String} 加密后的Base64字符串
 */
function toBase64(str) {
    let buffer = new Buffer(str);
    let res;
    res = buffer.toString('base64');
    return res;
}

/**
 * 解密Base64后的字符串
 * @param {string} str
 * @returns {String} 解密后的字符串
 */
function fromBase64(str) {
    let buffer = new Buffer(str, 'base64');
    let res;
    res = buffer.toString();
    return res;
}

const ConfigUtils = require('../../config/utils');

function calcSign() {
    let args = [];
    for (let i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    args.push(ConfigUtils.keys.accountKey);
    let str = args.join('_');
    return md5(str);
}

function calcSum() {
    let args = [];
    for (let i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    args.push(ConfigUtils.keys.checksumKey);
    let str = args.join('_');
    return md5(str);
}

function calcServer() {
    let args = [];
    for (let i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    args.push(ConfigUtils.keys.serverKey);
    let str = args.join('_');
    return md5(str);
}

function calcServerAddr(host, port) {
    return Util.format("%s:%s", host, port);
}

module.exports = {
    "encAse192": encAse192,
    "decAse192": decAse192,
    "hmac": hmac,
    "md5": md5,
    "sha1": sha1,
    "toBase64": toBase64,
    "fromBase64": fromBase64,

    "calcSign": calcSign,
    "calcSum": calcSum,
    "calcServer": calcServer,
    "calcServerAddr": calcServerAddr
};
