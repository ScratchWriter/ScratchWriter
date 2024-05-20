# Syntax
ScratchWriter shares much of its syntax with JavaScript. But it has some note-worthy limitations:
 - No Objects.
 - Functions & Lists are less dynamic.
 - Semicolons are required.

### Sections:
- [Variables & Lists](#variables--lists)
- [Control](#control-statements)
- [Functions](#functions)
- [Modules](#modules--assets)

## Variables & Lists
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