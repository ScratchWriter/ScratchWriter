import "text" as text;
import "window" as window;
import "graphics" as gfx;
import "color" as color;

const console = [];

let lines = 12;
let padding = 12;
let font_size = 12;
let line_height = 22;
let font_weight = 1;
let text_color = color.rgb(255,255,255);
let background_color = color.rgb(4,16,32);

function configure(linecount) {
    lines = linecount;
    let h = window.HEIGHT - (2*padding);
    line_height = h/lines;
    font_size = (line_height) / 2;
    reset();
}

function reset() {
    console.reset();
    repeat(lines) {
        console.push("");
    }
}
reset();

function write(str) {
    console.delete(0);
    console.push(str);
}

function render(x,y, font_size, line_height) {
    let iy = y;

    let n = 0;
    repeat(console.length()) {
        text.draw(console[n], x, iy, text.LEFT, text.TOP, font_size, 1);
        iy += -line_height;
        n += 1;
    }
}

function draw() {
    gfx.reset();
    set_pen_color(background_color);
    gfx.fill();
    overlay();
}

function overlay() {
    set_pen_size(font_weight);
    set_pen_color(text_color);
    render(window.MIN_X + padding, window.MAX_Y - padding, font_size, line_height);
}

function log(str) {
    write(str);
    draw();
}