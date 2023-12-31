"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreUnaryOp = exports.PreUnaryOpTokens = void 0;
const lexer_1 = require("../frontend/lexer");
const value_1 = require("./value");
exports.PreUnaryOpTokens = [lexer_1.TokenType.Minus, lexer_1.TokenType.Exclamation, lexer_1.TokenType.Increment, lexer_1.TokenType.Decrement];
// implementation for all binary operator between every run time value
exports.PreUnaryOp = {
    "-": (value) => {
        if ((0, value_1.isValueTypes)(value, value_1.ValueType.Number)) {
            return new value_1.NumberVal(-value.value);
        }
        return value_1.NULLVAL;
    },
    "!": (value) => {
        if ((0, value_1.isValueTypes)(value, value_1.ValueType.Boolean)) {
            return (0, value_1.MKBOOL)(!value.value);
        }
        return value_1.NULLVAL;
    },
    "--": (value) => {
        if ((0, value_1.isValueTypes)(value, value_1.ValueType.Number)) {
            return new value_1.NumberVal(--value.value);
        }
        return value_1.NULLVAL;
    },
    "++": (value) => {
        if ((0, value_1.isValueTypes)(value, value_1.ValueType.Number)) {
            return new value_1.NumberVal(++value.value);
        }
        return value_1.NULLVAL;
    },
};
