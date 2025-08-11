import "block" as block;
import "math" as math;
import "error" as error;
import "string" as string;
import "console" as console;

global memory = [];
global heap_ptr = 0;

function get_page(size) {
    let ptr = memory.length();
    repeat(size) {
        memory.push(null);
    }
    let page = block.new_block(ptr, size);
    block.free_block(page);
    return page;
}

function print_mem_map() {
    let w = len(memory.length());
    function print_block(ptr, end, size, free) {
        let _free = "";
        if (free) {
            _free = "*";
        }
        console.log(
            "| " # string.pad_start(ptr, w, "0") #
            " | " # string.pad_start(end, w, "0") #
            " | " # string.pad_start(size, w, "0") #
            " | " # string.pad_end(_free, 1, " ") #
            " |"
        );
    }
    console.log(
        "| " # string.pad_center("addr", w, "-") #
        " | " # string.pad_center("end", w, "-") #
        " | " # string.pad_center("size", w, "-") #
        " | " # string.pad_center("free", 4, " ") #
        " |"
    );
    block.for_each_block(print_block);
}

function malloc(size) {
    if (size < 1) {
        return null;
    }

    let split_target_size = math.INFINITY;
    let split_target = null;

    let i = 0;
    repeat(block.free_blocks.length()) {
        let comp = block.free_blocks[i];
        let comp_size = block.block_size[comp];
        if (comp_size == size) {
            block.checkout_block(comp);
            return block.block_ptr[comp];
        }
        if (comp_size > size && comp_size < split_target_size) {
            split_target_size = comp_size;
            split_target = comp;
        }
        i += 1;
    }

    if (split_target == null) {
        split_target = get_page(size);
    }

    block.split_block(split_target, size);
    block.checkout_block(split_target);
    return block.block_ptr[split_target];
}

function free(ptr) {
    block.free_block(block.block_ptr.indexof(ptr));
}

function sizeof(ptr) {
    return block.block_size[block.block_ptr.indexof(ptr)];
}

function memset(ptr, value, size) {
    let i = ptr;
    repeat(size) {
        memory[i] = value;
        i += 1;
    }
}

function memcpy(dest, src, count) {
    let i = 0;
    repeat(count) {
        memory[dest + i] = memory[src + i];
        i += 1;
    }
}

function clone(src) {
    let s = sizeof(src);
    let ptr = malloc(s);
    memcpy(ptr, src, s);
    return ptr;
}

global __heap_size = 0;

function configure(heap_size) {
    __heap_size = heap_size;
    reset();
}

function reset() {
    no_refresh {
        block.reset();
        memory.reset();
        heap_ptr = memory.length();
        get_page(__heap_size);
    }
}