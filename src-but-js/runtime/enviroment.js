"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const value_1 = require("./value");
const utils_1 = require("../utils");
const native_1 = require("./native");
class Enviroment {
    constructor(parentEnv) {
        this.variables = new Map();
        this.constances = new Set();
        this.evalStack = [];
        this.parent = parentEnv;
        if (parentEnv ? false : true) {
            for (const [name, val] of Object.entries(native_1.NATIVEGLOBAL)) {
                this.assingVar(name, val, false);
            }
            for (const [name, func] of Object.entries(native_1.NATIVEFUNC)) {
                this.assingVar(name, new value_1.NativeFunctionVal(func), true);
            }
            for (const [namespace, prop] of Object.entries(native_1.NATIVENAMESPACE)) {
                const obj = new value_1.ObjectVal(new Map());
                for (const [name, func] of Object.entries(prop)) {
                    obj.value.set(name, { isConst: true, value: func });
                }
                this.assingVar(namespace, obj, true);
            }
        }
    }
    // assign a var, change variable value is it doesn;t exit make it
    // lower scope should not breed out
    assingVar(name, value, isConst, isParent = false) {
        var _a;
        const env = isParent ? (_a = this.resolve(name)) !== null && _a !== void 0 ? _a : this : this;
        if (env.constances.has(name))
            return (0, utils_1.error)(`TypeError: Cannot assign value to Constant "${name}"`);
        if (isConst)
            env.constances.add(name);
        env.variables.set(name, value);
        return value;
    }
    getVar(name) {
        const env = this.resolve(name);
        if (env === undefined) {
            return (0, utils_1.error)(`ReferenceError: Cannot access "${name}" because it does not exist`);
        }
        return env.variables.get(name);
    }
    // resolve a variable, find a variable scope, if it does nt exist error and die
    resolve(name) {
        if (this.variables.has(name))
            return this;
        if (!this.parent)
            return undefined;
        return this.parent.resolve(name);
    }
    pushStack(value) {
        this.evalStack.unshift(value);
        return value;
    }
    isConstant(name) {
        const env = this.resolve(name);
        if (!env)
            return false;
        return env.constances.has(name);
    }
    unsignVar(name) {
        const oldVal = this.getVar(name);
        this.variables.delete(name);
        if (this.isConstant(name))
            this.constances.delete(name);
        return oldVal;
    }
}
exports.default = Enviroment;
