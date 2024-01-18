# Xper Example

Here are example using Xper to do a few simple programming problem

## Hello World

Classic `Hello World` world program not much to talk about it exactly like `python` or other language `Hello World`

```
print("Hello World")
```

## FizzBuzzBazz

`FizzBuzz` is old and cliché introducing `FizzBuzzBazz`, loop from `1` to `20` and print out `Fizz`, `Buzz` and `Bazz` if the number is divisible by `3`, `5` and `7`

Here a normal implemetation:

```
for (num of 1..=20) {
    str = ""
    num % 3 == 0 ? str += "Fizz"
    num % 5 == 0 ? str += "Buzz"
    num % 7 == 0 ? str += "Bazz"
    print( str == "" ? num : str)
}
```

But this is also valid

```
for (num of 1..=20) {
    str = "" + {num % 3 == 0 ? "Fizz" : ""} + {num % 5 == 0 ? "Buzz" : ""} + {num % 7 == 0 ? "Bazz" : ""}
    print(str == "" ? num : str)
}
```

## Fibonacci

Classic `Fibonacci` implemetation both iteratively and recursively.

### Iterative

```
fib := (n) => {
    out = [0; 1]
    for (i of ..n) out[-1] + out[-2] >> out
}
fib(5)
```

### Recursive

```
fib := (n) => n < 2 ? n : fib(n - 1) + fib(n - 2)
fib(10)
```

## Palindrome

```
isPalindrome := (num) => str(num) == -str(num)
print(
    isPalindrome(1234)
    isPalindrome(121)
    isPalindrome(121)
)
```
