let scream = true

export const toggleScream = (state?: boolean) => (scream = state ?? !scream)

export function error(...message: any[]): any {
    if (scream) console.log(...message)
    throw new Error("Error")
}

export function clamp(num: number, min: number, max: number): number {
    return Math.min(max, Math.max(num, min))
}
