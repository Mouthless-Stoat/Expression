// this file contain all value to be store at runtime definition

import { Block, Expr } from "./ast"
import Enviroment from "./enviroment"
import { NATIVEFUNC } from "./nativeFunc"
import { error } from "./utils"

// type of value at run time
export enum ValueType {
    Null,
    Number,
    Boolean,
    Object,
    NativeFuntion,
    Function,
}

export function isValueTypes(value: RuntimeVal, ...valueType: ValueType[]): boolean {
    return valueType.some((t) => value.type === t)
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
}

export interface BooleanVal extends RuntimeVal {
    type: ValueType.Boolean
    value: boolean
}

export const TRUEVAL: BooleanVal = { type: ValueType.Boolean, value: true }
export const FALSEVAL: BooleanVal = { type: ValueType.Boolean, value: false }

export class ObjectVal implements RuntimeVal {
    type = ValueType.Object
    value: Map<string, { isConst: boolean; value: RuntimeVal }>
    constructor(value: Map<string, { isConst: boolean; value: RuntimeVal }>) {
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
    parameter: string[] // where the function was declare in
    enviroment: Enviroment
    constructor(param: string[], body: Block, env: Enviroment) {
        this.parameter = param
        this.value = body
        this.enviroment = env
    }
}
