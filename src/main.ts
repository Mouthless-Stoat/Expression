import { tokenize } from "./frontend/lexer"
import Parser from "./frontend/parser"
import { evalBlock } from "./runtime/interpreter"
import Enviroment from "./runtime/enviroment"
import fs from "fs"
var readlineSync = require("readline-sync")

async function repl(debug: boolean, stack = false) {
    const parser = new Parser()
    const env = new Enviroment()
    console.log("v0.0.1")

    while (true) {
        let inp = readlineSync.question("> ")
        if (!inp || inp === "exit") {
            throw new Error("Exit")
        }

        try {
            const program = parser.produceAST(inp)
            if (debug) {
                console.log("Tokens:", tokenize(inp))
                console.log("AST:", program)
                console.log("-".repeat(50))
            }
            const result = evalBlock(program, env, true)
            console.log("Program Return:", result.value)
            if (stack) console.log("Eval Stack:", env.evalStack)
            console.log("=".repeat(50))
        } catch {
            continue
        }
    }
}

function run(debug: boolean) {
    const parser = new Parser()
    const env = new Enviroment()
    let input = fs.readFileSync("./test.txt", "utf8")
    let program
    try {
        program = parser.produceAST(input)
        if (debug) {
            console.log("Tokens:", tokenize(input))
            console.log("AST:", JSON.stringify(program, null, 2))
            console.log("-".repeat(50))
        }
        console.log("Input:")
        process.stdout.write(input)
        console.log("-".repeat(50))
        const result = evalBlock(program, env)
        console.log("Program Return:", result.value)
    } catch {
        return
    }
}

function token(ast: boolean) {
    const parser = new Parser()
    console.log("v0.0.1")

    while (true) {
        const input = readlineSync.question("> ")

        if (!input || input === "exit") {
            throw new Error("Exit")
        }
        try {
            console.log("Tokens:", tokenize(input))
            if (ast) {
                console.log("AST:", parser.produceAST(input))
            }
        } catch {
            continue
        }
    }
}
repl(false)
