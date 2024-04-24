import "font" as font;
import "case" as case;

const STRIDE = 112;
const LINE_HEIGHT = 22;

function get_char_code(char) {
    let code = font.indices.indexof(char);
    if (case.is_caps_fast(char)) {
        code += font.caps_offset;
    }
    return code;
}

const char_codes = [];
function load_string(str) {
    let width = 0;
    char_codes.reset();

    let n = 0;
    repeat(len(str)) {
        let code = get_char_code(letterof(n, str));
        char_codes.push(code);
        width += font.data.item((code * STRIDE) + 1);
        n += 1;
    }

    return width;
}

function draw_char(code, x,y, scale) {
    pen_up();

    let n = code * STRIDE;

    let count = font.data.item(n);
    n += 1;
    let width = font.data.item(n);
    n += 1;

    repeat(count) {
        let vx = font.data.item(n);
        n += 1;
        let vy = font.data.item(n);
        n += 1;
        
        if (vx==-1 && vy==-1) {
            pen_up();
        } else {
            goto((vx*scale)+x, (vy*scale)+y);
            pen_down();
        }
    }

    return width * scale;
}

function draw_string(x,y, scale, spacing) {
    let preserve_costume = get_active_costume();
    let ix = x;
    let n = 0;
    repeat(char_codes.length()) {
        ix += draw_char(char_codes.item(n), ix, y, scale) * spacing;
        n += 1;
    }
    set_costume(preserve_costume);
    return ix-x;
}

const CENTER = 0.5;
const LEFT = 0;
const BOTTOM = 0;
const TOP = 1;
const RIGHT = 1;

function draw(str, x, y, anchor_x, anchor_y, size, spacing) {
    let scale = size/LINE_HEIGHT;
    let width = load_string(str) * scale * spacing;
    return draw_string(x - (width * anchor_x), y - (size * anchor_y), scale, spacing);
}