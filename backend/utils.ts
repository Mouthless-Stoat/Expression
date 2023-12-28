export function error(...message: any[]): any {
    console.log(...message)
    throw new Error("Error")
}
