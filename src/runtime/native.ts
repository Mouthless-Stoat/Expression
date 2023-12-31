import { FunctionCall, NULLVAL, NativeFunctionVal, NumberVal, RuntimeVal } from "./value"
import { error } from "../utils"

export const NATIVEGLOBAL: Record<string, RuntimeVal> = {
    π: new NumberVal(Math.PI),
    ω: new NumberVal(0),
    pi: new NumberVal(Math.PI),
    NaN: new NumberVal(NaN),
    e: new NumberVal(Math.E),
    L: new NumberVal(6.02214076e23),
    Nₐ: new NumberVal(6.02214076e23),
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

type NamespaceProp = Record<string, RuntimeVal>
function MathProp(func: Function, amount: number): NativeFunctionVal {
    return new NativeFunctionVal((args, _) => new NumberVal(func(...expectArgs(args, amount).map((n) => n.value))))
}

export const NATIVENAMESPACE: Record<string, NamespaceProp> = {
    math: {
        abs: MathProp(Math.abs, 1),
        sin: MathProp(Math.sin, 1),
        cos: MathProp(Math.cos, 1),
        pi: new NumberVal(Math.PI),
        e: new NumberVal(Math.E),
    },
}
