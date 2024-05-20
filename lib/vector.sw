import "error" as error;
import "runtime" as runtime;

const DEFAULT_START_SIZE = 1;

enum vec {
    data,
    len,
    cap,
}

function new_sized(start_size) {
    let ptr = runtime.malloc(3);
    let arr = runtime.malloc(start_size);
    runtime.memory[ptr + vec.data] = arr;
    runtime.memory[ptr + vec.len] = 0;
    runtime.memory[ptr + vec.cap] = start_size;
    return ptr;
}

function new() {
    return new_sized(DEFAULT_START_SIZE);
}

function grow(ptr) {
    let old_cap = runtime.memory[ptr + vec.cap];
    let new_cap = old_cap * 2;
    let arr = runtime.malloc(new_cap);
    runtime.memcpy(runtime.memory[ptr + vec.data], arr, old_cap);
    runtime.free(runtime.memory[ptr + vec.data]);
    runtime.memory[ptr + vec.data] = arr;
}

function start(ptr) {
    return runtime.memory[ptr + vec.data];
}

function end(ptr) {
    return runtime.memory[ptr + vec.data] + runtime.memory[ptr + vec.len];
}

function length(ptr) {
    return runtime.memory[ptr + vec.len];
}

function push(ptr, item) {
    let i = runtime.memory[ptr + vec.len];
    runtime.memory[ptr + vec.len] = i + 1;
    if (runtime.memory[ptr + vec.len] == runtime.memory[ptr + vec.cap]) {
        grow(ptr);
    }
    runtime.memory[runtime.memory[ptr + vec.data] + i] = item;
}

function pop(ptr) {
    let i = runtime.memory[ptr + vec.len] - 1;
    if (i < 0) {
        return null;
    }
    let value = runtime.memory[runtime.memory[ptr + vec.data] + i];
    runtime.memory[ptr + vec.len] = i;
    return value;
}

function item(ptr, n) {
    if (n > runtime.memory[ptr + vec.cap]) {
        error.crash("Index out of bounds", @);
    }
    return runtime.memory[runtime.memory[ptr + vec.data] + n];
}

function free(ptr) {
    let data = runtime.memory[ptr + vec.data];
    runtime.free(ptr);
    runtime.free(data);
}

function reset(ptr) {
    runtime.memory[ptr + vec.len] = 0;
}

function for_each(ptr, callback) {
    let i = runtime.memory[ptr + vec.data];
    repeat(end(ptr)-i) {
        callback(runtime.memory[i]);
        i += 1;
    }
}