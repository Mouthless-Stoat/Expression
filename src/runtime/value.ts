// this file contain all value to be store at runtime definition

import { BlockLiteral } from "../frontend/ast"
import Enviroment from "./enviroment"
import { error } from "../utils"

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
    method?: Record<string, NativeFunctionVal | FunctionVal>
    toKey?(): string
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

// missing value
export interface NullVal extends RuntimeVal {
    type: ValueType.Null
    value: null
}

// constant so for ease of use
export const NULLVAL: NullVal = {
    type: ValueType.Null,
    value: null,
    toKey() {
        return "null"
    },
}

// number during run time
export class NumberVal implements RuntimeVal {
    type = ValueType.Number
    value: number
    method: Record<string, NativeFunctionVal | FunctionVal> = {
        toFixed: new NativeFunctionVal((args: RuntimeVal[]) => {
            if (args.length > 1) {
                return error("Expected 1 argument but given", args.length)
            }
            this.value = parseFloat(this.value.toFixed(args[0] === undefined ? 1 : args[0].value))
            return this as NumberVal
        }),
    }
    constructor(value: number) {
        this.value = value
    }
    toKey(): string {
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
    toKey() {
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
    toKey() {
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

    constructor(items: RuntimeVal[]) {
        this.value = items
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
    toKey(): string {
        return this.value
    }
}

export class StringVal extends ListVal {
    constructor(string: string) {
        super(string.split("").map((c) => new CharacterVal(c)))
    }
}

export type FunctionCall = (args: RuntimeVal[], env: Enviroment) => RuntimeVal

export class NativeFunctionVal implements RuntimeVal {
    type = ValueType.NativeFuntion
    value: FunctionCall
    constructor(func: FunctionCall) {
        this.value = func
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
