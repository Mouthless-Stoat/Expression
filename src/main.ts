import { tokenize } from "./frontend/lexer"
import Parser from "./frontend/parser"
import { evalBlock } from "./runtime/interpreter"
import Enviroment from "./runtime/enviroment"
import fs from "fs"

const debug = false
const parser = new Parser()

const env = new Enviroment()
let input = fs.readFileSync("./test.txt", "utf8")
let program = parser.produceAST(input)
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
