# Xper

Xper is a expression based esoteric programming language. Below are a language tour of all the feature in Xper. If you just want to get started look at [the example](/EXAMPLE.md).

## Expression

A expression is a programming construct that when evaluated to a value that can be use in other expression. Every construct in Xper is a expression and thus always return a value. Expression evaluate from left to right from highest precedence to lowest precedence. You can change the order of evaluation using `{}`. The program return is the last top level expression evaluated. Top level expression are expression that is not part of other expression.

```
> 8 * 2 + 3
Program Return: 19
==================================================
> 8 * {2 + 3}
Program Return: 40
```

## Semicolon and Line Break

You can end your line using semi colon to convert it from a expression to a statement.

```
~ "This how you write comment"

1 + 1; ~ "This is a statement and don't return anything"
```

But semicolon are consider anti-pattern and should not be use. Line break are optional, unlike semicolon this is encourage.

```
1 + 1 10 + 3 10 + 10
```

In fact, line break are **ignore** during parsing

```
1
+
5
11 +
11
```

## Variables

Variables can be declare and change easily using the assignment expression.

```
a = 10
```

There are 2 type of assignment mutable and constant. Constant variable cannot be re-assign or change, constant are declare using `:=` instead of `=`.

```
a := 10;

a = 11 ~ "Error"
```

Assignment Expression return the value they were assign to.

```
> a = 12
Program Return: 12
```

Because of this you can chain multiple assignment expression

```
a = b = c = d = 11
print(a; b; c; d) ~ "11 11 11 11"
```

Every value in Xper is always pass by value instead of by reference like some other language. But you can force a value to be pass by reference using `&=`.

```
a = 10;

b &= a

a++

print(a; b) ~ "11 11"
```

You can only have up to 10 variables due to memory concern.

```
...
f = 6;
g = 7;
h = 8;
i = 9;
j = 10;
k = 11 ~ "Error"
```

Because of this limitation Xper offer a few variable manipulation operator that help with manage a limited amount of variables some of which will be discuss later.

This is the `unsign` operator it delete a variable from scope

```
a = 10
print(a) ~ 10

*a
print(a) ~ "Error"
```

## Block

Block is a important construct in Xper you can use block to group expression together and change the order of evaluation. You can create block using `{}`

```
> {3 + 8} * 7
Program Return: 77
```

Unlike other programming language block does not make new scope so be careful what you do in each block.

```
a = 10
{
    a = 8
}
print(a) ~ 8
```

Block like the program return the last top level expression that was evaluated. In fact the program is **always** enclose in a implicit top level block

Some other construct require a block as part of their syntax in these case single expression block can be implicitly infer and thus do not need `{}` wrap around them.

## Indentation

Indentation is a topic of that the programming community does not agree on, "tab or space?", "1 space, 2 spaces, 3 spaces or 4 spaces". In Xper indentation does not matter, tab or space also does not matter as they are remove from the source before parsing. But the recommended indentation is 4 spaces.

## Boolean

Booleans can be `true` and `false`, they function just like other programming language boolean.

## Number

Number is well a number that you can use to do math with.

```
> 69 + 420
Program Return: 489
```

Xper also support float, float decimal separator is a comma (`,`) like most part of the world

```
> 0,4 - 0,3
Program Return: 0,10000000000000003
```

## Math

Xper work like how you would expect

```
1 + 1 ~ 2
```

You can also use number name if you prefer that

```
one + two ~ 3
```

Number name are also global variable so you can assign it to whatever you desire

```
one = 3

one + two ~ 5
```

Xper also have some constant like `pi`, `e`. These are very important constant that if use for some operation internaly but you can assign it to something else if desire

```
math("sin"; 90) ~ 1

pi = 3

math("sin"; 90) ~ 0,9974949866040544
```

## List

List are group of values together for easy retrieval. Because the `,` is use for float Xper uses `;` for other separator

```
> [1; 2; 3; 4; 5;]
Program Return: [1; 2; 3; 4; 5]
```

List can contain other expression between the separator

```
> [a = 10; 1; 10 + 4]
Program Return: [10; 1; 14]
```

You can index list like any other normal programming language using `[]` and a number

```
[1;2;3;4;5][2]
```

You can also use any expression within the `[]`

```
[1;2;3;4;5][1+3]
```

## Character

Character is a single character. Character can be created using `@` follow by the character.

```
@a @b @c @
```

Special character can be escape using `\`.

```
@\n @\t
```

> [!NOTE]
> Xper only have special escape for `\` follow by a single character and nothing else

Xper does not have support for string type so string are just a list of character.

```
[@h; @e; @l; @l; @o; @ ; @w; @o; @r; @l; @d]
```

Because this is cumbersome to type Xper provide special syntax to do this using double quote like other language.

```
> "hello world"
Program Return: [@h; @e; @l; @l; @o; @ ; @w; @o; @r; @l; @d]
```

## Null

`null` indicated a missing value or the return of a statement. You can make any expression return `null` using a `;` that follow the expression. Null are anti-pattern and thus does not interact with any other part of the language.

```
1 + 1;               ~ null
a = 11;              ~ null
"Don't return null"; ~ null
```

You can also end your expression with `null` to make it return null

```
1 + 1 null               ~ null
a = 11 null              ~ null
"Don't return null" null ~ null
```

In fact, `null` is keyword that turn into a expression and return `null`. `;` is just a short hand for writing `null` and act the same.

## Control flow

Xper support the ternary if with a few modification to do control flow.

```
true == false ? print("This isn't right") : print("Yayy it correct") ~ "This isn't right"
```

If condition take start with a expression to be evaluate as the condition follow by the `true` block then the `false` block. The `else` part of the ternary can also be omitted and when the condition return `false` the ternary will return `false` by default.

```
true ? 1   ~ 1
false ? -1 ~ false
```

## Loop

Xper support 3 type of loop `while` loop, traditional `for` loop and `for of` loop. They are constructed in how you would expect them to

```
a = 10
while (true) {
    a <= 0 ? break : {
        print(a)
        a--
    }
}
```

```
a = [1;2;3;4;5]
for (num of a) print(num)
```

```
for (i = 0; i < 10; i++) print(i)
```

Every field of the traditional for loop can be omitted.

```
a = 10
for (,,) { ~"equivalent to while (true)"
    a <= 0 ? break : {
        print(a)
        a--
    }
}
```

Loop require a block that is evaluate every iteration. Loop will break if the result of the loop block is `null`.

Loop being a expression return how many cycle the loop has gone through.

### The halting problem

Xper use a highly specialize artificial intelligent network to help you avoid infinite loop. The Xper AI (XAI for short) can tell if a loop will stop or halt or continue running forever and halt the loop before it run forever. In other word XAI solve the famous halting problem

> {!NOTE}
> The XAI is actually just a 5000 iteration check

### Loop control

Xper offer 2 types of loop control `break` and `continue` The function a bit differently in Xper. `break` and `continue` work in all block not only loop block. `break` when evaluate as a top level expression will return a `control` value. Control are a special value type that `break` and `continue` return. When a top level expression return a `control` value that block will short circuit and end immediately and the block result will depend on the control type.

There are 2 types of control one for each loop control type, `break` control will return `null` as a top evaluation and `continue` control will return `true`.

```
break 1 + 1                         ~ null
continue print("hello")             ~ true
print("Hello") break print("World") ~ "print 'Hello' and return null"
```

It is important to note that break will escape the **current** block and not the **loop** block.

### Control Carry

To escape from outer block you would use a special Xper syntax called `control carry`. Control carry will carry out the control value without evaluating it letting you carry it out of the current block affecting other outer block. Control carry can be added by append `#` to a control keyword the amount of `#` will determine how many block it will be carry out

```
a = 10
for (,,) {
    a <= 0 ? break# : a--
    print(a)
}
```

> [!NOTE]
> Still confuse? checkout the example

## Function

To create a function you can simply use the JavaScript anonymous function syntax

```
(a) => a + 1
```

Function same with loop and conditional take a block to be evaluate when called. Function can define a list of argument that they can take. Function are special they **create** a new scope when they are run this is to allow recursion among other thing to be possible. Before a function is run all the argument variable are assign to be use within the function scope. All function argument are require with no exception

To create a named function simply assign the function to a variable.

> [!NOTE]
> Function variable follow every rule with normal variable

```
fib = (n) => n < 2 ? n : fib(n - 1) + fib(n - 2)
```

## Lifetime

A variable can be given a lifetime when declaring or assigning. A lifetime is declare with a pair of `{}` with a **single literal whole number** inside. A varible life time is how many time that variable can be use after the lifetime run out the value will then be deleted

```
a<3> = 10      ~ "This variable will have 3 uses"
print(a; a; a) ~ "10 10 10"
print(a)       ~ "Error"
```

When assigning a already existing variable a lifetime it will have that new value for that lifetime before reseting to the previous value

```
a = 3    ~ "Infinite use of a = 3"
a{2} = 2 ~ "a = 2 for 2 uses before going back to 3"
a{1} = 1 ~ "a = 1 for 1 uses before going back to 2"

print(a; a; a; a; a; a) ~ "1 2 2 3 3 3"
```

When no lifetime is given the variable exist until the program end.

You can access the lifetime of a variable by using the `&` operator. This does not reduce the lifetime counter

```
a{3} = 10;

print(&a) ~ 10
```

## Shifting

Because of the variables limit Xper provide shifting as a quick way to move, save and swap value. When a variable value is shift into another that variable will be unsign.

```
a = 10;
a -> b   ~ "Shift a into b"

print(a) ~ "Error"
```

The return of a shift is the previous value of the right hand variable or the variable being shifted into.

```
a = 10;
b = 1;

print(a -> b) ~ 1
```

Because of this you can swap 2 variables like this

```
a = 1;
b = 2;

a -> b -> a

print(a; b) ~ "2 1"
```

In fact you can chain them to cycle several variable value

```
a = 1;
b = 2;
c = 3;
d = 4;
e = 5;

a -> b -> c -> d -> e -> a

print(a; b; c; d; e) ~ "5 1 2 3 4"
```

## Range

Xper have rust like syntax to generate a range. Range must include a ending but everything else if optional. The default starting value is `0` and step is `1`

```
..10 ~ [0; 2; 3; 4; 5; 6; 7; 8; 9]

..10..2 ~ [0; 2; 4; 6; 8]

-5..5 ~ [-5; -4; -3; -2; -1; 0; 1; 2; 3; 4]
```

If the ending is smaller than the start or the step is negative, the ending will become the start and vice versa, the final range will also be reverse

```
..-5    ~ [-1; -2; -3; -4; -5]
..5..-1 ~ [4; 3; 2; 1; 0]
```

Inclusive range can be made using `..=` instead of `..`

```
..=5 ~ [0; 1; 2; 3; 4; 5; 6]
```

## List operation

Binary operation are order sensitive and if an list is the first term they behave differently.

You can concat using `+`, repeat with `*`, chunk with `/` and `%`.

```
[1; 2] * 5 ~ [1; 2; 1; 2; 1; 2; 1; 2; 1; 5]
..20 / 5  ~ [[0; 1; 2; 3]; [4; 5; 6; 7]; [8; 9; 10; 11]; [12; 13; 14; 15]; [16; 17; 18; 19]]
[1; 2] + [3; 4] ~ [1; 2; 3; 4]
```

When the second term is another list they have some special chaining rule

Repeat will wrap the previous array in a list then continue repeating, you can use this behavior to quickly generate high dimensional array.

```
[0] * [5; 5] ~ [[0; 0; 0; 0; 0]; [0; 0; 0; 0; 0]; [0; 0; 0; 0; 0]; [0; 0; 0; 0; 0]; [0; 0; 0; 0; 0]]
```

Chunking on the other hand will repeatedly chunk a list into smaller and smaller chunk

```
..24 / [4; 2] ~ [[[0; 1]; [2; 3]; [4; 5]]; [[6; 7]; [8; 9]; [10; 11]]]
```

### Push and Pop

You can push into a list using `>>` and pop with `<<`. Unlike other language Xper uses pop front and push back.

```
4 >> [1; 2; 3] ~ [1; 2; 3; 4]
<<[1; 2; 3]    ~ 1
```

Pushing and popping mutate the list.

```
a = ..3

3 >> a ~ [0; 1; 2; 3]

log(a) ~ [0; 1; 2; 3]
```

You can provide a optional index to push and pop at specific indexes.

```
10 >>(2) ..5 ~ [0; 1; 10; 2; 3; 4]
<<(-1) ..5   ~ 4
```

## Built in namespace

Xper have support for math and random

```
math("abs)(-1) ~ 1
math("abs"; -1) ~ 1

random("randint", 1, 10)
```

## Running Xper code

Download the Xper cli and you can run any Xper code. Xper file end in `.xpr`
