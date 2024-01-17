import { program } from "commander"
import { tokenize } from "./frontend/lexer"
import Parser from "./frontend/parser"
import { evalBlock } from "./runtime/evaluator"
import Enviroment from "./runtime/enviroment"
import fs from "fs"
import { checkString } from "./runtime/value"
import { XperError, input } from "./utils"
import c, { rainCurrColor } from "./color"

function evalXper(code: string, debug: boolean, stack: boolean, time: boolean, parser?: Parser, env?: Enviroment) {
    parser = parser ?? new Parser()
    env = env ?? new Enviroment()

    const start = performance.now()
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
    const timeTaken = c.yel((performance.now() - start).toFixed(2).toString())
    console.log("Program Return:", checkString(result))
    if (time) console.log("Time Taken:", timeTaken, "ms")
}

async function repl(debug: boolean, stack: boolean, time: boolean) {
    console.log(c.blu("Xper repl v1.0.0"))
    const parser = new Parser()
    const env = new Enviroment()
    while (true) {
        const color = rainCurrColor()
        let inp = (await input(color("> "))) as string
        if (inp === "exit") {
            throw new Error("Exit")
        }

        try {
            evalXper(inp, debug, stack, time, parser, env)
        } catch (err) {
            if (err instanceof Error && !(err instanceof XperError)) {
                if (err.message === "Maximum call stack size exceeded") {
                    console.log(c.pur("Oh no recursion detected maybe don't do that. This may or may not be a bug."))
                    console.log(c.pur("If you are in the repl try unsigning whatever you were doing."))
                } else {
                    console.log(c.pur("Oh no you encounter a Wild Xper Bug. Please report this:"))
                    console.log(err)
                }
            }
        }
        console.log(color("=".repeat(50)))
    }
}

function run(path: string, debug: boolean, stack: boolean, time: boolean) {
    let input = fs.readFileSync(path, "utf8")
    process.stdout.write(input)
    try {
        evalXper(input, debug, stack, time)
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
    .option("-t, --time", "Run the file and time the program")
    .action((file, flags) => {
        run(file, flags.debug, flags.stack, flags.time)
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
    .option("-d, --debug", "Run the repl with debug mode")
    .option("-s, --stack", "Run the repl and enable the stack")
    .option("-t, --time", "Run the repl and also time code")
    .action(async function () {
        //@ts-expect-error this work
        await repl(this.opts().debug, this.opts().stack, this.opts().time)
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
    .option("-d, --debug", "Run the code and print out AST and Token")
    .option("-s, --stack", "Run the code and print out the Eval Stack")
    .option("-t, --time", "Run the code and time it")
    .action((code, flags) => {
        evalXper(code, flags.debug, flags.stack, flags.time)
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
    commandUsage: (cmd) => `${c.mag(cmd.name())} ${c.yel(cmd.usage())}`,
    commandDescription: (cmd) => c.bol(c.blu(`${cmd.description()} ${cmd.version()}`)),

    optionTerm: (cmd) => c.gry(cmd.flags),
    optionDescription: (cmd) => c.ita(c.blu(cmd.description)),

    subcommandTerm: (cmd) => `${c.mag(cmd.name())} ${c.yel(cmd.usage())}`,
    subcommandDescription: (cmd) => c.ita(c.blu(cmd.description())),
})

// parse stuff
;(async () => {
    await program.parseAsync()
    process.exit(0)
})()
