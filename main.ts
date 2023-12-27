import { tokenize } from "./backend/lexer"
import Parser from "./backend/parser"
import { evalBlock } from "./backend/interpreter"
import Enviroment from "./backend/enviroment"
const prompt = require("prompt-sync")()
import fs from "fs"

function repl(debug: boolean) {
    const parser = new Parser()
    const globalEnv = new Enviroment()
    console.log("v0.0.1")

    while (true) {
        const input = prompt("> ")

        if (!input || input === "exit") {
            throw new Error("Exit")
        }

        const program = parser.produceAST(input)
        if (debug) {
            console.log("Tokens:", tokenize(input))
            console.log("AST:", program)
            console.log("-".repeat(50))
        }
        console.log("Output:")
        const result = evalBlock(program, globalEnv, true)
        console.log("Program Return:", result)
        console.log("Eval Stack:", globalEnv.evalStack)
        console.log("=".repeat(50))
    }
}

function run(debug: boolean) {
    const parser = new Parser()
    const env = new Enviroment()
    let input = fs.readFileSync("./test.txt", "utf8")
    console.log(input)
    const program = parser.produceAST(input)
    const result = evalBlock(program, env)
    if (debug) {
        console.log("Tokens:", tokenize(input))
        console.log("AST:", JSON.stringify(program, null, 2))
        console.log("-".repeat(50))
    }
    console.log("Output:")
    console.log(result)
    console.log("=".repeat(50))
}
repl(true)
