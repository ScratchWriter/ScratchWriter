const _ = require("lodash");
const meta = require('../package.json');
const fs = require('fs');

const {
    BlockWriter,
    BlockWriterCtx,
} = require('./blockwriter.js');

const { injectBlocks, base_project_path, saveFile, loadFile, locateTarget } = require('./sb3.js');

const { zip, objectMap } = require('../util.js');

class ProgramCtx extends BlockWriterCtx {
    // event
    when_flag_clicked() {
        return this.next({opcode: "event_whenflagclicked", topLevel: true});
    }

    when_key_pressed(key_option) {
        return this.next({opcode: "event_whenkeypressed", topLevel: true, fields: {KEY_OPTION: [key_option]}});
    }

    when_this_sprite_clicked() {
        return this.next({opcode: "event_whenthisspriteclicked", topLevel: true});
    }

    // control
    wait(duration) {
        return this.next({opcode: "event_whenthisspriteclicked", inputs: {DURATION: [1, duration]}});
    }

    repeat(times, branch) {
        return this.next({opcode: "control_repeat", inputs: {TIMES: [1, times], SUBSTACK: [1, branch.head]}});
    }

    forever(branch) {
        return this.cap({opcode: "control_forever", inputs: {SUBSTACK: [1, branch.head]}});
    }

    if(condition, branch) {
        return this.next({opcode: "control_if", inputs: {SUBSTACK: [1, branch.head], CONDITION: [1, condition]}});
    }

    if_else(condition, branch_if_true, branch_if_false) {
        return this.next({opcode: "control_if", inputs: {SUBSTACK: [1, branch_if_true.head], SUBSTACK2: [1, branch_if_false.head], CONDITION: [1, condition]}});
    }

    wait_until(condition) {
        return this.next({opcode: "control_wait_until", inputs: {CONDITION: [1, condition]}});
    }

    repeat_until(condition, branch) {
        return this.next({opcode: "control_repeat_until", inputs: {SUBSTACK: [1, branch.head]}});
    }

    stop_all() {
        return this.cap({opcode: "control_stop", fields: ["all"]});
    }

    stop_this_script() {
        return this.cap({opcode: "control_stop", fields: ["this script"]});
    }

    stop_other_scripts() {
        return this.next({opcode: "control_stop", fields: ["other scripts in sprite"]});
    }

    start_as_clone() {
        return this.next({opcode: "control_start_as_clone", topLevel: true});
    }

    delete_this_clone() {
        return this.cap({opcode: "control_delete_this_clone"});
    }

    // motion
    move_steps(steps) {
        return this.next({opcode: "motion_movesteps", inputs: {STEPS: [1, steps]}});
    }

    turn_right(steps) {
        return this.next({opcode: "motion_turnright", inputs: {DEGREES: [1, steps]}});
    }

    move_gotoxy(x, y) {
        return this.next({opcode: "motion_gotoxy", inputs: {X: [1, x], Y:[1, y]}});
    }

    point_in_direction(angle) {
        return this.next({opcode: "motion_pointindirection", inputs: {ANGLE: [1, angle]}});
    }

    change_x_by(dx) {
        return this.next({opcode: "motion_changexby", inputs: {DX: [1, dx]}});
    }

    change_y_by(dy) {
        return this.next({opcode: "motion_changeyby", inputs: {DY: [1, dy]}});
    }

    set_x(x) {
        return this.next({opcode: "motion_setx", inputs: {X: [1, x]}});
    }

    set_y(y) {
        return this.next({opcode: "motion_sety", inputs: {Y: [1, y]}});
    }

    if_on_edge_bounce() {
        return this.next({opcode: "motion_ifonedgebounce"});
    }

    x_position() {
        return this.reporter({opcode: "motion_xposition"});
    }

    y_position() {
        return this.reporter({opcode: "motion_yposition"});
    }

    direction() {
        return this.reporter({opcode: "motion_direction"});
    }

    // style:
    // "all around"
    // "left-right"
    // "don't rotate"
    set_rotation_style(style) {
        return this.next({opcode: "motion_setrotationstyle", fields: {STYLE: [style]}});
    }

    // operators
    add(lhs, rhs) {
        return this.reporter({opcode: "operator_add", inputs: {NUM1: [1, lhs], NUM2: [1, rhs]}});
    }

    sub(lhs, rhs) {
        return this.reporter({opcode: "operator_subtract", inputs: {NUM1: [1, lhs], NUM2: [1, rhs]}});
    }

    mul(lhs, rhs) {
        return this.reporter({opcode: "operator_multiply", inputs: {NUM1: [1, lhs], NUM2: [1, rhs]}});
    }

    div(lhs, rhs) {
        return this.reporter({opcode: "operator_divide", inputs: {NUM1: [1, lhs], NUM2: [1, rhs]}});
    }

    random(from, to) {
        return this.reporter({opcode: "operator_random", inputs: {FROM: [1, from], TO: [1, to]}});
    }

    gt(lhs, rhs) {
        return this.reporter({opcode: "operator_gt", inputs: {OPERAND1: [1, lhs], OPERAND2: [1, rhs]}});
    }

    lt(lhs, rhs) {
        return this.reporter({opcode: "operator_lt", inputs: {OPERAND1: [1, lhs], OPERAND2: [1, rhs]}});
    }

    eq(lhs, rhs) {
        return this.reporter({opcode: "operator_equals", inputs: {OPERAND1: [1, lhs], OPERAND2: [1, rhs]}});
    }

    and(lhs, rhs) {
        return this.reporter({opcode: "operator_and", inputs: {OPERAND1: [1, lhs], OPERAND2: [1, rhs]}});
    }

    or(lhs, rhs) {
        return this.reporter({opcode: "operator_or", inputs: {OPERAND1: [1, lhs], OPERAND2: [1, rhs]}});
    }

    not(operand) {
        return this.reporter({opcode: "operator_not", inputs: {OPERAND: [1, operand]}});
    }

    join(lhs, rhs) {
        return this.reporter({opcode: "operator_join", inputs: {OPERAND1: [1, lhs], OPERAND2: [1, rhs]}});
    }

    letter_of(letter, str) {
        return this.reporter({opcode: "operator_letter_of", inputs: {LETTER: [1, letter], STRING: [1, str]}});
    }

    not(str) {
        return this.reporter({opcode: "operator_length", inputs: {STRING: [1, str]}});
    }

    contains(str1, str2) {
        return this.reporter({opcode: "operator_contains", inputs: {STRING1: [1, str1], STRING2: [1, str2]}});
    }

    mod(lhs, rhs) {
        return this.reporter({opcode: "operator_mod", inputs: {NUM1: [1, lhs], NUM2: [1, rhs]}});
    }

    round(num) {
        return this.reporter({opcode: "operator_round", inputs: {NUM: [1, num]}});
    }

    abs(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["abs"]}});
    }

    sin(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["sin"]}});
    }

    cos(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["cos"]}});
    }

    tan(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["tan"]}});
    }

    asin(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["asin"]}});
    }

    acos(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["acos"]}});
    }

    atan(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["atan"]}});
    }

    floor(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["floor"]}});
    }

    ceil(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["ceiling"]}});
    }
    
    sqrt(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["sqrt"]}});
    }

    log_ln(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["ln"]}});
    }

    pow_e(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["e ^"]}});
    }

    pow_10(num) {
        return this.reporter({opcode: "operator_mathop", inputs: {NUM: [1, num]}, fields: {OPERATOR: ["10 ^"]}});
    }
}

class Procedure {
    constructor(program, name, args, suffix, warp) {
        this.program = program;
        this.name = name;
        this.proccode = [name, ...args.map(name=>`${name} %s`), suffix??''].join(' ');
        this.argumentids = [...Array(args.length)].map(()=>program.blockwriter.next_id());
        this.argumentnames = args;
        this.argumentdefaults = Array(args.length).fill("");
        this.warp = !!warp;
        this.args = Object.fromEntries(_.zip(this.argumentnames, this.argumentids));
    }

    getContext() {
        const ctx = this.program.getContext();
        this.write_header(ctx);
        return ctx;
    }

    argument(name, shadow = false) {
        if (!(name in this.args)) throw new Error(`Argument ${name} does not exist.`);
        const arg_reporter = this.program.blockwriter.next_id();
        this.program.blockwriter.create(arg_reporter, {
            opcode: "argument_reporter_string_number",
            fields: {
                VALUE: [name, null],
            },
            shadow,
        });
        return arg_reporter;
    }

    write_header(ctx) {
        const proto = this.program.blockwriter.next_id();

        const def = ctx.next({
            opcode: "procedures_definition",
            inputs: {
                "custom_block": [1, proto],
            },
            topLevel: true,
        });

        this.program.blockwriter.create(proto, {
            opcode: "procedures_prototype",
            mutation: {
                tagName: "mutation",
                children: [],
                proccode: this.proccode,
                inputs: objectMap(this.args, ([name, id])=>([id, [1, this.argument(name, true)]])),
                argumentids: JSON.stringify(this.argumentids),
                argumentnames: JSON.stringify(this.argumentnames),
                argumentdefaults: JSON.stringify(this.argumentdefaults),
                warp: String(this.warp),
            },
            shadow: true,
        });
    }

    write_call(ctx, args) {
        const inputs = args.map(x=>[1,x]);
        ctx.next({
            opcode: "procedures_call",
            inputs: Object.fromEntries(_.zip(this.argumentids, inputs)),
            mutation: {
                tagName: "mutation",
                children: [],
                proccode: this.proccode,
                argumentids: JSON.stringify(this.argumentids),
                warp: String(this.warp),
            }
        });
    }

    unlinked_call(args) {
        const inputs = args.map(x=>[1,x]);
        return this.program.unlinked_block({
            opcode: "procedures_call",
            inputs: Object.fromEntries(_.zip(this.argumentids, inputs)),
            mutation: {
                tagName: "mutation",
                children: [],
                proccode: this.proccode,
                argumentids: JSON.stringify(this.argumentids),
                warp: String(this.warp),
            }
        });
    }
}

class Program {
    constructor() {
        this.blockwriter = new BlockWriter();
        this.procedures = {};
    }

    def_proc(name, args, suffix, warp = true) {
        const proc = new Procedure(this, name, args, suffix, warp);
        return proc;
    }

    getContext() {
        const ctx = new ProgramCtx(this.blockwriter);
        return ctx;
    }

    connect_blocks(first_block, second_block) {
        return this.blockwriter.connect(first_block, second_block);
    }

    unlinked_block(options = {}) {
        return this.blockwriter.unlinked(options);
    }

    unlinked_reporter(options = {}) {
        return this.blockwriter.unlinked(options);
    }

    // literals
    number(x) {
        return [4, x];
    }

    positive_number(x) {
        return [5, x];
    }

    positive_int(x) {
        return [6, x];
    }

    int(x) {
        return [7, x];
    }

    angle(x) {
        return [8, x];
    }

    color(x) {
        return [9, x];
    }

    string(x) {
        return [10, x];
    }

    broadcast(x) {
        return [11, x];
    }

    variable(name) {
        return this.blockwriter.variablemanager.variable(name);
    }

    list(name) {
        return this.blockwriter.variablemanager.list(name);
    }

    symbol(name) {
        return this.blockwriter.variablemanager.symbol(name);
    }

    // inject blocks into an existing sb3 file
    async inject(zip) {
        const file = zip.file('project.json');
        const data = JSON.parse(await file.async('string'));
        data.meta.agent = `${meta.name}/${meta.version}`;
        const sprite = locateTarget(data);
        Object.assign(sprite.blocks, this.blockwriter.blocks);
        this.blockwriter.variablemanager.inject(sprite);
        this.blockwriter.assetmanager.inject(sprite);
        this.blockwriter.assetmanager.write(zip);
        zip.file('project.json', JSON.stringify(data));
    }

    async build_sb3(input_path = base_project_path) {
        const zip = await loadFile(input_path);
        await this.inject(zip);
        return await zip.generateAsync({type:'arraybuffer'});
    }

    // add blocks to an existing sb3 file
    async build(input_path = base_project_path) {
        const zip = await loadFile(input_path);
        await this.inject(zip);
        return zip;
    }

    async save(input_path = base_project_path) {
        const zip = await loadFile(input_path);
        await this.inject(zip);
        await saveFile(zip, output_path);
    }

    get blocks() {
        return this.blockwriter.blocks;
    }
}

module.exports = {
    Program,
    ProgramCtx,
}