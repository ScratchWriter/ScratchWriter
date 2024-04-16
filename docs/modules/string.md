# String
```js
import "string" as string;

const parts = [];
let str = "hello world";
string.split(str, " ", parts); // parts: ["hello", "world"]

let result1 = string.pad_end("short", 10, " "); // "short     "
let result1 = string.pad_start("short", 10, "_"); // "_____short"
let result1 = string.pad_center("|", 5, "="); // "==|=="
```