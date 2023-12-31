"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const lexer_1 = require("./frontend/lexer");
const parser_1 = __importDefault(require("./frontend/parser"));
const interpreter_1 = require("./runtime/interpreter");
const enviroment_1 = __importDefault(require("./runtime/enviroment"));
const readline_1 = __importDefault(require("readline"));
const fs_1 = __importDefault(require("fs"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
// Create a promise based version of rl.question so we can use it in async functions
const question = (str) => new Promise((resolve) => rl.question(str, resolve));
function evalXper(code, debug, stack, parser, env) {
    parser = parser !== null && parser !== void 0 ? parser : new parser_1.default();
    env = env !== null && env !== void 0 ? env : new enviroment_1.default();
    const program = parser.produceAST(code);
    if (debug) {
        console.log("Tokens:", (0, lexer_1.tokenize)(code));
        console.log("AST:", (() => {
            try {
                return JSON.stringify(program, null, 4);
            }
            catch (_a) {
                return program;
            }
        })());
        console.log("-".repeat(50));
    }
    console.log("code:");
    process.stdout.write(code);
    console.log("-".repeat(50));
    const result = (0, interpreter_1.evalBlock)(program, env, true);
    if (stack)
        console.log("Eval Stack:", env.evalStack);
    console.log("Program Return:", result.value);
}
function repl(debug, stack) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Xper repl v1.0.0");
        const parser = new parser_1.default();
        const env = new enviroment_1.default();
        while (true) {
            let input = (yield question("> "));
            if (!input || input === "exit") {
                throw new Error("Exit");
            }
            try {
                evalXper(input, debug, stack, parser, env);
            }
            catch (_a) {
                continue;
            }
        }
    });
}
function run(path, debug, stack) {
    let input = fs_1.default.readFileSync(path, "utf8");
    evalXper(input, debug, stack);
}
commander_1.program
    .name("xper")
    .description("Xper Interpreter")
    .version("v1.0.0", "-v, --version", "Output Xper version")
    .addHelpText("after", `
Example:
    $ xper -v # Print the installed Xper version
    $ xper run main.xpr # Run main.xpr in the current directory
    $ xper help eval # Print help for eval subcommand
    $ xper repl -d # Run the Repl in Debug Mode
    `);
commander_1.program
    .command("run <file>")
    .description("Run a Xper file")
    .option("-d, --debug", "Run the file and print out AST and Token")
    .option("-s, --stack", "Run the file and print out the Eval Stack")
    .action((file, flags) => {
    run(file, flags.debug, flags.stack);
})
    .addHelpText("after", `
Example:
    $ xper run main.xpr # Run main.xpr in the current directory
    $ xper run debug.xpr -d # Run debug.expr with Debug Mode
    `);
commander_1.program
    .command("repl")
    .description("Run the Xper Repl")
    .option("-d, --debug", "Run the file and print out AST and Token")
    .option("-s, --stack", "Run the file and print out the Eval Stack")
    .action((_, flags) => {
    repl(flags.debug, flags.stack);
})
    .addHelpText("after", `
Example:
    $ xper repl -d # Run the Repl in Debug Mode
    $ xper repl --stack # Run the Repl and print the Eval Stack
    `);
commander_1.program
    .command("eval <...code>")
    .description("Eval Xper code")
    .option("-d, --debug", "Run the file and print out AST and Token")
    .option("-s, --stack", "Run the file and print out the Eval Stack")
    .action((code, flags) => {
    evalXper(code, flags.debug, flags.stack);
})
    .addHelpText("after", `
Example:
    $ xper eval 1+1 # Evaluate 1+1 in Xper
    $ xper eval -d a = 10 # evaluate a=10 in Xper with Debug Mode
    $ xper eval --stack a = 10 # evaluate a=10 in Xper and print the Eval Stack
    `);
commander_1.program.parse();
process.exit(0);
