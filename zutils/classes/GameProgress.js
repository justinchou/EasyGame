/**
 * Created by EasyGame.
 * File: GameProgress.js
 * User: justin
 * Date: 15/2/2018
 * Time: 09:56
 */

'use strict';

/**
 * 玩家操作
 * @param {String|Object} pos 不同游戏内容不同
 * @constructor
 */
function Steps(pos) {
    this.pos = pos;
    this.timestamp = Date.now();
}

/**
 * 游戏进度数据
 *
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 *
 * 时间一定, 计分; 总任务一定, 计时间;
 *
 * // 1.指定任务数(progress)情况下, 时间(time)短赢-迎娶白富美/分数(score)高赢
 * // 2.指定时间(time)倒计时, 完成任务数(progress)多/分数(score)高赢-跳冰箱,跳一跳
 * // 3.指定任务数(progress)与时间(time), 时间内完成任务, 谁用时少谁赢 => 实际就是1方案增加一个自动结算的倒计时-
 * // 4.不指定任务数(progress)与时间(time), 谁出现失误游戏结束谁输(一般此类型游戏都设计成不操作几秒后自动会输的模式)-咆哮二驴,消砖块,连连看
 *
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 *
 * p一定 => time: 奔向傻白甜赢取白富美(跳青蛙/黑白格), 连连看, 乐翻天(翻中相同消除)
 * p一定 => score:
 *
 * t一定 => progress: 一般以 t->s 取替(当s=1情况)
 * t一定 => score: 跳冰箱, 跳一跳, 娃娃机, 快手摇(节奏大师,跳舞版), 怒怼小霸王, 容嬷嬷来了, 表情大战, 跳舞机, 数来钱, 吹泡泡
 *
 * p一定, t一定 => score:
 *
 * ? => progress: 一般以 t->s 取替(当s=1情况)
 * ? => score/谁先死: 咆哮二驴, 消砖块, 吃鸡游戏
 *
 * 每回合t一定 => 斗兽棋, 五子棋, 扫雷
 *
 * 在线答题
 *
 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 *
 * 完成相同任务, 比时间短
 *
 * 时间一定, 竞技谁的得分多
 *
 * 一起玩儿, 看谁先失误
 *
 * 每回合时间一定, 谁先达成目标/完成总目标得分最高
 *
 * @param playerId
 * @constructor
 */
function GameProgress(playerId) {
    this.playerId = playerId;

    this.startTime = 0;
    this.endTime = 0;
    // 耗时间
    this.time = 0;

    // 进度
    this.progress = 0;

    // 得分
    this.score = 0;

    // 玩家操作记录, 包括成功与失败的操作 (长度大于等于进度)
    this.steps = [];

    // 未进行到结尾(中途退出/一人胜出即结束不再继续时)
    this._unfinished = false;
}

GameProgress.prototype.gameStart = function () {
    this.startTime = Date.now();
};

GameProgress.prototype.setProgress = function (progress) {
    if (this.endTime > 0) return;
    this.progress = progress;
};

/**
 * 加分
 * @param {Number} score
 */
GameProgress.prototype.addScore = function (score) {
    if (this.endTime > 0) return;
    this.score += score || 1;
};

/**
 * 记录玩家操作
 * @param {String} pos
 */
GameProgress.prototype.setStep = function (pos) {
    if (this.endTime > 0) return;
    this.steps.push(new Steps(pos));
};

GameProgress.prototype.quit = function () {
    this._unfinished = true;
    this.gameOver();
};

/**
 * 游戏结束
 */
GameProgress.prototype.gameOver = function () {
    if (this.endTime === 0) {
        this.endTime = Date.now();
        this.time = this.endTime - this.startTime;
    }
};

module.exports = GameProgress;
