// this file contain all value to be store at runtime definition

import { Block, Expr } from "./ast"
import Enviroment from "./enviroment"
import { NATIVEFUNC } from "./nativeFunc"

// type of value at run time
export enum ValueType {
    Null,
    Number,
    Boolean,
    Object,
    NativeFuntion,
    Function,
}

export function isValueType(value: RuntimeVal, valueType: ValueType): boolean {
    return value.type === valueType
}

// value during run time
export interface RuntimeVal {
    type: ValueType
    value: any
}

// missing value
export interface NullVal extends RuntimeVal {
    type: ValueType.Null
    value: null
}

// constant so for ease of use
export const NULLVAL: NullVal = { type: ValueType.Null, value: null }

// number during run time
export class NumberVal implements RuntimeVal {
    type = ValueType.Number
    value: number
    constructor(value: number) {
        this.value = value
    }
}

export interface BooleanVal extends RuntimeVal {
    type: ValueType.Boolean
    value: boolean
}

export const TRUEVAL: BooleanVal = { type: ValueType.Boolean, value: true }
export const FALSEVAL: BooleanVal = { type: ValueType.Boolean, value: false }

export class ObjectVal implements RuntimeVal {
    type = ValueType.Object
    value: Map<string, RuntimeVal>
    constructor(value: Map<string, RuntimeVal>) {
        this.value = value
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
    value: Block
    parameter: string[]
    enviroment: Enviroment
    constructor(param: string[], body: Block, env: Enviroment) {
        this.parameter = param
        this.value = body
        this.enviroment = env
    }
}
