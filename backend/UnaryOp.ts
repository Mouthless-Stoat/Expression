// all binary op definition for ease of use
import { TokenType } from "./lexer"
import { FALSEVAL, NULLVAL, NumberVal, RuntimeVal, TRUEVAL, ValueType, isValueType } from "./value"

export const UnaryOpTokens = [TokenType.Minus, TokenType.Exclamation]

// binary operation type
export type UnaryOpType = "-" | "!"

// implementation for all binary operator between every run time value
export const UnaryOp: Record<UnaryOpType, (value: RuntimeVal) => RuntimeVal> = {
    "-": (value) => {
        if (isValueType(value, ValueType.Number)) {
            return new NumberVal(-value.value)
        }
        return NULLVAL
    },
    "!": (value) => {
        if (isValueType(value, ValueType.Boolean)) {
            return !value.value ? TRUEVAL : FALSEVAL
        }
        return NULLVAL
    },
}
