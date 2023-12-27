// all binary op definition for ease of use
import { TokenType } from "./lexer"
import { NULLVAL, NumberVal, RuntimeVal, ValueType, isValueType } from "./value"

// export type BinaryOpTokenType = TokenType.Plus | TokenType.Minus | TokenType.Star | TokenType.Slash | TokenType.Percent

// export const BinaryOPToken = [TokenType.Plus, TokenType.Minus, TokenType.Star, TokenType.Slash, TokenType.Percent]

export const AdditiveOpToken = [TokenType.Plus, TokenType.Minus]
export const MultiplicativeToken = [TokenType.Star, TokenType.Slash, TokenType.Percent]

// binary operation type
export type BinaryOpType = "+" | "-" | "*" | "/" | "%"

// implementation for all binary operator between every run time value
export const BinaryOp: Record<BinaryOpType, (lhs: RuntimeVal, rhs: RuntimeVal) => RuntimeVal> = {
    "+": (lhs, rhs) => {
        if (isValueType(rhs, ValueType.Number) && isValueType(lhs, ValueType.Number)) {
            return new NumberVal(lhs.value + rhs.value)
        }

        return NULLVAL
    },
    "-": (lhs, rhs) => {
        if (isValueType(rhs, ValueType.Number) && isValueType(lhs, ValueType.Number)) {
            return new NumberVal(lhs.value - rhs.value)
        }
        return NULLVAL
    },
    "*": (lhs, rhs) => {
        if (isValueType(rhs, ValueType.Number) && isValueType(lhs, ValueType.Number)) {
            return new NumberVal(lhs.value * rhs.value)
        }
        return NULLVAL
    },
    "/": (lhs, rhs) => {
        if (isValueType(rhs, ValueType.Number) && isValueType(lhs, ValueType.Number)) {
            return new NumberVal(lhs.value - rhs.value)
        }
        return NULLVAL
    },
    "%": (lhs, rhs) => {
        if (isValueType(rhs, ValueType.Number) && isValueType(lhs, ValueType.Number)) {
            return new NumberVal(lhs.value - rhs.value)
        }
        return NULLVAL
    },
}
