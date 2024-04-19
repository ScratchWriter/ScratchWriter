import "window" as window;
import "graphics" as graphics;
import "input" as input;

let cx = 0;
let cy = 0;
let cz = 1;
let zoom = 1;
let camera_speed = 10;
let zoom_speed = 10;

function transform_x(x) {
    return (x-cx)*cz;
}

function transform_y(y) {
    return (y-cy)*cz;
}

function untransform_x(x) {
    return (x/cz)+cx;
}

function untransform_y(y) {
    return (y/cz)+cy;
}

function dot(x,y,s) {
    let x1 = transform_x(x);
    let y1 = transform_y(y);
    if (window.is_visable(x1,y1, s*cz)) {
        pen_up();
        set_pen_size(s*cz);
        goto(x1,y1);
        pen_down();
        pen_up();
    }
}

let last_mouse_x = 0;
let last_mouse_y = 0;
function camera_movement_mouse() {
    if (get_mouse_down()) {
        let dx = last_mouse_x - get_mouse_x();
        let dy = last_mouse_y - get_mouse_y();
        cx += dx / cz;
        cy += dy / cz;
    }

    last_mouse_x = get_mouse_x();
    last_mouse_y = get_mouse_y();
}

function camera_movement_arrow_keys(delta_time) {
    if (key_down(input.KEY_RIGHT_ARROW)) {
        cx += camera_speed * delta_time / cz;
    }
    if (key_down(input.KEY_LEFT_ARROW)) {
        cx += -camera_speed * delta_time / cz;
    }
    if (key_down(input.KEY_UP_ARROW)) {
        cy += camera_speed * delta_time / cz;
    }
    if (key_down(input.KEY_DOWN_ARROW)) {
        cy += -camera_speed * delta_time / cz;
    }
}

function camera_zoom_plus_minus(delta_time) {
    if (key_down("=")) {
        zoom += zoom_speed * delta_time;
    }
    if (key_down("-")) {
        zoom += -zoom_speed * delta_time;
    }
    if (zoom < 0.1) {
        zoom = 0.1;
    }
    cz = zoom*zoom;
}

function camera_zoom_arrow_keys(delta_time) {
    if (key_down(input.KEY_UP_ARROW)) {
        zoom += zoom_speed * delta_time;
    }
    if (key_down(input.KEY_DOWN_ARROW)) {
        zoom += -zoom_speed * delta_time;
    }
    if (zoom < 0.1) {
        zoom = 0.1;
    }
    cz = zoom*zoom;
}

function line(x1,y1,x2,y2, size) {
    graphics.line_clipped(
        transform_x(x1),
        transform_y(y1),
        transform_x(x2),
        transform_y(y2),
        size * cz
    );
}

function round_to(x, n) {
    return round(x*n)/n;
}

function grid_x(gx,s) {
    let x = round_to(untransform_x(window.MIN_X), 1/gx);
    let y1 = window.MAX_Y;
    let y2 = window.MIN_Y;
    repeat(window.WIDTH / gx / cz + 1) {
        let x1 = transform_x(x);
        graphics.line_clipped(x1, y1, x1, y2, s*cz);
        x += gx;
    }
}
function grid_y(gy,s) {
    let y = round_to(untransform_y(window.MIN_Y), 1/gy);
    let x1 = window.MAX_X;
    let x2 = window.MIN_X;
    repeat(window.HEIGHT / gy / cz + 1) {
        let y1 = transform_y(y);
        graphics.line_clipped(x1, y1, x2, y1, s*cz);
        y += gy;
    }
}
function grid(x,y,s) {
    grid_x(x,s);
    grid_y(y,s);
}

function mouse_x() {
    return untransform_x(get_mouse_x());
}

function mouse_y() {
    return untransform_y(get_mouse_y());
}