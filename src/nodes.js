const { Result } = require('./result');
const { CompileError } = require('./errors');
const { v4: uuidv4 } = require('uuid');

// Container for the various types of Nodes in a program. some nodes
// may generate more than one kind of block.
// for example: a function call node will create a statement to call
// the funciton and an expression with the return value.
class ParseNode {
    constructor(options) {
        this.options = options;
        this.yy = options.yy;
        this.to_statements = options.to_statements;
        this.to_expression = options.to_expression;
        this.to_field = options.to_field;
        this.to_accessor = options.to_accessor;
        this.to_namespace = options.to_namespace;
        this.to_macro = options.to_macro;
        this.at = options.at || {anonymous: true};
        this._uuid = options.uuid || uuidv4();
    }

    identify() {
        {
            const r = this.unwrap_accessor();
            if (!r.is_err()) return r.unwrap_unsafe().identifier;
        }
        {
            const r = this.unwrap_namespace();
            if (!r.is_err()) return r.unwrap_unsafe().id;
        }
        return undefined;
    }

    uuid() {
        {
            const r = this.unwrap_accessor();
            if (!r.is_err()) return r.unwrap_unsafe().unwrap().uuid();
        }
        return this._uuid;
    }

    clone_with_location(at) {
        return new ParseNode(Object.assign({},this.options,{
            at,
            uuid: this._uuid,
        }));
    }

    unwrap_statements() {
        if (this.to_statements) {
            const r = this.to_statements();
            if (r instanceof Result) return r;
            return Result.ok(r);
        }
        return Result.err(this.error('cannot unwrap statements'));
    }

    unwrap_expression() {
        if (this.to_expression) {
            const r = this.to_expression();
            if (r instanceof Result) return r;
            return Result.ok(r);
        }
        const identifier = this.identify();
        if (identifier) {
            return Result.err(this.error(`${identifier} is not an expression`));
        }
        return Result.err(this.error('cannot unwrap expression'));
    }

    unwrap_accessor() {
        if (this.to_accessor) {
            const r = this.to_accessor();
            if (r instanceof Result) return r;
            return Result.ok(r);
        }
        return Result.err(this.error('cannot unwrap accessor'));
    }

    unwrap_namespace() {
        if (this.to_namespace) {
            const r = this.to_namespace();
            if (r instanceof Result) return r;
            return Result.ok(r);
        }
        return Result.err(this.error('cannot unwrap namespace'));
    }

    unwrap_field() {
        if (this.to_field) {
            const r = this.to_field();
            if (r instanceof Result) return r;
            return Result.ok(r);
        }
        if (this.at.text) {
            return Result.err(this.error(`${this.at.text} does not refer to a variable or list`));
        }
        return Result.err(this.error('cannot unwrap field'));
    }

    unwrap_macro() {
        if (this.to_macro) {
            const r = this.to_macro();
            if (r instanceof Result) return r;
            return Result.ok(r);
        }
        if (this.at.text) {
            return Result.err(this.error(`${this.at.text} is not callable`));
        }
        return Result.err(this.error('cannot unwrap macro'));
    }

    has_namespace() {
        return !this.unwrap_namespace().is_err();
    }

    has_expression() {
        return !this.unwrap_expression().is_err();
    }

    has_macro() {
        return !this.unwrap_macro().is_err();
    }

    // shortcuts
    statements_unsafe() {
        return this.unwrap_statements().unwrap_unsafe();
    }

    expressions_unsafe() {
        return this.unwrap_expression().unwrap_unsafe();
    }
    
    error(message) {
        return new CompileError(message, this.at);
    }
}

// maps symbols to their values
class Namespace {
    constructor(id, up) {
        this.symbols = new Map();
        this.private_symbols = new Map();
        this.up = up;
        this.id = id;
    }

    define(identifier, value, at, is_private = false) {
        if (this.symbols.has(identifier) || this.private_symbols.has(identifier)) throw new CompileError(`${identifier} already exists`, at);
        if (is_private) {
            this.private_symbols.set(identifier, value);
        } else {
            this.symbols.set(identifier, value);
        }
    }

    lookup_external(identifier) {
        let r = this.symbols.get(identifier);
        if (r) return r;
        if (this.up) return this.up.lookup(identifier);
        return undefined;
    }

    lookup(identifier) {
        let r = this.symbols.get(identifier) || this.private_symbols.get(identifier);
        if (r) return r;
        if (this.up) return this.up.lookup_external(identifier);
        return undefined;
    }

    lookup_child(identifier) {
        let r = this.symbols.get(identifier);
        if (r) return r;
        return undefined;
    }
}

// statements are one or more stack-type blocks
class Statements {
    constructor(head, tail) {
        this.head = head;
        this.tail = tail ?? head;
        this.void = !head;
    }

    static void() {
        return new Statements();
    }
}

// expressions contain a reporter-type block
class Expression {
    constructor(id) {
        this.id = id;
    }
}

// macros are callable symbols that generate blocks
// builtins like goto(x,y) and functions calls use macros
// argument_info should be an array of arguments created with Macro.arg()
class Macro {
    constructor(argument_info, generate_blocks, raw_args = false) {
        this.argument_count = argument_info.length;
        this.argument_info = argument_info;
        this.generate_blocks = generate_blocks;
        this.raw_args = raw_args;
    }

    static arg(name) {
        return {name};
    }
}

// field expressions are like expressions but for
// values that cannot be expressed by a block
class FieldExpression {
    constructor(data) {
        this.data = data;
    }
}

// accessors represent a reference to a symbol
// they should point to a ParseNode which can be unwrapped to
// a Namespace, Macro, Expression, etc.
class Accessor {
    constructor(yy, scope, identifier, toplevel, at) {
        this.yy = yy;
        this.scope = scope;
        this.identifier = identifier;
        if (toplevel) {
            this.value = scope.lookup(identifier);
        } else {
            this.value = scope.lookup_child(identifier);
            if (!this.value) {
                throw new CompileError(`${this.identifier} does not exist in ${this.scope.id}`, at);
            }
        }
        this.as_member = !toplevel;
        this.at = at;
    }

    dot(identifier, at) {
        const ns = this.unwrap(at).unwrap_namespace().error(()=>{
            throw new CompileError(`${this.identifier} is not a namespace`, at);
        }).unwrap_unsafe();
        return new Accessor(this.yy, ns, identifier, false, at);
    }

    unwrap(at) {
        if (!this.value) {
            throw new CompileError(`${this.identifier} does not exist in ${this.scope.id}`, this.at);
        }
        if (!(this.value instanceof ParseNode)) {
            throw new Error('value not wrapped in ParseNode');
        }
        if (this.value) return this.value.clone_with_location(at);
        throw new Error('never');
    }

    undefined() {
        return !this.value;
    }
}

module.exports = {
    ParseNode,
    Statements,
    Expression,
    FieldExpression,
    Accessor,
    Macro,
    Namespace,
}