import "input" as input;
import "events" as events;

const ASPECT = 1.33333333334;

const HEIGHT = 360;
const WIDTH = 480;
const DIAGONAL = 600;

const MAX_Y = 180;
const MIN_Y = -180;
const MAX_X = 240;
const MIN_X = -240;

function is_visable(x,y, size) {
    return !(
        (x < MIN_X-size) ||
        (x > MAX_X+size) ||
        (y > MAX_Y+size) ||
        (y < MIN_Y-size)
    );
}

global double_buffer = true;
global flag_exit = false;

function exit() {
    flag_exit = true;
}

function start(frame) {
    let last = timer();
    input.reset();
    forever {
        if (double_buffer) {
            no_refresh {
                input.update();
                frame(timer() - last, events);
                last = timer();
            }
        } else {
            no_refresh {
                input.update();
            }
            frame(0, events);
        }
        if (flag_exit) {
            flag_exit = false;
            return;
        }
    }
}