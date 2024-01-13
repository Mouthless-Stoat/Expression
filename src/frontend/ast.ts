import { PostUnaryType, PreUnaryType } from "../runtime/UnaryOp"
import { BinaryOpType } from "../runtime/binaryOp"

// this file contain definition for the ast

// type of ast node
export enum NodeType {
    // expr
    Identifier,
    BinaryExpr,
    AssigmentExpr,
    IndexExpr,
    CallExpr,
    PreUnaryExpr,
    PostUnaryExpr,
    FunctionExpr,
    IfExpr,
    ShiftExpr,
    WhileExpr,
    ForExpr,
    ForInExpr,
    ForOfExpr,
    MethodExpr,
    RangeExpr,

    // literal
    NumberLiteral,
    BooleanLiteral,
    NullLiteral,
    BlockLiteral,
    StringLiteral,
    CharacterLiteral,
    ListLiteral,
    ControlLiteral,
}

export function isNodeType(node: Expr, ...nodeType: NodeType[]): boolean {
    return nodeType.some((t) => node.type === t)
}

// a stament node, stament does not return anything
export interface Expr {
    type: NodeType
}

// binary expression node, have 2 side and a operator
export class BinaryExpr implements Expr {
    type = NodeType.BinaryExpr
    leftHand: Expr
    rightHand: Expr
    operator: BinaryOpType

    constructor(left: Expr, right: Expr, op: BinaryOpType) {
        this.leftHand = left
        this.rightHand = right
        this.operator = op
    }
}

export class PreUnaryExpr implements Expr {
    type = NodeType.PreUnaryExpr
    expr: Expr
    operator: PreUnaryType

    constructor(expr: Expr, op: PreUnaryType) {
        this.expr = expr
        this.operator = op
    }
}

export class PostUnaryExpr {
    type = NodeType.PostUnaryExpr
    expr: Expr
    operator: PostUnaryType

    constructor(expr: Expr, op: PostUnaryType) {
        this.expr = expr
        this.operator = op
    }
}

export class AssignmentExpr implements Expr {
    type = NodeType.AssigmentExpr
    lefthand: Expr
    rightHand: Expr
    operator: BinaryOpType | undefined
    isConst: boolean
    isRef: boolean

    constructor(left: Expr, right: Expr, op: BinaryOpType | undefined, isRef: boolean, isConst: boolean) {
        this.lefthand = left
        this.rightHand = right
        this.operator = op
        this.isConst = isConst
        this.isRef = isRef
    }
}

export class IndexExpr implements Expr {
    type = NodeType.IndexExpr
    expr: Expr
    index: Expr

    constructor(expr: Expr, index: Expr) {
        this.expr = expr
        this.index = index
    }
}

export class CallExpr implements Expr {
    type = NodeType.CallExpr
    caller: Expr
    args: Expr[]

    constructor(caller: Expr, arg: Expr[]) {
        this.caller = caller
        this.args = arg
    }
}

// number node, for number literal also a expression that return the number
export class NumberLiteral implements Expr {
    type = NodeType.NumberLiteral
    number: number
    constructor(num: number) {
        this.number = num
    }
}

// null node, for null value expression that return null
export interface NullLiteral extends Expr {
    type: NodeType.NullLiteral
    value: null
}

export const NULLLITERAL: NullLiteral = { type: NodeType.NullLiteral, value: null }

// identifier node, for variable
export class Identifier implements Expr {
    type = NodeType.Identifier
    symbol: string
    constructor(symbol: string) {
        this.symbol = symbol
    }
}

export interface BooleanLiteral extends Expr {
    type: NodeType.BooleanLiteral
    value: boolean
}

export const TRUELITERAL: BooleanLiteral = { type: NodeType.BooleanLiteral, value: true }
export const FALSELITERAL: BooleanLiteral = { type: NodeType.BooleanLiteral, value: false }

export class FunctionExpr implements Expr {
    type = NodeType.FunctionExpr
    parameter: string[]
    body: BlockLiteral
    constructor(param: string[], body: BlockLiteral) {
        this.parameter = param
        this.body = body
    }
}

export class BlockLiteral implements Expr {
    type = NodeType.BlockLiteral
    value: Expr[]
    constructor(body: Expr[]) {
        this.value = body
    }
}

export const EMPTYBLOCK = new BlockLiteral([])

export class CharacterLiteral implements Expr {
    type = NodeType.CharacterLiteral
    character: string
    constructor(char: string) {
        this.character = char
    }
}

export class StringLiteral implements Expr {
    type = NodeType.StringLiteral
    string: string
    constructor(str: string) {
        this.string = str
    }
}

export class ListLiteral implements Expr {
    type = NodeType.ListLiteral
    items: Expr[]
    constructor(items: Expr[]) {
        this.items = items
    }
}

export class IfExpr implements Expr {
    type = NodeType.IfExpr
    condition: Expr
    trueBlock: BlockLiteral
    falseBlock: BlockLiteral
    constructor(cond: Expr, trueBlock: BlockLiteral, falseBlock: BlockLiteral) {
        this.condition = cond
        this.trueBlock = trueBlock
        this.falseBlock = falseBlock
    }
}

export class ShiftExpr implements Expr {
    type = NodeType.ShiftExpr
    leftHand: Expr
    rightHand: Expr
    constructor(left: Expr, right: Expr) {
        this.leftHand = left
        this.rightHand = right
    }
}

export class WhileExpr implements Expr {
    type = NodeType.WhileExpr
    condition: Expr
    body: BlockLiteral
    constructor(cond: Expr, body: BlockLiteral) {
        this.condition = cond
        this.body = body
    }
}

export enum ForLoopType {
    Traditional,
    In,
    Of,
}

interface ForLoopExpr extends Expr {
    type: NodeType.ForExpr
    loopType: ForLoopType.Traditional
    init: Expr
    condition: Expr
    step: Expr
    body: Expr
}

interface ForOfExpr extends Expr {
    type: NodeType.ForExpr
    loopType: ForLoopType.Of
    identifier: string
    enumerable: Expr
    body: Expr
}

interface ForInExpr extends Expr {
    type: NodeType.ForExpr
    loopType: ForLoopType.In
    identifier: string
    enumerable: Expr
    body: Expr
}

export type ForExpr = ForLoopExpr | ForInExpr | ForOfExpr

export class ControlLiteral implements Expr {
    type = NodeType.ControlLiteral
    control: string
    carryCount: number
    constructor(control: string, carryCount: number) {
        this.control = control
        this.carryCount = carryCount
    }
}

export class MethodExpr implements Expr {
    type = NodeType.MethodExpr
    expr: Expr
    method: string
    args: Expr[]

    constructor(expr: Expr, meth: string, args: Expr[]) {
        this.expr = expr
        this.method = meth
        this.args = args
    }
}

export class RangeExpr implements Expr {
    type = NodeType.RangeExpr
    start: Expr
    end: Expr
    step: Expr
    inclusive: boolean

    constructor(start: Expr, end: Expr, inclusive: boolean, step: Expr) {
        this.start = start
        this.end = end
        this.inclusive = inclusive
        this.step = step
    }
}
