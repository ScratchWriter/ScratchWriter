import "block.test";

import "expect" as expect;
import "./" as runtime;
runtime.configure(100000);

let a = runtime.malloc(10);
let b = runtime.malloc(20);
let c = runtime.malloc(10);
let d = runtime.malloc(3);
let e = runtime.malloc(5);
runtime.free(c);
runtime.free(b);
let f = runtime.malloc(25);
expect.equal(a+10, f, @);
let g = runtime.malloc(5);
expect.equal(f+25, g, @);

expect.pass(@f);