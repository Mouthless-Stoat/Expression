import Enviroment from "./enviroment"
import { TokenType } from "../frontend/lexer"
import { MKBOOL, NULLVAL, NumberVal, RuntimeVal, ValueType, isValueTypes } from "./value"

export const PreUnaryOpTokens = [TokenType.Minus, TokenType.Exclamation, TokenType.Increment, TokenType.Decrement]

// binary operation type
export type PreUnaryOpType = "-" | "!" | "++" | "--"

// implementation for all binary operator between every run time value
export const PreUnaryOp: Record<PreUnaryOpType, (value: RuntimeVal, env: Enviroment) => RuntimeVal> = {
    "-": (value) => {
        if (isValueTypes(value, ValueType.Number)) {
            return new NumberVal(-value.value)
        }
        return NULLVAL
    },
    "!": (value) => {
        if (isValueTypes(value, ValueType.Boolean)) {
            return MKBOOL(!value.value)
        }
        return NULLVAL
    },
    "--": (value) => {
        if (isValueTypes(value, ValueType.Number)) {
            return new NumberVal(--value.value)
        }
        return NULLVAL
    },
    "++": (value) => {
        if (isValueTypes(value, ValueType.Number)) {
            return new NumberVal(++value.value)
        }
        return NULLVAL
    },
}
