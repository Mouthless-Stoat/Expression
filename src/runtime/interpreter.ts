import {
    BinaryExpr,
    NodeType,
    NumberLiteral,
    Expr,
    Identifier,
    BooleanLiteral,
    AssignmentExpr,
    CallExpr,
    FunctionExpr,
    PreUnaryExpr,
    BlockLiteral,
    StringLiteral,
    ListLiteral,
    IfExpr,
    ShiftExpr,
    isNodeType,
    WhileExpr,
    ForExpr,
    ForLoopType,
    ControlLiteral,
    CharacterLiteral,
} from "../frontend/ast"
import {
    NULLVAL,
    NumberVal,
    RuntimeVal,
    TRUEVAL,
    FALSEVAL,
    FunctionVal,
    ValueType,
    NativeFunctionVal,
    isValueTypes,
    StringVal,
    valueName,
    ListVal,
    BooleanVal,
    ControlVal,
    ControlType,
    CharacterVal,
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
        case NodeType.CharacterLiteral:
            return new CharacterVal((astNode as CharacterLiteral).character)
        case NodeType.BlockLiteral:
            return evalBlock(astNode as BlockLiteral, env)
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
        case NodeType.IfExpr:
            return evalIfExpr(astNode as IfExpr, env)
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
    return PreUnaryOp[expr.operator](expr.expr, env)
}

function evalIdentifier(iden: Identifier, env: Enviroment): RuntimeVal {
    return env.getVar(iden.symbol)
}

function evalAssignmentExpr(expr: AssignmentExpr, env: Enviroment): RuntimeVal {
    if (!isNodeType(expr.lefthand, NodeType.Identifier)) return error("SyntaxError: Invalid left-hand of assignment")
    if (expr.operator) expr.rightHand = new BinaryExpr(expr.lefthand, expr.rightHand, expr.operator)
    const value = evaluate(expr.rightHand, env)
    if (value.isConst) value.isConst = expr.isConst
    if (isNodeType(expr.lefthand, NodeType.Identifier)) {
        return env.assingVar((expr.lefthand as Identifier).symbol, value, expr.isConst)
    }
    return error("SyntaxError: Invalid left-hand of assignment")
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

        // assign all the param var using the scope
        // this is so variable do not bleed out of the function scope
        for (const i in fn.parameter) {
            scope.assingVar(fn.parameter[i], args[i], false)
        }

        // actually evaluating the function body and return the output
        return evalBlock(fn.value, scope)
    } else if (isValueTypes(func, ValueType.NativeFuntion)) return (func as NativeFunctionVal).value(args, env)
    // ^^ comment for line above ^^
    // pass args and the env to native fucntion
    // native function don't need scope they only use the raw value
    else return error("TypeError:", func.value, "is not a Function")
}

function evalFuncExpr(func: FunctionExpr, env: Enviroment): RuntimeVal {
    return new FunctionVal(func.parameter, func.body, env)
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
    return NULLVAL
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
