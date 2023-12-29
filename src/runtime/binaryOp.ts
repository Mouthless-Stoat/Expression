// all binary op definition for ease of use
import Enviroment from "./enviroment"
import { TokenType } from "../frontend/lexer"
import { FALSEVAL, NULLVAL, NumberVal, RuntimeVal, TRUEVAL, ValueType, isValueTypes } from "./value"
import { Expr } from "../frontend/ast"
import { evaluate } from "./interpreter"

// export type BinaryOpTokenType = TokenType.Plus | TokenType.Minus | TokenType.Star | TokenType.Slash | TokenType.Percent

// export const BinaryOPToken = [TokenType.Plus, TokenType.Minus, TokenType.Star, TokenType.Slash, TokenType.Percent]

export const LogicalOpToken = [TokenType.Greater]
export const AdditiveOpToken = [TokenType.Plus, TokenType.Minus]
export const MultiplicativeToken = [TokenType.Star, TokenType.Slash, TokenType.Percent]

// binary operation type
export type BinaryOpType = "+" | "-" | "*" | "/" | "%" | ">"

// implementation for all binary operator between every run time value
export const BinaryOp: Record<BinaryOpType, (lhs: RuntimeVal, rhs: RuntimeVal, env: Enviroment) => RuntimeVal> = {
    "+": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal((lhs as NumberVal).value + (rhs as NumberVal).value)
        }

        return NULLVAL
    },
    "-": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal((lhs as NumberVal).value - (rhs as NumberVal).value)
        }
        return NULLVAL
    },
    "*": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal((lhs as NumberVal).value * (rhs as NumberVal).value)
        }
        return NULLVAL
    },
    "/": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal((lhs as NumberVal).value - (rhs as NumberVal).value)
        }
        return NULLVAL
    },
    "%": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal((lhs as NumberVal).value - (rhs as NumberVal).value)
        }
        return NULLVAL
    },
    ">": (lhs, rhs) => {
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return (lhs as NumberVal).value > (rhs as NumberVal).value ? TRUEVAL : FALSEVAL
        }
        return NULLVAL
    },
}
