import Enviroment from "./enviroment"
import { TokenType } from "../frontend/lexer"
import { ListVal, MKBOOL, NONE, NULLVAL, NumberVal, RuntimeVal, ValueType, isValueTypes } from "./value"
import { Expr, Identifier, IndexExpr, NodeType, isNodeType } from "../frontend/ast"
import { evaluate } from "./evaluator"
import { error } from "../utils"

export const PreUnaryTokens = [
    TokenType.Minus,
    TokenType.Exclamation,
    TokenType.DoublePlus,
    TokenType.DoubleMinus,
    TokenType.Star,
    TokenType.Ampersand,
    TokenType.Tilde,
]

// binary operation type
export type PreUnaryType = "-" | "!" | "++" | "--" | "*" | "&" | "~"

// implementation for all binary operator between every run time value
export const PreUnaryOp: Record<PreUnaryType, (expr: Expr, env: Enviroment) => RuntimeVal> = {
    "-": (expr, env) => {
        const value = evaluate(expr, env)
        if (isValueTypes(value, ValueType.Number)) {
            return new NumberVal(-value.value)
        } else if (isValueTypes(value, ValueType.List)) {
            return new ListVal((value as ListVal).value.reverse())
        }
        return NULLVAL
    },
    "!": (expr, env) => {
        const value = evaluate(expr, env)
        if (isValueTypes(value, ValueType.Boolean)) {
            return MKBOOL(!value.value)
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
    "*": (expr, env) => {
        if (isNodeType(expr, NodeType.Identifier)) return env.unsignVar((expr as Identifier).symbol)
        if (isNodeType(expr, NodeType.IndexExpr)) {
            const cloneEnv = env.clone() // clone the env to redo some cal

            const indexExpr = expr as IndexExpr // cast the expr
            const oldVal = evaluate(indexExpr, env) // get the old value

            // use a clone env to not do the eval using the same env
            // we can safely use these value without checking because the previous retrival
            // pass if we get here
            const indexable = evaluate(indexExpr.expr, cloneEnv).value
            const index = evaluate(indexExpr.index, cloneEnv).value

            // remove the item from the list
            indexable.splice(index, 1)

            return oldVal
        }
        return error("TypeError: Cannot unsign")
    },
    "&": (expr, env) => {
        if (!isNodeType(expr, NodeType.Identifier)) return error("TypeError: Cannot access lifetime of non-Identifier")
        return env.trueGetVar((expr as Identifier).symbol)[0].accessLimit
    },
    "~": (_, __) => {
        return NONE
    },
}

export const PostUnaryToken = [TokenType.DoublePlus, TokenType.DoubleMinus]

export type PostUnaryType = "--" | "++"

export const PostUnaryOp: Record<PostUnaryType, (expr: Expr, env: Enviroment) => RuntimeVal> = {
    "--": (expr, env) => {
        const value = evaluate(expr, env)
        if (isValueTypes(value, ValueType.Number)) {
            return new NumberVal(value.value--)
        }
        return NULLVAL
    },
    "++": (expr, env) => {
        const value = evaluate(expr, env)
        if (isValueTypes(value, ValueType.Number)) {
            return new NumberVal(value.value++)
        }
        return NULLVAL
    },
}
