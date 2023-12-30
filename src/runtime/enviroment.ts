import { RuntimeVal, NativeFunctionVal } from "./value"
import { error } from "../utils"
import { NATIVEFUNC } from "./nativeFunc"

export default class Enviroment {
    parent?: Enviroment
    private variables: Map<string, RuntimeVal> = new Map()
    private constances: Set<string> = new Set()
    evalStack: RuntimeVal[] = []

    constructor(parentEnv?: Enviroment) {
        this.parent = parentEnv
        if (parentEnv ? false : true) {
            for (const [name, func] of Object.entries(NATIVEFUNC)) {
                this.assingVar(name, new NativeFunctionVal(func), true)
            }
        }
    }

    // assign a var, change variable value is it doesn;t exit make it
    // lower scope should not breed out
    public assingVar(name: string, value: RuntimeVal, isConst: boolean): RuntimeVal {
        if (this.constances.has(name)) return error(`Cannot assign value to constant`)
        if (isConst) this.constances.add(name)
        this.variables.set(name, value)
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

    public pushStack(value: RuntimeVal): RuntimeVal {
        this.evalStack.unshift(value)
        return value
    }

    public isConstant(name: string): boolean {
        const env = this.resolve(name)
        if (!env) return false
        return env.constances.has(name)
    }

    public unsignVar(name: string): RuntimeVal {
        const oldVal = this.getVar(name)
        this.variables.delete(name)
        if (this.isConstant(name)) this.constances.delete(name)
        return oldVal
    }
}
