# Case Detection
Scratch is not case-sensitive so some trickery is required if you want case-sensative text.

### Basic Usage
```js
import "case" as case;

// case-detection
let is_all_caps1 = case.is_caps("Hello World"); // false
let is_all_caps2 = case.is_caps("HELLO WORLD"); // true

// case-change
let caps = case.to_caps("hello world"); // "HELLO WORLD"
let lower = case.to_lower("HELLO WORLD"); // "hello world"
```

### Advanced Usage
```js
import "case" as case;
import "console" as console;

// the trickery used for case-dectection requires switching costumes
// is_caps_fast doesn't keep track of this, so you may want to keep track of the current costume manually
let old_costume = get_active_costume();
let my_str = "HeLLo WoRlD";
let i = 0;
repeat(len(my_str)) {
    // is_caps_fast only works on one character at a time
    let char = letterof(i, my_str);
    if (case.is_caps_fast(char)) {
        console.log(char # " is caps");
    } else {
        console.log(char # " is not caps");
    }
    i += 1;
}
set_costume(old_costume);
```