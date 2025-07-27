# Lists
Lists must be created with a `const` statment.
```js
const my_list = [1,2,3,4,5,6];
```
> Note that this creates a new block for each element in the list. For very large lists it is often better to use `string.split` to load the data from a large string as there is a fixed limit on the number of total blocks in a project and  thousands of `add to list` blocks will slow down project loading.

## List Cheat Sheet
```js
// This will reset and reload the data as would be expected in a normal language.
const my_list = [1,2,3, "string"];

// Get an item from the list
my_list[index];

// Replace a value to the list
// Just like scratch, new items will not be created.
my_list[index] = value;

// Method-like Shortcuts
my_list.reset();
my_list.delete(index);
my_list.push(value);
my_list.insert(index, value);
my_list.indexof(value);
my_list.has(value);
my_list.length();
my_list.show();
my_list.hide();

// The same as list[index]
my_list.item(index);
// The same as list[index] = value
my_list.replace(index, value);
```