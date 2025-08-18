# Vector
Vector is a container for dynamic size arrays

### Basic Usage
```js
import "vector" as vector;
import "runtime" as runtime;

runtime.configure(65536);

let shopping_list = vector.new();
vector.push(shopping_list, "flour");
vector.push(shopping_list, "yeast");
vector.push(shopping_list, "tomato");
vector.push(shopping_list, "cheese");

let i = vector.start(shopping_list);
repeat(vector.length(shopping_list)) {
    say(runtime.memory[i]);
    i += 1;
}

function callback(item) {
    say(item);
}
vector.for_each(shopping_list, callback);

vector.free(shopping_list);

let value = vector.item(ptr, n);
let value = vector.set(ptr, n, value);
let value = vector.pop(ptr);
let index = vector.indexof(ptr, item); if (index >= 0) {};
let start_ptr = vector.start(ptr);
let end_ptr = vector.end(ptr);
let length = vector.length(ptr);
let string = vector.join(ptr, delim);
vector.delete(ptr, n);
vector.reset(ptr);
```
