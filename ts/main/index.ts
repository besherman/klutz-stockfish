

// http://blog.charto.net/node-js/Publishing-TypeScript-based-modules-on-npm/



import {Engine} from "./engine";

export class MyClass {
    run(): void {
        console.log("hello, world!");
        //let e = new Engine();
        //e.ready().then((_) => {
        //    console.log("we are ready!");
        //});
        //e.position("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "");
        //e.position("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "");

    }
}