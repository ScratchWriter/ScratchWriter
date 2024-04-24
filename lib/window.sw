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

let double_buffer = true;

function start(frame) {
    let frame_end = timer();
    let frame_start = timer();
    let delta_time = 0;
    forever {
        if (double_buffer) {
            no_refresh {
                frame_end = timer();
                delta_time = frame_end - frame_start;
                frame_start = frame_end;

                input.update();
                frame(delta_time, events);
            }
        } else {
            no_refresh {
                input.update();
            }
            frame(0, events);
        }
    }
}