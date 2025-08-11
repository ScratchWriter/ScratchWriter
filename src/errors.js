const fs = require('fs');
const path = require('path');
const _chalk = import("chalk").then(m=>m.default);

class CompileError extends Error {
    constructor(message, at) {
        super(message);
        this.at = at;
    }
}

class FileError extends Error {
}

const TOKENS = {
    TRUE: 'Boolean',
    FALSE: 'Boolean',
};
{
    [
        'IF',       'ELSE',
        'REPEAT',   'UNTIL',
        'WHILE',    'FOREVER',
        'IMPORT',   'AS',
        'CONST',    'LET',
        'STOP',     'VOID',
        'FUNCTION', 'RETURN'
    ].forEach((token)=>TOKENS[token] = 'Keyword');
    
    [
        '==', '>', '<', '&&',
        '||', '!', '=', '^',
        '*',  '/', '-', '+',
        '+=', '-=', '*=', '/=',
        '#', '%'
    ].forEach((token)=>TOKENS[token] = 'Operator');
}

function describe_token(token, text) {
    const type = TOKENS[token] || 'Token';
    return `${type} "${text}"`;
}

class CompilerLexError extends CompileError {
    constructor(hash, at, err) {
        const basename = path.basename(at.import_trace[at.import_trace.length-1]);
        const msg = `SyntaxError: Unrecognized Text in ${basename}`;
        super(msg, at);
        this.hash = hash;
    }
}

class CompilerSyntaxError extends CompileError {
    constructor(hash, at, err) {
        const token_info = describe_token(hash.token, hash.text);
        const msg = `SyntaxError: Unexpected ${token_info}`;
        super(msg, at);
        this.hash = hash;
    }
}

const error_constructors = [
    CompileError,
    FileError,
    CompilerSyntaxError,
    CompilerLexError,
];

const prefix_lines = (data, prefix) => data.split('\n').map(x=>prefix+x).join('\n');

async function print_error(err) {
    const chalk = await _chalk;

    let msg = '\n';
    msg += err.message;
    msg += '\n';

    let errloc = "unknown source file";
    if (err.import_stack) {
        errloc = path.basename(err.import_stack[err.import_stack.length-1]);
    }

    if (err.at && err.at.first_line) {
        const at = err.at;
        const first_line = at.first_line || 1;
        const last_line = at.last_line || first_line;
        const file = at.import_trace[at.import_trace.length-1];
        errloc = `${path.basename(file)} (${first_line}:${err.at.first_column})`;
        try {
            const data = fs.readFileSync(file, { encoding: 'utf8' });
            const numbered_lines = data
                .split('\n')
                .slice(first_line-1, last_line)
                .map((v,i)=>` | ${v}`)
                .map((v,i)=>`${chalk.dim(i+first_line)}${v}`)
                ;
            msg += numbered_lines.slice(0, 20).join('\n') + '\n';
        } catch (err) {
            console.error(err);
        }
    }

    if (err.import_stack) {
        msg += '\n';
        msg += errloc + '\n';
        for (const file of err.import_stack) {
            msg += chalk.dim(' - ' + file + '\n');
        }
    }

    console.error(prefix_lines(msg, chalk.red('ERROR') + ' '));
    return;
}

async function catch_compiler_errors(cb, debug) {
    try {
        await cb();
    } catch (err) {
        if (debug) {
            console.error(err);
        }
        for (const T of error_constructors) {
            if (err instanceof T) {
                await print_error(err);
                return;
            }
        }
        throw err;
    }
}

module.exports = {
    CompileError,
    FileError,
    CompilerSyntaxError,
    CompilerLexError,
    catch_compiler_errors,
};