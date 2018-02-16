/**
 * Created by EasyGame.
 * File: array_test.js
 * User: justin
 * Date: 15/2/2018
 * Time: 17:16
 */

'use strict';

const Should = require('chai').should();

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

function realForEach(source, next) {
    for (let i = source.length - 1; i >= 0; i--) {
        next(source[i], i, source);
    }
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
    // if ((a._unfinished && b._unfinished) || (!a._unfinished && !b._unfinished)) {
        return rankElement(b, a, 'time');
    // } else {
    //     // +: b>a 大到小排序; -: a>b 小到大排序;
    //     if (a._unfinished) {
    //         return 1;
    //     } else {
    //         return -1;
    //     }
    // }
}

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

describe('ZUtils Array', () => {

    let list, target, listLength;

    before(()=>{
        Array.prototype.realForEach = function (next) {
            for (let i = this.length - 1; i >= 0; i--) {
                next(this[i], i, this);
            }
        };
    });

    beforeEach(()=>{
        list = [
            {"playerId": 11, score: 29, time: 32, _unfinished: true},
            {"playerId": 12, score: 27, time: 29, _unfinished: true},
            {"playerId": 13, score: 24, time: 35, _unfinished: true},
            {"playerId": 14, score: 28, time: 26, _unfinished: true},
            {"playerId": 15, score: 26, time: 33, _unfinished: true},
            {"playerId": 21, score: 29, time: 32, _unfinished: false},
            {"playerId": 22, score: 27, time: 29, _unfinished: false},
            {"playerId": 23, score: 24, time: 35, _unfinished: false},
            {"playerId": 24, score: 28, time: 26, _unfinished: false},
            {"playerId": 25, score: 26, time: 33, _unfinished: false},
        ];
        target = [];

        listLength = list.length;
    });

    it('loop remove', (done) => {
        list.forEach((item) => {
            let element = removeElement(list, item.playerId);
            console.log('remove === %j', element);
            target.push(element);
        });

        list.length.should.be.equal(Math.floor(listLength/2));
        target.length.should.be.equal(Math.ceil(listLength/2));

        done();
    });

    it('should ', function () {
        list.realForEach((item) => {
            let element = removeElement(list, item.playerId);
            console.log('remove === %j', element);
            target.push(element);
        });
        list.length.should.be.equal(0);
        target.length.should.be.equal(listLength);
    });

    it('real loop remove', (done) => {
        realForEach(list, (item) => {
            let element = removeElement(list, item.playerId);
            console.log('remove === %j', element);
            target.push(element);
        });

        list.length.should.be.equal(0);
        target.length.should.be.equal(listLength);

        done();
    });

    it('rank by time', () => {
        list = list.sort(rankByTime);
        console.log(list);
    });

    it('rank by time and finished', () => {
        list = list.sort(rankByTimeAndFinished);
        console.log(list);
    });

    it('rank by score and finished', () => {
        list = list.sort(rankByScoreAndFinished);
        console.log(list);
    });
});
