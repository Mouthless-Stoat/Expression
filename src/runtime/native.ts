import {
    BooleanVal,
    FALSEVAL,
    FunctionCall,
    ListVal,
    MKSTRING,
    NULLVAL,
    NativeFunctionVal,
    NativeObjectVal,
    NumberVal,
    RuntimeVal,
    ValueType,
    checkString,
    isString,
    isValueTypes,
    valueName,
} from "./value"
import { error, expectArgs } from "../utils"
import { evalBlock } from "./evaluator"
import Parser from "../frontend/parser"

export const NATIVEGLOBAL: Record<string, RuntimeVal> = {
    omega: new NumberVal(0),
    pi: new NumberVal(Math.PI),
    e: new NumberVal(Math.E),
    NaN: new NumberVal(NaN),
    avogadro: new NumberVal(6.02214076e-23),
    zero: new NumberVal(0),
    one: new NumberVal(1),
    two: new NumberVal(2),
    three: new NumberVal(3),
    four: new NumberVal(4),
    five: new NumberVal(5),
    six: new NumberVal(6),
    seven: new NumberVal(7),
    eight: new NumberVal(8),
    nine: new NumberVal(9),
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
        if (!isValueTypes(args[0], ValueType.List) || !isString(args[0] as ListVal))
            return error(
                "TypeError: Namespace's argument must be type Character List but it is type",
                valueName[args[0].type]
            )

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
    log: (args, _) => {
        console.log(...args.map((v) => checkString(v)))
        return new ListVal(args)
    },
    print: (args, _) => {
        console.log(...args.map((v) => (v.toString ? v.toString() : 0)))
        return new ListVal(args)
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
    type: (args, _) => {
        const value = expectArgs(args, 1)[0]
        return MKSTRING(valueName[value.type])
    },
    str: (args, _) => {
        const value = expectArgs(args, 1)[0]
        if (!value.toString) return error("TypeError: Cannot convert type", valueName[value.type], "to Character List")
        return MKSTRING(value.toString())
    },
    parse: (args, _) => {
        const value = expectArgs(args, 1)[0]
        if (!value.toNumber) return error("TypeError: Cannot convert type", valueName[value.type], "to Number")
        return new NumberVal(value.toNumber())
    },
    eval: (args, env) => {
        const value = expectArgs(args, 1)[0] as ListVal
        if (!isValueTypes(value, ValueType.List) || !isString(value))
            return error("TypeError: Eval's argument must be type Character List but it is type", valueName[value.type])

        if (!value.toString) return error("XperBug: Cannot convert to string")
        const parser = new Parser()

        const program = parser.produceAST(value.value.map((v) => v.value).join(""))
        return evalBlock(program, env)
    },
    get: (args, env) => {
        const value = expectArgs(args, 1)[0] as ListVal
        if (!isValueTypes(value, ValueType.List) || !isString(value))
            return error("TypeError: Get's argument must be type Character List but it is type", valueName[value.type])
        return env.getVar(value.toString())
    },
    set: (args, env) => {
        args = expectArgs(args, 2)
        if (args.length > 3) return error("RuntimeError: Expected at most 3 arguments but given", args.length)
        const name = args.shift() as ListVal
        if (!isValueTypes(name, ValueType.List) || !isString(name))
            return error(
                "TypeError: Get's first argument must be type Character List but it is type",
                valueName[name.type]
            )
        const value = args.shift() as RuntimeVal
        const isConst = (args.shift() as BooleanVal) ?? FALSEVAL
        if (!isValueTypes(isConst, ValueType.Boolean))
            return error(
                "TypeError: Get's second argument must be type Boolean but it is type",
                ValueType[isConst.type]
            )
        return env.assignVar(name.toString(), value, isConst.value)
    },
}
