import "error" as error;
import "math" as math;

const block_ptr = [];
const block_end = [];
const block_size = [];
const block_free = [];
const free_blocks = [];

function reset() {
    block_ptr.reset();
    block_end.reset();
    block_size.reset();
    block_free.reset();
    free_blocks.reset();
}

function size_of(ptr) {
    return block_size[block_ptr.indexof(ptr)];
}

function new_block(ptr, size) {
    let id = block_ptr.indexof(null);
    if (id < 0) {
        id = block_ptr.length();
        block_ptr.push(ptr);
        block_end.push(ptr+size);
        block_size.push(size);
        block_free.push(false);
    } else {
        block_ptr[id] = ptr;
        block_end[id] = ptr+size;
        block_size[id] = size;
        block_free[id] = false;
    }
    return id;
}

function get_block(ptr) {
    let id = block_ptr.indexof(ptr);
    if (id < 0) {
        return null;
    }
    return id;
}

function merge_blocks(lower, upper) {
    if (lower == null && upper == null) {
        error.crash("failed to merge blocks: null with null", @);
    }
    if (lower == null) {
        return upper;
    }
    if (upper == null) {
        return lower;
    }
    if (block_ptr[lower] == null || block_ptr[upper] == null) {
        error.crash("failed to merge blocks: does not exist", @);
    }
    if (block_end[lower] != block_ptr[upper]) {
        error.crash(
            "failed to merge blocks: " #
            "[" # block_ptr[lower] # "-" # block_end[lower] # "]" # " with " #
            "[" # block_ptr[upper] # "-" # block_end[upper] # "]",
            @
        );
    }
    if (block_free[lower] == false || block_free[upper] == false) {
        error.crash("failed to merge blocks: not free", @);
    }
    let new_size = block_size[lower] + block_size[upper];
    block_size[lower] = new_size;
    block_end[lower] = block_ptr[lower] + new_size;
    delete_block(upper);
    return lower;
}

function delete_block(block) {
    free_blocks.delete(free_blocks.indexof(block));
    block_ptr[block] = null;
    block_end[block] = null;
    block_size[block] = null;
    block_free[block] = null;
}

function split_block(block, size) {
    if (block_ptr[block] == null) {
        error.crash("failed to split block: block does not exist", @);
    }
    let old_size = block_size[block];
    let new_size = old_size - size;
    if (new_size < 1) {
        error.crash("failed to split block: too small", @);
    }
    if (block_free[block] == false) {
        error.crash("failed to split block: not free", @);
    }
    free_block(new_block(block_ptr[block] + size, new_size));
    block_size[block] = size;
    block_end[block] = block_ptr[block] + size;
}

function free_block(_block) {
    let block = _block;
    if (block < 0 || block == null) {
        return;
    }
    if (block_ptr[block] == null) {
        error.crash("failed to free block: block does not exist", @);
    }
    block_free[block] = true;

    let after = block_ptr.indexof(block_end[block]);
    if (after > -1 && block_free[after] == true) {
        free_block(merge_blocks(block, after));
        return;
    }
    let before = block_end.indexof(block_ptr[block]);
    if (before > -1 && block_free[before] == true) {
        free_block(merge_blocks(before, block));
        return;
    }

    block_free[block] = true;
    if (!free_blocks.has(block)) {
        free_blocks.push(block);
    }
}

function checkout_block(block) {
    free_blocks.delete(free_blocks.indexof(block));
    block_free[block] = false;
}

function for_each_block(callback) {
    let block = block_ptr.indexof(0);
    until (block == -1) {
        callback(block_ptr[block], block_end[block], block_size[block], block_free[block]);
        block = block_ptr.indexof(block_end[block]);
    }
}