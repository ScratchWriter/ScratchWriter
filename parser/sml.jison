/* lexical grammar */
%lex

%%
\"(\\.|[^"\\])*\"               return 'STRING';
(\/\/)(.+?)(?=[\n\r]|\*\))      /* skip comment */
\/\/                            /* skip empty comment */
\s+                             /* skip whitespace */

[0-9]+("."[0-9]+)?\b            return 'NUMBER';

"."                             return '.';
","                             return ',';
'=>'                            return '=>'
"=="                            return '==';
'>='                            return '>=';
'<='                            return '<=';
">"                             return '>';
"<"                             return '<';
"!="                            return '!=';
"&&"                            return '&&';
"||"                            return '||';
"!"                             return '!';
"="                             return '=';
"+="                            return '+=';
"*"                             return '*';
"/"                             return '/';
"-"                             return '-';
"+"                             return '+';
"^"                             return '^';
"("                             return '(';
")"                             return ')';
"{"                             return '{';
"}"                             return '}';
"["                             return '[';
"]"                             return ']';
";"                             return ';';
"%"                             return '%';
"#"                             return '#';
'@f'                            return '@f';
'@'                             return '@';

"if"                            return 'IF';
"else"                          return 'ELSE';
"repeat"                        return 'REPEAT';
"until"                         return 'UNTIL';
"while"                         return 'WHILE';
"forever"                       return 'FOREVER';
"import"                        return 'IMPORT';
"as"                            return 'AS';
"const"                         return 'CONST';
"let"                           return 'LET';
"enum"                          return 'ENUM';
"stop"                          return 'STOP';
"void"                          return 'VOID';
"function"                      return 'FUNCTION';
"no_refresh"                    return 'NO_REFRESH';
"as_clone"                      return 'AS_CLONE';
"when_broadcast"                return 'WHEN_BROADCAST';
"global"                        return 'GLOBAL';
"return"                        return 'RETURN';
"true"                          return 'TRUE';
"false"                         return 'FALSE';
"null"                          return 'NULL';

([_a-zA-Z][_a-zA-Z0-9]*)\b      return 'IDENTIFIER';
<<EOF>>                         return 'EOF';

/lex

/* operator associations and precedence */
%left '||'
%left '&&'
%left '==' '<' '>' '!=' '>=' '<='
%left '#'
%left '+' '-'
%left '*' '/'
%left '%'
%left '^'
%left '.'
%left '!'

%start program

%% /* language grammar */

program
    : statements EOF
        {
            return $1;
        }
    ;

statements
    : statement
        {
            $$ = (ctx) => $statement(ctx);
        }
    | statements statement
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.statements(yy, ctx.at(yyat), $1(ctx), $2(ctx));
            }
        }
    |
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.void_statement(yy, ctx.at(yyat));
            }
        }
    ;
 
statement
    : IF '(' expression ')' block
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.if_statement(yy, ctx.at(yyat), $expression(ctx), $block(ctx));
            }
        }
    | IF '(' expression ')' block ELSE block
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.if_else_statement(yy, ctx.at(yyat), $expression(ctx), $block(ctx), $block2(ctx));
            }
        }
    | REPEAT '(' expression ')' block
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.repeat_statement(yy, ctx.at(yyat), $expression(ctx), $block(ctx));
            }
        }
    | UNTIL '(' expression ')' block
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.until_statement(yy, ctx.at(yyat), $expression(ctx), $block(ctx));
            }
        }
    | WHILE '(' expression ')' block
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.while_statement(yy, ctx.at(yyat), $expression(ctx), $block(ctx));
            }
        }
    | FOREVER block
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.forever_statement(yy, ctx.at(yyat), $block(ctx));
            }
        }
    | NO_REFRESH block
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.no_refresh_block(yy, ctx, ctx.at(yyat), $block);
            }
        }
    | AS_CLONE block
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.as_clone_block(yy, ctx, ctx.at(yyat), $block);
            }
        }
    | WHEN_BROADCAST expression block
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.broadcast_recived_block(yy, ctx, ctx.at(yyat), $expression, $block);
            }
        }
    | IMPORT string_literal AS IDENTIFIER ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.import_statement(yy, ctx.at(yyat), ctx.scope, $string_literal, $IDENTIFIER);
            }
        }
    | IMPORT string_literal ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.import_statement(yy, ctx.at(yyat), ctx.scope, $string_literal);
            }
        }
    | CONST IDENTIFIER '=' literal_block ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.const_statement(yy, ctx.at(yyat), ctx.scope, $IDENTIFIER, $literal_block(ctx));
            }
        }
    | CONST IDENTIFIER '=' accessor ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.const_statement_copy(yy, ctx.at(yyat), ctx.scope, $IDENTIFIER, $accessor(ctx));
            }
        }
    | CONST IDENTIFIER '=' array_initializer ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.array_initializer(yy, ctx.at(yyat), ctx.scope, $IDENTIFIER, $array_initializer(ctx), false);
            }
        }
    | GLOBAL IDENTIFIER '=' array_initializer ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.array_initializer(yy, ctx.at(yyat), ctx.scope, $IDENTIFIER, $array_initializer(ctx), true);
            }
        }
    | ENUM IDENTIFIER '{' $property_list '}'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.enum_statement(yy, ctx.at(yyat), ctx, $IDENTIFIER, $property_list(ctx));
            }
        }
    | LET IDENTIFIER ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.declare_statement(yy, ctx.at(yyat), ctx.scope, $IDENTIFIER, null, false);
            }
        }
    | LET IDENTIFIER '=' expression ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.declare_statement(yy, ctx.at(yyat), ctx.scope, $IDENTIFIER, $expression(ctx), false);
            }
        }
    | GLOBAL IDENTIFIER ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.declare_statement(yy, ctx.at(yyat), ctx.scope, $IDENTIFIER, null, true);
            }
        }
    | GLOBAL IDENTIFIER '=' expression ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.declare_statement(yy, ctx.at(yyat), ctx.scope, $IDENTIFIER, $expression(ctx), true);
            }
        }
    | array_index '=' expression ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.list_replace_statement(yy, ctx.at(yyat), $array_index.accessor(ctx), $array_index.expression(ctx), $expression(ctx));   
            }
        }
    | accessor '=' expression ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.assign_statement(yy, ctx.at(yyat), ctx.scope, 'data_setvariableto', $accessor(ctx), $expression(ctx));
            }
        }
    | accessor '+=' expression ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.assign_statement(yy, ctx.at(yyat), ctx.scope, 'data_changevariableby', $accessor(ctx), $expression(ctx));
            }
        }
    | STOP ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.stop_statement(yy, ctx.at(yyat));
            }
        }
    | VOID ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.void_statement(yy, ctx.at(yyat));
            }
        }
    | FUNCTION IDENTIFIER '(' identifier_list ')' block
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.function_declaration_statement(yy, ctx.at(yyat), ctx, $IDENTIFIER, $identifier_list, $block);
            }
        }
    | RETURN ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.return_value(yy, ctx.at(yyat), ctx, null);
            }
        }
    | RETURN expression ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.return_value(yy, ctx.at(yyat), ctx, $expression(ctx));
            }
        }
    | expression ';'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.expression_statement(yy, ctx.at(yyat), $expression(ctx));
            }
        }
    ;

block
    : '{' statements '}'
        {
            $$ = (ctx) => $statements(ctx);
        }
    ;

expression
    : e ;

e
    : e '+' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.add,
                    [$e1(ctx), $e2(ctx)],
                );
            }
        }
    | e '-' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.sub,
                    [$e1(ctx), $e2(ctx)],
                );
            }
        }
    | e '*' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.mul,
                    [$e1(ctx), $e2(ctx)],
                );
            }
        }
    | e '/' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.div,
                    [$e1(ctx), $e2(ctx)],
                );
            }
        }
    | e '%' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.mod,
                    [$e1(ctx), $e2(ctx)],
                );
            }
        }
    | e '#' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.strjoin,
                    [$e1(ctx), $e2(ctx)],
                );
            }
        }
    | '-' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.sub,
                    [
                        yy.generators.expression(yy, ctx.at(yyat), yy.program.number(0)),
                        $e1(ctx),
                    ],
                );
            }
        }
    | e '==' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.eq,
                    [$e1(ctx), $e2(ctx)]
                );
            }
        }
    | e '!=' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.neq,
                    [$e1(ctx), $e2(ctx)]
                );
            }
        }
    | e '>=' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.gte,
                    [$e1(ctx), $e2(ctx)]
                );
            }
        }
    | e '<=' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.lte,
                    [$e1(ctx), $e2(ctx)]
                );
            }
        }
    | e '>' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.gt,
                    [$e1(ctx), $e2(ctx)]
                );
            }
        }
    | e '<' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.lt,
                    [$e1(ctx), $e2(ctx)]
                );
            }
        }
    | e '&&' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.and,
                    [$e1(ctx), $e2(ctx)]
                );
            }
        }
    | e '||' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.or,
                    [$e1(ctx), $e2(ctx)]
                );
            }
        }
    | '!' e
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.use_macro(
                    yy,
                    ctx.at(yyat),
                    yy.compiler.operators.not,
                    [$e(ctx)]
                );
            }
        }
    | array_index
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.index_expression(yy, ctx.at(yyat), $array_index.accessor(ctx), $array_index.expression(ctx));
            }
        }
    | '(' e ')'
        {
            $$ = (ctx) => $e(ctx);
        }
    | array_initializer
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.array_expression(yy, ctx.at(yyat), $array_initializer(ctx));
            }
        }
    | '@'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.expression(yy, ctx.at(yyat), yy.program.string(
                    `line ${ctx.at(yyat).first_line} of ${ctx.file()}`
                ));
            }
        }
    | '@f'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.expression(yy, ctx.at(yyat), yy.program.string(ctx.file()));
            }
        }
    | literal_block
    | function_call
    | accessor
    ;

array_index
    :  accessor '[' expression ']'
        {
            {
                $$ = {accessor: $accessor, expression: $expression};
            }
        }
    ;


function_call
    : accessor '(' ')'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.function_call_expression(yy, ctx.at(yyat), $accessor(ctx), []);
            }
        }
    | accessor '(' maybe_expression_list ')'
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.function_call_expression(yy, ctx.at(yyat), $accessor(ctx), $maybe_expression_list(ctx));
            }
        }
    ;

accessor
    : IDENTIFIER
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.accessor_init(yy, ctx.at(yyat), ctx.scope, $IDENTIFIER);
            }
        }
    | accessor '.' IDENTIFIER
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.accessor_dot(yy, ctx.at(yyat), $accessor(ctx), $IDENTIFIER);
            }
        }
    ;

expression_list
    : expression
        { $$ = (ctx) => [ $expression(ctx) ]; }
    | expression_list ',' expression
        { $$ = (ctx) => [ ...$expression_list(ctx), $expression(ctx) ]; }
    ;

maybe_expression_list
    : expression_list ','    // allows trailing comma
        { $$ = (ctx) => $expression_list(ctx); }
    | expression_list        // standard list
        { $$ = (ctx) => $expression_list(ctx); }
    |                        // empty argument list
        { $$ = (ctx) => null; }
    ;

identifier_list
    : IDENTIFIER
        {
            $$ = [$IDENTIFIER];
        }
    | IDENTIFIER ','
        {
            $$ = [$IDENTIFIER];
        }
    | IDENTIFIER ',' identifier_list
        {
            $$ = [$IDENTIFIER, ...$identifier_list];
        }
    |
        {
            $$ = [];
        }
    ;

array_initializer
    : '[' maybe_expression_list ']'
        {
            {
                const yyat = @$;
                $$ = (ctx) => $maybe_expression_list(ctx);
            }
        }
    | '[' ']'
        {
            {
                const yyat = @$;
                $$ = (ctx) => [];
            }
        }
    ;

property_list
    : property
        {
            $$ = (ctx) => [$property(ctx)];
        }
    | property ','
        {
            $$ = (ctx) => [$property(ctx)];
        }
    | property ',' property_list
        {
            $$ = (ctx) => [$property(ctx), ...$property_list(ctx)];
        }
    |
        {
            $$ = (ctx) => [];
        }
    ;

property
    : IDENTIFIER
        {
            {
                $$ = (ctx) => ({identifier: $IDENTIFIER});
            }
        }
    | IDENTIFIER '=' literal_block
        {
            {
                $$ = (ctx) => ({identifier: $IDENTIFIER, value: $literal_block(ctx)});
            }
        }
    ;

literal_block
    : string_literal
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.expression(yy, ctx.at(yyat), yy.program.string($1));
            }
        }
    | number_literal
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.expression(yy, ctx.at(yyat), yy.program.number($1));
            }
        }
    | TRUE
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.expression(yy, ctx.at(yyat), yy.program.string('true'))
            }
        }
    | FALSE
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.expression(yy, ctx.at(yyat), yy.program.string('false'))
            }
        }
    | NULL
        {
            {
                const yyat = @$;
                $$ = (ctx) => yy.generators.expression(yy, ctx.at(yyat), yy.program.string(''))
            }
        }
    ;

number_literal
    : NUMBER {$$=Number(yytext)}
    | '-' NUMBER {$$=-Number(yytext)}
    ;

string_literal
    : STRING {$$=yytext.slice(1,-1).replaceAll('\\', '')}
    ;