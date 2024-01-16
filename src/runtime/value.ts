// this file contain all value to be store at runtime definition

import { BlockLiteral } from "../frontend/ast"
import Enviroment from "./enviroment"
import { error, expectArgs } from "../utils"
import deepClone from "lodash.clonedeep"
import Color from "../color"

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
    toNumber?(): number
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

// missing value
export interface NullVal extends RuntimeVal {
    type: ValueType.Null
    value: null
    toString(): string
    toPrint(): string
}

// constant so for ease of use
export const NULLVAL: NullVal = {
    type: ValueType.Null,
    value: null,
    toString() {
        return "null"
    },
    toPrint() {
        return Color.magenta(this.toString())
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
    toPrint(): string {
        return Color.yellow(this.toString())
    }
    toNumber(): number {
        return this.value
    }
    add(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return new NumberVal(this.value + rhs.value)
        else if (isValueTypes(rhs, ValueType.List)) {
            const copy = deepClone(rhs) as ListVal
            return new ListVal(
                copy.value.map(
                    (v) =>
                        this.add(v) ??
                        error(
                            "TypeError: Addition is not define between type",
                            valueName[this.type],
                            "and",
                            valueName[v.type]
                        )
                )
            )
        }
    }
    sub(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return new NumberVal(this.value - rhs.value)
        else if (isValueTypes(rhs, ValueType.List)) {
            const copy = deepClone(rhs) as ListVal
            return new ListVal(
                copy.value.map(
                    (v) =>
                        this.sub(v) ??
                        error(
                            "TypeError: Subtraction is not define between type",
                            valueName[this.type],
                            "and",
                            valueName[v.type]
                        )
                )
            )
        }
    }
    mul(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return new NumberVal(this.value * rhs.value)
        else if (isValueTypes(rhs, ValueType.List)) {
            const copy = deepClone(rhs) as ListVal
            return new ListVal(
                copy.value.map(
                    (v) =>
                        this.mul(v) ??
                        error(
                            "TypeError: Multiplication is not define between type",
                            valueName[this.type],
                            "and",
                            valueName[v.type]
                        )
                )
            )
        }
    }
    div(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return new NumberVal(this.value / rhs.value)
        else if (isValueTypes(rhs, ValueType.List)) {
            const copy = deepClone(rhs) as ListVal
            return new ListVal(
                copy.value.map(
                    (v) =>
                        this.div(v) ??
                        error(
                            "TypeError: Division is not define between type",
                            valueName[this.type],
                            "and",
                            valueName[v.type]
                        )
                )
            )
        }
    }
    mod(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) return new NumberVal(this.value % rhs.value)
        else if (isValueTypes(rhs, ValueType.List)) {
            const copy = deepClone(rhs) as ListVal
            return new ListVal(
                copy.value.map(
                    (v) =>
                        this.mod(v) ??
                        error(
                            "TypeError: Modulus is not define between type",
                            valueName[this.type],
                            "and",
                            valueName[v.type]
                        )
                )
            )
        }
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
    and(rhs: RuntimeVal): RuntimeVal | undefined
    or(rhs: RuntimeVal): RuntimeVal | undefined
    toString(): string
    toPrint(): string
}

export const TRUEVAL: BooleanVal = {
    type: ValueType.Boolean,
    value: true,
    toString() {
        return "true"
    },
    toPrint() {
        return Color.red(this.toString())
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
    toPrint() {
        return Color.red(this.toString())
    },
    and(rhs) {
        if (isValueTypes(rhs, ValueType.Boolean)) return MKBOOL(this.value && rhs.value)
    },
    or(rhs) {
        if (isValueTypes(rhs, ValueType.Boolean)) return MKBOOL(this.value || rhs.value)
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
        find: (args: RuntimeVal[], _) => {
            let value = expectArgs(args, 1, false)[0] as RuntimeVal
            if (!isValueTypes(value, ValueType.List)) value = new ListVal([value])
            // https://stackoverflow.com/q/29425820/17055233
            // small changes to improve performent slightly
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
            const index = (this.method.find(search.value, _) as NumberVal).value
            if (index === -1) return this
            return new ListVal(
                this.value.slice(0, index).concat(replace.value, this.value.slice(index + search.value.length))
            )
        },
        findAll: (args: RuntimeVal[], _) => {
            let value = expectArgs(args, 1, false)[0] as RuntimeVal
            if (!isValueTypes(value, ValueType.List)) value = new ListVal([value])
            // https://stackoverflow.com/q/29425820/17055233
            // small changes to make find all
            var found, j
            var foundIndex = []
            for (var i = 0; i < 1 + (this.value.length - value.value.length); ++i) {
                found = true
                for (j = 0; j < value.value.length; ++j) {
                    if (JSON.stringify(this.value[i + j]) !== JSON.stringify(value.value[j])) {
                        found = false
                        break
                    }
                }
                if (found) foundIndex.push(new NumberVal(i))
            }
            return new ListVal(foundIndex)
        },
        replaceAll: (args: RuntimeVal[], _: Enviroment) => {
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
                        .replaceAll(search.toString(), replace.toString())
                        .split("")
                        .map((c) => new CharacterVal(c))
                )
            }
            const indexs = (this.method.findAll(search.value, _) as ListVal).value.map((v) => (v as NumberVal).value)
            if (indexs.length < 1) return this
            const copy = deepClone(this)
            for (const index of indexs) {
                copy.value = copy.value
                    .slice(0, index)
                    .concat(replace.value, this.value.slice(index + search.value.length))
            }
            return copy
        },
        split: (args: RuntimeVal[], env: Enviroment) => {
            let value = expectArgs(args, 1)[0] as ListVal
            if (!isValueTypes(value, ValueType.List)) value = new ListVal([value])

            if (
                this.value.every((v) => isValueTypes(v, ValueType.Character)) &&
                value.value.every((v) => isValueTypes(v, ValueType.Character))
            ) {
                return new ListVal(
                    this.toString()
                        .split(value.toString())
                        .map((s) => MKSTRING(s))
                )
            }
            const indexs = (this.method.findAll(args, env) as ListVal).value.map((v) => (v as NumberVal).value)
            const out: ListVal[] = []
            for (const i in indexs) {
                out.push(new ListVal(this.value.slice(indexs[parseInt(i)] + 1, indexs[parseInt(i) + 1])))
            }
            return new ListVal(out)
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
    toNumber(): number {
        const num = this.value
            .map((v) =>
                v.toNumber ? v.toNumber() : error("TypeError: Cannot convert type", valueName[v.type], "to Number")
            )
            .join("")

        return parseFloat(num)
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

    equal(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.List)) {
            const value = this.value
            const rightVal = (rhs as ListVal).value
            if (value.length !== rightVal.length) {
                return FALSEVAL
            }
            return MKBOOL(JSON.stringify(value) === JSON.stringify(rightVal))
        }
    }

    add(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.List)) {
            return new ListVal(this.value.concat(rhs.value))
        }
    }
    mul(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) {
            const num = Math.round((rhs as NumberVal).value)
            const list = new Array(Math.abs(num)).fill(this.value).flat()
            if (num < 0) list.reverse()
            return new ListVal(list)
        } else if (isValueTypes(rhs, ValueType.List)) {
            let curr: ListVal = this
            for (const val of (rhs as ListVal).value) {
                curr = new ListVal([
                    curr.mul(val) ??
                        error(
                            "TypeError: Multiplication is not define between type",
                            valueName[curr.type],
                            "and",
                            valueName[val.type]
                        ),
                ])
            }
            return curr.value[0]
        }
    }
    div(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) {
            const out = []
            const size = Math.round(this.value.length / (rhs as NumberVal).value)
            for (let i = 0; i < this.value.length; i += Math.abs(size)) {
                const list = this.value.slice(i, i + Math.abs(size))
                if (size < 0) list.reverse()
                out.push(new ListVal(list))
            }
            return new ListVal(out)
        } else if (isValueTypes(rhs, ValueType.List)) {
            let curr: ListVal = this
            for (const val of (rhs as ListVal).value) {
                curr =
                    curr.div(val) ??
                    error(
                        "TypeError: Multiplication is not define between type",
                        valueName[curr.type],
                        "and",
                        valueName[val.type]
                    )
            }
            return curr
        }
    }
    mod(rhs: RuntimeVal): RuntimeVal | undefined {
        if (isValueTypes(rhs, ValueType.Number)) {
            const out = []
            const size = Math.round((rhs as NumberVal).value)
            for (let i = 0; i < this.value.length; i += Math.abs(size)) {
                const list = this.value.slice(i, i + Math.abs(size))
                if (size < 0) list.reverse()
                out.push(new ListVal(list))
            }
            return new ListVal(out)
        } else if (isValueTypes(rhs, ValueType.List)) {
            let curr: ListVal = this
            for (const val of (rhs as ListVal).value) {
                curr =
                    curr.mod(val) ??
                    error(
                        "TypeError: Multiplication is not define between type",
                        valueName[curr.type],
                        "and",
                        valueName[val.type]
                    )
            }
            return curr
        }
    }
}

export class CharacterVal implements RuntimeVal {
    type = ValueType.Character
    value: string
    constructor(str: string) {
        this.value = str
    }
    toPrint(): string {
        return `\x1b[32m@${this.value}\x1b[0m`
    }
    toString(): string {
        return this.value
    }
    toNumber(): number {
        const num = parseFloat(this.value)
        return isNaN(num) ? error(`TypeError: Cannot convert Character "${this.value}" to Number`) : num
    }
}

export const isString = (value: ListVal) => value.value.every((v) => isValueTypes(v, ValueType.Character))

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

interface NoneVal extends RuntimeVal {
    type: ValueType.None
    value: "none"
}

export const NONE: NoneVal = {
    type: ValueType.None,
    value: "none",
}
