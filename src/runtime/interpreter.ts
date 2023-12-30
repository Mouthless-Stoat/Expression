import {
    BinaryExpr,
    NodeType,
    NumberLiteral,
    Expr,
    Identifier,
    BooleanLiteral,
    AssignmentExpr,
    ObjectLiteral,
    CallExpr,
    FunctionExpr,
    PreUnaryExpr,
    BlockLiteral,
    MemberExpr,
    StringLiteral,
    ListLiteral,
    IfExpr,
    ShiftExpr,
    isNodeType,
} from "../frontend/ast"
import {
    NULLVAL,
    NumberVal,
    RuntimeVal,
    TRUEVAL,
    FALSEVAL,
    FunctionVal,
    ObjectVal,
    ValueType,
    NativeFunctionVal,
    isValueTypes,
    StringVal,
    valueName,
    ListVal,
} from "./value"
import Enviroment from "./enviroment"
import { error } from "../utils"
import { BinaryOp } from "./binaryOp"
import { PreUnaryOp } from "./UnaryOp"

//main eval function

export function evaluate(astNode: Expr, env: Enviroment): RuntimeVal {
    switch (astNode.type) {
        // literal
        case NodeType.NumberLiteral:
            return new NumberVal((astNode as NumberLiteral).number)
        case NodeType.NullLiteral:
            return NULLVAL
        case NodeType.BooleanLiteral:
            return (astNode as BooleanLiteral).value ? TRUEVAL : FALSEVAL
        case NodeType.StringLiteral:
            return new StringVal((astNode as StringLiteral).string)
        case NodeType.BlockLiteral:
            return evalBlock(astNode as BlockLiteral, env)
        case NodeType.ObjectLiteral:
            return evalObjExpr(astNode as ObjectLiteral, env)
        case NodeType.ListLiteral:
            return evalListExpr(astNode as ListLiteral, env)

        // expr
        case NodeType.BinaryExpr:
            return evalBinExpr(astNode as BinaryExpr, env)
        case NodeType.Identifier:
            return evalIdentifier(astNode as Identifier, env)
        case NodeType.AssigmentExpr:
            return evalAssignExpr(astNode as AssignmentExpr, env)
        case NodeType.CallExpr:
            return evalCallExpr(astNode as CallExpr, env)
        case NodeType.FunctionExpr:
            return evalFuncExpr(astNode as FunctionExpr, env)
        case NodeType.PreUnaryExpr:
            return evalUnaryExpr(astNode as PreUnaryExpr, env)
        case NodeType.MemberExpr:
            return evalMemberExpr(astNode as MemberExpr, env)
        case NodeType.IfExpr:
            return evalIfExpr(astNode as IfExpr, env)
        case NodeType.ShiftExpr:
            return evalShiftExpr(astNode as ShiftExpr, env)
        default:
            return error(`This AST Node is not implemented in interpreter:`, astNode)
    }
}

export function evalBlock(block: BlockLiteral, env: Enviroment, isGlobal = false): RuntimeVal {
    let out: RuntimeVal = NULLVAL
    const blockEnv = isGlobal ? env : new Enviroment(env)
    for (const expr of block.value) {
        out = blockEnv.pushStack(evaluate(expr, blockEnv))
    }
    return out
}

// other eval
function evalBinExpr(expr: BinaryExpr, env: Enviroment): RuntimeVal {
    return BinaryOp[expr.operator](evaluate(expr.leftHand, env), evaluate(expr.rightHand, env), env)
}

function evalUnaryExpr(expr: PreUnaryExpr, env: Enviroment): RuntimeVal {
    return PreUnaryOp[expr.operator](evaluate(expr.expr, env), env)
}

function evalIdentifier(iden: Identifier, env: Enviroment): RuntimeVal {
    return env.getVar(iden.symbol)
}

function evalAssignExpr(expr: AssignmentExpr, env: Enviroment): RuntimeVal {
    if (expr.lefthand.type === NodeType.Identifier) {
        return env.assingVar((expr.lefthand as Identifier).symbol, evaluate(expr.rightHand, env), expr.isConst)
    } else if (expr.lefthand.type === NodeType.MemberExpr) {
        const left = expr.lefthand as MemberExpr
        const obj = evaluate(left.object, env)
        if (!isValueTypes(obj, ValueType.Object)) {
            return error("Cannot access non Object")
        }
        const prop = (left.member as Identifier).symbol
        const val = evaluate(expr.rightHand, env)
        if (!(obj as ObjectVal).value.get(prop)?.isConst) {
            ;(obj as ObjectVal).value.set(prop, { isConst: false, value: val })
        } else {
            return error("Cannot assign to Constant")
        }
        return val
    }
    return error("Invalid Left Hand")
}

function evalObjExpr(obj: ObjectLiteral, env: Enviroment): RuntimeVal {
    const prop = new Map<string, { isConst: boolean; value: RuntimeVal }>()
    for (const { key: k, value, isConst } of obj.properties) {
        let key: string
        if (k.type !== NodeType.Identifier) {
            const evalKey = evaluate(k, env)
            if (!evalKey.toKey) {
                return error("Object key can't be of type", valueName[evalKey.type])
            }
            key = evalKey.toKey()
        } else {
            key = (k as Identifier).symbol
        }
        prop.set(key, {
            isConst: isConst,
            value: value === undefined ? env.getVar(key) : evaluate(value, env),
        })
    }
    return new ObjectVal(prop)
}

export function evalCallExpr(caller: CallExpr, env: Enviroment): RuntimeVal {
    const args = caller.args.map((arg) => evaluate(arg, env))
    const func = evaluate(caller.caller, env)

    if (isValueTypes(func, ValueType.Function)) {
        const fn = func as FunctionVal
        const scope = new Enviroment(env)

        if (args.length != fn.parameter.length) {
            return error("Expected", fn.parameter.length, "argument but given", args.length)
        }

        // make param var
        for (const i in fn.parameter) {
            scope.assingVar(fn.parameter[i], args[i], false)
        }

        return evalBlock(fn.value, scope)
    } else if (isValueTypes(func, ValueType.NativeFuntion)) return (func as NativeFunctionVal).value(args, env)
    else return error("Cannot call on non Function")
}

function evalFuncExpr(func: FunctionExpr, env: Enviroment): RuntimeVal {
    return new FunctionVal(func.parameter, func.body, env)
}

function evalMemberExpr(expr: MemberExpr, env: Enviroment): RuntimeVal {
    const left = evaluate(expr.object, env)
    if (isValueTypes(left, ValueType.List) && expr.isComputed) {
        const list = (left as ListVal).value
        const evalIndex = evaluate(expr.member, env)
        if (!isValueTypes(evalIndex, ValueType.Number)) {
            return error("Cannot index List using type", valueName[evalIndex.type])
        }
        const index: number =
            (evalIndex as NumberVal).value >= 0
                ? (evalIndex as NumberVal).value
                : list.length + (evalIndex as NumberVal).value
        if (index > list.length) {
            return error("Index", index, "Out of Bound")
        }
        return list[index]
    }
    if (isValueTypes(left, ValueType.Object)) {
    } else if (isValueTypes(left, ValueType.Number)) {
        const prop = (expr.member as Identifier).symbol
        //@ts-expect-error
        return left.method[prop] ?? error("Type", valueName[left.type], "does not have method", prop)
    } else {
        return error("Cannot access non Object")
    }
    let prop
    if (expr.isComputed) {
        const evalProp = evaluate(expr.member, env)
        if (!evalProp.toKey) {
            return error("Cannot access Object with type", valueName[evalProp.type])
        }
        prop = evalProp.toKey()
    } else {
        prop = (expr.member as Identifier).symbol
    }
    return (left as ObjectVal).value.get(prop)?.value ?? error("Propeties", prop, "does not exist on", left.value)
}
function evalListExpr(list: ListLiteral, env: Enviroment): RuntimeVal {
    return new ListVal(list.items.map((e) => evaluate(e, env)))
}

function evalIfExpr(expr: IfExpr, env: Enviroment): RuntimeVal {
    const condition = evaluate(expr.condition, env)
    if (!isValueTypes(condition, ValueType.Boolean))
        return error("Cannot evaluate if condition with type", valueName[condition.type])
    return evaluate((condition.value as boolean) ? expr.trueBlock : expr.falseBlock, env)
}

function evalShiftExpr(expr: ShiftExpr, env: Enviroment): RuntimeVal {
    if (!isNodeType(expr.rightHand, NodeType.Identifier)) {
        return error("TypeError: Cannot shift value into non-identifier")
    }
    const oldVar = env.getVar((expr.rightHand as Identifier).symbol)
    evalAssignExpr(
        new AssignmentExpr(expr.rightHand, expr.leftHand, env.isConstant((expr.rightHand as Identifier).symbol)),
        env
    )
    return oldVar
}
