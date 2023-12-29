import { error } from "../utils"

// token type
export enum TokenType {
    // Literal Type
    Number,
    Identifier,
    Null,
    Boolean,
    StringLiteral,

    // keyword
    Function,

    // delimiter
    OpenParen,
    CloseParen,
    OpenBrace,
    CloseBrace,
    OpenBracket,
    CloseBracket,
    OpenDoubleAngle,
    CloseDoubleAngle,

    // symbol
    Comma,
    Colon,
    Equal,
    Dot,
    Plus,
    Minus,
    Star,
    Slash,
    Percent,
    Pipe,
    Quote,
    Dollar,
    Ampersand,
    Octothorp,
    Exclamation,
    Omega,

    // long symbol
    Increment,
    Decrement,

    // special for handling
    EOF,
}

export class Token {
    type: TokenType
    value: string
    constructor(tokenType: TokenType, value: string) {
        this.type = tokenType
        this.value = value
    }

    isType(...tokenType: TokenType[]): boolean {
        return tokenType.some((t) => this.type === t)
    }
}

function isNamic(char: string): boolean {
    return !!char.match(/[a-zA-Z_]/g) // type coercion go brrrrrrr
}

function isNumeric(char: string): boolean {
    return !!char.match(/[0-9]/g)
}

function isSkip(char: string): boolean {
    return [" ", "\n", "\r", "\t"].includes(char)
}

// single char token
const charToken: Record<string, TokenType> = {
    "(": TokenType.OpenParen,
    ")": TokenType.CloseParen,
    "{": TokenType.OpenBrace,
    "}": TokenType.CloseBrace,
    "[": TokenType.OpenBracket,
    "]": TokenType.CloseBracket,
    ":": TokenType.Colon,
    ";": TokenType.Null,
    ".": TokenType.Dot,
    "=": TokenType.Equal,
    ",": TokenType.Comma,
    "|": TokenType.Pipe,
    "'": TokenType.Quote,
    $: TokenType.Dollar,
    "&": TokenType.Ampersand,
    "#": TokenType.Octothorp,
    "+": TokenType.Plus,
    "-": TokenType.Minus,
    "*": TokenType.Star,
    "/": TokenType.Slash,
    "%": TokenType.Percent,
    "!": TokenType.Exclamation,
    ω: TokenType.Omega,
}

// multichar token
const multiToken: Map<string, TokenType> = (() => {
    return new Map<string, TokenType>(
        [
            ...Object.entries({
                null: TokenType.Null,
                true: TokenType.Boolean,
                false: TokenType.Boolean,
                fn: TokenType.Function,
                "<<": TokenType.OpenDoubleAngle,
                ">>": TokenType.CloseDoubleAngle,
                "++": TokenType.Increment,
                "--": TokenType.Decrement,
            }),
        ].sort(([a, _], [b, __]) => a.length - b.length)
    )
})()

// parse input into a list of token that can be use to generate an ast later
export function tokenize(source: string): Token[] {
    const tokens = Array<Token>()
    const src = source.split("")
    const push = (tokenType: TokenType, value = "") => tokens.push(new Token(tokenType, value))

    while (src.length > 0) {
        const char = src[0]
        const keyword = (() => {
            for (const [keyword, _] of multiToken) {
                if (src.slice(0, keyword.length).join("") === keyword) {
                    return keyword
                }
            }
            return false
        })()
        if (isSkip(char)) {
            src.shift()
        } else if (keyword) {
            push(multiToken.get(keyword) ?? 0, src.splice(0, keyword.length).join(""))
        } else if (charToken[char]) {
            push(charToken[char], src.shift())
        } else {
            const isNumber = isNumeric(char)
            const isString = char === '"'
            if (!isNumber && !isNamic(char) && !isString) {
                error("WHAT THE FUCK IS THIS", char, char.charCodeAt(0))
            }
            let acc = ""

            if (isString) {
                src.shift()
                while (src.length > 0 && src[0] !== '"') {
                    let char = src.shift()
                    if (char === "\\") {
                        char += src.shift()
                    } else if (char === "\n" || char === "\r") {
                        src.shift()
                        char = "\\n"
                    }
                    acc += char
                }
                if (src.shift() !== '"') {
                    return error('SyntaxError: Expected "')
                }
                // using eval here so all escape char work
                // def not a security issue
                push(TokenType.StringLiteral, eval(`\"${acc}\"`))
                continue
            }

            const condition = () => src.length > 0 && (isNumber ? isNumeric : isNamic)(src[0])
            while (condition()) acc += src.shift()

            if (isNumber) {
                push(TokenType.Number, acc)
            } else {
                push(TokenType.Identifier, acc)
            }
        }
        continue
    }

    push(TokenType.EOF, "EOF")
    return tokens
}
