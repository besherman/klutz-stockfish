
export class InfoParser {
    private _tokens: Array<string>;
    private _nextTokenIdx = 0;

    constructor(line: string) {
        this._tokens = line.split(" ");
    }

    public parse(): Array<{key: string, value: any}> {
        const result: Array<any> = [];
        this._consume("info");
        while(this._lookahead() != null) {
            result.push(this._parseProperty());
        }
        return result;
    }

    private _parseProperty(): {key: string, value: any} {
        const next = this._lookahead();
        switch(next) {
            case "depth":
                return this._parseSimpleProperty("depth");
            case "seldepth":
                return this._parseSimpleProperty("seldepth");
            case "time":
                return this._parseSimpleProperty("time");
            case "nodes":
                return this._parseSimpleProperty("nodes");
            case "pv":
                return this._parsePV();
            case "multipv":
                return this._parseSimpleProperty("multipv");
            case "score":
                return this._parseScore();
            case "currmove":
                return this._parseCurrMove();
            case "currmovenumber":
                return this._parseSimpleProperty("currmovenumber");
            case "hashfull":
                return this._parseSimpleProperty("hashfull");
            case "nps":
                return this._parseSimpleProperty("nps");
            case "tbhits":
                return this._parseSimpleProperty("tbhits");
            case "sbhits":
                return this._parseSimpleProperty("sbhits");
            case "cpuload":
                return this._parseSimpleProperty("cpuload");
            case "string":
                return this._parseString();
            case "refutation":
                return this._parseRefutation();
            case "currline":
                return this._parseCurrLine();
            default:
                throw "unknown token: '" + next + "'";
        }
    }

    private _parseCurrLine(): {key: string, value: any} {
        this._consume("currline");

        let cpunr = 0;
        if(this._isNumber(this._lookahead())) {
            cpunr = this._parseNumber();
        }

        const moves = this._parseMoveList();

        return {"key": "currline", value: {"cpunr": cpunr, "moves": moves}};
    }

    private _parseRefutation(): {key: string, value: Array<string>} {
        this._consume("refutation");
        const moves = this._parseMoveList();
        return {key: "refutation", value: moves};
    }

    private _parseString(): {key: string, value: string} {
        this._consume("string");
        let message = "";
        while(true) {
            let next = this._lookahead();
            if(next == null) {
                return {key: "string", value: message.trim()};
            }
            this._consume(next);
            message = message + " " + next;
        }
    }

    private _parseScore(): {key: string, value: any} {
        this._consume("score");
        const next = this._lookahead();
        if(next == "cp") {
            this._consume("cp");
            const value = this._parseNumber();
            const ll = this._lookahead();
            let precision: string = null;
            if(ll == "lowerbound" || ll == "upperbound") {
                this._consume(ll);
                precision = ll;
            }
            return precision != null
                ? {key: "score", value: {"cp": value, "precision": precision}}
                : {key: "score", value: {"cp": value}}
        } else if(next == "mate") {
            this._consume("mate");
            const value = this._parseNumber();
            return {key: "score", value: {"mate": value}};
        } else {
            throw "parse exception: expected one of [cp, mate] got '" + next + "' at position " +
            this._nextTokenIdx + " in " + JSON.stringify(this._tokens);
        }
    }


    private _parsePV(): {key: string, value: Array<string> } {
        this._consume("pv");
        const moves = this._parseMoveList();
        return {key: "pv", value: moves};
    }

    private _parseCurrMove(): {key: string, value: string} {
        this._consume("currmove");
        const move = this._parseMove();
        return {key: "currmove", value: move};
    }

    private _parseMove(): string {
        const move = this._lookahead();
        this._nextTokenIdx++;
        return move;
    }

    private _parseMoveList(): Array<string> {
        const moves: Array<string> = [];
        while(this._isMove(this._lookahead())) {
            moves.push(this._parseMove());
        }
        return moves;
    }

    private _parseSimpleProperty(key: string): {key: string, value: number} {
        this._consume(key);
        let value = this._parseNumber();
        return {key: key, value: value};
    }

    private _parseNumber(): number {
        const next = this._lookahead();
        if(!this._isNumber(next)) {
            throw "parse exception: expected number got '" + next + "' at position " +
            this._nextTokenIdx + " in " + JSON.stringify(this._tokens);
        }
        this._nextTokenIdx++;
        return parseFloat(next);
    }

    private _lookahead(): string {
        return this._nextTokenIdx < this._tokens.length
            ? this._tokens[this._nextTokenIdx]
            : null;
    }

    private _consume(token: string): void {
        const next = this._tokens[this._nextTokenIdx];
        if(token !== next) {
            throw "parse exception: expected '" + token + "' got '" + next + "' at position " +
            this._nextTokenIdx + " in " + JSON.stringify(this._tokens);
        }
        this._nextTokenIdx++;
    }

    private _isMove(str: string): boolean {
        return str != null ? !!str.match(/^[a-h][0-9][a-h][0-9][b|r|q|n]?$/) : false;
    }

    private _isNumber(str: string): boolean {
        return !!str.match(/^-?\d*(\.\d+)?$/);
    }
}

