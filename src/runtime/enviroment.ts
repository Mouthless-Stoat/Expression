import { RuntimeVal, NativeFunctionVal, NumberVal } from "./value"
import { error } from "../utils"
import { NATIVEFUNC, NATIVEGLOBAL } from "./native"
import deepClone from "lodash.clonedeep"

interface Variable {
    value: RuntimeVal
    accessLimit: NumberVal
}

/**
 * A enviroment to store variable and other identifier
 * */
export default class Enviroment {
    private variables: Map<string, Variable> = new Map()
    private constances: Set<string> = new Set()
    private startVar: number
    private varLimt: number = 10
    evalStack: RuntimeVal[] = []

    constructor() {
        for (const [name, val] of Object.entries(NATIVEGLOBAL)) {
            this.assignVar(name, val, false)
        }
        for (const [name, func] of Object.entries(NATIVEFUNC)) {
            this.assignVar(name, new NativeFunctionVal(func), false)
        }
        this.startVar = this.variables.size
    }

    /**
     * Assign a variable and make it, if it doesn't exist.
     * Error if the variable limit is surpass and when attempting to assign to a constant
     *
     * @param name The name of the variable
     * @param value The value to assign the variable to
     * @param isConst whether the variable is constant or not
     *
     * @returns the value the variable
     * */
    public assignVar(
        name: string,
        value: RuntimeVal,
        isConst: boolean,
        ref = false,
        limit = new NumberVal(-1)
    ): RuntimeVal {
        // if this run before startVar is define the value will be NaN and will return false
        if (limit.value === 0) return value
        if (this.variables.size - this.startVar >= this.varLimt)
            return error("Xper: Due to memory concern you cannot have more than", this.varLimt, "variables")

        if (this.constances.has(name)) return error(`TypeError: Cannot assign value to Constant "${name}"`)
        if (isConst) this.constances.add(name)
        this.variables.set(name, { accessLimit: limit, value: ref ? value : deepClone(value) })
        return value
    }

    /**
     * Get the value of a variable.
     * Error if the variable does not exist
     * @param name The name of the variable
     *
     * @returns The value of the variable
     * */
    public getVar(name: string): RuntimeVal {
        if (!this.hasVar(name)) {
            return error(`ReferenceError: Cannot access "${name}" because it does not exist`)
        }
        let variable = this.variables.get(name) ?? (error("XperBug: Variable does not exist") as Variable)

        if (--variable.accessLimit.value === 0) {
            this.variables.delete(name)
            if (this.isConstant(name)) this.constances.delete(name)
        }
        return variable.value as RuntimeVal
    }

    /**
     * Get the variable
     * Error if the variable does not exist
     * @param name The name of the variable
     *
     * @returns The variable
     * */
    public trueGetVar(name: string): Variable {
        if (!this.hasVar(name)) {
            return error(`ReferenceError: Cannot access "${name}" because it does not exist`)
        }
        let variable = this.variables.get(name) ?? (error("XperBug: Variable does not exist") as Variable)

        return variable
    }

    /**
     * Push a value to the evaluation stack. This is done automatically after every top level expression evaluation.
     * @param value The value to push on the stack
     *
     * @returns The value pushed to the stack
     * */
    public pushStack(value: RuntimeVal): RuntimeVal {
        this.evalStack.unshift(value)
        return value
    }

    /**
     * Check if a variable is a constant.
     * @param name The name of the variable
     *
     * @returns whether the value is constant
     * */

    public isConstant(name: string): boolean {
        return this.constances.has(name)
    }

    /**
     * Unsign a variable. Remove a variable declaration and it can not be use anymore.
     * @param name The name of the variable
     *
     * @returns The old value of the variable
     * */
    public unsignVar(name: string): RuntimeVal {
        const oldVal = this.getVar(name)
        this.variables.delete(name)
        if (this.isConstant(name)) this.constances.delete(name)
        return oldVal
    }

    /**
     * Clone the enviroment.
     *
     * @returns A copy of the Enviroment Object
     * */

    public clone(): Enviroment {
        return deepClone(this)
    }

    /**
     * Check if a variable exist in the enviroment.
     * @param name The name of the variable
     *
     * @returns Whether the variable exist
     * */
    public hasVar(name: string): boolean {
        return this.variables.has(name)
    }
}
