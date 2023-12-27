import { exit } from "process"

export function error(...message: any[]): any {
    console.log(...message)
    exit(1)
}
