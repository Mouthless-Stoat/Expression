"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = exports.Token = exports.TokenType = void 0;
const utils_1 = require("../utils");
// token type
var TokenType;
(function (TokenType) {
    // Literal Type
    TokenType[TokenType["Number"] = 0] = "Number";
    TokenType[TokenType["Identifier"] = 1] = "Identifier";
    TokenType[TokenType["Null"] = 2] = "Null";
    TokenType[TokenType["Boolean"] = 3] = "Boolean";
    TokenType[TokenType["StringLiteral"] = 4] = "StringLiteral";
    TokenType[TokenType["ControlLiteral"] = 5] = "ControlLiteral";
    // keyword
    TokenType[TokenType["While"] = 6] = "While";
    TokenType[TokenType["For"] = 7] = "For";
    TokenType[TokenType["In"] = 8] = "In";
    TokenType[TokenType["Of"] = 9] = "Of";
    // delimiter
    TokenType[TokenType["OpenParen"] = 10] = "OpenParen";
    TokenType[TokenType["CloseParen"] = 11] = "CloseParen";
    TokenType[TokenType["OpenBrace"] = 12] = "OpenBrace";
    TokenType[TokenType["CloseBrace"] = 13] = "CloseBrace";
    TokenType[TokenType["OpenBracket"] = 14] = "OpenBracket";
    TokenType[TokenType["CloseBracket"] = 15] = "CloseBracket";
    TokenType[TokenType["OpenDoubleAngle"] = 16] = "OpenDoubleAngle";
    TokenType[TokenType["CloseDoubleAngle"] = 17] = "CloseDoubleAngle";
    // symbol
    TokenType[TokenType["Comma"] = 18] = "Comma";
    TokenType[TokenType["Colon"] = 19] = "Colon";
    TokenType[TokenType["Equal"] = 20] = "Equal";
    TokenType[TokenType["Dot"] = 21] = "Dot";
    TokenType[TokenType["Plus"] = 22] = "Plus";
    TokenType[TokenType["Minus"] = 23] = "Minus";
    TokenType[TokenType["Star"] = 24] = "Star";
    TokenType[TokenType["Slash"] = 25] = "Slash";
    TokenType[TokenType["Percent"] = 26] = "Percent";
    TokenType[TokenType["Pipe"] = 27] = "Pipe";
    TokenType[TokenType["Quote"] = 28] = "Quote";
    TokenType[TokenType["Dollar"] = 29] = "Dollar";
    TokenType[TokenType["Ampersand"] = 30] = "Ampersand";
    TokenType[TokenType["Octothorp"] = 31] = "Octothorp";
    TokenType[TokenType["Exclamation"] = 32] = "Exclamation";
    TokenType[TokenType["Omega"] = 33] = "Omega";
    TokenType[TokenType["Question"] = 34] = "Question";
    TokenType[TokenType["Greater"] = 35] = "Greater";
    TokenType[TokenType["Lesser"] = 36] = "Lesser";
    TokenType[TokenType["Pi"] = 37] = "Pi";
    TokenType[TokenType["Avagadro"] = 38] = "Avagadro";
    // long symbol
    TokenType[TokenType["Increment"] = 39] = "Increment";
    TokenType[TokenType["Decrement"] = 40] = "Decrement";
    TokenType[TokenType["Bunny"] = 41] = "Bunny";
    TokenType[TokenType["DoubleColon"] = 42] = "DoubleColon";
    TokenType[TokenType["Walrus"] = 43] = "Walrus";
    TokenType[TokenType["DoubleArrow"] = 44] = "DoubleArrow";
    TokenType[TokenType["Arrow"] = 45] = "Arrow";
    TokenType[TokenType["GreaterEqual"] = 46] = "GreaterEqual";
    TokenType[TokenType["LesserEqual"] = 47] = "LesserEqual";
    TokenType[TokenType["Spaceship"] = 48] = "Spaceship";
    TokenType[TokenType["Equality"] = 49] = "Equality";
    TokenType[TokenType["And"] = 50] = "And";
    TokenType[TokenType["Or"] = 51] = "Or";
    // special for handling
    TokenType[TokenType["EOF"] = 52] = "EOF";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
class Token {
    constructor(tokenType, value) {
        this.type = tokenType;
        this.value = value;
    }
    isTypes(...tokenType) {
        return tokenType.some((t) => this.type === t);
    }
}
exports.Token = Token;
function isNamic(char) {
    return !!char.match(/[a-zA-Z_]/g); // type coercion go brrrrrrr
}
function isNumeric(char) {
    return !!char.match(/[0-9]/g);
}
function isSkip(char) {
    return [" ", "\n", "\r", "\t"].includes(char);
}
// single char token
const charToken = {
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
    π: TokenType.Pi,
    "?": TokenType.Question,
    ">": TokenType.Greater,
    "<": TokenType.Lesser,
};
// multichar token
const multiToken = (() => {
    return new Map([
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
    ].sort(([a, _], [b, __]) => a.length - b.length));
})();
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
};
// parse input into a list of token that can be use to generate an ast later
function tokenize(source) {
    var _a;
    const tokens = Array();
    const src = source.split("");
    const push = (tokenType, value = "") => tokens.push(new Token(tokenType, value));
    while (src.length > 0) {
        const char = src[0];
        const multichar = (() => {
            for (const [token, _] of multiToken) {
                if (src.slice(0, token.length).join("") === token) {
                    return token;
                }
            }
            return false;
        })();
        if (isSkip(char)) {
            src.shift();
        }
        else if (multichar) {
            push((_a = multiToken.get(multichar)) !== null && _a !== void 0 ? _a : 0, src.splice(0, multichar.length).join(""));
        }
        else if (charToken[char]) {
            push(charToken[char], src.shift());
        }
        else {
            const isNumber = isNumeric(char);
            const isString = char === '"';
            if (!isNumber && !isNamic(char) && !isString) {
                (0, utils_1.error)("WHAT THE FUCK IS THIS", char, char.charCodeAt(0));
            }
            let acc = "";
            if (isString) {
                src.shift();
                while (src.length > 0 && src[0] !== '"') {
                    let char = src.shift();
                    if (char === "\\") {
                        char += src.shift();
                    }
                    else if (char === "\n" || char === "\r") {
                        src.shift();
                        char = "\\n";
                    }
                    acc += char;
                }
                if (src.shift() !== '"') {
                    return (0, utils_1.error)("SyntaxError: Expected End of String");
                }
                // using eval here so all escape char work
                // def not a security issue
                push(TokenType.StringLiteral, eval(`\"${acc}\"`));
                continue;
            }
            const condition = () => src.length > 0 && (isNumber ? isNumeric : isNamic)(src[0]);
            while (condition())
                acc += src.shift();
            if (isNumber) {
                push(TokenType.Number, acc);
            }
            else {
                if (keyword[acc])
                    push(keyword[acc], acc);
                else
                    push(TokenType.Identifier, acc);
            }
        }
        continue;
    }
    push(TokenType.EOF, "EOF");
    return tokens;
}
exports.tokenize = tokenize;
