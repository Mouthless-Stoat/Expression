import { FunctionCall, NULLVAL, NumberVal, RuntimeVal } from "./value"
import { error } from "../utils"

export const NATIVEGLOBAL: Record<string, RuntimeVal> = {
    omega: new NumberVal(0),
    pi: new NumberVal(Math.PI),
    e: new NumberVal(Math.E),
    NaN: new NumberVal(NaN),
    avogadro: new NumberVal(6.02214076e-23),
}

export const NATIVEFUNC: Record<string, FunctionCall> = {
    print: (args: RuntimeVal[], _) => {
        console.log(...args.map((v) => v.value))
        return NULLVAL
    },
}

function expectArgs(args: RuntimeVal[], amount: number, isExact = true): RuntimeVal[] {
    if (isExact ? args.length !== amount : args.length > amount)
        return error("Expected", amount, "argument but given", args.length)
    return args.slice(0, amount)
}
