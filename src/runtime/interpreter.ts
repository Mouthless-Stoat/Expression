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
    WhileExpr,
    ForExpr,
    ForLoopType,
    ControlLiteral,
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
    BooleanVal,
    ControlVal,
    ControlType,
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
            return evalObjectExpr(astNode as ObjectLiteral, env)
        case NodeType.ListLiteral:
            return evalListExpr(astNode as ListLiteral, env)
        case NodeType.ControlLiteral:
            return new ControlVal(
                (astNode as ControlLiteral).control as ControlType,
                (astNode as ControlLiteral).carryCount
            )

        // expr
        case NodeType.BinaryExpr:
            return evalBinExpr(astNode as BinaryExpr, env)
        case NodeType.Identifier:
            return evalIdentifier(astNode as Identifier, env)
        case NodeType.AssigmentExpr:
            return evalAssignmentExpr(astNode as AssignmentExpr, env)
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
        case NodeType.WhileExpr:
            return evalWhileExpr(astNode as WhileExpr, env)
        case NodeType.ForExpr:
            return evalForExpr(astNode as ForExpr, env)
        default:
            return error(`This AST Node is not implemented in interpreter:`, astNode)
    }
}

export function evalBlock(block: BlockLiteral, env: Enviroment, isGlobal = false): RuntimeVal {
    let out: RuntimeVal = NULLVAL
    const blockEnv = isGlobal ? env : new Enviroment(env)
    for (const expr of block.value) {
        out = blockEnv.pushStack(evaluate(expr, blockEnv))
        if (isValueTypes(out, ValueType.Control)) {
            let control = out as ControlVal
            if (control.carryCount > 0) {
                control.carryCount -= 1
                return control
            } else {
                switch (control.value) {
                    case "break":
                        return NULLVAL
                    case "continue":
                        return TRUEVAL
                }
            }
        }
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

function evalAssignmentExpr(expr: AssignmentExpr, env: Enviroment): RuntimeVal {
    if (expr.lefthand.type === NodeType.Identifier) {
        const iden = (expr.lefthand as Identifier).symbol
        const value = evaluate(expr.rightHand, env)
        if (!(value.isConst ?? true)) value.isConst = expr.isConst
        return env.assingVar(iden, value, expr.isConst, expr.isParent)
    } else if (expr.lefthand.type === NodeType.MemberExpr) {
        const left = expr.lefthand as MemberExpr
        const obj = evaluate(left.object, env)
        if (!isValueTypes(obj, ValueType.Object)) {
            return error("TypeError: Cannot access type", ValueType[obj.type])
        }
        const prop = (left.member as Identifier).symbol
        const val = evaluate(expr.rightHand, env)
        if (!(obj as ObjectVal).value.get(prop)?.isConst) {
            ;(obj as ObjectVal).value.set(prop, { isConst: false, value: val })
        } else {
            return error(`TypeError: Cannot assign to Constant properties "${prop}"`)
        }
        return val
    }
    return error("SyntaxError: Invalid left-hand of assignment")
}

function evalObjectExpr(obj: ObjectLiteral, env: Enviroment): RuntimeVal {
    const prop = new Map<string, { isConst: boolean; value: RuntimeVal }>()
    for (const { key: k, value, isConst } of obj.properties) {
        let key: string
        if (k.type !== NodeType.Identifier) {
            const evalKey = evaluate(k, env)
            if (!evalKey.toKey) {
                return error("TypeError: Object key can't be of type", valueName[evalKey.type])
            }
            key = evalKey.toKey()
        } else {
            key = (k as Identifier).symbol
        }
        const evalValue = value === undefined ? env.getVar(key) : evaluate(value, env)
        if (!(evalValue.isConst ?? true)) evalValue.isConst = isConst
        prop.set(key, {
            isConst: isConst,
            value: evalValue,
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
    else return error("TypeError:", func.value, "is not a Function")
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
            return error("TypeError: Cannot index List using type", valueName[evalIndex.type])
        }
        const index: number =
            (evalIndex as NumberVal).value >= 0
                ? (evalIndex as NumberVal).value
                : list.length + (evalIndex as NumberVal).value
        if (index > list.length) {
            return error("RangeError: Index", index, "Out of Bound")
        }
        return list[index]
    }
    if (left.method) {
        const prop = (expr.member as Identifier).symbol
        return left.method[prop] ?? error("TypeError: Type", valueName[left.type], "does not have method", prop)
    } else if (!isValueTypes(left, ValueType.Object)) {
        return error("TypeError: Cannot access type", valueName[left.type])
    }
    let prop
    if (expr.isComputed) {
        const evalProp = evaluate(expr.member, env)
        if (!evalProp.toKey) {
            return error("TypeError: Cannot access Object with type", valueName[evalProp.type])
        }
        prop = evalProp.toKey()
    } else {
        prop = (expr.member as Identifier).symbol
    }
    return (
        (left as ObjectVal).value.get(prop)?.value ??
        error(`ReferenceError: Propeties "${prop}" does not exist on`, left.value)
    )
}
function evalListExpr(list: ListLiteral, env: Enviroment): RuntimeVal {
    return new ListVal(list.items.map((e) => evaluate(e, env)))
}

function evalIfExpr(expr: IfExpr, env: Enviroment): RuntimeVal {
    const condition = evaluate(expr.condition, env)
    if (!isValueTypes(condition, ValueType.Boolean))
        return error("TypeError: Cannot evaluate if condition with type", valueName[condition.type])
    return evaluate((condition.value as boolean) ? expr.trueBlock : expr.falseBlock, env)
}

function evalShiftExpr(expr: ShiftExpr, env: Enviroment): RuntimeVal {
    if (!isNodeType(expr.rightHand, NodeType.Identifier)) {
        return error("TypeError: Cannot shift value into non-identifier")
    }
    let oldVal = null
    if (env.resolve((expr.rightHand as Identifier).symbol)) {
        oldVal = env.getVar((expr.rightHand as Identifier).symbol)
    }
    evalAssignmentExpr(
        new AssignmentExpr(
            expr.rightHand,
            expr.leftHand,
            env.isConstant((expr.rightHand as Identifier).symbol),
            expr.isParent
        ),
        env
    )
    if (isNodeType(expr.leftHand, NodeType.Identifier)) {
        env.unsignVar((expr.leftHand as Identifier).symbol)
    }
    return oldVal ?? NULLVAL
}

function evalWhileExpr(expr: WhileExpr, env: Enviroment): RuntimeVal {
    let i = 0
    while (true) {
        const condition = evaluate(expr.condition, env) as BooleanVal
        if (!isValueTypes(condition, ValueType.Boolean)) {
            return error("TypeError: Cannot evaluate while condition with type", valueName[condition.type])
        }
        if (!condition.value) break
        const bodyVal = evaluate(expr.body, env)
        if (bodyVal === NULLVAL) break
        i++
        if (i > 5000) return error("YOUR LOOP TAKE TOO LONG M8 5000 ITERATION IS TOO MUCH")
    }
    return new NumberVal(i)
}

function evalForExpr(expr: ForExpr, env: Enviroment): RuntimeVal {
    if (expr.loopType === ForLoopType.Traditional) {
        evaluate(expr.init, env)
        let i = 0
        while (true) {
            const condition = evaluate(expr.condition, env) as BooleanVal
            if (!isValueTypes(condition, ValueType.Boolean)) {
                return error("TypeError: Cannot evaluate for loop condition with type", valueName[condition.type])
            }
            if (!condition.value) break
            const bodyVal = evaluate(expr.body, env)
            if (bodyVal === NULLVAL) break
            evaluate(expr.step, env)
            i++
            if (i > 5000) return error("YOUR LOOP TAKE TOO LONG M8 5000 ITERATION IS TOO MUCH")
        }
        return new NumberVal(i)
    } else {
        const evalEnumerable = evaluate(expr.enumerable, env)
        const isIn = expr.loopType === ForLoopType.In
        if (isIn ? !evalEnumerable.length : !evalEnumerable.enumerate) {
            return error(
                `TypeError: Cannot ${isIn ? "enumerate" : "iterate"} through type`,
                valueName[evalEnumerable.type]
            )
        }

        //@ts-expect-error Tell ts to stfu cus we already check for undefined
        let enumerable: RuntimeVal[] = isIn ? evalEnumerable.enumerate() : evalEnumerable.iterate()
        for (const i of enumerable) {
            env.assingVar(expr.identifier, i, false)
            const bodyVal = evaluate(expr.body, env)
            if (bodyVal === NULLVAL) break
        }
        env.unsignVar(expr.identifier)
        return new NumberVal(enumerable.length)
    }
}
