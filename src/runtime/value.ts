// this file contain all value to be store at runtime definition

import { BlockLiteral } from "../frontend/ast"
import Enviroment from "./enviroment"
import { error } from "../utils"

// type of value at run time
export enum ValueType {
    Null,
    Number,
    Boolean,
    Object,
    NativeFuntion,
    Function,
    String,
    List,
    Control,
}

export function isValueTypes(value: RuntimeVal, ...valueType: ValueType[]): boolean {
    return valueType.some((t) => value.type === t)
}

export const valueName: Record<ValueType, string> = {
    [ValueType.Null]: "Null",
    [ValueType.Number]: "Number",
    [ValueType.Boolean]: "Boolean",
    [ValueType.Object]: "Object",
    [ValueType.NativeFuntion]: "NativeFunction",
    [ValueType.Function]: "Function",
    [ValueType.String]: "String",
    [ValueType.List]: "List",
    [ValueType.Control]: "CONTROL",
}

export function genEnumerable(length: number) {
    return [...Array(length).keys()].map((n) => new NumberVal(n))
}

// value during run time
export interface RuntimeVal {
    type: ValueType
    value: any
    isConst?: boolean
    toKey?(): string
    length?(): number
    enumerate?(): RuntimeVal[]
    iterate?(): RuntimeVal[]
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
}
export const FALSEVAL: BooleanVal = {
    type: ValueType.Boolean,
    value: false,
    toKey() {
        return "false"
    },
}

export const MKBOOL = (bool: boolean): BooleanVal => (bool ? TRUEVAL : FALSEVAL)

export class ObjectVal implements RuntimeVal {
    type = ValueType.Object
    value: Map<string, { isConst: boolean; value: RuntimeVal }>
    isConst: boolean = false
    constructor(value: Map<string, { isConst: boolean; value: RuntimeVal }>) {
        this.value = value
    }
    length(): number {
        return this.value.size
    }
    enumerate(): RuntimeVal[] {
        return genEnumerable(this.length())
    }
    iterate(): RuntimeVal[] {
        return [...this.value.entries()].map(([k, v]) => new ListVal([new StringVal(k), v.value]))
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

export class StringVal implements RuntimeVal {
    type = ValueType.String
    value: string
    isConst: boolean = false
    constructor(str: string) {
        this.value = str
    }
    toKey(): string {
        return this.value
    }
    length(): number {
        return this.value.length
    }
    enumerate(): RuntimeVal[] {
        return genEnumerable(this.length())
    }
    iterate(): RuntimeVal[] {
        return this.value.split("").map((s) => new StringVal(s))
    }
}

export class ListVal implements RuntimeVal {
    type = ValueType.List
    value: RuntimeVal[]
    isConst: boolean = false
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

export class ControlVal implements RuntimeVal {
    type = ValueType.Control
    value: string
    constructor(type: string) {
        this.value = type
    }
}
