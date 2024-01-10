let scream = true

export const toggleScream = (state?: boolean) => (scream = state ?? !scream)

class XperError extends Error {
    constructor(msg: string) {
        super(msg)
        this.name = "XperError"
    }
}

export function error(...message: any[]): any {
    if (scream) console.log(...message)
    throw new XperError(message.join(" "))
}

export function clamp(num: number, min: number, max: number): number {
    return Math.min(max, Math.max(num, min))
}

export function expectArgs(args: any[], amount: number, isExact = true): any[] {
    if (isExact ? args.length !== amount : args.length < amount)
        return error(`Expected${isExact ? "" : " at least"}`, amount, "argument but given", args.length)
    return args
}
