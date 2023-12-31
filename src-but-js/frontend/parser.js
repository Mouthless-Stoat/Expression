"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("./ast");
const binaryOp_1 = require("../runtime/binaryOp");
const UnaryOp_1 = require("../runtime/UnaryOp");
const lexer_1 = require("./lexer");
const utils_1 = require("../utils");
// class to parse and store stuff
class Parser {
    constructor() {
        this.token = [];
    }
    // the current token
    current() {
        return this.token[0];
    }
    isTypes(...tokenType) {
        return tokenType.some((t) => this.current().isTypes(t));
    }
    // destroy the current token and return it
    next() {
        return this.token.shift();
    }
    // like next but if the token is not what we expect error
    expect(expected, err) {
        const tk = this.next();
        // if no token or not the correct type throw error
        if (!tk || !tk.isTypes(expected)) {
            return (0, utils_1.error)(err);
        }
        return tk;
    }
    // condition for end of file
    notEOF() {
        return !this.isTypes(lexer_1.TokenType.EOF);
    }
    parseArgs() {
        this.expect(lexer_1.TokenType.OpenParen, 'SyntaxError: Expected "("');
        let args = [];
        // if not a empty function call keep parsing arg
        if (!this.isTypes(lexer_1.TokenType.CloseParen)) {
            args = [this.parseAssignmentExpr()];
            while (this.isTypes(lexer_1.TokenType.Comma) && this.next()) {
                args.push(this.parseAssignmentExpr());
            }
        }
        this.expect(lexer_1.TokenType.CloseParen, 'SyntaxError: Expected ")"');
        return args;
    }
    // helper function
    parseCallExpr(caller) {
        let callExpr = new ast_1.CallExpr(caller, this.parseArgs());
        if (this.isTypes(lexer_1.TokenType.OpenParen))
            callExpr = this.parseCallExpr(callExpr); // chaining call expression
        return callExpr;
    }
    parseTradFor(init) {
        this.next(); // discard , cus both case start with comman
        if (!init)
            init = ast_1.EMPTYBLOCK;
        let condition;
        if (!this.isTypes(lexer_1.TokenType.Comma)) {
            condition = this.parseExpr();
        }
        else
            condition = ast_1.TRUELITERAL;
        this.next(); // discard second ,
        let step;
        if (!this.isTypes(lexer_1.TokenType.CloseParen)) {
            step = this.parseExpr();
        }
        else
            step = ast_1.EMPTYBLOCK;
        this.expect(lexer_1.TokenType.CloseParen, 'SyntaxError: Expected ")"');
        const body = this.parseBlockExpr();
        return {
            type: ast_1.NodeType.ForExpr,
            loopType: ast_1.ForLoopType.Traditional,
            init,
            condition,
            step,
            body,
        };
    }
    parseNonTradFor(identifier) {
        // for of and for in
        if (!(0, ast_1.isNodeType)(identifier, ast_1.NodeType.Identifier))
            return (0, utils_1.error)("SyntaxError: Expected Identifier");
        const isIn = this.isTypes(lexer_1.TokenType.In);
        this.next(); // discard in or of
        const enumerable = this.parseExpr();
        this.expect(lexer_1.TokenType.CloseParen, 'SyntaxError: Expected ")"');
        const body = this.parseBlockExpr();
        return {
            type: ast_1.NodeType.ForExpr,
            loopType: isIn ? ast_1.ForLoopType.In : ast_1.ForLoopType.Of,
            identifier: identifier.symbol,
            enumerable,
            body,
        };
    }
    // produce the ast for the interpreter
    produceAST(source) {
        this.token = (0, lexer_1.tokenize)(source);
        const program = [];
        // while not the end of the file keep parsing
        while (this.notEOF()) {
            program.push(this.parseExpr());
        }
        return new ast_1.BlockLiteral(program);
    }
    // expression order
    // 1. Primary (Literal)
    // 2. Member access
    // 3. Call
    // 4. Prefix Unary Operator
    // 5. Binary Operator (Multi then Add then logical) NOTE flow from add to mul to logical
    // ------ Statment ------ these order mean nothing
    // 6. Assignment
    // 7. Shift
    // 8. Loop
    // 9. If
    // 10. Function Construction
    //
    // Highest priority will be parse last so it can be chain
    // Lower priority can't be use for higher without grouping
    // Normal programming statement usually have low priority
    // Ex:
    // - Function is lower than assignment because you can't assign function to something
    // but you can assign something **to** function
    parseExpr() {
        return this.parseFuncExpr();
    }
    parseFuncExpr() {
        if (!this.isTypes(lexer_1.TokenType.OpenParen)) {
            return this.parseLoopExpr();
        }
        const args = this.parseArgs().map((a) => a.type === ast_1.NodeType.Identifier ? a.symbol : (0, utils_1.error)("SyntaxError: Expected Identifier"));
        this.expect(lexer_1.TokenType.DoubleArrow, 'SyntaxError: Expected "=>"');
        const body = this.parseBlockExpr();
        return new ast_1.FunctionExpr(args, body);
    }
    parseLoopExpr() {
        if (!this.isTypes(lexer_1.TokenType.While, lexer_1.TokenType.For)) {
            return this.parseShiftExpr();
        }
        const isWhile = this.next().isTypes(lexer_1.TokenType.While);
        if (isWhile) {
            this.expect(lexer_1.TokenType.OpenParen, 'SyntaxError: Expected "("');
            const condition = this.parseExpr();
            this.expect(lexer_1.TokenType.CloseParen, 'SyntaxError: Expected ")"');
            return new ast_1.WhileExpr(condition, this.parseBlockExpr());
        }
        else {
            this.expect(lexer_1.TokenType.OpenParen, 'SyntaxError: Expected "("');
            if (this.isTypes(lexer_1.TokenType.Comma)) {
                return this.parseTradFor();
            }
            let first = this.parseExpr();
            if (this.isTypes(lexer_1.TokenType.In, lexer_1.TokenType.Of)) {
                return this.parseNonTradFor(first);
            }
            else if (this.isTypes(lexer_1.TokenType.Comma)) {
                return this.parseTradFor(first);
            }
            else {
                return (0, utils_1.error)('SyntaxError: Expected ","');
            }
        }
    }
    parseShiftExpr() {
        let leftHand = this.parseIfExpr();
        while (this.isTypes(lexer_1.TokenType.Arrow)) {
            this.next();
            let isParent = true;
            if (this.isTypes(lexer_1.TokenType.Ampersand)) {
                isParent = false;
                this.next(); // discard &
            }
            const rightHand = this.parseAssignmentExpr(); // function below shift so you can shift function into var
            leftHand = new ast_1.ShiftExpr(leftHand, rightHand, isParent);
        }
        return leftHand;
    }
    parseIfExpr() {
        let condition = this.parseAssignmentExpr();
        if (this.isTypes(lexer_1.TokenType.Question)) {
            this.next(); // discard the ?
            const trueBlock = this.parseBlockExpr();
            const falseBlock = this.isTypes(lexer_1.TokenType.Colon)
                ? (() => {
                    this.next();
                    return this.parseBlockExpr();
                })()
                : new ast_1.BlockLiteral([ast_1.NULLLITERAL]);
            condition = new ast_1.IfExpr(condition, trueBlock, falseBlock);
        }
        return condition;
    }
    parseAssignmentExpr() {
        const leftHand = this.parseLogicalExpr();
        if (this.isTypes(lexer_1.TokenType.Equal, lexer_1.TokenType.DoubleColon)) {
            const isConst = this.next().isTypes(lexer_1.TokenType.DoubleColon);
            let isParent = true;
            if (this.isTypes(lexer_1.TokenType.Ampersand)) {
                isParent = false;
                this.next(); // discard &
            }
            const rightHand = this.parseExpr();
            return new ast_1.AssignmentExpr(leftHand, rightHand, isConst, isParent);
        }
        return leftHand;
    }
    parseLogicalExpr() {
        let leftHand = this.parseAdditiveExpr();
        while (this.isTypes(...binaryOp_1.LogicalOpToken)) {
            const operator = this.next().value;
            const rightHand = this.parseAdditiveExpr();
            leftHand = new ast_1.BinaryExpr(leftHand, rightHand, operator);
        }
        return leftHand;
    }
    parseAdditiveExpr() {
        let leftHand = this.parseMultiplicativeExpr();
        while (this.isTypes(...binaryOp_1.AdditiveOpToken)) {
            const operator = this.next().value;
            const rightHand = this.parseMultiplicativeExpr();
            leftHand = new ast_1.BinaryExpr(leftHand, rightHand, operator);
        }
        return leftHand;
    }
    parseMultiplicativeExpr() {
        let leftHand = this.parsePreUnaryExpr();
        while (this.isTypes(...binaryOp_1.MultiplicativeToken)) {
            const operator = this.next().value;
            const rightHand = this.parsePreUnaryExpr();
            leftHand = new ast_1.BinaryExpr(leftHand, rightHand, operator);
        }
        return leftHand;
    }
    parsePreUnaryExpr() {
        if (!this.isTypes(...UnaryOp_1.PreUnaryOpTokens)) {
            return this.parseMemberCallExpr();
        }
        const op = this.next().value;
        const expr = this.parsePreUnaryExpr();
        return new ast_1.PreUnaryExpr(expr, op);
    }
    parseMemberCallExpr() {
        const member = this.parseMemberExpr();
        if (this.isTypes(lexer_1.TokenType.OpenParen)) {
            return this.parseCallExpr(member); // chaning call
        }
        return member;
    }
    parseMemberExpr() {
        let object = this.parsePrimaryExpr();
        while (this.isTypes(lexer_1.TokenType.Dot, lexer_1.TokenType.OpenBracket)) {
            let comp = !this.next().isTypes(lexer_1.TokenType.Dot);
            let member = comp
                ? (() => {
                    let temp = this.parseExpr();
                    this.expect(lexer_1.TokenType.CloseBracket, 'SyntaxError: Expected "]"');
                    return temp;
                })()
                : (() => {
                    let temp = this.parsePrimaryExpr();
                    if (temp.type != ast_1.NodeType.Identifier) {
                        return (0, utils_1.error)("SyntaxError: Expected Indentifier");
                    }
                    return temp;
                })();
            object = new ast_1.MemberExpr(object, member, comp);
        }
        return object;
    }
    parsePrimaryExpr() {
        switch (this.current().type) {
            case lexer_1.TokenType.Identifier:
                return new ast_1.Identifier(this.next().value);
            case lexer_1.TokenType.Number:
                return new ast_1.NumberLiteral(parseFloat(this.next().value));
            case lexer_1.TokenType.Null:
                this.next();
                return ast_1.NULLLITERAL;
            case lexer_1.TokenType.Boolean:
                return this.next().value == "true" ? ast_1.TRUELITERAL : ast_1.FALSELITERAL;
            case lexer_1.TokenType.StringLiteral:
                return new ast_1.StringLiteral(this.next().value);
            case lexer_1.TokenType.OpenBrace:
                return this.parseBlockExpr();
            case lexer_1.TokenType.OpenDoubleAngle:
                return this.parseObjExpr();
            case lexer_1.TokenType.OpenBracket:
                return this.parseListLiteral();
            case lexer_1.TokenType.Omega:
            case lexer_1.TokenType.Pi:
            case lexer_1.TokenType.Avagadro:
                return new ast_1.Identifier(this.next().value);
            case lexer_1.TokenType.ControlLiteral:
                const type = this.next().value;
                let carryCount = 0;
                while (this.isTypes(lexer_1.TokenType.Octothorp)) {
                    this.next();
                    carryCount++;
                }
                return new ast_1.ControlLiteral(type, carryCount);
            default:
                return (0, utils_1.error)(`SyntaxError: Unexpected Token:`, this.current());
        }
    }
    parseBlockExpr() {
        // small block containing a single expr
        if (!this.isTypes(lexer_1.TokenType.OpenBrace))
            return new ast_1.BlockLiteral([this.parseExpr()]);
        this.expect(lexer_1.TokenType.OpenBrace, 'SyntaxError: Expected "{"');
        const body = [];
        while (this.notEOF() && !this.isTypes(lexer_1.TokenType.CloseBrace)) {
            body.push(this.parseExpr());
        }
        this.expect(lexer_1.TokenType.CloseBrace, 'SyntaxError: Expected "}"');
        return new ast_1.BlockLiteral(body);
    }
    parseObjExpr() {
        this.expect(lexer_1.TokenType.OpenDoubleAngle, 'SyntaxError: Expected "<<"');
        const properties = [];
        while (this.notEOF() && !this.isTypes(lexer_1.TokenType.CloseDoubleAngle)) {
            const key = this.parseLogicalExpr();
            // assign shorthand
            if (this.isTypes(lexer_1.TokenType.Comma) || this.isTypes(lexer_1.TokenType.CloseDoubleAngle)) {
                if (this.isTypes(lexer_1.TokenType.Comma))
                    this.next(); // discard ,
                properties.push(new ast_1.Property(key));
                continue;
            }
            let isConst = this.isTypes(lexer_1.TokenType.DoubleColon, lexer_1.TokenType.Equal)
                ? this.next().isTypes(lexer_1.TokenType.DoubleColon)
                : (0, utils_1.error)('SyntaxError: Expected "=" or ":"');
            const value = this.parseExpr();
            properties.push(new ast_1.Property(key, value, isConst));
            if (!this.isTypes(lexer_1.TokenType.CloseDoubleAngle)) {
                this.expect(lexer_1.TokenType.Comma, 'SyntaxError: Expected ","');
            }
        }
        this.expect(lexer_1.TokenType.CloseDoubleAngle, 'SyntaxError: Expect ">>"');
        return new ast_1.ObjectLiteral(properties);
    }
    parseListLiteral() {
        this.expect(lexer_1.TokenType.OpenBracket, 'SyntaxError: Expected "["');
        let items = [];
        while (this.notEOF() && !this.isTypes(lexer_1.TokenType.CloseBracket)) {
            const item = this.parseExpr();
            if (this.isTypes(lexer_1.TokenType.Comma)) {
                this.next();
            }
            else if (!this.isTypes(lexer_1.TokenType.CloseBracket)) {
                return (0, utils_1.error)('SyntaxError: Expected "," or "]"');
            }
            items.push(item);
        }
        this.expect(lexer_1.TokenType.CloseBracket, 'SyntaxError: Expected "]"');
        return new ast_1.ListLiteral(items);
    }
}
exports.default = Parser;
