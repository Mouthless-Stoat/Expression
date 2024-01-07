import { RuntimeVal, NativeFunctionVal } from "./value"
import { error } from "../utils"
import { NATIVEFUNC, NATIVEGLOBAL } from "./native"

export default class Enviroment {
    private variables: Map<string, RuntimeVal> = new Map()
    private constances: Set<string> = new Set()
    private startVar: number
    private varLimt: number = 10
    evalStack: RuntimeVal[] = []

    constructor() {
        for (const [name, val] of Object.entries(NATIVEGLOBAL)) {
            this.assingVar(name, val, false)
        }
        for (const [name, func] of Object.entries(NATIVEFUNC)) {
            this.assingVar(name, new NativeFunctionVal(func), true)
        }
        this.startVar = this.variables.size
    }

    // assign a var, change variable value is it doesn;t exit make it
    // lower scope should not breed out
    public assingVar(name: string, value: RuntimeVal, isConst: boolean): RuntimeVal {
        if (this.variables.size - this.startVar >= this.varLimt)
            return error("Xper: Due to memory concern you cannot have more than", this.varLimt, "variables")

        if (this.constances.has(name)) return error(`TypeError: Cannot assign value to Constant "${name}"`)
        if (isConst) this.constances.add(name)
        this.variables.set(name, value)
        return value
    }

    public getVar(name: string): RuntimeVal {
        if (!this.hasVar(name)) {
            return error(`ReferenceError: Cannot access "${name}" because it does not exist`)
        }
        return this.variables.get(name) as RuntimeVal
    }

    public pushStack(value: RuntimeVal): RuntimeVal {
        this.evalStack.unshift(value)
        return value
    }

    public isConstant(name: string): boolean {
        return this.constances.has(name)
    }

    public unsignVar(name: string): RuntimeVal {
        const oldVal = this.getVar(name)
        this.variables.delete(name)
        if (this.isConstant(name)) this.constances.delete(name)
        return oldVal
    }

    public clone(): Enviroment {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this) // clone the env to redo some cal
    }

    public hasVar(name: string): boolean {
        return this.variables.has(name)
    }
}
