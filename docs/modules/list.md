# List

```js
import "list" as list;

const src = [0,1,2];
const dst = [];
list.copy(src, dst);
let str = list.join(src, ","); // 0,1,2
let str2 = list.to_string(src); // [0, 1, 2]

const my_list = [1,2,3,4];
let last_item = list.pop(my_list); // 4
let first_item = list.shift(my_list); // 1

import "console" as console;
list.for_each(my_list, console.log);

// grow my_list from 2 to 6 items long by adding four 0's to the end
list.grow(my_list, 6, 0);

// quicksort in place
list.sort(my_list);

function my_compare_fn(a,b) {
    return a-b;
}
list.sort_by(my_list, my_compare_fn);
```