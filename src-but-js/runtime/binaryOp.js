"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryOp = exports.MultiplicativeToken = exports.AdditiveOpToken = exports.LogicalOpToken = void 0;
const lexer_1 = require("../frontend/lexer");
const value_1 = require("./value");
const utils_1 = require("../utils");
// export type BinaryOpTokenType = TokenType.Plus | TokenType.Minus | TokenType.Star | TokenType.Slash | TokenType.Percent
// export const BinaryOPToken = [TokenType.Plus, TokenType.Minus, TokenType.Star, TokenType.Slash, TokenType.Percent]
exports.LogicalOpToken = [
    lexer_1.TokenType.Greater,
    lexer_1.TokenType.Lesser,
    lexer_1.TokenType.GreaterEqual,
    lexer_1.TokenType.LesserEqual,
    lexer_1.TokenType.Equality,
    lexer_1.TokenType.And,
    lexer_1.TokenType.Or,
];
exports.AdditiveOpToken = [lexer_1.TokenType.Plus, lexer_1.TokenType.Minus];
exports.MultiplicativeToken = [lexer_1.TokenType.Star, lexer_1.TokenType.Slash, lexer_1.TokenType.Percent];
// implementation for all binary operator between every run time value
exports.BinaryOp = {
    "+": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Number) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Number)) {
            return new value_1.NumberVal(lhs.value + rhs.value);
        }
        return (0, utils_1.error)("TypeError: Addition is not define between type", value_1.valueName[lhs.type], "and", value_1.ValueType[rhs.type]);
    },
    "-": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Number) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Number)) {
            return new value_1.NumberVal(lhs.value - rhs.value);
        }
        return (0, utils_1.error)("TypeError: Subtraction is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
    "*": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Number) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Number)) {
            return new value_1.NumberVal(lhs.value * rhs.value);
        }
        return (0, utils_1.error)("TypeError: Multiplication is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
    "/": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Number) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Number)) {
            return new value_1.NumberVal(lhs.value - rhs.value);
        }
        return (0, utils_1.error)("TypeError: Division is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
    "%": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Number) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Number)) {
            return new value_1.NumberVal(lhs.value - rhs.value);
        }
        return (0, utils_1.error)("TypeError: Modulus is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
    ">": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Number) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Number)) {
            return (0, value_1.MKBOOL)(lhs.value > rhs.value);
        }
        return (0, utils_1.error)("TypeError: Greater than comparasion is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
    "<": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Number) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Number)) {
            return (0, value_1.MKBOOL)(lhs.value < rhs.value);
        }
        return (0, utils_1.error)("TypeError: Lesser than comparasion is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
    ">=": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Number) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Number)) {
            return (0, value_1.MKBOOL)(lhs.value >= rhs.value);
        }
        return (0, utils_1.error)("TypeError: Greater than or Equal to comparasion is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
    "<=": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Number) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Number)) {
            return (0, value_1.MKBOOL)(lhs.value <= rhs.value);
        }
        return (0, utils_1.error)("TypeError: Lesser than or Equal to comparasion is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
    "==": (lhs, rhs) => {
        if (lhs.type == rhs.type) {
            return (0, value_1.MKBOOL)(lhs.value == rhs.value);
        }
        return (0, utils_1.error)("TypeError: Equality is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
    "&&": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Boolean) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Boolean)) {
            return (0, value_1.MKBOOL)(lhs.value && rhs.value);
        }
        return (0, utils_1.error)("TypeError: Logical And is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
    "||": (lhs, rhs) => {
        if ((0, value_1.isValueTypes)(rhs, value_1.ValueType.Boolean) && (0, value_1.isValueTypes)(lhs, value_1.ValueType.Boolean)) {
            return (0, value_1.MKBOOL)(lhs.value || rhs.value);
        }
        return (0, utils_1.error)("TypeError: Logical Or is not define between type", value_1.valueName[lhs.type], "and", value_1.valueName[rhs.type]);
    },
};
