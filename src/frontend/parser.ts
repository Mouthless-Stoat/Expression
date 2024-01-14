import {
    Expr,
    Identifier,
    NumberLiteral,
    NULLLITERAL,
    BinaryExpr,
    TRUELITERAL,
    FALSELITERAL,
    AssignmentExpr,
    CallExpr,
    NodeType,
    FunctionExpr,
    PreUnaryExpr,
    BlockLiteral,
    StringLiteral,
    ListLiteral,
    IfExpr,
    ShiftExpr,
    WhileExpr,
    isNodeType,
    EMPTYBLOCK,
    ForExpr,
    ForLoopType,
    ControlLiteral,
    CharacterLiteral,
    IndexExpr,
    MethodExpr,
    PostUnaryExpr,
    RangeExpr,
    PopExpr,
    ZERO,
    ONE,
} from "./ast"
import { AddOpToken, BinaryOpToken, BinaryOpType, LogicOpToken, MultiOpToken } from "../runtime/binaryOp"
import { PostUnaryToken, PostUnaryType, PreUnaryTokens, PreUnaryType } from "../runtime/UnaryOp"
import { Token, TokenType, tokenize } from "./lexer"
import { error } from "../utils"

// class to parse and store stuff
export default class Parser {
    token: Token[] = []

    // the current token
    private current(): Token {
        return this.token[0]
    }

    private isTypes(...tokenType: TokenType[]): boolean {
        return tokenType.some((t) => this.current().isTypes(t))
    }
    // destroy the current token and return it
    private next(): Token {
        return this.token.shift() as Token
    }

    // like next but if the token is not what we expect error
    private expect(expected: TokenType, err: string): Token {
        const tk = this.next()
        // if no token or not the correct type throw error
        if (!tk || !tk.isTypes(expected)) {
            return error(err)
        }
        return tk
    }

    // condition for end of file
    private notEOF(): boolean {
        return !this.isTypes(TokenType.EOF)
    }

    private parseArgs(): Expr[] {
        this.expect(TokenType.OpenParen, 'SyntaxError: Expected "("')
        let args: Expr[] = []
        // if not a empty function call keep parsing arg
        if (!this.isTypes(TokenType.CloseParen)) {
            args = [this.parseAssignmentExpr()]
            while (this.isTypes(TokenType.SemiColon) && this.next()) {
                args.push(this.parseAssignmentExpr())
            }
        }
        this.expect(TokenType.CloseParen, 'SyntaxError: Expected ")"')
        return args
    }

    private parseTradFor(init?: Expr): Expr {
        this.next() // discard ; cus both case start with semi colon
        if (!init) init = EMPTYBLOCK
        let condition: Expr
        if (!this.isTypes(TokenType.SemiColon)) {
            condition = this.parseExpr()
        } else condition = TRUELITERAL
        this.next() // discard second ,
        let step: Expr
        if (!this.isTypes(TokenType.CloseParen)) {
            step = this.parseExpr()
        } else step = EMPTYBLOCK
        this.expect(TokenType.CloseParen, 'SyntaxError: Expected ")"')
        const body = this.parseBlockExpr()
        return {
            type: NodeType.ForExpr,
            loopType: ForLoopType.Traditional,
            init,
            condition,
            step,
            body,
        } as ForExpr
    }

    private parseNonTradFor(identifier: Expr): Expr {
        // for of and for in
        if (!isNodeType(identifier, NodeType.Identifier)) return error("SyntaxError: Expected Identifier")
        const isIn = this.isTypes(TokenType.In)
        this.next() // discard in or of
        const enumerable = this.parseExpr()
        this.expect(TokenType.CloseParen, 'SyntaxError: Expected ")"')
        const body = this.parseBlockExpr()
        return {
            type: NodeType.ForExpr,
            loopType: isIn ? ForLoopType.In : ForLoopType.Of,
            identifier: (identifier as Identifier).symbol,
            enumerable,
            body,
        } as ForExpr
    }

    // produce the ast for the interpreter
    public produceAST(source: string): BlockLiteral {
        this.token = tokenize(source)
        const program: Expr[] = []

        // while not the end of the file keep parsing
        while (this.notEOF()) {
            program.push(this.parseExpr())
        }
        return new BlockLiteral(program)
    }

    // expression order
    // 1. Primary (Literal)
    // 2. Method
    // 3. Indexing List
    // 4. Call
    // 5. Prefix Unary Operator
    // 6. Postfix Unary Operator
    // 7. Range Expr
    // 8. Binary Operator (Multi then Add then logical) NOTE flow from add to mul to logical
    // 9. Push Notation
    // ------ Statment ------ mostly statement
    // 10. Assignment
    // 11. Pop Notaion NOTE Not a stament here so assignment is a valid pop expr
    // 12. If
    // 13. Shift
    // 14. Loop
    // 15. Function Construction
    //
    // Highest priority will be parse last so it can be chain
    // Lower priority can't be use for higher without grouping
    // Normal programming statement usually have low priority
    // Ex:
    // - Function is lower than assignment because you can't assign function to something
    // but you can assign something **to** function

    private parseExpr(): Expr {
        return this.parseFuncExpr()
    }

    private parseFuncExpr(): Expr {
        if (!this.isTypes(TokenType.OpenParen)) {
            return this.parseLoopExpr()
        }
        const args = this.parseArgs().map((a) =>
            a.type === NodeType.Identifier ? (a as Identifier).symbol : error("SyntaxError: Expected Identifier")
        )
        this.expect(TokenType.DoubleArrow, 'SyntaxError: Expected "=>"')
        const body = this.parseBlockExpr() as BlockLiteral
        return new FunctionExpr(args, body)
    }

    private parseLoopExpr(): Expr {
        if (!this.isTypes(TokenType.While, TokenType.For)) {
            return this.parseShiftExpr()
        }
        const isWhile = this.next().isTypes(TokenType.While)
        if (isWhile) {
            this.expect(TokenType.OpenParen, 'SyntaxError: Expected "("')
            const condition = this.parseExpr()
            this.expect(TokenType.CloseParen, 'SyntaxError: Expected ")"')
            return new WhileExpr(condition, this.parseBlockExpr() as BlockLiteral)
        } else {
            this.expect(TokenType.OpenParen, 'SyntaxError: Expected "("')
            if (this.isTypes(TokenType.SemiColon)) {
                return this.parseTradFor()
            }
            let first = this.parseExpr()
            if (this.isTypes(TokenType.In, TokenType.Of)) {
                return this.parseNonTradFor(first)
            } else if (this.isTypes(TokenType.SemiColon)) {
                return this.parseTradFor(first)
            } else {
                return error('SyntaxError: Expected ";"')
            }
        }
    }

    private parseShiftExpr(): Expr {
        let leftHand = this.parseIfExpr()
        while (this.isTypes(TokenType.Arrow)) {
            this.next()
            const rightHand = this.parseAssignmentExpr()
            leftHand = new ShiftExpr(leftHand, rightHand)
        }
        return leftHand
    }

    private parseIfExpr(): Expr {
        let condition = this.parsePopExpr()
        if (this.isTypes(TokenType.Question)) {
            this.next() // discard the ?
            const trueBlock = this.parseBlockExpr() as BlockLiteral
            const falseBlock = this.isTypes(TokenType.Colon)
                ? (() => {
                      this.next()
                      return this.parseBlockExpr() as BlockLiteral
                  })()
                : new BlockLiteral([NULLLITERAL])
            condition = new IfExpr(condition, trueBlock, falseBlock)
        }
        return condition
    }

    private parsePopExpr(): Expr {
        if (!this.isTypes(TokenType.LeftDoubleAngle)) return this.parseAssignmentExpr()

        this.next()
        let index
        if (this.isTypes(TokenType.OpenParen)) {
            this.next()
            index = this.parseExpr()
            this.expect(TokenType.CloseParen, 'SyntaxError: Expected ")"')
        }
        const list = this.parseExpr()
        return new PopExpr(list, index ?? ZERO)
    }

    private parseAssignmentExpr(): Expr {
        const leftHand = this.parseRangeExpr()
        if (
            (this.isTypes(...BinaryOpToken, TokenType.Ampersand) &&
                this.token[1].isTypes(TokenType.Equal, TokenType.DoubleColon)) ||
            this.isTypes(TokenType.Equal, TokenType.DoubleColon)
        ) {
            let operator
            let isRef = false
            if (this.isTypes(...BinaryOpToken)) operator = this.next().value as BinaryOpType
            if (this.isTypes(TokenType.Ampersand)) {
                this.next()
                isRef = true
            }
            const isConst = this.next().isTypes(TokenType.DoubleColon)
            const rightHand = this.parseExpr()
            return new AssignmentExpr(leftHand, rightHand, operator, isRef, isConst)
        }
        return leftHand
    }

    private parseRangeExpr(): Expr {
        let start

        if (this.isTypes(TokenType.DoubleDot)) start = ZERO
        else start = this.parseLogicalExpr()

        if (this.isTypes(TokenType.DoubleDot)) {
            this.next()
            let inclusive = false
            if (this.isTypes(TokenType.Equal)) {
                this.next()
                inclusive = true
            }
            let end = this.parseLogicalExpr()
            let step
            if (this.isTypes(TokenType.DoubleDot)) {
                this.next()
                step = this.parseLogicalExpr()
            }
            return new RangeExpr(start, end, inclusive, step ?? ONE)
        }
        return start
    }

    // binnary expr
    private parseLogicalExpr(): Expr {
        let leftHand = this.parseAdditiveExpr()

        while (this.isTypes(...LogicOpToken) && !this.token[1].isTypes(TokenType.Equal, TokenType.DoubleColon)) {
            const operator = this.next().value
            const rightHand = this.parseAdditiveExpr()
            leftHand = new BinaryExpr(leftHand, rightHand, operator as BinaryOpType)
        }

        return leftHand
    }

    private parseAdditiveExpr(): Expr {
        let leftHand = this.parseMultiplicativeExpr()

        while (this.isTypes(...AddOpToken) && !this.token[1].isTypes(TokenType.Equal, TokenType.DoubleColon)) {
            const operator = this.next().value
            const rightHand = this.parseMultiplicativeExpr()
            leftHand = new BinaryExpr(leftHand, rightHand, operator as BinaryOpType)
        }

        return leftHand
    }

    private parseMultiplicativeExpr(): Expr {
        let leftHand = this.parsePostUnaryExpr()

        while (this.isTypes(...MultiOpToken) && !this.token[1].isTypes(TokenType.Equal, TokenType.DoubleColon)) {
            const operator = this.next().value
            const rightHand = this.parsePostUnaryExpr()
            leftHand = new BinaryExpr(leftHand, rightHand, operator as BinaryOpType)
        }

        return leftHand
    }
    // end binary expr

    private parsePostUnaryExpr(): Expr {
        let expr = this.parsePreUnaryExpr()
        while (this.isTypes(...PostUnaryToken)) {
            const op = this.next().value as PostUnaryType
            expr = new PostUnaryExpr(expr, op)
        }
        return expr
    }

    private parsePreUnaryExpr(): Expr {
        if (!this.isTypes(...PreUnaryTokens)) {
            return this.parseCallExpr()
        }
        const op = this.next().value as PreUnaryType
        const expr = this.parsePreUnaryExpr()
        return new PreUnaryExpr(expr, op)
    }

    private parseCallExpr(): Expr {
        let caller = this.parseIndexExpr()
        // go in a loop until no more () can be meaning call stop chaning
        while (this.isTypes(TokenType.OpenParen)) {
            const args = this.parseArgs()
            caller = new CallExpr(caller, args)
        }
        return caller
    }

    private parseIndexExpr(): Expr {
        let expr = this.parseMethod()
        while (this.isTypes(TokenType.OpenBracket)) {
            this.next() // discard [
            const index = this.parseExpr()
            this.expect(TokenType.CloseBracket, 'SyntaxError: Expected "]"')
            expr = new IndexExpr(expr, index)
        }
        return expr
    }

    private parseMethod(): Expr {
        let expr = this.parseJuxtaposition()
        while (this.isTypes(TokenType.Dot)) {
            this.next()
            const method = this.parseJuxtaposition()
            if (!isNodeType(method, NodeType.Identifier)) return error("SyntaxError: Expected Identifier")
            expr = new MethodExpr(expr, (method as Identifier).symbol, this.parseArgs())
        }
        return expr
    }

    private parseJuxtaposition(): Expr {
        let num = this.parseFloat()
        if (this.isTypes(TokenType.Identifier)) {
            return new BinaryExpr(num, this.parsePrimaryExpr(), "*")
        }
        return num
    }

    private parseFloat(): Expr {
        let whole = this.parsePrimaryExpr()
        if (isNodeType(whole, NodeType.NumberLiteral) && this.isTypes(TokenType.Comma)) {
            this.next()
            const decimal = this.expect(TokenType.Number, "SyntaxError: Expected Number").value
            return new NumberLiteral((whole as NumberLiteral).number + parseInt(decimal) / Math.pow(10, decimal.length))
        }
        return whole
    }

    private parsePrimaryExpr(): Expr {
        switch (this.current().type) {
            case TokenType.Identifier:
                return new Identifier(this.next().value)
            case TokenType.Number:
                return new NumberLiteral(parseInt(this.next().value))
            case TokenType.Null:
            case TokenType.SemiColon:
                this.next()
                return NULLLITERAL
            case TokenType.Boolean:
                return this.next().value == "true" ? TRUELITERAL : FALSELITERAL
            case TokenType.StringLiteral:
                return new StringLiteral(this.next().value)
            case TokenType.CharacterLiteral:
                return new CharacterLiteral(this.next().value)
            case TokenType.OpenBrace:
                return this.parseBlockExpr()
            case TokenType.OpenBracket:
                return this.parseListLiteral()
            case TokenType.Omega:
                this.next()
                return new Identifier("omega")
            case TokenType.Avagadro:
                this.next()
                return new Identifier("avogadro")
            case TokenType.Pi:
                this.next()
                return new Identifier("pi")
            case TokenType.ControlLiteral:
                const type = this.next().value
                let carryCount = 0
                while (this.isTypes(TokenType.Octothorp)) {
                    this.next()
                    carryCount++
                }
                return new ControlLiteral(type, carryCount)
            default:
                return error(`SyntaxError: Unexpected Token:`, this.current())
        }
    }

    private parseBlockExpr(): Expr {
        // small block containing a single expr
        if (!this.isTypes(TokenType.OpenBrace)) return new BlockLiteral([this.parseExpr()])

        this.expect(TokenType.OpenBrace, 'SyntaxError: Expected "{"')
        const body: Expr[] = []
        while (this.notEOF() && !this.isTypes(TokenType.CloseBrace)) {
            body.push(this.parseExpr())
        }
        this.expect(TokenType.CloseBrace, 'SyntaxError: Expected "}"')
        return new BlockLiteral(body)
    }

    private parseListLiteral(): Expr {
        this.expect(TokenType.OpenBracket, 'SyntaxError: Expected "["')
        let items: Expr[] = []
        while (this.notEOF() && !this.isTypes(TokenType.CloseBracket)) {
            const item = this.parseExpr()
            if (this.isTypes(TokenType.SemiColon)) {
                this.next()
            } else if (!this.isTypes(TokenType.CloseBracket)) {
                return error('SyntaxError: Expected ";" or "]"')
            }

            items.push(item)
        }
        this.expect(TokenType.CloseBracket, 'SyntaxError: Expected "]"')
        return new ListLiteral(items)
    }
}
