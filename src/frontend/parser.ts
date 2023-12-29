import {
    Expr,
    Identifier,
    NumberLiteral,
    NULLLITERAL,
    BinaryExpr,
    TRUELITERAL,
    FALSELITERAL,
    AssignmentExpr,
    Property,
    ObjectLiteral,
    CallExpr,
    NodeType,
    MemberExpr,
    FunctionExpr,
    PreUnaryExpr,
    BlockLiteral,
    StringLiteral,
    ListLiteral,
    IfExpr,
} from "./ast"
import { AdditiveOpToken, BinaryOpType, LogicalOpToken, MultiplicativeToken } from "../runtime/binaryOp"
import { PreUnaryOpTokens, PreUnaryOpType } from "../runtime/UnaryOp"
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
        return tokenType.some((t) => this.current().isType(t))
    }
    // destroy the current token and return it
    private next(): Token {
        return this.token.shift() as Token
    }

    // like next but if the token is not what we expect error
    private expect(expected: TokenType, err: string): Token {
        const tk = this.next()
        // if no token or not the correct type throw error
        if (!tk || !tk.isType(expected)) {
            return error(err)
        }
        return tk
    }

    // condition for end of file
    private notEOF(): boolean {
        return !this.isTypes(TokenType.EOF)
    }

    private parseArgs(): Expr[] {
        this.expect(TokenType.OpenParen, "SyntaxError: Expected (")
        let args: Expr[] = []
        // if not a empty function call keep parsing arg
        if (!this.isTypes(TokenType.CloseParen)) {
            args = [this.parseAssignmentExpr()]
            while (this.isTypes(TokenType.Comma) && this.next()) {
                args.push(this.parseAssignmentExpr())
            }
        }
        this.expect(TokenType.CloseParen, "SyntaxError: Expected )")
        return args
    }

    // helper function
    private parseCallExpr(caller: Expr): CallExpr {
        let callExpr = new CallExpr(caller, this.parseArgs())
        if (this.isTypes(TokenType.OpenParen)) callExpr = this.parseCallExpr(callExpr) // chaining call expression
        return callExpr
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
    // 2. Member access
    // 3. Call
    // 4. Prefix Unary Operator
    // 5. Binary Operator (Multi then Add then logical) NOTE flow from add to mul to logical
    // 7. If
    // 8. Assignment
    // 7. Function Construction
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
            return this.parseAssignmentExpr()
        }
        const args = this.parseArgs().map((a) =>
            a.type === NodeType.Identifier ? (a as Identifier).symbol : error("SyntaxError: Expected Identifier")
        )
        this.expect(TokenType.DoubleArrow, "SyntaxError: Expected =>")
        const body = this.parseBlockExpr() as BlockLiteral
        return new FunctionExpr(args, body)
    }

    private parseAssignmentExpr(): Expr {
        const leftHand = this.parseIfExpr()
        if (this.isTypes(TokenType.Equal, TokenType.DoubleColon)) {
            const isConst = this.next().isType(TokenType.DoubleColon)
            const rightHand = this.parseFuncExpr() // go up so u can assign to function
            return new AssignmentExpr(leftHand, rightHand, isConst)
        }
        return leftHand
    }

    private parseIfExpr(): Expr {
        let condition = this.parseLogicalExpr()
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

    private parseLogicalExpr(): Expr {
        let leftHand = this.parseAdditiveExpr()

        while (this.isTypes(...LogicalOpToken)) {
            const operator = this.next().value
            const rightHand = this.parseAdditiveExpr()
            leftHand = new BinaryExpr(leftHand, rightHand, operator as BinaryOpType)
        }

        return leftHand
    }

    private parseAdditiveExpr(): Expr {
        let leftHand = this.parseMultiplicativeExpr()

        while (this.isTypes(...AdditiveOpToken)) {
            const operator = this.next().value
            const rightHand = this.parseMultiplicativeExpr()
            leftHand = new BinaryExpr(leftHand, rightHand, operator as BinaryOpType)
        }

        return leftHand
    }

    private parseMultiplicativeExpr(): Expr {
        let leftHand = this.parsePreUnaryExpr()

        while (this.isTypes(...MultiplicativeToken)) {
            const operator = this.next().value
            const rightHand = this.parsePreUnaryExpr()
            leftHand = new BinaryExpr(leftHand, rightHand, operator as BinaryOpType)
        }

        return leftHand
    }

    private parsePreUnaryExpr(): Expr {
        if (!this.isTypes(...PreUnaryOpTokens)) {
            return this.parseMemberCallExpr()
        }
        const op = this.next().value
        const expr = this.parseMemberCallExpr()
        return new PreUnaryExpr(expr, op as PreUnaryOpType)
    }

    private parseMemberCallExpr(): Expr {
        const member = this.parseMemberExpr()
        if (this.isTypes(TokenType.OpenParen)) {
            return this.parseCallExpr(member) // chaning call
        }
        return member
    }

    private parseMemberExpr(): Expr {
        let object = this.parsePrimaryExpr()
        while (this.isTypes(TokenType.Dot, TokenType.OpenBracket)) {
            let comp = !this.next().isType(TokenType.Dot)
            let member = comp
                ? (() => {
                      let temp = this.parseExpr()
                      this.expect(TokenType.CloseBracket, "SyntaxError: Expected ]")
                      return temp
                  })()
                : (() => {
                      let temp = this.parsePrimaryExpr()
                      if (temp.type != NodeType.Identifier) {
                          return error("SyntaxError: Expected Indentifier")
                      }
                      return temp
                  })()

            object = new MemberExpr(object, member, comp)
        }
        return object
    }

    private parsePrimaryExpr(): Expr {
        switch (this.current().type) {
            case TokenType.Identifier:
                return new Identifier(this.next().value)
            case TokenType.Number:
                return new NumberLiteral(parseFloat(this.next().value))
            case TokenType.Null:
                this.next()
                return NULLLITERAL
            case TokenType.Boolean:
                return this.next().value == "true" ? TRUELITERAL : FALSELITERAL
            case TokenType.StringLiteral:
                return new StringLiteral(this.next().value)
            case TokenType.OpenBrace:
                return this.parseBlockExpr()
            case TokenType.OpenDoubleAngle:
                return this.parseObjExpr()
            case TokenType.OpenBracket:
                return this.parseListLiteral()
            case TokenType.Omega:
                this.next()
                return new NumberLiteral(0)
            default:
                return error(`SyntaxError: Unexpected Token:`, this.current())
        }
    }

    private parseBlockExpr(): Expr {
        // small block containing a single expr
        if (!this.isTypes(TokenType.OpenBrace)) return new BlockLiteral([this.parseExpr()])

        this.expect(TokenType.OpenBrace, "SyntaxError: Expected {")
        const body: Expr[] = []
        while (this.notEOF() && !this.current().isType(TokenType.CloseBrace)) {
            body.push(this.parseExpr())
        }
        this.expect(TokenType.CloseBrace, "SyntaxError: Expected }")
        return new BlockLiteral(body)
    }

    private parseObjExpr(): Expr {
        this.expect(TokenType.OpenDoubleAngle, "SyntaxError: Expected <<")
        const properties: Property[] = []

        while (this.notEOF() && !this.isTypes(TokenType.CloseDoubleAngle)) {
            const key = this.parseFuncExpr()

            // assign shorthand
            if (this.isTypes(TokenType.Comma) || this.isTypes(TokenType.CloseDoubleAngle)) {
                if (this.isTypes(TokenType.Comma)) this.next() // discard ,
                properties.push(new Property(key))
                continue
            }
            let isConst: boolean = this.isTypes(TokenType.DoubleColon, TokenType.Equal)
                ? this.next().isType(TokenType.DoubleColon)
                : error("SyntaxError: Expected = or :")

            const value = this.parseExpr()
            properties.push(new Property(key, value, isConst))
            if (!this.isTypes(TokenType.CloseDoubleAngle)) {
                this.expect(TokenType.Comma, "SyntaxError: Expected ,")
            }
        }
        this.expect(TokenType.CloseDoubleAngle, "SyntaxError: Expect >>")
        return new ObjectLiteral(properties)
    }

    private parseListLiteral(): Expr {
        this.expect(TokenType.OpenBracket, "SyntaxError: Expected [")
        let items: Expr[] = []
        while (this.notEOF() && !this.isTypes(TokenType.CloseBracket)) {
            const item = this.parseExpr()
            if (this.isTypes(TokenType.Comma)) {
                this.next()
            } else if (!this.isTypes(TokenType.CloseBracket)) {
                return error("SyntaxError: Expected , or ]")
            }

            items.push(item)
        }
        this.expect(TokenType.CloseBracket, "SyntaxError: Expected ]")
        return new ListLiteral(items)
    }
}
