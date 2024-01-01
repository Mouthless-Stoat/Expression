// all binary op definition for ease of use
import Enviroment from "./enviroment"
import { TokenType } from "../frontend/lexer"
import { BooleanVal, MKBOOL, NumberVal, RuntimeVal, ValueType, isValueTypes, valueName } from "./value"
import { error } from "../utils"

// export type BinaryOpTokenType = TokenType.Plus | TokenType.Minus | TokenType.Star | TokenType.Slash | TokenType.Percent

// export const BinaryOPToken = [TokenType.Plus, TokenType.Minus, TokenType.Star, TokenType.Slash, TokenType.Percent]

export const LogicalOpToken = [
    TokenType.Greater,
    TokenType.Lesser,
    TokenType.GreaterEqual,
    TokenType.LesserEqual,
    TokenType.Equality,
    TokenType.And,
    TokenType.Or,
]
export const AdditiveOpToken = [TokenType.Plus, TokenType.Minus]
export const MultiplicativeToken = [TokenType.Star, TokenType.Slash, TokenType.Percent]

// binary operation type
export type BinaryOpType = "+" | "-" | "*" | "/" | "%" | ">" | "<" | ">=" | "<=" | "==" | "&&" | "||"

// implementation for all binary operator between every run time value
export const BinaryOp: Record<BinaryOpType, (lhs: RuntimeVal, rhs: RuntimeVal, env: Enviroment) => RuntimeVal> = {
    "+": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal((lhs as NumberVal).value + (rhs as NumberVal).value)
        }
        return error("TypeError: Addition is not define between type", valueName[lhs.type], "and", ValueType[rhs.type])
    },
    "-": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal((lhs as NumberVal).value - (rhs as NumberVal).value)
        }
        return error(
            "TypeError: Subtraction is not define between type",
            valueName[lhs.type],
            "and",
            valueName[rhs.type]
        )
    },
    "*": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal((lhs as NumberVal).value * (rhs as NumberVal).value)
        }
        return error(
            "TypeError: Multiplication is not define between type",
            valueName[lhs.type],
            "and",
            valueName[rhs.type]
        )
    },
    "/": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal((lhs as NumberVal).value / (rhs as NumberVal).value)
        }
        return error("TypeError: Division is not define between type", valueName[lhs.type], "and", valueName[rhs.type])
    },
    "%": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal((lhs as NumberVal).value & (rhs as NumberVal).value)
        }
        return error("TypeError: Modulus is not define between type", valueName[lhs.type], "and", valueName[rhs.type])
    },
    ">": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return MKBOOL((lhs as NumberVal).value > (rhs as NumberVal).value)
        }
        return error(
            "TypeError: Greater than comparasion is not define between type",
            valueName[lhs.type],
            "and",
            valueName[rhs.type]
        )
    },
    "<": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return MKBOOL((lhs as NumberVal).value < (rhs as NumberVal).value)
        }
        return error(
            "TypeError: Lesser than comparasion is not define between type",
            valueName[lhs.type],
            "and",
            valueName[rhs.type]
        )
    },
    ">=": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return MKBOOL((lhs as NumberVal).value >= (rhs as NumberVal).value)
        }
        return error(
            "TypeError: Greater than or Equal to comparasion is not define between type",
            valueName[lhs.type],
            "and",
            valueName[rhs.type]
        )
    },
    "<=": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return MKBOOL((lhs as NumberVal).value <= (rhs as NumberVal).value)
        }
        return error(
            "TypeError: Lesser than or Equal to comparasion is not define between type",
            valueName[lhs.type],
            "and",
            valueName[rhs.type]
        )
    },
    "==": (lhs, rhs) => {
        if (lhs.type == rhs.type) {
            return MKBOOL(lhs.value == rhs.value)
        }
        return error("TypeError: Equality is not define between type", valueName[lhs.type], "and", valueName[rhs.type])
    },
    "&&": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Boolean) && isValueTypes(lhs, ValueType.Boolean)) {
            return MKBOOL((lhs as BooleanVal).value && (rhs as BooleanVal).value)
        }
        return error(
            "TypeError: Logical And is not define between type",
            valueName[lhs.type],
            "and",
            valueName[rhs.type]
        )
    },
    "||": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Boolean) && isValueTypes(lhs, ValueType.Boolean)) {
            return MKBOOL((lhs as BooleanVal).value || (rhs as BooleanVal).value)
        }
        return error(
            "TypeError: Logical Or is not define between type",
            valueName[lhs.type],
            "and",
            valueName[rhs.type]
        )
    },
}
