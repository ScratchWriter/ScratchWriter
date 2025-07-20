import "expect" as expect;
import "console" as console;
import "vector" as vec;
import "runtime" as runtime;

let a = vec.new();
vec.push(a, 1);
vec.push(a, 2);
vec.push(a, 3);
expect.equal(vec.pop(a), 3, @);
vec.push(a, 4);
expect.equal(vec.pop(a), 4, @);
expect.equal(vec.pop(a), 2, @);
expect.equal(vec.pop(a), 1, @);
expect.equal(vec.pop(a), null, @);

let vec1 = vec.new();
let vec2 = vec.new();

let i = 0;
repeat(100) {
    vec.push(vec1, i);
    vec.push(vec2, i);
    i = i + 1;
}

i = 0;
let should_be = 0;
repeat(100) {
    expect.equal(should_be, vec.item(vec1, i), @);
    expect.equal(should_be, vec.item(vec2, i), @);
    should_be = should_be + 1;
    i = i + 1;
}

expect.pass(@f);