/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/chai/chai.d.ts" />

import chai = require("chai");

import {InfoParser} from "../main/info_parser";

describe("testing InfoParser", function() {
    this.timeout(10000);

    it("depth", function() {
        const parser = new InfoParser("info depth 1");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "depth", value: 1});
    });

    it("seldepth", function() {
        const parser = new InfoParser("info seldepth 1");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "seldepth", value: 1});
    });

    it("multipv", function() {
        const parser = new InfoParser("info multipv 1");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "multipv", value: 1});
    });

    it("score", function() {
        let parser = new InfoParser("info score cp 89");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "score", value: {"cp": 89}});

        parser = new InfoParser("info score cp 231 upperbound");
        result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "score", value: {"cp": 231, "precision": "upperbound"}});

        parser = new InfoParser("info score mate -15");
        result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "score", value: {"mate": -15}});
    });

    it("nodes", function() {
        const parser = new InfoParser("info nodes 21");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "nodes", value: 21});
    });

    it("nps", function() {
        const parser = new InfoParser("info nps 552");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "nps", value: 552});
    });

    it("time", function() {
        const parser = new InfoParser("info time 38");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "time", value: 38});
    });

    it("pv", function() {
        let parser = new InfoParser("info pv e7e5");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "pv", value: ["e7e5"]});

        parser = new InfoParser("info pv e7e5 a2a3");
        result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "pv", value: ["e7e5", "a2a3"]});

        parser = new InfoParser("info pv a2a1q d6d7 b3d1 d7c6 a1a6 c6c5 d1d6");
        result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "pv", value: ["a2a1q", "d6d7", "b3d1", "d7c6", "a1a6", "c6c5", "d1d6"]});
    });

    it("currmove", function() {
        let parser = new InfoParser("info currmove a2a3");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "currmove", value: "a2a3"});
    });

    it("currmovenumber", function() {
        let parser = new InfoParser("info currmovenumber 34");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "currmovenumber", value: 34});
    });

    it("string", function() {
        let parser = new InfoParser("info string hello, world!");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "string", value: "hello, world!"});
    });

    it("refutation", function() {
        let parser = new InfoParser("info refutation d1h5 g6h5");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "refutation", value: ["d1h5", "g6h5"]});
    });

    it("currline", function() {
        let parser = new InfoParser("info currline 2 d6d7 b3d1");
        let result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "currline", value: {"cpunr": 2, "moves": ["d6d7", "b3d1"]}});

        parser = new InfoParser("info currline d6d7 b3d1");
        result = parser.parse();
        chai.assert.deepEqual(result[0], {key: "currline", value: {"cpunr": 0, "moves": ["d6d7", "b3d1"]}});
    });
});

