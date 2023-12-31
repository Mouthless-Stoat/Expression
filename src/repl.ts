import { tokenize } from "./frontend/lexer"
import Parser from "./frontend/parser"
import { evalBlock } from "./runtime/interpreter"
import Enviroment from "./runtime/enviroment"
import readline from "readline"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

// Create a promise based version of rl.question so we can use it in async functions
const question = (str: string) => new Promise((resolve) => rl.question(str, resolve))

const debug = false
const stack = true

const parser = new Parser()
const env = new Enviroment()
console.log("Xper repl v0.0.1")
;(async () => {
    while (true) {
        let inp = (await question("> ")) as string
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
})()
