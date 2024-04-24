const BLOCKTYPE = {
    HAT: 'HAT',
    STACK: 'STACK',
    REPORTER: 'REPORTER',
    BOOLEAN: 'BOOLEAN',
    C: 'C',
    CAP: 'CAP',
}

const DATA_TYPE_OPCODES = {
    4: "literal_number",
    5: "literal_positive_number",
    6: "literal_positive_integer",
    7: "literal_integer",
    8: "literal_angle",
    9: "literal_color",
    10: "literal_string",
    11: "event_broadcast",
    12: "data_variable",
    13: "data_list",
}

const CATEGORY = {
    MOTION: 'MOTION',
    LOOKS: 'LOOKS',
    SOUND: 'SOUND',
    CONTROL: 'CONTROL',
    SENSING: 'SENSING',
    OPERATOR: 'OPERATOR',
    VARIABLE: 'VARIABLE',
    LIST: 'LIST',
    PROCEDURES: 'PROCEDURES',
}

const registry = {
    [BLOCKTYPE.HAT]: [
        'event_whengreaterthan',
        'event_whenflagclicked',
        'event_whenkeypressed',
        'event_whenthisspriteclicked',
        'event_whenbackdropswitchesto',
        'event_whenbroadcastreceived',
    ],
    [BLOCKTYPE.CAP]: [
        'control_forever',
        'control_stop',
        'control_delete_this_clone',
    ],
    [BLOCKTYPE.C]: [
        'control_if',
        'control_if_else',
        'control_forever',
        'control_repeat_until',
        'control_repeat',
    ],
    [BLOCKTYPE.BOOLEAN]: [
        'sensing_mousedown',
        'sensing_keypressed',

        'operator_gt',
        'operator_lt',
        'operator_equals',
        'operator_and',
        'operator_or',
        'operator_not',
        'operator_contains',
        'data_listcontainsitem',
    ],
    [BLOCKTYPE.REPORTER]: [
        'motion_xposition',
        'motion_yposition',
        'motion_direction',

        'looks_costume',
        'looks_backdrops',
        'looks_size',

        'sound_volume',

        'sensing_answer',
        'sensing_keypressed',
        'sensing_mousex',
        'sensing_mousey',
        'sensing_mousedown',
        'sensing_timer',
        'sensing_loudness',
        'sensing_dayssince2000',
        'sensing_username',

        'operator_add',
        'operator_subtract',
        'operator_multiply',
        'operator_divide',
        'operator_mod',
        'operator_random',
        'operator_gt',
        'operator_lt',
        'operator_equals',
        'operator_and',
        'operator_or',
        'operator_not',
        'operator_join',
        'operator_letter_of',
        'operator_length',
        'operator_contains',
        'operator_round',
        'operator_mathop',

        'data_listcontainsitem',
        'data_lengthoflist',
        'data_itemoflist',
        'data_variable',
        'data_list',
        
        'literal_number',
        'literal_positive_number',
        'literal_positive_integer',
        'literal_integer',
        'literal_angle',
        'literal_color',
        'literal_string',
        'argument_reporter_string_number',

        'event_broadcast',
    ],
    [BLOCKTYPE.STACK]: [
        'motion_movesteps',
        'motion_turnright',
        'motion_turnleft',
        'motion_goto',
        'motion_glideto',
        'motion_glidesecstoxy',
        'motion_pointindirection',
        'motion_pointtowards',
        'motion_changexby',
        'motion_setx',
        'motion_changeyby',
        'motion_sety',
        'motion_ifonedgebounce',
        'motion_setrotationstyle',
        
        'looks_sayforsecs',
        'looks_say',
        'looks_thinkforsecs',
        'looks_think',
        'looks_switchcostumeto',
        'looks_nextcostume',
        'looks_switchbackdropto',
        'looks_nextbackdrop',
        'looks_changesizeby',
        'looks_setsizeto',
        'looks_changeeffectby',
        'looks_seteffectto',
        'looks_cleargraphiceffects',
        'looks_show',
        'looks_hide',
        'looks_gotofrontback',
        'looks_goforwardbackwardlayers',

        'sound_playuntildone',
        'sound_play',
        'sound_stopallsounds',
        'sound_changeeffectby',
        'sound_seteffectto',
        'sound_cleareffects',

        'event_broadcast',
        'event_broadcastandwait',

        'control_wait',
        'control_wait_until',
        'control_create_clone_of',

        'sensing_askandwait',
        'sensing_setdragmode',
        'sensing_resettimer',
        
        'data_setvariableto',
        'data_changevariableby',
        'data_showvariable',
        'data_hidevariable',
        'data_addtolist',
        'data_deleteoflist',
        'data_deletealloflist',
        'data_insertatlist',
        'data_replaceitemoflist',
        'data_showlist',
        'data_hidelist',

        'pen_clear',
        'pen_stamp',
        'pen_penDown',
        'pen_penUp',
        'pen_setPenColorToColor',
        'pen_changePenColorParamBy',
        'pen_setPenColorParamTo',
        'pen_changePenSizeBy',
        'pen_setPenSizeTo',
    ],
}

const BLOCKTYPES = Object.values(BLOCKTYPE);
const CATEGORIES = Object.values(CATEGORY);

class BlockHints {
    constructor(opcode) {
        this.type = new Set();
        this.category = new Set();
        this.hints = new Set();
        if (opcode) {
            this.load_opcode(opcode);
        }
    }

    load_opcode(opcode) {
        for (const [hint, opcodes] of Object.entries(registry)) {
            if (opcodes.includes(opcode)) this.push(hint);
        }
    }

    push(...hints) {
        for (const hint of hints.filter(hint=>BLOCKTYPES.includes(hint))) {
            this.type.add(hint);
        }
        for (const hint of hints.filter(hint=>CATEGORIES.includes(hint))) {
            this.category.add(hint);
        }
        this.hints.add(...hints);
    }

    is(hint) {
        if (hint === undefined) return false;
        if (hint === null) return false;
        return this.hints.has(hint);
    }
}

module.exports = {
    BLOCKTYPE,
    CATEGORY,
    DATA_TYPE_OPCODES,
    BlockHints,
}