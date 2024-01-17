import { PostUnaryType, PreUnaryType } from "../runtime/UnaryOp"
import { BinaryOpType } from "../runtime/binaryOp"

// this file contain definition for the ast

/**
 * Type of AST node save in a ast for easy retrieval
 * */
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
    PushExpr,
    PopExpr,

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

/**
 * Check if a node is of any of multiple types.
 *
 * @param node The node to check the type of.
 * @param nodeType The node type or types to check against.
 *
 * @returns whether the node is any of the types provided
 * */
export function isNodeType(node: Expr, ...nodeType: NodeType[]): boolean {
    return nodeType.some((t) => node.type === t)
}

/**
 * Base Expression type where everything inherit
 * */
export interface Expr {
    type: NodeType
}

/**
 * Binary Expression Node
 * */
export class BinaryExpr implements Expr {
    type = NodeType.BinaryExpr
    leftHand: Expr
    rightHand: Expr
    operator: BinaryOpType

    /**
     * @param left The left hand
     * @param right The right hand
     * @param op The binary operator
     * */
    constructor(left: Expr, right: Expr, op: BinaryOpType) {
        this.leftHand = left
        this.rightHand = right
        this.operator = op
    }
}

/**
 * A Prefix Unary Expression Node
 * */
export class PreUnaryExpr implements Expr {
    type = NodeType.PreUnaryExpr
    expr: Expr
    operator: PreUnaryType

    /**
     * @param expr The expression to be unary
     * @param op The unary operator
     * */
    constructor(expr: Expr, op: PreUnaryType) {
        this.expr = expr
        this.operator = op
    }
}

/**
 * Postfix Unary Expression Node
 * */
export class PostUnaryExpr {
    type = NodeType.PostUnaryExpr
    expr: Expr
    operator: PostUnaryType

    /**
     * @param expr The expression being unary
     * @param op The unary operator
     * */
    constructor(expr: Expr, op: PostUnaryType) {
        this.expr = expr
        this.operator = op
    }
}

/**
 * A Assignment Expression Node
 * */
export class AssignmentExpr implements Expr {
    type = NodeType.AssigmentExpr
    lefthand: Expr
    rightHand: Expr
    operator: BinaryOpType | undefined
    isConst: boolean
    isRef: boolean
    limit: Expr

    /**
     * @param left The left hand of the assignment or what identifier to assign to
     * @param right The right hand of the assignment or what value to assign to
     * @param op Optional operator to convery to a binary assigment
     * @param isRef Wether this is a reference assignment
     * @param isConst Wether this is a constant assignment
     * @param limit How many time the value can be access
     * */
    constructor(left: Expr, right: Expr, op: BinaryOpType | undefined, isRef: boolean, isConst: boolean, limit: Expr) {
        this.lefthand = left
        this.rightHand = right
        this.operator = op
        this.isConst = isConst
        this.isRef = isRef
        this.limit = limit
    }
}

/**
 * A Indexing Expression Node
 * */
export class IndexExpr implements Expr {
    type = NodeType.IndexExpr
    expr: Expr
    index: Expr

    /**
     * @param expr The value being index
     * @param index The index to index to value
     * */
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

/**
 * A Literal Number Expression
 * */
export class NumberLiteral implements Expr {
    type = NodeType.NumberLiteral
    number: number
    /**
     * @param num The number this literal represent
     * */
    constructor(num: number) {
        this.number = num
    }
}

/**
 * A Literal Null Expression. Don't use this is is only for typing use NULLLITERAL constant
 * */
export interface NullLiteral extends Expr {
    type: NodeType.NullLiteral
    value: null
}

/** Literal Null constant use for return */
export const NULLLITERAL: NullLiteral = { type: NodeType.NullLiteral, value: null }

/**
 * A Identifier Node
 * */
export class Identifier implements Expr {
    type = NodeType.Identifier
    symbol: string

    /**
     * @param symbol The symbol or name of the identifier
     * */
    constructor(symbol: string) {
        this.symbol = symbol
    }
}

export const ZERO = new Identifier("zero")
export const ONE = new Identifier("one")
export const TWO = new Identifier("two")
export const THREE = new Identifier("three")
export const FOUR = new Identifier("four")
export const FIVE = new Identifier("five")
export const SIX = new Identifier("six")
export const SEVEN = new Identifier("seven")
export const EIGHT = new Identifier("eight")
export const NINE = new Identifier("nine")
export const NEG = (expr: Expr) => new PreUnaryExpr(expr, "-")

/**
 * A Literal Boolean Expression. Don't use this is is only for typing use TRUELITERAL and FALSELITERAL constant
 * */
export interface BooleanLiteral extends Expr {
    type: NodeType.BooleanLiteral
    value: boolean
}

/** Literal True constant use for return */
export const TRUELITERAL: BooleanLiteral = { type: NodeType.BooleanLiteral, value: true }
/** Literal False constant use for return */
export const FALSELITERAL: BooleanLiteral = { type: NodeType.BooleanLiteral, value: false }

/**
 * A Function Expression.
 * */
export class FunctionExpr implements Expr {
    type = NodeType.FunctionExpr
    parameter: string[]
    body: BlockLiteral
    /**
     * @param param The parameter the function need a list of identifier name
     * @param body The body of the function
     * */
    constructor(param: string[], body: BlockLiteral) {
        this.parameter = param
        this.body = body
    }
}

/**
 * A Block Expression
 * */
export class BlockLiteral implements Expr {
    type = NodeType.BlockLiteral
    value: Expr[]
    /**
     * @param body The body of the block
     * */
    constructor(body: Expr[]) {
        this.value = body
    }
}

/** A empty block. Mostly use for if expression*/
export const EMPTYBLOCK = new BlockLiteral([NULLLITERAL])

/**
 * A Character Literal Expression
 * */
export class CharacterLiteral implements Expr {
    type = NodeType.CharacterLiteral
    character: string
    /**
     * @param char The character converted from not raw like \n instead \\n
     * */
    constructor(char: string) {
        this.character = char
    }
}

/**
 * A String Literal. This get converted to a list of character at runtime
 * */
export class StringLiteral implements Expr {
    type = NodeType.StringLiteral
    string: string
    /**
     * @param str The string this literal represent
     * */
    constructor(str: string) {
        this.string = str
    }
}

/**
 * A List Literal
 * */
export class ListLiteral implements Expr {
    type = NodeType.ListLiteral
    items: Expr[]
    /**
     * The item of the list literal
     * */
    constructor(items: Expr[]) {
        this.items = items
    }
}

/**
 * A If Expression
 * */
export class IfExpr implements Expr {
    type = NodeType.IfExpr
    condition: Expr
    trueBlock: BlockLiteral
    falseBlock: BlockLiteral
    /**
     * @param cond The condition of the if expression
     * @param trueBlock The block to evaluate when condition is true
     * @param falseBlock The block to evaluate when condition is false
     * */
    constructor(cond: Expr, trueBlock: BlockLiteral, falseBlock: BlockLiteral) {
        this.condition = cond
        this.trueBlock = trueBlock
        this.falseBlock = falseBlock
    }
}

/**
 * A Shift Expression
 * */
export class ShiftExpr implements Expr {
    type = NodeType.ShiftExpr
    leftHand: Expr
    rightHand: Expr
    /**
     * @param left The expression or value to be shift
     * @param right The expression or identifier to shift into
     * */
    constructor(left: Expr, right: Expr) {
        this.leftHand = left
        this.rightHand = right
    }
}

/**
 * A While Loop Expression
 * */
export class WhileExpr implements Expr {
    type = NodeType.WhileExpr
    condition: Expr
    body: BlockLiteral
    /**
     * @param cond The condition for the loop to continue
     * @param body The body of the loop get evaluate every iteration
     * */
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

/**
 * A Traditional For Loop. This is only for typing use ForExpr
 * */
interface ForLoopExpr extends Expr {
    type: NodeType.ForExpr
    loopType: ForLoopType.Traditional
    init: Expr
    condition: Expr
    step: Expr
    body: Expr
}

/**
 * A For Of Loop. This is only for typing use ForExpr
 * */
interface ForOfExpr extends Expr {
    type: NodeType.ForExpr
    loopType: ForLoopType.Of
    identifier: string
    enumerable: Expr
    body: Expr
}

/**
 * A For In Loop. This is only for typing use ForExpr
 * */
interface ForInExpr extends Expr {
    type: NodeType.ForExpr
    loopType: ForLoopType.In
    identifier: string
    enumerable: Expr
    body: Expr
}

/**
 * A For Loop Expression
 * @see ForLoopExpr, ForOfExpr and ForInExpr for more detail
 * */
export type ForExpr = ForLoopExpr | ForInExpr | ForOfExpr

/**
 * A Control Literal Expression
 * */
export class ControlLiteral implements Expr {
    type = NodeType.ControlLiteral
    control: string
    carryCount: number
    /**
     * @param control this literal control type
     * @param carryCount how many time to carry the control
     * */
    constructor(control: string, carryCount: number) {
        this.control = control
        this.carryCount = carryCount
    }
}

/**
 * A Method Call Expression
 * */
export class MethodExpr implements Expr {
    type = NodeType.MethodExpr
    expr: Expr
    method: string
    args: Expr[]
    /**
     * @param expr The expression to call the method on
     * @param meth The method being call
     * @param args The arguments being pass to the method
     * */
    constructor(expr: Expr, meth: string, args: Expr[]) {
        this.expr = expr
        this.method = meth
        this.args = args
    }
}

/**
 * A Range Expression
 * */
export class RangeExpr implements Expr {
    type = NodeType.RangeExpr
    start: Expr
    end: Expr
    step: Expr
    inclusive: boolean

    /**
     * @param start Where the range start
     * @param end Where the range end
     * @param step The range step
     * @param Whether the range is includsive at the end
     * */
    constructor(start: Expr, end: Expr, inclusive: boolean, step: Expr) {
        this.start = start
        this.end = end
        this.inclusive = inclusive
        this.step = step
    }
}

/**
 * A Push Expression
 * */
export class PushExpr implements Expr {
    type = NodeType.PushExpr
    value: Expr
    list: Expr
    index: Expr
    /**
     * @param val The value to push
     * @param list The list to push valua into
     * @param index The index to push into
     * */
    constructor(val: Expr, list: Expr, index: Expr) {
        this.value = val
        this.list = list
        this.index = index
    }
}

/**
 * A Pop Expression
 * */
export class PopExpr implements Expr {
    type = NodeType.PopExpr
    list: Expr
    index: Expr
    /**
     * @param list The list to pop from
     * @param index The index to pop from
     * */
    constructor(list: Expr, index: Expr) {
        this.list = list
        this.index = index
    }
}
