// this file contain all value to be store at runtime definition

import { BlockLiteral } from "../frontend/ast"
import Enviroment from "./enviroment"
import { error, expectArgs } from "../utils"

// type of value at run time
export enum ValueType {
    Null,
    Number,
    Boolean,
    NativeFuntion,
    Function,
    Character,
    List,
    Control,
    None,
}

export function isValueTypes(value: RuntimeVal, ...valueType: ValueType[]): boolean {
    return valueType.some((t) => value.type === t)
}

export function checkString(value: RuntimeVal): string {
    return value.toPrint ? value.toPrint() : value.toString ? value.toString() : value.value
}

export const valueName: Record<ValueType, string> = {
    [ValueType.Null]: "Null",
    [ValueType.Number]: "Number",
    [ValueType.Boolean]: "Boolean",
    [ValueType.NativeFuntion]: "NativeFunction",
    [ValueType.Function]: "Function",
    [ValueType.Character]: "Character",
    [ValueType.List]: "List",
    [ValueType.Control]: "CONTROL",
    [ValueType.None]: "NONE",
}

export function genEnumerable(length: number) {
    return [...Array(length).keys()].map((n) => new NumberVal(n))
}

// value during run time
export interface RuntimeVal {
    type: ValueType
    value: any
    isConst?: boolean
    indexable?: boolean
    method?: Record<string, FunctionCall>
    toString?(): string
    toPrint?(): string
    length?(): number
    enumerate?(): RuntimeVal[]
    iterate?(): RuntimeVal[]
    add?(rhs: RuntimeVal): RuntimeVal | undefined
    sub?(rhs: RuntimeVal): RuntimeVal | undefined
    mul?(rhs: RuntimeVal): RuntimeVal | undefined
    div?(rhs: RuntimeVal): RuntimeVal | undefined
    mod?(rhs: RuntimeVal): RuntimeVal | undefined
    equal?(rhs: RuntimeVal): RuntimeVal | undefined
    greater?(rhs: RuntimeVal): RuntimeVal | undefined
    lesser?(rhs: RuntimeVal): RuntimeVal | undefined
    greaterEq?(rhs: RuntimeVal): RuntimeVal | undefined
    lesserEq?(rhs: RuntimeVal): RuntimeVal | undefined
    and?(rhs: RuntimeVal): RuntimeVal | undefined
    or?(rhs: RuntimeVal): RuntimeVal | undefined
}

export function cloneValue(value: RuntimeVal) {
    return Object.assign(Object.create(Object.getPrototypeOf(value)), value)
}

// missing value
export interface NullVal extends RuntimeVal {
    type: ValueType.Null
    value: null
}

// constant so for ease of use
export const NULLVAL: NullVal = {
    type: ValueType.Null,
    value: null,
    toString() {
        return "null"
    },
}

// number during run time
export class NumberVal implements RuntimeVal {
    type = ValueType.Number
    value: number
    method: Record<string, FunctionCall> = {
        toFixed: (args: RuntimeVal[]) => {
            if (args.length > 1) {
                return error("Expected at most 1 arguments but given", args.length)
            }
            this.value = parseFloat(this.value.toFixed(args[0] === undefined ? 1 : args[0].value))
            return this as NumberVal
        },
        toString: (args: RuntimeVal[]) => {
            args = expectArgs(args, 0)
            return MKSTRING(this.toString())
        },
        ceil: (args: RuntimeVal[]) => {
            args = expectArgs(args, 0)
            return new NumberVal(Math.ceil(this.value))
        },
        floor: (args: RuntimeVal[]) => {
            args = expectArgs(args, 0)
            return new NumberVal(Math.floor(this.value))
        },
    }
    constructor(value: number) {
        this.value = value
    }
    toString(): string {
        return this.value.toString()
    }
    add(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return new NumberVal(this.value + rhs.value)
    }
    sub(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return new NumberVal(this.value - rhs.value)
    }
    mul(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return new NumberVal(this.value * rhs.value)
    }
    div(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return new NumberVal(this.value / rhs.value)
    }
    mod(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return new NumberVal(this.value % rhs.value)
    }
    greater(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return MKBOOL(this.value > rhs.value)
    }
    lesser(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return MKBOOL(this.value < rhs.value)
    }
    greaterEq(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return MKBOOL(this.value >= rhs.value)
    }
    lesserEq(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return MKBOOL(this.value <= rhs.value)
    }
    equal(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return MKBOOL(this.value == rhs.value)
    }
}

export interface BooleanVal extends RuntimeVal {
    type: ValueType.Boolean
    value: boolean
}

export const TRUEVAL: BooleanVal = {
    type: ValueType.Boolean,
    value: true,
    toString() {
        return "true"
    },
    and(rhs) {
        if (isValueTypes(rhs, ValueType.Boolean)) return MKBOOL(this.value && rhs.value)
    },
    or(rhs) {
        if (isValueTypes(rhs, ValueType.Boolean)) return MKBOOL(this.value || rhs.value)
    },
}
export const FALSEVAL: BooleanVal = {
    type: ValueType.Boolean,
    value: false,
    toString() {
        return "false"
    },
}

export const MKBOOL = (bool: boolean): BooleanVal => (bool ? TRUEVAL : FALSEVAL)

export class ListVal implements RuntimeVal {
    // trait
    type = ValueType.List
    indexable = true
    isConst: boolean = false

    value: RuntimeVal[]
    method: Record<string, FunctionCall> = {
        replace: (args: RuntimeVal[], _: Enviroment) => {
            args = expectArgs(args, 2)
            if (!isValueTypes(args[0], ValueType.List)) {
                args[0] = new ListVal([args[0]])
            }
            if (!isValueTypes(args[1], ValueType.List)) {
                args[1] = new ListVal([args[1]])
            }

            const search = args[0] as ListVal
            const replace = args[1] as ListVal

            if (
                this.value.every((v) => isValueTypes(v, ValueType.Character)) &&
                search.value.every((v) => isValueTypes(v, ValueType.Character)) &&
                replace.value.every((v) => isValueTypes(v, ValueType.Character))
            ) {
                return new ListVal(
                    this.toString()
                        .replace(search.toString(), replace.toString())
                        .split("")
                        .map((c) => new CharacterVal(c))
                )
            }
            // https://stackoverflow.com/q/29425820/17055233
            // small changes to improve performent slightly
            const index = (this.method.find(search.value, _) as NumberVal).value
            if (index === -1) return this
            return new ListVal(
                this.value.slice(0, index).concat(replace.value, this.value.slice(index + search.value.length))
            )
        },
        find: (args: RuntimeVal[], _) => {
            let value = expectArgs(args, 1, false)[0] as RuntimeVal
            if (!isValueTypes(value, ValueType.List)) value = new ListVal([value])
            var found, j
            for (var i = 0; i < 1 + (this.value.length - value.value.length); ++i) {
                found = true
                for (j = 0; j < value.value.length; ++j) {
                    if (JSON.stringify(this.value[i + j]) !== JSON.stringify(value.value[j])) {
                        found = false
                        break
                    }
                }
                if (found) return new NumberVal(i)
            }
            return new NumberVal(-1)
        },
        toString: (args: RuntimeVal[]) => {
            expectArgs(args, 0)
            return MKSTRING(this.toString())
        },
    }

    constructor(items: RuntimeVal[]) {
        this.value = items
    }
    toString(): string {
        return this.value
            .map((v) =>
                v.toString
                    ? v.toString()
                    : error("TypeError: Cannot convert type", valueName[v.type], "to Character List")
            )
            .join("")
    }

    toPrint(): string {
        return `[${this.value.map((v) => checkString(v)).join("; ")}]`
    }
    length(): number {
        return this.value.length
    }
    enumerate(): RuntimeVal[] {
        return genEnumerable(this.length())
    }
    iterate(): RuntimeVal[] {
        return this.value
    }
}

export class CharacterVal implements RuntimeVal {
    type = ValueType.Character
    value: string
    constructor(str: string) {
        this.value = str
    }
    toString(): string {
        return `@${this.value}`
    }
}

export const MKSTRING = (str: string) => new ListVal(str.split("").map((c) => new CharacterVal(c)))

export type FunctionCall = (args: RuntimeVal[], env: Enviroment) => RuntimeVal

export class NativeFunctionVal implements RuntimeVal {
    type = ValueType.NativeFuntion
    value: FunctionCall
    constructor(func: FunctionCall) {
        this.value = func
    }
}

export class NativeObjectVal extends NativeFunctionVal {
    object: Map<string, RuntimeVal>
    constructor(obj: Map<string, RuntimeVal>) {
        super((args: RuntimeVal[], _) => {
            args = expectArgs(args, 1)
            if (!args[0].toString)
                return error("TypeError: Cannot convert type", ValueType[args[0].type], "to Character List")
            //@ts-expect-error It should never be undefined cus the list length is at least 1
            const name = args.shift().toString()
            if (!this.object.has(name)) return error(`RuntimeError:`, this.object, `does not have properties "${args}"`)
            if (args.length < 1) {
                return this.object.get(name)
            }
        })
        this.object = obj
    }
}

export class FunctionVal implements RuntimeVal {
    type = ValueType.Function
    value: BlockLiteral
    parameter: string[] // where the function was declare in
    enviroment: Enviroment
    constructor(param: string[], body: BlockLiteral, env: Enviroment) {
        this.parameter = param
        this.value = body
        this.enviroment = env
    }
}

export type ControlType = "break" | "continue"
export class ControlVal implements RuntimeVal {
    type = ValueType.Control
    value: ControlType
    carryCount: number
    constructor(type: ControlType, carryCount: number) {
        this.value = type
        this.carryCount = carryCount
    }
}
