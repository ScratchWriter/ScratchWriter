 # Troubleshooting & Quirks
> ScratchWriter currently has lots of frankly useless error messages. When you encounter an error message you don't understand it's often helpful to think about if what you're trying to do would be valid in scratch.

### Example
Let's try creating a list and then assigning it to a new variable.
```js
const my_list = [];
let my_variable = my_list;
```
Doing this in ScratchWriter produces the error:
```
my_list is not an expression
2 | let my_variable = my_list;
```
This happens because in Scratch, lists and variables aren't interchangeable. It has no block to perform that operation.

## Play by the Rules
> `___ is not an expression`

This is a fairly common error message. It simply means that your code is requesting a value that the compiler has no way of representing in scratch blocks.

You'll mostly run into this issue when you attempt to assign things like `functions`, `lists`, or `modules` to a variable. While you can pass many of these things as parameters to functions using compiler tricks, a Scratch variable still cannot hold a non-primitive value.

## Safe Recursion
> `my_function() does not return a value`

For performance and simplicity ScratchWriter handles the scope of variable names as expected; however, it still uses boring old scratch global variables to store their values. This has a few implications:
- Recursive functions cannot safely use local variables.
- Recursive functions cannot return a value.

If you want to safely make a recursive function in ScratchWriter, you have a few options. The one unique to Scratch/ScratchWriter is parameter recursion. While local variables and return values aren’t safe, function parameters are.

That means if your function doesn’t require local variables it should work fine. Almost any function can be rewritten as many functions in this way, replacing variables with a call to a new function, creating a new parameter.