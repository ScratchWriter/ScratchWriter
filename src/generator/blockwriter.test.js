const {BlockWriter, BlockWriterCtx} = require("./blockwriter.js");

test('blockwriter', ()=>{
    const expected = {
        '@1': {
          opcode: 'event_whenflagclicked',
          next: '@2',
          parent: null,
          inputs: {},
          fields: {},
          shadow: false,
          topLevel: true
        },
        '@2': {
          opcode: 'motion_movesteps',
          next: null,
          parent: '@1',
          inputs: {},
          fields: {},
          shadow: false,
          topLevel: false
        },
    }

    const writer = new BlockWriter();
    const ctx = new BlockWriterCtx(writer);
    ctx.next({opcode: 'event_whenflagclicked', topLevel: true});
    ctx.next({opcode: 'motion_movesteps'});

    expect(writer.blocks).toStrictEqual(expected);
});