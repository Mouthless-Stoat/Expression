import { UnaryOpType } from "./UnaryOp"
import { BinaryOpType } from "./binaryOp"

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
    UnaryExpr,

    // literal
    NumberLiteral,
    BooleanLiteral,
    ObjectLiteral,
    NullLiteral,
    FunctionLiteral,
    BlockLiteral,
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

export class UnaryExpr implements Expr {
    type = NodeType.UnaryExpr
    expr: Expr
    operator: UnaryOpType

    constructor(expr: Expr, op: UnaryOpType) {
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
    isCompute: boolean

    constructor(object: Expr, member: Expr, isCompute: boolean) {
        this.object = object
        this.member = member
        this.isCompute = isCompute
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
    key: string
    value?: Expr
    constructor(key: string, value?: Expr) {
        this.key = key
        this.value = value
    }
}

export class ObjectLiteral implements Expr {
    type = NodeType.ObjectLiteral
    properties: Property[]
    constructor(prop: Property[]) {
        this.properties = prop
    }
}

export class FunctionLiteral implements Expr {
    type = NodeType.FunctionLiteral
    parameter: string[]
    body: Block
    constructor(param: string[], body: Block) {
        this.parameter = param
        this.body = body
    }
}

export class Block implements Expr {
    type = NodeType.BlockLiteral
    value: Expr[]
    constructor(body: Expr[]) {
        this.value = body
    }
}
