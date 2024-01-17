import Color from "./color"
import { RuntimeVal } from "./runtime/value"
import readline from "readline"

let scream = true

export const toggleScream = (state?: boolean) => (scream = state ?? !scream)

export class XperError extends Error {
    constructor(msg: string) {
        super(msg)
        this.name = "XperError"
    }
}

export function error(...message: any[]): any {
    if (scream) console.log(Color.red(message.join(" ")))
    throw new XperError(message.join(" "))
}

export function clamp(num: number, min: number, max: number): number {
    return Math.min(max, Math.max(num, min))
}

export function expectArgs(args: RuntimeVal[], amount: number, isExact = true): RuntimeVal[] {
    if (isExact ? args.length !== amount : args.length < amount)
        return error(`Expected${isExact ? "" : " at least"}`, amount, "argument but given", args.length)
    return args
}
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

// Create a promise based version of rl.question so we can use it in async functions
export const input = (str: string): Promise<string> => new Promise((resolve) => rl.question(str, resolve))
