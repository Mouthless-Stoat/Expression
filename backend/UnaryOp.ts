import Enviroment from "./enviroment"
import { evalBlock } from "./interpreter"
import { TokenType } from "./lexer"
import { error } from "./utils"
import { FALSEVAL, FunctionVal, NULLVAL, NumberVal, RuntimeVal, TRUEVAL, ValueType, isValueType } from "./value"

export const UnaryOpTokens = [TokenType.Minus, TokenType.Exclamation, TokenType.Octothorp]

// binary operation type
export type UnaryOpType = "-" | "!" | "#"

// implementation for all binary operator between every run time value
export const UnaryOp: Record<UnaryOpType, (value: RuntimeVal, env: Enviroment) => RuntimeVal> = {
    "-": (value) => {
        if (isValueType(value, ValueType.Number)) {
            return new NumberVal(-value.value)
        }
        return NULLVAL
    },
    "!": (value) => {
        if (isValueType(value, ValueType.Boolean)) {
            return value.value ? FALSEVAL : TRUEVAL
        }
        return NULLVAL
    },
    "#": (value, env) => {
        if (isValueType(value, ValueType.Function)) {
            const func = value as FunctionVal
            if (env.evalStack.length < func.parameter.length) {
                return error("Cannot do a stack call because missing argument")
            }
            for (const i in func.parameter) {
                func.value.enviroment.assingVar(func.parameter[i], env.evalStack[i], false)
            }
            return evalBlock(func.value, func.value.enviroment)
        } else if (isValueType(value, ValueType.NativeFuntion)) {
        }
        return NULLVAL
    },
}
