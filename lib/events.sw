const keys_pressed = [];
const keys_down = [];
const keys_released = [];

let mouse_down = false;
let mouse_pressed = false;
let mouse_released = false;
let click = false;

let mouse_x = 0;
let mouse_y = 0;
let mouse_delta_x = 0;
let mouse_delta_y = 0;

function consume_click() {
    click = false;
}