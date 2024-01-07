import {
    FunctionCall,
    ListVal,
    NULLVAL,
    NativeFunctionVal,
    NativeObjectVal,
    NumberVal,
    RuntimeVal,
    ValueType,
    isValueTypes,
    valueName,
} from "./value"
import { error, expectArgs } from "../utils"

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

function genNamespace(name: string, namespace: Record<string, RuntimeVal>): FunctionCall {
    return (args, env) => {
        args = expectArgs(args, 1, false)
        if (!args[0].toString)
            return error("TypeError: Cannot convert type", ValueType[args[0].type], "to Character List")
        //@ts-expect-error It should never be undefined cus the list length is at least 1
        const propName = args.shift().toString() as keyof typeof namespace
        if (!(propName in namespace)) return error(`RuntimeError: ${name} does not have function "${propName}"`)
        if (args.length < 1) {
            return namespace[propName]
        } else if (isValueTypes(namespace[propName], ValueType.NativeFuntion)) {
            return namespace[propName].value(args, env)
        }
    }
}

export const NATIVEFUNC: Record<string, FunctionCall> = {
    print: (args, _) => {
        console.log(...args.map((v) => v.value))
        return NULLVAL
    },
    math: genNamespace("Math", {
        abs: MathProp(Math.abs, 1),
        sin: new NativeFunctionVal((args, env) => {
            const value = expectArgs(args, 1)[0] as NumberVal
            if (!isValueTypes(value, ValueType.Number))
                return error("TypeError: Can't do math with type", valueName[value.type])
            let x = value.value * (env.getVar("pi").value / 180)
            return new NumberVal(Math.sin(x))
        }),
        cos: new NativeFunctionVal((args, env) => {
            const value = expectArgs(args, 1)[0] as NumberVal
            if (!isValueTypes(value, ValueType.Number))
                return error("TypeError: Can't do math with type", valueName[value.type])
            let x = value.value * (env.getVar("pi").value / 180)
            return new NumberVal(Math.sin(x))
        }),
        sqrt: MathProp(Math.sqrt, 1),
    }),
    random: genNamespace("Random", {
        random: MathProp(Math.random, 0),
        randint: MathProp((min: number, max: number) => {
            return Math.random() * (max - min) + min
        }, 2),
    }),
    map: (args, _) => {
        args = expectArgs(args, 2)
        if (args.some((v) => !isValueTypes(v, ValueType.List)))
            return error('TypeError: Both of "map" arguments must be type List')

        // processing the value
        const keys: string[] = (args[0] as ListVal).value.map((v) =>
            v.toString
                ? v.toString()
                : error("TypeError: Cannot convert type", ValueType[args[0].type], "to Character List")
        )
        const values = (args[1] as ListVal).value

        // check for equal length
        if (keys.length !== values.length)
            return error('RuntimeError: Both of "map" argument must have the same length')

        const obj: Map<string, RuntimeVal> = new Map()
        for (const i in keys) {
            obj.set(keys[i], values[i])
        }
        return new NativeObjectVal(obj)
    },
}
