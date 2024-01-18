// all binary op definition for ease of use
import Enviroment from "./enviroment"
import { TokenType } from "../frontend/lexer"
import { MKBOOL, RuntimeVal, ValueType, isValueTypes, valueName } from "./value"
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
export const MulOpToken = [TokenType.Star, TokenType.Slash, TokenType.Percent]
export const BinaryOpToken = LogicOpToken.concat(AddOpToken, MulOpToken)

// binary operation type
export type BinaryOpType = "+" | "-" | "*" | "/" | "%" | ">" | "<" | ">=" | "<=" | "==" | "&&" | "||"
export type BinaryFunction = (lhs: RuntimeVal, rhs: RuntimeVal, env: Enviroment) => RuntimeVal

export function isSameType(val1: RuntimeVal, val2: RuntimeVal, type: ValueType) {
    return isValueTypes(val1, type) && isValueTypes(val2, type)
}

function genImpl(name: string, func: keyof RuntimeVal): BinaryFunction {
    return (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs[func]) out = lhs[func](rhs)
        return (
            out ??
            error("TypeError:", name, "is not define between type", valueName[lhs.type], "and", valueName[rhs.type])
        )
    }
}
// implementation for all binary operator between every run time value
export const BinaryOp: Record<BinaryOpType, BinaryFunction> = {
    "+": genImpl("Addition", "add"),
    "-": genImpl("Subtraction", "sub"),
    "*": genImpl("Multiplication", "mul"),
    "/": genImpl("Division", "div"),
    "%": genImpl("Modulus", "mod"),
    ">": genImpl("Greater", "greater"),
    "<": genImpl("Lesser", "lesser"),
    ">=": genImpl("Greater", "greaterEq"),
    "<=": genImpl("Lesser", "lesserEq"),
    "==": (lhs, rhs) => {
        let out: RuntimeVal | undefined
        if (lhs.equal) out = lhs.equal(rhs)
        else if (isValueTypes(lhs, rhs.type)) {
            return MKBOOL(lhs.value === rhs.value) // default equal implementation
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
    "&&": genImpl("Logical", "and"),
    "||": genImpl("Logical", "or"),
}
