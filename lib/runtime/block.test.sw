import "expect" as expect;

import "block" as block;

import "console" as console;
import "list" as list;

let a = block.new_block(0, 5);
block.free_block(a);
let b = block.new_block(5, 5);
block.free_block(b);
let c = block.new_block(10, 5);
block.checkout_block(c);

expect.equal(block.block_size[a], 10, @);

block.split_block(a, 2);
block.checkout_block(a);
expect.equal(block.block_size[a], 2, @);
expect.equal(block.block_size.has(8), true, @);

block.reset();
expect.pass(@f);