import "expect" as expect;
import "console" as console;
import "vector" as vec;

let a = vec.new();
vec.push(a, 1);
vec.push(a, 2);
vec.push(a, 3);
expect.equal(vec.pop(a), 3, @);
vec.push(a, 4);
expect.equal(vec.pop(a), 4, @);
expect.equal(vec.pop(a), 2, @);
expect.equal(vec.pop(a), 1, @);
expect.equal(vec.pop(a), "", @);

expect.pass(@f);