function rgb(r, g, b) {
    return (floor(r)%256 * 256 + floor(g)%256) * 256 + floor(b)%256;
}

function rgba(r, g, b, a) {
    return ((floor(a)%256 * 256 + floor(r)%256) * 256 + floor(g)%256) * 256 + floor(b)%256;
}

function set_pen_rgb(r, g, b) {
    set_pen_color((floor(r)%256 * 256 + floor(g)%256) * 256 + floor(b)%256);
}

function set_pen_rgba(r, g, b, a) {
    set_pen_color(((floor(a)%256 * 256 + floor(r)%256) * 256 + floor(g)%256) * 256 + floor(b)%256);
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
const CYAN = 65408;

const LIGHT_BLUE = 33023;
const LIGHT_RED = 16711808;
const LIGHT_GREEN = 8454016;

const DARK_GREEN = 51264;