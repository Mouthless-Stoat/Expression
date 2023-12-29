// all binary op definition for ease of use
import Enviroment from "./enviroment"
import { TokenType } from "../frontend/lexer"
import { NULLVAL, NumberVal, RuntimeVal, ValueType, isValueTypes } from "./value"
import { Expr } from "../frontend/ast"
import { evaluate } from "./interpreter"

// export type BinaryOpTokenType = TokenType.Plus | TokenType.Minus | TokenType.Star | TokenType.Slash | TokenType.Percent

// export const BinaryOPToken = [TokenType.Plus, TokenType.Minus, TokenType.Star, TokenType.Slash, TokenType.Percent]

export const AdditiveOpToken = [TokenType.Plus, TokenType.Minus]
export const MultiplicativeToken = [TokenType.Star, TokenType.Slash, TokenType.Percent]

// binary operation type
export type BinaryOpType = "+" | "-" | "*" | "/" | "%"

// implementation for all binary operator between every run time value
export const BinaryOp: Record<BinaryOpType, (lhsExpr: Expr, rhsExpr: Expr, env: Enviroment) => RuntimeVal> = {
    "+": (lhsExpr, rhsExpr, env) => {
        const [lhs, rhs] = [evaluate(lhsExpr, env), evaluate(rhsExpr, env)]
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal(lhs.value + rhs.value)
        }

        return NULLVAL
    },
    "-": (lhsExpr, rhsExpr, env) => {
        const [lhs, rhs] = [evaluate(lhsExpr, env), evaluate(rhsExpr, env)]
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal(lhs.value - rhs.value)
        }
        return NULLVAL
    },
    "*": (lhsExpr, rhsExpr, env) => {
        const [lhs, rhs] = [evaluate(lhsExpr, env), evaluate(rhsExpr, env)]

        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal(lhs.value * rhs.value)
        }
        return NULLVAL
    },
    "/": (lhsExpr, rhsExpr, env) => {
        const [lhs, rhs] = [evaluate(lhsExpr, env), evaluate(rhsExpr, env)]

        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal(lhs.value - rhs.value)
        }
        return NULLVAL
    },
    "%": (lhsExpr, rhsExpr, env) => {
        const [lhs, rhs] = [evaluate(lhsExpr, env), evaluate(rhsExpr, env)]
        if (isValueTypes(rhs, ValueType.Number) && isValueTypes(lhs, ValueType.Number)) {
            return new NumberVal(lhs.value - rhs.value)
        }
        return NULLVAL
    },
}
