import { FunctionCall, NULLVAL, NativeFunctionVal, NumberVal, RuntimeVal, ValueType, isValueTypes } from "./value"
import { error } from "../utils"

export const NATIVEGLOBAL: Record<string, RuntimeVal> = {
    omega: new NumberVal(0),
    pi: new NumberVal(Math.PI),
    e: new NumberVal(Math.E),
    NaN: new NumberVal(NaN),
    avogadro: new NumberVal(6.02214076e-23),
}

function MathProp(func: Function, amount: number): NativeFunctionVal {
    return new NativeFunctionVal((args, _) => {
        const values = expectArgs(args, amount)
        if (values.some((v) => !isValueTypes(v, ValueType.Number)))
            return error(
                "TypeError: Can't do math with type",
                ValueType[values.filter((v) => !isValueTypes(v, ValueType.Number))[0].type]
            )
        return new NumberVal(func(...values.map((n) => n.value)))
    })
}

const mathFunc = {
    abs: MathProp(Math.abs, 1),
}

export const NATIVEFUNC: Record<string, FunctionCall> = {
    print: (args: RuntimeVal[], _) => {
        console.log(...args.map((v) => v.value))
        return NULLVAL
    },
    math: (args: RuntimeVal[], env) => {
        args = expectArgs(args, 1, false)
        if (!args[0].toString)
            return error("TypeError: Cannot convert type", ValueType[args[0].type], "to Character List")
        //@ts-expect-error It should never be undefined cus the list length is at least 1
        const name = args.shift().toString() as keyof typeof mathFunc
        if (!(name in mathFunc)) return error(`RuntimeError: Math does not have function "${args}"`)
        if (args.length < 1) {
            return mathFunc[name]
        } else {
            return mathFunc[name].value(args, env)
        }
    },
}

function expectArgs(args: RuntimeVal[], amount: number, isExact = true): RuntimeVal[] {
    if (isExact ? args.length !== amount : args.length < amount)
        return error(`Expected${isExact ? "" : " at least"}`, amount, "argument but given", args.length)
    return args
}
