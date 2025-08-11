import "error" as error;
import "runtime" as runtime;

const DEFAULT_START_SIZE = 8;

enum vec {
    data,
    len,
    cap,
}

function new_sized(start_size) {
    let ptr = runtime.malloc(3);
    let data = runtime.malloc(start_size);
    runtime.memory[ptr + vec.data] = data;
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
    let old_data = runtime.memory[ptr + vec.data];
    let new_data = runtime.malloc(new_cap);
    runtime.memcpy(new_data, old_data, old_cap);
    runtime.free(runtime.memory[ptr + vec.data]);
    runtime.memory[ptr + vec.data] = new_data;
    runtime.memory[ptr + vec.cap] = new_cap;
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
    let old_len = runtime.memory[ptr + vec.len];
    let cap = runtime.memory[ptr + vec.cap];
    if (old_len == cap || old_len > cap) {
        grow(ptr);
        cap = runtime.memory[ptr + vec.cap];
    }
    let new_data = runtime.memory[ptr + vec.data];
    runtime.memory[new_data + old_len] = item;
    runtime.memory[ptr + vec.len] = old_len + 1;
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
    if (n >= runtime.memory[ptr + vec.len]) {
        error.crash("Index out of bounds", @);
    }
    return runtime.memory[runtime.memory[ptr + vec.data] + n];
}

function delete(ptr, n) {
    let ptr_len = runtime.memory[ptr + vec.len];
    if (n >= ptr_len) {
        error.crash("Index out of bounds", @);
    }
    let i = runtime.memory[ptr + vec.data] + n;
    repeat(ptr_len - n - 1) {
        runtime.memory[i] = runtime.memory[i + 1];
        i += 1;
    }
    runtime.memory[ptr + vec.len] = ptr_len - 1;
}

function indexof(ptr, item) {
    let data = runtime.memory[ptr + vec.data];
    let ptr_len = runtime.memory[ptr + vec.len];
    let i = 0;
    repeat(ptr_len) {
        if (runtime.memory[data + i] == item) {
            return i;
        }
        i += 1;
    }
    return -1;
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
    repeat(runtime.memory[ptr + vec.len]) {
        callback(runtime.memory[i]);
        i += 1;
    }
}

function join(ptr, delim) {
    let ptrlen = length(ptr);
    if (ptrlen == 0) {
        return "";
    }
    let buff = item(ptr, 0);
    if (ptrlen == 1) {
        return buff;
    }
    let n = 1;
    repeat(length(ptr)-1) {
        buff = buff # delim # item(ptr, n);
        n += 1;
    }
    buff = buff # item(ptr, n);
    return buff;
}