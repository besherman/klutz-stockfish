/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/chai/chai.d.ts" />

import {MyClass} from "../main/index";
import {Engine, AnalyzeDuration} from "../main/engine";

import {Observable, Observer} from "../../node_modules/rxjs/Rx";


//import chai = require("chai");

describe("testing engine", function() {
    this.timeout(10000);
    let engine = new Engine();

    it("ready()", (done) => {
        engine.ready().then((_) => {
            done();
        });
    });

    it("position()", (done) => {
        engine.position("rnb1kbnr/pppp1ppp/8/4p3/4PP1q/8/PPPP2PP/RNBQKBNR w KQkq");
        engine.describe().then((data) => {
            if(data.fen !== "rnb1kbnr/pppp1ppp/8/4p3/4PP1q/8/PPPP2PP/RNBQKBNR w KQkq - 0 1") {
                done("invalid fen: " + data.fen);
                return;
            }

            let moves = data.moves.map(m => m.san);
            if(moves.length != 2) {
                done("invalid number of moves: " + JSON.stringify(moves));
                return;
            }

            if(moves.indexOf("Ke2") == -1 || moves.indexOf("g3") == -1) {
                done("invalid moves: " + JSON.stringify(moves));
                return;
            }

            if(data.checkers.length != 1 || data.checkers.indexOf("h4") == -1) {
                done("invalid checkers: " + JSON.stringify(data.checkers));
                return;
            }

            done();
        });
    });

    it("eval()", (done) => {
        engine.position("rnb1kbnr/pppp1ppp/8/4p3/4PP1q/8/PPPP2PP/RNBQKBNR w KQkq moves Ke2");
        engine.eval().then((e) => {
            if(e !== 0.26) {
                done("invalid evaluation");
                return;
            }
            done();
        });
    });

    it("eval()", (done) => {
        engine.position("rnbqkbnr/pppppppp/8/8/8/5P2/PPPPP1PP/RNBQKBNR b KQkq - 0 1");
        engine.eval().then((e) => {
            if(e !== -0.11) {
                done("invalid evaluation: " + e);
                return;
            }
            done();
        });
    });

    it("analyze()", (done) => {
        engine.position("rnbqkbnr/pppppppp/8/8/8/5P2/PPPPP1PP/RNBQKBNR b KQkq - 0 1");
        engine.analyze(AnalyzeDuration.depth(1)).then(e => {
            if(e !== "e7e5") {
                done("invalid best move: " + e);
            } else {
                done();
            }
        });
    });

    it("analyze()", (done) => {
        let engine = new Engine();
        engine.position("rnbqkbnr/pppppppp/8/8/8/5P2/PPPPP1PP/RNBQKBNR b KQkq - 0 1");
        engine.analyze(AnalyzeDuration.forTime(10)).then(e => {
            if(e !== "e7e5") {
                done("invalid best move: " + e);
            } else {
                done();
            }
        });
    });

    it("trying it out", (done) => {

        let source = Observable.create((observer: Observer<string>) => {
            // this is only called when someone subscribes
        });

        source.subscribe(function(x: any) { console.log("next")}, function(e: any) {console.log("error"), function() { console.log("complete")}});



    });

});

