const {
    Program,
    ProgramCtx,
    loadFile,
    renderProgram,
} = require('./index.js');

async function main() {
    const program = new Program();

    const proc = program.def_proc('test', ['foo', 'bar']);
    {
        const ctx = proc.getContext();
        ctx.move_gotoxy(proc.argument('foo'), proc.argument('foo'));
    }

    const loop = program.getContext();
    loop.move_gotoxy(loop.pow_10(program.number(2)), loop.pow_10(program.number(2)));
    proc.write_call(loop, [program.number(1), program.number(1)]);

    const ctx = program.getContext();
    ctx.when_flag_clicked();
    ctx.forever(loop);

    await program.build('out.sb3');
}

main();