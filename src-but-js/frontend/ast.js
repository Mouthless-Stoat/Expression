"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlLiteral = exports.ForLoopType = exports.WhileExpr = exports.ShiftExpr = exports.IfExpr = exports.ListLiteral = exports.StringLiteral = exports.EMPTYBLOCK = exports.BlockLiteral = exports.FunctionExpr = exports.ObjectLiteral = exports.Property = exports.FALSELITERAL = exports.TRUELITERAL = exports.Identifier = exports.NULLLITERAL = exports.NumberLiteral = exports.CallExpr = exports.MemberExpr = exports.AssignmentExpr = exports.PreUnaryExpr = exports.BinaryExpr = exports.isNodeType = exports.NodeType = void 0;
// this file contant definition for the ast
// type of ast node
var NodeType;
(function (NodeType) {
    // stmt
    NodeType[NodeType["Program"] = 0] = "Program";
    // expr
    NodeType[NodeType["Identifier"] = 1] = "Identifier";
    NodeType[NodeType["BinaryExpr"] = 2] = "BinaryExpr";
    NodeType[NodeType["AssigmentExpr"] = 3] = "AssigmentExpr";
    NodeType[NodeType["MemberExpr"] = 4] = "MemberExpr";
    NodeType[NodeType["CallExpr"] = 5] = "CallExpr";
    NodeType[NodeType["PreUnaryExpr"] = 6] = "PreUnaryExpr";
    NodeType[NodeType["FunctionExpr"] = 7] = "FunctionExpr";
    NodeType[NodeType["IfExpr"] = 8] = "IfExpr";
    NodeType[NodeType["ShiftExpr"] = 9] = "ShiftExpr";
    NodeType[NodeType["WhileExpr"] = 10] = "WhileExpr";
    NodeType[NodeType["ForExpr"] = 11] = "ForExpr";
    NodeType[NodeType["ForInExpr"] = 12] = "ForInExpr";
    NodeType[NodeType["ForOfExpr"] = 13] = "ForOfExpr";
    // literal
    NodeType[NodeType["NumberLiteral"] = 14] = "NumberLiteral";
    NodeType[NodeType["BooleanLiteral"] = 15] = "BooleanLiteral";
    NodeType[NodeType["ObjectLiteral"] = 16] = "ObjectLiteral";
    NodeType[NodeType["NullLiteral"] = 17] = "NullLiteral";
    NodeType[NodeType["BlockLiteral"] = 18] = "BlockLiteral";
    NodeType[NodeType["StringLiteral"] = 19] = "StringLiteral";
    NodeType[NodeType["ListLiteral"] = 20] = "ListLiteral";
    NodeType[NodeType["ControlLiteral"] = 21] = "ControlLiteral";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
function isNodeType(node, ...nodeType) {
    return nodeType.some((t) => node.type === t);
}
exports.isNodeType = isNodeType;
// binary expression node, have 2 side and a operator
class BinaryExpr {
    constructor(left, right, op) {
        this.type = NodeType.BinaryExpr;
        this.leftHand = left;
        this.rightHand = right;
        this.operator = op;
    }
}
exports.BinaryExpr = BinaryExpr;
class PreUnaryExpr {
    constructor(expr, op) {
        this.type = NodeType.PreUnaryExpr;
        this.expr = expr;
        this.operator = op;
    }
}
exports.PreUnaryExpr = PreUnaryExpr;
class AssignmentExpr {
    constructor(left, right, isConst, isParent) {
        this.type = NodeType.AssigmentExpr;
        this.lefthand = left;
        this.rightHand = right;
        this.isConst = isConst;
        this.isParent = isParent;
    }
}
exports.AssignmentExpr = AssignmentExpr;
class MemberExpr {
    constructor(object, member, isCompute) {
        this.type = NodeType.MemberExpr;
        this.object = object;
        this.member = member;
        this.isComputed = isCompute;
    }
}
exports.MemberExpr = MemberExpr;
class CallExpr {
    constructor(caller, arg) {
        this.type = NodeType.CallExpr;
        this.caller = caller;
        this.args = arg;
    }
}
exports.CallExpr = CallExpr;
// number node, for number literal also a expression that return the number
class NumberLiteral {
    constructor(num) {
        this.type = NodeType.NumberLiteral;
        this.number = num;
    }
}
exports.NumberLiteral = NumberLiteral;
exports.NULLLITERAL = { type: NodeType.NullLiteral, value: null };
// identifier node, for variable
class Identifier {
    constructor(symbol) {
        this.type = NodeType.Identifier;
        this.symbol = symbol;
    }
}
exports.Identifier = Identifier;
exports.TRUELITERAL = { type: NodeType.BooleanLiteral, value: true };
exports.FALSELITERAL = { type: NodeType.BooleanLiteral, value: false };
class Property {
    constructor(key, value, isConst = false) {
        this.key = key;
        this.value = value;
        this.isConst = isConst;
    }
}
exports.Property = Property;
class ObjectLiteral {
    constructor(prop) {
        this.type = NodeType.ObjectLiteral;
        this.properties = prop;
    }
}
exports.ObjectLiteral = ObjectLiteral;
class FunctionExpr {
    constructor(param, body) {
        this.type = NodeType.FunctionExpr;
        this.parameter = param;
        this.body = body;
    }
}
exports.FunctionExpr = FunctionExpr;
class BlockLiteral {
    constructor(body) {
        this.type = NodeType.BlockLiteral;
        this.value = body;
    }
}
exports.BlockLiteral = BlockLiteral;
exports.EMPTYBLOCK = new BlockLiteral([]);
class StringLiteral {
    constructor(str) {
        this.type = NodeType.StringLiteral;
        this.string = str;
    }
}
exports.StringLiteral = StringLiteral;
class ListLiteral {
    constructor(items) {
        this.type = NodeType.ListLiteral;
        this.items = items;
    }
}
exports.ListLiteral = ListLiteral;
class IfExpr {
    constructor(cond, trueBlock, falseBlock) {
        this.type = NodeType.IfExpr;
        this.condition = cond;
        this.trueBlock = trueBlock;
        this.falseBlock = falseBlock;
    }
}
exports.IfExpr = IfExpr;
class ShiftExpr {
    constructor(left, right, isParent) {
        this.type = NodeType.ShiftExpr;
        this.leftHand = left;
        this.rightHand = right;
        this.isParent = isParent;
    }
}
exports.ShiftExpr = ShiftExpr;
class WhileExpr {
    constructor(cond, body) {
        this.type = NodeType.WhileExpr;
        this.condition = cond;
        this.body = body;
    }
}
exports.WhileExpr = WhileExpr;
var ForLoopType;
(function (ForLoopType) {
    ForLoopType[ForLoopType["Traditional"] = 0] = "Traditional";
    ForLoopType[ForLoopType["In"] = 1] = "In";
    ForLoopType[ForLoopType["Of"] = 2] = "Of";
})(ForLoopType = exports.ForLoopType || (exports.ForLoopType = {}));
class ControlLiteral {
    constructor(control, carryCount) {
        this.type = NodeType.ControlLiteral;
        this.control = control;
        this.carryCount = carryCount;
    }
}
exports.ControlLiteral = ControlLiteral;
