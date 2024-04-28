# String
```js
import "string" as string;

const parts = [];
let str = "hello world";
string.split(str, " ", parts); // parts: ["hello", "world"]

string.pad_end("short", 10, " ");       // "short     "
string.pad_start("short", 10, "_");     // "_____short"
string.pad_center("|", 5, "=");         // "==|=="
string.substring("abcdefg", 2, 2);      // "c"
string.substring("abcdefg", 3, -1);     // "defg"
string.insert("aaaa", 2, "b");          // "aabaa"
string.replace_char("aaaa", 2, "b");    // "aaba"
```