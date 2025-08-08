const {
    ParseNode,
    Statements,
    Expression,
    FieldExpression,
    Accessor,
    Macro,
    Namespace,
} = require('./nodes');

const { inp } = require('./generator/blockwriter');

const operators = {
    add: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_add",
        inputs: {
            NUM1: inp(lhs),
            NUM2: inp(rhs),
        },
    }),
    sub: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_subtract",
        inputs: {
            NUM1: inp(lhs),
            NUM2: inp(rhs),
        },
    }),
    mul: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_multiply",
        inputs: {
            NUM1: inp(lhs),
            NUM2: inp(rhs),
        },
    }),
    div: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_divide",
        inputs: {
            NUM1: inp(lhs),
            NUM2: inp(rhs),
        },
    }),
    mod: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_mod",
        inputs: {
            NUM1: inp(lhs),
            NUM2: inp(rhs),
        },
    }),
    strjoin: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_join",
        inputs: {
            STRING1: inp(lhs),
            STRING2: inp(rhs),
        },
    }),
    eq: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_equals",
        inputs: {
            OPERAND1: inp(lhs),
            OPERAND2: inp(rhs),
        },
    }),
    neq: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_not",
        inputs: {
            OPERAND: yy.compiler.inp_boolean(yy.compiler.program.unlinked_reporter({
                opcode: "operator_equals",
                inputs: {
                    OPERAND1: inp(lhs),
                    OPERAND2: inp(rhs),
                },
            })),
        },
    }),
    gte: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_not",
        inputs: {
            OPERAND: yy.compiler.inp_boolean(yy.compiler.program.unlinked_reporter({
                opcode: "operator_lt",
                inputs: {
                    OPERAND1: inp(lhs),
                    OPERAND2: inp(rhs),
                },
            })),
        },
    }),
    lte: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_not",
        inputs: {
            OPERAND: yy.compiler.inp_boolean(yy.compiler.program.unlinked_reporter({
                opcode: "operator_gt",
                inputs: {
                    OPERAND1: inp(lhs),
                    OPERAND2: inp(rhs),
                },
            })),
        },
    }),
    gt: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_gt",
        inputs: {
            OPERAND1: inp(lhs),
            OPERAND2: inp(rhs),
        },
    }),
    lt: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_lt",
        inputs: {
            OPERAND1: inp(lhs),
            OPERAND2: inp(rhs),
        },
    }),
    and: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_and",
        inputs: {
            OPERAND1: yy.compiler.inp_boolean(lhs),
            OPERAND2: yy.compiler.inp_boolean(rhs),
        },
    }),
    or: (yy, [lhs, rhs]) => yy.compiler.reporter({
        opcode: "operator_or",
        inputs: {
            OPERAND1: yy.compiler.inp_boolean(lhs),
            OPERAND2: yy.compiler.inp_boolean(rhs),
        },
    }),
    not: (yy, [operand]) => yy.compiler.reporter({
        opcode: "operator_not",
        inputs: {
            OPERAND: yy.compiler.inp_boolean(operand),
        },
    }),
}


function builtins(yy) {
    // motion
    yy.compiler.global.define('goto', yy.compiler.macro(
        [Macro.arg('x'), Macro.arg('y')],
        (yy, [x,y]) => yy.compiler.stackblock({
            opcode: "motion_gotoxy",
            inputs: {
                X: inp(x),
                Y: inp(y),
            },
        })
    ));

    yy.compiler.global.define('set_angle', yy.compiler.macro(
        [Macro.arg('deg')],
        (yy, [deg]) => yy.compiler.stackblock({
            opcode: "",
            inputs: {
                DIRECTION: inp(deg),
            },
        })
    ));

    yy.compiler.global.define('move_steps', yy.compiler.macro(
        [Macro.arg('steps')],
        (yy, [steps]) => yy.compiler.stackblock({
            opcode: "motion_movesteps",
            inputs: {
                STEPS: inp(steps),
            },
        })
    ));

    yy.compiler.global.define('turn_right_deg', yy.compiler.macro(
        [Macro.arg('deg')],
        (yy, [deg]) => yy.compiler.stackblock({
            opcode: "motion_turnright",
            inputs: {
                DEGREES: inp(deg),
            },
        })
    ));

    yy.compiler.global.define('turn_left_deg', yy.compiler.macro(
        [Macro.arg('deg')],
        (yy, [deg]) => yy.compiler.stackblock({
            opcode: "motion_turnleft",
            inputs: {
                DEGREES: inp(deg),
            },
        })
    ));

    yy.compiler.global.define('glide_to', yy.compiler.macro(
        [Macro.arg('x'), Macro.arg('y'), Macro.arg('seconds')],
        (yy, [x,y,seconds]) => yy.compiler.stackblock({
            opcode: "motion_glidesecstoxy",
            inputs: {
                SECS: inp(seconds),
                X: inp(x),
                Y: inp(y),
            },
        })
    ));

    yy.compiler.global.define('set_x', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.stackblock({
            opcode: "motion_setx",
            inputs: {
                X: inp(x),
            },
        })
    ));

    yy.compiler.global.define('change_x', yy.compiler.macro(
        [Macro.arg('delta_x')],
        (yy, [dx]) => yy.compiler.stackblock({
            opcode: "motion_changexby",
            inputs: {
                DX: inp(dx),
            },
        })
    ));

    yy.compiler.global.define('set_y', yy.compiler.macro(
        [Macro.arg('y')],
        (yy, [y]) => yy.compiler.stackblock({
            opcode: "motion_sety",
            inputs: {
                Y: inp(y),
            },
        })
    ));

    yy.compiler.global.define('change_y', yy.compiler.macro(
        [Macro.arg('delta_y')],
        (yy, [dy]) => yy.compiler.stackblock({
            opcode: "motion_changeyby",
            inputs: {
                DY: inp(dy),
            },
        })
    ));

    yy.compiler.global.define('dont_rotate', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.stackblock({
            opcode: "motion_setrotationstyle",
            fields: {
                STYLE: [
                    "don't rotate",
                    null
                ],
            },
        })
    ));

    yy.compiler.global.define('normal_rotation', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.stackblock({
            opcode: "motion_setrotationstyle",
            fields: {
                STYLE: [
                    "all around",
                    null
                ],
            },
        })
    ));

    yy.compiler.global.define('get_x', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "motion_xposition",
        })
    ));

    yy.compiler.global.define('get_y', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "motion_yposition",
        })
    ));

    yy.compiler.global.define('get_direction', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "motion_direction",
        })
    ));

    // looks
    yy.compiler.global.define('say_for_seconds', yy.compiler.macro(
        [Macro.arg('message'), Macro.arg('seconds')],
        (yy, [message, seconds]) => yy.compiler.stackblock({
            opcode: "looks_sayforsecs",
            inputs: {
                MESSAGE: inp(message),
                SECS: inp(seconds),
            }
        })
    ));

    yy.compiler.global.define('say', yy.compiler.macro(
        [Macro.arg('message')],
        (yy, [message]) => yy.compiler.stackblock({
            opcode: "looks_say",
            inputs: {
                MESSAGE: inp(message),
            }
        })
    ));

    yy.compiler.global.define('set_size', yy.compiler.macro(
        [Macro.arg('size')],
        (yy, [size]) => yy.compiler.stackblock({
            opcode: "looks_setsizeto",
            inputs: {
                SIZE: inp(size),
            }
        })
    ));

    yy.compiler.global.define('change_size', yy.compiler.macro(
        [Macro.arg('delta_size')],
        (yy, [delta_size]) => yy.compiler.stackblock({
            opcode: "looks_changesizeby",
            inputs: {
                CHANGE: inp(delta_size),
            }
        })
    ));

    yy.compiler.global.define('show', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.stackblock({
            opcode: "looks_show",
        })
    ));

    yy.compiler.global.define('hide', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.stackblock({
            opcode: "looks_hide",
        })
    ));

    yy.compiler.global.define('get_size', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "looks_size",
        })
    ));

    yy.compiler.global.define('set_costume', yy.compiler.macro(
        [Macro.arg('costume')],
        (yy, [costume]) => yy.compiler.stackblock({
            opcode: "looks_switchcostumeto",
            inputs: {
                COSTUME: inp(costume),
            },
        })
    ));

    yy.compiler.global.define('get_active_costume', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "looks_costumenumbername",
            fields: {
                NUMBER_NAME: [
                    "name",
                    null
                ]
            },
        })
    ));

    yy.compiler.global.define('get_costume_number', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "looks_costumenumbername",
            fields: {
                NUMBER_NAME: [
                    "number",
                    null
                ]
            },
        })
    ));

    // sound
    yy.compiler.global.define('play_sound', yy.compiler.macro(
        [Macro.arg('sound')],
        (yy, [sound]) => yy.compiler.stackblock({
            opcode: "sound_play",
            inputs: {
                SOUND_MENU: inp(sound),
            },
        })
    ));

    yy.compiler.global.define('play_sound_wait', yy.compiler.macro(
        [Macro.arg('sound')],
        (yy, [sound]) => yy.compiler.stackblock({
            opcode: "sound_playuntildone",
            inputs: {
                SOUND_MENU: inp(sound),
            },
        })
    ));

    yy.compiler.global.define('set_volume', yy.compiler.macro(
        [Macro.arg('volume')],
        (yy, [volume]) => yy.compiler.stackblock({
            opcode: "sound_setvolumeto",
            inputs: {
                VOLUME: inp(volume),
            },
        })
    ));

    yy.compiler.global.define('set_pitch', yy.compiler.macro(
        [Macro.arg('pitch')],
        (yy, [pitch]) => yy.compiler.stackblock({
            opcode: "sound_seteffectto",
            inputs: {
                VALUE: inp(pitch),
            },
            fields: {
                EFFECT: ["PITCH", null],
            }
        })
    ));

    yy.compiler.global.define('set_pan', yy.compiler.macro(
        [Macro.arg('pan')],
        (yy, [pan]) => yy.compiler.stackblock({
            opcode: "sound_seteffectto",
            inputs: {
                VALUE: inp(pan),
            },
            fields: {
                EFFECT: ["PAN", null],
            }
        })
    ));

    yy.compiler.global.define('get_volume', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "sound_volume",
        })
    ));

    yy.compiler.global.define('clear_sound_effects', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.stackblock({
            opcode: "sound_cleareffects",
        })
    ));

    // control
    yy.compiler.global.define('wait', yy.compiler.macro(
        [Macro.arg('duration')],
        (yy, [duration]) => yy.compiler.stackblock({
            opcode: "control_wait",
            inputs: {
                DURATION: inp(duration),
            }
        })
    ));

    yy.compiler.global.define('wait_until', yy.compiler.macro(
        [Macro.arg('condition')],
        (yy, [condition]) => yy.compiler.stackblock({
            opcode: "control_wait_until",
            inputs: {
                CONDITION: yy.compiler.inp_boolean(condition),
            }
        })
    ));

    // sensing
    yy.compiler.global.define('disable_drag', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.stackblock({
            opcode: "sensing_setdragmode",
            inputs: {
                DRAG_MODE: [
                    "not draggable",
                    null
                ],
            },
        })
    ));

    yy.compiler.global.define('enable_drag', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.stackblock({
            opcode: "sensing_setdragmode",
            inputs: {
                DRAG_MODE: [
                    "draggable",
                    null
                ],
            },
        })
    ));

    yy.compiler.global.define('key_down', yy.compiler.macro(
        [Macro.arg('key')],
        (yy, [key]) => yy.compiler.reporter({
            opcode: "sensing_keypressed",
            inputs: {
                KEY_OPTION: inp(key),
            },
        })
    ));

    // make this return answer in a register
    yy.compiler.global.define('ask', yy.compiler.macro(
        [Macro.arg('question')],
        (yy, [question]) => {
            const statements = yy.compiler.program.unlinked_block({
                opcode: "sensing_askandwait",
                inputs: {
                    QUESTION: inp(question),
                },
            });
            const expression = yy.compiler.program.unlinked_reporter({
                opcode: "sensing_answer",
            });
            return yy.compiler.hybrid(
                new Statements(statements),
                new Expression(expression),
            );
        }
    ));

    yy.compiler.global.define('get_mouse_down', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "sensing_mousedown",
        })
    ));

    yy.compiler.global.define('get_mouse_x', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "sensing_mousex",
        })
    ));

    yy.compiler.global.define('get_mouse_y', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "sensing_mousey",
        })
    ));

    yy.compiler.global.define('timer', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.reporter({
            opcode: "sensing_timer",
        })
    ));

    yy.compiler.global.define('reset_timer', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.stackblock({
            opcode: "sensing_resettimer",
        })
    ));

    // operator
    yy.compiler.global.define('floor', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["floor"],
            }
        })
    ));

    yy.compiler.global.define('ceil', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["ceiling"],
            }
        })
    ));

    yy.compiler.global.define('abs', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["abs"],
            }
        })
    ));

    yy.compiler.global.define('sin', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["sin"],
            }
        })
    ));

    yy.compiler.global.define('cos', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["cos"],
            }
        })
    ));

    yy.compiler.global.define('tan', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["tan"],
            }
        })
    ));

    yy.compiler.global.define('asin', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["asin"],
            }
        })
    ));

    yy.compiler.global.define('acos', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["acos"],
            }
        })
    ));

    yy.compiler.global.define('atan', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["atan"],
            }
        })
    ));

    yy.compiler.global.define('log', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["log"],
            }
        })
    ));

    yy.compiler.global.define('ln', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["ln"],
            }
        })
    ));

    yy.compiler.global.define('pow_e', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["e ^"],
            }
        })
    ));

    yy.compiler.global.define('pow_10', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["10 ^"],
            }
        })
    ));

    yy.compiler.global.define('sqrt', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_mathop",
            inputs: {
                NUM: inp(x),
            },
            fields: {
                OPERATOR: ["sqrt"],
            }
        })
    ));

    yy.compiler.global.define('randint', yy.compiler.macro(
        [Macro.arg('from'), Macro.arg('to')],
        (yy, [from, to]) => yy.compiler.reporter({
            opcode: "operator_random",
            inputs: {
                FROM: inp(from),
                TO: inp(to),
            },
        })
    ));

    yy.compiler.global.define('letterof', yy.compiler.macro(
        [Macro.arg('index'), Macro.arg('string')],
        (yy, [index, str]) => {
            const adjusted_index = yy.compiler.program.unlinked_reporter({
                opcode: 'operator_add',
                inputs: {
                    NUM1: inp(index),
                    NUM2: inp(yy.compiler.program.number(1)),
                },
            });
            return yy.compiler.reporter({
                opcode: "operator_letter_of",
                inputs: {
                    LETTER: inp(adjusted_index),
                    STRING: inp(str),
                },
            });
        }
    ));

    yy.compiler.global.define('len', yy.compiler.macro(
        [Macro.arg('string')],
        (yy, [str]) => yy.compiler.reporter({
            opcode: "operator_length",
            inputs: {
                STRING: inp(str),
            },
        })
    ));

    yy.compiler.global.define('round', yy.compiler.macro(
        [Macro.arg('x')],
        (yy, [x]) => yy.compiler.reporter({
            opcode: "operator_round",
            inputs: {
                NUM: inp(x),
            },
        })
    ));

    yy.compiler.global.define('str_contains', yy.compiler.macro(
        [Macro.arg('str'), Macro.arg('substr')],
        (yy, [str, substr]) => yy.compiler.reporter({
            opcode: "operator_contains",
            inputs: {
                STRING1: inp(str),
                STRING2: inp(substr),
            }
        })
    ));

    // pen
    yy.compiler.global.define('pen_clear', yy.compiler.macro(
        [],
        (yy, [x]) => yy.compiler.stackblock({
            opcode: "pen_clear",
        })
    ));

    yy.compiler.global.define('pen_down', yy.compiler.macro(
        [],
        (yy, [x]) => yy.compiler.stackblock({
            opcode: "pen_penDown",
        })
    ));

    yy.compiler.global.define('pen_up', yy.compiler.macro(
        [],
        (yy, [x]) => yy.compiler.stackblock({
            opcode: "pen_penUp",
        })
    ));

    yy.compiler.global.define('set_pen_size', yy.compiler.macro(
        [Macro.arg('size')],
        (yy, [size]) => yy.compiler.stackblock({
            opcode: "pen_setPenSizeTo",
            inputs: {
                SIZE: inp(size),
            }
        })
    ));

    yy.compiler.global.define('set_pen_color', yy.compiler.macro(
        [Macro.arg('color')],
        (yy, [color]) => yy.compiler.stackblock({
            opcode: "pen_setPenColorToColor",
            inputs: {
                COLOR: inp(color),
            }
        })
    ));

    yy.compiler.global.define('pen_stamp', yy.compiler.macro(
        [],
        (yy, []) => yy.compiler.stackblock({
            opcode: "pen_stamp",
        })
    ));
}

module.exports = {builtins,operators};