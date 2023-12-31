"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evalCallExpr = exports.evalBlock = exports.evaluate = void 0;
const ast_1 = require("../frontend/ast");
const value_1 = require("./value");
const enviroment_1 = __importDefault(require("./enviroment"));
const utils_1 = require("../utils");
const binaryOp_1 = require("./binaryOp");
const UnaryOp_1 = require("./UnaryOp");
//main eval function
function evaluate(astNode, env) {
    switch (astNode.type) {
        // literal
        case ast_1.NodeType.NumberLiteral:
            return new value_1.NumberVal(astNode.number);
        case ast_1.NodeType.NullLiteral:
            return value_1.NULLVAL;
        case ast_1.NodeType.BooleanLiteral:
            return astNode.value ? value_1.TRUEVAL : value_1.FALSEVAL;
        case ast_1.NodeType.StringLiteral:
            return new value_1.StringVal(astNode.string);
        case ast_1.NodeType.BlockLiteral:
            return evalBlock(astNode, env);
        case ast_1.NodeType.ObjectLiteral:
            return evalObjectExpr(astNode, env);
        case ast_1.NodeType.ListLiteral:
            return evalListExpr(astNode, env);
        case ast_1.NodeType.ControlLiteral:
            return new value_1.ControlVal(astNode.control, astNode.carryCount);
        // expr
        case ast_1.NodeType.BinaryExpr:
            return evalBinExpr(astNode, env);
        case ast_1.NodeType.Identifier:
            return evalIdentifier(astNode, env);
        case ast_1.NodeType.AssigmentExpr:
            return evalAssignmentExpr(astNode, env);
        case ast_1.NodeType.CallExpr:
            return evalCallExpr(astNode, env);
        case ast_1.NodeType.FunctionExpr:
            return evalFuncExpr(astNode, env);
        case ast_1.NodeType.PreUnaryExpr:
            return evalUnaryExpr(astNode, env);
        case ast_1.NodeType.MemberExpr:
            return evalMemberExpr(astNode, env);
        case ast_1.NodeType.IfExpr:
            return evalIfExpr(astNode, env);
        case ast_1.NodeType.ShiftExpr:
            return evalShiftExpr(astNode, env);
        case ast_1.NodeType.WhileExpr:
            return evalWhileExpr(astNode, env);
        case ast_1.NodeType.ForExpr:
            return evalForExpr(astNode, env);
        default:
            return (0, utils_1.error)(`This AST Node is not implemented in interpreter:`, astNode);
    }
}
exports.evaluate = evaluate;
function evalBlock(block, env, isGlobal = false) {
    let out = value_1.NULLVAL;
    const blockEnv = isGlobal ? env : new enviroment_1.default(env);
    for (const expr of block.value) {
        out = blockEnv.pushStack(evaluate(expr, blockEnv));
        if ((0, value_1.isValueTypes)(out, value_1.ValueType.Control)) {
            let control = out;
            if (control.carryCount > 0) {
                control.carryCount -= 1;
                return control;
            }
            else {
                switch (control.value) {
                    case "break":
                        return value_1.NULLVAL;
                    case "continue":
                        return value_1.TRUEVAL;
                }
            }
        }
    }
    return out;
}
exports.evalBlock = evalBlock;
// other eval
function evalBinExpr(expr, env) {
    return binaryOp_1.BinaryOp[expr.operator](evaluate(expr.leftHand, env), evaluate(expr.rightHand, env), env);
}
function evalUnaryExpr(expr, env) {
    return UnaryOp_1.PreUnaryOp[expr.operator](evaluate(expr.expr, env), env);
}
function evalIdentifier(iden, env) {
    return env.getVar(iden.symbol);
}
function evalAssignmentExpr(expr, env) {
    var _a, _b;
    if (expr.lefthand.type === ast_1.NodeType.Identifier) {
        const iden = expr.lefthand.symbol;
        const value = evaluate(expr.rightHand, env);
        if (!((_a = value.isConst) !== null && _a !== void 0 ? _a : true))
            value.isConst = expr.isConst;
        return env.assingVar(iden, value, expr.isConst, expr.isParent);
    }
    else if (expr.lefthand.type === ast_1.NodeType.MemberExpr) {
        const left = expr.lefthand;
        const obj = evaluate(left.object, env);
        if (!(0, value_1.isValueTypes)(obj, value_1.ValueType.Object)) {
            return (0, utils_1.error)("TypeError: Cannot access type", value_1.ValueType[obj.type]);
        }
        const prop = left.member.symbol;
        const val = evaluate(expr.rightHand, env);
        if (!((_b = obj.value.get(prop)) === null || _b === void 0 ? void 0 : _b.isConst)) {
            ;
            obj.value.set(prop, { isConst: false, value: val });
        }
        else {
            return (0, utils_1.error)(`TypeError: Cannot assign to Constant properties "${prop}"`);
        }
        return val;
    }
    return (0, utils_1.error)("SyntaxError: Invalid left-hand of assignment");
}
function evalObjectExpr(obj, env) {
    var _a;
    const prop = new Map();
    for (const { key: k, value, isConst } of obj.properties) {
        let key;
        if (k.type !== ast_1.NodeType.Identifier) {
            const evalKey = evaluate(k, env);
            if (!evalKey.toKey) {
                return (0, utils_1.error)("TypeError: Object key can't be of type", value_1.valueName[evalKey.type]);
            }
            key = evalKey.toKey();
        }
        else {
            key = k.symbol;
        }
        const evalValue = value === undefined ? env.getVar(key) : evaluate(value, env);
        if (!((_a = evalValue.isConst) !== null && _a !== void 0 ? _a : true))
            evalValue.isConst = isConst;
        prop.set(key, {
            isConst: isConst,
            value: evalValue,
        });
    }
    return new value_1.ObjectVal(prop);
}
function evalCallExpr(caller, env) {
    const args = caller.args.map((arg) => evaluate(arg, env));
    const func = evaluate(caller.caller, env);
    if ((0, value_1.isValueTypes)(func, value_1.ValueType.Function)) {
        const fn = func;
        const scope = new enviroment_1.default(env);
        if (args.length != fn.parameter.length) {
            return (0, utils_1.error)("Expected", fn.parameter.length, "argument but given", args.length);
        }
        // make param var
        for (const i in fn.parameter) {
            scope.assingVar(fn.parameter[i], args[i], false);
        }
        return evalBlock(fn.value, scope);
    }
    else if ((0, value_1.isValueTypes)(func, value_1.ValueType.NativeFuntion))
        return func.value(args, env);
    else
        return (0, utils_1.error)("TypeError:", func.value, "is not a Function");
}
exports.evalCallExpr = evalCallExpr;
function evalFuncExpr(func, env) {
    return new value_1.FunctionVal(func.parameter, func.body, env);
}
function evalMemberExpr(expr, env) {
    var _a, _b, _c;
    const left = evaluate(expr.object, env);
    if ((0, value_1.isValueTypes)(left, value_1.ValueType.List) && expr.isComputed) {
        const list = left.value;
        const evalIndex = evaluate(expr.member, env);
        if (!(0, value_1.isValueTypes)(evalIndex, value_1.ValueType.Number)) {
            return (0, utils_1.error)("TypeError: Cannot index List using type", value_1.valueName[evalIndex.type]);
        }
        const index = evalIndex.value >= 0
            ? evalIndex.value
            : list.length + evalIndex.value;
        if (index > list.length) {
            return (0, utils_1.error)("RangeError: Index", index, "Out of Bound");
        }
        return list[index];
    }
    if ((0, value_1.isValueTypes)(left, value_1.ValueType.Object)) {
    }
    else if ((0, value_1.isValueTypes)(left, value_1.ValueType.Number)) {
        const prop = expr.member.symbol;
        //@ts-expect-error
        return (_a = left.method[prop]) !== null && _a !== void 0 ? _a : (0, utils_1.error)("TypeError: Type", value_1.valueName[left.type], "does not have method", prop);
    }
    else {
        return (0, utils_1.error)("TypeError: Cannot access type", value_1.valueName[left.type]);
    }
    let prop;
    if (expr.isComputed) {
        const evalProp = evaluate(expr.member, env);
        if (!evalProp.toKey) {
            return (0, utils_1.error)("TypeError: Cannot access Object with type", value_1.valueName[evalProp.type]);
        }
        prop = evalProp.toKey();
    }
    else {
        prop = expr.member.symbol;
    }
    return ((_c = (_b = left.value.get(prop)) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : (0, utils_1.error)(`ReferenceError: Propeties "${prop}" does not exist on`, left.value));
}
function evalListExpr(list, env) {
    return new value_1.ListVal(list.items.map((e) => evaluate(e, env)));
}
function evalIfExpr(expr, env) {
    const condition = evaluate(expr.condition, env);
    if (!(0, value_1.isValueTypes)(condition, value_1.ValueType.Boolean))
        return (0, utils_1.error)("TypeError: Cannot evaluate if condition with type", value_1.valueName[condition.type]);
    return evaluate(condition.value ? expr.trueBlock : expr.falseBlock, env);
}
function evalShiftExpr(expr, env) {
    if (!(0, ast_1.isNodeType)(expr.rightHand, ast_1.NodeType.Identifier)) {
        return (0, utils_1.error)("TypeError: Cannot shift value into non-identifier");
    }
    let oldVal = null;
    if (env.resolve(expr.rightHand.symbol)) {
        oldVal = env.getVar(expr.rightHand.symbol);
    }
    evalAssignmentExpr(new ast_1.AssignmentExpr(expr.rightHand, expr.leftHand, env.isConstant(expr.rightHand.symbol), expr.isParent), env);
    if ((0, ast_1.isNodeType)(expr.leftHand, ast_1.NodeType.Identifier)) {
        env.unsignVar(expr.leftHand.symbol);
    }
    return oldVal !== null && oldVal !== void 0 ? oldVal : value_1.NULLVAL;
}
function evalWhileExpr(expr, env) {
    let i = 0;
    while (true) {
        const condition = evaluate(expr.condition, env);
        if (!(0, value_1.isValueTypes)(condition, value_1.ValueType.Boolean)) {
            return (0, utils_1.error)("TypeError: Cannot evaluate while condition with type", value_1.valueName[condition.type]);
        }
        if (!condition.value)
            break;
        const bodyVal = evaluate(expr.body, env);
        if (bodyVal === value_1.NULLVAL)
            break;
        i++;
        if (i > 5000)
            return (0, utils_1.error)("YOUR LOOP TAKE TOO LONG M8 5000 ITERATION IS TOO MUCH");
    }
    return new value_1.NumberVal(i);
}
function evalForExpr(expr, env) {
    if (expr.loopType === ast_1.ForLoopType.Traditional) {
        evaluate(expr.init, env);
        let i = 0;
        while (true) {
            const condition = evaluate(expr.condition, env);
            if (!(0, value_1.isValueTypes)(condition, value_1.ValueType.Boolean)) {
                return (0, utils_1.error)("TypeError: Cannot evaluate for loop condition with type", value_1.valueName[condition.type]);
            }
            if (!condition.value)
                break;
            const bodyVal = evaluate(expr.body, env);
            if (bodyVal === value_1.NULLVAL)
                break;
            evaluate(expr.step, env);
            i++;
            if (i > 5000)
                return (0, utils_1.error)("YOUR LOOP TAKE TOO LONG M8 5000 ITERATION IS TOO MUCH");
        }
        return new value_1.NumberVal(i);
    }
    else {
        const evalEnumerable = evaluate(expr.enumerable, env);
        const isIn = expr.loopType === ast_1.ForLoopType.In;
        if (isIn ? !evalEnumerable.length : !evalEnumerable.enumerate) {
            return (0, utils_1.error)(`TypeError: Cannot ${isIn ? "enumerate" : "iterate"} through type`, value_1.valueName[evalEnumerable.type]);
        }
        //@ts-expect-error Tell ts to stfu cus we already check for undefined
        let enumerable = isIn ? evalEnumerable.enumerate() : evalEnumerable.iterate();
        for (const i of enumerable) {
            env.assingVar(expr.identifier, i, false);
            const bodyVal = evaluate(expr.body, env);
            if (bodyVal === value_1.NULLVAL)
                break;
        }
        env.unsignVar(expr.identifier);
        return new value_1.NumberVal(enumerable.length);
    }
}
