# Vector
Vector is a container for dynamic size arrays

### Basic Usage
```js
import "vector" as vector;
import "runtime" as runtime;

let shopping_list = vector.new();
vector.push(shopping_list, "flour");
vector.push(shopping_list, "yeast");
vector.push(shopping_list, "tomato");
vector.push(shopping_list, "cheese");

let i = shopping_list.start();
repeat(vector.length(shopping_list)) {
    say(runtime.memory[i]);
    i += 1;
}

function callback(item) {
    say(item);
}

vector.for_each(shopping_list, callback);

vector.free(shopping_list);
```