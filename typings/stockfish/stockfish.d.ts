
interface StockfishEngine {
    postMessage(message: string): void;
    onmessage: (evt: string) => void;
}

declare module "stockfish" {
    function STOCKFISH(): StockfishEngine;
    export = STOCKFISH;
}