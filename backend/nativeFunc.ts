import Enviroment from "./enviroment"
import { FunctionCall, NULLVAL, RuntimeVal } from "./value"

export const NATIVEFUNC: Record<string, FunctionCall> = {
    print: (args: RuntimeVal[], _) => {
        console.log(...args.map((v) => v.value))
        return NULLVAL
    },
}
