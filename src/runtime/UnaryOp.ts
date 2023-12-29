import Enviroment from "./enviroment"
import { TokenType } from "../frontend/lexer"
import { FALSEVAL, NULLVAL, NumberVal, RuntimeVal, TRUEVAL, ValueType, isValueTypes } from "./value"
import { Expr } from "../frontend/ast"
import { evaluate } from "./interpreter"

export const PreUnaryOpTokens = [TokenType.Minus, TokenType.Exclamation, TokenType.Increment, TokenType.Decrement]

// binary operation type
export type PreUnaryOpType = "-" | "!" | "++" | "--"

// implementation for all binary operator between every run time value
export const PreUnaryOp: Record<PreUnaryOpType, (expr: Expr, env: Enviroment) => RuntimeVal> = {
    "-": (expr, env) => {
        const value = evaluate(expr, env)
        if (isValueTypes(value, ValueType.Number)) {
            return new NumberVal(-value.value)
        }
        return NULLVAL
    },
    "!": (expr, env) => {
        const value = evaluate(expr, env)
        if (isValueTypes(value, ValueType.Boolean)) {
            return value.value ? FALSEVAL : TRUEVAL
        }
        return NULLVAL
    },
    "--": (expr, env) => {
        const value = evaluate(expr, env)
        if (isValueTypes(value, ValueType.Number)) {
            return new NumberVal(--value.value)
        }
        return NULLVAL
    },
    "++": (expr, env) => {
        const value = evaluate(expr, env)
        if (isValueTypes(value, ValueType.Number)) {
            return new NumberVal(++value.value)
        }
        return NULLVAL
    },
}
