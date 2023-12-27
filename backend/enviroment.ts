import { RuntimeVal, FunctionVal, NativeFunctionVal } from "./value"
import { error } from "./utils"
import { NATIVEFUNC } from "./nativeFunc"

export default class Enviroment {
    private parent?: Enviroment
    private variables: Map<string, RuntimeVal> = new Map()
    private constances: Set<string> = new Set()

    constructor(parentEnv?: Enviroment) {
        this.parent = parentEnv
        if (parentEnv ? false : true) {
            for (const [name, func] of Object.entries(NATIVEFUNC)) {
                this.assingVar(name, new NativeFunctionVal(func), true)
            }
        }
    }

    // assign a var, change variable value is it doesn;t exit make it
    public assingVar(name: string, value: RuntimeVal, isConst: boolean): RuntimeVal {
        const env = this.resolve(name) ?? this
        if (env.constances.has(name)) return error(`Cannot assign value to constant`)
        if (isConst) this.constances.add(name)
        env.variables.set(name, value)
        return value
    }

    public getVar(name: string): RuntimeVal {
        const env = this.resolve(name)
        if (env === undefined) {
            return error(`Cannot access "${name}" because it does not exist`)
        }
        return env.variables.get(name) as RuntimeVal
    }

    // resolve a variable, find a variable scope, if it does nt exist error and die
    public resolve(name: string): Enviroment | undefined {
        if (this.variables.has(name)) return this
        if (!this.parent) return undefined
        return this.parent.resolve(name)
    }
}
