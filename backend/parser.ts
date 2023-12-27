import { resolveTxt } from "dns"
import { PreUnaryOpTokens, PreUnaryOpType } from "./UnaryOp"
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
    FunctionLiteral,
    UnaryExpr,
    Block,
} from "./ast"
import { AdditiveOpToken, BinaryOpType, MultiplicativeToken } from "./binaryOp"
import Enviroment from "./enviroment"
import { Token, TokenType, tokenize } from "./lexer"
import { error } from "./utils"

// class to parse and store stuff
export default class Parser {
    token: Token[] = []

    // the current token
    private current(): Token {
        return this.token[0]
    }

    private isType(tokenType: TokenType): boolean {
        return this.current().isType(tokenType)
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
        return !this.isType(TokenType.EOF)
    }

    private parseArgs(): Expr[] {
        this.expect(TokenType.OpenParen, 'SyntaxError: Expected "("')
        let args: Expr[] = []
        // if not a empty function call keep parsing arg
        if (!this.isType(TokenType.CloseParen)) {
            args = [this.parseAssignmentExpr()]
            while (this.isType(TokenType.Comma) && this.next()) {
                args.push(this.parseAssignmentExpr())
            }
        }
        this.expect(TokenType.CloseParen, 'SyntaxError: Expected ")"')
        return args
    }

    // helper function
    private parseCallExpr(caller: Expr): CallExpr {
        let callExpr = new CallExpr(caller, this.parseArgs())
        if (this.isType(TokenType.OpenParen)) callExpr = this.parseCallExpr(callExpr) // chaining call expression
        return callExpr
    }

    // produce the ast for the interpreter
    public produceAST(source: string): Block {
        this.token = tokenize(source)
        const program: Expr[] = []

        // while not the end of the file keep parsing
        while (this.notEOF()) {
            program.push(this.parseExpr())
        }
        return new Block(program)
    }

    // expression order
    // 1. Primary (Literal)
    // 3. Member access
    // 4. Call
    // 5. Unary Operator
    // 6. Binary Operator (Multi then Add) NOTE flow from add to mul
    // 8. Function Construction
    // 9. Assignment
    //
    // Highest will be parse the deepest
    // lower will be parse first and place here
    private parseExpr(): Expr {
        return this.parseAssignmentExpr()
    }

    private parseAssignmentExpr(): Expr {
        const leftHand = this.parseFuncExpr()
        if (this.isTypes(TokenType.Equal, TokenType.Colon)) {
            const isConst = this.next().isType(TokenType.Colon)
            const rightHand = this.parseAssignmentExpr()
            return new AssignmentExpr(leftHand, rightHand, isConst)
        }
        return leftHand
    }

    private parseFuncExpr(): Expr {
        if (!this.isType(TokenType.Function)) {
            return this.parseAdditiveExpr()
        }
        this.next()
        const args = this.parseArgs().map((a) =>
            a.type === NodeType.Identifier ? (a as Identifier).symbol : error("SyntaxError: Expected Identifier")
        )
        const body = this.parseBlockExpr() as Block
        return new FunctionLiteral(args, body)
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
        let leftHand = this.parseUnaryExpr()

        while (this.isTypes(...MultiplicativeToken)) {
            const operator = this.next().value
            const rightHand = this.parseUnaryExpr()
            leftHand = new BinaryExpr(leftHand, rightHand, operator as BinaryOpType)
        }

        return leftHand
    }

    private parseUnaryExpr(): Expr {
        if (!this.isTypes(...PreUnaryOpTokens)) {
            return this.parseMemberCallExpr()
        }
        const op = this.next().value
        const expr = this.parseMemberCallExpr()
        return new UnaryExpr(expr, op as PreUnaryOpType)
    }

    private parseMemberCallExpr(): Expr {
        const member = this.parseMemberExpr()
        if (this.isType(TokenType.OpenParen)) {
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
                      this.expect(TokenType.CloseBracket, 'SyntaxError: Expected "]"')
                      return temp
                  })()
                : (() => {
                      let temp = this.parseBlockExpr()
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
            case TokenType.OpenParen:
                this.next() // cycle open parent
                const value = this.parseExpr()
                this.expect(TokenType.CloseParen, "SyntaxError: Expected Close Parenthesis")
                return value
            case TokenType.Null:
                this.next()
                return NULLLITERAL
            case TokenType.Boolean:
                return this.next().value == "true" ? TRUELITERAL : FALSELITERAL
            case TokenType.OpenDoubleAngle:
                return this.parseObjExpr()
            case TokenType.OpenBrace:
                return this.parseBlockExpr()
            default:
                return error(`SyntaxError: Unexpected Token:`, this.current())
        }
    }
    private parseObjExpr(): Expr {
        this.next()
        const properties: Property[] = []

        while (this.notEOF() && !this.isType(TokenType.CloseDoubleAngle)) {
            const key = this.expect(TokenType.Identifier, "SyntaxError: Expected key name").value

            // assign shorthand
            if (this.isType(TokenType.Comma) || this.current().isType(TokenType.CloseDoubleAngle)) {
                if (this.isType(TokenType.Comma)) this.next() // discard ,
                properties.push(new Property(key))
                continue
            }

            this.expect(TokenType.Colon, "Missing Colon")
            const value = this.parseExpr()
            properties.push(new Property(key, value))
            if (!this.isType(TokenType.CloseDoubleAngle)) {
                this.expect(TokenType.Comma, "SyntaxError: Expected comma")
            }
        }
        this.expect(TokenType.CloseDoubleAngle, 'SyntaxError: Expect ">>"')
        return new ObjectLiteral(properties)
    }

    private parseBlockExpr(): Expr {
        this.expect(TokenType.OpenBrace, 'SyntaxError: Expected "{"')
        const body: Expr[] = []
        while (this.notEOF() && !this.current().isType(TokenType.CloseBrace)) {
            body.push(this.parseExpr())
        }
        this.expect(TokenType.CloseBrace, 'SyntaxError: Expected "}"')
        return new Block(body)
    }
}
