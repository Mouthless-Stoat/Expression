function formatter(open: string, close: string) {
    return (string: string) => open + string + close
}

export const Code = {
    // fg color
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    default: "\x1b[39m",

    //bg color
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",
    bgDefault: "\x1b[49m",

    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    italic: "\x1b[3m",
    underline: "\x1b[4m",
    blink: "\x1b[5m",
    inverse: "\x1b[7m",
    hidden: "\x1b[8m",
    strike: "\x1b[9m",

    //reset format
    resetReset: "\x1b[20m",
    resetBold: "\x1b[21m",
    resetDim: "\x1b[22m",
    resetItalic: "\x1b[23m",
    resetUnderline: "\x1b[24m",
    resetBlink: "\x1b[25m",
    resetInverse: "\x1b[27m",
    resetHidden: "\x1b[28m",
    resetStrike: "\x1b[29m",
}
const Color = {
    black: formatter(Code.black, Code.default),
    red: formatter(Code.red, Code.default),
    green: formatter(Code.green, Code.default),
    yellow: formatter(Code.yellow, Code.default),
    blue: formatter(Code.blue, Code.default),
    magenta: formatter(Code.magenta, Code.default),
    cyan: formatter(Code.cyan, Code.default),
    white: formatter(Code.white, Code.default),
}

export default Color
