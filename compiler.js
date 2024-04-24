const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const parser = require('./parser/sml').parser;
const { CompileError, FileError, CompilerSyntaxError, CompilerLexError } = require('./errors');
const { builtins, operators } = require('./builtins');
const parser_generators = require('./generators');
const { BLOCKTYPE, BlockHints } = require('./hints');

const {
    ParseNode,
    Statements,
    Expression,
    FieldExpression,
    Accessor,
    Macro,
    Namespace,
} = require('./nodes');

const DEFAULT_OPTIONS = {
    path: [],
    extentions: ['sw'],
    mainfiles: ['main', 'index'],
    warp: true,
};

class CompilerCtx {
    constructor(namespace, import_trace, options = {}) {
        this.scope = namespace;
        this.import_trace = import_trace;
        this.return_register = options.return_register || null;
    }

    sub(name, options) {
        const ns = new Namespace(`${this.scope.id}.${name}`, this.scope);
        return new CompilerCtx(ns, this.import_trace, options);
    }

    at(loc) {
        return {
            first_line: loc.first_line,
            last_line: loc.last_line,
            first_column: loc.first_column,
            last_column: loc.last_column,
            import_trace: this.import_trace,
        }
    }

    file() {
        const file = this.import_trace[this.import_trace.length-1];
        return path.basename(file);
    }
}

// provides functionality for:
//  - loading files into the parser
//  - the parser to write higher order instructions to the program
//  - exporting project files
class Compiler {
    constructor(program, options = {}) {
        this.program = program;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        this.modules = new Map();
        this.used_namespaces = new Set(['main']);
        this.global = new Namespace('main');
        this.register_counter = 0;
        this.proc_cache = {};
        const yy = {
            program,
            compiler: this,
            file: undefined,
            import_trace: [],
            debug: options.debug,
            generators: parser_generators,
        };
        this.yy = Object.assign({}, parser.yy, yy);

        // define lots of builtins
        this.operators = operators;
        builtins(this.yy);

        this.body = this.stackblock(
            {
                opcode: "event_whenflagclicked",
                topLevel: true,
            },
            {anonymous: true}
        );
    }

    // read a file
    file(inpfile) {
        const r = this.load_from(inpfile);
        if (Array.isArray(r)) throw new FileError(`unable to load ${inpfile} \n(${r.join(', ')})`);
        return r;
    }

    // differentiate duplicate namespaces names
    get_namespace_name(name, n=0) {
        if (!n && !this.used_namespaces.has(name)) {
            return name;
        }
        const name_ext = name + '_' + String(n);
        if (this.used_namespaces.has(name_ext)) return this.get_namespace_name(name, n+1);
        return name_ext;
    }

    main(statement) {
        this.body = this.node(
            this.merge_statements(
                this.body.statements_unsafe(),
                statement.statements_unsafe(),
            ),
        );
    }

    // parse and compile file data
    digest(data, file) {
        if (this.modules.has(file)) return;

        const oldyy = {...this.yy};

        this.yy.dir = path.dirname(file);
        
        const module_scope = new Namespace(this.get_namespace_name(path.parse(file).name), this.global);
        this.modules.set(file, module_scope);
        const import_trace = this.yy.import_trace = [...oldyy.import_trace, file];
        this.yy.file = file;

        parser.yy = this.yy;
        parser.yy.parseError = function(err, hash) {
            if (hash.token) {
                throw new CompilerSyntaxError(hash, {
                    ...hash.loc,
                    import_trace,
                }, err);
            } else {
                throw new CompilerLexError(hash, {
                    first_line: hash.line+1,
                    last_line: hash.line+1,
                    import_trace,
                }, err);
            }
        }

        const ctx = new CompilerCtx(module_scope, this.yy.import_trace);

        try {
            const deffered = parser.parse(data);
            const head = deffered(ctx);
            this.main(this.module_wrap("import " + module_scope.id, head));
        } catch (err) {
            err.import_stack = [...err.import_stack??[], file];
            throw err;
        }

        this.yy = oldyy;
        parser.yy = this.yy;
    }

    digest_asset(data, file) {
        if (this.modules.has(file)) return;
        const handle = this.program.blockwriter.assetmanager.load(data, file);
        const handle_variable = this.get_named_register('asset_' + handle);
        this.modules.set(file, handle_variable.expressions_unsafe());
        const generated_blocks = this.stackblock({
            opcode: 'data_setvariableto',
            inputs: {
                VALUE: this.inp(this.program.string(handle)),
            },
            fields: {
                VARIABLE: handle_variable.unwrap_field().unwrap_unsafe().data,
            },
        });
        this.main(generated_blocks);
    }

    // load an exact path
    load_exact(inpfile) {
        const file_path = path.resolve(inpfile);

        if (file_path === this.yy.file) {
            this.debug('skipping import of current file', inpfile);
            return [file_path];
        }

        if (this.modules.has(file_path)) {
            this.debug('loaded file from cache', file_path);
            return file_path;
        }

        let data;

        try {
            data = fs.readFileSync(file_path);
        } catch (err) {
            this.debug('failed to locate file', file_path, `(${err.code})`);
            return [file_path];
        }

        this.debug('loaded file', file_path);

        if (this.program.blockwriter.assetmanager.is_asset(file_path)) {
            this.debug('loading as asset', file_path);
            this.digest_asset(data, file_path);
        } else {
            this.debug('loading as source', file_path);
            this.digest(data.toString('utf-8'), file_path);
        }
        
        return file_path;
    }

    // load a file but guess at the extention if needed
    load_file(inpfile) {
        const attempts = [];
        for (const ext of ['', ...this.options.extentions.map(x=>'.'+x)]) {
            const trypath = inpfile + ext;
            const r = this.load_exact(trypath);
            if (Array.isArray(r)) {
                attempts.push(...r);
            } else {
                return r;
            }
        }
        return attempts;
    }

    // load a file or path
    load_from(inpfile) {
        const attempts = [];
        for (const mainfile of ['', ...this.options.mainfiles]) {
            const trypath = path.join(inpfile, mainfile);
            const r = this.load_file(trypath);
            if (Array.isArray(r)) {
                attempts.push(...r);
            } else {
                return r;
            }
        }
        return attempts;
    }

    // load a file relative to the current file or from a directory in options.path
    load_import(inpfile) {
        const attempts = [];
        for (const base of [this.yy.dir, ...this.options.path]) {
            const trypath = path.join(base, inpfile);
            const r = this.load_from(trypath);
            if (Array.isArray(r)) {
                attempts.push(...r);
            } else {
                return r;
            }
        }
        throw new FileError(`Failed to locate file ${inpfile}\n(${attempts.join(', ')})`);
    }

    // import a module
    import(scope, inpfile, as_symbol) {
        this.debug('importing', inpfile, 'from', this.yy.file);
        const resolved_path = this.load_import(inpfile);
        this.link(scope, resolved_path, as_symbol);
    }

    // link a module to the current scope
    link(scope, file, as_symbol) {
        this.debug('linking', file, 'to', as_symbol);
        scope.define(as_symbol, this.node(this.modules.get(file)));
    }

    get_unique_name(scope, identifier) {
        return `${scope.id}.${identifier}`;
    }

    // list declaration statement
    list(scope, identifier, at) {
        if (scope.lookup(identifier)) {
            throw new CompileError(`${identifier} is already defined`, at);
        }

        const unique_name = this.get_unique_name(scope, identifier);
        const node = this.create_list(unique_name);
        const listfield = node.unwrap_field().unwrap_unsafe();
        scope.define(identifier, node);

        const statement = this.stackblock({opcode: "data_deletealloflist", fields: {LIST: listfield}}, at);
        return new ParseNode({
            yy: this.yy,
            to_statements: () => statement.unwrap_statements(),
            to_namespace: () => node.unwrap_namespace(),
            to_field: () => node.unwrap_field(),
        });
    }

    // list expression
    get_list_register(at) {
        const node = this.create_list(`register_${this.register_counter++}`);
        const listfield = node.unwrap_field().unwrap_unsafe();
        const statement = this.stackblock({opcode: "data_deletealloflist", fields: {LIST: listfield}}, at);
        return new ParseNode({
            yy: this.yy,
            to_statements: () => statement.unwrap_statements(),
            to_namespace: () => node.unwrap_namespace(),
            to_field: () => node.unwrap_field(),
        });
    }

    create_list(unique_name) {
        const list = this.program.list(unique_name);
        const namespace = new Namespace(this.get_namespace_name(unique_name));

        const listfield = this.to_field(list);
        const fields = {LIST: listfield}

        namespace.define('reset', this.macro(
            [],
            (yy, []) => yy.compiler.stackblock({
                opcode: "data_deletealloflist",
                fields,
            })
        ));

        namespace.define('delete', this.macro(
            [Macro.arg('index')],
            (yy, [index]) => {
                const adjusted_index = this.program.unlinked_reporter({
                    opcode: 'operator_add',
                    inputs: {
                        NUM1: this.inp(index),
                        NUM2: this.inp(this.program.number(1)),
                    },
                });
                return yy.compiler.stackblock({
                    opcode: "data_deleteoflist",
                    inputs: { 
                        INDEX: this.inp(adjusted_index),
                    },
                    fields,
                });
            }
        ));

        namespace.define('push', this.macro(
            [Macro.arg('value')],
            (yy, [value]) => yy.compiler.stackblock({
                opcode: "data_addtolist",
                inputs: {
                    ITEM: this.inp(value),
                },
                fields,
            })
        ));

        namespace.define('show', this.macro(
            [],
            (yy, []) => yy.compiler.stackblock({
                opcode: "data_showlist",
                fields,
            })
        ));

        namespace.define('hide', this.macro(
            [],
            (yy, []) => yy.compiler.stackblock({
                opcode: "data_hidelist",
                fields,
            })
        ));

        const item = this.macro(
            [Macro.arg('index')],
            (yy, [index]) => {
                const adjusted_index = this.program.unlinked_reporter({
                    opcode: 'operator_add',
                    inputs: {
                        NUM1: this.inp(index),
                        NUM2: this.inp(this.program.number(1)),
                    },
                });
                return yy.compiler.reporter({
                    opcode: "data_itemoflist",
                    inputs: { 
                        INDEX: this.inp(adjusted_index),
                    },
                    fields,
                });
            }
        );

        namespace.define('item', item);
        namespace.define('index', item);
        namespace.define('!operator_index', item);

        namespace.define('insert', this.macro(
            [Macro.arg('index'), Macro.arg('value')],
            (yy, [index, value]) => {
                const adjusted_index = this.program.unlinked_reporter({
                    opcode: 'operator_add',
                    inputs: {
                        NUM1: this.inp(index),
                        NUM2: this.inp(this.program.number(1)),
                    },
                })
                return yy.compiler.stackblock({
                    opcode: "data_insertatlist",
                    inputs: {
                        INDEX: this.inp(adjusted_index),
                        ITEM: this.inp(value),
                    },
                    fields,
                });
            }
        ));

        const replace = this.macro(
            [Macro.arg('index'), Macro.arg('value')],
            (yy, [index, value]) => {
                const adjusted_index = this.program.unlinked_reporter({
                    opcode: 'operator_add',
                    inputs: {
                        NUM1: this.inp(index),
                        NUM2: this.inp(this.program.number(1)),
                    },
                })
                return yy.compiler.stackblock({
                    opcode: "data_replaceitemoflist",
                    inputs: {
                        INDEX: this.inp(adjusted_index),
                        ITEM: this.inp(value),
                    },
                    fields,
                });
            }
        );

        namespace.define('replace', replace);
        namespace.define('set', replace);
        namespace.define('!operator_list_replace', replace);

        namespace.define('indexof', this.macro(
            [Macro.arg('value')],
            (yy, [value]) => {
                const index = this.program.unlinked_reporter({
                    opcode: "data_itemnumoflist",
                    inputs: {
                        ITEM: this.inp(value),
                    },
                    fields,
                });
                return yy.compiler.reporter({
                    opcode: 'operator_subtract',
                    inputs: {
                        NUM1: this.inp(index),
                        NUM2: this.inp(this.program.number(1)),
                    },
                });
            }
        ));

        namespace.define('has', this.macro(
            [Macro.arg('value')],
            (yy, [value]) => yy.compiler.reporter({
                opcode: "data_listcontainsitem",
                inputs: {
                    ITEM: this.inp(value),
                },
                fields,
            })
        ));

        namespace.define('length', this.macro(
            [],
            (yy, []) => yy.compiler.reporter({
                opcode: "data_lengthoflist",
                fields,
            })
        ));

        return new ParseNode({
            yy: this.yy,
            to_namespace: () => namespace,
            to_field: () => listfield,
        });
    }

    initalize_list(list, values, at) {
        const listfield = list.unwrap_field().unwrap_unsafe();
        const fields = {LIST: listfield};

        const statements = values.map(v=>{
            return this.stackblock({
                opcode: "data_addtolist",
                inputs: {
                    ITEM: this.inp(v),
                },
                fields,
            }).statements_unsafe();
        });
        
        const result_statements = this.merge_statements_list([
            list.statements_unsafe(),
            ...statements,
        ]);

        result_statements.at = at;

        return new ParseNode({
            yy: this.yy,
            to_statements: () => result_statements,
            to_namespace: () => list.unwrap_namespace(),
            to_field: () => list.unwrap_field(),
        });
    }

    declare_var_statement(scope, identifier, value, at) {
        if (scope.lookup(identifier)) {
            throw new CompileError(`${identifier} is already defined`, at);
        }
        
        const variable = this.program.variable(this.get_unique_name(scope, identifier));
        const expression = new Expression(variable);
        const field = new FieldExpression(this.to_field(variable));
        scope.define(identifier, new ParseNode({
            yy: this.yy,
            to_expression: () => expression,
            to_field: () => field,
            at,
        }), at);
        if (value) {
            return this.stackblock({
                opcode: 'data_setvariableto',
                inputs: {VALUE: this.inp(value)},
                fields: {VARIABLE: field.data}},
                at,
            );
        } else {
            return this.voidblock(at);
        }
    }

    // variable assignment statement
    assign_var_statement(scope, accessor, value, opcode, at) {
        const field = accessor.unwrap_field().unwrap_unsafe();
        return this.stackblock({
            opcode,
            inputs: {VALUE: this.inp(value)},
            fields: {VARIABLE: field.data}},
            at,
        );
    }

    // convert a variable input to field
    to_field(arr) {
        return [arr[1], arr[2]];
    }

    // convert an input to a boolean reporter if needed
    ensure_boolean_reporter(id) {
        const opcode = this.program.blockwriter.opcode(id);
        const hints = new BlockHints(opcode);

        if (hints.is(BLOCKTYPE.BOOLEAN)) {
            return id;
        }
        if (hints.is(BLOCKTYPE.REPORTER)) {
            return this.program.unlinked_reporter({
                opcode: 'operator_equals',
                inputs: {
                    OPERAND1: this.inp(id),
                    OPERAND2: this.inp(this.program.string('true')),
                },
            });
        }
        throw new Error(`bad input: ${opcode}`);
    }

    // helper for inputs
    inp(x, shadow) {
        return this.program.inp(x, shadow);
    }

    inp_boolean(x) {
        return this.inp(this.ensure_boolean_reporter(x), null);
    }

    // process input sidechaining and call a macro
    use_macro(cb, args, at) {
        const unwrapped_args = args.map(x=>x.unwrap_expression().unwrap_unsafe().id);
        const result = cb(this.yy, unwrapped_args);
        result.at = at;
        return this.sidechain_inputs(result, args);
    }

    use_macro_raw(cb, args, at) {
        const result = cb(this.yy, args, at);
        result.at = at;
        return this.sidechain_inputs(result, args);
    }

    // function call expression
    function_call_expression(accessorarg, args, at) {
        const accessor = accessorarg.unwrap_accessor().unwrap_unsafe();
        const value = accessor.unwrap(at).unwrap_macro().error((err)=>{
            throw new CompileError(`${accessor.identifier} is not callable`, at);
        }).unwrap_unsafe();
        if (!value.generate_blocks) {
            throw new CompileError(`${accessor.identifier} is not callable`, at);
        }
        if (value.argument_count !== args.length) {
            throw new CompileError(`Incorrect number of arguments for call to ${accessor.identifier}`, at);
        }
        if (value.raw_args) {
            return this.use_macro_raw(value.generate_blocks, args, at);
        } else {
            return this.use_macro(value.generate_blocks, args, at);
        }
    }

    template_function_define(ctx, identifier, identifiers, gen_blocks, at) {
        let n = 0;
        const cache = this.proc_cache;
        const scope = ctx.scope;
        const base_id = this.get_unique_name(scope, identifier);

        const arg_info = (value, name) => {
            if (value.has_expression()) return {
                dynamic: true,
                value,
                name,
                id: 'dyn',
            }
            const id = name+'='+(value.uuid() || 'unknown');
            if (value.has_namespace()) return {
                dynamic: false,
                value,
                name,
                id,
            }
            if (value.has_macro()) return {
                dynamic: false,
                value,
                name,
                id,
            }
            throw new CompileError('invalid argument');
        }

        const get_proc = (args, at) => {
            const dynamic = args.filter(x=>x.dynamic).length === args.length;
            const code = base_id + ' ' + args.map(x=>x.id).join(' ');
            if (cache.hasOwnProperty(code)) {
                return cache[code];
            }

            const return_register = this.get_register();
            const argnames = args.map(x=>x.name);
            const proc = this.program.def_proc(base_id, argnames, dynamic? '':`#${n++}`, false);
            proc.return_register = return_register;
            cache[code] = proc;
            const subctx = ctx.sub(identifier, {
                return_register,
            });

            for (const arg of args) {
                if (arg.dynamic) {
                    subctx.scope.define(arg.name, new ParseNode({
                        yy: this.yy,
                        to_expression: () => new Expression(proc.argument(arg.name)),
                    }), at);
                } else {
                    subctx.scope.define(arg.name, arg.value, at);
                }
            }

            return_register.return_counter = 0;
            const blocks = gen_blocks(subctx).statements_unsafe().head;
            if (blocks) {
                proc.getContext().connect_next(blocks);
            }
            proc.returns = return_register.return_counter > 0;
            return proc;
        }

        scope.define(identifier, this.macro_raw_args(identifiers.map(arg=>Macro.arg(arg)), (yy, call_args, at) => {
            const args = _.zip(identifiers, call_args).map(([name,value])=>arg_info(value, name));
            const proc = get_proc(args, at);
            const return_register = proc.return_register;
            const argvalues = args.map(x=>x.dynamic ? x.value.expressions_unsafe().id : this.program.string(x.value.identify()));
            if (proc.returns) {
                const register = this.get_register();
                const statements = this.merge_statements(
                    new Statements(proc.unlinked_call(argvalues)),
                    new Statements(this.program.unlinked_block({
                        opcode: "data_setvariableto",
                        inputs: {VALUE: [3, return_register.expressions_unsafe().id, [10, ""]]},
                        fields: {VARIABLE: register.unwrap_field().unwrap_unsafe().data},
                    })),
                );
                return this.hybrid(statements, register.expressions_unsafe());
            } else {
                const statements = new Statements(proc.unlinked_call(argvalues));
                return new ParseNode({
                    yy: this.yy,
                    to_statements : () => statements,
                    to_expression : () => {
                        throw new CompileError(`${identifier} does not return a value`);
                    },
                });
            }
        }), at);
    }

    no_refresh_block(ctx, gen_blocks, at) {
        const proc = this.program.def_proc(`no_refresh_${this.register_counter++}`, [], "", true);
        const blocks = gen_blocks(ctx).statements_unsafe().head;
        if (blocks) {
            proc.getContext().connect_next(blocks);
        }
        return this.statement(proc.unlinked_call([]), at);
    }

    module_wrap(name, block, at) {
        const proc = this.program.def_proc(name, [], "", false);
        const blocks = block.statements_unsafe().head;
        if (blocks) {
            proc.getContext().connect_next(blocks);
        }
        return this.statement(proc.unlinked_call([]), at);
    }

    // get a variable for generated code that isn't associated with a variable
    // visable in the input program
    get_register(at) {
        const variable = this.program.variable(`register_${this.register_counter++}`);
        const expression = new Expression(variable);
        const field = new FieldExpression(this.to_field(variable));

        return new ParseNode({
            yy: this.yy,
            to_expression: () => expression,
            to_field: () => field,
            at,
        });
    }

    get_named_register(name, at) {
        const variable = this.program.variable(name);
        const expression = new Expression(variable);
        const field = new FieldExpression(this.to_field(variable));

        return new ParseNode({
            yy: this.yy,
            to_expression: () => expression,
            to_field: () => field,
            at,
        });
    }

    // automaticly infer the node type
    node(data, at) {
        if (data instanceof Statements) {
            return new ParseNode({
                yy: this.yy,
                to_statements: ()=>data,
                at,
            });
        } else if (data instanceof Expression) {
            return new ParseNode({
                yy: this.yy,
                to_expression: ()=>data,
                at,
            });
        } else if (data instanceof Accessor) {
            return new ParseNode({
                yy: this.yy,
                to_accessor: ()=>data,
                to_expression: ()=>data.unwrap(at).unwrap_expression(),
                to_field: ()=>data.unwrap(at).unwrap_field(),
                to_namespace: ()=>data.unwrap(at).unwrap_namespace(),
                to_macro: ()=>data.unwrap(at).unwrap_macro(),
                at,
            });
        } else if (data instanceof Macro) {
            return new ParseNode({
                yy: this.yy,
                to_macro: ()=>data,
                at,
            });
        } else if (data instanceof Namespace) {
            return new ParseNode({
                yy: this.yy,
                to_namespace: ()=>data,
                at,
            });
        } else {
            console.error('unexpected', data);
            throw new Error('never');
        }
    }

    // create a reporter-type block
    reporter(options, at) {
        return this.expression(this.program.unlinked_reporter(options), at);
    }

    // create a stack-type block
    stackblock(options, at) {
        return this.statement(this.program.unlinked_block(options), at);
    }

    // create a macro
    macro(argument_info, generate_blocks) {
        return this.node(new Macro(argument_info, generate_blocks));
    }

    macro_raw_args(argument_info, generate_blocks) {
        return this.node(new Macro(argument_info, generate_blocks, true));
    }

    // wrap a stack block into a single-block-statement
    statement(statement, at) {
        return this.node(new Statements(statement), at);
    }

    // wrap a reporter block into an expression
    expression(expression, at) {
        return this.node(new Expression(expression), at);
    }

    // for expressions that need to return a value but also
    // write stack-blocks to the program
    hybrid(statements, expression, at) {
        return new ParseNode({
            yy: this.yy,
            to_statements: ()=>statements,
            to_expression: ()=>expression,
            at,
        });
    }

    // statement that has no blocks
    voidblock(at) {
        return this.node(new Statements(), at);
    }

    // create an accessor in the current scpope
    accessor(scope, identifier, at) {
        return this.node(new Accessor(this.yy, scope, identifier, true, at), at);
    }

    // merge two "at" objects
    merge_locations(a, b) {
        if (!a && !b) return undefined;
        if (!a) return b;
        if (!b) return a;
        if (a.import_trace !== b.import_trace) return {anonymous: true};
        if (!a.first_line && !b.first_line) return undefined;
        if (!b.first_line) return a;
        if (!a.first_line) return b;
        return {
            first_line: Math.min(a.first_line, b.first_line),
            last_line: Math.max(a.last_line, b.last_line),
            first_column: Math.min(a.first_column, b.first_column),
            last_column: Math.max(a.last_column, b.last_column),
            text: 'merge',
            import_trace: a.import_trace,
        }
    }

    // merge two Statement objects and link their blocks
    merge_statements(a, b) {
        if (a.void && b.void) return a;
        if (b.void) return a;
        if (a.void) return b;
        const opcode = this.program.blockwriter.opcode(a.tail);
        const hints = new BlockHints(opcode);
        if (!hints.is(BLOCKTYPE.CAP)) {
            this.program.connect_blocks(a.tail, b.head);
        }
        return new Statements(a.head, b.tail);
    }

    // merge multiple Statement objects and link their blocks
    merge_statements_list(statements) {
        if (statements.length < 1) return undefined;
        while (statements.length > 1) {
            const a = statements.shift();
            const b = statements.shift();
            statements.unshift(this.merge_statements(a,b));
        }
        return statements[0];
    }

    // some "hybrid" nodes will write a stackblock and return a reporter
    // take stackblocks attached to each input and write them to the output
    // inputs and result must be nodes, not statements
    sidechain_inputs(result, inputs) {
        const sidechain = [];
        for (const node of inputs) {
            node.unwrap_statements().ok((statements)=>sidechain.push(statements));
        }
        result.unwrap_statements().ok((statements)=>sidechain.push(statements));
        const merged = this.merge_statements_list(sidechain.filter(x=>!x.void));
        if (merged) {
            result.to_statements = () => merged;
        }
        return result;
    }

    debug(...args) {
        if (this.yy.debug) {
            console.debug(...args);
        }
    }

    relink() {
        this.program.blockwriter.relink();
    }
}

module.exports = Compiler;