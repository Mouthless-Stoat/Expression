import { program } from "commander"
import { tokenize } from "./frontend/lexer"
import Parser from "./frontend/parser"
import { evalBlock } from "./runtime/interpreter"
import Enviroment from "./runtime/enviroment"
import readline from "readline"
import fs from "fs"
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

// Create a promise based version of rl.question so we can use it in async functions
const question = (str: string) => new Promise((resolve) => rl.question(str, resolve))

function evalXper(code: string, debug: boolean, stack: boolean, parser?: Parser, env?: Enviroment) {
    parser = parser ?? new Parser()
    env = env ?? new Enviroment()

    const program = parser.produceAST(code)
    if (debug) {
        console.log("Tokens:", tokenize(code))
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
    const result = evalBlock(program, env)
    if (stack) console.log("Eval Stack:", env.evalStack)
    console.log("Program Return:", result.value)
}

async function repl(debug: boolean, stack: boolean) {
    console.log("Xper repl v1.0.0")
    const parser = new Parser()
    const env = new Enviroment()
    while (true) {
        let input = (await question("> ")) as string
        if (!input || input === "exit") {
            throw new Error("Exit")
        }

        try {
            evalXper(input, debug, stack, parser, env)
        } catch {
            continue
        }
        console.log("=".repeat(50))
    }
}

function run(path: string, debug: boolean, stack: boolean) {
    let input = fs.readFileSync(path, "utf8")
    process.stdout.write(input)
    evalXper(input, debug, stack)
}

program
    .name("xper")
    .description("Xper Interpreter")
    .version("v1.0.0", "-v, --version", "Output Xper version")
    .addHelpText(
        "after",
        `
Example:
    $ xper -v # Print the installed Xper version
    $ xper run main.xpr # Run main.xpr in the current directory
    $ xper help eval # Print help for eval subcommand
    $ xper repl -d # Run the Repl in Debug Mode
    `
    )

program
    .command("run <file>")
    .description("Run a Xper file")
    .option("-d, --debug", "Run the file and print out AST and Token")
    .option("-s, --stack", "Run the file and print out the Eval Stack")
    .action((file, flags) => {
        run(file, flags.debug, flags.stack)
    })
    .addHelpText(
        "after",
        `
Example:
    $ xper run main.xpr # Run main.xpr in the current directory
    $ xper run debug.xpr -d # Run debug.expr with Debug Mode
    `
    )

program
    .command("repl")
    .description("Run the Xper Repl")
    .option("-d, --debug", "Run the file and print out AST and Token")
    .option("-s, --stack", "Run the file and print out the Eval Stack")
    .action(async function () {
        //@ts-expect-error
        await repl(this.opts().debug, this.opts().stack)
    })
    .addHelpText(
        "after",
        `
Example:
    $ xper repl -d # Run the Repl in Debug Mode
    $ xper repl --stack # Run the Repl and print the Eval Stack
    `
    )

program
    .command("eval <...code>")
    .description("Eval Xper code")
    .option("-d, --debug", "Run the file and print out AST and Token")
    .option("-s, --stack", "Run the file and print out the Eval Stack")
    .action((code, flags) => {
        evalXper(code, flags.debug, flags.stack)
    })
    .addHelpText(
        "after",
        `
Example:
    $ xper eval 1+1 # Evaluate 1+1 in Xper
    $ xper eval -d a = 10 # evaluate a=10 in Xper with Debug Mode
    $ xper eval --stack a = 10 # evaluate a=10 in Xper and print the Eval Stack
    `
    )
;(async () => {
    await program.parseAsync()
    process.exit(0)
})()
