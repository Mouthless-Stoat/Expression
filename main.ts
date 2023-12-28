import { tokenize } from "./backend/lexer"
import Parser from "./backend/parser"
import { evalBlock } from "./backend/interpreter"
import Enviroment from "./backend/enviroment"
const prompt = require("prompt-sync")()
import fs from "fs"
import { BlockLiteral } from "./backend/ast"

function repl(debug: boolean, stack = false) {
    const parser = new Parser()
    const env = new Enviroment()
    console.log("v0.0.1")

    while (true) {
        const input = prompt("> ")

        if (!input || input === "exit") {
            throw new Error("Exit")
        }

        try {
            const program = parser.produceAST(input)
            if (debug) {
                console.log("Tokens:", tokenize(input))
                console.log("AST:", program)
                console.log("-".repeat(50))
            }
            const result = evalBlock(program, env, true)
            console.log("Program Return:", result.value)
            if (stack) console.log("Eval Stack:", env.evalStack)
            console.log("=".repeat(50))
        } catch (_) {
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
        console.log("Program Return:", result)
        console.log("Eval Stack:", env.evalStack)
    } catch (_) {
        return
    }
}

function token(ast: boolean) {
    const parser = new Parser()
    const env = new Enviroment()
    console.log("v0.0.1")

    while (true) {
        const input = prompt("> ")

        if (!input || input === "exit") {
            throw new Error("Exit")
        }

        console.log("Tokens:", tokenize(input))
        if (ast) {
            console.log("AST:", parser.produceAST(input))
        }
    }
}
repl(false)
