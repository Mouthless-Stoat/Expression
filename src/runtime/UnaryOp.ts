import Enviroment from "./enviroment"
import { TokenType } from "../frontend/lexer"
import { MKBOOL, NULLVAL, NumberVal, RuntimeVal, ValueType, isValueTypes, valueName } from "./value"
import { Expr, Identifier, MemberExpr, NodeType, isNodeType } from "../frontend/ast"
import { evaluate, parseMemberKey } from "./interpreter"
import { error } from "../utils"

export const PreUnaryOpTokens = [
    TokenType.Minus,
    TokenType.Exclamation,
    TokenType.Increment,
    TokenType.Decrement,
    TokenType.Star,
]

// binary operation type
export type PreUnaryOpType = "-" | "!" | "++" | "--" | "*"

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
    "*": (expr, env, allow = false) => {
        if (isNodeType(expr, NodeType.Identifier)) return env.unsignVar((expr as Identifier).symbol)
        if (isNodeType(expr, NodeType.MemberExpr)) {
            const member = expr as MemberExpr
            const left = evaluate(member.object, env)
            if (left.unsignMember) {
                return left.unsignMember(parseMemberKey(left, member, env), allow)
            }
        }
        return error("TypeError: Cannot unsign")
    },
}
