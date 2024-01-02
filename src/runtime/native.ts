import {
    FunctionCall,
    NULLVAL,
    NativeFunctionVal,
    NumberVal,
    RuntimeVal,
    ValueType,
    isValueTypes,
    valueName,
} from "./value"
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

type NamespaceProp = Record<string, RuntimeVal>
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

export const NATIVENAMESPACE: Record<string, NamespaceProp> = {
    Math: {
        abs: MathProp(Math.abs, 1),
        sin: new NativeFunctionVal((args, env) => {
            const value = expectArgs(args, 1)[0]
            if (!isValueTypes(value, ValueType.Number))
                return error("TypeError: Can't do math with type", valueName[value.type])
            let x = value.value * (env.getVar("pi").value / 180)
            return new NumberVal(Math.sin(x))
        }),
        cos: new NativeFunctionVal((args, env) => {
            const value = expectArgs(args, 1)[0]
            if (!isValueTypes(value, ValueType.Number))
                return error("TypeError: Can't do math with type", valueName[value.type])
            let x = value.value * (env.getVar("pi").value / 180)
            return new NumberVal(Math.sin(x))
        }),
    },
}
