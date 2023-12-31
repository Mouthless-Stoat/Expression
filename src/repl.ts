import { tokenize } from "./frontend/lexer"
import Parser from "./frontend/parser"
import { evalBlock } from "./runtime/interpreter"
import Enviroment from "./runtime/enviroment"
var readlineSync = require("readline-sync")

const debug = false
const stack = false

const parser = new Parser()
const env = new Enviroment()
console.log("Xper repl v0.0.1")

while (true) {
    let inp = readlineSync.question("> ")
    if (!inp || inp === "exit") {
        throw new Error("Exit")
    }

    try {
        const program = parser.produceAST(inp)
        if (debug) {
            console.log("Tokens:", tokenize(inp))
            console.log(
                "AST:",
                (() => {
                    try {
                        return JSON.stringify(program, null, 4)
                    } catch {
                        return program
                    }
                })()
            )
            console.log("-".repeat(50))
        }
        const result = evalBlock(program, env, true)
        if (stack) console.log("Eval Stack:", env.evalStack)
        console.log("Program Return:", result.value)
        console.log("=".repeat(50))
    } catch {
        continue
    }
}
