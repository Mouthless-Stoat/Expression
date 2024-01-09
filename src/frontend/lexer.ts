import { error } from "../utils"

// token type
export enum TokenType {
    // Literal Type
    Number,
    Identifier,
    Null,
    Boolean,
    StringLiteral,
    ControlLiteral,
    CharacterLiteral,

    // keyword
    While,
    For,
    In,
    Of,

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
    Question,
    Greater,
    Lesser,
    Tilde,
    Pi,
    Avagadro,

    // long symbol
    Increment, // ++
    Decrement, // --
    Bunny, // =:
    DoubleColon, // ::
    Walrus, // :=
    DoubleArrow, // =>
    Arrow, // ->
    GreaterEqual, // >=
    LesserEqual, // <=
    Spaceship, // <=>
    Equality, // ==
    And, // &&
    Or, // ||

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

    isTypes(...tokenType: TokenType[]): boolean {
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
    "~": TokenType.Tilde,
    ω: TokenType.Omega,
    π: TokenType.Pi,
    L: TokenType.Avagadro,
    "?": TokenType.Question,
    ">": TokenType.Greater,
    "<": TokenType.Lesser,
}

// multichar token
const multiToken: Map<string, TokenType> = (() => {
    return new Map<string, TokenType>(
        [
            ...Object.entries({
                "<<": TokenType.OpenDoubleAngle,
                ">>": TokenType.CloseDoubleAngle,
                "++": TokenType.Increment,
                "--": TokenType.Decrement,
                "::": TokenType.DoubleColon,
                "=>": TokenType.DoubleArrow,
                "->": TokenType.Arrow,
                ">=": TokenType.GreaterEqual,
                "<=": TokenType.LesserEqual,
                "<=>": TokenType.Spaceship,
                "==": TokenType.Equality,
                "&&": TokenType.And,
                "||": TokenType.Or,
                Nₐ: TokenType.Avagadro,
            }),
        ].sort(([a, _], [b, __]) => a.length - b.length)
    )
})()

const keyword = {
    null: TokenType.Null,
    true: TokenType.Boolean,
    false: TokenType.Boolean,
    while: TokenType.While,
    for: TokenType.For,
    in: TokenType.In,
    of: TokenType.Of,
    break: TokenType.ControlLiteral,
    continue: TokenType.ControlLiteral,
}

// parse input into a list of token that can be use to generate an ast later
export function tokenize(source: string): Token[] {
    const tokens = Array<Token>()
    const src = source.split("")
    const push = (tokenType: TokenType, value = "") => tokens.push(new Token(tokenType, value))

    while (src.length > 0) {
        const char = src[0]
        const multichar = (() => {
            for (const [token, _] of multiToken) {
                if (src.slice(0, token.length).join("") === token) {
                    return token
                }
            }
            return false
        })()
        if (isSkip(char)) {
            src.shift()
        } else if (multichar) {
            push(multiToken.get(multichar) ?? 0, src.splice(0, multichar.length).join(""))
        } else if (charToken[char]) {
            push(charToken[char], src.shift())
        } else {
            const isNumber = isNumeric(char)
            const isString = char === '"'
            let acc = ""

            if (char === '"') {
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
                    return error("SyntaxError: Expected End of String")
                }
                try {
                    push(TokenType.StringLiteral, JSON.parse(`"${acc}"`))
                    continue
                } catch {
                    return error(
                        "XperBug: Unable to parse string. You should not be able to see this message, it is a interpreter bug"
                    )
                }
            } else if (char === "@") {
                src.shift()
                let char = src.shift()
                if (char === "\\") {
                    char += src.shift()
                } else if (char === "\n" || char === "\r") {
                    src.shift()
                    char = "\\n"
                }
                try {
                    push(TokenType.CharacterLiteral, JSON.parse(`"${char}"`))
                    continue
                } catch {
                    return error(
                        "XperBug: Unable to parse string. You should not be able to see this message, it is a interpreter bug"
                    )
                }
            }

            if (!isNumber && !isNamic(char) && !isString) {
                error("WHAT THE FUCK IS THIS", char, char.charCodeAt(0))
            }

            const condition = () => src.length > 0 && (isNumber ? isNumeric : isNamic)(src[0])
            while (condition()) acc += src.shift()

            if (isNumber) {
                push(TokenType.Number, acc)
            } else {
                if (typeof keyword[acc as keyof typeof keyword] === "number")
                    push(keyword[acc as keyof typeof keyword], acc)
                else push(TokenType.Identifier, acc)
            }
        }
        continue
    }

    push(TokenType.EOF, "EOF")
    return tokens
}
