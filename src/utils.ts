export function error(...message: any[]): any {
    console.log(...message)
    throw new Error("Error")
}

export function clamp(num: number, min: number, max: number): number {
    return Math.min(max, Math.max(num, min))
}
