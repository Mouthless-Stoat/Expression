// all binary op definition for ease of use
import Enviroment from "./enviroment"
import { TokenType } from "../frontend/lexer"
import { RuntimeVal, ValueType, isValueTypes, valueName } from "./value"
import { error } from "../utils"

export const LogicOpToken = [
    TokenType.Greater,
    TokenType.Lesser,
    TokenType.GreaterEqual,
    TokenType.LesserEqual,
    TokenType.Equality,
    TokenType.And,
    TokenType.Or,
]
export const AddOpToken = [TokenType.Plus, TokenType.Minus]
export const MultiOpToken = [TokenType.Star, TokenType.Slash, TokenType.Percent]
export const BinaryOpToken = LogicOpToken.concat(AddOpToken, MultiOpToken)

// binary operation type
export type BinaryOpType = "+" | "-" | "*" | "/" | "%" | ">" | "<" | ">=" | "<=" | "==" | "&&" | "||"
export type BinaryFunction = (lhs: RuntimeVal, rhs: RuntimeVal, env: Enviroment) => RuntimeVal

export function isSameType(val1: RuntimeVal, val2: RuntimeVal, type: ValueType) {
    return isValueTypes(val1, type) && isValueTypes(val2, type)
}

// implementation for all binary operator between every run time value
export const BinaryOp: Record<BinaryOpType, BinaryFunction> = {
    "+": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.add) out = lhs.add(rhs)
        return (
            out ??
            error("TypeError: Addition is not define between type", valueName[lhs.type], "and", ValueType[rhs.type])
        )
    },
    "-": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.sub) out = lhs.sub(rhs)
        return (
            out ??
            error("TypeError: Subtraction is not define between type", valueName[lhs.type], "and", valueName[rhs.type])
        )
    },
    "*": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.mul) out = lhs.mul(rhs)
        return (
            out ??
            error(
                "TypeError: Multiplication is not define between type",
                valueName[lhs.type],
                "and",
                valueName[rhs.type]
            )
        )
    },
    "/": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.div) out = lhs.div(rhs)
        return (
            out ??
            error("TypeError: Division is not define between type", valueName[lhs.type], "and", valueName[rhs.type])
        )
    },
    "%": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.mod) out = lhs.mod(rhs)
        return (
            out ??
            error("TypeError: Modulus is not define between type", valueName[lhs.type], "and", valueName[rhs.type])
        )
    },
    ">": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.greater) out = lhs.greater(rhs)
        return (
            out ??
            error(
                "TypeError: Greater than comparasion is not define between type",
                valueName[lhs.type],
                "and",
                valueName[rhs.type]
            )
        )
    },
    "<": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.lesser) out = lhs.lesser(rhs)
        return (
            out ??
            error(
                "TypeError: Lesser than comparasion is not define between type",
                valueName[lhs.type],
                "and",
                valueName[rhs.type]
            )
        )
    },
    ">=": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.greaterEq) out = lhs.greaterEq(rhs)
        return (
            out ??
            error(
                "TypeError: Greater than or Equal to comparasion is not define between type",
                valueName[lhs.type],
                "and",
                valueName[rhs.type]
            )
        )
    },
    "<=": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.lesserEq) out = lhs.lesserEq(rhs)
        return (
            out ??
            error(
                "TypeError: Lesser than or Equal to than comparasion is not define between type",
                valueName[lhs.type],
                "and",
                valueName[rhs.type]
            )
        )
    },
    "==": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.equal) out = lhs.equal(rhs)
        else if (isValueTypes(lhs, rhs.type)) {
            return lhs.value === rhs.value // default equal implementation
        }
        return (
            out ??
            error(
                "TypeError: Equality comparasion is not define between type",
                valueName[lhs.type],
                "and",
                valueName[rhs.type]
            )
        )
    },
    "&&": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.and) out = lhs.and(rhs)
        return (
            out ??
            error(
                "TypeError: Logical And comparasion is not define between type",
                valueName[lhs.type],
                "and",
                valueName[rhs.type]
            )
        )
    },
    "||": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.or) out = lhs.or(rhs)
        return (
            out ??
            error(
                "TypeError: Logical Or comparasion is not define between type",
                valueName[lhs.type],
                "and",
                valueName[rhs.type]
            )
        )
    },
}
