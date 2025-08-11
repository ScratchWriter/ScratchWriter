class VariableManager {
    constructor() {
        this.variables = {};
        this.lists = {};
        this.constants = {};
        this.broadcasts = {};
        this.symbols = {};
    }

    symbol(name) {
        if (name in this.symbols) return this.symbols[name];
        throw new Error(`Symbol ${name} does not exist.`);
    }

    variable(name) {
        if (name in this.variables) return this.symbols[name];
        if (name in this.symbols) throw new Error(`Symbol ${name} already used.`);
        this.variables[name] = [name, ""];
        const block = [12, name, name];
        this.symbols[name] = block;
        return block;
    }

    list(name) {
        if (name in this.lists) return this.symbols[name];
        if (name in this.symbols) throw new Error(`Symbol ${name} already used.`);
        this.lists[name] = [name, []];
        const block = [13, name, name];
        this.symbols[name] = block;
        return block;
    }

    constant(name, block) {
        if (name in this.constants) return this.symbols[name];
        if (name in this.symbols) throw new Error(`Symbol ${name} already used.`);
        this.constants[name] = blocks;
        this.symbols[name] = block;
        return block;
    }

    broadcast(message) {
        if (message in this.broadcasts) return this.symbols[message];
        if (message in this.symbols) throw new Error(`Symbol ${message} already used.`);
        this.broadcasts[message] = message;
        const block = [11, message, message];
        this.symbols[message] = block;
        return block;
    }

    to_field(arr) {
        return [arr[1], arr[2]];
    }

    inject(target) {
        Object.assign(target.variables, this.variables);
        Object.assign(target.lists, this.lists);
        Object.assign(target.broadcasts, this.broadcasts);
    }
}

module.exports = { VariableManager }