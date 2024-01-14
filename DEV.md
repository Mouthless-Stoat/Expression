# Dev File

## Note

you found it you foudn my dev file welcome to my madness this is where all the note live

-   Code formatting and Syntax
    -   prop gonna just use the ast then format the thing base on the ast
-   Push Notation
    -   Syntax: `val >>(index) list`
        -   `index` is optional and can be omitted
        -   Push `val` to the back of the list if index not given
        -   Provide index to push to a specific location.
            -   `8 >>(1) a` push `8` into the `1` postition and shift everything back `[1;2;3] -> [1;8;2;3]`
-   Pop Notation
    -   Syntax: `<<(index) list`
        -   `index` is optional and can be omitted
        -   Pop the first element if `index` is not given
        -   Provide `index` to pop at a specific location
            -   `<<(3) a` pop the element at position `3` and shift everything up `[1;2;3;4;5] -> [1;2;3;5]`
        -   If the list is not a List type it will be enclose in a list to work
            -   `1 >> 2` will make `[2;1]`

## Maybe

-   `<<` reverse of `>>` to push back an pop front

## Todo

`[X]` are Completed feature (done and can be use) <br/>
`[V]` are Almost Completed feature (mostly for in between commit) <br/>
`[|]` are WIP feature (Working on it but not done yet) <br/>
`[I]` are Considering feature (not added but considering)
`[-]` are Maybe feature (added but remove and is now considering)
`[ ]` are Not Completed feature

Tag like `[|]`, `[I]`, `[-]` and `[V]` are only note for later use

```
[X] String Type
[X] List Type
[-] Stack Call
[X] If Expr
[X] For loop Expr
[X] While Loop Expr
[X] For of Loop Expr (track item)
[X] For in Loop Expr (track loop count)
[X] More method for Number Type
[X] More method for List Type
[X] More native helper like type checking
[X] Boolean operator
[ ] Code formatting
[ ] Syntax highlight when in repl
[X] Repl improvement (Don't crash when error)
[X] More type for object key (most primary litetral)
[X] Pre Unary Expr
[X] Post Unary Expr
[I] Expression literal
[X] Unsign Expr (Unsign a variable and return it value)
[X] Break Expr (idk how to make this make sense)
[X] Math Build-in
[X] Index for list
[X] Index assigment
[X] Somekind of Object replacement
[X] Float input
[X] Range Expr
[ ] List Pop Notation
[ ] List Push Notation
[ ] Remove Commander dependency and make a custom solution
[ ] Comment code cus what were you cooking
[ ] Organise AST code
[ ] Doc for AST
[ ] Organise Value code
[ ] Doc for Value
[ ] Language tour for the language
[ ] Doc for the language in wiki
[ ] Reference Operator
```
