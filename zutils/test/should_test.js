/**
 * Created by EasyGame.
 * File: should_test.js.js
 * User: justin
 * Date: 9/2/2018
 * Time: 11:38
 */

'use strict';

const Should = require('chai').should();
const Expect = require('chai').expect;
const Assert = require('chai').assert;
const _ = require('lodash');
const Util = require('util');

describe('Should Test', () => {

    function Animal() {

    }
    Animal.walk = function () {};
    Animal.prototype.run = function () {};

    function Cat() {

    }
    Cat.pussyfoot = function () {};
    Cat.prototype.scream = function () {};
    Util.inherits(Cat, Animal);

    function Dog() {}
    Dog.rush = function () {};
    Dog.prototype.scream = function () {};
    Util.inherits(Dog, Animal);

    let source = {
        code: 0,
        message: {
            message: "success",
            user: {
                id: "125",
                name: "Justin",
                gender: 1,
                img: "http://wwww.lvge.tech/icon.png"
            },
            status: {
                online: true,
                times: parseInt("aa"), // NaN
                load: [],
                process: {}
            },
            server: {
                platform: {host: "127.0.0.1", port: 3001},
                hall: {host: "127.0.0.1", port: 3002},
                games: [
                    {name: "demo", host: "127.0.0.1", port: 4001},
                    {name: "xiaoxiaole", host: "127.0.0.1", port: 4002},
                    {name: "tiaobingxiang", host: "127.0.0.1", port: 4003},
                    {name: "saolei", host: "127.0.0.1", port: 4004},
                ]
            }
        }
    };
    let target = _.cloneDeep(source);
    target.message.status.online = false;

    before(function () {
        console.log('连接符号帮助阅读没有实际意义:\nto be been is that which and has have with at of same but does\n');
    });

    it('Simple #equal eql exist not include have members property', () => {
        console.log('基本语法: xx.should.to/not.[equal eql exist include include.members .have.property have.members]\n');
        let a = 12, b = undefined, c = 12;

        Should.equal(a, c);
        Should.exist(a, c);
        a.should.to.equal(c);
        source.message.server.should.to.eql(target.message.server);
        console.log('equal 比较两个基本类型, eql 深度比较两个复杂类型 eql === deep.equal\n');

        Should.not.equal(a, b);
        Should.not.exist(b);
        a.should.not.equal(b);

        let e = [a, b, c], f = {coins: a, gems: c, lv: b};
        e.should.to.include(c);
        f.should.to.include({coins: a, lv: b});
        e.should.to.include.members([c, a]);

        f.should.to.have.property('coins', a);
        e.should.to.have.members([c, a, b]);
    });

    describe('Method', function () {
        it('Deep #equal include members property', function () {
            source.message.server.should.to.deep.equal(target.message.server);
            source.message.server.games.should.to.deep.include({name: "demo", host: "127.0.0.1", port: 4001});
            source.message.server.should.to.deep.include({platform: {host: "127.0.0.1", port: 3001}});
            source.message.server.games.should.to.have.deep.members([
                {name: "demo", host: "127.0.0.1", port: 4001},
                {name: "tiaobingxiang", host: "127.0.0.1", port: 4003},
                {name: "xiaoxiaole", host: "127.0.0.1", port: 4002},
                {name: "saolei", host: "127.0.0.1", port: 4004},
            ]);
            source.message.server.should.to.have.deep.property('platform', {host: "127.0.0.1", port: 3001});
        });

        it('Nested #property', function () {
            source.message.should.to.have.nested.property('user.id');
            source.message.should.to.have.nested.property('server.games[3]');
        });

        it('Own #property include 不与nested同用', () => {
            console.log(".property .include 表示自己的属性和继承的属性");
            console.log(".own.property .own.include 表示自己的属性, 不包含继承的属性");
            console.log("");
        });
    });

    describe('TypeAssert Class', function () {
        it('#a an', function () {
            source.should.be.a('object');
            source.code.should.be.a('number');
            source.message.user.should.be.an('object');
            source.message.server.games.should.be.an('array');
            source.message.message.should.be.a('string');
        });

        it('#not.ok vs. undefined null false true NaN', function () {
            source.message.status.online.should.be.true;
            source.message.status.times.should.be.NaN;
            source.message.status.load.should.not.undefined;     // 必须是 not.undefined
            source.message.status.process.should.not.null;
        });

        it('#instanceof', function () {
            let cat = new Cat();
            cat.should.be.instanceof(Cat);
            cat.should.be.instanceof(Animal);
            cat.should.not.instanceof(Dog);

            source.message.server.should.be.instanceof(Object);
            source.message.server.games.should.be.instanceof(Array);
            new Error().should.be.instanceof(Error);
        });

        it('#respondTo ', function () {
            let cat = new Cat();
            cat.should.respondTo('run');
            cat.should.respondTo('scream');

            Cat.should.respondTo('scream');
            Cat.should.itself.respondTo('pussyfoot');
        });
    });

    it('String #include(s) empty lengthOf match have.string', function () {
        let name = "JustinChow", location = "";
        name.should.includes('Just');
        name.should.have.string('Just');
        location.should.be.empty;
        name.should.be.lengthOf(10);
        name.should.match(/tin/);
    });

    it('Object #deep nested own keys include(s) empty have.keys include.keys', function () {

    });

    it('Array #deep nested ordered keys include(s) empty lengthOf lengthOf.above/gt/least/gte/below/lt/most/lte have.keys include.keys', function () {

    });

    it('Number #within above/gt/least/gte/below/lt/most/lte', function () {

    });

    it('Date #within', function () {

    });

    it('Error #throw', function () {
        function fn1() {
            throw new Error('invalid params');
        }
        function fn2() {
            throw new TypeError('type error');
        }
        function fn3() {

        }
        fn1.should.to.throw(Error, /params/);
        fn2.should.to.throw(TypeError, 'type error');
        fn3.should.not.throw();
    });
});

describe('Expect Test', () => {

});

describe('Assert Test', () => {

});
