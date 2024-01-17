import { program } from "commander"
import { tokenize } from "./frontend/lexer"
import Parser from "./frontend/parser"
import { evalBlock } from "./runtime/evaluator"
import Enviroment from "./runtime/enviroment"
import fs from "fs"
import { checkString } from "./runtime/value"
import { XperError, input } from "./utils"
import c from "./color"

function evalXper(code: string, debug: boolean, stack: boolean, parser?: Parser, env?: Enviroment) {
    parser = parser ?? new Parser()
    env = env ?? new Enviroment()

    const program = parser.produceAST(code)
    const token = tokenize(code)
    if (debug) {
        console.log("Tokens:", token)
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
    const result = evalBlock(program, env, stack)
    if (stack) console.log("Eval Stack:", env.evalStack)
    console.log("Program Return:", checkString(result))
}

async function repl(debug: boolean, stack: boolean) {
    console.log("Xper repl v1.0.0")
    const parser = new Parser()
    const env = new Enviroment()
    while (true) {
        let inp = (await input("> ")) as string
        if (!inp || inp === "exit") {
            throw new Error("Exit")
        }

        try {
            evalXper(inp, debug, stack, parser, env)
        } catch (err) {
            if (err instanceof Error && !(err instanceof XperError)) {
                if (err.message === "Maximum call stack size exceeded") {
                    console.log("Oh no recursion detected maybe don't do that. This may or may not be a bug.")
                    console.log("If you are in the repl try unsigning whatever you were doing.")
                } else {
                    console.log("Oh no you encounter a Wild Xper Bug. Please report this:")
                    console.log(err)
                }
            }
        }
        console.log("=".repeat(50))
    }
}

function run(path: string, debug: boolean, stack: boolean) {
    let input = fs.readFileSync(path, "utf8")
    process.stdout.write(input)
    try {
        evalXper(input, debug, stack)
    } catch {}
}

program
    .name("xper")
    .description("Xper Interpreter")
    .version("v1.0.0", "-v, --version", "Output Xper version")
    .addHelpText(
        "after",
        `
Example:${c.gre(`
    $ xper -v # Print the installed Xper version
    $ xper run main.xpr # Run main.xpr in the current directory
    $ xper help eval # Print help for eval subcommand
    $ xper repl -d # Run the Repl in Debug Mode`)}`
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
Example:${c.gre(`
    $ xper run main.xpr # Run main.xpr in the current directory
    $ xper run debug.xpr -d # Run debug.expr with Debug Mode`)}`
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
Example:${c.gre(`
    $ xper repl -d # Run the Repl in Debug Mode
    $ xper repl --stack # Run the Repl and print the Eval Stack`)}`
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
Example:${c.gre(`
    $ xper eval 1+1 # Evaluate 1+1 in Xper
    $ xper eval -d a = 10 # evaluate a=10 in Xper with Debug Mode
    $ xper eval --stack a = 10 # evaluate a=10 in Xper and print the Eval Stack`)}`
    )

program.configureHelp({
    subcommandTerm: (cmd) => `${c.mag(cmd.name())} ${c.yel(cmd.usage())}`,
    subcommandDescription: (cmd) => c.ita(c.blu(cmd.description())),
    optionTerm: (cmd) => c.gry(cmd.flags),
    optionDescription: (cmd) => c.ita(c.blu(cmd.description)),
    commandUsage: (cmd) => `${c.mag(cmd.name())} ${c.yel(cmd.usage())}`,
    commandDescription: (cmd) => c.und(c.blu(cmd.description())),
})

// parse stuff
;(async () => {
    await program.parseAsync()
    process.exit(0)
})()
