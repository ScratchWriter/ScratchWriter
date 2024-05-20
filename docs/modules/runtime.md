# Runtime
Dynamic & Unsafe Memory

```js
import "runtime" as runtime;

runtime.configure(10000); // start with 10k of memory

let size = randint(10, 100);

// get a pointer `ptr` to a block of `size` words in memory
let ptr = runtime.malloc(size);
// fill the block of memory with NULL
runtime.memset(ptr1, NULL, size);
// fill it with random data
let i = 0;
repeat(size) {
    runtime.memory[ptr + i] = randint(0,1);
    i += 1;
}

// create ptr_clone_1 and ptr_clone_2 by copying the data from ptr
let ptr_clone_1 = runtime.malloc(size);
runtime.memcpy(ptr_clone_1, ptr, size);
let ptr_clone_2 = runtime.clone(ptr);

// free the memory used by `ptr`
runtime.free(ptr);
// the memory assigned to ptr is now free and will be reused by malloc
```

### Debug
```js
runtime.print_mem_map();
```