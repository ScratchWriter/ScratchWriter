# Syntax 
> ScratchWriter shares much of its syntax with JavaScript.

### Sections:
- [ScratchWriter vs JavaScript](#ScratchWriter--JavaScript)
- [Variables & Lists](#variables--lists)
- [Control](#control-statements)
- [Functions](#functions)
- [Modules](#modules--assets)

### [Troubleshooting Guide](./troubleshooting.md)
> Has more details on quirks and differences between ScratchWriter and JavaScript.

## ScratchWriter != JavaScript
Some of the many note-worthy differences between ScratchWriter and JavaScript:
 - Semicolons are required.
 - No Objects or Classes.
 - Functions are less dynamic.
 - [Lists](./lists.md) are less dynamic and their methods are not compatible with JavaScript Arrays.
 - No arrow functions.
 - No `<=` and `>=` operators.
 - `variable + variable` is addition, use `variable # variable` to join.
 - No `/* multiline comments */`.
 - Builtins like `Array` and `Math` have counterparts but are not compatible.
 - Extra control statements for `repeat` `until` and `forever` exist.

## Variables & [Lists](./lists.md)
Create & assign variables.
```js
let bar = "bar";
bar = FOO;
```

Create compile-time constants with the const keyword.
```js
const FOO = "foo"; // valid
// const FOO = variable; // invalid
```

Create lists (const only)
```js
const foo = [1,2,3]; // valid
// let foo = [1,2,3]; // invalid
foo.push(4);
console.log(foo.length());
```

Access array elements
```js
let first_item = foo[0];
foo[1] = foo[1] + 1;
```

Use pseudo-methods on arrays
```js
foo.push(4);
```

## Control Statements
Normal if statements are just like Javascript
```js
if (a > b) {
    // do something
}

// NOT ALLOWED:
// if (condition) do.something();
```

So are if-else statements.
```js
if (a == b) {
    // do something
} else {
    // do something else
}
```

Special repeat statement (like the repeat block in scratch).
```js
repeat(10) {
    // do something 10 times
}
```

Until Loops are like while loops (but backwards).
```js
let n = 0;
until (n > 3) {
    n += 1;
}
```

While Loop's are not a feature in scratch, so it's usually better to use an until loop.
```js
let n = 0;
while (n <= 3) {
    n += 1;
}
```

## Functions
Functions are pretty standard as well...
```js
function plus_one(number) {
    return number + 1;
}
```
You can even pass lists around.
```js
function print_list(list) {
    let n = 0;
    repeat(list.length()) {
        console.log(list[n]);
    }
}

print_list([1,2,3]);
```
Callbacks work too
```js
function call(fn, arg) {
    fn(arg);
}

function callback(arg) {
    console.log("hello " # arg);
}

call(callback, "world");
```

## Modules & Assets
```js
import "./my_module.sw" as my_module;
```
```js
import "library" as library;
```
```js
import "./costume.png" as costume;
set_costume(costume);
```
```js
import "./sound.wav" as sound;
play_sound(sound);
```