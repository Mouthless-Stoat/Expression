function formatter(open: string, close: string = Code.default) {
    return (string: string) => open + string + close
}

export const Code = {
    // fg color
    black: "\x1b[30m",
    red: "\x1b[38;2;246;88;102m",
    green: "\x1b[38;2;139;205;91m",
    yellow: "\x1b[38;2;239;189;93m",
    blue: "\x1b[38;2;65;167;252m",
    magenta: "\x1b[38;2;255;128;213m",
    cyan: "\x1b[38;2;52;191;208m",
    purple: "\x1b[38;2;199;90;232m",
    orange: "\x1b[38;2;221;144;70m",
    grey: "\x1b[38;2;69;85;116m",
    white: "\x1b[38m",
    default: "\x1b[39m",

    //bg color
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[48;2;246;88;102m",
    bgGreen: "\x1b[48;2;139;205;91m",
    bgYellow: "\x1b[48;2;239;189;93m",
    bgBlue: "\x1b[48;2;65;167;252m",
    bgMagenta: "\x1b[48;2;255;128;213m",
    bgCyan: "\x1b[48;2;52;191;208m",
    bgPurple: "\x1b[48;2;199;90;232m",
    bgOrange: "\x1b[48;2;221;144;70m",
    bgGrey: "\x1b[48;2;69;85;116m",
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
    black: formatter(Code.black),
    red: formatter(Code.red),
    green: formatter(Code.green),
    yellow: formatter(Code.yellow),
    blue: formatter(Code.blue),
    magenta: formatter(Code.magenta),
    cyan: formatter(Code.cyan),
    white: formatter(Code.white),
    orange: formatter(Code.orange),
    purple: formatter(Code.purple),
}

export default Color
