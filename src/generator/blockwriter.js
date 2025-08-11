const _ = require('lodash');

const {
    VariableManager,
} = require('./variablemanager');

const {
    AssetManager,
} = require('./assetmanager');

const {
    DATA_TYPE_OPCODES
} = require('../hints');

function inp_shadow(x, shadow) {
    if (shadow) {
        return [3, x, shadow];
    } else {
        return [2, x];
    }
}

function inp(x, shadow = [10, ""]) {
    if (Array.isArray(x)) {
        if (x[0] === 12 || x[0] === 13) {
            return inp_shadow(x, shadow);
        } else {
            return [1, x];
        }
    } else {
        return inp_shadow(x, shadow);
    }
}

class BlockWriter {
    constructor(blocks = {}) {
        this.blocks = blocks;
        this.n = 1;
        this.current_x = 64;
        this.current_y = 64;
        this.stride_x = 1600;
        this.stride_y = 0;
        this.prefix = '@';
        this.variablemanager = new VariableManager();
        this.assetmanager = new AssetManager();
    }

    next_id() {
        return `${this.prefix}${this.n++}`;
    }

    // get a block by id
    block(id) {
        if (typeof id !== 'string' && id !== undefined && id !== null) console.log('invalid block-id', id);
        if (id in this.blocks) return this.blocks[id];
        throw new Error(`Block ${id} does not exist.`);
    }

    opcode(id) {
        if (Array.isArray(id)) {
            return DATA_TYPE_OPCODES[id[0]];
        } else {
            return this.block(id).opcode;
        }
    }

    // create a basic block
    // see "start" for creating a chain of blocks
    create(id, options) {
        const block = {
            opcode: options.opcode || "none",
            next: options.next || null,
            parent: options.parent || null,
            inputs: (options.inputs || {}),
            fields: options.fields || {},
            shadow: !!(options.shadow),
            topLevel: !!(options.topLevel),
        }
        if (options.topLevel) {
            block.x = this.current_x;
            block.y = this.current_y;
            this.current_x += this.stride_x;
            this.current_y += this.stride_y;
        }
        if (options.mutation) block.mutation = options.mutation;
        this.blocks[String(id)] = block;
        return id;
    }

    replace_input(id, data) {
        if (Array.isArray(data)) {
            const block = this.block(id);
            if (block.parent) {
                const parent = this.block(block.parent);
                block.parent = null;
                for (const input of Object.entries(parent.inputs)) {
                    const [key, arr] = input;
                    if (arr[1] === id) {
                        parent.inputs[key] = inp(data);
                    }
                }
            }
            this.delete_block(id);
        } else if (typeof data === 'string') {
            this.blocks[id] = this.block(data);
            this.delete_block(data);
        }
    }

    unlinked(options = {}) {
        const id = this.next_id();
        this.create(id, options);
        return id;
    }

    // connect two blocks by id
    connect(first_block, second_block) {
        const first = this.block(first_block);
        const second = this.block(second_block);

        first.next = String(second_block);
        second.parent = String(first_block);
    }

    clone_block(block_id) {
        const id = this.next_id();
        const src = this.block(block_id);
        const block = this.blocks[id] = _.cloneDeep(src);
        if (block.topLevel) {
            block.y += 128;
        }
        if (block.next) {
            block.next = null;
        }
        return id;
    }

    clone(start_block_id) {
        const block = this.block(start_block_id);
        const next = block.next;
        const clone_id = this.clone_block(start_block_id);
        const clone = this.block(clone_id);
        if (next) {
            const next_clone_id = this.clone(next);
            this.connect(clone_id, next_clone_id);
        }
        for (const [key, [shadow, val_id]] of Object.entries(clone.inputs)) {
            if (Array.isArray(val_id)) continue; // skip inlined values since they are already cloned
            const val_clone_id = this.clone(val_id);
            clone.inputs[key] = [shadow, val_clone_id];
        }
        return clone_id;
    }

    delete_block(block_id) {
        delete this.blocks[block_id];
    }

    delete(start_block_id) {
        const block = this.block(start_block_id);
        const next = block.next;
        if (next) {
            this.delete(next);
        }
        for (const [key, [shadow, val_id]] of Object.entries(block.inputs)) {
            if (Array.isArray(val_id)) continue; // skip inlined values since they are already cloned
            const val_clone = this.delete(val_id);
        }
        this.delete_block(start_block_id);
        return;
    }

    walk_main_blocks(start_block_id, cb) {
        if (!(start_block_id in this.blocks)) return;
        const block = this.blocks[start_block_id];
        cb(start_block_id);
        this.walk_main_blocks(block.next, cb);
    }

    walk_input_blocks(start_block_id, block_cb, input_cb) {
        block_cb(start_block_id);
        const block = this.block(start_block_id);
        for (const container of Object.entries(block.inputs)) {
            let [input_name, arr] = container; 
            let [shadow, input_block_id] = arr;
            if (Array.isArray(input_block_id)) {
                input_cb(input_name, input_block_id, container);
            } else {
                this.walk_input_blocks(input_block_id, block_cb, input_cb);
            }
        }
    }

    walk_blocks(start_block_id, block_cb, input_cb, field_cb) {
        this.walk_main_blocks(start_block_id, (block_id)=>{
            const block = this.block(block_id);
            for (const container of Object.entries(block.inputs)) {
                let [input_name, arr] = container; 
                let [shadow, input_block_id] = arr;
                if (Array.isArray(input_block_id)) {
                    input_cb(input_name, input_block_id, container);
                } else {
                    this.walk_blocks(input_block_id, block_cb, input_cb, field_cb);
                }
            }
            for (const container of Object.entries(block.fields)) {
                let [field_name, field_value] = container; 
                field_cb(field_name, field_value, block.fields);
            }
            block_cb(block_id);
        });
    }

    relink() {
        for (const block_id of Object.keys(this.blocks)) {
            const block = this.block(block_id);
            for (const [input_name, arr] of Object.entries(block.inputs)) {
                let [shadow, input_block_id] = arr;
                if (!input_block_id) {
                    delete block.inputs[input_name];
                } else if (!Array.isArray(input_block_id)) {
                    const input_block = this.block(input_block_id);
                    input_block.parent = block_id;
                }
            }
            if (block.next) {
                const next = this.block(block.next);
                next.parent = block_id;
            }
        }
    }

    inp(x, shadow) {
        return inp(x, shadow);
    }
}

class BlockWriterCtx {
    constructor(owner) {
        this.owner = owner;
        this.count = 0;
        this.head = owner.next_id();
        this.tail = null;
        this.active = true;
    }

    // create the next block
    next(options = {}) {
        if (!this.active) throw new Error(`Cannot write after Cap Block`);
        const id = (this.count++ === 0)? this.head : this.owner.next_id();
        this.owner.create(id, options);
        if (this.tail !== null) {
            this.owner.connect(this.tail, id);
        }
        this.tail = id;

        return id;
    }

    connect_next(block) {
        if (!this.active) throw new Error(`Cannot write after Cap Block`);
        if (this.tail !== null) {
            this.owner.connect(this.tail, block);
        }
        this.tail = block;

        return block;
    }

    reporter(options = {}) {
        return this.owner.unlinked(options);
    }

    cap(options = {}) {
        this.next(options);
        this.active = false;
    }
}

module.exports = {BlockWriter, BlockWriterCtx, inp};