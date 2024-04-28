const { ParseNode } = require('./nodes');

module.exports = {
    void_statement(yy, at) {
        return yy.compiler.voidblock(at);
    },

    statements(yy, at, a, b) {
        return yy.compiler.node(
            yy.compiler.merge_statements(
                a.statements_unsafe(),
                b.statements_unsafe(),
            ),
            yy.compiler.merge_locations(a.at, b.at),
        );
    },

    expression_statement(yy, at, expression) {
        return yy.compiler.sidechain_inputs(
            yy.compiler.voidblock(at),
            [expression],
        );
    },

    if_statement(yy, at, expression, block) {
        return yy.compiler.sidechain_inputs(
            yy.compiler.stackblock({
                opcode: "control_if",
                inputs: {
                    SUBSTACK: [2, block.statements_unsafe().head],
                    CONDITION: yy.compiler.inp_boolean(expression.expressions_unsafe().id),
                },
            }, at),
            [expression],
        );
    },

    if_else_statement(yy, at, expression, ifblock, elseblock) {
        return yy.compiler.sidechain_inputs(
            $$ = yy.compiler.stackblock({
                opcode: "control_if_else",
                inputs: {
                    SUBSTACK: [2, ifblock.statements_unsafe().head],
                    SUBSTACK2: [2, elseblock.statements_unsafe().head],
                    CONDITION: yy.compiler.inp_boolean(expression.expressions_unsafe().id),
                }
            }, at),
            [expression],
        );
    },

    repeat_statement(yy, at, expression, block) {
        return yy.compiler.sidechain_inputs(
            yy.compiler.stackblock({
                opcode: "control_repeat",
                inputs: {
                    SUBSTACK: [2, block.statements_unsafe().head],
                    TIMES: yy.compiler.inp(expression.expressions_unsafe().id),
                }
            }, at),
            [expression],
        );
    },

    until_statement(yy, at, expression, block) {
        return yy.compiler.sidechain_inputs(
            yy.compiler.stackblock({
                opcode: "control_repeat_until",
                inputs: {
                    SUBSTACK: [2, block.statements_unsafe().head],
                    CONDITION: yy.compiler.inp_boolean(expression.expressions_unsafe().id),
                }
            }, at),
            [expression],
        )
    },

    while_statement(yy, at, expression, block) {
        const while_not = yy.compiler.reporter({
            opcode: "operator_not",
            inputs: {
                OPERAND: yy.compiler.inp_boolean(
                    expression.expressions_unsafe().id
                ),
            },
        });
        return yy.compiler.sidechain_inputs(
            yy.compiler.stackblock({
                opcode: "control_repeat_until",
                inputs: {
                    SUBSTACK: [2, block.statements_unsafe().head],
                    CONDITION: yy.compiler.inp_boolean(while_not.expressions_unsafe().id),
                }
            }, at),
            [expression],
        );
    },

    forever_statement(yy, at, block) {
        return yy.compiler.stackblock({
            opcode: "control_forever",
            inputs: {
                SUBSTACK: [2, block.statements_unsafe().head],
            }
        }, at);
    },

    no_refresh_block(yy, ctx, at, gen_block) {
        return yy.compiler.no_refresh_block(ctx, gen_block, at);
    },

    import_statement(yy, at, scope, str, identifier) {
        yy.compiler.import(scope, str, identifier);
        return yy.compiler.voidblock(at);
    },

    const_statement(yy, at, scope, identifier, value) {
        scope.define(identifier, yy.compiler.expression(value.expressions_unsafe().id, at), at);
        return yy.compiler.voidblock(at);
    },

    enum_statement(yy, at, ctx, identifier, properties) {
        let n = 0;
        const subctx = ctx.sub(identifier);
        for (const prop of properties) {
            if (prop.value) {
                subctx.scope.define(prop.identifier, yy.compiler.expression(
                    prop.value.expressions_unsafe().id,
                    at,
                ), at);
            } else {
                subctx.scope.define(prop.identifier, yy.compiler.expression(
                    yy.generators.expression(yy, at, yy.program.number(n++)).expressions_unsafe().id,
                    at,
                ), at);
            }
        }
        ctx.scope.define(identifier, yy.compiler.node(subctx.scope));
        return yy.compiler.voidblock(at);
    },

    const_statement_copy(yy, at, scope, identifier, accessor) {
        scope.define(identifier, yy.compiler.expression(accessor.expressions_unsafe().id, at), at);
        return yy.compiler.voidblock(at);
    },

    list_statement(yy, at, scope, identifier) {
        return yy.compiler.list(scope, identifier);
    },

    declare_statement(yy, at, scope, identifier, expression) {
        return yy.compiler.sidechain_inputs(
            yy.compiler.declare_var_statement(
                scope,
                identifier,
                expression ? expression.expressions_unsafe().id : null,
                at,
            ),
            expression ? [expression] : [],
        );
    },

    assign_statement(yy, at, scope, opcode, accessor, expression) {
        return yy.compiler.sidechain_inputs(
            yy.compiler.assign_var_statement(
                scope,
                accessor,
                expression.expressions_unsafe().id,
                opcode,
                at,
            ),
            [expression],
        );
    },

    list_replace_statement(yy, at, value, index_expression, expression) {
        const operator = yy.compiler.node(
            value.unwrap_accessor().unwrap_unsafe().dot('!operator_list_replace', at),
            at,
        );
        return yy.compiler.function_call_expression(operator, [index_expression, expression], at);
    },

    stop_statement(yy, at) {
        return yy.compiler.stackblock({opcode: "control_stop", fields: {"STOP_OPTION": ["all"]}}, at);
    },

    function_declaration_statement(yy, at, ctx, identifier, identifier_list, gen_block) {
        yy.compiler.template_function_define(ctx, identifier, identifier_list, gen_block, at);
        return yy.compiler.voidblock(at);
    },

    anonymous_function(yy, at, ctx, identifier_list, gen_block) {
        return yy.compiler.template_function_define(ctx, null, identifier_list, gen_block, at);
    },

    return_value(yy, at, ctx, expression) {
        if (!ctx.return_register) {
            throw new Error('no return register');
        }
        const stop = yy.compiler.stackblock({opcode: "control_stop", fields: {"STOP_OPTION": ["this script"]}}, at);
        if (expression) {
            ctx.return_register.return_counter++;
            const set = yy.compiler.stackblock({
                opcode: "data_setvariableto",
                inputs: {
                    VALUE: yy.compiler.inp(expression.expressions_unsafe().id),
                },
                fields: {
                    VARIABLE: ctx.return_register.unwrap_field().unwrap_unsafe().data,
                }},
                at,
            );
            const merge = yy.compiler.node(
                yy.compiler.merge_statements(
                    set.statements_unsafe(),
                    stop.statements_unsafe(),
                ),
                at,
            );
            return yy.compiler.sidechain_inputs(merge, [expression]);
        } else {
            return stop;
        }
    },

    use_macro(yy, at, cb, args) {
        return yy.compiler.use_macro(cb, args, at);
    },

    function_call_expression(yy, at, accessor, expression_list) {
        return yy.compiler.function_call_expression(accessor, expression_list, at);
    },

    accessor_init(yy, at, scope, identifier) {
        return yy.compiler.accessor(
            scope,
            identifier,
            at,
        );
    },

    accessor_dot(yy, at, accessor, identifier) {
        return yy.compiler.node(
            accessor.unwrap_accessor().unwrap_unsafe().dot(identifier, at),
            at,
        );
    },

    expression(yy, at, expression) {
        return yy.compiler.expression(expression, at);
    },

    array_initializer(yy, at, scope, identifier, array_initializer) {
        const values = array_initializer.map(x=>x.expressions_unsafe().id);
        const list = yy.compiler.list(scope, identifier, at);
        const node = yy.compiler.initalize_list(list, values, at);
        return yy.compiler.sidechain_inputs(node, array_initializer);
    },

    array_expression(yy, at, array_initializer) {
        const values = array_initializer.map(x=>x.expressions_unsafe().id);
        const list = yy.compiler.get_list_register(at);
        const node = yy.compiler.initalize_list(list, values, at);
        return yy.compiler.sidechain_inputs(node, array_initializer);
    },

    index_expression(yy, at, value, index) {
        const operator = yy.compiler.node(
            value.unwrap_accessor().unwrap_unsafe().dot('!operator_index', at),
            at,
        );
        return yy.compiler.function_call_expression(operator, [index], at);
    },
}