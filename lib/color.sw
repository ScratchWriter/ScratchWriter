function rgb(r, g, b) {
    return r%256 * 256 + g%256 * 256 + b%256;
}

function rgba(r, g, b, a) {
    return ((a%256 * 256 + r%256) * 256 + g%256) * 256 + b%256;
}

function set_pen_rgb(r, g, b) {
    set_pen_color((r%256 * 256 + g%256) * 256 + b%256);
}

function set_pen_rgba(r, g, b, a) {
    set_pen_color(((a%256 * 256 + r%256) * 256 + g%256) * 256 + b%256);
}

function gray(value) {
    return 65793 * value%256;
}

const BLACK = 0;
const GRAY = 8421504;
const WHITE = 16777215;
const RED = 16711680;
const GREEN = 65280;
const BLUE = 255;
const YELLOW = 16776960;