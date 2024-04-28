import "string" as string;

import "events" as events;

const KEY_RIGHT_ARROW = "right arrow";
const KEY_LEFT_ARROW = "left arrow";
const KEY_UP_ARROW = "up arrow";
const KEY_DOWN_ARROW = "down arrow";
const KEY_ANY = "any";
const KEY_SPACE = "space";
const KEY_ENTER = "enter";

const keys = [
    KEY_RIGHT_ARROW,
    KEY_LEFT_ARROW,
    KEY_UP_ARROW,
    KEY_DOWN_ARROW,
    KEY_SPACE,
    KEY_ENTER
];
string.split("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "", keys);
string.split("0123456789", "", keys);
string.split("!@#$%^&*()_+{}[]|\:;'\",.<>/?`~", "", keys);

const keys_last = [];
repeat(keys.length()) {
    keys_last.push("false");
}
let mouse_last = false;
let mouse_last_x = 0;
let mouse_last_y = 0;

function update() {
    events.keys_pressed.reset();
    events.keys_down.reset();
    events.keys_released.reset();

    let i = 0;
    repeat(keys.length()) {
        let key = keys[i];
        if (key_down(key)) {
            if (!keys_last[i]) {
                events.keys_pressed.push(key);
            }
            events.keys_down.push(key);
            keys_last[i] = true;
        } else {
            if (keys_last[i]) {
                events.keys_released.push(key);
            }
            keys_last[i] = false;
        }
        i += 1;
    }

    events.click = false;
    events.mouse_down = false;
    events.mouse_pressed = false;
    events.mouse_released = false;

    if (get_mouse_down()) {
        events.mouse_down = true;
        if (!mouse_last) {
            events.mouse_pressed = true;
            events.click = true;
        }
    } else {
        if (mouse_last) {
            events.mouse_released = true;
        }
    }
    mouse_last = get_mouse_down();
    
    events.mouse_x = get_mouse_x();
    events.mouse_y = get_mouse_y();
    events.mouse_delta_x = events.mouse_x - mouse_last_x;
    events.mouse_delta_y = events.mouse_y - mouse_last_y;
    mouse_last_x = get_mouse_x();
    mouse_last_y = get_mouse_y();
}