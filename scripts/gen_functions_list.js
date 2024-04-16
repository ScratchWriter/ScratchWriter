const Compiler = require('../compiler.js');
const { Program } = require('../generator/program');
const program = new Program();
const compiler = new Compiler(program);

for (const [name, node] of compiler.global.symbols) {
    const macro = node.unwrap_macro().unwrap_unsafe();
    console.log(name + '(' + macro.argument_info.map(x=>x.name).join(', ')+')');
}
