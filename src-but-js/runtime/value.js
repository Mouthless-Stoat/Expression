"use strict";
// this file contain all value to be store at runtime definition
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlVal = exports.ListVal = exports.StringVal = exports.FunctionVal = exports.NativeFunctionVal = exports.ObjectVal = exports.MKBOOL = exports.FALSEVAL = exports.TRUEVAL = exports.NumberVal = exports.NULLVAL = exports.genEnumerable = exports.valueName = exports.isValueTypes = exports.ValueType = void 0;
const utils_1 = require("../utils");
// type of value at run time
var ValueType;
(function (ValueType) {
    ValueType[ValueType["Null"] = 0] = "Null";
    ValueType[ValueType["Number"] = 1] = "Number";
    ValueType[ValueType["Boolean"] = 2] = "Boolean";
    ValueType[ValueType["Object"] = 3] = "Object";
    ValueType[ValueType["NativeFuntion"] = 4] = "NativeFuntion";
    ValueType[ValueType["Function"] = 5] = "Function";
    ValueType[ValueType["String"] = 6] = "String";
    ValueType[ValueType["List"] = 7] = "List";
    ValueType[ValueType["Control"] = 8] = "Control";
})(ValueType = exports.ValueType || (exports.ValueType = {}));
function isValueTypes(value, ...valueType) {
    return valueType.some((t) => value.type === t);
}
exports.isValueTypes = isValueTypes;
exports.valueName = {
    [ValueType.Null]: "Null",
    [ValueType.Number]: "Number",
    [ValueType.Boolean]: "Boolean",
    [ValueType.Object]: "Object",
    [ValueType.NativeFuntion]: "NativeFunction",
    [ValueType.Function]: "Function",
    [ValueType.String]: "String",
    [ValueType.List]: "List",
    [ValueType.Control]: "CONTROL",
};
function genEnumerable(length) {
    return [...Array(length).keys()].map((n) => new NumberVal(n));
}
exports.genEnumerable = genEnumerable;
// constant so for ease of use
exports.NULLVAL = {
    type: ValueType.Null,
    value: null,
    toKey() {
        return "null";
    },
};
// number during run time
class NumberVal {
    constructor(value) {
        this.type = ValueType.Number;
        this.method = {
            toFixed: new NativeFunctionVal((args) => {
                if (args.length > 1) {
                    return (0, utils_1.error)("Expected 1 argument but given", args.length);
                }
                this.value = parseFloat(this.value.toFixed(args[0] === undefined ? 1 : args[0].value));
                return this;
            }),
        };
        this.value = value;
    }
    toKey() {
        return this.value.toString();
    }
}
exports.NumberVal = NumberVal;
exports.TRUEVAL = {
    type: ValueType.Boolean,
    value: true,
    toKey() {
        return "true";
    },
};
exports.FALSEVAL = {
    type: ValueType.Boolean,
    value: false,
    toKey() {
        return "false";
    },
};
const MKBOOL = (bool) => (bool ? exports.TRUEVAL : exports.FALSEVAL);
exports.MKBOOL = MKBOOL;
class ObjectVal {
    constructor(value) {
        this.type = ValueType.Object;
        this.isConst = false;
        this.value = value;
    }
    length() {
        return this.value.size;
    }
    enumerate() {
        return genEnumerable(this.length());
    }
    iterate() {
        return [...this.value.entries()].map(([k, v]) => new ListVal([new StringVal(k), v.value]));
    }
}
exports.ObjectVal = ObjectVal;
class NativeFunctionVal {
    constructor(func) {
        this.type = ValueType.NativeFuntion;
        this.value = func;
    }
}
exports.NativeFunctionVal = NativeFunctionVal;
class FunctionVal {
    constructor(param, body, env) {
        this.type = ValueType.Function;
        this.parameter = param;
        this.value = body;
        this.enviroment = env;
    }
}
exports.FunctionVal = FunctionVal;
class StringVal {
    constructor(str) {
        this.type = ValueType.String;
        this.isConst = false;
        this.value = str;
    }
    toKey() {
        return this.value;
    }
    length() {
        return this.value.length;
    }
    enumerate() {
        return genEnumerable(this.length());
    }
    iterate() {
        return this.value.split("").map((s) => new StringVal(s));
    }
}
exports.StringVal = StringVal;
class ListVal {
    constructor(items) {
        this.type = ValueType.List;
        this.isConst = false;
        this.value = items;
    }
    length() {
        return this.value.length;
    }
    enumerate() {
        return genEnumerable(this.length());
    }
    iterate() {
        return this.value;
    }
}
exports.ListVal = ListVal;
class ControlVal {
    constructor(type, carryCount) {
        this.type = ValueType.Control;
        this.value = type;
        this.carryCount = carryCount;
    }
}
exports.ControlVal = ControlVal;
