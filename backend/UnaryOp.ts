import Enviroment from "./enviroment"
import { evalBlock } from "./interpreter"
import { TokenType } from "./lexer"
import { error } from "./utils"
import { FALSEVAL, FunctionVal, NULLVAL, NumberVal, RuntimeVal, TRUEVAL, ValueType, isValueType } from "./value"

export const PreUnaryOpTokens = [TokenType.Minus, TokenType.Exclamation]

// binary operation type
export type PreUnaryOpType = "-" | "!"

// implementation for all binary operator between every run time value
export const PreUnaryOp: Record<PreUnaryOpType, (value: RuntimeVal, env: Enviroment) => RuntimeVal> = {
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
}
