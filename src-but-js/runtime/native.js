"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NATIVENAMESPACE = exports.NATIVEFUNC = exports.NATIVEGLOBAL = void 0;
const value_1 = require("./value");
const utils_1 = require("../utils");
exports.NATIVEGLOBAL = {
    π: new value_1.NumberVal(Math.PI),
    ω: new value_1.NumberVal(0),
    pi: new value_1.NumberVal(Math.PI),
    NaN: new value_1.NumberVal(NaN),
    e: new value_1.NumberVal(Math.E),
    L: new value_1.NumberVal(6.02214076e23),
    Nₐ: new value_1.NumberVal(6.02214076e23),
};
exports.NATIVEFUNC = {
    print: (args, _) => {
        console.log(...args.map((v) => v.value));
        return value_1.NULLVAL;
    },
};
function expectArgs(args, amount, isExact = true) {
    if (isExact ? args.length !== amount : args.length > amount)
        return (0, utils_1.error)("Expected", amount, "argument but given", args.length);
    return args.slice(0, amount);
}
function MathProp(func, amount) {
    return new value_1.NativeFunctionVal((args, _) => new value_1.NumberVal(func(...expectArgs(args, amount).map((n) => n.value))));
}
exports.NATIVENAMESPACE = {
    math: {
        abs: MathProp(Math.abs, 1),
        sin: MathProp(Math.sin, 1),
        cos: MathProp(Math.cos, 1),
        pi: new value_1.NumberVal(Math.PI),
        e: new value_1.NumberVal(Math.E),
    },
};
