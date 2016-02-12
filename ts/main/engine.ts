import {Move} from "./move";
import createStockfish = require("stockfish");

import {Observable, Observer} from "../../node_modules/rxjs/Rx";


interface Command {
    message: string;
    consumer: boolean;

    /** returns true if it wants more input */
    consume(line: string): boolean;
}

class InitCommand implements Command {
    public message: string = null;
    public consumer = true;
    public consume(line: string): boolean {
        return false;
    }
}

class UCICommand implements Command {
    public message: string = "uci";
    public consumer = true;

    public consume(line: string): boolean {
        // TODO: parse options
        return line.indexOf("uciok") == -1;
    }
}

class ReadyCommand implements Command {
    public message: string = "isready";
    public consumer = true;
    public promise: Promise<void>;
    private _resolve: (arg: void) => void;

    public constructor() {
        this.promise = new Promise<void>(((resolve: (arg: void) => void, reject: (arg: any) => void) => {
            this._resolve = resolve;
        }).bind(this));
    }

    public consume(line: string): boolean {
        if(line.indexOf("readyok") == -1) {
            return true;
        } else {
            this._resolve(null);
            return false;
        }
    }
}


class DescribeCommand implements Command {
    public message: string = "d";
    public promise: Promise<DescribeResult>;
    public consumer = true;
    private _resolve: (arg: DescribeResult) => void;
    private _legalSAN: Array<string>;
    private _legalLAN: Array<string>;
    private _fen: string;
    private _checkers: Array<string>;
    private _key: string;

    public constructor() {
        this.promise = new Promise<DescribeResult>(((resolve: (arg: DescribeResult) => void, reject: (arg: any) => void) => {
            this._resolve = resolve;
        }).bind(this));
    }

    public consume(line: string): boolean {
        if(line.indexOf("Legal moves:") != -1) {
            this._legalSAN = line.substring(13).trim().split(" ");
        }

        if(line.indexOf("Legal uci moves:") != -1) {
            this._legalLAN = line.substring(17).trim().split(" ");
        }

        if(line.indexOf("Fen:") != -1) {
            this._fen = line.substring(5).trim();
        }

        if(line.indexOf("Key:") != -1) {
            this._key = line.substring(5);
        }

        if(line.indexOf("Checkers:") != -1) {
            this._checkers = line.substring(10).trim().split(" ");
        }


        if(line.indexOf("Legal uci moves") == -1) {
            return true;
        } else {
            this._resolve(this._buildResult());
            return false;
        }
    }

    private _buildResult(): DescribeResult {
        let moves: Array<Move> = [];
        for(let i = 0; i < this._legalSAN.length; i++) {
            moves.push({ lan: this._legalLAN[i], san: this._legalSAN[i] });
        }
        return {
            "moves": moves,
            "fen": this._fen,
            "key": this._key,
            "checkers": this._checkers
        };
    }
}

export interface DescribeResult {
    moves: Array<Move>;
    fen: string;
    checkers: Array<string>;
    key: string;
}

class EvalCommand implements Command {
    public message: string = "eval";
    public consumer = true;
    public promise: Promise<number>;

    private _resolve: (arg: number) => void;
    private _reject: (arg: any) => void;

    public constructor() {
        this.promise = new Promise<number>(((resolve: (arg: number) => void, reject: (arg: any) => void) => {
            this._resolve = resolve;
        }).bind(this));
    }

    public consume(line: string): boolean {
        if(line.indexOf("Total Evaluation:") == -1) {
            return true;
        }
        let match = /-?\d+\.\d+/.exec(line);
        if(match == null) {
            this._reject("not found");
        } else {
            this._resolve(parseFloat(match[0]));
        }
        return false;
    }
}

class PositionCommand implements Command {
    public message: string;
    public consumer = false;

    public constructor(fen: string) {
        this.message = `position fen ${fen}`
    }

    public consume(line: string): boolean {
        return false;
    }
}

export class AnalyzeDuration {
    constructor(private _duration: string) {}

    static infinite(): AnalyzeDuration {
        return new AnalyzeDuration("infinite");
    }

    static depth(level:number): AnalyzeDuration {
        return new AnalyzeDuration("depth " + level);
    }

    static forTime(milliseconds: number): AnalyzeDuration {
        return new AnalyzeDuration("movetime " + milliseconds);
    }

    public toString() {
        return this._duration;
    }
}

class AnalyzeCommand implements Command {
    public message: string;
    public consumer = true;
    public promise: Promise<string>;

    private _resolve: (arg: string) => void;
    private _reject: (arg: any) => void;

    public constructor(duration: AnalyzeDuration) {
        this.message = "go " + duration.toString();
        this.promise = new Promise<string>(((resolve: (arg: string) => void, reject: (arg: any) => void) => {
            this._resolve = resolve;
        }).bind(this));
    }

    public consume(line: string): boolean {
        //console.log(line);
        if(line.indexOf("bestmove") != -1) {
            let move = line.substring(9).split(" ")[0];
            this._resolve(move);
            return false;
        }
        return true;
    }
}

export class Engine {
    private _debug = false;
    private _stockfish: StockfishEngine;
    private _cmdQueue: Array<Command> = [];

    constructor() {
        this._cmdQueue.push(new InitCommand());
        this._cmdQueue.push(new UCICommand());
        this._cmdQueue.push(new ReadyCommand());
        this._stockfish = createStockfish();
        this._stockfish.onmessage = this._onMessage.bind(this);
    }

    public ready(): Promise<void> {
        let cmd = new ReadyCommand();
        this._exec(cmd);
        return cmd.promise;
    }

    public describe(): Promise<DescribeResult> {
        let cmd = new DescribeCommand();
        this._exec(cmd);
        return cmd.promise;
    }

    public eval(): Promise<number> {
        let cmd = new EvalCommand();
        this._exec(cmd);
        return cmd.promise;
    }

    public position(fen: string): void {
        let cmd = new PositionCommand(fen);
        this._exec(cmd);
    }

    public analyze(duration: AnalyzeDuration): Promise<string> {
        let cmd = new AnalyzeCommand(duration);
        this._exec(cmd);
        return cmd.promise;
    }

    private _exec(cmd: Command) {
        if(this._cmdQueue.length == 0) {
            if(cmd.consumer) {
                this._cmdQueue.push(cmd);
            }
            this._postMessage(cmd.message);
        } else {
            this._cmdQueue.push(cmd);
        }
    }

    _onMessage(message: string) {
        if(message === "") {
            return;
        }
        if(this._cmdQueue.length === 0) {
            console.log("engine: got a message without a command in the queue: '" + message + "'");
            console.log(message);
            return;
        }

        let cmd = this._cmdQueue[0];
        let keep = cmd.consume(message);

        if(this._debug) console.log(`command "${cmd.message}" received data "${message}"`);
        if(keep === false) {
            this._cmdQueue.shift();
            if(this._debug) console.log(`command ${cmd.message} is finished`);

            this._sendNextCommandInQueue();
        }
    }

    private _sendNextCommandInQueue() {
        while(this._cmdQueue.length > 0) {
            const nextCommand = this._cmdQueue[0];
            this._postMessage(nextCommand.message);
            if(nextCommand.consumer) {
                return;
            } else {
                // when a command does not expect a response we can
                // just go on
                this._cmdQueue.shift();
            }
        }
    }

    private _postMessage(message: string) {
        if(this._debug) console.log("sending '" + message + "'");
        setTimeout(() => {
            this._stockfish.postMessage(message);
        }, 0);
    }


}
