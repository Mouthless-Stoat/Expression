import { PreUnaryOpType } from "../runtime/UnaryOp"
import { BinaryOpType } from "../runtime/binaryOp"

// this file contant definition for the ast

// type of ast node
export enum NodeType {
    // stmt
    Program,

    // expr
    Identifier,
    BinaryExpr,
    AssigmentExpr,
    MemberExpr,
    CallExpr,
    PreUnaryExpr,
    FunctionExpr,
    IfExpr,
    ShiftExpr,
    WhileExpr,

    // literal
    NumberLiteral,
    BooleanLiteral,
    ObjectLiteral,
    NullLiteral,
    BlockLiteral,
    StringLiteral,
    ListLiteral,
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
    operator: PreUnaryOpType

    constructor(expr: Expr, op: PreUnaryOpType) {
        this.expr = expr
        this.operator = op
    }
}

export class AssignmentExpr implements Expr {
    type = NodeType.AssigmentExpr
    lefthand: Expr
    rightHand: Expr
    isConst: boolean

    constructor(left: Expr, right: Expr, isConst: boolean) {
        this.lefthand = left
        this.rightHand = right
        this.isConst = isConst
    }
}

export class MemberExpr implements Expr {
    type = NodeType.MemberExpr
    object: Expr
    member: Expr
    isComputed: boolean

    constructor(object: Expr, member: Expr, isCompute: boolean) {
        this.object = object
        this.member = member
        this.isComputed = isCompute
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

export class Property {
    key: Expr
    value?: Expr
    isConst: boolean
    constructor(key: Expr, value?: Expr, isConst = false) {
        this.key = key
        this.value = value
        this.isConst = isConst
    }
}

export class ObjectLiteral implements Expr {
    type = NodeType.ObjectLiteral
    properties: Property[]
    constructor(prop: Property[]) {
        this.properties = prop
    }
}

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
