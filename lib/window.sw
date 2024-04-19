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